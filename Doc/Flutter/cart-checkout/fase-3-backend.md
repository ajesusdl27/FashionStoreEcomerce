# Fase 3: Backend/Lógica - Carrito y Checkout

## 1. Objetivos de la Fase
- Implementar datasources locales y remotos
- Crear repositorios completos
- Implementar providers de estado
- Integrar Stripe PaymentSheet

---

## 2. Datasources

### 2.1 Cart Local Datasource

**Archivo:** `lib/features/cart/data/datasources/cart_local_datasource.dart`

```dart
import 'package:hive/hive.dart';
import '../../../../core/storage/hive_config.dart';
import '../models/cart_item_model.dart';

abstract class CartLocalDatasource {
  List<CartItemModel> getAll();
  CartItemModel? getByVariantId(String variantId);
  Future<void> add(CartItemModel item);
  Future<void> update(CartItemModel item);
  Future<void> remove(String variantId);
  Future<void> clear();
  Stream<BoxEvent> watch();
}

class CartLocalDatasourceImpl implements CartLocalDatasource {
  Box<CartItemModel> get _box => HiveConfig.cartBox;

  @override
  List<CartItemModel> getAll() {
    return _box.values.toList();
  }

  @override
  CartItemModel? getByVariantId(String variantId) {
    try {
      return _box.values.firstWhere((item) => item.variantId == variantId);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> add(CartItemModel item) async {
    // Usar variantId como key para acceso rápido
    await _box.put(item.variantId, item);
  }

  @override
  Future<void> update(CartItemModel item) async {
    await _box.put(item.variantId, item);
  }

  @override
  Future<void> remove(String variantId) async {
    await _box.delete(variantId);
  }

  @override
  Future<void> clear() async {
    await _box.clear();
  }

  @override
  Stream<BoxEvent> watch() {
    return _box.watch();
  }
}
```

### 2.2 Checkout Remote Datasource

**Archivo:** `lib/features/cart/data/datasources/checkout_remote_datasource.dart`

```dart
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/order_model.dart';
import '../models/coupon_model.dart';

abstract class CheckoutRemoteDatasource {
  Future<ValidatedCoupon> validateCoupon({
    required String code,
    required double cartTotal,
    required String customerEmail,
  });
  
  Future<PaymentIntentResponse> createPaymentIntent({
    required List<Map<String, dynamic>> items,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    String shippingCountry = 'España',
    String? couponCode,
  });
  
  Future<OrderModel> getOrder(String orderId);
  
  Future<OrderModel> confirmOrder(String orderId);
}

class CheckoutRemoteDatasourceImpl implements CheckoutRemoteDatasource {
  final ApiClient _client;

  CheckoutRemoteDatasourceImpl(this._client);

  @override
  Future<ValidatedCoupon> validateCoupon({
    required String code,
    required double cartTotal,
    required String customerEmail,
  }) async {
    try {
      final response = await _client.post(
        '/api/coupons/validate',
        data: {
          'code': code,
          'cartTotal': cartTotal,
          'customerEmail': customerEmail,
        },
      );

      return ValidatedCoupon.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'Error validando cupón',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<PaymentIntentResponse> createPaymentIntent({
    required List<Map<String, dynamic>> items,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    String shippingCountry = 'España',
    String? couponCode,
  }) async {
    try {
      final response = await _client.post(
        '/api/checkout/create-payment-intent',
        data: {
          'items': items,
          'customerName': customerName,
          'customerEmail': customerEmail,
          'customerPhone': customerPhone,
          'shippingAddress': shippingAddress,
          'shippingCity': shippingCity,
          'shippingPostalCode': shippingPostalCode,
          'shippingCountry': shippingCountry,
          'couponCode': couponCode,
        },
      );

      return PaymentIntentResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'Error creando pago',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<OrderModel> getOrder(String orderId) async {
    try {
      final response = await _client.get('/api/orders/$orderId');
      return OrderModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'Error obteniendo pedido',
        statusCode: e.response?.statusCode,
      );
    }
  }

  @override
  Future<OrderModel> confirmOrder(String orderId) async {
    try {
      final response = await _client.post('/api/orders/$orderId/confirm');
      return OrderModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['error'] ?? 'Error confirmando pedido',
        statusCode: e.response?.statusCode,
      );
    }
  }
}

// Modelo de respuesta de PaymentIntent
class PaymentIntentResponse {
  final String clientSecret;
  final String orderId;
  final int orderNumber;

  PaymentIntentResponse({
    required this.clientSecret,
    required this.orderId,
    required this.orderNumber,
  });

  factory PaymentIntentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentIntentResponse(
      clientSecret: json['clientSecret'] as String,
      orderId: json['orderId'] as String,
      orderNumber: json['orderNumber'] as int,
    );
  }
}
```

