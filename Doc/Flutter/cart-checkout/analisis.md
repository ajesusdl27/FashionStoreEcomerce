# Análisis del Módulo: Carrito y Checkout

## 1. Visión General

### Descripción del Módulo
El módulo de carrito y checkout maneja todo el flujo de compra desde la selección de productos hasta el pago completado. Incluye:
- Carrito de compras con persistencia local
- Proceso de checkout en 3 pasos
- Integración con Stripe para pagos
- Sistema de cupones/descuentos
- Reserva temporal de stock
- Confirmación y emails de pedido

### Prioridad
**#3** - Crítico para completar el ciclo de compra.

---

## 2. Páginas Web Actuales

### 2.1 Carrito (`/carrito`)
**Archivo:** `src/pages/carrito.astro`

**Funcionalidades:**
- Lista de productos añadidos al carrito
- Controles de cantidad (incrementar/decrementar)
- Eliminar items individuales
- Resumen del pedido (subtotal, envío, total)
- Barra de progreso para envío gratis (umbral €50)
- Botón "Finalizar compra" → `/checkout`
- Estado vacío con enlace a productos

**Lógica JavaScript:**
```typescript
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.99;

// Renderizado dinámico de items
// Actualización de cantidades via updateQuantity()
// Eliminación via removeFromCart()
// Cálculo de envío y total
```

### 2.2 Checkout (`/checkout`)
**Archivo:** `src/pages/checkout.astro`

**Funcionalidades:**
- Pre-carga datos del usuario si está logueado
- Formulario multi-paso (React Island)
- Redirección a Stripe para pago
- Manejo de cupones promocionales

**Server-side:**
```typescript
// Obtener datos del perfil si está autenticado
if (user) {
  const profile = await authClient.rpc("get_customer_profile");
  userData = {
    name, email, phone, address, city, postalCode
  };
}
```

### 2.3 Checkout Éxito (`/checkout/exito`)
**Archivo:** `src/pages/checkout/exito.astro`

**Funcionalidades:**
- Verificación del pago con Stripe
- Actualización del estado del pedido a "paid"
- Registro de uso de cupón (si aplica)
- Envío de email de confirmación
- Limpieza del carrito (client-side)
- Mostrar resumen del pedido completado
- Enlace para descargar factura

### 2.4 Checkout Cancelado (`/checkout/cancelado`)
**Archivo:** `src/pages/checkout/cancelado.astro`

**Funcionalidades:**
- Expirar sesión de Stripe
- Restaurar stock reservado
- Actualizar pedido a "cancelled"
- Mensaje al usuario con opciones

---

## 3. Componente Principal: CheckoutForm

**Archivo:** `src/components/islands/CheckoutForm.tsx` (536 líneas)

### 3.1 Props y Estado
```typescript
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

// Estado interno
const [step, setStep] = useState(1);              // Paso actual (1-3)
const [formData, setFormData] = useState<FormData>(initialFormData);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Estado del cupón
const [couponCode, setCouponCode] = useState('');
const [couponLoading, setCouponLoading] = useState(false);
const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
```

### 3.2 Pasos del Formulario

**Paso 1: Datos personales**
- Nombre completo (requerido)
- Email (requerido)
- Teléfono (opcional)

**Paso 2: Dirección de envío**
- Dirección (requerido)
- Ciudad (requerido)
- Código postal (requerido)

**Paso 3: Confirmación**
- Resumen de datos
- Resumen de productos
- Aplicar cupón
- Botón "Pagar ahora"

### 3.3 Flujo de Cupones
```typescript
const handleApplyCoupon = async () => {
  const response = await fetch('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({
      code: couponCode,
      cartTotal: subtotal,
      customerEmail: formData.customerEmail
    })
  });
  
  if (data.valid) {
    setAppliedCoupon({
      code: couponCode,
      discountType: data.coupon.discountType,
      discountValue: data.coupon.discountValue,
      calculatedDiscount: data.coupon.calculatedDiscount
    });
  }
};
```

### 3.4 Submit y Redirección a Stripe
```typescript
const handleSubmit = async () => {
  const response = await fetch('/api/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify({
      items: cart.map(...),
      customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity, shippingPostalCode,
      couponCode: appliedCoupon?.code
    })
  });
  
  if (data.url) {
    window.location.href = data.url; // Redirect to Stripe
  }
};
```

---

## 4. API Endpoints

### 4.1 POST `/api/checkout/create-session`
**Archivo:** `src/pages/api/checkout/create-session.ts`

**Funciones:**
1. Validar campos requeridos
2. Calcular subtotal y envío
3. Validar cupón (si existe)
4. Reservar stock para cada item
5. Crear pedido en Supabase
6. Crear sesión de Stripe Checkout
7. Devolver URL de pago

