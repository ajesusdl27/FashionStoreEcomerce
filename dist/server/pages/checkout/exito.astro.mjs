import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../../chunks/astro/server_Cxbq3ybN.mjs';
import 'piccolore';
import { $ as $$PublicLayout } from '../../chunks/PublicLayout_Dv6-er14.mjs';
import { $ as $$Button } from '../../chunks/Button_CFNw3Rqw.mjs';
import { s as supabase } from '../../chunks/supabase_CjGuiMY7.mjs';
import { s as stripe } from '../../chunks/stripe_B3_Fgp7U.mjs';
import { s as sendOrderConfirmation } from '../../chunks/email_UxTMJncQ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Exito = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Exito;
  const sessionId = Astro2.url.searchParams.get("session_id");
  let order = null;
  let orderItems = [];
  let emailSent = false;
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.order_id) {
        const { data: existingOrder } = await supabase.from("orders").select("status").eq("id", session.metadata.order_id).single();
        const wasAlreadyPaid = existingOrder?.status === "paid";
        await supabase.rpc("update_order_status", {
          p_stripe_session_id: sessionId,
          p_status: "paid"
        });
        const { data: orderData } = await supabase.from("orders").select("*").eq("id", session.metadata.order_id).single();
        order = orderData;
        if (order) {
          const { data: items } = await supabase.from("order_items").select(
            `
            *,
            products (name),
            product_variants (size)
          `
          ).eq("order_id", order.id);
          orderItems = items || [];
          if (!wasAlreadyPaid && order.customer_email) {
            try {
              const emailItems = orderItems.map((item) => ({
                productName: item.products?.name || "Producto",
                size: item.product_variants?.size || "-",
                quantity: item.quantity,
                price: Number(item.price_at_purchase)
              }));
              const result = await sendOrderConfirmation({
                orderId: order.id,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                shippingAddress: order.shipping_address,
                shippingCity: order.shipping_city,
                shippingPostalCode: order.shipping_postal_code,
                shippingCountry: order.shipping_country || "Espa\xF1a",
                totalAmount: Number(order.total_amount),
                items: emailItems
              });
              emailSent = result.success;
              if (!result.success) {
                console.error("Failed to send confirmation email:", result.error);
              } else {
                console.log("Confirmation email sent from success page");
              }
            } catch (emailError) {
              console.error("Error sending confirmation email:", emailError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }
  function formatPrice(price) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  }
  function formatDate(date) {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
      timeStyle: "short"
    }).format(new Date(date));
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": "\xA1Pedido Confirmado! - FashionStore", "data-astro-cid-h4m2wh3u": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-12" data-astro-cid-h4m2wh3u> <!-- Confetti Canvas --> <canvas id="confetti-canvas" class="fixed inset-0 pointer-events-none z-50" data-astro-cid-h4m2wh3u></canvas> <div class="max-w-2xl mx-auto text-center" data-astro-cid-h4m2wh3u> <!-- Success Icon --> <div class="w-24 h-24 mx-auto mb-8 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce-in" data-astro-cid-h4m2wh3u> <svg class="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-h4m2wh3u> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" data-astro-cid-h4m2wh3u></path> </svg> </div> <h1 class="font-display text-4xl md:text-5xl mb-4" data-astro-cid-h4m2wh3u>
¡Gracias por tu pedido!
</h1> <p class="text-xl text-muted-foreground mb-8" data-astro-cid-h4m2wh3u>
Tu pago ha sido procesado correctamente. Te hemos enviado un email de
        confirmación.
</p> ${order && renderTemplate`<div class="bg-card border border-border rounded-xl p-6 md:p-8 text-left mb-8" data-astro-cid-h4m2wh3u> <div class="flex items-center justify-between mb-6 pb-6 border-b border-border" data-astro-cid-h4m2wh3u> <div data-astro-cid-h4m2wh3u> <p class="text-sm text-muted-foreground" data-astro-cid-h4m2wh3u>Número de pedido</p> <p class="font-mono text-sm mt-1" data-astro-cid-h4m2wh3u> ${order.id?.slice(0, 8).toUpperCase()} </p> </div> <div class="text-right" data-astro-cid-h4m2wh3u> <p class="text-sm text-muted-foreground" data-astro-cid-h4m2wh3u>Fecha</p> <p class="text-sm mt-1" data-astro-cid-h4m2wh3u>${formatDate(order.created_at)}</p> </div> </div> <div class="mb-6" data-astro-cid-h4m2wh3u> <h3 class="font-heading font-semibold mb-3" data-astro-cid-h4m2wh3u>
Dirección de envío
</h3> <p class="text-muted-foreground text-sm" data-astro-cid-h4m2wh3u> ${order.customer_name} <br data-astro-cid-h4m2wh3u> ${order.shipping_address} <br data-astro-cid-h4m2wh3u> ${order.shipping_postal_code} ${order.shipping_city} <br data-astro-cid-h4m2wh3u> ${order.shipping_country} </p> </div> <div class="mb-6" data-astro-cid-h4m2wh3u> <h3 class="font-heading font-semibold mb-3" data-astro-cid-h4m2wh3u>Productos</h3> <div class="space-y-3" data-astro-cid-h4m2wh3u> ${orderItems.map((item) => renderTemplate`<div class="flex justify-between text-sm" data-astro-cid-h4m2wh3u> <span data-astro-cid-h4m2wh3u> ${item.products?.name || "Producto"} <span class="text-muted-foreground" data-astro-cid-h4m2wh3u>
(Talla ${item.product_variants?.size})
</span> <span class="text-muted-foreground" data-astro-cid-h4m2wh3u> ${" "}
× ${item.quantity} </span> </span> <span class="font-medium" data-astro-cid-h4m2wh3u> ${formatPrice(item.price_at_purchase * item.quantity)} </span> </div>`)} </div> </div> <div class="pt-4 border-t border-border flex justify-between text-lg font-bold" data-astro-cid-h4m2wh3u> <span data-astro-cid-h4m2wh3u>Total</span> <span class="text-primary" data-astro-cid-h4m2wh3u> ${formatPrice(order.total_amount)} </span> </div> </div>`} <div class="flex flex-col sm:flex-row gap-4 justify-center" data-astro-cid-h4m2wh3u> ${renderComponent($$result2, "Button", $$Button, { "href": "/productos", "variant": "primary", "size": "lg", "data-astro-cid-h4m2wh3u": true }, { "default": async ($$result3) => renderTemplate`
Seguir comprando
` })} </div> <p class="text-sm text-muted-foreground mt-6" data-astro-cid-h4m2wh3u>
Te hemos enviado un email de confirmación a tu correo electrónico.
</p> </div> </div> ${renderScript($$result2, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout/exito.astro?astro&type=script&index=0&lang.ts")}  ` })}`;
}, "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gesti\xF3n Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout/exito.astro", void 0);

const $$file = "C:/Users/anton/Desktop/Development/VictoriaFPII/Sistema de Gestión Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/checkout/exito.astro";
const $$url = "/checkout/exito";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Exito,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
