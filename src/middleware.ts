import { defineMiddleware } from 'astro:middleware';
import { validateToken, refreshSession } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

// Cache para el estado de mantenimiento (evitar múltiples queries)
let maintenanceCache: { enabled: boolean; message: string; timestamp: number } | null = null;
const MAINTENANCE_CACHE_TTL = 30 * 1000; // 30 segundos

async function getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
  const now = Date.now();
  
  // Usar caché si es válido
  if (maintenanceCache && (now - maintenanceCache.timestamp) < MAINTENANCE_CACHE_TTL) {
    return { enabled: maintenanceCache.enabled, message: maintenanceCache.message };
  }
  
  try {
    const { data } = await supabase
      .from('settings')
      .select('key, value, value_bool')
      .in('key', ['maintenance_mode', 'maintenance_message']);
    
    const modeRow = data?.find(s => s.key === 'maintenance_mode');
    const msgRow = data?.find(s => s.key === 'maintenance_message');
    
    const enabled = modeRow?.value_bool === true || modeRow?.value === 'true';
    const message = msgRow?.value || 'Estamos realizando mejoras. Volvemos pronto.';
    
    maintenanceCache = { enabled, message, timestamp: now };
    return { enabled, message };
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return { enabled: false, message: '' };
  }
}

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

  // Log auth checks for protected routes
  if (isAdminRoute || isAccountRoute) {
    console.log('🔒 [MIDDLEWARE] Auth check for:', pathname);
    console.log('🔒 [MIDDLEWARE] Has access token:', !!accessToken);
    console.log('🔒 [MIDDLEWARE] Has refresh token:', !!refreshToken);
  }

  // If we have tokens, try to validate the user
  if (accessToken) {
    console.log('🔒 [MIDDLEWARE] Validating access token...');
    let user = await validateToken(accessToken);

    // If access token is invalid but we have refresh token, try to refresh
    if (!user && refreshToken) {
      console.log('🔒 [MIDDLEWARE] Access token invalid, attempting refresh...');
      const newTokens = await refreshSession(refreshToken);
      
      if (newTokens) {
        console.log('🔒 [MIDDLEWARE] ✅ Session refreshed successfully');
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
      } else {
        console.log('🔒 [MIDDLEWARE] ❌ Failed to refresh session');
      }
    }

    if (user) {
      console.log('🔒 [MIDDLEWARE] ✅ User authenticated:', user.email);
      // Attach user to locals for use in pages
      context.locals.user = user;
    } else {
      console.log('🔒 [MIDDLEWARE] ❌ User validation failed');
    }
  }

  // Enforce protection for Admin/Account routes
  if (isAdminRoute || isAccountRoute) {
    // If no user found (either no tokens or invalid tokens)
    if (!context.locals.user) {
      console.log('🔒 [MIDDLEWARE] ❌ No authenticated user, redirecting to login');
      // Clear invalid cookies if they existed but failed
      if (accessToken || refreshToken) {
        console.log('🔒 [MIDDLEWARE] Clearing invalid tokens');
        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });
      }

      const loginUrl = isAdminRoute ? '/admin/login' : '/cuenta/login';
      console.log('🔒 [MIDDLEWARE] Redirect to:', loginUrl);
      return context.redirect(`${loginUrl}?redirect=${encodeURIComponent(pathname)}`);
    }

    // Admin routes require admin role
    if (isAdminRoute) {
      const isAdmin = context.locals.user.user_metadata?.is_admin === true;
      console.log('🔒 [MIDDLEWARE] Admin check:', isAdmin);
      
      if (!isAdmin) {
        console.log('🔒 [MIDDLEWARE] ❌ Not admin, access denied');
        return context.redirect('/admin/login?error=unauthorized');
      }
    }
  }

  // ============================================
  // MODO MANTENIMIENTO
  // ============================================
  // Verificar solo para rutas públicas (no admin, no API, no assets)
  const isPublicPage = !pathname.startsWith('/admin') && 
                       !pathname.startsWith('/api') &&
                       pathname !== '/mantenimiento' &&
                       !pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);

  if (isPublicPage) {
    const maintenance = await getMaintenanceStatus();
    
    if (maintenance.enabled) {
      // Si el usuario es admin, permitir acceso
      const isAdmin = context.locals.user?.user_metadata?.is_admin === true;
      
      if (!isAdmin) {
        // Pasar el mensaje de mantenimiento a la página
        context.locals.maintenanceMessage = maintenance.message;
        return context.redirect('/mantenimiento');
      }
    }
  }

  return next();
});

