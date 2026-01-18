import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { CAMPAIGN_STATUS } from '@/lib/constants/newsletter';

export const PUT: APIRoute = async ({ request, cookies }) => {
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
    const { id, subject, content } = await request.json();

    if (!id || !subject || !content) {
      return new Response(JSON.stringify({ error: 'ID, asunto y contenido son requeridos' }), {
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

    // Only allow editing drafts and failed campaigns
    if (campaign.status !== CAMPAIGN_STATUS.DRAFT && campaign.status !== CAMPAIGN_STATUS.FAILED) {
      return new Response(JSON.stringify({ 
        error: `No se puede editar una campaña con estado "${campaign.status}"` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update campaign (reset to draft if it was failed)
    const updateData: Record<string, unknown> = { 
      subject, 
      content,
      updated_at: new Date().toISOString(),
    };

    // If campaign was failed, reset to draft so it can be sent again
    if (campaign.status === CAMPAIGN_STATUS.FAILED) {
      updateData.status = CAMPAIGN_STATUS.DRAFT;
      updateData.last_error = null;
      updateData.failed_count = 0;
    }

    const { error } = await authClient
      .from('newsletter_campaigns')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating campaign:', error);
      return new Response(JSON.stringify({ error: 'Error al actualizar campaña' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Campaign update exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
