import { c as createAuthenticatedClient, s as supabase } from '../../../chunks/supabase_DtlKUSBa.mjs';
import { s as sendOrderShipped } from '../../../chunks/email_CMNVW2Q8.mjs';
export { renderers } from '../../../renderers.mjs';

const PUT = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id, status, tracking } = await request.json();
    const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Estado inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (status === "shipped") {
      if (!tracking?.carrier) {
        return new Response(JSON.stringify({ error: "Debes especificar el transportista" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { data: order, error: orderError } = await authClient.from("orders").select("*").eq("id", id).single();
      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Pedido no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { error: shipmentError } = await authClient.from("order_shipments").upsert({
        order_id: id,
        carrier: tracking.carrier,
        tracking_number: tracking.trackingNumber || null,
        tracking_url: tracking.trackingUrl || null,
        shipped_at: (/* @__PURE__ */ new Date()).toISOString()
      }, { onConflict: "order_id" });
      if (shipmentError) {
        console.error("Error inserting shipment:", shipmentError);
        return new Response(JSON.stringify({ error: "Error al guardar datos de envío" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { error: updateError } = await authClient.from("orders").update({ status }).eq("id", id);
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const emailResult = await sendOrderShipped({
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        carrier: tracking.carrier,
        trackingNumber: tracking.trackingNumber,
        trackingUrl: tracking.trackingUrl,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingPostalCode: order.shipping_postal_code,
        shippingCountry: order.shipping_country
      });
      if (!emailResult.success) {
        console.warn("Failed to send shipment email:", emailResult.error);
      }
      return new Response(JSON.stringify({ success: true, emailSent: emailResult.success }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { error } = await authClient.from("orders").update({ status }).eq("id", id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
