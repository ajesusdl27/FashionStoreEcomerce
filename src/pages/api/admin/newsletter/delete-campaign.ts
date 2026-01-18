import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { CAMPAIGN_STATUS } from '@/lib/constants/newsletter';

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

    // Fetch current campaign to verify status
    const { data: campaign, error: fetchError } = await authClient
      .from('newsletter_campaigns')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaña no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only allow deleting drafts and failed campaigns (not sent or sending)
    if (campaign.status === CAMPAIGN_STATUS.SENT || campaign.status === CAMPAIGN_STATUS.SENDING) {
      return new Response(JSON.stringify({ 
        error: `No se puede eliminar una campaña con estado "${campaign.status}"` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete campaign (will cascade to send_logs)
    const { error } = await authClient
      .from('newsletter_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return new Response(JSON.stringify({ error: 'Error al eliminar campaña' }), {
        status: 500,
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
