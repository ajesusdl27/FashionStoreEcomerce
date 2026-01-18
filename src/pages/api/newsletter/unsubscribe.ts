import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

/**
 * GDPR Compliant Unsubscribe Endpoint
 * Allows users to unsubscribe from newsletter using their unique token
 * 
 * GET /api/newsletter/unsubscribe?token=UUID
 * POST /api/newsletter/unsubscribe (body: { token: string })
 */

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get('token');
  return handleUnsubscribe(token);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    return handleUnsubscribe(token);
  } catch {
    return new Response(JSON.stringify({ error: 'Solicitud inválida' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function handleUnsubscribe(token: string | null): Promise<Response> {
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, is_active')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !subscriber) {
      return new Response(JSON.stringify({ 
        error: 'Suscriptor no encontrado',
        message: 'El enlace puede haber expirado o ya no es válido.'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if already unsubscribed
    if (!subscriber.is_active) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Ya estabas dado de baja de nuestra newsletter.',
        email: maskEmail(subscriber.email)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deactivate subscription
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error unsubscribing:', updateError);
      return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Te has dado de baja correctamente de nuestra newsletter.',
      email: maskEmail(subscriber.email)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unsubscribe exception:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Mask email for privacy (e.g., "t***@example.com")
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  
  const [local, domain] = parts;
  if (!local || !domain) return '***@***.***';
  
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 3))}@${domain}`;
}
