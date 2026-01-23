import type { APIRoute } from "astro";
import { createAuthenticatedClient } from "@/lib/supabase";
import { sendReturnConfirmation } from "@/lib/email";
export const prerender = false;

// POST: Create a return request
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { order_id, items, customer_notes } = body;

    // Validate input
    if (!order_id || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Datos incompletos. Se requiere order_id e items." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify the order belongs to this user and is eligible for return
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id, status, delivered_at, customer_email,
        order_items (id, price_at_purchase, product_id, variant_id, quantity)
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Pedido no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return new Response(
        JSON.stringify({ error: "Solo se pueden devolver pedidos entregados" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check return window (30 days default)
    const { data: settings } = await supabase
      .from("settings")
      .select("value_number")
      .eq("key", "return_window_days")
      .single();

    const returnWindowDays = settings?.value_number || 30;
    
    if (order.delivered_at) {
      const deliveredDate = new Date(order.delivered_at);
      const now = new Date();
      const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDelivery > returnWindowDays) {
        return new Response(
          JSON.stringify({ 
            error: `El plazo de devolución de ${returnWindowDays} días ha expirado` 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Check if there's already an active return for this order
    const { data: existingReturn } = await supabase
      .from("returns")
      .select("id, status")
      .eq("order_id", order_id)
      .not("status", "in", "(rejected,completed)")
      .single();

    if (existingReturn) {
      return new Response(
        JSON.stringify({ error: "Ya existe una solicitud de devolución activa para este pedido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build map of order items for validation
    const orderItemsMap = new Map(
      (order.order_items || []).map((oi: any) => [oi.id, oi])
    );

    // Validate quantities before creating return
    for (const item of items) {
      const orderItem = orderItemsMap.get(item.order_item_id);
      
      if (!orderItem) {
        return new Response(
          JSON.stringify({ error: `Artículo ${item.order_item_id} no encontrado en el pedido` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: "La cantidad a devolver debe ser mayor que 0" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (item.quantity > orderItem.quantity) {
        return new Response(
          JSON.stringify({ 
            error: `No puedes devolver más de ${orderItem.quantity} unidades del artículo. Has solicitado ${item.quantity}.` 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Create the return request
    const { data: newReturn, error: returnError } = await supabase
      .from("returns")
      .insert({
        order_id,
        user_id: user.id,
        customer_notes,
        status: "requested",
      })
      .select()
      .single();

    if (returnError) {
      console.error("Error creating return:", returnError);
      return new Response(
        JSON.stringify({ error: "Error al crear la solicitud de devolución" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert return items with calculated refund_amount (orderItemsMap already built above)
    let totalEstimatedRefund = 0;
    const returnItems = items.map((item: any) => {
      const orderItem = orderItemsMap.get(item.order_item_id);
      const priceAtPurchase = orderItem?.price_at_purchase || 0;
      const estimatedRefund = priceAtPurchase * item.quantity;
      totalEstimatedRefund += estimatedRefund;
      
      return {
        return_id: newReturn.id,
        order_item_id: item.order_item_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        reason: item.reason,
        reason_details: item.reason_details,
        refund_amount: estimatedRefund, // Store estimated refund amount
      };
    });

    const { error: itemsError } = await supabase
      .from("return_items")
      .insert(returnItems);

    if (itemsError) {
      console.error("Error creating return items:", itemsError);
      // Rollback: delete the return
      await supabase.from("returns").delete().eq("id", newReturn.id);
      return new Response(
        JSON.stringify({ error: "Error al procesar los artículos" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update the return with the total estimated refund amount
    await supabase
      .from("returns")
      .update({ refund_amount: totalEstimatedRefund })
      .eq("id", newReturn.id);

    // Update order status to indicate a return has been requested
    await supabase
      .from("orders")
      .update({ status: "return_requested" })
      .eq("id", order_id);

    // Fetch product details for email
    const { data: orderDetails } = await supabase
      .from("orders")
      .select("order_number, customer_name, customer_email")
      .eq("id", order_id)
      .single();

    // Fetch item details for email
    const { data: itemDetails } = await supabase
      .from("return_items")
      .select(`
        quantity,
        reason,
        product_variants:product_variant_id (
          size,
          products:product_id (name)
        )
      `)
      .eq("return_id", newReturn.id);

    // Send confirmation email
    if (orderDetails) {
      const emailItems = (itemDetails || []).map((item: any) => ({
        productName: item.product_variants?.products?.name || 'Producto',
        size: item.product_variants?.size || '-',
        quantity: item.quantity,
        reason: item.reason,
      }));

      sendReturnConfirmation({
        returnId: newReturn.id,
        orderId: order_id,
        orderNumber: orderDetails.order_number,
        customerName: orderDetails.customer_name,
        customerEmail: orderDetails.customer_email,
        items: emailItems,
      }).catch(err => console.error('Error sending return confirmation email:', err));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        return_id: newReturn.id,
        message: "Solicitud de devolución creada correctamente"
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Returns API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// GET: Get returns for the current user
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;
    
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);
    
    const orderId = url.searchParams.get("order_id");
    
    let query = supabase
      .from("returns")
      .select(`
        *,
        return_items (
          *,
          product_variants:product_variant_id (
            size,
            products:product_id (name)
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (orderId) {
      query = query.eq("order_id", orderId);
    }

    const { data: returns, error } = await query;

    if (error) {
      console.error("Error fetching returns:", error);
      return new Response(
        JSON.stringify({ error: "Error al obtener devoluciones" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(returns), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Returns API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
