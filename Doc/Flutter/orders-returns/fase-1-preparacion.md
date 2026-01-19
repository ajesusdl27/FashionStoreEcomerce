# Módulo 6: Pedidos y Devoluciones - Fase 1: Preparación

## 1. Enums de Estado

### 1.1 Estado de Pedido

```dart
// lib/features/orders/domain/enums/order_status.dart

import 'package:flutter/material.dart';

enum OrderStatus {
  pending('pending'),
  paid('paid'),
  shipped('shipped'),
  delivered('delivered'),
  cancelled('cancelled'),
  returnRequested('return_requested'),
  returnApproved('return_approved'),
  returnShipped('return_shipped'),
  returnReceived('return_received'),
  returnCompleted('return_completed'),
  partiallyRefunded('partially_refunded');

  final String value;
  const OrderStatus(this.value);

  static OrderStatus fromString(String value) {
    return OrderStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => OrderStatus.pending,
    );
  }

  String get label => switch (this) {
    OrderStatus.pending => 'Pendiente',
    OrderStatus.paid => 'Pagado',
    OrderStatus.shipped => 'Enviado',
    OrderStatus.delivered => 'Entregado',
    OrderStatus.cancelled => 'Cancelado',
    OrderStatus.returnRequested => 'Devolución solicitada',
    OrderStatus.returnApproved => 'Devolución aprobada',
    OrderStatus.returnShipped => 'Devolución enviada',
    OrderStatus.returnReceived => 'Devolución recibida',
    OrderStatus.returnCompleted => 'Devolución completada',
    OrderStatus.partiallyRefunded => 'Reembolso parcial',
  };

  Color get backgroundColor => switch (this) {
    OrderStatus.pending => Colors.amber.withValues(alpha: 0.1),
    OrderStatus.paid => Colors.green.withValues(alpha: 0.1),
    OrderStatus.shipped => Colors.blue.withValues(alpha: 0.1),
    OrderStatus.delivered => Colors.green.withValues(alpha: 0.1),
    OrderStatus.cancelled => Colors.red.withValues(alpha: 0.1),
    _ => Colors.purple.withValues(alpha: 0.1),
  };

  Color get textColor => switch (this) {
    OrderStatus.pending => Colors.amber,
    OrderStatus.paid => Colors.green,
    OrderStatus.shipped => Colors.blue,
    OrderStatus.delivered => Colors.green,
    OrderStatus.cancelled => Colors.red,
    _ => Colors.purple,
  };

  bool get canCancel => this == OrderStatus.paid;

  bool get canRequestReturn => this == OrderStatus.delivered;

  bool get canGenerateInvoice => 
    this == OrderStatus.paid || 
    this == OrderStatus.shipped || 
    this == OrderStatus.delivered;

  bool get isFinal => 
    this == OrderStatus.cancelled || 
    this == OrderStatus.returnCompleted;
}
```

### 1.2 Estado de Devolución

