import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/lib/supabase';
import { resend } from '@/lib/email';
import { isValidEmail, NEWSLETTER_CONFIG } from '@/lib/constants/newsletter';
import { generateWelcomeHTML, getWelcomeSubject } from '@/lib/email-templates/newsletter-templates';

// Create service role client for newsletter operations (bypasses RLS for public operations)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
}

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
  try {
    const { email, _hp } = await request.json();

    // Honeypot check - if filled, silently accept (bots fill hidden fields)
    if (_hp) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate email format with robust regex
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is authenticated and validate email matches
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    if (accessToken && refreshToken) {
      const authenticatedClient = createAuthenticatedClient(accessToken, refreshToken);
      const { data: { user } } = await authenticatedClient.auth.getUser();
      
      if (user && user.email) {
        const userEmail = user.email.toLowerCase().trim();
        if (userEmail !== normalizedEmail) {
          return new Response(JSON.stringify({ 
            error: `Estás autenticado como ${userEmail}. Por favor, usa el mismo email o cierra sesión para suscribirte con otro email.` 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Rate limiting check
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip);
    
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Demasiados intentos. Por favor, espera unos minutos.' 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if already subscribed
    const { data: existing } = await serviceClient
      .from('newsletter_subscribers')
      .select('id, is_active, unsubscribe_token')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(JSON.stringify({ error: 'Este email ya está suscrito' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Reactivate subscription
        await serviceClient
          .from('newsletter_subscribers')
          .update({ is_active: true })
          .eq('id', existing.id);

        // Send welcome back email with unsubscribe link
        await sendWelcomeEmail(normalizedEmail, true, existing.unsubscribe_token);

        return new Response(JSON.stringify({ 
          success: true, 
          reactivated: true,
          coupon: {
            code: 'BIENVENIDA10',
            discount: '10%',
            description: '10% de descuento en tu primera compra (máx. 20€, mín. 30€)',
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert new subscriber and get the token
    const { data: newSubscriber, error } = await serviceClient
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail })
      .select('unsubscribe_token')
      .single();

    if (error) {
      console.error('Newsletter subscription error:', error);
      return new Response(JSON.stringify({ error: 'Error al suscribirse' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send welcome email with unsubscribe link
    await sendWelcomeEmail(normalizedEmail, false, newSubscriber?.unsubscribe_token);

    return new Response(JSON.stringify({ 
      success: true,
      coupon: {
        code: 'BIENVENIDA10',
        discount: '10%',
        description: '10% de descuento en tu primera compra (máx. 20€, mín. 30€)',
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Newsletter subscription exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Rate limiting function
async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const { MAX_ATTEMPTS, WINDOW_MINUTES } = {
    MAX_ATTEMPTS: NEWSLETTER_CONFIG.RATE_LIMIT_MAX_ATTEMPTS,
    WINDOW_MINUTES: NEWSLETTER_CONFIG.RATE_LIMIT_WINDOW_MINUTES,
  };

  try {
    // Check existing rate limit record
    const { data: existing } = await serviceClient
      .from('newsletter_rate_limits')
      .select('*')
      .eq('ip_address', ip)
      .single();

    const now = new Date();

    if (existing) {
      const firstAttempt = new Date(existing.first_attempt_at);
      const windowMs = WINDOW_MINUTES * 60 * 1000;
      
      // If outside window, reset counter
      if (now.getTime() - firstAttempt.getTime() > windowMs) {
        await serviceClient
          .from('newsletter_rate_limits')
          .update({
            attempts: 1,
            first_attempt_at: now.toISOString(),
            last_attempt_at: now.toISOString(),
          })
          .eq('ip_address', ip);
        return { allowed: true };
      }

      // Within window - check attempts
      if (existing.attempts >= MAX_ATTEMPTS) {
        return { allowed: false };
      }

      // Increment counter
      await serviceClient
        .from('newsletter_rate_limits')
        .update({
          attempts: existing.attempts + 1,
          last_attempt_at: now.toISOString(),
        })
        .eq('ip_address', ip);
      return { allowed: true };
    }

    // New IP - create record
    await serviceClient.from('newsletter_rate_limits').insert({
      ip_address: ip,
      attempts: 1,
      first_attempt_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
    });

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request (fail open)
    return { allowed: true };
  }
}

async function sendWelcomeEmail(email: string, isReactivation: boolean, unsubscribeToken?: string) {
  try {
    if (!resend) {
      console.log('Resend not configured, skipping welcome email');
      return;
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online';
    
    // Generate unsubscribe URL (GDPR CRITICAL)
    const unsubscribeUrl = unsubscribeToken 
      ? `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`
      : `${siteUrl}/newsletter/unsubscribe`;

    const subject = getWelcomeSubject(isReactivation);
    const html = generateWelcomeHTML({
      siteUrl,
      unsubscribeUrl,
      isReactivation,
    });

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - subscription should still succeed even if email fails
  }
}
