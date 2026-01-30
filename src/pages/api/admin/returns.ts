import type { APIRoute } from "astro";
import { createAuthenticatedClient, supabaseAdmin } from "@/lib/supabase";
import { validateToken } from "@/lib/auth-utils";
import { 
  sendReturnApprovedEmail, 
  sendReturnRejectedEmail, 
  sendReturnReceivedEmail,
  sendReturnCompletedEmail,
  type ReturnEmailData 
} from "@/lib/email";
import { stripe } from "@/lib/stripe";

export const prerender = false;

// GET: Fetch all returns for admin dashboard
export const GET: APIRoute = async ({ request, cookies, url }) => {
  try {
    // Read token from Authorization header (Flutter/mobile) or cookies (web)
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    let refreshToken: string | undefined;

    if (!accessToken) {
      // Fallback to cookies for web client
      accessToken = cookies.get("sb-access-token")?.value;
      refreshToken = cookies.get("sb-refresh-token")?.value;
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate token and check admin status
    const user = await validateToken(accessToken);
    
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    const status = url.searchParams.get("status");
    const returnId = url.searchParams.get("id");

    let query = supabase
      .from("returns")
      .select(`
        *,
        orders:order_id (
          id,
          customer_name,
          customer_email,
          total_amount,
          created_at
        ),
        return_items (
          *,
          order_items:order_item_id (
            price_at_purchase,
            quantity
          ),
          product_variants:product_variant_id (
            size,
            stock,
            products:product_id (
              name,
              images:product_images (image_url)
            )
          )
        ),
        return_images (*)
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (returnId) {
      const { data, error } = await query.eq("id", returnId).single();
      if (error) {
        console.error("Error fetching return:", error);
        return new Response(
          JSON.stringify({ error: "Error al obtener devolución" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching returns:", error);
      return new Response(
        JSON.stringify({ error: "Error al obtener devoluciones" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Admin returns API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT: Update return status (approve, reject, receive, complete)
export const PUT: APIRoute = async ({ request, cookies }) => {
  console.log('\n=== [RETURNS API PUT] Starting request ===');
  console.log('🔑 supabaseAdmin available:', !!supabaseAdmin);
  console.log('🔑 supabaseAdmin is function:', typeof supabaseAdmin === 'object');
  
  try {
    // Read token from Authorization header (Flutter/mobile) or cookies (web)
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    let refreshToken: string | undefined;
    let tokenSource = 'header';

    if (!accessToken) {
      // Fallback to cookies for web client
      tokenSource = 'cookies';
      accessToken = cookies.get("sb-access-token")?.value;
      refreshToken = cookies.get("sb-refresh-token")?.value;
    }

    console.log('🔐 Token source:', tokenSource);
    console.log('🔐 Access token present:', !!accessToken);
    console.log('🔐 Token (first 20):', accessToken?.substring(0, 20));

    if (!accessToken) {
      console.log('❌ No access token');
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate token and check admin status
    console.log('🔍 Validating token...');
    const user = await validateToken(accessToken);
    console.log('👤 User:', user?.id);
    console.log('👤 User metadata:', user?.user_metadata);
    console.log('👤 Is admin:', user?.user_metadata?.is_admin);
    
    if (!user?.user_metadata?.is_admin) {
      console.log('❌ User is not admin');
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('✅ User is admin, proceeding...');

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    const body = await request.json();
    console.log('📦 Request body:', body);
    const { return_id, action, notes, rejection_reason, return_label_url } = body;

    if (!return_id || !action) {
      return new Response(
        JSON.stringify({ error: "Se requiere return_id y action" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validActions = ["approve", "reject", "receive", "complete"];
    if (!validActions.includes(action)) {
      console.log('❌ Invalid action:', action);
      return new Response(
        JSON.stringify({ error: `Acción inválida. Válidas: ${validActions.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log('🔧 Calling RPC process_return with supabaseAdmin...');
    console.log('🔧 Parameters:', {
      p_return_id: return_id,
      p_action: action,
      p_notes: notes || null,
      p_rejection_reason: rejection_reason || null,
      p_return_label_url: return_label_url || null
    });

    // Call the RPC function with service role admin to bypass RLS
    // (admin validation already done above)
    const { error } = await supabaseAdmin.rpc("process_return", {
      p_return_id: return_id,
      p_action: action,
      p_notes: notes || null,
      p_rejection_reason: rejection_reason || null,
      p_return_label_url: return_label_url || null
    });

    console.log('📤 RPC result - error:', error);

    if (error) {
      console.error('❌ Error processing return:', error);
      return new Response(
        JSON.stringify({ error: error.message || "Error al procesar la devolución" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log('✅ RPC call successful');

    // Process Stripe refund when completing the return
    let refundProcessed = false;
    let refundAmount = 0;
    
    if (action === "complete") {
      try {
        // Fetch return with order data for Stripe refund
        const { data: returnForRefund } = await supabase
          .from("returns")
          .select(`
            id,
            refund_amount,
            orders:order_id (
              id,
              stripe_session_id,
              total_amount
            )
          `)
          .eq("id", return_id)
          .single();

        if (returnForRefund?.orders?.stripe_session_id && returnForRefund.refund_amount > 0) {
          const order = Array.isArray(returnForRefund.orders) 
            ? returnForRefund.orders[0] 
            : returnForRefund.orders;
          
          if (order?.stripe_session_id) {
            // Retrieve the checkout session to get payment intent
            const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
            
            if (session.payment_intent) {
              const paymentIntentId = typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent.id;
              
              // Calculate refund amount in cents
              const refundAmountCents = Math.round(returnForRefund.refund_amount * 100);
              
              // Create the refund in Stripe
              const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: refundAmountCents,
                reason: 'requested_by_customer',
              });
              
              refundProcessed = refund.status === 'succeeded' || refund.status === 'pending';
              refundAmount = returnForRefund.refund_amount;
              
              console.log(`✅ Stripe refund ${refund.id} created for return ${return_id}: ${refundAmount}€`);
            }
          }
        }
      } catch (stripeError: any) {
        console.error("❌ Stripe refund error:", stripeError);
        // Don't fail the request if Stripe refund fails - admin can process manually
        // But log the error for debugging
      }
    }

    // Send email notifications based on action
    let emailSent = false;
    try {
      // Fetch return details for email
      const { data: returnData } = await supabase
        .from("returns")
        .select(`
          id,
          order_id,
          refund_amount,
          orders:order_id (
            id,
            order_number,
            customer_name,
            customer_email
          )
        `)
        .eq("id", return_id)
        .single();

      if (returnData && returnData.orders) {
        const order = Array.isArray(returnData.orders) ? returnData.orders[0] : returnData.orders;
        
        if (!order) {
          console.warn("No order data found for return email");
        } else {
          // Prepare email data
          const emailData: ReturnEmailData = {
            returnId: returnData.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            status: action as ReturnEmailData['status'],
            refundAmount: Number(returnData.refund_amount) || 0,
            rejectionReason: rejection_reason,
          };

          if (action === "approve") {
            const result = await sendReturnApprovedEmail(emailData);
            emailSent = result.success;
          } else if (action === "reject") {
            const result = await sendReturnRejectedEmail(emailData);
            emailSent = result.success;
          } else if (action === "receive") {
            const result = await sendReturnReceivedEmail(emailData);
            emailSent = result.success;
          } else if (action === "complete") {
            const result = await sendReturnCompletedEmail(emailData);
            emailSent = result.success;
          }
        }
      }
    } catch (emailError) {
      console.warn("Failed to send return email:", emailError);
      // Don't fail the request if email fails
    }

    // Build response message with refund info
    let message = `Devolución ${action === "approve" ? "aprobada" : action === "reject" ? "rechazada" : action === "receive" ? "marcada como recibida" : "completada"}`;
    
    if (action === "complete") {
      if (refundProcessed) {
        message += ` y reembolso de ${refundAmount.toFixed(2)}€ procesado en Stripe`;
      } else if (refundAmount > 0) {
        message += ` (reembolso de ${refundAmount.toFixed(2)}€ pendiente de procesar manualmente)`;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent,
        refundProcessed,
        refundAmount,
        message
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Admin returns API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PATCH: Inspect individual return item
export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    // Read token from Authorization header (Flutter/mobile) or cookies (web)
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    let refreshToken: string | undefined;

    if (!accessToken) {
      // Fallback to cookies for web client
      accessToken = cookies.get("sb-access-token")?.value;
      refreshToken = cookies.get("sb-refresh-token")?.value;
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate token and check admin status
    const user = await validateToken(accessToken);
    
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    const body = await request.json();
    const { item_id, status, restock, notes } = body;

    if (!item_id || !status) {
      return new Response(
        JSON.stringify({ error: "Se requiere item_id y status" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return new Response(
        JSON.stringify({ error: "status debe ser 'approved' o 'rejected'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the RPC function with service role admin to bypass RLS
    // (admin validation already done above)
    const { error } = await supabaseAdmin.rpc("inspect_return_item", {
      p_item_id: item_id,
      p_status: status,
      p_restock: restock || false,
      p_notes: notes,
    });

    if (error) {
      console.error("Error inspecting item:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Error al inspeccionar el item" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Item ${status === "approved" ? "aprobado" : "rechazado"}` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Admin returns API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