```dart
// lib/features/orders/domain/enums/return_status.dart

import 'package:flutter/material.dart';

enum ReturnStatus {
  requested('requested'),
  approved('approved'),
  shipped('shipped'),
  received('received'),
  completed('completed'),
  rejected('rejected');

  final String value;
  const ReturnStatus(this.value);

  static ReturnStatus fromString(String value) {
    return ReturnStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ReturnStatus.requested,
    );
  }

  String get label => switch (this) {
    ReturnStatus.requested => 'Pendiente',
    ReturnStatus.approved => 'Aprobada',
    ReturnStatus.shipped => 'Enviada',
    ReturnStatus.received => 'En revisión',
    ReturnStatus.completed => 'Completada',
    ReturnStatus.rejected => 'Rechazada',
  };

  String get customerMessage => switch (this) {
    ReturnStatus.requested => 'Esperando aprobación del equipo',
    ReturnStatus.approved => 'Envía el paquete a la dirección indicada',
    ReturnStatus.shipped => 'Paquete en camino a nuestras instalaciones',
    ReturnStatus.received => 'Inspeccionando los artículos',
    ReturnStatus.completed => 'Reembolso procesado',
    ReturnStatus.rejected => 'La solicitud ha sido rechazada',
  };

  Color get backgroundColor => switch (this) {
    ReturnStatus.requested => Colors.amber.withValues(alpha: 0.1),
    ReturnStatus.approved => Colors.blue.withValues(alpha: 0.1),
    ReturnStatus.shipped => Colors.purple.withValues(alpha: 0.1),
    ReturnStatus.received => Colors.cyan.withValues(alpha: 0.1),
    ReturnStatus.completed => Colors.green.withValues(alpha: 0.1),
    ReturnStatus.rejected => Colors.red.withValues(alpha: 0.1),
  };

  Color get textColor => switch (this) {
    ReturnStatus.requested => Colors.amber,
    ReturnStatus.approved => Colors.blue,
    ReturnStatus.shipped => Colors.purple,
    ReturnStatus.received => Colors.cyan,
    ReturnStatus.completed => Colors.green,
    ReturnStatus.rejected => Colors.red,
  };

  bool get isFinal => 
    this == ReturnStatus.completed || 
    this == ReturnStatus.rejected;

  bool get showShippingInstructions =>
    this == ReturnStatus.requested || 
    this == ReturnStatus.approved;
}
```

### 1.3 Motivo de Devolución

```dart
// lib/features/orders/domain/enums/return_reason.dart

enum ReturnReason {
  sizeMismatch('size_mismatch'),
  defective('defective'),
  notAsDescribed('not_as_described'),
  changedMind('changed_mind'),
  arrivedLate('arrived_late'),
  other('other');

  final String value;
  const ReturnReason(this.value);

  static ReturnReason fromString(String value) {
    return ReturnReason.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ReturnReason.other,
    );
  }

  String get label => switch (this) {
    ReturnReason.sizeMismatch => 'Talla incorrecta',
    ReturnReason.defective => 'Producto defectuoso',
    ReturnReason.notAsDescribed => 'No coincide con la descripción',
    ReturnReason.changedMind => 'Cambio de opinión',
    ReturnReason.arrivedLate => 'Llegó tarde',
    ReturnReason.other => 'Otro motivo',
  };

  bool get requiresDetails => this == ReturnReason.other;
}
```

---

## 2. Modelos Freezed

### 2.1 Modelo Order

```dart
// lib/features/orders/data/models/order.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/enums/order_status.dart';
import 'order_item.dart';
import 'coupon_usage.dart';

part 'order.freezed.dart';
part 'order.g.dart';

@freezed
class Order with _$Order {
  const Order._();

  const factory Order({
    required String id,
    @JsonKey(name: 'order_number') int? orderNumber,
    @JsonKey(name: 'customer_id') String? customerId,
    @JsonKey(name: 'customer_email') required String customerEmail,
    @JsonKey(name: 'customer_name') required String customerName,
    @JsonKey(name: 'customer_phone') String? customerPhone,
    
    // Dirección
    @JsonKey(name: 'shipping_address') required String shippingAddress,
    @JsonKey(name: 'shipping_city') required String shippingCity,
    @JsonKey(name: 'shipping_postal_code') required String shippingPostalCode,
    @JsonKey(name: 'shipping_country') @Default('España') String shippingCountry,
    
    // Estado
    @JsonKey(fromJson: _statusFromJson, toJson: _statusToJson) 
    @Default(OrderStatus.pending) OrderStatus status,
    
    // Pagos
    @JsonKey(name: 'stripe_session_id') String? stripeSessionId,
    @JsonKey(name: 'total_amount') double? totalAmount,
    @JsonKey(name: 'refunded_amount') @Default(0) double refundedAmount,
    
    // Timestamps
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'delivered_at') DateTime? deliveredAt,
    
    // Relaciones
    @JsonKey(name: 'order_items') @Default([]) List<OrderItem> items,
    @JsonKey(name: 'coupon_usages') @Default([]) List<CouponUsage> couponUsages,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);

  /// Obtiene el ID formateado para mostrar (#A000001 o #UUID)
  String get displayId {
    if (orderNumber != null && orderNumber! > 0) {
      return '#A${orderNumber.toString().padLeft(6, '0')}';
    }
    return '#${id.substring(0, 8).toUpperCase()}';
  }

  /// Obtiene el cupón aplicado (si existe)
  Coupon? get appliedCoupon => couponUsages.isNotEmpty 
      ? couponUsages.first.coupon 
      : null;

  /// Verifica si puede ser cancelado
  bool get canCancel => status.canCancel;

  /// Verifica si puede solicitar devolución
  bool canRequestReturn({int windowDays = 30}) {
    if (!status.canRequestReturn) return false;
    return isWithinReturnWindow(windowDays: windowDays);
  }

  /// Verifica si está dentro de la ventana de devolución
  bool isWithinReturnWindow({int windowDays = 30}) {
    if (deliveredAt == null) return true;
    final daysSince = DateTime.now().difference(deliveredAt!).inDays;
    return daysSince <= windowDays;
  }

  /// Días restantes para devolución
  int? get daysLeftForReturn {
    if (deliveredAt == null) return null;
    final daysSince = DateTime.now().difference(deliveredAt!).inDays;
    final remaining = 30 - daysSince;
    return remaining > 0 ? remaining : 0;
  }
}

OrderStatus _statusFromJson(String value) => OrderStatus.fromString(value);
String _statusToJson(OrderStatus status) => status.value;
```

