import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { CAMPAIGN_STATUS, type CampaignStatus } from '@/lib/constants/newsletter';

/**
 * Updates campaign status
 * Used to mark campaigns as 'sending' before starting, or 'failed' on error
 */
export const POST: APIRoute = async ({ request, cookies }) => {
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
    const { campaignId, status, errorMessage } = await request.json();

    if (!campaignId || !status) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate status is a valid value
    const validStatuses: CampaignStatus[] = Object.values(CAMPAIGN_STATUS);
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Estado inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updateData: Record<string, unknown> = { status };
    
    if (errorMessage) {
      updateData.last_error = errorMessage;
    }

    const { error } = await authClient
      .from('newsletter_campaigns')
      .update(updateData)
      .eq('id', campaignId);

    if (error) {
      console.error('Error updating campaign status:', error);
      return new Response(JSON.stringify({ error: 'Error al actualizar estado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Update status exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
