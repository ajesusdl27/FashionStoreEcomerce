import { Resend } from 'resend';
import { generateOrderConfirmationHTML, generateOrderShippedHTML, type EmailTemplateOptions } from './email-templates';
import { generateTicketPDF } from './pdf-generator';
import { formatOrderId } from './order-utils';
import { getContactInfo } from './settings';

// Obtiene las opciones de configuración para las plantillas de email
async function getEmailTemplateOptions(): Promise<EmailTemplateOptions> {
  try {
    const contactInfo = await getContactInfo();
    return {
      siteUrl: import.meta.env.SITE_URL || 'http://localhost:4321',
      contactEmail: contactInfo.email || import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
      storeName: contactInfo.name || 'FashionStore'
    };
  } catch (error) {
    console.warn('Could not fetch contact info from settings, using defaults');
    return {
      siteUrl: import.meta.env.SITE_URL || 'http://localhost:4321',
      contactEmail: import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
      storeName: 'FashionStore'
    };
  }
}

const resendApiKey = import.meta.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY not configured - emails will not be sent');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Tipo para los datos del pedido a enviar por email
export interface OrderEmailData {
  orderId: string;
  orderNumber: number;  // Número secuencial del pedido
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  totalAmount: number;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  orderDate?: Date; // Añadido para el ticket
  reason?: string; // Añadido para cancelaciones
}

// Tipo simplificado para emails de cancelación
export interface CancellationEmailData {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  reason?: string;
  refundAmount?: number;
}

