import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de campaña requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // FIX: Atomic delete - use WHERE clause to prevent race condition 
    // (deleting a campaign that changed status between SELECT and DELETE)
    // Only allow deleting drafts, failed, and paused campaigns in a single atomic operation
    const { data: deleted, error } = await authClient
      .from('newsletter_campaigns')
      .delete()
      .eq('id', id)
      .not('status', 'in', '("sent","sending")')
      .select('id');

    if (error) {
      console.error('Error deleting campaign:', error);
      return new Response(JSON.stringify({ error: 'Error al eliminar campaña' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!deleted || deleted.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No se puede eliminar una campaña enviada o en proceso de envío' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Campaign delete exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
