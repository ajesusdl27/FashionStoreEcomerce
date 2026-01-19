# Plan de Implementación: Carrito y Checkout

## 1. Alcance del Módulo

### Funcionalidades a Migrar
- ✅ Carrito de compras con persistencia
- ✅ Proceso de checkout multi-paso
- ✅ Integración de pagos (Stripe)
- ✅ Sistema de cupones/descuentos
- ✅ Reserva temporal de stock
- ✅ Confirmación y tracking de pedidos

### Funcionalidades Nuevas para Flutter
- Payment Sheet nativo (sin redirección web)
- Apple Pay / Google Pay
- Notificaciones push de estado
- Deep linking para volver a checkout

---

## 2. Arquitectura Flutter

### 2.1 Estructura de Carpetas
```
lib/
├── features/
│   └── cart/
│       ├── data/
│       │   ├── datasources/
│       │   │   ├── cart_local_datasource.dart     # Hive
│       │   │   └── checkout_remote_datasource.dart # API
│       │   ├── models/
│       │   │   ├── cart_item_model.dart
│       │   │   ├── order_model.dart
│       │   │   ├── order_item_model.dart
│       │   │   └── coupon_model.dart
│       │   └── repositories/
│       │       ├── cart_repository_impl.dart
│       │       └── checkout_repository_impl.dart
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── cart_item.dart
│       │   │   ├── order.dart
│       │   │   └── coupon.dart
│       │   ├── repositories/
│       │   │   ├── cart_repository.dart
│       │   │   └── checkout_repository.dart
│       │   └── usecases/
│       │       ├── add_to_cart.dart
│       │       ├── update_cart_quantity.dart
│       │       ├── remove_from_cart.dart
│       │       ├── clear_cart.dart
│       │       ├── validate_coupon.dart
│       │       ├── create_order.dart
│       │       └── process_payment.dart
│       └── presentation/
│           ├── providers/
│           │   ├── cart_provider.dart           # Ya existe (reutilizar)
│           │   ├── checkout_provider.dart
│           │   └── payment_provider.dart
│           ├── screens/
│           │   ├── cart_screen.dart
│           │   ├── checkout_screen.dart
│           │   ├── payment_screen.dart
│           │   └── order_confirmation_screen.dart
│           └── widgets/
│               ├── cart_item_tile.dart
│               ├── cart_summary.dart
│               ├── shipping_progress_bar.dart
│               ├── checkout_stepper.dart
│               ├── contact_form_step.dart
│               ├── shipping_form_step.dart
│               ├── confirmation_step.dart
│               ├── coupon_input.dart
│               └── order_summary_card.dart
```

### 2.2 Navegación
```dart
// Rutas del módulo
GoRoute(
  path: '/cart',
  builder: (context, state) => const CartScreen(),
),
GoRoute(
  path: '/checkout',
  builder: (context, state) => const CheckoutScreen(),
),
GoRoute(
  path: '/checkout/payment',
  builder: (context, state) {
    final orderId = state.extra as String;
    return PaymentScreen(orderId: orderId);
  },
),
GoRoute(
  path: '/checkout/success/:orderId',
  builder: (context, state) => OrderConfirmationScreen(
    orderId: state.pathParameters['orderId']!,
  ),
),
```

---

## 3. Modelos de Datos

### 3.1 CartItem (Local - Hive)
```dart
@HiveType(typeId: 1)
class CartItemModel extends HiveObject {
  @HiveField(0)
  final String variantId;
  
  @HiveField(1)
  final String productId;
  
  @HiveField(2)
  final String productName;
  
  @HiveField(3)
  final String productSlug;
  
  @HiveField(4)
  final String? imageUrl;
  
  @HiveField(5)
  final double price;
  
  @HiveField(6)
  final String size;
  
  @HiveField(7)
  int quantity;
  
  @HiveField(8)
  final int availableStock;
  
  // Calculado
  double get subtotal => price * quantity;
}
```

