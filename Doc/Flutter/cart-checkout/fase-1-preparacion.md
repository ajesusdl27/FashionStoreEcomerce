# Fase 1: Preparación - Carrito y Checkout

## 1. Objetivos de la Fase
- Crear modelos de datos para carrito, pedidos y cupones
- Configurar persistencia local con Hive
- Setup de Stripe SDK para Flutter
- Crear endpoint API para Payment Intent

---

## 2. Modelos de Datos

### 2.1 CartItem Model (Hive)

**Archivo:** `lib/features/cart/data/models/cart_item_model.dart`

```dart
import 'package:hive/hive.dart';

part 'cart_item_model.g.dart';

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
  final double? originalPrice; // Para mostrar descuentos

  @HiveField(7)
  final String size;

  @HiveField(8)
  int quantity;

  @HiveField(9)
  final int availableStock;

  @HiveField(10)
  final DateTime addedAt;

  CartItemModel({
    required this.variantId,
    required this.productId,
    required this.productName,
    required this.productSlug,
    this.imageUrl,
    required this.price,
    this.originalPrice,
    required this.size,
    required this.quantity,
    required this.availableStock,
    DateTime? addedAt,
  }) : addedAt = addedAt ?? DateTime.now();

  // Getters calculados
  double get subtotal => price * quantity;
  
  bool get hasDiscount => originalPrice != null && originalPrice! > price;
  
  double get discountPercentage {
    if (!hasDiscount) return 0;
    return ((originalPrice! - price) / originalPrice! * 100).roundToDouble();
  }

  bool get canIncrement => quantity < availableStock;
  bool get canDecrement => quantity > 1;

  // Copyy
  CartItemModel copyWith({
    String? variantId,
    String? productId,
    String? productName,
    String? productSlug,
    String? imageUrl,
    double? price,
    double? originalPrice,
    String? size,
    int? quantity,
    int? availableStock,
    DateTime? addedAt,
  }) {
    return CartItemModel(
      variantId: variantId ?? this.variantId,
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      productSlug: productSlug ?? this.productSlug,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      size: size ?? this.size,
      quantity: quantity ?? this.quantity,
      availableStock: availableStock ?? this.availableStock,
      addedAt: addedAt ?? this.addedAt,
    );
  }

  // Serialización para API
  Map<String, dynamic> toApiJson() {
    return {
      'variantId': variantId,
      'productId': productId,
      'name': productName,
      'price': price,
      'quantity': quantity,
      'size': size,
    };
  }

  // Factory desde ProductVariant
  factory CartItemModel.fromProduct({
    required String variantId,
    required String productId,
    required String productName,
    required String productSlug,
    String? imageUrl,
    required double price,
    double? originalPrice,
    required String size,
    required int stock,
    int quantity = 1,
  }) {
    return CartItemModel(
      variantId: variantId,
      productId: productId,
      productName: productName,
      productSlug: productSlug,
      imageUrl: imageUrl,
      price: price,
      originalPrice: originalPrice,
      size: size,
      quantity: quantity,
      availableStock: stock,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartItemModel &&
          runtimeType == other.runtimeType &&
          variantId == other.variantId;

  @override
  int get hashCode => variantId.hashCode;
}
```

### 2.2 Order Model (Freezed)

