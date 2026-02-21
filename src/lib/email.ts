import { Resend } from 'resend';
import { generateOrderConfirmationHTML, generateOrderShippedHTML, generateOrderCancelledHTML, type EmailTemplateOptions } from './email-templates';
import { 
  generateReturnApprovedHTML, 
  generateReturnReceivedHTML, 
  generateReturnCompletedHTML, 
  generateReturnRejectedHTML,
  generateReturnConfirmationHTML,
  type ReturnEmailData,
  type ReturnConfirmationEmailData,
} from './email-templates-returns';
import {
  generateAdminOrderNotificationHTML,
  generateAdminOrderCancelledNotificationHTML,
  generateAdminReturnNotificationHTML,
  generateLowStockAlertHTML,
  type AdminOrderNotificationData,
  type AdminOrderCancelledNotificationData,
  type AdminReturnNotificationData,
  type LowStockAlertData,
  type LowStockItem,
} from './email-templates-admin';
import { generateTicketPDF } from './pdf-generator';
import { formatOrderId } from './order-utils';
import { getContactInfo } from './settings';

// Obtiene las opciones de configuración para las plantillas de email
async function getEmailTemplateOptions(): Promise<EmailTemplateOptions> {
  try {
    const contactInfo = await getContactInfo();
    return {
      siteUrl: import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
      contactEmail: contactInfo.email || import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
      storeName: contactInfo.name || 'FashionStore'
    };
  } catch (error) {
    console.warn('Could not fetch contact info from settings, using defaults');
    return {
      siteUrl: import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
      contactEmail: import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
      storeName: 'FashionStore'
    };
  }
}

const resendApiKey = import.meta.env.RESEND_API_KEY;

console.log('📧 [EMAIL-INIT] Initializing Resend...');
console.log('📧 [EMAIL-INIT] RESEND_API_KEY present:', resendApiKey ? 'YES' : 'NO');
if (resendApiKey) {
  console.log('📧 [EMAIL-INIT] API Key length:', resendApiKey.length);
  console.log('📧 [EMAIL-INIT] API Key starts with:', resendApiKey.substring(0, 8));
}

if (!resendApiKey) {
  console.warn('📧 [EMAIL-INIT] ⚠️ RESEND_API_KEY not configured - emails will not be sent');
} else {
  console.log('📧 [EMAIL-INIT] ✅ Resend client created successfully');
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
  couponCode?: string;
  discountAmount?: number;
  shippingCost?: number;
}

// Tipo simplificado para emails de cancelación
export interface CancellationEmailData {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  reason?: string;
  refundAmount?: number;
  rectifyingDocumentNumber?: string;
  rectifyingDocumentUrl?: string;
}

