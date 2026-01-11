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

  if (!isAdminRoute && !isAccountRoute) {
    return next();
  }

  // No tokens = redirect to login
  if (!accessToken || !refreshToken) {
    const loginUrl = isAdminRoute ? '/admin/login' : '/cuenta/login';
    return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
  }

  // Verify session with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    // Clear invalid cookies
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    
    const loginUrl = isAdminRoute ? '/admin/login' : '/cuenta/login';
    return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
  }

  // Admin routes require admin role
  if (isAdminRoute) {
    const isAdmin = user.user_metadata?.is_admin === true;
    
    if (!isAdmin) {
      return context.redirect('/admin/login?error=unauthorized');
    }
  }

  // Attach user to locals for use in pages
  context.locals.user = user;

  return next();
});
