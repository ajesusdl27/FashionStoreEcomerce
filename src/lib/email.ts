import { Resend } from 'resend';
import { generateOrderConfirmationHTML } from './email-templates';

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