**Archivo:** `lib/features/cart/data/models/order_model.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'order_item_model.dart';

part 'order_model.freezed.dart';
part 'order_model.g.dart';

@freezed
class OrderModel with _$OrderModel {
  const OrderModel._();

  const factory OrderModel({
    required String id,
    @JsonKey(name: 'order_number') required int orderNumber,
    @JsonKey(name: 'customer_id') String? customerId,
    @JsonKey(name: 'customer_name') required String customerName,
    @JsonKey(name: 'customer_email') required String customerEmail,
    @JsonKey(name: 'customer_phone') String? customerPhone,
    @JsonKey(name: 'shipping_address') required String shippingAddress,
    @JsonKey(name: 'shipping_city') required String shippingCity,
    @JsonKey(name: 'shipping_postal_code') required String shippingPostalCode,
    @JsonKey(name: 'shipping_country') @Default('España') String shippingCountry,
    @JsonKey(name: 'total_amount') required double totalAmount,
    @Default('pending') String status,
    @JsonKey(name: 'stripe_session_id') String? stripeSessionId,
    @JsonKey(name: 'stripe_payment_intent_id') String? stripePaymentIntentId,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'order_items') List<OrderItemModel>? items,
  }) = _OrderModel;

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(json);

  // Getters calculados
  String get formattedOrderNumber => 'FS-${orderNumber.toString().padLeft(6, '0')}';

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pendiente de pago';
      case 'paid':
        return 'Pagado';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      case 'return_requested':
        return 'Devolución solicitada';
      case 'returned':
        return 'Devuelto';
      default:
        return status;
    }
  }

  bool get isPending => status == 'pending';
  bool get isPaid => status == 'paid';
  bool get isShipped => status == 'shipped';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
  bool get canBeCancelled => status == 'pending' || status == 'paid';
}
```

### 2.3 OrderItem Model

**Archivo:** `lib/features/cart/data/models/order_item_model.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'order_item_model.freezed.dart';
part 'order_item_model.g.dart';

@freezed
class OrderItemModel with _$OrderItemModel {
  const OrderItemModel._();

  const factory OrderItemModel({
    required String id,
    @JsonKey(name: 'order_id') required String orderId,
    @JsonKey(name: 'product_id') String? productId,
    @JsonKey(name: 'variant_id') String? variantId,
    required int quantity,
    @JsonKey(name: 'price_at_purchase') required double priceAtPurchase,
    
    // Joined fields
    @JsonKey(name: 'product_name') String? productName,
    @JsonKey(name: 'product_slug') String? productSlug,
    @JsonKey(name: 'product_image') String? productImage,
    @JsonKey(name: 'variant_size') String? variantSize,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);

  // Getters
  double get subtotal => priceAtPurchase * quantity;
}
```

### 2.4 Coupon Model

**Archivo:** `lib/features/cart/data/models/coupon_model.dart`

```dart
import 'dart:math';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'coupon_model.freezed.dart';
part 'coupon_model.g.dart';

@freezed
class CouponModel with _$CouponModel {
  const CouponModel._();

  const factory CouponModel({
    required String id,
    required String code,
    @JsonKey(name: 'discount_type') required String discountType,
    @JsonKey(name: 'discount_value') required double discountValue,
    @JsonKey(name: 'min_purchase') @Default(0) double minPurchase,
    @JsonKey(name: 'max_uses') int? maxUses,
    @JsonKey(name: 'used_count') @Default(0) int usedCount,
    @JsonKey(name: 'valid_from') DateTime? validFrom,
    @JsonKey(name: 'valid_until') DateTime? validUntil,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'stripe_coupon_id') String? stripeCouponId,
  }) = _CouponModel;

  factory CouponModel.fromJson(Map<String, dynamic> json) =>
      _$CouponModelFromJson(json);

  // Validaciones
  bool get isPercentage => discountType == 'percentage';
  bool get isFixed => discountType == 'fixed';

  bool get isExpired {
    if (validUntil == null) return false;
    return DateTime.now().isAfter(validUntil!);
  }

  bool get isNotYetValid {
    if (validFrom == null) return false;
    return DateTime.now().isBefore(validFrom!);
  }

  bool get hasUsesRemaining {
    if (maxUses == null) return true;
    return usedCount < maxUses!;
  }

  bool get isValid {
    return isActive && !isExpired && !isNotYetValid && hasUsesRemaining;
  }

  bool canApplyTo(double subtotal) {
    return subtotal >= minPurchase;
  }

  // Calcular descuento
  double calculateDiscount(double subtotal) {
    if (!canApplyTo(subtotal)) return 0;
    
    if (isPercentage) {
      return (subtotal * (discountValue / 100)).roundToDouble();
    }
    
    return min(discountValue, subtotal);
  }

  // Descripción amigable
  String get description {
    if (isPercentage) {
      return '${discountValue.toInt()}% de descuento';
    }
    return '${discountValue.toStringAsFixed(2)}€ de descuento';
  }
}

// Modelo para cupón validado (respuesta de API)
@freezed
class ValidatedCoupon with _$ValidatedCoupon {
  const factory ValidatedCoupon({
    required bool valid,
    String? message,
    CouponModel? coupon,
    double? calculatedDiscount,
  }) = _ValidatedCoupon;

  factory ValidatedCoupon.fromJson(Map<String, dynamic> json) =>
      _$ValidatedCouponFromJson(json);
}
```

