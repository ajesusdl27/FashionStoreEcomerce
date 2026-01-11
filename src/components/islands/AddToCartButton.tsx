import { useState } from 'react';
import { addToCart } from '@/stores/cart';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  size: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export default function AddToCartButton({
  productId,
  productName,
  productSlug,
  variantId,
  size,
  price,
  imageUrl,
  stock,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    if (stock <= 0) return;

    setStatus('loading');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      addToCart({
        productId,
        productName,
        productSlug,
        variantId,
        size,
        price,
        imageUrl,
      });

      setStatus('success');

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Reset after animation
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const isDisabled = stock <= 0 || status === 'loading';

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        w-full py-4 font-heading text-lg tracking-wider
        transition-all duration-300 touch-target
        flex items-center justify-center gap-2
        ${status === 'success' 
          ? 'bg-emerald-500 text-white' 
          : status === 'error'
          ? 'bg-accent text-accent-foreground'
          : 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {status === 'loading' && (
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
      )}

      {status === 'success' && (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}

      {status === 'error' && (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      <span>
        {stock <= 0
          ? 'AGOTADO'
          : status === 'loading'
          ? 'AÑADIENDO...'
          : status === 'success'
          ? '¡AÑADIDO!'
          : status === 'error'
          ? 'ERROR'
          : 'AÑADIR AL CARRITO'}
      </span>
    </button>
  );
}
