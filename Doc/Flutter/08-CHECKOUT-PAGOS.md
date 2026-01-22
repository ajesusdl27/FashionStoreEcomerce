# Módulo 08: Checkout y Pagos con Stripe

## 🎯 Objetivo

Implementar el proceso completo de checkout: formulario de envío, validación de cupones, integración con Stripe Checkout via WebView y creación de pedidos.

## 🗄️ Backend (Supabase)

### Tablas Involucradas

**orders:**
- Todos los campos del pedido (customer, shipping, payment)
- `order_number`: BIGINT generado automáticamente (#1001, #1002...)
- `status`: 'pending', 'paid', 'processing', 'shipped', 'delivered'
- `stripe_session_id`: Para tracking

**order_items:**
- Items del pedido con snapshot de precio

**coupons:**
- Cupones de descuento

**coupon_usages:**
- Tracking de uso por usuario

### Funciones RPC Críticas

```sql
-- Validar cupón
validate_coupon(p_coupon_code TEXT) 
→ { valid BOOLEAN, message TEXT, discount_type TEXT, discount_value NUMERIC }

-- Reservar stock atómicamente
reserve_stock_atomic(p_items JSONB)
→ void (throw exception si no hay stock)

-- Liberar stock (si falla el pago)
release_stock_atomic(p_items JSONB)
→ void
```

### API Endpoint (Supabase Edge Function o tu servidor)

**POST /api/checkout/create-session**

Request:
```json
{
  "items": [
    { "product_id": "uuid", "variant_id": "uuid", "quantity": 2 }
  ],
  "customer_email": "user@example.com",
  "shipping_address": {
    "address": "Calle Example 123",
    "city": "Madrid",
    "postal_code": "28001",
    "country": "España"
  },
  "coupon_code": "WELCOME10" // opcional
}
```

Response:
```json
{
  "session_id": "cs_xxx",
  "url": "https://checkout.stripe.com/pay/cs_xxx",
  "order_id": "uuid"
}
```

## 🏗️ Arquitectura del Módulo

```
features/checkout/
├── data/
│   ├── datasources/
│   │   ├── stripe_checkout_datasource.dart
│   │   └── coupons_datasource.dart
│   └── repositories/
│       ├── checkout_repository_impl.dart
│       └── coupons_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── shipping_address.dart (Freezed)
│   │   ├── coupon.dart (Freezed)
│   │   ├── coupon_validation.dart (Freezed)
│   │   └── checkout_session.dart (Freezed)
│   └── repositories/
│       ├── checkout_repository.dart
│       └── coupons_repository.dart
│
├── providers/
│   ├── checkout_providers.dart
│   └── coupons_providers.dart
│
└── presentation/
    ├── screens/
    │   ├── checkout_screen.dart
    │   ├── stripe_checkout_webview.dart
    │   ├── checkout_success_screen.dart
    │   └── checkout_cancelled_screen.dart
    └── widgets/
        ├── shipping_form.dart
        ├── coupon_input.dart
        ├── order_summary.dart
        └── payment_button.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. ShippingAddress

```dart
@freezed
class ShippingAddress with _$ShippingAddress {
  const factory ShippingAddress({
    required String fullName,
    required String email,
    String? phone,
    required String address,
    required String city,
    required String postalCode,
    @Default('España') String country,
  }) = _ShippingAddress;
  
  factory ShippingAddress.fromJson(Map<String, dynamic> json) => 
      _$ShippingAddressFromJson(json);
  
  const ShippingAddress._();
  
  // Validación
  bool get isValid =>
      fullName.isNotEmpty &&
      email.isNotEmpty &&
      address.isNotEmpty &&
      city.isNotEmpty &&
      postalCode.isNotEmpty;
}
```

### 2. Coupon

```dart
enum DiscountType {
  percentage,  // Porcentaje (10, 20, 50)
  fixed;       // Cantidad fija (5€, 10€)
}

@freezed
class Coupon with _$Coupon {
  const factory Coupon({
    required String id,
    required String code,
    required DiscountType discountType,
    required double discountValue,
    double? minPurchaseAmount,
    int? maxUses,
    int? currentUses,
    DateTime? validFrom,
    DateTime? validUntil,
    @Default(true) bool isActive,
  }) = _Coupon;
  
  factory Coupon.fromJson(Map<String, dynamic> json) => 
      _$CouponFromJson(json);
  
  const Coupon._();
  
  bool get isValid {
    final now = DateTime.now();
    if (!isActive) return false;
    if (validFrom != null && now.isBefore(validFrom!)) return false;
    if (validUntil != null && now.isAfter(validUntil!)) return false;
    if (maxUses != null && currentUses != null && currentUses! >= maxUses!) {
      return false;
    }
    return true;
  }
}
```

### 3. CouponValidation

```dart
@freezed
class CouponValidation with _$CouponValidation {
  const factory CouponValidation({
    required bool valid,
    String? message,
    DiscountType? discountType,
    double? discountValue,
  }) = _CouponValidation;
  
  factory CouponValidation.fromJson(Map<String, dynamic> json) => 
      _$CouponValidationFromJson(json);
  
  const CouponValidation._();
  
  double calculateDiscount(double subtotal) {
    if (!valid || discountValue == null) return 0.0;
    
    switch (discountType) {
      case DiscountType.percentage:
        return subtotal * (discountValue! / 100);
      case DiscountType.fixed:
        return discountValue!;
      default:
        return 0.0;
    }
  }
}
```

### 4. CheckoutSession

```dart
@freezed
class CheckoutSession with _$CheckoutSession {
  const factory CheckoutSession({
    required String sessionId,
    required String url,
    required String orderId,
  }) = _CheckoutSession;
  
  factory CheckoutSession.fromJson(Map<String, dynamic> json) => 
      _$CheckoutSessionFromJson(json);
}
```

## 🔌 Repository (Data Layer)

### Coupons Repository

```dart
abstract class CouponsRepository {
  Future<CouponValidation> validateCoupon(String code);
}

class CouponsRepositoryImpl implements CouponsRepository {
  final CouponsDatasource _datasource;
  
  @override
  Future<CouponValidation> validateCoupon(String code) async {
    try {
      final result = await _datasource.validateCoupon(code);
      return CouponValidation.fromJson(result);
    } catch (e) {
      return const CouponValidation(
        valid: false,
        message: 'Error al validar el cupón',
      );
    }
  }
}
```

### Checkout Repository

```dart
abstract class CheckoutRepository {
  Future<CheckoutSession> createCheckoutSession({
    required List<CartItem> items,
    required ShippingAddress shippingAddress,
    String? couponCode,
  });
}

class CheckoutRepositoryImpl implements CheckoutRepository {
  final StripeCheckoutDatasource _datasource;
  
  @override
  Future<CheckoutSession> createCheckoutSession({
    required List<CartItem> items,
    required ShippingAddress shippingAddress,
    String? couponCode,
  }) async {
    // 1. Validar stock
    await _validateStock(items);
    
    // 2. Crear session en Stripe
    final session = await _datasource.createSession(
      items: items,
      shippingAddress: shippingAddress,
      couponCode: couponCode,
    );
    
    return CheckoutSession.fromJson(session);
  }
  
  Future<void> _validateStock(List<CartItem> items) async {
    // Validar que todos los items tienen stock suficiente
    // Throw exception si no hay stock
  }
}
```

## 🎣 Providers (Riverpod)

```dart
// Coupons
@riverpod
CouponsRepository couponsRepository(CouponsRepositoryRef ref) {
  final datasource = CouponsDatasource(SupabaseService.client);
  return CouponsRepositoryImpl(datasource);
}

// Estado del cupón aplicado
@riverpod
class AppliedCoupon extends _$AppliedCoupon {
  @override
  CouponValidation? build() => null;
  
  Future<void> validate(String code) async {
    if (code.isEmpty) {
      state = null;
      return;
    }
    
    final repository = ref.read(couponsRepositoryProvider);
    state = await repository.validateCoupon(code);
  }
  
  void clear() {
    state = null;
  }
}

// Checkout
@riverpod
CheckoutRepository checkoutRepository(CheckoutRepositoryRef ref) {
  final datasource = StripeCheckoutDatasource(SupabaseService.client);
  return CheckoutRepositoryImpl(datasource);
}

@riverpod
class CheckoutController extends _$CheckoutController {
  @override
  FutureOr<void> build() {}
  
  Future<CheckoutSession> createSession({
    required ShippingAddress shippingAddress,
    String? couponCode,
  }) async {
    final cart = ref.read(cartProvider);
    final repository = ref.read(checkoutRepositoryProvider);
    
    return repository.createCheckoutSession(
      items: cart.items,
      shippingAddress: shippingAddress,
      couponCode: couponCode,
    );
  }
}
```

## 🖼️ Pantallas de Presentación

### 1. CheckoutScreen

**Ruta**: `/checkout`

**Secciones del formulario:**

1. **Información de Contacto**
   - Nombre completo (pre-rellenado si está en profile)
   - Email (pre-rellenado)
   - Teléfono (opcional)

2. **Dirección de Envío**
   - Dirección completa (TextField multiline)
   - Ciudad
   - Código Postal (5 dígitos, validación)
   - País (fijo: "España" o selector)

3. **Cupón de Descuento**
   - Input con botón "Aplicar"
   - Mensaje de validación (success/error)
   - Mostrar descuento aplicado

4. **Resumen del Pedido**
   - Lista de items (nombre, talla, cantidad, precio)
   - Subtotal
   - Envío
   - Descuento (si hay cupón)
   - Total

5. **Botón de Pago**
   - "Pagar con Stripe - €XX.XX"
   - Disabled si form inválido
   - Loading state al procesar

**Validaciones:**
- Todos los campos requeridos completos
- Email válido
- Código postal 5 dígitos
- Stock disponible antes de proceder

**Flujo:**
1. Usuario completa formulario
2. Aplica cupón (opcional)
3. Tap en "Pagar"
4. Loading → Crear session en Stripe
5. Si éxito → Abrir StripeCheckoutWebView
6. Si error → Mostrar mensaje

### 2. StripeCheckoutWebView

**Ruta**: No es ruta, es modal/screen push

**Implementación:**
- WebViewController con URL de Stripe
- AppBar con título "Pago Seguro" + botón back
- Progress indicator mientras carga
- NavigationDelegate para detectar:
  - Success: URL contains `/checkout/exito`
  - Cancel: URL contains `/checkout/cancelado`

**Configuración WebView:**
```dart
WebViewController()
  ..setJavaScriptMode(JavaScriptMode.unrestricted)
  ..setNavigationDelegate(
    NavigationDelegate(
      onUrlChange: (change) {
        final url = change.url ?? '';
        
        if (url.contains('/checkout/exito')) {
          // Pago exitoso
          context.go('/checkout/success');
        } else if (url.contains('/checkout/cancelado')) {
          // Pago cancelado
          context.go('/checkout/cancelled');
        }
      },
      onProgress: (progress) {
        // Mostrar progress indicator
      },
    ),
  )
  ..loadRequest(Uri.parse(checkoutUrl))
```

### 3. CheckoutSuccessScreen

**Ruta**: `/checkout/success`

**Elementos:**
- Checkmark animado (grande, color success)
- Título "¡Pedido Confirmado!" (displayMedium)
- Mensaje "Recibirás un email con los detalles"
- Número de pedido (si está disponible): "#1234"
- Resumen básico del pedido
- AppButton.primary "Ver mis Pedidos"
- AppButton.ghost "Volver al Inicio"

**Acciones:**
- Al entrar: Vaciar carrito automáticamente
- Invalidar providers de cart
- Analytics: track purchase event

### 4. CheckoutCancelledScreen

**Ruta**: `/checkout/cancelled`

**Elementos:**
- Icon X circle (color warning/muted)
- Título "Pago Cancelado"
- Mensaje "No se realizó ningún cargo. Puedes intentarlo de nuevo."
- AppButton.primary "Volver al Carrito"
- AppButton.ghost "Volver al Inicio"

**Acciones:**
- Liberar stock reservado (si aplica)
- Mantener carrito intacto

## 🎨 Widgets Personalizados

### 1. ShippingForm

**Ubicación**: `lib/features/checkout/presentation/widgets/shipping_form.dart`

**Props:**
- initialAddress: ShippingAddress?
- onChanged: Function(ShippingAddress)

**Campos:**
- AppTextField para cada campo
- Validaciones inline
- Auto-guardar en onChanged (debounced)

**Especificaciones:**
- Usar Form + GlobalKey para validación
- Pre-rellenar desde profile si existe
- Separadores entre secciones

### 2. CouponInput

**Ubicación**: `lib/features/checkout/presentation/widgets/coupon_input.dart`

**Props:**
- onApply: Function(String)

**Layout:**
```
[ TextField: "Código de descuento" ] [ Aplicar ]

✓ Cupón aplicado: -10% (WELCOME10) [ X ]
```

**Estados:**
- Idle: Input + botón
- Loading: Spinner en botón
- Valid: Mensaje success + badge con código + botón quitar
- Invalid: Mensaje error debajo del input

**Especificaciones:**
- Botón "Aplicar": AppButton.secondary small
- Mensaje success: Color success
- Mensaje error: Color error
- Badge cupón: AppBadge.success con código

### 3. OrderSummary

**Ubicación**: `lib/features/checkout/presentation/widgets/order_summary.dart`

**Props:**
- cart: Cart
- discount: double
- freeShippingThreshold: double

**Layout:**
```
Resumen del Pedido
━━━━━━━━━━━━━━━━━━
[ Imagen ] Producto 1
           Talla M × 2    €50.00

[ Imagen ] Producto 2
           Talla L × 1    €25.00
━━━━━━━━━━━━━━━━━━
Subtotal              €75.00
Envío                 GRATIS
Descuento (WELCOME10) -€7.50
━━━━━━━━━━━━━━━━━━
Total                 €67.50
```

**Especificaciones:**
- Card con background card
- Items: Imagen thumbnail + info
- Cálculos: Align derecha
- Total: headingLarge, color primary
- Dividers entre secciones

### 4. PaymentButton

**Ubicación**: `lib/features/checkout/presentation/widgets/payment_button.dart`

**Props:**
- total: double
- onPressed: VoidCallback
- isLoading: bool
- isEnabled: bool

**Label:**
- "Pagar con Stripe - €XX.XX"
- Icon: credit-card

**Estados:**
- Enabled: AppButton.primary con glow
- Disabled: Opacity 0.5
- Loading: Spinner + "Procesando..."

**Especificaciones:**
- fullWidth: true
- Sticky bottom (si scroll > threshold)
- Shadow elevado cuando sticky

## 🔐 Seguridad y Validaciones

### Validación de Stock (Server-Side)

Antes de crear la session de Stripe:
1. Reservar stock atómicamente (RPC function)
2. Si falla → Retornar error "Stock insuficiente"
3. Si éxito → Continuar con Stripe

### Expiración de Stock Reservado

Stripe session expira en 24h. Webhook `checkout.session.expired` libera stock.

### Validación de Cupón

- Validar en server (RPC function)
- Verificar:
  - Cupón existe y activo
  - No ha excedido máximo de usos
  - Está dentro de fechas válidas
  - Cumple monto mínimo de compra

### CSRF y Auth

- Usar access token de Supabase en header
- Validar que order pertenece al usuario

## 💳 Integración con Stripe

### Configuración

```dart
// En main.dart, después de Supabase
Stripe.publishableKey = EnvConfig.stripePublishableKey;
await Stripe.instance.applySettings();
```

### Line Items en Stripe

Cada CartItem se convierte en:
```json
{
  "price_data": {
    "currency": "eur",
    "product_data": {
      "name": "Producto Nombre",
      "description": "Talla: M",
      "images": ["https://..."]
    },
    "unit_amount": 2500  // €25.00 en centavos
  },
  "quantity": 2
}
```

### URLs de Retorno

```
success_url: "fashionstore://checkout/exito?session_id={CHECKOUT_SESSION_ID}"
cancel_url: "fashionstore://checkout/cancelado"
```

### Webhooks

**Eventos a escuchar:**
- `checkout.session.completed` → Marcar order como 'paid', enviar email
- `checkout.session.expired` → Liberar stock reservado

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados y generados
- [ ] CouponsRepository con validación
- [ ] CheckoutRepository con creación de session
- [ ] Providers de checkout y cupones
- [ ] CheckoutScreen con formulario completo
- [ ] ShippingForm con validaciones
- [ ] CouponInput funciona
- [ ] OrderSummary muestra cálculos correctos
- [ ] PaymentButton con estados
- [ ] StripeCheckoutWebView abre Stripe
- [ ] Detección de success/cancel funciona
- [ ] CheckoutSuccessScreen vacía carrito
- [ ] CheckoutCancelledScreen mantiene carrito
- [ ] Deep links configurados (success/cancel URLs)

### Tests Manuales

1. **Flujo completo éxito:**
   - Ir a checkout
   - Completar formulario
   - Aplicar cupón válido
   - Tap "Pagar"
   - WebView abre Stripe
   - Usar tarjeta test: 4242 4242 4242 4242
   - Confirmar pago
   - Redirige a success
   - Carrito vacío
   - Order creada en DB

2. **Cupón inválido:**
   - Aplicar cupón inexistente
   - Muestra error
   - No aplica descuento

3. **Cancelar pago:**
   - Iniciar pago
   - Cancelar en Stripe
   - Redirige a cancelled
   - Carrito intacto

4. **Stock insuficiente:**
   - Intentar checkout con item sin stock
   - Muestra error antes de ir a Stripe

5. **Validaciones form:**
   - Dejar campos vacíos
   - Botón pagar disabled
   - Completar campos
   - Botón enabled

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 09: Pedidos y Devoluciones** - Implementar gestión de pedidos, tracking y sistema de returns.

---

**Tiempo Estimado**: 8-10 horas
**Complejidad**: Alta
**Dependencias**: Módulos 01-07 completados
