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
    return {
      siteUrl: import.meta.env.PUBLIC_SITE_URL || 'http://fashionstoreajesusdl.victoriafp.online',
      contactEmail: import.meta.env.CONTACT_EMAIL || 'info@fashionstore.es',
      storeName: 'FashionStore'
    };
  }
}

const resendApiKey = import.meta.env.RESEND_API_KEY;

if (resendApiKey) {
}

if (!resendApiKey) {
} else {
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
  
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    
    // Obtener configuración dinámica de la tienda
    const templateOptions = await getEmailTemplateOptions();
    
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
        couponCode: order.couponCode,
        discountAmount: order.discountAmount,
        shippingCost: order.shippingCost,
      });
    } catch (pdfError) {
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
      emailOptions.attachments = [
        {
          filename: `ticket-${formattedOrderId.replace('#', '')}.pdf`,
          content: ticketBuffer.toString('base64'),
        }
      ];
    } else {
    }
    
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}


// Re-export interface for convenience
export type { OrderShippedData } from './email-templates';

// Envía el email de pedido enviado
export async function sendOrderShipped(data: import('./email-templates').OrderShippedData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Envía el email de confirmación de devolución con instrucciones de envío
export async function sendReturnConfirmation(data: ReturnConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Envía email cuando se cancela un pedido
export async function sendOrderCancelled(data: CancellationEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
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
        }
      } catch (attachmentError) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
  
  if (!resend) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de devolución recibida en almacén
 */
export async function sendReturnReceivedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de reembolso completado
 */
export async function sendReturnCompletedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
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
        }
      } catch (attachmentError) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía email de devolución rechazada
 */
export async function sendReturnRejectedEmail(data: ReturnEmailData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
    return null;
  }
}

/**
 * Envía notificación al admin cuando un cliente paga un pedido
 */
export async function sendAdminOrderNotification(data: AdminOrderNotificationData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function sendAdminOrderCancelledNotification(data: AdminOrderCancelledNotificationData): Promise<{ success: boolean; error?: string }> {

  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía notificación al admin cuando un cliente solicita una devolución
 */
export async function sendAdminReturnNotification(data: AdminReturnNotificationData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Envía alerta de stock bajo al administrador (reporte diario)
 */
export async function sendLowStockAlert(data: LowStockAlertData): Promise<{ success: boolean; error?: string }> {
  
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Re-export admin types for convenience
export type { AdminOrderNotificationData, AdminOrderCancelledNotificationData, AdminReturnNotificationData, LowStockAlertData, LowStockItem };
