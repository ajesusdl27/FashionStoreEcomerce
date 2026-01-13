import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { resend } from '@/lib/email';

// Sends a chunk of emails (called multiple times from the client)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { campaignId, offset, limit } = await request.json();

    // Fetch campaign
    const { data: campaign, error: campaignError } = await authClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaña no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch subscribers chunk
    const { data: subscribers, error: subError } = await authClient
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (subError) {
      console.error('Error fetching subscribers:', subError);
      return new Response(JSON.stringify({ error: 'Error al obtener suscriptores' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, done: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send emails one by one with delay
    let sentCount = 0;
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';

    // Generate full HTML email
    const emailHtml = generateNewsletterHTML(campaign.subject, campaign.content, siteUrl);

    for (const sub of subscribers) {
      try {
        if (resend) {
          await resend.emails.send({
            from: fromEmail,
            to: sub.email,
            subject: campaign.subject,
            html: emailHtml,
          });
          sentCount++;
          
          // Wait 1 second between emails to respect rate limit
          if (sentCount < subscribers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (emailError) {
        console.error(`Error sending to ${sub.email}:`, emailError);
        // Continue with other emails
      }
    }

    // Update campaign sent_count
    await authClient
      .from('newsletter_campaigns')
      .update({ 
        sent_count: (campaign.sent_count || 0) + sentCount 
      })
      .eq('id', campaignId);

    const done = subscribers.length < limit;

    return new Response(JSON.stringify({ 
      sent: sentCount, 
      done,
      nextOffset: offset + limit 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Send chunk exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function generateNewsletterHTML(subject: string, content: string, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px; font-weight: bold; letter-spacing: 2px;">FASHIONSTORE</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}" 
                 style="display: inline-block; background-color: #CCFF00; color: #0a0a0a; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Visitar la tienda
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #999; font-size: 12px;">
                Recibiste este email porque te suscribiste a nuestra newsletter.
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
