/**
 * API para que el CLIENTE marque su devolución como enviada
 * PUT /api/returns/:id/mark-shipped
 * 
 * Requisitos:
 * - Usuario autenticado debe ser el propietario de la devolución
 * - Devolución debe estar en estado 'approved'
 * - Opcionalmente puede incluir número de tracking
 */

import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const { id } = params;
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Sesión inválida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener tracking_number del body (opcional)
    const body = await request.json().catch(() => ({}));
    const { tracking_number } = body;

    // Llamar a la función RPC
    const { error } = await supabase.rpc('mark_return_shipped', {
      p_return_id: id,
      p_tracking_number: tracking_number || null,
    });

    if (error) {
      console.error('Error marking return as shipped:', error);
      
      // Mensajes de error personalizados
      if (error.message.includes('No tienes permisos')) {
        return new Response(
          JSON.stringify({ error: 'No tienes permisos para modificar esta devolución' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (error.message.includes('aprobada')) {
        return new Response(
          JSON.stringify({ 
            error: 'Solo puedes marcar como enviada una devolución aprobada',
            details: 'Espera a que el administrador apruebe tu solicitud antes de enviar el paquete'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message || 'Error al actualizar devolución' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Devolución marcada como enviada correctamente',
        tracking_number: tracking_number || null
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Mark shipped API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
