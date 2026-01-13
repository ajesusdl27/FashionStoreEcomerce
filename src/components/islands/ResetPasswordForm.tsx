import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes - more reliable than polling getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state:', event, session ? 'has session' : 'no session');
      
      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session) {
          setSessionChecked(true);
        } else if (event === 'INITIAL_SESSION') {
          // No session on initial load
          setMessage({
            type: 'error',
            text: 'Enlace inválido o expirado. Por favor solicita uno nuevo.',
          });
          setSessionChecked(true);
        }
      }
    });

    // Also check immediately in case the session is already established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setSessionChecked(true);
      }
    }).catch((err) => {
      console.warn('getSession error (non-fatal):', err);
      // Don't block on this error, wait for onAuthStateChange
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
      console.log('Starting password update...');
      
      // Add timeout to prevent infinite hanging
      const updatePromise = supabase.auth.updateUser({ password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('La operación tardó demasiado. Por favor, intenta de nuevo.')), 15000)
      );

      console.log('Calling updateUser...');
      const result = await Promise.race([updatePromise, timeoutPromise]) as { error: any };
      console.log('updateUser completed:', result);

      if (result.error) {
        throw result.error;
      }

      console.log('Password updated successfully');

      // Sync new session to server cookies
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session after update:', session ? 'exists' : 'null');
        
        if (session) {
          const response = await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          });
          console.log('set-session response:', response.status);
        }
      } catch (syncError) {
        console.warn('Session sync failed (non-critical):', syncError);
        // Don't block on session sync failure
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
      setMessage({
        type: 'error',
        text: err.message || 'Error al actualizar la contraseña.',
      });
    }
  };

  if (!sessionChecked) {
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
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground"
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
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground"
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
          disabled={loading || (message?.type === 'error' && message.text.includes('Enlace'))}
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
      </form>
    </div>
  );
}