### 2.2 Modelo OrderItem

```dart
// lib/features/orders/data/models/order_item.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../catalog/data/models/product.dart';
import '../../../catalog/data/models/product_variant.dart';

part 'order_item.freezed.dart';
part 'order_item.g.dart';

@freezed
class OrderItem with _$OrderItem {
  const OrderItem._();

  const factory OrderItem({
    required String id,
    @JsonKey(name: 'order_id') required String orderId,
    @JsonKey(name: 'product_id') String? productId,
    @JsonKey(name: 'variant_id') String? variantId,
    required int quantity,
    @JsonKey(name: 'price_at_purchase') required double priceAtPurchase,
    
    // Relaciones
    @JsonKey(name: 'product') Product? product,
    @JsonKey(name: 'variant') ProductVariant? variant,
  }) = _OrderItem;

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);

  /// Precio total del item
  double get totalPrice => priceAtPurchase * quantity;

  /// Nombre del producto (con fallback)
  String get productName => product?.name ?? 'Producto';

  /// Talla (con fallback)
  String get size => variant?.size ?? '-';

  /// URL de imagen (primera disponible)
  String? get imageUrl => product?.images.isNotEmpty == true 
      ? product!.images.first.imageUrl 
      : null;
}
```

### 2.3 Modelo ReturnRequest

```dart
// lib/features/orders/data/models/return_request.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/enums/return_status.dart';
import 'return_item.dart';

part 'return_request.freezed.dart';
part 'return_request.g.dart';

@freezed
class ReturnRequest with _$ReturnRequest {
  const ReturnRequest._();

  const factory ReturnRequest({
    required String id,
    @JsonKey(name: 'order_id') required String orderId,
    @JsonKey(name: 'user_id') String? userId,
    
    // Estado
    @JsonKey(fromJson: _statusFromJson, toJson: _statusToJson) 
    @Default(ReturnStatus.requested) ReturnStatus status,
    
    // Financiero
    @JsonKey(name: 'refund_amount') @Default(0) double refundAmount,
    @JsonKey(name: 'refund_method') @Default('original_payment') String refundMethod,
    
    // Notas
    @JsonKey(name: 'customer_notes') String? customerNotes,
    @JsonKey(name: 'admin_notes') String? adminNotes,
    @JsonKey(name: 'rejection_reason') String? rejectionReason,
    
    // Tracking
    @JsonKey(name: 'tracking_number') String? trackingNumber,
    @JsonKey(name: 'return_label_url') String? returnLabelUrl,
    
    // Timestamps
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @JsonKey(name: 'approved_at') DateTime? approvedAt,
    @JsonKey(name: 'received_at') DateTime? receivedAt,
    @JsonKey(name: 'completed_at') DateTime? completedAt,
    
    // Relaciones
    @JsonKey(name: 'return_items') @Default([]) List<ReturnItem> items,
  }) = _ReturnRequest;

  factory ReturnRequest.fromJson(Map<String, dynamic> json) => 
      _$ReturnRequestFromJson(json);

  /// Verifica si es un estado final
  bool get isFinal => status.isFinal;

  /// Verifica si debe mostrar instrucciones de envío
  bool get showShippingInstructions => status.showShippingInstructions;
}

ReturnStatus _statusFromJson(String value) => ReturnStatus.fromString(value);
String _statusToJson(ReturnStatus status) => status.value;
```