**Lógica de reserva de stock:**
```typescript
for (const item of items) {
  const { data: success } = await dbClient.rpc('reserve_stock', {
    p_variant_id: item.variantId,
    p_quantity: item.quantity
  });
  
  if (!success) {
    // Rollback reservas anteriores
    for (const reserved of reservedItems) {
      await dbClient.rpc('restore_stock', {...});
    }
    return error("Stock insuficiente");
  }
}
```

**Configuración de Stripe:**
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: lineItems,
  success_url: `${origin}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/checkout/cancelado?order_id=${orderId}`,
  expires_at: expiresAt, // 30 minutos
  customer_email: customerEmail,
  metadata: { order_id, order_number, coupon_id },
  locale: 'es',
  discounts: validatedCoupon ? [{ coupon: stripeCouponId }] : undefined
});
```

### 4.2 POST `/api/webhooks/stripe`
**Archivo:** `src/pages/api/webhooks/stripe.ts`

**Eventos manejados:**

**checkout.session.completed:**
1. Verificar firma del webhook
2. Check idempotencia (evitar duplicados)
3. Actualizar pedido a "paid"
4. Registrar uso de cupón
5. Enviar email de confirmación

**checkout.session.expired:**
1. Restaurar stock reservado
2. Actualizar pedido a "cancelled"

### 4.3 POST `/api/coupons/validate`
**Valida cupón y calcula descuento.**

---

## 5. Modelo de Datos

### 5.1 Tabla: orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL,  -- Número legible (FS-000001)
  customer_id UUID REFERENCES auth.users(id),  -- Opcional
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'España',
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Tabla: order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL
);
```

### 5.3 Tabla: coupons
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_purchase NUMERIC(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_coupon_id TEXT,  -- Para Stripe Checkout
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.4 Funciones RPC Críticas
```sql
-- Reservar stock temporalmente
CREATE FUNCTION reserve_stock(p_variant_id UUID, p_quantity INT)
  RETURNS BOOLEAN AS $$
  UPDATE product_variants 
  SET stock = stock - p_quantity
  WHERE id = p_variant_id AND stock >= p_quantity
  RETURNING TRUE;
$$;

-- Restaurar stock
CREATE FUNCTION restore_stock(p_variant_id UUID, p_quantity INT)
  RETURNS VOID AS $$
  UPDATE product_variants 
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
$$;

-- Crear pedido con items (bypass RLS)
CREATE FUNCTION create_checkout_order(...)
  RETURNS JSONB AS $$ ... $$;

-- Actualizar estado del pedido
CREATE FUNCTION update_order_status(p_stripe_session_id TEXT, p_status TEXT)
  RETURNS VOID AS $$ ... $$;

-- Validar cupón
CREATE FUNCTION validate_coupon(p_code TEXT, p_cart_total NUMERIC, p_customer_email TEXT)
  RETURNS JSONB AS $$ ... $$;

-- Registrar uso de cupón
CREATE FUNCTION use_coupon(p_coupon_id UUID, p_customer_email TEXT, p_order_id UUID)
  RETURNS BOOLEAN AS $$ ... $$;
```

---

## 6. Flujo Completo de Checkout

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE                                 │
├─────────────────────────────────────────────────────────────┤
│  1. /carrito                                                │
│     - Ver items del carrito                                 │
│     - Ajustar cantidades                                    │
│     - Click "Finalizar compra"                              │
│                          ↓                                  │
│  2. /checkout                                               │
│     - Paso 1: Datos personales                              │
│     - Paso 2: Dirección de envío                            │
│     - Paso 3: Confirmar + cupón                             │
│     - Click "Pagar ahora"                                   │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                     SERVIDOR                                │
├─────────────────────────────────────────────────────────────┤
│  3. POST /api/checkout/create-session                       │
│     a) Validar cupón (si hay)                               │
│     b) Reservar stock (RPC reserve_stock)                   │
│     c) Crear pedido en DB (status: pending)                 │
│     d) Crear Stripe Checkout Session                        │
│     e) Devolver URL de Stripe                               │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                     STRIPE                                  │
├─────────────────────────────────────────────────────────────┤
│  4. Pasarela de pago Stripe                                 │
│     - Cliente introduce tarjeta                             │
│     - Pago procesado                                        │
│                          ↓                                  │
│     [ÉXITO] → Webhook checkout.session.completed            │
│     [CANCEL] → Redirect /checkout/cancelado                 │
│     [EXPIRE] → Webhook checkout.session.expired             │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                     POST-PAGO                               │
├─────────────────────────────────────────────────────────────┤
│  5a. Webhook (checkout.session.completed)                   │
│      - Actualizar pedido → "paid"                           │
│      - Registrar uso de cupón                               │
│      - Enviar email confirmación                            │
│                                                             │
│  5b. /checkout/exito (cliente redirigido)                   │
│      - Backup: actualizar estado si webhook no llegó        │
│      - Mostrar confirmación                                 │
│      - Limpiar carrito (localStorage)                       │
│                                                             │
│  5c. /checkout/cancelado o Webhook expired                  │
│      - Restaurar stock (RPC restore_stock)                  │
│      - Actualizar pedido → "cancelled"                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Constantes y Configuración

