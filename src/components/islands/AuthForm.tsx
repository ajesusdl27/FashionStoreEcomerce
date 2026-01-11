import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  mode: 'login' | 'register' | 'admin-login';
  redirectTo?: string;
}

export default function AuthForm({ mode, redirectTo = '/cuenta' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isRegister = mode === 'register';
  const isAdminLogin = mode === 'admin-login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        // Register on frontend (avoids Cloudflare blocking)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // Set session cookies via API
          const response = await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });

          if (response.ok) {
            setSuccess('¡Cuenta creada! Redirigiendo...');
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 1500);
          } else {
            setError('Error al establecer la sesión');
          }
        } else {
          // Email confirmation required
          setSuccess('¡Revisa tu email para confirmar tu cuenta!');
        }
      } else {
        // Login via API
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('redirectTo', isAdminLogin ? '/admin' : redirectTo);

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Error al iniciar sesión');
          setLoading(false);
          return;
        }

        setSuccess('¡Bienvenido! Redirigiendo...');
        setTimeout(() => {
          window.location.href = result.redirectTo;
        }, 1000);
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field (only for register) */}
      {isRegister && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Nombre completo
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all duration-300
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-muted-foreground"
            placeholder="Tu nombre"
          />
        </div>
      )}

      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-muted-foreground mb-2"
        >
          Email <span className="text-accent">*</span>
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

      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-muted-foreground mb-2"
        >
          Contraseña <span className="text-accent">*</span>
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

      {/* Confirm password field (only for register) */}
      {isRegister && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            Confirmar contraseña <span className="text-accent">*</span>
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
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-accent/10 border border-accent/50 rounded-lg text-accent text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-4 bg-primary/10 border border-primary/50 rounded-lg text-primary text-sm animate-fade-in">
          {success}
        </div>
      )}

      {/* Submit button */}
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
            {isRegister ? 'Registrando...' : 'Iniciando sesión...'}
          </span>
        ) : (
          isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN'
        )}
      </button>
    </form>
  );
}
