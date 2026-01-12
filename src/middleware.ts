import { defineMiddleware } from 'astro:middleware';
import { supabase } from '@/lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const cookies = context.cookies;

  // Get tokens from cookies
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  // Check if route requires authentication
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAccountRoute = pathname.startsWith('/cuenta') && 
    pathname !== '/cuenta/login' && 
    pathname !== '/cuenta/registro';

  // If we have tokens, try to get the user (for ANY route)
  if (accessToken && refreshToken) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (user && !error) {
      // Attach user to locals for use in pages
      context.locals.user = user;
    } else {
      // Invalid tokens - only clear if we tried to use them
      // Don't clear immediately to avoid race conditions, but if explicit auth is needed it will fail below
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
