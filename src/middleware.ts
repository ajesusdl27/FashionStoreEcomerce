import { defineMiddleware } from 'astro:middleware';
import { validateToken, refreshSession } from '@/lib/auth-utils';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const cookies = context.cookies;

  // Get tokens from cookies
  let accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  // Check if route requires authentication
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAccountRoute = pathname.startsWith('/cuenta') && 
    pathname !== '/cuenta/login' && 
    pathname !== '/cuenta/registro' &&
    pathname !== '/cuenta/recuperar-password' &&
    pathname !== '/cuenta/reset-password';

  // If we have tokens, try to validate the user
  if (accessToken) {
    let user = await validateToken(accessToken);

    // If access token is invalid but we have refresh token, try to refresh
    if (!user && refreshToken) {
      const newTokens = await refreshSession(refreshToken);
      
      if (newTokens) {
        // Update cookies with new tokens
        cookies.set('sb-access-token', newTokens.access_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        cookies.set('sb-refresh-token', newTokens.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // Validate with new token
        user = await validateToken(newTokens.access_token);
        accessToken = newTokens.access_token;
      }
    }

    if (user) {
      // Attach user to locals for use in pages
      context.locals.user = user;
    }
  }

  // Enforce protection for Admin/Account routes
  if (isAdminRoute || isAccountRoute) {
    // If no user found (either no tokens or invalid tokens)
    if (!context.locals.user) {
      // Clear invalid cookies if they existed but failed
      if (accessToken || refreshToken) {
        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });
      }

      const loginUrl = isAdminRoute ? '/admin/login' : '/cuenta/login';
      return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
    }

    // Admin routes require admin role
    if (isAdminRoute) {
      const isAdmin = context.locals.user.user_metadata?.is_admin === true;
      
      if (!isAdmin) {
        return context.redirect('/admin/login?error=unauthorized');
      }
    }
  }

  return next();
});

