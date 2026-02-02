import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { validateToken } from "@/lib/auth-utils";

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

/**
 * POST /api/returns/ship
 * Permite al cliente marcar su devolución como enviada y añadir número de seguimiento
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Read token from Authorization header (Flutter/mobile) or cookies (web)
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      // Fallback to cookies for web client
      accessToken = cookies.get("sb-access-token")?.value;
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate token and get user
    const user = await validateToken(accessToken);
    if (!user) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