---

## 3. Repositorios

### 3.1 Cart Repository

**Archivo:** `lib/features/cart/domain/repositories/cart_repository.dart`

```dart
import '../entities/cart_item.dart';

abstract class CartRepository {
  /// Obtiene todos los items del carrito
  List<CartItem> getItems();
  
  /// Añade un item al carrito (o incrementa cantidad si existe)
  Future<void> addItem(CartItem item);
  
  /// Actualiza la cantidad de un item
  Future<void> updateQuantity(String variantId, int quantity);
  
  /// Elimina un item del carrito
  Future<void> removeItem(String variantId);
  
  /// Limpia todo el carrito
  Future<void> clearCart();
  
  /// Stream de cambios en el carrito
  Stream<List<CartItem>> watchCart();
  
  /// Calcula el subtotal
  double calculateSubtotal();
  
  /// Calcula el envío
  double calculateShipping();
  
  /// Calcula el total
  double calculateTotal({double discount = 0});
  
  /// Verifica si hay envío gratis
  bool hasFreeShipping();
  
  /// Obtiene el número total de items
  int getTotalItemCount();
}
```

**Archivo:** `lib/features/cart/data/repositories/cart_repository_impl.dart`

```dart
import 'dart:async';
import '../../domain/constants/cart_constants.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/repositories/cart_repository.dart';
import '../datasources/cart_local_datasource.dart';
import '../models/cart_item_model.dart';

class CartRepositoryImpl implements CartRepository {
  final CartLocalDatasource _localDatasource;
  final _cartController = StreamController<List<CartItem>>.broadcast();

  CartRepositoryImpl(this._localDatasource) {
    // Escuchar cambios en Hive
    _localDatasource.watch().listen((_) {
      _cartController.add(getItems());
    });
  }

  @override
  List<CartItem> getItems() {
    return _localDatasource.getAll().map(_modelToEntity).toList();
  }

  @override
  Future<void> addItem(CartItem item) async {
    final existing = _localDatasource.getByVariantId(item.variantId);
    
    if (existing != null) {
      // Incrementar cantidad si existe
      final newQuantity = (existing.quantity + item.quantity)
          .clamp(1, existing.availableStock);
      await _localDatasource.update(existing.copyWith(quantity: newQuantity));
    } else {
      // Añadir nuevo
      await _localDatasource.add(_entityToModel(item));
    }
  }

  @override
  Future<void> updateQuantity(String variantId, int quantity) async {
    final existing = _localDatasource.getByVariantId(variantId);
    if (existing != null) {
      final clampedQuantity = quantity.clamp(
        CartConstants.minQuantityPerItem,
        existing.availableStock,
      );
      await _localDatasource.update(existing.copyWith(quantity: clampedQuantity));
    }
  }

  @override
  Future<void> removeItem(String variantId) async {
    await _localDatasource.remove(variantId);
  }

  @override
  Future<void> clearCart() async {
    await _localDatasource.clear();
  }

  @override
  Stream<List<CartItem>> watchCart() {
    return _cartController.stream;
  }

  @override
  double calculateSubtotal() {
    return getItems().fold(0, (sum, item) => sum + item.subtotal);
  }

  @override
  double calculateShipping() {
    return hasFreeShipping() ? 0 : CartConstants.shippingCost;
  }

  @override
  double calculateTotal({double discount = 0}) {
    return calculateSubtotal() + calculateShipping() - discount;
  }

  @override
  bool hasFreeShipping() {
    return calculateSubtotal() >= CartConstants.freeShippingThreshold;
  }

  @override
  int getTotalItemCount() {
    return getItems().fold(0, (sum, item) => sum + item.quantity);
  }

  // Mappers
  CartItem _modelToEntity(CartItemModel model) {
    return CartItem(
      variantId: model.variantId,
      productId: model.productId,
      productName: model.productName,
      productSlug: model.productSlug,
      imageUrl: model.imageUrl,
      price: model.price,
      originalPrice: model.originalPrice,
      size: model.size,
      quantity: model.quantity,
      availableStock: model.availableStock,
      addedAt: model.addedAt,
    );
  }

  CartItemModel _entityToModel(CartItem entity) {
    return CartItemModel(
      variantId: entity.variantId,
      productId: entity.productId,
      productName: entity.productName,
      productSlug: entity.productSlug,
      imageUrl: entity.imageUrl,
      price: entity.price,
      originalPrice: entity.originalPrice,
      size: entity.size,
      quantity: entity.quantity,
      availableStock: entity.availableStock,
      addedAt: entity.addedAt,
    );
  }

  void dispose() {
    _cartController.close();
  }
}
```