### 2.5 Checkout Form Data

**Archivo:** `lib/features/cart/data/models/checkout_form_data.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'checkout_form_data.freezed.dart';
part 'checkout_form_data.g.dart';

@freezed
class CheckoutFormData with _$CheckoutFormData {
  const CheckoutFormData._();

  const factory CheckoutFormData({
    // Step 1: Contact
    @Default('') String customerName,
    @Default('') String customerEmail,
    @Default('') String customerPhone,
    
    // Step 2: Shipping
    @Default('') String shippingAddress,
    @Default('') String shippingCity,
    @Default('') String shippingPostalCode,
    @Default('España') String shippingCountry,
    
    // Optional
    String? notes,
    @Default(false) bool saveAddress,
  }) = _CheckoutFormData;

  factory CheckoutFormData.fromJson(Map<String, dynamic> json) =>
      _$CheckoutFormDataFromJson(json);

  // Validaciones
  bool get isStep1Valid {
    return customerName.trim().isNotEmpty &&
           _isValidEmail(customerEmail);
  }

  bool get isStep2Valid {
    return shippingAddress.trim().isNotEmpty &&
           shippingCity.trim().isNotEmpty &&
           _isValidPostalCode(shippingPostalCode);
  }

  bool get isComplete => isStep1Valid && isStep2Valid;

  static bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  static bool _isValidPostalCode(String code) {
    // Código postal español: 5 dígitos
    return RegExp(r'^\d{5}$').hasMatch(code);
  }

  // Para API
  Map<String, dynamic> toApiJson() {
    return {
      'customerName': customerName,
      'customerEmail': customerEmail,
      'customerPhone': customerPhone,
      'shippingAddress': shippingAddress,
      'shippingCity': shippingCity,
      'shippingPostalCode': shippingPostalCode,
      'shippingCountry': shippingCountry,
    };
  }
}
```

---

## 3. Entidades de Dominio

### 3.1 CartItem Entity

**Archivo:** `lib/features/cart/domain/entities/cart_item.dart`

```dart
class CartItem {
  final String variantId;
  final String productId;
  final String productName;
  final String productSlug;
  final String? imageUrl;
  final double price;
  final double? originalPrice;
  final String size;
  final int quantity;
  final int availableStock;
  final DateTime addedAt;

  const CartItem({
    required this.variantId,
    required this.productId,
    required this.productName,
    required this.productSlug,
    this.imageUrl,
    required this.price,
    this.originalPrice,
    required this.size,
    required this.quantity,
    required this.availableStock,
    required this.addedAt,
  });

  double get subtotal => price * quantity;
  bool get hasDiscount => originalPrice != null && originalPrice! > price;
  bool get canIncrement => quantity < availableStock;
  bool get canDecrement => quantity > 1;
}
```

### 3.2 Order Entity

**Archivo:** `lib/features/cart/domain/entities/order.dart`

