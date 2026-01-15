import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartSubtotal, removeFromCart, updateQuantity, $isCartOpen, closeCart } from '@/stores/cart';
import QuantitySelector from '@/components/islands/QuantitySelector';
import PromotionBanner from '@/components/ui/PromotionBanner';

interface CartSlideOverProps {
  freeShippingThreshold?: number;
  shippingCost?: number;
}

export default function CartSlideOver({ 
  freeShippingThreshold = 50, 
  shippingCost = 4.99 
}: CartSlideOverProps) {
  const isOpen = useStore($isCartOpen);
  const items = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;

  // Listen for ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Slide-over Panel */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-xl font-semibold">
            Tu Carrito ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="touch-target flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress */}
        {!isFreeShipping && items.length > 0 && (
          <div className="px-6 py-3 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">
              ¡Añade <span className="font-bold text-primary">{formatPrice(amountToFreeShipping)}</span> más para envío GRATIS!
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {isFreeShipping && items.length > 0 && (
          <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium text-center">
              🎉 ¡Envío GRATIS!
            </p>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="text-primary hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li 
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-border last:border-0"
                >
                  {/* Image */}
                  <a 
                    href={`/productos/${item.productSlug}`}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </a>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <a 
                      href={`/productos/${item.productSlug}`}
                      className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Talla: {item.size}
                    </p>
                    <p className="font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty: number) => updateQuantity(item.id, qty)}
                      min={1}
                      max={10}
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Sidebar Promotion */}
        {items.length > 0 && (
          <div className="px-6 py-3 border-t border-border">
            <PromotionBanner 
              zone="cart_sidebar" 
              className="rounded-lg aspect-[4/1] max-h-[80px] text-sm"
            />
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className={isFreeShipping ? 'text-emerald-400' : ''}>
                  {isFreeShipping ? 'GRATIS' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(subtotal + (isFreeShipping ? 0 : shippingCost))}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <a
                href="/checkout"
                className="block w-full py-4 bg-primary text-primary-foreground text-center font-heading text-lg tracking-wider hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
              >
                FINALIZAR COMPRA
              </a>
              <button
                onClick={closeCart}
                className="block w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
