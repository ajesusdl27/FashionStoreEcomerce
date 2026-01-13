import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cartCount, toggleCart } from '@/stores/cart';

export default function CartIcon() {
  const count = useStore($cartCount);
  const [isMounted, setIsMounted] = useState(false);

  // Only show client-side count after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use 0 during SSR/initial render, actual count after mount
  const displayCount = isMounted ? count : 0;

  return (
    <button
      onClick={toggleCart}
      className="relative touch-target flex items-center justify-center hover:text-primary transition-colors"
      aria-label={`Carrito (${displayCount} items)`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      
      {displayCount > 0 && (
        <span 
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle"
          key={displayCount} // Force re-render for animation
        >
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
}