// Envía el email de confirmación de pedido con ticket PDF adjunto
export async function sendOrderConfirmation(order: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [EMAIL] Starting order confirmation email...');
  console.log('📧 [EMAIL] Order:', order.orderNumber, 'Customer:', order.customerEmail);
  
  if (!resend) {
    console.warn('📧 [EMAIL] ⚠️ Resend not configured - skipping order confirmation email');
    console.log('📧 [EMAIL] RESEND_API_KEY:', import.meta.env.RESEND_API_KEY ? 'Set' : 'Missing');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    console.log('📧 [EMAIL] From address:', fromEmail);
    console.log('📧 [EMAIL] RESEND_FROM_EMAIL env:', import.meta.env.RESEND_FROM_EMAIL ? 'Set' : 'Using fallback');
    
    // Obtener configuración dinámica de la tienda
    const templateOptions = await getEmailTemplateOptions();
    console.log('📧 [EMAIL] Template options:', templateOptions);
    
    // Formatear número de pedido
    const formattedOrderId = formatOrderId(order.orderNumber);
    console.log('📧 [EMAIL] Formatted order ID:', formattedOrderId);
    
    // Generar ticket PDF
    let ticketBuffer: Buffer | null = null;
    try {
      console.log('📧 [EMAIL] Generating PDF ticket...');
      ticketBuffer = await generateTicketPDF({
        orderId: formattedOrderId,  // Usar formato #A000001
        orderDate: order.orderDate || new Date(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingPostalCode: order.shippingPostalCode,
        shippingCountry: order.shippingCountry,
        items: order.items,
        totalAmount: order.totalAmount,
      });
      console.log('📧 [EMAIL] ✅ Ticket PDF generated successfully');
    } catch (pdfError) {
      console.error('📧 [EMAIL] ❌ Error generating ticket PDF:', pdfError);
      // Continuamos sin adjunto si falla la generación
    }
    
    // Construir opciones de email
    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: fromEmail,
      to: order.customerEmail,
      subject: `✓ Pedido confirmado ${formattedOrderId} - ${templateOptions.storeName}`,
      html: generateOrderConfirmationHTML(order, formattedOrderId, templateOptions),
    };
    
    // Añadir adjunto solo si se generó correctamente
    if (ticketBuffer) {
      console.log('📧 [EMAIL] Adding PDF attachment to email');
      emailOptions.attachments = [
        {
          filename: `ticket-${formattedOrderId.replace('#', '')}.pdf`,
          content: ticketBuffer.toString('base64'),
        }
      ];
    } else {
      console.log('📧 [EMAIL] No PDF attachment (generation failed)');
    }
    
    console.log('📧 [EMAIL] Sending email via Resend...');
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('📧 [EMAIL] ❌ Error sending order confirmation email:', {
        message: error.message,
        name: error.name,
        to: order.customerEmail,
        from: fromEmail
      });
      return { success: false, error: error.message };
    }

    console.log(`📧 [EMAIL] ✅ Order confirmation email sent successfully. Resend ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [EMAIL] ❌ Exception sending order confirmation email:', {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail
    });
    return { success: false, error: errorMessage };
  }
}


// Re-export interface for convenience
export type { OrderShippedData } from './email-templates';

// Envía el email de pedido enviado
export async function sendOrderShipped(data: import('./email-templates').OrderShippedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order shipped email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    
    // Obtener configuración dinámica de la tienda
    const templateOptions = await getEmailTemplateOptions();
    
    // Formatear ID para display (con fallback para compatibilidad)
    const displayId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `🚚 ¡Tu pedido ${displayId} ha sido enviado! - ${templateOptions.storeName}`,
      html: generateOrderShippedHTML(data, templateOptions),
    });

    if (error) {
      console.error('Error sending order shipped email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Order shipped email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending order shipped email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Tipo para datos de devolución
export interface ReturnEmailData {
  returnId: string;
  orderId: string;
  orderNumber?: number;  // Número secuencial (opcional)
  customerName: string;
  customerEmail: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    reason: string;
  }[];
}

// Envía el email de confirmación de devolución con instrucciones de envío
export async function sendReturnConfirmation(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const { siteUrl, contactEmail, storeName } = templateOptions;
    
    // Formatear ID para display (con fallback)
    const displayOrderId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const reasonLabels: { [key: string]: string } = {
      size_mismatch: 'Talla incorrecta',
      defective: 'Producto defectuoso',
      not_as_described: 'No coincide con la descripción',
      changed_mind: 'Cambio de opinión',
      arrived_late: 'Llegó tarde',
      other: 'Otro motivo',
    };
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
          <strong>${item.productName}</strong><br>
          <span style="color: #666; font-size: 14px;">Talla: ${item.size}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${reasonLabels[item.reason] || item.reason}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Devolución - FashionStore</title>
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
          
          <!-- Icon & Message -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #CCFF00 0%, #a3cc00 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 40px;">📦</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">Solicitud de Devolución Recibida</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Hola ${data.customerName}, hemos recibido tu solicitud de devolución.
              </p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; border-left: 4px solid #CCFF00;">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de pedido</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">${displayOrderId}</p>
              </div>
            </td>
          </tr>
          
          <!-- Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Artículos a devolver</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Motivo</th>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">📮 Dirección para el envío</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  <strong>FashionStore Devoluciones</strong><br>
                  Calle de la Moda 123<br>
                  28001 Madrid<br>
                  España
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fffbeb; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 10px; color: #b45309; font-size: 16px;">⚠️ Instrucciones importantes</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                  <li>Incluye el número de pedido visible en el paquete</li>
                  <li>Los artículos deben estar sin usar y con etiquetas originales</li>
                  <li>El reembolso se procesará en 5-7 días hábiles tras recibir el paquete</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}/cuenta/pedidos" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Ver mis pedidos
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                ¿Tienes alguna pregunta? Contáctanos en <a href="mailto:${contactEmail}" style="color: #0a0a0a;">${contactEmail}</a>
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

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `📦 Devolución #${data.returnId.slice(0, 8).toUpperCase()} - Instrucciones de envío`,
      html,
    });

    if (error) {
      console.error('Error sending return confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Return confirmation email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending return confirmation email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Datos para email de devolución aprobada
export interface ReturnApprovedData {
  returnId: string;
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerEmail: string;
  refundAmount?: number;
  estimatedRefundDays?: number;
  returnLabelUrl?: string;
  items?: { productName: string; size: string; quantity: number; reason: string; }[];
}

// Envía email cuando se aprueba una devolución
export async function sendReturnApproved(data: ReturnApprovedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return approved email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const { siteUrl } = templateOptions;
    
    const displayOrderId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px;">FASHIONSTORE</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a;">¡Devolución Aprobada!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">
                Hola ${data.customerName}, tu solicitud de devolución para el pedido ${displayOrderId} ha sido aprobada.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  El reembolso de <strong>${data.refundAmount ? `${data.refundAmount.toFixed(2)}€` : 'tu compra'}</strong> 
                  se procesará en los próximos ${data.estimatedRefundDays || 5}-${(data.estimatedRefundDays || 5) + 2} días hábiles.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}/cuenta/pedidos" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold;">
                Ver mis pedidos
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
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
</html>`.trim();

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `✓ Devolución aprobada - Pedido ${displayOrderId}`,
      html,
    });

    if (error) {
      console.error('Error sending return approved email:', error);
      return { success: false, error: error.message };
    }

    console.log('Return approved email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending return approved email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Datos para devolución rechazada
export interface ReturnRejectedData {
  returnId: string;
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerEmail: string;
  rejectionReason: string;
  items?: { productName: string; size: string; quantity: number; reason: string; }[];
}

// Envía email cuando se rechaza una devolución
export async function sendReturnRejected(data: ReturnRejectedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return rejected email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const { siteUrl, contactEmail } = templateOptions;
    
    const displayOrderId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px;">FASHIONSTORE</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 10px; color: #0a0a0a;">Devolución No Aprobada</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">
                Hola ${data.customerName}, lamentamos informarte que tu solicitud de devolución para el pedido ${displayOrderId} no ha podido ser aprobada.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                <p style="margin: 0 0 5px; color: #991b1b; font-size: 14px; font-weight: bold;">Motivo:</p>
                <p style="margin: 0; color: #991b1b; font-size: 14px;">${data.rejectionReason}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Si crees que ha habido un error o tienes alguna pregunta, no dudes en contactarnos en 
                <a href="mailto:${contactEmail}" style="color: #0a0a0a;">${contactEmail}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}/cuenta/pedidos" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold;">
                Ver mis pedidos
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center;">
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
</html>`.trim();

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Devolución no aprobada - Pedido ${displayOrderId}`,
      html,
    });

    if (error) {
      console.error('Error sending return rejected email:', error);
      return { success: false, error: error.message };
    }

    console.log('Return rejected email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending return rejected email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Datos para reembolso procesado
export interface RefundProcessedData {
  returnId?: string;
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderNumber?: number;
  amount: number;
  refundAmount?: number;
  refundMethod?: string;
}

// Envía email cuando se procesa el reembolso
export async function sendRefundProcessed(data: RefundProcessedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping refund processed email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const { siteUrl } = templateOptions;
    
    const displayOrderId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px;">FASHIONSTORE</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; line-height: 80px;">
                <span style="font-size: 40px;">💰</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #0a0a0a;">¡Reembolso Procesado!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">
                Hola ${data.customerName}, el reembolso de tu pedido ${displayOrderId} ha sido procesado correctamente.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #22c55e;">
                <p style="margin: 0 0 5px; color: #166534; font-size: 14px;">Importe reembolsado</p>
                <p style="margin: 0; color: #166534; font-size: 32px; font-weight: bold;">${data.amount.toFixed(2)}€</p>
                ${data.refundMethod ? `<p style="margin: 10px 0 0; color: #666; font-size: 12px;">Método: ${data.refundMethod}</p>` : ''}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                El importe aparecerá en tu cuenta en un plazo de 3-5 días hábiles, dependiendo de tu entidad bancaria.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}/cuenta/pedidos" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold;">
                Ver mis pedidos
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center;">
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
</html>`.trim();

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `💰 Reembolso procesado - ${data.amount.toFixed(2)}€ - Pedido ${displayOrderId}`,
      html,
    });

    if (error) {
      console.error('Error sending refund processed email:', error);
      return { success: false, error: error.message };
    }

    console.log('Refund processed email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending refund processed email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Envía email cuando se cancela un pedido
export async function sendOrderCancelled(data: CancellationEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order cancelled email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const { siteUrl, contactEmail } = templateOptions;
    
    const displayOrderId = formatOrderId(data.orderNumber);
    const refundText = data.refundAmount 
      ? `Si se realizó algún cargo, el reembolso de <strong>${data.refundAmount.toFixed(2)}€</strong> se procesará automáticamente en 3-5 días hábiles.`
      : 'Si se realizó algún cargo, el reembolso se procesará automáticamente en 3-5 días hábiles.';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #CCFF00; font-size: 28px;">FASHIONSTORE</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 10px; color: #0a0a0a;">Pedido Cancelado</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">
                Hola ${data.customerName}, tu pedido ${displayOrderId} ha sido cancelado${data.reason ? ': ' + data.reason : ''}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  ${refundText}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                Si tienes alguna pregunta, contáctanos en 
                <a href="mailto:${contactEmail}" style="color: #0a0a0a;">${contactEmail}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold;">
                Seguir comprando
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center;">
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
</html>`.trim();

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Pedido cancelado - ${displayOrderId}`,
      html,
    });

    if (error) {
      console.error('Error sending order cancelled email:', error);
      return { success: false, error: error.message };
    }

    console.log('Order cancelled email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending order cancelled email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
