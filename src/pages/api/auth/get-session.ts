import type { APIRoute } from 'astro';
import { validateToken } from '@/lib/auth-utils';

// Returns current user session info for client-side hydration
// This allows the client to sync with the httpOnly cookie session
export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ user: null }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  const user = await validateToken(accessToken);

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
