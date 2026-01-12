import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartSubtotal } from '@/stores/cart';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
}

interface Props {
  userData?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  } | null;
}

const initialFormData: FormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingPostalCode: ''
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

export default function CheckoutForm({ userData }: Props) {
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  // Pre-fill form with user data if logged in (including saved address)
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        customerName: userData.name || initialFormData.customerName,
        customerEmail: userData.email || initialFormData.customerEmail,
        customerPhone: userData.phone || initialFormData.customerPhone,
        shippingAddress: userData.address || initialFormData.shippingAddress,
        shippingCity: userData.city || initialFormData.shippingCity,
        shippingPostalCode: userData.postalCode || initialFormData.shippingPostalCode
      }));
    }
  }, [userData]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && typeof window !== 'undefined') {
      window.location.href = '/carrito';
    }
  }, [cart]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.customerName || !formData.customerEmail) {
        setError('Por favor completa todos los campos obligatorios');
        // Shake animation triggering would go here
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
        setError('Por favor completa la dirección de envío');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customerDetails: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone,
          },
          shippingDetails: {
            address: formData.shippingAddress,
            city: formData.shippingCity,
            postalCode: formData.shippingPostalCode,
          }
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Error al iniciar el pago');
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar tu pedido. Por favor inténtalo de nuevo.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Form Steps */}
      <div className="flex-1">
        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step >= s ? 'bg-primary text-background' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div 
                  className={`w-16 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass border border-border rounded-2xl p-6 md:p-8">
          {step === 1 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="font-heading text-xl mb-6">Paso 1 de 3: Datos personales</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateField('customerEmail', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.customerPhone}
                  onChange={(e) => updateField('customerPhone', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="612 345 678"
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="font-heading text-xl mb-6">Paso 2 de 3: Dirección de envío</h2>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.shippingAddress}
                  onChange={(e) => updateField('shippingAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Calle, número, piso..."
                  autoComplete="street-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.shippingCity}
                    onChange={(e) => updateField('shippingCity', e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Madrid"
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label htmlFor="postal" className="block text-sm font-medium mb-2">
                    Código postal *
                  </label>
                  <input
                    type="text"
                    id="postal"
                    value={formData.shippingPostalCode}
                    onChange={(e) => updateField('shippingPostalCode', e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="28001"
                    maxLength={5}
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn space-y-6">
              <h2 className="font-heading text-xl mb-6">Paso 3 de 3: Confirmación</h2>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Contacto</h4>
                  <p>{formData.customerName}</p>
                  <p>{formData.customerEmail}</p>
                  <p>{formData.customerPhone}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Envío a</h4>
                  <p>{formData.shippingAddress}</p>
                  <p>{formData.shippingPostalCode} {formData.shippingCity}</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-bold text-primary mb-1">Redirección segura</p>
                  <p className="text-muted-foreground">
                    Serás redirigido a la pasarela de pago segura de Stripe para completar tu compra.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={`mt-6 p-4 rounded-lg bg-accent/10 border border-accent text-accent animate-shake`}>
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-bold transition-colors"
              >
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Pagar ahora'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-96">
        <div className="glass border border-border rounded-xl p-6 sticky top-24">
          <h3 className="font-heading text-xl mb-4">Resumen del pedido</h3>
          
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">Talla: {item.selectedSize}</p>
                  <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 py-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-border">
            <span className="font-heading text-lg">Total</span>
            <div className="text-right">
              <span className="block font-heading text-2xl text-primary">{formatPrice(total)}</span>
              <span className="text-xs text-muted-foreground">IVA incluido</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               Pago seguro con Stripe
             </div>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               Reserva de stock por 30 minutos
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