// Envía el email de confirmación de pedido con ticket PDF adjunto
export async function sendOrderConfirmation(order: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [EMAIL] Starting order confirmation email...');
  console.log('📧 [EMAIL] Order:', order.orderNumber, 'Customer:', order.customerEmail);
  console.log('📧 [EMAIL] Resend client available:', resend ? 'YES' : 'NO');
  
  if (!resend) {
    console.warn('📧 [EMAIL] ⚠️ Resend not configured - skipping order confirmation email');
    console.log('📧 [EMAIL] RESEND_API_KEY:', import.meta.env.RESEND_API_KEY ? 'Set' : 'Missing');
    console.log('📧 [EMAIL] Environment:', import.meta.env.MODE);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    console.log('📧 [EMAIL] From address:', fromEmail);
    console.log('📧 [EMAIL] RESEND_FROM_EMAIL env:', import.meta.env.RESEND_FROM_EMAIL ? 'Set' : 'Using fallback');
    console.log('📧 [EMAIL] To address:', order.customerEmail);
    
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
        couponCode: order.couponCode,
        discountAmount: order.discountAmount,
        shippingCost: order.shippingCost,
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
      subject: `Pedido confirmado ${formattedOrderId} - ${templateOptions.storeName}`,
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
    console.log('📧 [EMAIL] Email data:', JSON.stringify(data, null, 2));
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
      subject: `Tu pedido ${displayId} ha sido enviado - ${templateOptions.storeName}`,
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

// Envía el email de confirmación de devolución con instrucciones de envío
export async function sendReturnConfirmation(data: ReturnConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping return confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Devolución #${data.returnId.slice(0, 8).toUpperCase()} - Instrucciones de envío`,
      html: generateReturnConfirmationHTML(data, templateOptions),
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

// Envía email cuando se cancela un pedido
export async function sendOrderCancelled(data: CancellationEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order cancelled email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    
    const displayOrderId = formatOrderId(data.orderNumber);

    let rectifyingAttachment:
      | {
          filename: string;
          content: string;
        }
      | undefined;

    if (data.rectifyingDocumentUrl) {
      try {
        const response = await fetch(data.rectifyingDocumentUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const fileBuffer = Buffer.from(arrayBuffer);
          const fileNumber = (data.rectifyingDocumentNumber || 'rectificativa').replace(/[^a-zA-Z0-9-_]/g, '_');
          rectifyingAttachment = {
            filename: `factura-rectificativa-${fileNumber}.pdf`,
            content: fileBuffer.toString('base64'),
          };
        } else {
          console.warn('Could not download rectifying document for cancellation attachment:', response.status);
        }
      } catch (attachmentError) {
        console.warn('Failed to attach cancellation rectifying document:', attachmentError);
      }
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Pedido cancelado - ${displayOrderId}`,
      html: generateOrderCancelledHTML(data, templateOptions),
      ...(rectifyingAttachment ? { attachments: [rectifyingAttachment] } : {}),
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

// ==================================================
// EMAIL FUNCTIONS PARA DEVOLUCIONES
// ==================================================

// Re-export types for convenience
export type { ReturnEmailData, ReturnConfirmationEmailData };

/**
 * Envía email de devolución aprobada
 */
export async function sendReturnApprovedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [RETURN-EMAIL] Sending return approved email to:', data.customerEmail);
  
  if (!resend) {
    console.warn('📧 [RETURN-EMAIL] Resend not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);
    
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Devolución aprobada - Pedido ${displayId}`,
      html: generateReturnApprovedHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [RETURN-EMAIL] Error sending return approved email:', error);
      return { success: false, error: error.message };
    }

    console.log('📧 [RETURN-EMAIL] ✅ Return approved email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [RETURN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de devolución recibida en almacén
 */
export async function sendReturnReceivedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [RETURN-EMAIL] Sending return received email to:', data.customerEmail);
  
  if (!resend) {
    console.warn('📧 [RETURN-EMAIL] Resend not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);
    
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Hemos recibido tu devolución - Pedido ${displayId}`,
      html: generateReturnReceivedHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [RETURN-EMAIL] Error sending return received email:', error);
      return { success: false, error: error.message };
    }

    console.log('📧 [RETURN-EMAIL] ✅ Return received email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [RETURN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de reembolso completado
 */
export async function sendReturnCompletedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [RETURN-EMAIL] Sending return completed email to:', data.customerEmail);
  
  if (!resend) {
    console.warn('📧 [RETURN-EMAIL] Resend not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);

    let rectifyingAttachment:
      | {
          filename: string;
          content: string;
        }
      | undefined;

    if (data.rectifyingDocumentUrl) {
      try {
        const response = await fetch(data.rectifyingDocumentUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const fileBuffer = Buffer.from(arrayBuffer);
          const fileNumber = (data.rectifyingDocumentNumber || 'rectificativa').replace(/[^a-zA-Z0-9-_]/g, '_');
          rectifyingAttachment = {
            filename: `factura-rectificativa-${fileNumber}.pdf`,
            content: fileBuffer.toString('base64'),
          };
        } else {
          console.warn('📧 [RETURN-EMAIL] Could not download rectifying document for attachment:', response.status);
        }
      } catch (attachmentError) {
        console.warn('📧 [RETURN-EMAIL] Failed to attach rectifying document:', attachmentError);
      }
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Reembolso procesado - Pedido ${displayId}`,
      html: generateReturnCompletedHTML(data, templateOptions),
      ...(rectifyingAttachment ? { attachments: [rectifyingAttachment] } : {}),
    });

    if (error) {
      console.error('📧 [RETURN-EMAIL] Error sending return completed email:', error);
      return { success: false, error: error.message };
    }

    console.log('📧 [RETURN-EMAIL] ✅ Return completed email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [RETURN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de devolución rechazada
 */
export async function sendReturnRejectedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [RETURN-EMAIL] Sending return rejected email to:', data.customerEmail);
  
  if (!resend) {
    console.warn('📧 [RETURN-EMAIL] Resend not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);
    
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Actualización sobre tu devolución - Pedido ${displayId}`,
      html: generateReturnRejectedHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [RETURN-EMAIL] Error sending return rejected email:', error);
      return { success: false, error: error.message };
    }

    console.log('📧 [RETURN-EMAIL] ✅ Return rejected email sent successfully');
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [RETURN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ==================================================
// NOTIFICACIONES AL ADMINISTRADOR
// ==================================================

/**
 * Obtiene el email del administrador desde settings (store_email)
 */
async function getAdminEmail(): Promise<string | null> {
  try {
    const contactInfo = await getContactInfo();
    return contactInfo.email || null;
  } catch (error) {
    console.warn('📧 [ADMIN-EMAIL] Could not fetch admin email from settings');
    return null;
  }
}

/**
 * Envía notificación al admin cuando un cliente paga un pedido
 */
export async function sendAdminOrderNotification(data: AdminOrderNotificationData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [ADMIN-EMAIL] Sending order notification to admin...');
  
  if (!resend) {
    console.warn('📧 [ADMIN-EMAIL] Resend not configured - skipping admin notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      console.warn('📧 [ADMIN-EMAIL] No admin email configured in settings (store_email)');
      return { success: false, error: 'Admin email not configured' };
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Admin] Nuevo pedido pagado ${displayId} — ${data.totalAmount.toFixed(2)}€`,
      html: generateAdminOrderNotificationHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [ADMIN-EMAIL] Error sending admin order notification:', error);
      return { success: false, error: error.message };
    }

    console.log(`📧 [ADMIN-EMAIL] ✅ Admin order notification sent to ${adminEmail}. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [ADMIN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendAdminOrderCancelledNotification(data: AdminOrderCancelledNotificationData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [ADMIN-EMAIL] Sending order cancellation notification to admin...');

  if (!resend) {
    console.warn('📧 [ADMIN-EMAIL] Resend not configured - skipping admin cancellation notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      console.warn('📧 [ADMIN-EMAIL] No admin email configured in settings (store_email)');
      return { success: false, error: 'Admin email not configured' };
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = formatOrderId(data.orderNumber);

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Admin] Pedido cancelado ${displayId} — ${data.refundAmount.toFixed(2)}€`,
      html: generateAdminOrderCancelledNotificationHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [ADMIN-EMAIL] Error sending admin cancellation notification:', error);
      return { success: false, error: error.message };
    }

    console.log(`📧 [ADMIN-EMAIL] ✅ Admin cancellation notification sent to ${adminEmail}. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [ADMIN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía notificación al admin cuando un cliente solicita una devolución
 */
export async function sendAdminReturnNotification(data: AdminReturnNotificationData): Promise<{ success: boolean; error?: string }> {
  console.log('📧 [ADMIN-EMAIL] Sending return notification to admin...');
  
  if (!resend) {
    console.warn('📧 [ADMIN-EMAIL] Resend not configured - skipping admin notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      console.warn('📧 [ADMIN-EMAIL] No admin email configured in settings (store_email)');
      return { success: false, error: 'Admin email not configured' };
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    const displayId = data.orderNumber
      ? formatOrderId(data.orderNumber)
      : `#${data.orderId.slice(0, 8).toUpperCase()}`;

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Admin] Nueva solicitud de devolución — Pedido ${displayId}`,
      html: generateAdminReturnNotificationHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [ADMIN-EMAIL] Error sending admin return notification:', error);
      return { success: false, error: error.message };
    }

    console.log(`📧 [ADMIN-EMAIL] ✅ Admin return notification sent to ${adminEmail}. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [ADMIN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía alerta de stock bajo al administrador (reporte diario)
 */
export async function sendLowStockAlert(data: LowStockAlertData): Promise<{ success: boolean; error?: string }> {
  console.log(`📧 [ADMIN-EMAIL] Sending low stock alert (${data.items.length} items)...`);
  
  if (!resend) {
    console.warn('📧 [ADMIN-EMAIL] Resend not configured - skipping low stock alert');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      console.warn('📧 [ADMIN-EMAIL] No admin email configured in settings (store_email)');
      return { success: false, error: 'Admin email not configured' };
    }

    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const templateOptions = await getEmailTemplateOptions();
    
    const outOfStock = data.items.filter(i => i.stock === 0).length;
    const subjectParts: string[] = [];
    if (outOfStock > 0) subjectParts.push(`${outOfStock} sin stock`);
    const lowCount = data.items.length - outOfStock;
    if (lowCount > 0) subjectParts.push(`${lowCount} stock bajo`);

    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Admin] Alerta de Inventario — ${subjectParts.join(', ')} (${data.items.length} variantes)`,
      html: generateLowStockAlertHTML(data, templateOptions),
    });

    if (error) {
      console.error('📧 [ADMIN-EMAIL] Error sending low stock alert:', error);
      return { success: false, error: error.message };
    }

    console.log(`📧 [ADMIN-EMAIL] ✅ Low stock alert sent to ${adminEmail}. ID: ${responseData?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('📧 [ADMIN-EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Re-export admin types for convenience
export type { AdminOrderNotificationData, AdminOrderCancelledNotificationData, AdminReturnNotificationData, LowStockAlertData, LowStockItem };
