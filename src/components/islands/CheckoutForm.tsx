import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartSubtotal } from '@/stores/cart';
import { formatPrice } from '@/lib/formatters';
import { 
  validateStep1, 
  validateStep2, 
  getFieldError, 
  cleanPostalCode, 
  cleanPhone,
  validateEmail,
  type FieldName 
} from '@/lib/validators';

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
  shippingCost?: number;
  freeShippingThreshold?: number;
}

const initialFormData: FormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingPostalCode: ''
};

export default function CheckoutForm({ 
  userData, 
  shippingCost = 4.99, 
  freeShippingThreshold = 50 
}: Props) {
  const cart = useStore($cart);
  const subtotal = useStore($cartSubtotal);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Field-level errors for real-time validation
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Set<FieldName>>(new Set());
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    calculatedDiscount: number;
  } | null>(null);

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const discount = appliedCoupon?.calculatedDiscount || 0;
  const total = subtotal + shipping - discount;

  // Initialize form
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Pre-fill form with user data if logged in
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
    if (cart.length === 0 && typeof window !== 'undefined' && !isInitializing) {
      window.location.href = '/carrito';
    }
  }, [cart, isInitializing]);

  // Validate field on change (debounced effect)
  const validateField = useCallback((field: FieldName, value: string) => {
    const error = getFieldError(field, value);
    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    // Clean specific fields
    let cleanedValue = value;
    if (field === 'shippingPostalCode') {
      cleanedValue = cleanPostalCode(value);
    } else if (field === 'customerPhone') {
      cleanedValue = cleanPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: cleanedValue }));
    setError(null);
    
    // Validate if field has been touched
    if (touchedFields.has(field as FieldName)) {
      validateField(field as FieldName, cleanedValue);
    }
  };

  const handleBlur = (field: FieldName) => {
    setTouchedFields(prev => new Set(prev).add(field));
    validateField(field, formData[field]);
  };

  const handleNextStep = () => {
    if (step === 1) {
      const validation = validateStep1({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone
      });
      
      if (!validation.isValid) {
        setFieldErrors(validation.errors);
        setError(validation.firstError);
        // Mark all step 1 fields as touched
        setTouchedFields(prev => new Set([...prev, 'customerName', 'customerEmail', 'customerPhone']));
        return;
      }
      setStep(2);
      setError(null);
    } else if (step === 2) {
      const validation = validateStep2({
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode
      });
      
      if (!validation.isValid) {
        setFieldErrors(validation.errors);
        setError(validation.firstError);
        // Mark all step 2 fields as touched
        setTouchedFields(prev => new Set([...prev, 'shippingAddress', 'shippingCity', 'shippingPostalCode']));
        return;
      }
      setStep(3);
      setError(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    // Validate email first if using coupon
    if (!formData.customerEmail || !validateEmail(formData.customerEmail)) {
      setCouponError('Introduce primero tu email para aplicar el cupón');
      return;
    }
    
    setCouponLoading(true);
    setCouponError(null);
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: subtotal,
          customerEmail: formData.customerEmail
        })
      });
      
      const data = await response.json();
      
      if (!data.valid) {
        setCouponError(data.error || 'Código no válido');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          calculatedDiscount: data.coupon.calculatedDiscount
        });
        setCouponError(null);
      }
    } catch (err) {
      setCouponError('Error al validar el cupón. Inténtalo de nuevo.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const mappedItems = cart.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        variantId: item.variantId,
        size: item.size,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity
      }));

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: mappedItems,
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim(),
          customerPhone: formData.customerPhone.trim(),
          shippingAddress: formData.shippingAddress.trim(),
          shippingCity: formData.shippingCity.trim(),
          shippingPostalCode: formData.shippingPostalCode.trim(),
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar el pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se pudo conectar con el sistema de pagos');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Hubo un error al procesar tu pedido';
      // Make error messages more user-friendly
      if (errorMessage.includes('Stock insuficiente')) {
        setError(errorMessage);
      } else if (errorMessage.includes('cupón') || errorMessage.includes('coupon')) {
        setError('El cupón ya no es válido. Elimínalo y continúa sin descuento.');
      } else {
        setError('No pudimos procesar tu pedido. Verifica tu conexión e inténtalo de nuevo.');
      }
      setLoading(false);
    }
  };

  // Input component with error state
  const FormInput = ({ 
    id, 
    label, 
    field, 
    type = 'text', 
    placeholder, 
    autoComplete,
    maxLength,
    required = true,
    helpText
  }: {
    id: string;
    label: string;
    field: FieldName;
    type?: string;
    placeholder: string;
    autoComplete?: string;
    maxLength?: number;
    required?: boolean;
    helpText?: string;
  }) => {
    const hasError = touchedFields.has(field) && fieldErrors[field];
    const isValid = touchedFields.has(field) && !fieldErrors[field] && formData[field];
    
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            id={id}
            value={formData[field]}
            onChange={(e) => updateField(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={`w-full px-4 py-3 bg-background border rounded-lg outline-none transition-all pr-10 ${
              hasError 
                ? 'border-accent focus:border-accent focus:ring-1 focus:ring-accent' 
                : isValid
                  ? 'border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                  : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
          />
          {/* Status icon */}
          {touchedFields.has(field) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isValid ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </div>
          )}
        </div>
        {hasError && (
          <p className="mt-1 text-xs text-accent flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {fieldErrors[field]}
          </p>
        )}
        {helpText && !hasError && (
          <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  };

  // Loading skeleton
  if (isInitializing) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-pulse">
        <div className="flex-1">
          <div className="h-10 bg-muted rounded-lg w-1/2 mx-auto mb-8" />
          <div className="admin-card space-y-4">
            <div className="h-6 bg-muted rounded w-1/3 mb-6" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg mt-8" />
          </div>
        </div>
        <div className="w-full lg:w-[400px]">
          <div className="admin-card space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Form Steps */}
      <div className="flex-1">
        {/* Steps Indicator - Improved design */}
        <div className="flex items-center justify-between mb-8 max-w-lg mx-auto bg-card border border-border rounded-xl p-4">
          {[
            { num: 1, label: 'Datos', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )},
            { num: 2, label: 'Envío', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )},
            { num: 3, label: 'Pago', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            )}
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                    step >= s.num 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.icon
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div 
                  className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                    step > s.num ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="admin-card">
          {step === 1 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="font-heading text-xl mb-6">Datos personales</h2>
              
              <FormInput
                id="name"
                label="Nombre completo"
                field="customerName"
                placeholder="Juan García López"
                autoComplete="name"
              />

              <FormInput
                id="email"
                label="Email"
                field="customerEmail"
                type="email"
                placeholder="juan.garcia@gmail.com"
                autoComplete="email"
                helpText="Recibirás la confirmación del pedido en este email"
              />

              <FormInput
                id="phone"
                label="Teléfono"
                field="customerPhone"
                type="tel"
                placeholder="612345678"
                autoComplete="tel"
                maxLength={9}
                required={false}
                helpText="Para contactarte si hay algún problema con el envío"
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="font-heading text-xl mb-6">Dirección de envío</h2>

              <FormInput
                id="address"
                label="Dirección"
                field="shippingAddress"
                placeholder="Calle Gran Vía 45, 2º B"
                autoComplete="street-address"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  id="city"
                  label="Ciudad"
                  field="shippingCity"
                  placeholder="Madrid"
                  autoComplete="address-level2"
                />

                <FormInput
                  id="postal"
                  label="Código postal"
                  field="shippingPostalCode"
                  placeholder="28013"
                  autoComplete="postal-code"
                  maxLength={5}
                  helpText="5 dígitos"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Solo realizamos envíos a España peninsular e islas.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fadeIn space-y-6">
              <h2 className="font-heading text-xl mb-6">Confirmar pedido</h2>
              
              {/* Time warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-sm">
                    Tienes 30 minutos para completar el pago
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 ml-7">
                  Los productos están reservados temporalmente para ti.
                </p>
              </div>
              
              {/* Order summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Contacto</h4>
                  <p className="font-medium">{formData.customerName}</p>
                  <p className="text-sm text-muted-foreground">{formData.customerEmail}</p>
                  {formData.customerPhone && (
                    <p className="text-sm text-muted-foreground">{formData.customerPhone}</p>
                  )}
                </div>
                <div className="h-px bg-border" />
                <div>
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Envío a</h4>
                  <p>{formData.shippingAddress}</p>
                  <p>{formData.shippingPostalCode} {formData.shippingCity}</p>
                  <p className="text-sm text-muted-foreground">España</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm">
                  <p className="font-bold text-primary mb-1">Pago seguro con Stripe</p>
                  <p className="text-muted-foreground">
                    Serás redirigido a la pasarela de pago segura. Aceptamos tarjetas Visa, Mastercard y más.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent text-accent animate-shake flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="admin-btn-secondary flex-1 py-3.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="admin-btn-primary flex-1 py-3.5"
              >
                Continuar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="admin-btn-primary flex-1 py-3.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirigiendo a pago...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pagar {formatPrice(total)}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[400px]">
        <div className="admin-card sticky top-24">
          <h3 className="font-heading text-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Resumen del pedido
          </h3>
          
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto no-scrollbar">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                  <p className="text-xs text-muted-foreground">Talla: {item.size}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                    <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
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
              <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                {shipping === 0 ? '¡Gratis!' : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Envío gratis a partir de {formatPrice(freeShippingThreshold)}
              </p>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {appliedCoupon.code}
                </span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
          </div>

          {/* Coupon Input */}
          <div className="py-4 border-t border-border">
            {!appliedCoupon ? (
              <div className="space-y-3">
                <label className="admin-label flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  ¿Tienes un código de descuento?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="CODIGO20"
                    className="admin-input flex-1 text-sm uppercase font-mono"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="admin-btn-secondary px-5 text-sm disabled:opacity-50"
                  >
                    {couponLoading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'Aplicar'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">{appliedCoupon.code}</span>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Cupón aplicado</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-muted-foreground hover:text-accent transition-colors p-2 hover:bg-muted rounded-lg"
                  title="Eliminar cupón"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-border">
            <span className="font-heading text-lg">Total</span>
            <div className="text-right">
              <span className="block font-heading text-2xl text-primary">{formatPrice(total)}</span>
              <span className="text-xs text-muted-foreground">IVA incluido</span>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Pago 100% seguro</p>
                <p className="text-xs text-muted-foreground">Encriptación SSL de 256 bits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