### 2.4 Modelo ReturnItem

```dart
// lib/features/orders/data/models/return_item.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/enums/return_reason.dart';
import '../../../catalog/data/models/product_variant.dart';

part 'return_item.freezed.dart';
part 'return_item.g.dart';

@freezed
class ReturnItem with _$ReturnItem {
  const ReturnItem._();

  const factory ReturnItem({
    required String id,
    @JsonKey(name: 'return_id') required String returnId,
    @JsonKey(name: 'order_item_id') String? orderItemId,
    @JsonKey(name: 'product_variant_id') String? productVariantId,
    
    required int quantity,
    
    @JsonKey(fromJson: _reasonFromJson, toJson: _reasonToJson) 
    required ReturnReason reason,
    @JsonKey(name: 'reason_details') String? reasonDetails,
    
    @JsonKey(name: 'inspection_status') @Default('pending') String inspectionStatus,
    @JsonKey(name: 'inspection_notes') String? inspectionNotes,
    @JsonKey(name: 'restock_approved') @Default(false) bool restockApproved,
    
    @JsonKey(name: 'refund_amount') @Default(0) double refundAmount,
    
    // Relación con variante
    @JsonKey(name: 'product_variants') ProductVariantWithProduct? variant,
  }) = _ReturnItem;

  factory ReturnItem.fromJson(Map<String, dynamic> json) => 
      _$ReturnItemFromJson(json);

  String get productName => variant?.product?.name ?? 'Producto';
  String get size => variant?.size ?? '-';
}

ReturnReason _reasonFromJson(String value) => ReturnReason.fromString(value);
String _reasonToJson(ReturnReason reason) => reason.value;

// Modelo auxiliar para el nested join
@freezed
class ProductVariantWithProduct with _$ProductVariantWithProduct {
  const factory ProductVariantWithProduct({
    required String size,
    @JsonKey(name: 'products') ProductBasic? product,
  }) = _ProductVariantWithProduct;

  factory ProductVariantWithProduct.fromJson(Map<String, dynamic> json) => 
      _$ProductVariantWithProductFromJson(json);
}

@freezed
class ProductBasic with _$ProductBasic {
  const factory ProductBasic({
    required String name,
  }) = _ProductBasic;

  factory ProductBasic.fromJson(Map<String, dynamic> json) => 
      _$ProductBasicFromJson(json);
}
```

### 2.5 Modelo CouponUsage

```dart
// lib/features/orders/data/models/coupon_usage.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'coupon_usage.freezed.dart';
part 'coupon_usage.g.dart';

@freezed
class CouponUsage with _$CouponUsage {
  const factory CouponUsage({
    @JsonKey(name: 'coupons') Coupon? coupon,
  }) = _CouponUsage;

  factory CouponUsage.fromJson(Map<String, dynamic> json) => 
      _$CouponUsageFromJson(json);
}

@freezed
class Coupon with _$Coupon {
  const Coupon._();

  const factory Coupon({
    required String code,
    @JsonKey(name: 'discount_type') required String discountType,
    @JsonKey(name: 'discount_value') required double discountValue,
  }) = _Coupon;

  factory Coupon.fromJson(Map<String, dynamic> json) => _$CouponFromJson(json);

  bool get isPercentage => discountType == 'percentage';
}
```

---

## 3. Utilidades