### 3.2 Checkout Repository

**Archivo:** `lib/features/cart/domain/repositories/checkout_repository.dart`

```dart
import '../entities/order.dart';
import '../../data/models/coupon_model.dart';
import '../../data/datasources/checkout_remote_datasource.dart';

abstract class CheckoutRepository {
  /// Valida un cupón de descuento
  Future<ValidatedCoupon> validateCoupon({
    required String code,
    required double cartTotal,
    required String customerEmail,
  });
  
  /// Crea un PaymentIntent para procesar el pago
  Future<PaymentIntentResponse> createPaymentIntent({
    required List<Map<String, dynamic>> items,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    String shippingCountry = 'España',
    String? couponCode,
  });
  
  /// Obtiene los detalles de un pedido
  Future<Order> getOrder(String orderId);
  
  /// Confirma un pedido (después del pago exitoso)
  Future<Order> confirmOrder(String orderId);
}
```

**Archivo:** `lib/features/cart/data/repositories/checkout_repository_impl.dart`

```dart
import '../../domain/entities/order.dart';
import '../../domain/repositories/checkout_repository.dart';
import '../datasources/checkout_remote_datasource.dart';
import '../models/coupon_model.dart';
import '../models/order_model.dart';

class CheckoutRepositoryImpl implements CheckoutRepository {
  final CheckoutRemoteDatasource _remoteDatasource;

  CheckoutRepositoryImpl(this._remoteDatasource);

  @override
  Future<ValidatedCoupon> validateCoupon({
    required String code,
    required double cartTotal,
    required String customerEmail,
  }) async {
    return await _remoteDatasource.validateCoupon(
      code: code,
      cartTotal: cartTotal,
      customerEmail: customerEmail,
    );
  }

  @override
  Future<PaymentIntentResponse> createPaymentIntent({
    required List<Map<String, dynamic>> items,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    String shippingCountry = 'España',
    String? couponCode,
  }) async {
    return await _remoteDatasource.createPaymentIntent(
      items: items,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      shippingAddress: shippingAddress,
      shippingCity: shippingCity,
      shippingPostalCode: shippingPostalCode,
      shippingCountry: shippingCountry,
      couponCode: couponCode,
    );
  }

  @override
  Future<Order> getOrder(String orderId) async {
    final model = await _remoteDatasource.getOrder(orderId);
    return _modelToEntity(model);
  }

  @override
  Future<Order> confirmOrder(String orderId) async {
    final model = await _remoteDatasource.confirmOrder(orderId);
    return _modelToEntity(model);
  }

  Order _modelToEntity(OrderModel model) {
    return Order(
      id: model.id,
      orderNumber: model.orderNumber,
      customerId: model.customerId,
      customerName: model.customerName,
      customerEmail: model.customerEmail,
      customerPhone: model.customerPhone,
      shippingAddress: model.shippingAddress,
      shippingCity: model.shippingCity,
      shippingPostalCode: model.shippingPostalCode,
      shippingCountry: model.shippingCountry,
      totalAmount: model.totalAmount,
      status: _parseStatus(model.status),
      stripeSessionId: model.stripeSessionId,
      stripePaymentIntentId: model.stripePaymentIntentId,
      createdAt: model.createdAt,
      items: model.items?.map((item) => OrderItem(
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        variantSize: item.variantSize,
      )).toList(),
    );
  }

  OrderStatus _parseStatus(String status) {
    switch (status) {
      case 'pending':
        return OrderStatus.pending;
      case 'paid':
        return OrderStatus.paid;
      case 'shipped':
        return OrderStatus.shipped;
      case 'delivered':
        return OrderStatus.delivered;
      case 'cancelled':
        return OrderStatus.cancelled;
      case 'return_requested':
        return OrderStatus.returnRequested;
      case 'returned':
        return OrderStatus.returned;
      default:
        return OrderStatus.pending;
    }
  }
}
```

