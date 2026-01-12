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

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        customerName: userData.name || prev.customerName,
        customerEmail: userData.email || prev.customerEmail,
        customerPhone: userData.phone || prev.customerPhone
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

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.customerName.trim()) {
          setError('El nombre es obligatorio');
          return false;
        }
        if (!formData.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
          setError('Introduce un email válido');
          return false;
        }
        return true;
      case 2:
        if (!formData.shippingAddress.trim()) {
          setError('La dirección es obligatoria');
          return false;
        }
        if (!formData.shippingCity.trim()) {
          setError('La ciudad es obligatoria');
          return false;
        }
        if (!formData.shippingPostalCode.trim() || !/^\d{5}$/.test(formData.shippingPostalCode)) {
          setError('Introduce un código postal válido (5 dígitos)');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              s === step
                ? 'bg-primary text-background scale-110'
                : s < step
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {i < 2 && (
            <div
              className={`w-16 md:w-24 h-1 mx-2 transition-all ${
                s < step ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const stepLabels = ['Datos personales', 'Dirección de envío', 'Resumen y pago'];

  return (
    <div className="lg:grid lg:grid-cols-5 lg:gap-12">
      {/* Form Section */}
      <div className="lg:col-span-3">
        {stepIndicator}
        
        <p className="text-center text-muted-foreground mb-8">
          Paso {step} de 3: <span className="text-foreground font-medium">{stepLabels[step - 1]}</span>
        </p>

        {error && (
          <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg mb-6 animate-shake">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
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
                  Teléfono <span className="text-muted-foreground">(opcional)</span>
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

          {/* Step 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
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

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-heading text-lg font-semibold mb-4">Datos de contacto</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nombre:</span> {formData.customerName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.customerEmail}</p>
                  {formData.customerPhone && (
                    <p><span className="text-muted-foreground">Teléfono:</span> {formData.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold mb-4">Dirección de envío</h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p>{formData.shippingAddress}</p>
                  <p>{formData.shippingPostalCode} {formData.shippingCity}</p>
                  <p>España</p>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold mb-4">Productos ({cart.length})</h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-muted-foreground">Talla {item.size} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="flex-1 py-3 px-6 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3 px-6 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <>
                    🔒 Pagar {formatPrice(total)}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-2 mt-8 lg:mt-0">
        <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
          <h2 className="font-heading text-xl font-semibold mb-6">Resumen del pedido</h2>

          {/* Items */}
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-muted-foreground text-background text-xs rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Talla: {item.size}</p>
                  <p className="font-medium text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className={shipping === 0 ? 'text-emerald-400 font-medium' : ''}>
                {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pago seguro con Stripe
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reserva de stock por 30 minutos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