```dart
// lib/features/orders/domain/utils/order_utils.dart

import 'dart:math';
import '../enums/order_status.dart';
import '../../data/models/order.dart';
import '../../data/models/order_item.dart';
import '../../data/models/coupon_usage.dart';

/// Formatea un número de pedido al formato estándar #A000001
String formatOrderId(int? orderNumber) {
  if (orderNumber == null || orderNumber <= 0) {
    return '#PENDIENTE';
  }
  if (orderNumber > 999999) {
    throw ArgumentError('Order number exceeds display limit');
  }
  return '#A${orderNumber.toString().padLeft(6, '0')}';
}

/// Parsea un ID formateado de vuelta a número
int? parseOrderId(String input) {
  final clean = input.replaceAll(RegExp(r'[^0-9]'), '');
  if (clean.isEmpty) return null;
  final num = int.tryParse(clean);
  return (num != null && num > 0 && num <= 999999) ? num : null;
}

/// Verifica si un string tiene formato de order ID
bool isOrderIdFormat(String input) {
  return RegExp(r'^#?A?\d{1,6}$', caseSensitive: false).hasMatch(input.trim());
}

/// Formatea número de factura
String formatInvoiceNumber(int orderNumber) {
  return 'FV-A${orderNumber.toString().padLeft(6, '0')}';
}

/// Calcula el subtotal de los items
double calculateSubtotal(List<OrderItem> items) {
  return items.fold(0, (sum, item) => sum + item.totalPrice);
}

/// Calcula el descuento aplicado
double calculateDiscount(double subtotal, Coupon? coupon) {
  if (coupon == null) return 0;
  
  if (coupon.isPercentage) {
    return subtotal * (coupon.discountValue / 100);
  }
  return coupon.discountValue;
}

/// Calcula el costo de envío (gratis >= 50€)
double calculateShipping(double subtotal) {
  return subtotal >= 50 ? 0 : 4.99;
}

/// Calcula el total final del pedido
double calculateOrderTotal(List<OrderItem> items, Coupon? coupon) {
  final subtotal = calculateSubtotal(items);
  final discount = min(calculateDiscount(subtotal, coupon), subtotal);
  final shipping = calculateShipping(subtotal);
  return subtotal + shipping - discount;
}

/// Obtiene el mensaje de error para transición de cancelación inválida
String? getCancelErrorMessage(OrderStatus status) {
  return switch (status) {
    OrderStatus.shipped || OrderStatus.delivered => 
      'El pedido ya ha sido enviado. Si deseas devolverlo, utiliza el proceso de devolución.',
    OrderStatus.cancelled => 
      'Este pedido ya está cancelado',
    OrderStatus.pending => 
      'El pedido aún no ha sido pagado. No es necesario cancelarlo.',
    _ => null,
  };
}
```

---

## 4. Repositorios

### 4.1 OrdersRepository

```dart
// lib/features/orders/data/repositories/orders_repository.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/order.dart';

class OrdersRepository {
  final SupabaseClient _supabase;

  OrdersRepository(this._supabase);

  /// Obtiene todos los pedidos del usuario actual
  Future<List<Order>> getOrders() async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Usuario no autenticado');

    final response = await _supabase
        .from('orders')
        .select('''
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            product:products (
              id,
              name,
              slug,
              images:product_images (image_url)
            ),
            variant:product_variants (id, size)
          ),
          coupon_usages (
            coupons (
              code,
              discount_type,
              discount_value
            )
          )
        ''')
        .eq('customer_email', user.email!)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => Order.fromJson(json))
        .toList();
  }

  /// Obtiene un pedido específico por ID
  Future<Order?> getOrder(String orderId) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Usuario no autenticado');

    final response = await _supabase
        .from('orders')
        .select('''
          *,
          order_items (
            id,
            quantity,
            price_at_purchase,
            product:products (
              id,
              name,
              slug,
              images:product_images (image_url)
            ),
            variant:product_variants (id, size)
          ),
          coupon_usages (
            coupons (
              code,
              discount_type,
              discount_value
            )
          )
        ''')
        .eq('id', orderId)
        .eq('customer_email', user.email!)
        .maybeSingle();

    if (response == null) return null;
    return Order.fromJson(response);
  }

  /// Cancela un pedido y procesa el reembolso
  Future<void> cancelOrder(String orderId) async {
    // Usa RPC que maneja Stripe internamente
    final response = await _supabase.rpc('cancel_order', params: {
      'p_order_id': orderId,
    });

    if (response == null) {
      throw Exception('Error al cancelar el pedido');
    }
  }
}
```

