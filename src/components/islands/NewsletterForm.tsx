import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot field
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bots fill hidden fields)
    if (honeypot) {
      setStatus('success');
      setMessage('¡Gracias por suscribirte! 🎉');
      setEmail('');
      return;
    }
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor, introduce un email válido');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _hp: honeypot }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al suscribirse');
      }

      setStatus('success');
      setMessage('¡Gracias por suscribirte! 🎉');
      setEmail('');
    } catch (error: unknown) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4">
        Newsletter
      </h4>
      <p className="text-sm text-muted-foreground mb-2">
        Suscríbete y recibe un <strong className="text-primary">10% de descuento</strong> en tu primera compra.
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Además: ofertas exclusivas y novedades antes que nadie.
      </p>
      
      {status === 'success' ? (
        <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              opacity: 0,
              height: 0,
              width: 0,
              overflow: 'hidden'
            }}
          />
          
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Suscribirse'
              )}
            </button>
          </div>
          
          {status === 'error' && (
            <p className="text-sm text-red-400">{message}</p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Sin spam. Puedes darte de baja cuando quieras.{' '}
            <a 
              href="/promociones/newsletter-bienvenida" 
              className="underline hover:text-primary transition-colors"
            >
              Ver condiciones
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
