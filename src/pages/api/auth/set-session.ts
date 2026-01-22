import type { APIRoute } from 'astro';

// This endpoint is called from the frontend after successful signup
// to set the session cookies (since signup happens client-side to avoid Cloudflare blocking)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Tokens requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set cookies with secure options
    cookies.set('sb-access-token', access_token, {
      path: '/',
      httpOnly: true,
      secure: false, // TEMPORAL: Fuerza false para que funcione tras el proxy de Coolify
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies.set('sb-refresh-token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: false, // TEMPORAL: Fuerza false para que funcione tras el proxy de Coolify
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