```dart
import 'order_item.dart';

enum OrderStatus {
  pending,
  paid,
  shipped,
  delivered,
  cancelled,
  returnRequested,
  returned,
}

class Order {
  final String id;
  final int orderNumber;
  final String? customerId;
  final String customerName;
  final String customerEmail;
  final String? customerPhone;
  final String shippingAddress;
  final String shippingCity;
  final String shippingPostalCode;
  final String shippingCountry;
  final double totalAmount;
  final OrderStatus status;
  final String? stripeSessionId;
  final String? stripePaymentIntentId;
  final DateTime createdAt;
  final List<OrderItem>? items;

  const Order({
    required this.id,
    required this.orderNumber,
    this.customerId,
    required this.customerName,
    required this.customerEmail,
    this.customerPhone,
    required this.shippingAddress,
    required this.shippingCity,
    required this.shippingPostalCode,
    this.shippingCountry = 'España',
    required this.totalAmount,
    required this.status,
    this.stripeSessionId,
    this.stripePaymentIntentId,
    required this.createdAt,
    this.items,
  });

  String get formattedOrderNumber => 'FS-${orderNumber.toString().padLeft(6, '0')}';
  
  bool get canBeCancelled => 
      status == OrderStatus.pending || status == OrderStatus.paid;
}
```

---

## 4. Configuración de Hive

### 4.1 Registro de Adapters

**Archivo:** `lib/core/storage/hive_config.dart`

```dart
import 'package:hive_flutter/hive_flutter.dart';
import '../../features/cart/data/models/cart_item_model.dart';

class HiveConfig {
  static const String cartBoxName = 'cart';
  
  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Registrar adapters
    Hive.registerAdapter(CartItemModelAdapter());
    
    // Abrir boxes
    await Hive.openBox<CartItemModel>(cartBoxName);
  }
  
  static Box<CartItemModel> get cartBox => Hive.box<CartItemModel>(cartBoxName);
  
  static Future<void> clearAll() async {
    await cartBox.clear();
  }
}
```

### 4.2 Actualizar main.dart

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Hive
  await HiveConfig.init();
  
  // Supabase
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );
  
  // Stripe
  Stripe.publishableKey = const String.fromEnvironment('STRIPE_PUBLISHABLE_KEY');
  await Stripe.instance.applySettings();
  
  runApp(
    const ProviderScope(
      child: FashionStoreApp(),
    ),
  );
}
```

---

## 5. Configuración de Stripe

### 5.1 Dependencias

**pubspec.yaml:**
```yaml
dependencies:
  flutter_stripe: ^10.1.1
```

### 5.2 Android Setup

**android/app/build.gradle:**
```groovy
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 21
        // ...
    }
}
```

**android/app/src/main/kotlin/.../MainActivity.kt:**
```kotlin
import io.flutter.embedding.android.FlutterFragmentActivity

class MainActivity: FlutterFragmentActivity() {
}
```

### 5.3 iOS Setup

**ios/Podfile:**
```ruby
platform :ios, '13.0'
```

### 5.4 Stripe Service

**Archivo:** `lib/core/services/stripe_service.dart`

```dart
import 'package:flutter_stripe/flutter_stripe.dart';
import '../network/api_client.dart';

class StripeService {
  final ApiClient _apiClient;

  StripeService(this._apiClient);

  /// Inicializa Stripe
  static Future<void> init(String publishableKey) async {
    Stripe.publishableKey = publishableKey;
    await Stripe.instance.applySettings();
  }

  /// Procesa el pago con PaymentSheet
  Future<PaymentResult> processPayment({
    required String clientSecret,
    required String merchantDisplayName,
    BillingDetails? billingDetails,
  }) async {
    try {
      // Inicializar PaymentSheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: merchantDisplayName,
          style: ThemeMode.system,
          billingDetails: billingDetails,
          
          // Google Pay
          googlePay: const PaymentSheetGooglePay(
            merchantCountryCode: 'ES',
            currencyCode: 'EUR',
            testEnv: true, // Cambiar a false en producción
          ),
          
          // Apple Pay
          applePay: const PaymentSheetApplePay(
            merchantCountryCode: 'ES',
          ),
        ),
      );

      // Mostrar PaymentSheet
      await Stripe.instance.presentPaymentSheet();
      
