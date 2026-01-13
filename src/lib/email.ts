import { Resend } from 'resend';
import { generateOrderConfirmationHTML, generateOrderShippedHTML } from './email-templates';

const resendApiKey = import.meta.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY not configured - emails will not be sent');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Tipo para los datos del pedido a enviar por email
export interface OrderEmailData {
  orderId: string;
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
}

// Envía el email de confirmación de pedido
export async function sendOrderConfirmation(order: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping order confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `✓ Pedido confirmado #${order.orderId.slice(0, 8).toUpperCase()} - FashionStore`,
      html: generateOrderConfirmationHTML(order),
    });

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
    
    const { data: responseData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `🚚 ¡Tu pedido #${data.orderId.slice(0, 8).toUpperCase()} ha sido enviado! - FashionStore`,
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