---

## 4. Providers (Riverpod)

### 4.1 Cart Provider

**Archivo:** `lib/features/cart/presentation/providers/cart_provider.dart`

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/datasources/cart_local_datasource.dart';
import '../../data/repositories/cart_repository_impl.dart';
import '../../domain/constants/cart_constants.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/repositories/cart_repository.dart';

part 'cart_provider.g.dart';

// Datasource provider
@riverpod
CartLocalDatasource cartLocalDatasource(CartLocalDatasourceRef ref) {
  return CartLocalDatasourceImpl();
}

// Repository provider
@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  final datasource = ref.watch(cartLocalDatasourceProvider);
  return CartRepositoryImpl(datasource);
}

// Cart state
@riverpod
class CartNotifier extends _$CartNotifier {
  CartRepository get _repository => ref.read(cartRepositoryProvider);

  @override
  List<CartItem> build() {
    // Cargar items al iniciar
    return _repository.getItems();
  }

  Future<void> addItem(CartItem item) async {
    await _repository.addItem(item);
    state = _repository.getItems();
  }

  Future<void> updateQuantity(String variantId, int quantity) async {
    await _repository.updateQuantity(variantId, quantity);
    state = _repository.getItems();
  }

  Future<void> incrementQuantity(String variantId) async {
    final item = state.firstWhere((i) => i.variantId == variantId);
    if (item.canIncrement) {
      await updateQuantity(variantId, item.quantity + 1);
    }
  }

  Future<void> decrementQuantity(String variantId) async {
    final item = state.firstWhere((i) => i.variantId == variantId);
    if (item.canDecrement) {
      await updateQuantity(variantId, item.quantity - 1);
    }
  }

  Future<void> removeItem(String variantId) async {
    await _repository.removeItem(variantId);
    state = _repository.getItems();
  }

  Future<void> clearCart() async {
    await _repository.clearCart();
    state = [];
  }
}

// Computed values
@riverpod
double cartSubtotal(CartSubtotalRef ref) {
  final items = ref.watch(cartNotifierProvider);
  return items.fold(0, (sum, item) => sum + item.subtotal);
}

@riverpod
double cartShipping(CartShippingRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  return subtotal >= CartConstants.freeShippingThreshold 
      ? 0 
      : CartConstants.shippingCost;
}

@riverpod
double cartTotal(CartTotalRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  final shipping = ref.watch(cartShippingProvider);
  return subtotal + shipping;
}

@riverpod
int cartItemCount(CartItemCountRef ref) {
  final items = ref.watch(cartNotifierProvider);
  return items.fold(0, (sum, item) => sum + item.quantity);
}

@riverpod
bool hasFreeShipping(HasFreeShippingRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  return subtotal >= CartConstants.freeShippingThreshold;
}

@riverpod
double freeShippingProgress(FreeShippingProgressRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  return (subtotal / CartConstants.freeShippingThreshold).clamp(0.0, 1.0);
}