### 3.2 Order (Remote - Supabase)
```dart
@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    required int orderNumber,
    String? customerId,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    @Default('España') String shippingCountry,
    required double totalAmount,
    @Default('pending') String status,
    String? stripeSessionId,
    String? stripePaymentIntentId,
    required DateTime createdAt,
    List<OrderItem>? items,
  }) = _Order;
  
  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}
```

### 3.3 Coupon
```dart
@freezed
class Coupon with _$Coupon {
  const factory Coupon({
    required String id,
    required String code,
    required String discountType, // 'percentage' | 'fixed'
    required double discountValue,
    @Default(0) double minPurchase,
    int? maxUses,
    @Default(0) int usedCount,
    DateTime? validFrom,
    DateTime? validUntil,
    @Default(true) bool isActive,
  }) = _Coupon;
  
  // Calculado
  double calculateDiscount(double subtotal) {
    if (subtotal < minPurchase) return 0;
    if (discountType == 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return min(discountValue, subtotal);
  }
}
```

---

## 4. Providers (Riverpod)

### 4.1 Cart Provider (Ya existe - extender)
```dart
@riverpod
class Cart extends _$Cart {
  static const freeShippingThreshold = 50.0;
  static const shippingCost = 4.99;
  
  @override
  List<CartItem> build() {
    _loadFromHive();
    return [];
  }
  
  double get subtotal => state.fold(0, (sum, item) => sum + item.subtotal);
  
  double get shipping => subtotal >= freeShippingThreshold ? 0 : shippingCost;
  
  double get total => subtotal + shipping;
  
  int get itemCount => state.fold(0, (sum, item) => sum + item.quantity);
  
  double get progressToFreeShipping => 
      min(1.0, subtotal / freeShippingThreshold);
}
```

### 4.2 Checkout State
```dart
@freezed
class CheckoutState with _$CheckoutState {
  const factory CheckoutState({
    @Default(1) int currentStep,
    @Default(false) bool isLoading,
    String? error,
    
    // Step 1: Contact
    @Default('') String customerName,
    @Default('') String customerEmail,
    @Default('') String customerPhone,
    
    // Step 2: Shipping
    @Default('') String shippingAddress,
    @Default('') String shippingCity,
    @Default('') String shippingPostalCode,
    
    // Coupon
    Coupon? appliedCoupon,
    @Default(false) bool couponLoading,
    String? couponError,
    
    // Order
    Order? createdOrder,
    String? paymentIntentClientSecret,
  }) = _CheckoutState;
}

@riverpod
class Checkout extends _$Checkout {
  @override
  CheckoutState build() {
    _prefillUserData();
    return const CheckoutState();
  }
  
  void _prefillUserData() async {
    final user = ref.read(authProvider);
    if (user != null) {
      final profile = await ref.read(profileProvider.future);
      if (profile != null) {
        state = state.copyWith(
          customerName: profile.name,
          customerEmail: user.email,
          customerPhone: profile.phone ?? '',
          shippingAddress: profile.address ?? '',
          shippingCity: profile.city ?? '',
          shippingPostalCode: profile.postalCode ?? '',
        );
      }
    }
  }
  
  Future<void> validateCoupon(String code) async { ... }
  
  Future<void> createOrder() async { ... }
  
  Future<void> confirmPayment() async { ... }
}
```

---

## 5. Integración con Stripe

### 5.1 Dependencias
```yaml
dependencies:
  flutter_stripe: ^10.0.0
```

### 5.2 Inicialización
```dart
// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  Stripe.publishableKey = const String.fromEnvironment('STRIPE_PUBLISHABLE_KEY');
  await Stripe.instance.applySettings();
  
  runApp(const FashionStoreApp());
}
```

