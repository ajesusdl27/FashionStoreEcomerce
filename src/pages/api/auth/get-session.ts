import type { APIRoute } from 'astro';
import { refreshSession, validateToken } from '@/lib/auth-utils';

// Devuelve la sesión actual del usuario para hidratación client-side
// Permite al cliente sincronizarse con las cookies httpOnly
export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    return new Response(
      JSON.stringify({ user: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let user = accessToken ? await validateToken(accessToken) : null;

  if (!user && refreshToken) {
    const newTokens = await refreshSession(refreshToken);

    if (newTokens) {
      cookies.set('sb-access-token', newTokens.access_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });

      cookies.set('sb-refresh-token', newTokens.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });

      user = await validateToken(newTokens.access_token);
    }
  }

  if (!user) {
    // Token inválido, limpiar cookies
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    return new Response(
      JSON.stringify({ user: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Devolver info del usuario (sin datos sensibles)
  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
