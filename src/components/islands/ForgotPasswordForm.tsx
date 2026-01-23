import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Translation helper for error messages
function translateError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu email antes de continuar',
    'User not found': 'El usuario no existe',
    'Password too short': 'La contraseña es demasiado corta',
    'Email address not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada',
    'User already registered': 'Este email ya está registrado',
    'Authentication required': 'Autenticación requerida',
    'Too many requests': 'Demasiados intentos. Intenta más tarde',
    'invalid_grant': 'Email o contraseña incorrectos',
  };

  return errorMap[message] || message;
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cuenta/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Si el email está registrado, recibirás un enlace para recuperar tu contraseña.',
      });
      // Clear email to prevent accidental double submission
      setEmail('');
    } catch (err: any) {
      const translatedMessage = translateError(err.message || 'Error al enviar el correo de recuperación.');
      setMessage({
        type: 'error',
        text: translatedMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading tracking-tight mb-2">Recuperar contraseña</h2>
        <p className="text-muted-foreground text-sm">
          Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground"
            placeholder="tu@email.com"
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
          disabled={loading}
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
              ENVIANDO...
            </span>
          ) : (
            'ENVIAR ENLACE'
          )}
        </button>

        <div className="text-center pt-2">
          <a href="/cuenta/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Volver al inicio de sesión
          </a>
        </div>
      </form>
    </div>
  );
}
