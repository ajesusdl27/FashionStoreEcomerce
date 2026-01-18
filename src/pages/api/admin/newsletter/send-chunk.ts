import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { resend } from '@/lib/email';
import { SEND_LOG_STATUS } from '@/lib/constants/newsletter';
import { generateNewsletterHTML } from '@/lib/email-templates/newsletter-templates';

// Sends a chunk of emails (called multiple times from the client)
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
    const { campaignId, offset, limit } = await request.json();

    // Fetch campaign
    const { data: campaign, error: campaignError } = await authClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaña no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch subscribers chunk (including unsubscribe_token for GDPR)
    const { data: subscribers, error: subError } = await authClient
      .from('newsletter_subscribers')
      .select('id, email, unsubscribe_token')
      .eq('is_active', true)
      .range(offset, offset + limit - 1);

    if (subError) {
      console.error('Error fetching subscribers:', subError);
      return new Response(JSON.stringify({ error: 'Error al obtener suscriptores' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, done: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send emails one by one with delay
    let sentCount = 0;
    let failedCount = 0;
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'FashionStore <onboarding@resend.dev>';
    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';

    for (const sub of subscribers) {
      // Generate unique unsubscribe URL for each subscriber (GDPR CRITICAL)
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
      const emailHtml = generateNewsletterHTML({
        subject: campaign.subject,
        content: campaign.content,
        siteUrl,
        unsubscribeUrl,
      });

      try {
        if (resend) {
          await resend.emails.send({
            from: fromEmail,
            to: sub.email,
            subject: campaign.subject,
            html: emailHtml,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });
          sentCount++;
          
          // Log successful send
          await logSendResult(authClient, campaignId, sub.id, sub.email, SEND_LOG_STATUS.SENT);
          
          // Wait 1 second between emails to respect rate limit
          if (sentCount < subscribers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error(`Error sending to ${sub.email}:`, emailError);
        failedCount++;
        
        // Log failed send
        await logSendResult(authClient, campaignId, sub.id, sub.email, SEND_LOG_STATUS.FAILED, errorMessage);
        // Continue with other emails
      }
    }

    // Update campaign sent_count and failed_count
    await authClient
      .from('newsletter_campaigns')
      .update({ 
        sent_count: (campaign.sent_count || 0) + sentCount,
        failed_count: (campaign.failed_count || 0) + failedCount
      })
      .eq('id', campaignId);

    const done = subscribers.length < limit;

    return new Response(JSON.stringify({ 
      sent: sentCount,
      failed: failedCount,
      done,
      nextOffset: offset + limit 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Send chunk exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Helper to log send results
async function logSendResult(
  client: ReturnType<typeof createAuthenticatedClient>,
  campaignId: string,
  subscriberId: string | null,
  email: string,
  status: string,
  errorMessage?: string
) {
  try {
    await client.from('newsletter_send_logs').insert({
      campaign_id: campaignId,
      subscriber_id: subscriberId,
      subscriber_email: email,
      status,
      error_message: errorMessage || null,
    });
  } catch (e) {
    console.error('Error logging send result:', e);
  }
}