```typescript
// src/lib/stripe.ts
export const FREE_SHIPPING_THRESHOLD = 50;  // €50 para envío gratis
export const SHIPPING_COST = 499;           // 4.99€ en centavos
export const STOCK_RESERVATION_MINUTES = 30; // Tiempo de reserva

// Formatos de precio
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

// Formato de ID de pedido
function formatOrderId(orderNumber: number): string {
  return `FS-${orderNumber.toString().padStart(6, '0')}`;
}
```

---

## 8. Características Especiales

### 8.1 Reserva de Stock
- Stock se reserva al crear sesión de Stripe
- Expiración: 30 minutos (mínimo de Stripe)
- Restauración automática si:
  - Usuario cancela
  - Sesión expira
  - Error en el pago

### 8.2 Sistema de Cupones
- Tipos: porcentaje o cantidad fija
- Validaciones:
  - Fecha de validez
  - Mínimo de compra
  - Límite de usos
  - Uso único por email
- Integración con Stripe (descuento en checkout)

### 8.3 Idempotencia
- Webhook y success page ambos actualizan estado
- Check de estado existente antes de actualizar
- Constraint único en coupon_usages evita duplicados

### 8.4 Pre-llenado de Datos
- Usuario autenticado: datos del perfil
- Dirección guardada se pre-carga
- Email siempre editable

---

## 9. Emails Transaccionales

### 9.1 Confirmación de Pedido
```typescript
await sendOrderConfirmation({
  orderId: order.id,
  orderNumber: order.order_number,
  customerName, customerEmail,
  shippingAddress, shippingCity, shippingPostalCode,
  shippingCountry: 'España',
  totalAmount: order.total_amount,
  items: [{ productName, size, quantity, price }]
});
```

---

## 10. Consideraciones para Flutter

### 10.1 Carrito Local
| Web (Nanostores + LocalStorage) | Flutter |
|--------------------------------|---------|
| `$cart` atom | `CartNotifier` (ya creado) |
| `localStorage.setItem` | Hive (ya configurado) |

### 10.2 Checkout en Flutter

**Opciones para Stripe:**
1. **Stripe SDK Flutter** - `flutter_stripe`
   - Payment Sheet nativo
   - Apple Pay / Google Pay
   - No redirección externa

2. **WebView** (fallback)
   - Abrir URL de Stripe Checkout
   - Interceptar redirects de éxito/cancelación

### 10.3 Nuevo Endpoint Necesario
Para Flutter con Stripe SDK:
```typescript
// POST /api/checkout/create-payment-intent
// Devuelve: { clientSecret, orderId }
// En lugar de URL de redirect
```

### 10.4 Widgets a Crear
- `CartScreen` - Vista completa del carrito
- `CartItemTile` - Item individual editable
- `CartSummary` - Subtotal, envío, total
- `CheckoutScreen` - Formulario multi-paso
- `CheckoutStepper` - Indicador de pasos
- `ShippingForm` - Formulario de dirección
- `OrderSummaryCard` - Resumen en checkout
- `CouponInput` - Aplicar cupón
- `PaymentSheet` - Integración Stripe

### 10.5 Flujo Modificado para Flutter
```
1. CartScreen → CheckoutScreen
2. Formulario de datos
3. POST /api/checkout/create-payment-intent
4. Stripe PaymentSheet (nativo)
5. Confirmar pago en app
6. POST /api/checkout/confirm-payment
7. OrderConfirmationScreen
```

---

## 11. Seguridad

### 11.1 Validaciones Server-side
- Recalcular precios (no confiar en cliente)
- Verificar stock disponible
- Validar cupón en backend
- Verificar firma de webhooks Stripe

### 11.2 Protección de Datos
- Customer ID opcional (compra como invitado)
- Stripe maneja datos de tarjeta
- No almacenar datos de pago en DB

### 11.3 RLS Policies
- Pedidos: insert público, select por email/customer_id
- Order items: solo via RPC functions
- Cupones: validación por RPC
