import type { APIRoute } from "astro";
import { createAuthenticatedClient } from "@/lib/supabase";

export const prerender = false;

/**
 * POST /api/returns/ship
 * Permite al cliente marcar su devolución como enviada y añadir número de seguimiento
 */
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

    // Verificar usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { return_id, tracking_number } = body;

    if (!return_id) {
      return new Response(
        JSON.stringify({ error: "Se requiere return_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que la devolución existe y pertenece al usuario
    const { data: returnData, error: returnError } = await supabase
      .from("returns")
      .select("id, status, user_id")
      .eq("id", return_id)
      .single();

    if (returnError || !returnData) {
      return new Response(
        JSON.stringify({ error: "Devolución no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que el usuario es el propietario
    if (returnData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para modificar esta devolución" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que está en estado 'approved'
    if (returnData.status !== "approved") {
      return new Response(
        JSON.stringify({ 
          error: returnData.status === "shipped" 
            ? "Esta devolución ya está marcada como enviada" 
            : "Solo se pueden marcar como enviadas devoluciones aprobadas"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Llamar a la función RPC para marcar como enviada
    const { error: rpcError } = await supabase.rpc("mark_return_shipped", {
      p_return_id: return_id,
      p_tracking_number: tracking_number || null,
    });

    if (rpcError) {
      console.error("Error marking return as shipped:", rpcError);
      return new Response(
        JSON.stringify({ error: rpcError.message || "Error al actualizar la devolución" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Devolución marcada como enviada correctamente" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Returns ship API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
