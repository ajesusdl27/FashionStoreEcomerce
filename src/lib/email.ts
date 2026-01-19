import { Resend } from 'resend';
import { 
  generateOrderConfirmationHTML, 
  generateOrderShippedHTML,
  generateOrderDeliveredHTML,
  generateOrderCancelledHTML,
  generateReturnApprovedHTML,
  generateReturnRejectedHTML,
  generateRefundProcessedHTML,
  type OrderDeliveredData,
  type OrderCancelledData,
  type ReturnApprovedData,
  type ReturnRejectedData,
  type RefundProcessedData
} from './email-templates';
import { generateTicketPDF } from './pdf-generator';
import { formatOrderId } from './order-utils';

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
}

// Envía el email de confirmación de pedido con ticket PDF adjunto
export async function sendOrderConfirmation(order: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    
    // Formatear número de pedido
    const formattedOrderId = formatOrderId(order.orderNumber);
    
    // Generar ticket PDF
    let ticketBuffer: Buffer | null = null;
    try {
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
      console.log('Ticket PDF generated successfully');
    } catch (pdfError) {
      console.error('Error generating ticket PDF:', pdfError);
      // Continuamos sin adjunto si falla la generación
    }
    
    // Construir opciones de email
    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: fromEmail,
      to: order.customerEmail,
      subject: `✓ Pedido confirmado ${formattedOrderId} - FashionStore`,
      html: generateOrderConfirmationHTML(order, formattedOrderId),
    };
    
    // Añadir adjunto solo si se generó correctamente
    if (ticketBuffer) {
      emailOptions.attachments = [
        {
          filename: `ticket-${formattedOrderId.replace('#', '')}.pdf`,
          content: ticketBuffer.toString('base64'),
        }
      ];
    }
    
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Order confirmation email sent successfully. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending order confirmation email:', errorMessage);
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
    
    // Formatear ID para display (con fallback para compatibilidad)
    const displayId = data.orderNumber 
      ? formatOrderId(data.orderNumber) 
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `🚚 ¡Tu pedido ${displayId} ha sido enviado! - FashionStore`,
      html: generateOrderShippedHTML(data),
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
    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';
    const contactEmail = import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es';
    
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

// ============================================
// NEW EMAIL FUNCTIONS
// ============================================

// Re-export types for convenience
export type { OrderDeliveredData, OrderCancelledData, ReturnApprovedData, ReturnRejectedData, RefundProcessedData };

// Envía el email de pedido entregado
export async function sendOrderDelivered(data: OrderDeliveredData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order delivered email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const displayId = data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `✅ ¡Pedido ${displayId} entregado! - FashionStore`,
      html: generateOrderDeliveredHTML(data),
    });

    if (error) {
      console.error('Error sending order delivered email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Order delivered email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending order delivered email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Envía el email de pedido cancelado
export async function sendOrderCancelled(data: OrderCancelledData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order cancelled email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const displayId = data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `❌ Pedido ${displayId} cancelado - FashionStore`,
      html: generateOrderCancelledHTML(data),
    });

    if (error) {
      console.error('Error sending order cancelled email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Order cancelled email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending order cancelled email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Envía el email de devolución aprobada
export async function sendReturnApproved(data: ReturnApprovedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return approved email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const displayId = data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `✅ Devolución aprobada - Pedido ${displayId} - FashionStore`,
      html: generateReturnApprovedHTML(data),
    });

    if (error) {
      console.error('Error sending return approved email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Return approved email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending return approved email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Envía el email de devolución rechazada
export async function sendReturnRejected(data: ReturnRejectedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return rejected email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const displayId = data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `⚠️ Actualización sobre tu devolución - Pedido ${displayId} - FashionStore`,
      html: generateReturnRejectedHTML(data),
    });

    if (error) {
      console.error('Error sending return rejected email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Return rejected email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending return rejected email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Envía el email de reembolso procesado
export async function sendRefundProcessed(data: RefundProcessedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping refund processed email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const displayId = data.orderNumber ? formatOrderId(data.orderNumber) : `#${data.orderId.slice(0, 8).toUpperCase()}`;
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `💰 Reembolso procesado - Pedido ${displayId} - FashionStore`,
      html: generateRefundProcessedHTML(data),
    });

    if (error) {
      console.error('Error sending refund processed email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Refund processed email sent successfully. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Exception sending refund processed email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
