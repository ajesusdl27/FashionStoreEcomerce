# Módulo Cupones - Análisis del Sistema

## 1. Modelo de Datos (de 015_create_coupons_table.sql)

### Tabla `coupons`
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,                -- Código del cupón (ej: VERANO20)
  stripe_coupon_id TEXT NOT NULL,           -- ID del cupón en Stripe
  discount_type TEXT NOT NULL,              -- 'fixed' | 'percentage'
  discount_value NUMERIC(10, 2) NOT NULL,   -- Valor del descuento
  min_purchase_amount NUMERIC(10, 2),       -- Compra mínima requerida
  max_discount_amount NUMERIC(10, 2),       -- Límite máximo (para %)
  start_date TIMESTAMPTZ,                   -- Fecha de inicio
  end_date TIMESTAMPTZ,                     -- Fecha de expiración
  max_uses INTEGER,                         -- Usos totales permitidos
  current_uses INTEGER DEFAULT 0,           -- Usos actuales
  max_uses_per_customer INTEGER DEFAULT 1,  -- Usos por cliente
  is_active BOOLEAN DEFAULT TRUE,           -- Estado activo/inactivo
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Tabla `coupon_usages`
```sql
CREATE TABLE coupon_usages (
  id UUID PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  customer_email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  used_at TIMESTAMPTZ,
  UNIQUE(coupon_id, customer_email, order_id)
);
```

---

## 2. Tipos de Descuento

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `fixed` | Descuento fijo en € | 10€ de descuento |
| `percentage` | Descuento porcentual | 20% de descuento |

### Cálculo del Descuento

```typescript
// Para porcentaje:
calculatedDiscount = cartTotal * (discountValue / 100);
if (maxDiscountAmount && calculatedDiscount > maxDiscountAmount) {
  calculatedDiscount = maxDiscountAmount;
}

// Para fijo:
calculatedDiscount = Math.min(discountValue, cartTotal);
```

---

## 3. API de Validación (api/coupons/validate.ts)

### Endpoint
```
POST /api/coupons/validate
```

### Request Body
```json
{
  "code": "VERANO20",
  "cartTotal": 75.50,
  "customerEmail": "usuario@email.com"
}
```

### Response Exitosa
```json
{
  "valid": true,
  "coupon": {
    "id": "uuid-del-cupon",
    "stripeCouponId": "promo_xxx",
    "discountType": "percentage",
    "discountValue": 20,
    "maxDiscountAmount": 15,
    "calculatedDiscount": 15.10
  }
}
```

### Response Error
```json
{
  "valid": false,
  "error": "Compra mínima de 50€ requerida"
}
```

---

## 4. Función RPC: validate_coupon

La validación se hace en Supabase con la función `validate_coupon`:

```sql
SELECT * FROM validate_coupon(
  p_code := 'VERANO20',
  p_cart_total := 75.50,
  p_customer_email := 'usuario@email.com'
);
```

### Validaciones que realiza:
1. ✅ Código existe
2. ✅ Cupón está activo (`is_active = TRUE`)
3. ✅ Fecha actual dentro del rango (`start_date` - `end_date`)
4. ✅ Monto del carrito >= monto mínimo
5. ✅ Usos globales no excedidos
6. ✅ Usos por cliente no excedidos

---

## 5. Función RPC: use_coupon

Registra el uso del cupón de forma atómica:

```sql
SELECT use_coupon(
  p_coupon_id := 'uuid-del-cupon',
  p_customer_email := 'usuario@email.com',
  p_order_id := 'uuid-del-pedido'
);
```

### Operaciones:
1. Bloquea la fila del cupón (`FOR UPDATE`)
2. Verifica límites nuevamente
3. Incrementa `current_uses`
4. Inserta registro en `coupon_usages`

---

## 6. Integración con Stripe Checkout

El cupón se aplica en Stripe usando `discounts` en la sesión de checkout:

```typescript
// En /api/checkout/session.ts
const session = await stripe.checkout.sessions.create({
  // ...
  discounts: couponId ? [{
    coupon: stripeCouponId  // ID del cupón en Stripe
  }] : undefined,
});
```

---

## 7. Visualización en UI (index.astro, pedidos/[id].astro)

### En página principal (promoción con cupón):
```astro
{heroPromotion.coupon_id && heroPromotion.coupons && (
  <div onclick="navigator.clipboard.writeText('${heroPromotion.coupons.code}')">
    <span>Cupón Descuento</span>
    <span>{heroPromotion.coupons.code}</span>
    <span>Click para copiar</span>
  </div>
)}
```

### En detalle de pedido:
```astro
{discountAmount > 0 && coupon && (
  <div>
    <span>Descuento ({coupon.code})</span>
    <span>-{formatCurrency(discountAmount)}</span>
  </div>
)}
```

---

## 8. Errores de Validación

| Código | Mensaje |
|--------|---------|
| `INVALID_CODE` | Código promocional no válido |
| `INACTIVE` | Este código ya no está activo |
| `NOT_STARTED` | Este código aún no está disponible |
| `EXPIRED` | Este código ha expirado |
| `MIN_PURCHASE` | Compra mínima de X€ requerida |
| `MAX_USES` | Este código ha alcanzado su límite de usos |
| `CUSTOMER_MAX` | Ya has usado este código el máximo de veces permitido |
