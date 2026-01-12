import { s as stripe } from '../../../chunks/stripe_B3_Fgp7U.mjs';
import { s as supabase } from '../../../chunks/supabase_CjGuiMY7.mjs';
import { Resend } from 'resend';
export { renderers } from '../../../renderers.mjs';

const resendApiKey = "re_QDQ1QPzs_GUJJ2FUQBWH7X4V8RBxi4Hqo";
const resend = new Resend(resendApiKey) ;
function formatPrice(price) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(price);
}
function generateOrderConfirmationHTML(order) {
  const itemsHTML = order.items.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.productName}</strong><br>
        <span style="color: #666; font-size: 14px;">Talla: ${item.size}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de pedido - FashionStore</title>
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
          
          <!-- Confirmation Message -->
          <tr>
            <td style="padding: 40px 30px 20px;">
              <h2 style="margin: 0 0 10px; color: #0a0a0a; font-size: 24px;">¡Gracias por tu pedido, ${order.customerName}!</h2>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                Tu pedido ha sido confirmado y está siendo procesado. Recibirás otra notificación cuando sea enviado.
              </p>
            </td>
          </tr>
          
          <!-- Order Number -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; border-left: 4px solid #CCFF00;">
                <p style="margin: 0; color: #666; font-size: 14px;">Número de pedido</p>
                <p style="margin: 5px 0 0; color: #0a0a0a; font-size: 18px; font-weight: bold;">#${order.orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Resumen del pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-size: 14px; color: #666;">Producto</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px; color: #666;">Cant.</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px; color: #666;">Precio</th>
                </tr>
                ${itemsHTML}
                <tr style="background-color: #0a0a0a;">
                  <td colspan="2" style="padding: 15px; color: #fff; font-weight: bold;">Total</td>
                  <td style="padding: 15px; color: #CCFF00; font-weight: bold; text-align: right; font-size: 18px;">${formatPrice(order.totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="margin: 0 0 15px; color: #0a0a0a; font-size: 18px;">Dirección de envío</h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  ${order.customerName}<br>
                  ${order.shippingAddress}<br>
                  ${order.shippingPostalCode} ${order.shippingCity}<br>
                  ${order.shippingCountry}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${"http://localhost:4321"}/cuenta/pedidos" 
                 style="display: inline-block; background-color: #0a0a0a; color: #CCFF00; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Ver mis pedidos
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                ¿Tienes alguna pregunta? Contáctanos en <a href="mailto:info@bookoro.es" style="color: #0a0a0a;">info@bookoro.es</a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${(/* @__PURE__ */ new Date()).getFullYear()} FashionStore. Todos los derechos reservados.
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
async function sendOrderConfirmation(order) {
  if (!resend) {
    console.warn("Resend not configured - skipping order confirmation email");
    return { success: false, error: "Email service not configured" };
  }
  try {
    const fromEmail = "FashionStore <info@bookoro.es>";
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `✓ Pedido confirmado #${order.orderId.slice(0, 8).toUpperCase()} - FashionStore`,
      html: generateOrderConfirmationHTML(order)
    });
    if (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error: error.message };
    }
    console.log(`Order confirmation email sent successfully. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Exception sending order confirmation email:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

const webhookSecret = "whsec_your_webhook_secret";
const POST = async ({ request }) => {
  const rawBody = await request.arrayBuffer();
  const body = new TextDecoder().decode(rawBody);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.error("No order_id in session metadata");
        break;
      }
      const { error } = await supabase.rpc("update_order_status", {
        p_stripe_session_id: session.id,
        p_status: "paid"
      });
      if (error) {
        console.error("Error updating order status:", error);
      } else {
        console.log(`Order ${orderId} marked as paid`);
        try {
          const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
          if (orderError || !order) {
            console.error("Error fetching order for email:", orderError);
            break;
          }
          const { data: items, error: itemsError } = await supabase.from("order_items").select(`
              quantity,
              price_at_purchase,
              products:product_id (name),
              product_variants:variant_id (size)
            `).eq("order_id", orderId);
          if (itemsError) {
            console.error("Error fetching order items for email:", itemsError);
            break;
          }
          const emailItems = (items || []).map((item) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
            return {
              productName: product?.name || "Producto",
              size: variant?.size || "-",
              quantity: item.quantity,
              price: Number(item.price_at_purchase)
            };
          });
          const emailResult = await sendOrderConfirmation({
            orderId: order.id,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            shippingAddress: order.shipping_address,
            shippingCity: order.shipping_city,
            shippingPostalCode: order.shipping_postal_code,
            shippingCountry: order.shipping_country || "España",
            totalAmount: Number(order.total_amount),
            items: emailItems
          });
          if (emailResult.success) {
            console.log(`Confirmation email sent to ${order.customer_email}`);
          } else {
            console.error("Failed to send confirmation email:", emailResult.error);
          }
        } catch (emailError) {
          console.error("Exception sending confirmation email:", emailError);
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.error("No order_id in session metadata");
        break;
      }
      const { data: orderItems, error: itemsError } = await supabase.rpc("get_order_items", {
        p_order_id: orderId
      });
      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        break;
      }
      for (const item of orderItems || []) {
        const { error: restoreError } = await supabase.rpc("restore_stock", {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity
        });
        if (restoreError) {
          console.error(`Error restoring stock for variant ${item.variant_id}:`, restoreError);
        }
      }
      const { error: updateError } = await supabase.rpc("update_order_status", {
        p_stripe_session_id: session.id,
        p_status: "cancelled"
      });
      if (updateError) {
        console.error("Error updating order status to cancelled:", updateError);
      } else {
        console.log(`Order ${orderId} cancelled and stock restored`);
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