@riverpod
double amountToFreeShipping(AmountToFreeShippingRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  final remaining = CartConstants.freeShippingThreshold - subtotal;
  return remaining > 0 ? remaining : 0;
}
```

### 4.2 Checkout Provider

**Archivo:** `lib/features/cart/presentation/providers/checkout_provider.dart`

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../profile/presentation/providers/profile_provider.dart';
import '../../data/datasources/checkout_remote_datasource.dart';
import '../../data/models/checkout_form_data.dart';
import '../../data/models/coupon_model.dart';
import '../../data/repositories/checkout_repository_impl.dart';
import '../../domain/repositories/checkout_repository.dart';
import 'cart_provider.dart';

part 'checkout_provider.g.dart';

// Datasource provider
@riverpod
CheckoutRemoteDatasource checkoutRemoteDatasource(CheckoutRemoteDatasourceRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CheckoutRemoteDatasourceImpl(apiClient);
}

// Repository provider
@riverpod
CheckoutRepository checkoutRepository(CheckoutRepositoryRef ref) {
  final datasource = ref.watch(checkoutRemoteDatasourceProvider);
  return CheckoutRepositoryImpl(datasource);
}

// Estado del checkout
@freezed
class CheckoutState with _$CheckoutState {
  const factory CheckoutState({
    @Default(1) int currentStep,
    @Default(false) bool isLoading,
    String? error,
    @Default(CheckoutFormData()) CheckoutFormData formData,
    ValidatedCoupon? validatedCoupon,
    @Default(false) bool isCouponLoading,
    String? couponError,
    String? paymentIntentClientSecret,
    String? orderId,
    int? orderNumber,
  }) = _CheckoutState;
}

@riverpod
class CheckoutNotifier extends _$CheckoutNotifier {
  CheckoutRepository get _repository => ref.read(checkoutRepositoryProvider);

  @override
  CheckoutState build() {
    _prefillUserData();
    return const CheckoutState();
  }

  Future<void> _prefillUserData() async {
    final user = ref.read(currentUserProvider);
    if (user == null) return;

    final profile = await ref.read(profileProvider.future);
    if (profile == null) return;

    state = state.copyWith(
      formData: state.formData.copyWith(
        customerName: profile.name,
        customerEmail: user.email ?? '',
        customerPhone: profile.phone ?? '',
        shippingAddress: profile.address ?? '',
        shippingCity: profile.city ?? '',
        shippingPostalCode: profile.postalCode ?? '',
      ),
    );
  }

  // Navegación de pasos
  void nextStep() {
    if (state.currentStep < 3) {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  void previousStep() {
    if (state.currentStep > 1) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  void goToStep(int step) {
    if (step >= 1 && step <= 3) {
      state = state.copyWith(currentStep: step);
    }
  }

  // Actualizar formulario
  void updateFormData(CheckoutFormData formData) {
    state = state.copyWith(formData: formData, error: null);
  }

  void updateField(String field, String value) {
    final newFormData = state.formData.copyWith(
      customerName: field == 'customerName' ? value : null,
      customerEmail: field == 'customerEmail' ? value : null,
      customerPhone: field == 'customerPhone' ? value : null,
      shippingAddress: field == 'shippingAddress' ? value : null,
      shippingCity: field == 'shippingCity' ? value : null,
      shippingPostalCode: field == 'shippingPostalCode' ? value : null,
    );
    state = state.copyWith(formData: newFormData, error: null);
  }

  // Validar cupón
  Future<void> validateCoupon(String code) async {
    if (code.isEmpty) return;

    state = state.copyWith(isCouponLoading: true, couponError: null);

    try {
      final subtotal = ref.read(cartSubtotalProvider);
      final email = state.formData.customerEmail;

      final result = await _repository.validateCoupon(
        code: code,
        cartTotal: subtotal,
        customerEmail: email,
      );

      if (result.valid) {
        state = state.copyWith(
          validatedCoupon: result,
          isCouponLoading: false,
        );
      } else {
        state = state.copyWith(
          couponError: result.message ?? 'Cupón no válido',
          isCouponLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        couponError: e.toString(),
        isCouponLoading: false,
      );
    }
  }

  void removeCoupon() {
    state = state.copyWith(
      validatedCoupon: null,
      couponError: null,
    );
  }

  // Crear Payment Intent
  Future<bool> createPaymentIntent() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final cartItems = ref.read(cartNotifierProvider);
      final items = cartItems.map((item) => item.toApiJson()).toList();

      final response = await _repository.createPaymentIntent(
        items: items,
        customerName: state.formData.customerName,
        customerEmail: state.formData.customerEmail,
        customerPhone: state.formData.customerPhone,
        shippingAddress: state.formData.shippingAddress,
        shippingCity: state.formData.shippingCity,
        shippingPostalCode: state.formData.shippingPostalCode,
        couponCode: state.validatedCoupon?.coupon?.code,
      );

      state = state.copyWith(
        paymentIntentClientSecret: response.clientSecret,
        orderId: response.orderId,
        orderNumber: response.orderNumber,
        isLoading: false,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
      return false;
    }
  }

  // Reset
  void reset() {
    state = const CheckoutState();
    _prefillUserData();
  }
}

// Total con descuento aplicado
@riverpod
double checkoutTotal(CheckoutTotalRef ref) {
  final subtotal = ref.watch(cartSubtotalProvider);
  final shipping = ref.watch(cartShippingProvider);
  final checkout = ref.watch(checkoutNotifierProvider);
  
  final discount = checkout.validatedCoupon?.calculatedDiscount ?? 0;
  
  return subtotal + shipping - discount;
}

// Descuento aplicado
@riverpod
double? appliedDiscount(AppliedDiscountRef ref) {
  final checkout = ref.watch(checkoutNotifierProvider);
  return checkout.validatedCoupon?.calculatedDiscount;
}
```

