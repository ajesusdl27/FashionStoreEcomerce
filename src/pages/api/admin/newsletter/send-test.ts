import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { Resend } from 'resend';
import { generateNewsletterHTML } from '@/lib/email-templates/newsletter-templates';

const resendApiKey = import.meta.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Auth validation
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!resend) {
      return new Response(JSON.stringify({ error: 'Servicio de email no configurado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { campaignId, testEmail } = await request.json();

    if (!campaignId || !testEmail) {
      return new Response(JSON.stringify({ error: 'Campaña y email de prueba son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch campaign
    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { data: campaign, error } = await authClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaña no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate email HTML
    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    
    // For test email, use a dummy unsubscribe URL
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=test-preview`;

    const html = generateNewsletterHTML({
      subject: campaign.subject,
      content: campaign.content,
      siteUrl,
      unsubscribeUrl,
    });

    // Send test email
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: `[PRUEBA] ${campaign.subject}`,
      html,
      headers: {
        'X-Test-Email': 'true',
      },
    });

    if (sendError) {
      console.error('Error sending test email:', sendError);
      return new Response(JSON.stringify({ error: 'Error al enviar email de prueba' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email de prueba enviado a ${testEmail}` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Send test email error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