### 5.3 Flujo de Pago
```dart
class PaymentService {
  final Dio _dio;
  
  Future<PaymentResult> processPayment({
    required String orderId,
    required List<CartItem> items,
    required CheckoutFormData formData,
    String? couponCode,
  }) async {
    // 1. Crear PaymentIntent en servidor
    final response = await _dio.post('/api/checkout/create-payment-intent', 
      data: {
        'orderId': orderId,
        'items': items.map((i) => i.toJson()).toList(),
        ...formData.toJson(),
        'couponCode': couponCode,
      }
    );
    
    final clientSecret = response.data['clientSecret'];
    
    // 2. Mostrar PaymentSheet
    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        merchantDisplayName: 'Fashion Store',
        paymentIntentClientSecret: clientSecret,
        style: ThemeMode.system,
        googlePay: const PaymentSheetGooglePay(
          merchantCountryCode: 'ES',
          currencyCode: 'EUR',
          testEnv: true,
        ),
        applePay: const PaymentSheetApplePay(
          merchantCountryCode: 'ES',
        ),
      ),
    );
    
    // 3. Confirmar pago
    await Stripe.instance.presentPaymentSheet();
    
    // 4. Verificar estado del pedido
    return await _verifyOrderStatus(orderId);
  }
}
```

---

## 6. APIs Necesarias

### 6.1 Endpoint Existente (Modificar)
```typescript
// POST /api/checkout/create-session
// Ya funciona para web, mantener
```

### 6.2 Nuevo Endpoint para Flutter
```typescript
// POST /api/checkout/create-payment-intent
export async function POST({ request }) {
  const { orderId, items, customerName, customerEmail, ... , couponCode } = await request.json();
  
  // 1. Validar cupón
  // 2. Reservar stock
  // 3. Crear/actualizar pedido
  
  // 4. Crear PaymentIntent (en lugar de Session)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalInCents,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    metadata: { order_id: orderId }
  });
  
  // 5. Actualizar pedido con payment_intent_id
  await supabase.from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', orderId);
  
  return json({
    clientSecret: paymentIntent.client_secret,
    orderId
  });
}
```

### 6.3 Webhook Modificado
```typescript
// POST /api/webhooks/stripe
// Añadir soporte para payment_intent.succeeded
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const orderId = paymentIntent.metadata.order_id;
  
  await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: 'paid'
  });
  
  await sendOrderConfirmation(...);
  break;
}
```

---

## 7. Cronograma de Fases

### Fase 1: Preparación (2 días)
- Configurar modelos y entidades
- Adapters de Hive para CartItem
- Setup de flutter_stripe
- Crear nuevo endpoint API

### Fase 2: Diseño UI/UX (2 días)
- Wireframes de pantallas
- Sistema de colores para estados
- Componentes reutilizables
- Animaciones de transición

### Fase 3: Backend/Lógica (3 días)
- Repositorios y datasources
- Providers de estado
- Integración Stripe PaymentSheet
- Validación de cupones

### Fase 4: Frontend/UI (3 días)
- CartScreen completa
- CheckoutScreen multi-paso
- PaymentScreen con Stripe
- OrderConfirmationScreen
- Testing E2E

---

## 8. Dependencias entre Módulos

```
┌─────────────────┐
│  Auth Module    │ ← Perfil para pre-llenar datos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Catalog Module  │ ← Productos y variantes
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Cart Module    │────▶│ Orders Module   │
└─────────────────┘     │  (crear pedido) │
                        └─────────────────┘
```

---

## 9. Testing

### 9.1 Unit Tests
- `CartProvider` - add, remove, update quantity
- `Coupon.calculateDiscount()` - tipos de descuento
- Validaciones de formulario

### 9.2 Widget Tests
- `CartItemTile` - interacciones
- `CheckoutStepper` - navegación
- `CouponInput` - estados de carga/error

### 9.3 Integration Tests
- Flujo completo: Cart → Checkout → Payment
- Stripe en modo test

---

## 10. Notas de Migración

### 10.1 Mantener
- Lógica de reserva de stock (server-side)
- Validación de cupones (server-side)
- Webhooks de Stripe
- Emails de confirmación

### 10.2 Adaptar
- Stripe Checkout → PaymentSheet
- LocalStorage → Hive
- Nanostores → Riverpod
- Multi-step form → Stepper widget

### 10.3 Nuevo
- Apple Pay / Google Pay
- Guardar dirección para próximas compras
- Notificaciones push de estado
