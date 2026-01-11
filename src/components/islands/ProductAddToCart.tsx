import { useState } from 'react';
import { addToCart } from '@/stores/cart';

interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface ProductAddToCartProps {
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  imageUrl: string;
  variants: Variant[];
}

export default function ProductAddToCart({
  productId,
  productName,
  productSlug,
  price,
  imageUrl,
  variants,
}: ProductAddToCartProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Sort variants by size order
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const sortedVariants = [...variants].sort((a, b) => 
    sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
  );

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    setStatus('loading');

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      addToCart({
        productId,
        productName,
        productSlug,
        variantId: selectedVariant.id,
        size: selectedVariant.size,
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

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(p);

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading text-sm uppercase tracking-wider">Talla</span>
          <button className="text-sm text-primary hover:underline">Guía de tallas</button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedVariants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              disabled={variant.stock <= 0}
              className={`
                px-4 py-3 min-w-[60px] border rounded-lg font-medium transition-all
                ${variant.stock <= 0 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-border' 
                  : selectedVariant?.id === variant.id
                    ? 'border-primary bg-primary/10'
                    : 'bg-card border-border hover:border-primary'
                }
              `}
            >
              {variant.size}
              {variant.stock > 0 && variant.stock <= 5 && (
                <span className="ml-1 text-yellow-400">⚡</span>
              )}
            </button>
          ))}
        </div>

        {/* Stock warning */}
        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
          <p className="mt-3 text-sm text-yellow-400">
            ⚡ {selectedVariant.stock} unidades disponibles
          </p>
        )}
      </div>

      {/* Add to Cart Button */}
      {selectedVariant ? (
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant.stock <= 0 || status === 'loading'}
          className={`
            w-full py-4 font-heading text-lg tracking-wider
            transition-all duration-300 flex items-center justify-center gap-2
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
            {selectedVariant.stock <= 0
              ? 'AGOTADO'
              : status === 'loading'
              ? 'AÑADIENDO...'
              : status === 'success'
              ? '¡AÑADIDO!'
              : status === 'error'
              ? 'ERROR'
              : `AÑADIR AL CARRITO - ${formatPrice(price)}`}
          </span>
        </button>
      ) : (
        <div className="py-4 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          Selecciona una talla para añadir al carrito
        </div>
      )}
    </div>
  );
}