      return PaymentResult.success();
    } on StripeException catch (e) {
      return PaymentResult.error(
        code: e.error.code.name,
        message: e.error.localizedMessage ?? 'Error al procesar el pago',
      );
    } catch (e) {
      return PaymentResult.error(
        code: 'unknown',
        message: e.toString(),
      );
    }
  }

  /// Crea PaymentIntent en el servidor
  Future<String> createPaymentIntent({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> customerData,
    String? couponCode,
  }) async {
    final response = await _apiClient.post(
      '/api/checkout/create-payment-intent',
      data: {
        'items': items,
        ...customerData,
        if (couponCode != null) 'couponCode': couponCode,
      },
    );
    
    return response.data['clientSecret'] as String;
  }
}

class PaymentResult {
  final bool isSuccess;
  final String? errorCode;
  final String? errorMessage;

  const PaymentResult._({
    required this.isSuccess,
    this.errorCode,
    this.errorMessage,
  });

  factory PaymentResult.success() => const PaymentResult._(isSuccess: true);
  
  factory PaymentResult.error({
    required String code,
    required String message,
  }) => PaymentResult._(
    isSuccess: false,
    errorCode: code,
    errorMessage: message,
  );
}
```

---

## 6. Nuevo Endpoint API

### 6.1 Create Payment Intent

**Archivo:** `src/pages/api/checkout/create-payment-intent.ts`

```typescript
import type { APIRoute } from 'astro';
import { stripe, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../../../lib/stripe';
import { createServerClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry = 'España',
      couponCode,
    } = body;

    // Validaciones
    if (!items?.length || !customerName || !customerEmail || 
        !shippingAddress || !shippingCity || !shippingPostalCode) {
      return new Response(JSON.stringify({
        error: 'Faltan campos requeridos'
      }), { status: 400 });
    }

    const dbClient = createServerClient(cookies);

    // Calcular totales
    let subtotal = 0;
    const lineItems: Array<{ variantId: string; quantity: number; price: number }> = [];

    for (const item of items) {
      // Verificar precio actual
      const { data: variant } = await dbClient
        .from('product_variants')
        .select(`
          id,
          stock,
          products!inner (
            id,
            name,
            price,
            sale_price,
            is_active
          )
        `)
        .eq('id', item.variantId)
        .single();

      if (!variant || !variant.products.is_active) {
        return new Response(JSON.stringify({
          error: `Producto no disponible: ${item.name}`
        }), { status: 400 });
      }

      if (variant.stock < item.quantity) {
        return new Response(JSON.stringify({
          error: `Stock insuficiente para: ${item.name}`
        }), { status: 400 });
      }

      const price = variant.products.sale_price || variant.products.price;
      subtotal += price * item.quantity;

      lineItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        price: price,
      });
    }

    // Calcular envío
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST / 100;

    // Validar cupón
    let discount = 0;
    let validatedCoupon = null;

    if (couponCode) {
      const { data: couponData } = await dbClient.rpc('validate_coupon', {
        p_code: couponCode,
        p_cart_total: subtotal,
        p_customer_email: customerEmail,
      });

      if (couponData?.valid) {
        validatedCoupon = couponData.coupon;
        discount = couponData.calculated_discount || 0;
      }
    }

    // Total final
    const totalAmount = subtotal + shippingCost - discount;
    const totalInCents = Math.round(totalAmount * 100);

    // Reservar stock
    const reservedItems: Array<{ variantId: string; quantity: number }> = [];
    
    for (const item of lineItems) {
      const { data: success } = await dbClient.rpc('reserve_stock', {
        p_variant_id: item.variantId,
        p_quantity: item.quantity,
      });

      if (!success) {
        // Rollback
        for (const reserved of reservedItems) {
          await dbClient.rpc('restore_stock', {
            p_variant_id: reserved.variantId,
            p_quantity: reserved.quantity,
          });
        }
        
        return new Response(JSON.stringify({
          error: 'No hay suficiente stock disponible'
        }), { status: 400 });
      }

      reservedItems.push({ variantId: item.variantId, quantity: item.quantity });
    }

    // Crear pedido
    const { data: orderData, error: orderError } = await dbClient.rpc('create_checkout_order', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone || null,
      p_shipping_address: shippingAddress,
      p_shipping_city: shippingCity,
      p_shipping_postal_code: shippingPostalCode,
      p_shipping_country: shippingCountry,
      p_total_amount: totalAmount,
      p_items: lineItems.map((item, i) => ({
        product_id: items[i].productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
      p_coupon_id: validatedCoupon?.id || null,
    });

    if (orderError || !orderData) {
      // Rollback stock
      for (const reserved of reservedItems) {
        await dbClient.rpc('restore_stock', {
          p_variant_id: reserved.variantId,
          p_quantity: reserved.quantity,
        });
      }

      return new Response(JSON.stringify({
        error: 'Error al crear el pedido'
      }), { status: 500 });
    }

    const orderId = orderData.order_id;
    const orderNumber = orderData.order_number;

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalInCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId,
        order_number: orderNumber.toString(),
        coupon_id: validatedCoupon?.id || '',
      },
      receipt_email: customerEmail,
    });

    // Actualizar pedido con payment_intent_id
    await dbClient
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', orderId);

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      orderId,
      orderNumber,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(JSON.stringify({
      error: 'Error interno del servidor'
    }), { status: 500 });
  }
};
```

### 6.2 Actualizar Webhook

Añadir a `src/pages/api/webhooks/stripe.ts`:

```typescript
case 'payment_intent.succeeded': {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const orderId = paymentIntent.metadata.order_id;
  const couponId = paymentIntent.metadata.coupon_id;
  
  if (!orderId) break;

  // Verificar estado actual
  const { data: existingOrder } = await dbClient
    .from('orders')
    .select('status, customer_email')
    .eq('id', orderId)
    .single();

  if (existingOrder?.status === 'paid') {
    console.log('Order already paid, skipping');
    break;
  }

  // Actualizar estado
  await dbClient
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

  // Registrar uso de cupón
  if (couponId) {
    await dbClient.rpc('use_coupon', {
      p_coupon_id: couponId,
      p_customer_email: existingOrder.customer_email,
      p_order_id: orderId,
    });
  }

  // Enviar email de confirmación
  // ... (similar a checkout.session.completed)
  
  break;
}
```

---

## 7. Constantes Compartidas

**Archivo:** `lib/features/cart/domain/constants/cart_constants.dart`

```dart
class CartConstants {
  CartConstants._();

