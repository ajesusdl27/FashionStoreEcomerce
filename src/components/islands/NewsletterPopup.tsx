import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import {
  $popupState,
  shouldShowPopup,
  showPopup,
  hidePopup,
  markSubscribed,
  dismissPopup,
  getPopupDelay,
  isProductPage,
} from '@/stores/newsletterPopup';

// ============================================
// NEWSLETTER POPUP COMPONENT
// FashionStore - Mobile-first, animated popup
// ============================================

const COUPON_CODE = 'BIENVENIDA10';
const SCROLL_THRESHOLD = 0.3; // 30% scroll for product pages

export default function NewsletterPopup() {
  const popupState = useStore($popupState);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Handle scroll-based trigger for product pages
  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const pathname = window.location.pathname;
    if (!isProductPage(pathname)) return;
    if (!shouldShowPopup(pathname)) return;

    const scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrollPercentage >= SCROLL_THRESHOLD) {
      showPopup();
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Initialize popup triggers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    
    if (!shouldShowPopup(pathname)) return;

    // Time-based trigger
    const delay = getPopupDelay(pathname);
    const timer = setTimeout(() => {
      if (shouldShowPopup(pathname)) {
        showPopup();
      }
    }, delay);

    // Scroll-based trigger for product pages
    if (isProductPage(pathname)) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      hidePopup();
      setIsClosing(false);
    }, 300); // Match animation duration
  }, []);

  // Handle dismiss (don't show for 7 days)
  const handleDismiss = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      dismissPopup(7);
      setIsClosing(false);
    }, 300);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) {
      setStatus('success');
      setMessage(`¡Gracias! Tu código: ${COUPON_CODE}`);
      setTimeout(() => markSubscribed(COUPON_CODE), 3000);
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
      const coupon = result.coupon?.code || COUPON_CODE;
      setMessage(`¡Gracias! Tu código de descuento es:`);
      
      // Close popup after showing success
      setTimeout(() => {
        markSubscribed(coupon);
      }, 5000);
    } catch (error: unknown) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error';
      setMessage(errorMessage);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popupState.isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popupState.isVisible, handleClose]);

  // Prevent body scroll when popup is visible
  useEffect(() => {
    if (popupState.isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [popupState.isVisible]);

  if (!popupState.isVisible && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup Container */}
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-background dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isClosing
            ? 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'
            : 'translate-y-0 sm:scale-100 opacity-100'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {status === 'success' ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¡Suscripción completada! 🎉
              </h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              
              {/* Coupon Code Display */}
              <div className="bg-primary/10 border-2 border-primary border-dashed rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Tu código de descuento:</p>
                <p className="font-display text-2xl sm:text-3xl text-primary tracking-widest">
                  {COUPON_CODE}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                También te lo hemos enviado por email.
              </p>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎁</span>
                </div>
                <h2
                  id="newsletter-popup-title"
                  className="font-display text-2xl sm:text-3xl text-foreground mb-2"
                >
                  ¡10% de Descuento!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Suscríbete a nuestra newsletter y obtén un descuento exclusivo en tu primera compra.
                </p>
              </div>

              {/* Benefits - Hidden on very small screens */}
              <div className="hidden sm:block space-y-2 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Código: <strong className="text-foreground">BIENVENIDA10</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Ofertas exclusivas para suscriptores</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-primary">✓</span>
                  <span className="text-muted-foreground">Primero en enterarte de novedades</span>
                </div>
              </div>

              {/* Mobile: Simplified benefit text */}
              <p className="sm:hidden text-center text-sm text-muted-foreground mb-4">
                🎁 10% descuento + ofertas exclusivas
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
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
                    overflow: 'hidden',
                  }}
                />

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 sm:py-4 bg-muted/50 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    disabled={status === 'loading'}
                    autoFocus
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-500 dark:text-red-400">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Suscribiendo...</span>
                    </>
                  ) : (
                    <>
                      <span>Obtener mi 10% de descuento</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-4 text-center space-y-3">
                <button
                  onClick={handleDismiss}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  No, gracias
                </button>
                
                <p className="text-xs text-muted-foreground">
                  Al suscribirte aceptas nuestra{' '}
                  <a
                    href="/privacidad"
                    className="underline hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    política de privacidad
                  </a>
                  .{' '}
                  <a
                    href="/promociones/newsletter-bienvenida"
                    className="underline hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver condiciones
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
