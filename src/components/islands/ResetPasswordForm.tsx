import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check for error parameters in URL hash
    const checkUrlErrors = () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      const error = params.get('error');
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      if (error || errorCode) {
        console.log('Auth error detected:', { error, errorCode, errorDescription });
        
        let errorMessage = errorDescription ? decodeURIComponent(errorDescription) : 'Error en la autenticación';
        
        // Translate common error codes
        if (errorCode === 'otp_expired' || errorCode === 'invalid_otp') {
          errorMessage = 'Tu enlace de recuperación ha expirado. Los enlaces son válidos por 1 hora. Por favor solicita uno nuevo.';
        } else if (errorCode === 'access_denied') {
          errorMessage = 'El enlace no es válido o ha expirado. Por favor solicita uno nuevo.';
        }
        
        setMessage({
          type: 'error',
          text: errorMessage,
        });
        setTokenExpired(true);
        setSessionReady(true);
        
        // Clean up URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    checkUrlErrors();

    // Listen for PASSWORD_RECOVERY event - this fires when user clicks recovery link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('ResetPasswordForm auth event:', event);
      
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY' && session) {
        // Sync the recovery session to server cookies
        try {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });
        } catch (error) {
          console.warn('Failed to sync recovery session:', error);
        }
        setSessionReady(true);
        setTokenExpired(false);
      } else if (event === 'INITIAL_SESSION') {
        // Check if we have a session (user might have refreshed the page)
        if (session) {
          setSessionReady(true);
          setTokenExpired(false);
        } else {
          // No session - show error after a short delay
          // (give time for PASSWORD_RECOVERY event to fire)
          setTimeout(() => {
            if (mounted && !sessionReady) {
              setMessage({
                type: 'error',
                text: '⏰ Tu enlace de recuperación ha expirado. Los enlaces son válidos por 1 hora. Por favor solicita uno nuevo.',
              });
              setTokenExpired(true);
              setSessionReady(true); // Show form anyway so user sees the error
            }
          }, 2000);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      setLoading(false);
      return;
    }

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      // Sync updated session to server
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      }

      setLoading(false);
      setMessage({
        type: 'success',
        text: '¡Contraseña actualizada correctamente! Redirigiendo...',
      });

      // Redirect after showing success message
      setTimeout(() => {
        window.location.assign('/cuenta');
      }, 2000);
      
    } catch (err: any) {
      console.error('Password update error:', err);
      setLoading(false);

      let errorMessage = err.message || 'Error al actualizar la contraseña.';

      // Translate common Supabase errors
      if (errorMessage.includes('New password should be different from the old password')) {
        errorMessage = 'La nueva contraseña debe ser diferente a la anterior.';
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (errorMessage.includes('invalid JWT') || errorMessage.includes('expired') || errorMessage.includes('invalid_token')) {
        errorMessage = '⏰ Tu sesión ha expirado. El enlace de recuperación es válido por 1 hora. Por favor solicita uno nuevo.';
        setTokenExpired(true);
      } else if (errorMessage.includes('not authenticated') || errorMessage.includes('401')) {
        errorMessage = '⏰ Tu enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.';
        setTokenExpired(true);
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading tracking-tight mb-2">Nueva contraseña</h2>
        <p className="text-muted-foreground text-sm">
          Ingresa tu nueva contraseña para asegurar tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
            Nueva contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={tokenExpired}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground
              disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={tokenExpired}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground
              disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm border animate-fade-in ${
              message.type === 'success'
                ? 'bg-primary/10 border-primary/50 text-primary'
                : 'bg-accent/10 border-accent/50 text-accent'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || tokenExpired}
          className="w-full inline-flex items-center justify-center font-heading tracking-wider
            px-6 py-4 text-base
            bg-primary text-primary-foreground 
            hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-[1.02]
            active:scale-[0.98]
            transition-all duration-300 touch-target
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              ACTUALIZANDO...
            </span>
          ) : (
            'CAMBIAR CONTRASEÑA'
          )}
        </button>

        {tokenExpired && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              ¿Necesitas un nuevo enlace?
            </p>
            <a
              href="/cuenta/recuperar-password"
              className="w-full inline-flex items-center justify-center font-heading tracking-wider
                px-6 py-3 text-sm
                bg-secondary text-secondary-foreground 
                hover:shadow-[0_0_15px_rgba(120,119,198,0.3)] hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-300 touch-target
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary
                rounded-lg"
            >
              SOLICITAR NUEVO ENLACE
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