### 4.2 ReturnsRepository

```dart
// lib/features/orders/data/repositories/returns_repository.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/return_request.dart';
import '../../domain/enums/return_reason.dart';

class ReturnsRepository {
  final SupabaseClient _supabase;

  ReturnsRepository(this._supabase);

  /// Obtiene la devolución activa de un pedido
  Future<ReturnRequest?> getActiveReturn(String orderId) async {
    final response = await _supabase
        .from('returns')
        .select('''
          *,
          return_items (
            *,
            product_variants:product_variant_id (
              size,
              products:product_id (name)
            )
          )
        ''')
        .eq('order_id', orderId)
        .not('status', 'in', '(rejected,completed)')
        .maybeSingle();

    if (response == null) return null;
    return ReturnRequest.fromJson(response);
  }

  /// Obtiene todas las devoluciones del usuario
  Future<List<ReturnRequest>> getUserReturns() async {
    final response = await _supabase
        .from('returns')
        .select('''
          *,
          return_items (
            *,
            product_variants:product_variant_id (
              size,
              products:product_id (name)
            )
          )
        ''')
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => ReturnRequest.fromJson(json))
        .toList();
  }

  /// Crea una nueva solicitud de devolución
  Future<String> createReturn({
    required String orderId,
    required List<ReturnItemInput> items,
    String? customerNotes,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Usuario no autenticado');

    // Crear la solicitud de devolución
    final returnResponse = await _supabase
        .from('returns')
        .insert({
          'order_id': orderId,
          'user_id': user.id,
          'customer_notes': customerNotes,
          'status': 'requested',
        })
        .select('id')
        .single();

    final returnId = returnResponse['id'] as String;

    // Crear los items de devolución
    final returnItems = items.map((item) => {
      'return_id': returnId,
      'order_item_id': item.orderItemId,
      'product_variant_id': item.productVariantId,
      'quantity': item.quantity,
      'reason': item.reason.value,
      'reason_details': item.reasonDetails,
      'refund_amount': item.estimatedRefund,
    }).toList();

    await _supabase.from('return_items').insert(returnItems);

    // Calcular y actualizar el total estimado
    final totalRefund = items.fold<double>(
      0, 
      (sum, item) => sum + item.estimatedRefund,
    );

    await _supabase
        .from('returns')
        .update({'refund_amount': totalRefund})
        .eq('id', returnId);

    // Actualizar estado del pedido
    await _supabase
        .from('orders')
        .update({'status': 'return_requested'})
        .eq('id', orderId);

    return returnId;
  }
}

/// Input para crear un item de devolución
class ReturnItemInput {
  final String orderItemId;
  final String productVariantId;
  final int quantity;
  final ReturnReason reason;
  final String? reasonDetails;
  final double estimatedRefund;

  ReturnItemInput({
    required this.orderItemId,
    required this.productVariantId,
    required this.quantity,
    required this.reason,
    this.reasonDetails,
    required this.estimatedRefund,
  });
}
```

---

## 5. Checklist de Preparación

- [ ] Crear enum `OrderStatus` con valores y helpers
- [ ] Crear enum `ReturnStatus` con valores y helpers
- [ ] Crear enum `ReturnReason` con valores y labels
- [ ] Crear modelo `Order` con Freezed
- [ ] Crear modelo `OrderItem` con Freezed
- [ ] Crear modelo `ReturnRequest` con Freezed
- [ ] Crear modelo `ReturnItem` con Freezed
- [ ] Crear modelo `CouponUsage` y `Coupon`
- [ ] Crear utilidades de formateo y cálculo
- [ ] Crear `OrdersRepository`
- [ ] Crear `ReturnsRepository`
- [ ] Ejecutar `build_runner` para generar código
