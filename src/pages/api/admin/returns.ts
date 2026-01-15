import type { APIRoute } from "astro";
import { createAuthenticatedClient } from "@/lib/supabase";

export const prerender = false;

// GET: Fetch all returns for admin dashboard
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

    // Verify admin via user_metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      query = query.eq("id", returnId).single();
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

    // Verify admin via user_metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { return_id, action, notes, rejection_reason, return_label_url } = body;

    if (!return_id || !action) {
      return new Response(
        JSON.stringify({ error: "Se requiere return_id y action" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validActions = ["approve", "reject", "receive", "complete"];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: `Acción inválida. Válidas: ${validActions.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the RPC function
    const { data, error } = await supabase.rpc("process_return", {
      p_return_id: return_id,
      p_action: action,
      p_notes: notes,
      p_rejection_reason: rejection_reason,
      p_return_label_url: return_label_url
    });

    if (error) {
      console.error("Error processing return:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Error al procesar la devolución" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Devolución ${action === "approve" ? "aprobada" : action === "reject" ? "rechazada" : action === "receive" ? "marcada como recibida" : "completada"}` }),
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
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    // Verify admin via user_metadata
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Call the RPC function
    const { data, error } = await supabase.rpc("inspect_return_item", {
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