### 4.3 Payment Provider

**Archivo:** `lib/features/cart/presentation/providers/payment_provider.dart`

```dart
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/services/stripe_service.dart';
import 'cart_provider.dart';
import 'checkout_provider.dart';

part 'payment_provider.g.dart';

enum PaymentStatus {
  idle,
  processing,
  success,
  failed,
  cancelled,
}

@freezed
class PaymentState with _$PaymentState {
  const factory PaymentState({
    @Default(PaymentStatus.idle) PaymentStatus status,
    String? error,
    String? orderId,
    int? orderNumber,
  }) = _PaymentState;
}

@riverpod
class PaymentNotifier extends _$PaymentNotifier {
  @override
  PaymentState build() {
    return const PaymentState();
  }

  Future<bool> processPayment() async {
    final checkout = ref.read(checkoutNotifierProvider);
    final clientSecret = checkout.paymentIntentClientSecret;
    
    if (clientSecret == null) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: 'No hay intento de pago creado',
      );
      return false;
    }

    state = state.copyWith(status: PaymentStatus.processing);

    try {
      // Inicializar PaymentSheet
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Fashion Store',
          style: ThemeMode.system,
          
          // Billing details
          billingDetails: BillingDetails(
            name: checkout.formData.customerName,
            email: checkout.formData.customerEmail,
            phone: checkout.formData.customerPhone,
            address: Address(
              city: checkout.formData.shippingCity,
              postalCode: checkout.formData.shippingPostalCode,
              country: 'ES',
              line1: checkout.formData.shippingAddress,
            ),
          ),
          
          // Google Pay
          googlePay: const PaymentSheetGooglePay(
            merchantCountryCode: 'ES',
            currencyCode: 'EUR',
            testEnv: true, // TODO: false en producción
          ),
          
          // Apple Pay
          applePay: const PaymentSheetApplePay(
            merchantCountryCode: 'ES',
          ),
        ),
      );

      // Mostrar PaymentSheet
      await Stripe.instance.presentPaymentSheet();

      // Pago exitoso
      state = state.copyWith(
        status: PaymentStatus.success,
        orderId: checkout.orderId,
        orderNumber: checkout.orderNumber,
      );

      // Limpiar carrito
      await ref.read(cartNotifierProvider.notifier).clearCart();

      return true;
    } on StripeException catch (e) {
      if (e.error.code == FailureCode.Canceled) {
        state = state.copyWith(
          status: PaymentStatus.cancelled,
          error: 'Pago cancelado',
        );
      } else {
        state = state.copyWith(
          status: PaymentStatus.failed,
          error: e.error.localizedMessage ?? 'Error al procesar el pago',
        );
      }
      return false;
    } catch (e) {
      state = state.copyWith(
        status: PaymentStatus.failed,
        error: e.toString(),
      );
      return false;
    }
  }

  void reset() {
    state = const PaymentState();
  }
}
```

