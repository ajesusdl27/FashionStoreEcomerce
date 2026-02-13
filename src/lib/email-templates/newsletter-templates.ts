// ============================================
// NEWSLETTER EMAIL TEMPLATES
// FashionStore - Centralized email templates
// ============================================

interface NewsletterTemplateOptions {
  subject: string;
  content: string;
  siteUrl: string;
  unsubscribeUrl: string;
}

interface WelcomeTemplateOptions {
  siteUrl: string;
  unsubscribeUrl: string;
  isReactivation: boolean;
}

/**
 * Base email wrapper with FashionStore branding
 */
function getEmailWrapper(content: string, siteUrl: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FashionStore</title>
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
          ${content}
          
          <!-- Footer with GDPR-compliant Unsubscribe Link -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #999; font-size: 12px;">
                Recibiste este email porque te suscribiste a nuestra newsletter.
              </p>
              <p style="margin: 0 0 15px; color: #999; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">
                  Darse de baja
                </a>
                &nbsp;|&nbsp;
                <a href="${siteUrl}/politica-privacidad" style="color: #666; text-decoration: underline;">
                  Política de privacidad
                </a>
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

/**
 * Newsletter campaign email template
 */
export function generateNewsletterHTML(options: NewsletterTemplateOptions): string {
  const { subject: _subject, content, siteUrl, unsubscribeUrl } = options;
  
  const bodyContent = `
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
  `;
  
  return getEmailWrapper(bodyContent, siteUrl, unsubscribeUrl);
}

/**
 * Welcome email template (new subscription or reactivation)
 */
export function generateWelcomeHTML(options: WelcomeTemplateOptions): string {
  const { siteUrl, unsubscribeUrl, isReactivation } = options;
  
  const title = isReactivation ? '¡Bienvenido de nuevo!' : '¡Gracias por suscribirte!';
  const message = isReactivation 
    ? 'Nos alegra verte otra vez. Volvemos a tenerte en nuestra comunidad exclusiva de moda urbana.'
    : 'Ahora formas parte de nuestra comunidad exclusiva. Recibirás las últimas novedades, ofertas especiales y lanzamientos antes que nadie.';
  
  const bodyContent = `
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px 30px; text-align: center;">
        <h2 style="color: #0a0a0a; font-size: 24px; margin: 0 0 20px;">
          ${title}
        </h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
          ${message}
        </p>
      </td>
    </tr>
    
    <!-- Coupon Code Section -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #CCFF00 0%, #a8d900 100%); border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 25px; text-align: center;">
              <p style="color: #0a0a0a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">
                Tu código de descuento exclusivo
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #0a0a0a; padding: 15px 30px; border-radius: 8px;">
                    <span style="color: #CCFF00; font-size: 28px; font-weight: bold; letter-spacing: 3px; font-family: monospace;">
                      BIENVENIDA10
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #0a0a0a; font-size: 16px; font-weight: 600; margin: 15px 0 5px;">
                10% de descuento en tu primera compra
              </p>
              <p style="color: #333; font-size: 13px; margin: 0;">
                Máximo 20€ de descuento · Compra mínima 30€ · Un solo uso
              </p>
              <a href="${siteUrl}/promociones/newsletter-bienvenida" 
                 style="color: #0a0a0a; font-size: 12px; text-decoration: underline; display: inline-block; margin-top: 10px;">
                Ver condiciones completas
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Features -->
    <tr>
      <td style="padding: 0 40px 30px;">
        <p style="color: #333; font-size: 14px; font-weight: 600; margin: 0 0 15px; text-align: center;">
          Como suscriptor también disfrutarás de:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 15px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="40" style="font-size: 24px;">&#9679;</td>
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
                  <td width="40" style="font-size: 24px;">&#9679;</td>
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
                  <td width="40" style="font-size: 24px;">&#9679;</td>
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
          Usar mi descuento ahora
        </a>
      </td>
    </tr>
  `;
  
  return getEmailWrapper(bodyContent, siteUrl, unsubscribeUrl);
}

/**
 * Get welcome email subject
 */
export function getWelcomeSubject(isReactivation: boolean): string {
  return isReactivation 
    ? 'Bienvenido de nuevo a FashionStore' 
    : 'Bienvenido a la newsletter de FashionStore';
}
