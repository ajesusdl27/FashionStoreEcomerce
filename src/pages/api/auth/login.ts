import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

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
  console.log('🔐 [AUTH LOGIN] Request received');
  
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

    console.log(`🔐 [AUTH LOGIN] Email: ${email}, RedirectTo: ${redirectTo}`);
    console.log(`🔐 [AUTH LOGIN] Environment:`, {
      SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
      IS_PROD: import.meta.env.PROD
    });

    if (!email || !password) {
      console.error('🔐 [AUTH LOGIN] ❌ Missing email or password');
      return new Response(
        JSON.stringify({ error: 'Email y contraseña son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 [AUTH LOGIN] Attempting Supabase signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔐 [AUTH LOGIN] Supabase response:', {
      hasData: !!data,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error ? error.message : null,
      errorStatus: error?.status,
      errorCode: error ? (error as any).code : null
    });

  if (error) {
      console.error('🔐 [AUTH LOGIN] ❌ Supabase auth error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      const translatedError = translateSupabaseError(error.message);
      return new Response(
        JSON.stringify({ error: translatedError }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data?.session) {
      console.error('🔐 [AUTH LOGIN] ❌ No session returned from Supabase');
      return new Response(
        JSON.stringify({ error: 'No se pudo crear la sesión' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { access_token, refresh_token } = data.session;
    console.log('🔐 [AUTH LOGIN] ✓ Session obtained, setting cookies...');

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

    console.log('🔐 [AUTH LOGIN] ✅ Login successful, cookies set');
    return new Response(
      JSON.stringify({ success: true, redirectTo }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('🔐 [AUTH LOGIN] ❌ Unexpected error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