  /// Umbral para envío gratis (en euros)
  static const double freeShippingThreshold = 50.0;

  /// Coste de envío estándar (en euros)
  static const double shippingCost = 4.99;

  /// Tiempo de reserva de stock (minutos)
  static const int stockReservationMinutes = 30;

  /// Cantidad máxima por item
  static const int maxQuantityPerItem = 10;

  /// Cantidad mínima por item
  static const int minQuantityPerItem = 1;
}
```

---

## 8. Generar Código

Ejecutar después de crear los archivos:

```bash
# Generar adapters de Hive
flutter packages pub run build_runner build --delete-conflicting-outputs
```

---

## 9. Checklist de Fase 1

- [ ] Crear `CartItemModel` con adapter de Hive
- [ ] Crear `OrderModel` con Freezed
- [ ] Crear `OrderItemModel` con Freezed
- [ ] Crear `CouponModel` con Freezed
- [ ] Crear `CheckoutFormData` con Freezed
- [ ] Crear entidades de dominio
- [ ] Configurar Hive en `main.dart`
- [ ] Configurar Stripe SDK
- [ ] Crear `StripeService`
- [ ] Crear endpoint `/api/checkout/create-payment-intent`
- [ ] Actualizar webhook para `payment_intent.succeeded`
- [ ] Ejecutar build_runner
- [ ] Verificar compilación sin errores