---

## 5. Casos de Uso

### 5.1 Add to Cart

**Archivo:** `lib/features/cart/domain/usecases/add_to_cart.dart`

```dart
import '../entities/cart_item.dart';
import '../repositories/cart_repository.dart';

class AddToCartUseCase {
  final CartRepository _repository;

  AddToCartUseCase(this._repository);

  Future<void> call({
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
  }) async {
    final item = CartItem(
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
      addedAt: DateTime.now(),
    );

    await _repository.addItem(item);
  }
}
```

### 5.2 Process Checkout

**Archivo:** `lib/features/cart/domain/usecases/process_checkout.dart`

```dart
import '../entities/cart_item.dart';
import '../repositories/checkout_repository.dart';
import '../../data/datasources/checkout_remote_datasource.dart';

class ProcessCheckoutUseCase {
  final CheckoutRepository _repository;

  ProcessCheckoutUseCase(this._repository);

  Future<PaymentIntentResponse> call({
    required List<CartItem> items,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String shippingAddress,
    required String shippingCity,
    required String shippingPostalCode,
    String? couponCode,
  }) async {
    final itemsJson = items.map((item) => {
      'variantId': item.variantId,
      'productId': item.productId,
      'name': item.productName,
      'price': item.price,
      'quantity': item.quantity,
      'size': item.size,
    }).toList();

    return await _repository.createPaymentIntent(
      items: itemsJson,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      shippingAddress: shippingAddress,
      shippingCity: shippingCity,
      shippingPostalCode: shippingPostalCode,
      couponCode: couponCode,
    );
  }
}
```

---

## 6. Dependency Injection

**Archivo:** `lib/core/di/cart_module.dart`

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/cart/data/datasources/cart_local_datasource.dart';
import '../../features/cart/data/datasources/checkout_remote_datasource.dart';
import '../../features/cart/data/repositories/cart_repository_impl.dart';
import '../../features/cart/data/repositories/checkout_repository_impl.dart';
import '../../features/cart/domain/repositories/cart_repository.dart';
import '../../features/cart/domain/repositories/checkout_repository.dart';
import '../../features/cart/domain/usecases/add_to_cart.dart';
import '../../features/cart/domain/usecases/process_checkout.dart';
import '../network/api_client.dart';

part 'cart_module.g.dart';

// Datasources
@riverpod
CartLocalDatasource cartLocalDatasource(CartLocalDatasourceRef ref) {
  return CartLocalDatasourceImpl();
}

@riverpod
CheckoutRemoteDatasource checkoutRemoteDatasource(CheckoutRemoteDatasourceRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CheckoutRemoteDatasourceImpl(apiClient);
}

// Repositories
@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  final datasource = ref.watch(cartLocalDatasourceProvider);
  return CartRepositoryImpl(datasource);
}

@riverpod
CheckoutRepository checkoutRepository(CheckoutRepositoryRef ref) {
  final datasource = ref.watch(checkoutRemoteDatasourceProvider);
  return CheckoutRepositoryImpl(datasource);
}

// Use Cases
@riverpod
AddToCartUseCase addToCartUseCase(AddToCartUseCaseRef ref) {
  final repository = ref.watch(cartRepositoryProvider);
  return AddToCartUseCase(repository);
}

@riverpod
ProcessCheckoutUseCase processCheckoutUseCase(ProcessCheckoutUseCaseRef ref) {
  final repository = ref.watch(checkoutRepositoryProvider);
  return ProcessCheckoutUseCase(repository);
}
```

---

## 7. Tests

### 7.1 Cart Repository Test

**Archivo:** `test/features/cart/data/repositories/cart_repository_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockCartLocalDatasource extends Mock implements CartLocalDatasource {}

