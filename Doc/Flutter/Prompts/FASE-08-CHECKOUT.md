# Prompt para Fase 08: Checkout y Pagos

## 📋 Contexto

Fases 01-07 completadas. Implementaré checkout completo con Stripe WebView y validación de cupones.

## 📚 Documentación

Lee: `Doc/Flutter/08-CHECKOUT-PAGOS.md`

## ⚠️ CRÍTICO: Stripe Integration

**Endpoint API:** `POST https://[tu-supabase-url]/functions/v1/create-checkout-session`

O endpoint de tu servidor para crear Stripe session.

## ✅ Tareas

### 8.1: Modelos Freezed

Crear en `lib/features/checkout/domain/models/`:

1. **shipping_address.dart**: Con validación isValid
2. **coupon.dart**: Con DiscountType enum, isValid helper
3. **coupon_validation.dart**: Con calculateDiscount()
4. **checkout_session.dart**: sessionId, url, orderId

**EJECUTAR:** build_runner

**Checklist:**
- [ ] 4 modelos creados
- [ ] build_runner OK

---

### 8.2: Repositories

**CouponsRepository** (domain + implementation):
- validateCoupon(code) → CouponValidation
- Llamar a RPC `validate_coupon`

**CheckoutRepository** (domain + implementation):
- createCheckoutSession() → CheckoutSession
- POST a API endpoint
- Incluir items, shipping, coupon

**Checklist:**
- [ ] 2 repositories
- [ ] RPC call cupones
- [ ] API call Stripe session

---

### 8.3: Providers

**coupons_providers.dart**:
```dart
@riverpod
CouponsRepository couponsRepository(...);

@riverpod
class AppliedCoupon extends _$AppliedCoupon {
  @override
  CouponValidation? build() => null;
  
  Future<void> validate(String code) async { /* ... */ }
  void clear() { state = null; }
}
```

**checkout_providers.dart**:
```dart
@riverpod
CheckoutRepository checkoutRepository(...);

@riverpod
class CheckoutController extends _$CheckoutController {
  Future<CheckoutSession> createSession({...}) async { /* ... */ }
}
```

**EJECUTAR:** build_runner

**Checklist:**
- [ ] Providers creados
- [ ] build_runner OK

---

### 8.4: CheckoutScreen

**UI:**
1. Sección: Información de contacto
2. Sección: Dirección de envío (ShippingForm)
3. Sección: Cupón (CouponInput)
4. Sección: Resumen (OrderSummary)
5. Botón: "Pagar con Stripe - €XX.XX"

**Flujo:**
1. Validar form
2. createSession()
3. Abrir StripeCheckoutWebView con URL
4. Detectar success/cancel

**Checklist:**
- [ ] 4 secciones
- [ ] Validaciones
- [ ] Integración cupones
- [ ] Navegación a WebView

---

### 8.5: StripeCheckoutWebView

**Archivo:** `lib/features/checkout/presentation/screens/stripe_checkout_webview.dart`

**WebView con:**
- NavigationDelegate detecta URLs
- Success: `/checkout/exito` → go(/checkout/success)
- Cancel: `/checkout/cancelado` → go(/checkout/cancelled)
- Progress indicator

**Checklist:**
- [ ] WebView configurado
- [ ] Detection de success/cancel
- [ ] Navegación correcta

---

### 8.6: CheckoutSuccessScreen

**UI:**
- Checkmark animado grande
- "¡Pedido Confirmado!"
- Número de pedido
- Botón "Ver Pedidos"

**Acción al entrar:**
```dart
@override
void initState() {
  super.initState();
  // Vaciar carrito
  Future.delayed(Duration.zero, () {
    ref.read(cartControllerProvider.notifier).clear();
  });
}
```

**Checklist:**
- [ ] UI completada
- [ ] Carrito se vacía
- [ ] Navegación funciona

---

### 8.7: Widgets

**CouponInput**: Input + botón "Aplicar" + mensajes success/error

**OrderSummary**: Lista items + cálculos (subtotal, envío, descuento, total)

**ShippingForm**: 7 campos con validaciones

**PaymentButton**: Botón primary con total, sticky al scroll

**Checklist:**
- [ ] 4 widgets creados
- [ ] CouponInput valida
- [ ] OrderSummary calcula
- [ ] ShippingForm valida
- [ ] PaymentButton sticky

---

## 🧪 Verificación

**Flujo completo:**
1. [ ] Añadir producto al carrito
2. [ ] Ir a carrito → checkout
3. [ ] Completar formulario envío
4. [ ] Aplicar cupón válido (test: "WELCOME10")
5. [ ] Verificar descuento aplicado
6. [ ] Tap "Pagar"
7. [ ] WebView abre Stripe
8. [ ] Usar tarjeta test: 4242 4242 4242 4242, MM/YY cualquier futuro, CVC 123
9. [ ] Confirmar pago
10. [ ] Redirige a success
11. [ ] Carrito vacío
12. [ ] Order en Supabase Dashboard

**Flujo cancelado:**
- [ ] Cancelar en Stripe
- [ ] Redirige a cancelled
- [ ] Carrito intacto

## ✅ Checklist Final

- [ ] Modelos + build_runner
- [ ] Repositories (coupons, checkout)
- [ ] Providers
- [ ] CheckoutScreen
- [ ] StripeCheckoutWebView
- [ ] CheckoutSuccessScreen
- [ ] CheckoutCancelledScreen
- [ ] Widgets (coupon, summary, form, button)
- [ ] Flujo completo funciona
- [ ] Orden creada en DB

## 📝 Reporte

```
✅ FASE 08 COMPLETADA

Tests: Checkout ✅, Stripe ✅, Cupones ✅, Success ✅
Estado: LISTO PARA FASE 09 (Pedidos)
```

## 🎯 Próximo

**FASE-09-PEDIDOS.md**
