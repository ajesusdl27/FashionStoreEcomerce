import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { FocusTrap } from 'focus-trap-react';
import { $cart, $cartSubtotal, removeFromCart, updateQuantity, $isCartOpen, closeCart } from '@/stores/cart';
import QuantitySelector from '@/components/islands/QuantitySelector';
import PromotionBanner from '@/components/ui/PromotionBanner';
import { formatPrice } from '@/lib/formatters';

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop - aria-hidden to prevent screen reader focus */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Panel with Focus Trap */}
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          initialFocus: () => closeButtonRef.current || undefined,
          returnFocusOnDeactivate: true,
          escapeDeactivates: true,
          onDeactivate: closeCart,
          clickOutsideDeactivates: true,
        }}
      >
        <div 
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 id="cart-title" className="font-heading text-xl font-semibold">
                  Tu Carrito
                </h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeCart}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
              aria-label="Cerrar carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        {/* Free Shipping Progress */}
        {!isFreeShipping && items.length > 0 && (
          <div className="px-6 py-4 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-muted-foreground">
                ¡Añade <span className="font-bold text-primary">{formatPrice(amountToFreeShipping)}</span> más para envío GRATIS!
              </p>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {isFreeShipping && items.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-b border-emerald-500/20">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ¡Felicidades! Tienes envío GRATIS
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2">Tu carrito está vacío</h3>
              <p className="text-sm text-muted-foreground mb-6">Añade productos para empezar tu compra</p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li 
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  {/* Image */}
                  <a 
                    href={`/productos/${item.productSlug}`}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
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
                      className="font-medium text-base hover:text-primary transition-colors line-clamp-2 block mb-1"
                    >
                      {item.productName}
                    </a>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
                        Talla {item.size}
                      </span>
                    </div>
                    <p className="font-bold text-lg text-primary">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      aria-label="Eliminar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty: number) => updateQuantity(item.id, qty)}
                      min={1}
                      max={10}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Sidebar Promotion */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <PromotionBanner 
              zone="cart_sidebar" 
              className="rounded-lg aspect-[4/1] max-h-[80px] text-sm overflow-hidden"
            />
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4 bg-gradient-to-b from-transparent to-muted/10">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Envío
                </span>
                <span className={`font-medium ${isFreeShipping ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                  {isFreeShipping ? 'GRATIS' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <div className="flex justify-between items-center font-bold text-xl pt-1">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal + (isFreeShipping ? 0 : shippingCost))}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href="/checkout"
                className="block w-full py-4 bg-primary text-primary-foreground text-center font-heading text-lg tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FINALIZAR COMPRA
              </a>
              <button
                onClick={closeCart}
                className="block w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        )}
        </div>
      </FocusTrap>
    </div>
  );
}