void main() {
  late CartRepositoryImpl repository;
  late MockCartLocalDatasource mockDatasource;

  setUp(() {
    mockDatasource = MockCartLocalDatasource();
    repository = CartRepositoryImpl(mockDatasource);
  });

  group('CartRepository', () {
    test('calculateSubtotal returns correct sum', () {
      when(() => mockDatasource.getAll()).thenReturn([
        CartItemModel(
          variantId: '1',
          productId: 'p1',
          productName: 'Item 1',
          productSlug: 'item-1',
          price: 10.0,
          size: 'M',
          quantity: 2,
          availableStock: 10,
        ),
        CartItemModel(
          variantId: '2',
          productId: 'p2',
          productName: 'Item 2',
          productSlug: 'item-2',
          price: 15.0,
          size: 'L',
          quantity: 1,
          availableStock: 5,
        ),
      ]);

      final subtotal = repository.calculateSubtotal();

      expect(subtotal, equals(35.0)); // 10*2 + 15*1
    });

    test('hasFreeShipping returns true when subtotal >= 50', () {
      when(() => mockDatasource.getAll()).thenReturn([
        CartItemModel(
          variantId: '1',
          productId: 'p1',
          productName: 'Item 1',
          productSlug: 'item-1',
          price: 50.0,
          size: 'M',
          quantity: 1,
          availableStock: 10,
        ),
      ]);

      expect(repository.hasFreeShipping(), isTrue);
    });

    test('hasFreeShipping returns false when subtotal < 50', () {
      when(() => mockDatasource.getAll()).thenReturn([
        CartItemModel(
          variantId: '1',
          productId: 'p1',
          productName: 'Item 1',
          productSlug: 'item-1',
          price: 49.99,
          size: 'M',
          quantity: 1,
          availableStock: 10,
        ),
      ]);

      expect(repository.hasFreeShipping(), isFalse);
    });
  });
}
```

### 7.2 Coupon Model Test

**Archivo:** `test/features/cart/data/models/coupon_model_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CouponModel.calculateDiscount', () {
    test('percentage discount calculates correctly', () {
      final coupon = CouponModel(
        id: '1',
        code: 'DESCUENTO10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 0,
        isActive: true,
      );

      expect(coupon.calculateDiscount(100), equals(10.0));
      expect(coupon.calculateDiscount(50), equals(5.0));
    });

    test('fixed discount calculates correctly', () {
      final coupon = CouponModel(
        id: '1',
        code: 'MENOS5',
        discountType: 'fixed',
        discountValue: 5,
        minPurchase: 0,
        isActive: true,
      );

      expect(coupon.calculateDiscount(100), equals(5.0));
      expect(coupon.calculateDiscount(50), equals(5.0));
    });

    test('fixed discount does not exceed subtotal', () {
      final coupon = CouponModel(
        id: '1',
        code: 'MENOS20',
        discountType: 'fixed',
        discountValue: 20,
        minPurchase: 0,
        isActive: true,
      );

      expect(coupon.calculateDiscount(10), equals(10.0)); // Max is subtotal
    });

    test('returns 0 if subtotal below minPurchase', () {
      final coupon = CouponModel(
        id: '1',
        code: 'MIN50',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 50,
        isActive: true,
      );

      expect(coupon.calculateDiscount(49), equals(0.0));
      expect(coupon.calculateDiscount(50), equals(5.0));
    });
  });
}
```

---

## 8. Checklist de Fase 3

- [ ] Crear `CartLocalDatasource` con Hive
- [ ] Crear `CheckoutRemoteDatasource` con Dio
- [ ] Implementar `CartRepositoryImpl`
- [ ] Implementar `CheckoutRepositoryImpl`
- [ ] Crear `CartNotifier` provider
- [ ] Crear `CheckoutNotifier` provider
- [ ] Crear `PaymentNotifier` provider
- [ ] Implementar casos de uso
- [ ] Configurar dependency injection
- [ ] Escribir tests unitarios
- [ ] Integrar con Stripe PaymentSheet
- [ ] Probar flujo completo de checkout
