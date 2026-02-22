import type { APIRoute } from 'astro';

// Este endpoint se llama desde el frontend después del registro
// para establecer las cookies de sesión (el registro ocurre client-side)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Tokens requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const forwardedProto = request.headers.get('x-forwarded-proto') || '';
    const requestProtocol = (() => {
      try {
        return new URL(request.url).protocol;
      } catch {
        return 'http:';
      }
    })();
    const secureCookies = import.meta.env.PROD &&
      (requestProtocol === 'https:' || forwardedProto.includes('https'));

    // Set cookies with secure options
    cookies.set('sb-access-token', access_token, {
      path: '/',
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies.set('sb-refresh-token', refresh_token, {
      path: '/',
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
