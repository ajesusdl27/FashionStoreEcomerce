import { useState, useEffect } from 'react';
import { addToCart } from '@/stores/cart';
import { formatPrice } from '@/lib/formatters';

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
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // Sort variants by size order
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const sortedVariants = [...variants].sort((a, b) => 
    sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
  );

  // Detect if product uses numeric sizes (shoes) or letter sizes (clothing)
  const isShoeSize = sortedVariants.some(v => !isNaN(Number(v.size)));

  // Detect scroll to show/hide sticky bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 400px
      setShowStickyBar(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate recommended size based on height and weight
  const calculateSize = () => {
    const h = parseInt(height);
    const w = parseInt(weight);

    if (!h || !w || h < 140 || h > 210 || w < 40 || w > 150) {
      setRecommendedSize('error');
      return;
    }

    // Size calculation logic
    if (w < 60 && h < 165) {
      setRecommendedSize('XS');
    } else if (w < 70 && h < 175) {
      setRecommendedSize('S o M');
    } else if (w < 75 && h < 180) {
      setRecommendedSize('M');
    } else if (w < 85 && h < 185) {
      setRecommendedSize('L');
    } else if (w < 95) {
      setRecommendedSize('XL');
    } else {
      setRecommendedSize('XXL');
    }
  };

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

  // Scroll to size selector when clicking the sticky bar without a size selected
  const scrollToSizeSelector = () => {
    const sizeSection = document.querySelector('[data-size-selector]');
    if (sizeSection) {
      sizeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <div className="space-y-6" data-size-selector>
        {/* Size Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading text-sm uppercase tracking-wider">Talla</span>
            <button 
              onClick={() => setShowSizeGuide(true)}
              className="text-sm text-primary hover:underline"
            >
              Guía de tallas
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortedVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock <= 0}
                aria-pressed={selectedVariant?.id === variant.id}
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
                  <span className="ml-1 text-yellow-400" aria-label="Pocas unidades">⚡</span>
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

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-[45] md:hidden
          bg-card/95 backdrop-blur-md border-t border-border
          px-4 py-3 transform transition-transform duration-300 ease-out
          ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3">
          {/* Product Thumbnail */}
          <img 
            src={imageUrl} 
            alt={productName}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-border"
          />
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{productName}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-primary font-bold">{formatPrice(price)}</span>
              {selectedVariant && (
                <span className="text-muted-foreground">
                  Talla: <span className="text-foreground">{selectedVariant.size}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {selectedVariant ? (
            <button
              onClick={handleAddToCart}
              disabled={selectedVariant.stock <= 0 || status === 'loading'}
              className={`
                px-4 py-2.5 rounded-lg font-heading text-sm tracking-wider flex-shrink-0
                transition-all duration-300 flex items-center gap-2
                ${status === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-primary text-primary-foreground'
                }
                disabled:opacity-50
              `}
            >
              {status === 'loading' && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {status === 'success' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : status === 'idle' && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              )}
              <span>{status === 'success' ? '¡LISTO!' : 'AÑADIR'}</span>
            </button>
          ) : (
            <button
              onClick={scrollToSizeSelector}
              className="px-4 py-2.5 rounded-lg font-heading text-sm tracking-wider flex-shrink-0 bg-primary/20 text-primary border border-primary/30"
            >
              ELIGE TALLA
            </button>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div 
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal */}
          <div 
            className="relative bg-card border border-border rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold">Guía de Tallas</h3>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {isShoeSize ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    Mide tu pie desde el talón hasta la punta del dedo más largo. Usa la tabla para encontrar tu talla.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">EU</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">US</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">UK</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">CM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['36', '4', '3.5', '22.5'],
                          ['37', '5', '4', '23'],
                          ['38', '5.5', '5', '24'],
                          ['39', '6.5', '6', '24.5'],
                          ['40', '7', '6.5', '25'],
                          ['41', '8', '7', '26'],
                          ['42', '8.5', '8', '26.5'],
                          ['43', '9.5', '9', '27.5'],
                          ['44', '10', '9.5', '28'],
                          ['45', '11', '10.5', '29'],
                          ['46', '12', '11', '30'],
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                            {row.map((cell, j) => (
                              <td key={j} className={`py-2 px-3 ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ingresa tu altura y peso para obtener una recomendación personalizada de talla.
                  </p>
                  
                  {/* Size Calculator Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium mb-2">
                          Altura (cm)
                        </label>
                        <input
                          type="number"
                          id="height"
                          value={height}
                          onChange={(e) => { setHeight(e.target.value); setRecommendedSize(null); }}
                          placeholder="175"
                          min="140"
                          max="210"
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium mb-2">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          value={weight}
                          onChange={(e) => { setWeight(e.target.value); setRecommendedSize(null); }}
                          placeholder="70"
                          min="40"
                          max="150"
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={calculateSize}
                      disabled={!height || !weight}
                      className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Calcular mi talla
                    </button>

                    {/* Recommendation Result */}
                    {recommendedSize && recommendedSize !== 'error' && (
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-center">
                          <span className="text-primary font-medium text-lg">✓ Te recomendamos la talla </span>
                          <span className="text-primary font-bold text-xl">{recommendedSize}</span>
                          <span className="text-primary font-medium text-lg"> basado en tus datos.</span>
                        </p>
                      </div>
                    )}

                    {recommendedSize === 'error' && (
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                        <p className="text-accent text-sm text-center">
                          Por favor, ingresa valores válidos (altura: 140-210cm, peso: 40-150kg)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Tips */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm">
                  <span className="text-primary font-medium"> Consejo:</span>{' '}
                  Si tienes dudas, contacta con nosotros y te ayudaremos a encontrar tu talla perfecta.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
