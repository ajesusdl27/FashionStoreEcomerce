import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

function sanitizeRedirectPath(redirectPath: string | undefined, fallback: string): string {
  if (!redirectPath || !redirectPath.startsWith('/')) {
    return fallback;
  }

  const pathname = redirectPath.split('?')[0] || '/';
  const normalizedPathname = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  const blockedTargets = new Set([
    '/cuenta/login',
    '/cuenta/registro',
    '/cuenta/recuperar-password',
    '/cuenta/reset-password',
    '/admin/login',
  ]);

  if (blockedTargets.has(normalizedPathname)) {
    return fallback;
  }

  return redirectPath;
}

// Translation helper for Supabase error messages
function translateSupabaseError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu email antes de continuar',
    'User not found': 'El usuario no existe',
    'Password too short': 'La contraseña es demasiado corta',
    'Email address not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada',
    'User already registered': 'Este email ya está registrado',
    'Authentication required': 'Autenticación requerida',
    'Invalid or expired session': 'Sesión inválida o expirada',
    'Too many requests': 'Demasiados intentos. Intenta más tarde',
  };

  return errorMap[message] || message;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const contentType = request.headers.get('content-type');
    let email, password, redirectTo;

    if (contentType?.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
      redirectTo = body.redirectTo || '/cuenta';
    } else {
      const formData = await request.formData();
      email = formData.get('email')?.toString();
      password = formData.get('password')?.toString();
      redirectTo = formData.get('redirectTo')?.toString() || '/cuenta';
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email y contraseña son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fallbackRedirect = redirectTo?.startsWith('/admin') ? '/admin' : '/cuenta';
    const safeRedirectTo = sanitizeRedirectPath(redirectTo, fallbackRedirect);

    // IMPORTANTE: Usar un cliente fresh para signInWithPassword
    // para NO contaminar el singleton compartido con estado de sesión
    const freshClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await freshClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const translatedError = translateSupabaseError(error.message);
      return new Response(
        JSON.stringify({ error: translatedError }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data?.session) {
      return new Response(
        JSON.stringify({ error: 'No se pudo crear la sesión' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { access_token, refresh_token } = data.session;
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
      JSON.stringify({ success: true, redirectTo: safeRedirectTo }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
