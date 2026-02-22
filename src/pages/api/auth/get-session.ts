import type { APIRoute } from 'astro';
import { refreshSession, validateToken } from '@/lib/auth-utils';

// Returns current user session info for client-side hydration
// This allows the client to sync with the httpOnly cookie session
export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken && !refreshToken) {
    return new Response(
      JSON.stringify({ user: null }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
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
    // Token is invalid, clear the cookies
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    return new Response(
      JSON.stringify({ user: null }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Return user info (without sensitive data)
  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      }
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
};
