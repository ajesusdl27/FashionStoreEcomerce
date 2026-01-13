import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
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
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true })
          .eq('id', existing.id);

        // Send welcome back email
        await sendWelcomeEmail(normalizedEmail, true);

        return new Response(JSON.stringify({ success: true, reactivated: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: normalizedEmail });

    if (error) {
      console.error('Newsletter subscription error:', error);
      return new Response(JSON.stringify({ error: 'Error al suscribirse' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, false);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Newsletter subscription exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function sendWelcomeEmail(email: string, isReactivation: boolean) {
  try {
    if (!resend) {
      console.log('Resend not configured, skipping welcome email');
      return;
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';

    const subject = isReactivation 
      ? '¡Bienvenido de nuevo a FashionStore! 👋' 
      : '¡Bienvenido a la newsletter de FashionStore! 🎉';

    const html = `
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
            <td style="padding: 40px 30px 30px; text-align: center;">
              <h2 style="color: #0a0a0a; font-size: 24px; margin: 0 0 20px;">
                ${isReactivation ? '¡Bienvenido de nuevo!' : '¡Gracias por suscribirte!'}
              </h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                ${isReactivation 
                  ? 'Nos alegra verte otra vez. Volvemos a tenerte en nuestra comunidad exclusiva de moda urbana.'
                  : 'Ahora formas parte de nuestra comunidad exclusiva. Recibirás las últimas novedades, ofertas especiales y lanzamientos antes que nadie.'
                }
              </p>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">🔥</td>
                        <td style="color: #333; font-size: 14px;"><strong>Ofertas exclusivas</strong> solo para suscriptores</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">👟</td>
                        <td style="color: #333; font-size: 14px;"><strong>Primero en enterarte</strong> de nuevos lanzamientos</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="font-size: 24px;">✨</td>
                        <td style="color: #333; font-size: 14px;"><strong>Contenido único</strong> sobre streetwear y tendencias</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}/productos" 
                 style="display: inline-block; background-color: #CCFF00; color: #0a0a0a; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Explorar productos
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #999; font-size: 12px;">
                Recibirás este tipo de emails porque te suscribiste a nuestra newsletter.
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

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - subscription should still succeed even if email fails
  }
}
