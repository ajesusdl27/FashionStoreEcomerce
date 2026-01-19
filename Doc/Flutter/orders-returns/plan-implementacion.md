# Módulo 6: Pedidos y Devoluciones - Plan de Implementación Flutter

## 1. Estructura de Archivos

```
lib/features/orders/
├── data/
│   ├── models/
│   │   ├── order.dart
│   │   ├── order.freezed.dart
│   │   ├── order.g.dart
│   │   ├── order_item.dart
│   │   ├── order_item.freezed.dart
│   │   ├── order_item.g.dart
│   │   ├── return_request.dart
│   │   ├── return_request.freezed.dart
│   │   ├── return_request.g.dart
│   │   ├── return_item.dart
│   │   ├── return_item.freezed.dart
│   │   └── return_item.g.dart
│   └── repositories/
│       ├── orders_repository.dart
│       └── returns_repository.dart
│
├── domain/
│   ├── enums/
│   │   ├── order_status.dart
│   │   ├── return_status.dart
│   │   └── return_reason.dart
│   └── utils/
│       └── order_utils.dart
│
├── providers/
│   ├── orders_provider.dart
│   ├── order_detail_provider.dart
│   ├── cancel_order_provider.dart
│   └── returns_provider.dart
│
└── presentation/
    ├── screens/
    │   ├── orders_list_screen.dart
    │   ├── order_detail_screen.dart
    │   └── return_request_screen.dart
    │
    ├── widgets/
    │   ├── order_card.dart
    │   ├── order_status_badge.dart
    │   ├── order_item_tile.dart
    │   ├── order_summary_card.dart
    │   ├── shipping_info_card.dart
    │   ├── order_actions_card.dart
    │   ├── return_status_banner.dart
    │   ├── return_item_selector.dart
    │   └── return_reason_dropdown.dart
    │
    └── dialogs/
        ├── cancel_order_dialog.dart
        └── return_success_dialog.dart
```

---

## 2. Configuración de Rutas (GoRouter)

```dart
// lib/core/router/app_router.dart

// Rutas de pedidos del cliente
GoRoute(
  path: '/account/orders',
  name: 'orders',
  builder: (context, state) => const OrdersListScreen(),
),
GoRoute(
  path: '/account/orders/:id',
  name: 'orderDetail',
  builder: (context, state) {
    final orderId = state.pathParameters['id']!;
    return OrderDetailScreen(orderId: orderId);
  },
),
GoRoute(
  path: '/account/orders/:id/return',
  name: 'returnRequest',
  builder: (context, state) {
    final orderId = state.pathParameters['id']!;
    return ReturnRequestScreen(orderId: orderId);
  },
),
```

---

## 3. Dependencias Necesarias

```yaml
# pubspec.yaml
dependencies:
  # Ya existentes
  flutter_riverpod: ^2.4.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.0
  supabase_flutter: ^2.0.0
  go_router: ^12.0.0
  intl: ^0.18.0
  
  # Específicas para este módulo
  url_launcher: ^6.2.0  # Para abrir etiqueta de devolución
  
dev_dependencies:
  freezed: ^2.4.0
  json_serializable: ^6.7.0
  build_runner: ^2.4.0
```

---

## 4. Mapeo de APIs

### 4.1 Pedidos

| Operación | Web (Astro) | Flutter |
|-----------|-------------|---------|
| Listar pedidos | Supabase direct | `OrdersRepository.getOrders()` |
| Detalle pedido | Supabase direct | `OrdersRepository.getOrder(id)` |
| Cancelar | `POST /api/orders/cancel` | `OrdersRepository.cancelOrder(id)` |

### 4.2 Devoluciones

| Operación | Web (Astro) | Flutter |
|-----------|-------------|---------|
| Crear solicitud | `POST /api/returns` | `ReturnsRepository.createReturn()` |
| Obtener por pedido | `GET /api/returns?order_id=X` | `ReturnsRepository.getByOrder(orderId)` |

---

## 5. Flujo de Pantallas

```
AccountScreen
     │
     ├── "Mis Pedidos" ──────┬──────────────────────┐
     │                       │                      │
     ▼                       ▼                      ▼
OrdersListScreen ────► OrderDetailScreen ────► ReturnRequestScreen
                            │
                            ├── CancelOrderDialog
                            │
                            └── ReturnStatusBanner
```

---

## 6. Estados de la UI

### 6.1 Lista de Pedidos
```dart
@freezed
class OrdersListState with _$OrdersListState {
  const factory OrdersListState({
    @Default([]) List<Order> orders,
    @Default(false) bool isLoading,
    String? error,
  }) = _OrdersListState;
}
```

### 6.2 Detalle de Pedido
```dart
@freezed
class OrderDetailState with _$OrderDetailState {
  const factory OrderDetailState({
    Order? order,
    ReturnRequest? activeReturn,
    @Default(false) bool isLoading,
    @Default(false) bool isCancelling,
    String? error,
    String? successMessage,
  }) = _OrderDetailState;
}
```

### 6.3 Solicitud de Devolución
```dart
@freezed
class ReturnRequestState with _$ReturnRequestState {
  const factory ReturnRequestState({
    @Default({}) Map<String, ReturnItemSelection> selectedItems,
    @Default('') String customerNotes,
    @Default(false) bool isSubmitting,
    String? error,
    String? returnId,  // Set on success
  }) = _ReturnRequestState;
}

@freezed
class ReturnItemSelection with _$ReturnItemSelection {
  const factory ReturnItemSelection({
    @Default(false) bool selected,
    @Default(1) int quantity,
    @Default(ReturnReason.sizeMismatch) ReturnReason reason,
    @Default('') String reasonDetails,
  }) = _ReturnItemSelection;
}
```

---

## 7. Cálculos de Totales

```dart
class OrderCalculations {
  static double calculateSubtotal(List<OrderItem> items) {
    return items.fold(0, (sum, item) => 
      sum + (item.priceAtPurchase * item.quantity));
  }
  
  static double calculateDiscount(double subtotal, Coupon? coupon) {
    if (coupon == null) return 0;
    
    if (coupon.discountType == 'percentage') {
      return subtotal * (coupon.discountValue / 100);
    }
    return coupon.discountValue;
  }
  
  static double calculateShipping(double subtotal) {
    return subtotal >= 50 ? 0 : 4.99;
  }
  
  static double calculateTotal(
    List<OrderItem> items, 
    Coupon? coupon,
  ) {
    final subtotal = calculateSubtotal(items);
    final discount = min(calculateDiscount(subtotal, coupon), subtotal);
    final shipping = calculateShipping(subtotal);
    return subtotal + shipping - discount;
  }
}
```

---

## 8. Validaciones

### 8.1 Cancelación
```dart
bool canCancelOrder(Order order) {
  return order.status == OrderStatus.paid;
}

String? getCancelErrorMessage(OrderStatus status) {
  return switch (status) {
    OrderStatus.shipped || OrderStatus.delivered => 
      'El pedido ya ha sido enviado. Usa el proceso de devolución.',
    OrderStatus.cancelled => 
      'Este pedido ya está cancelado',
    OrderStatus.pending => 
      'El pedido aún no ha sido pagado.',
    _ => null,
  };
}
```

### 8.2 Devolución
```dart
bool canRequestReturn(Order order, ReturnRequest? existingReturn) {
  if (order.status != OrderStatus.delivered) return false;
  if (existingReturn != null && !existingReturn.isFinal) return false;
  return isWithinReturnWindow(order.deliveredAt);
}

bool isWithinReturnWindow(DateTime? deliveredAt, {int windowDays = 30}) {
  if (deliveredAt == null) return true;
  final daysSince = DateTime.now().difference(deliveredAt).inDays;
  return daysSince <= windowDays;
}
```

---

## 9. Timeline de Desarrollo

### Semana 1: Fundamentos
- [ ] Día 1-2: Modelos Freezed (Order, OrderItem, Return, ReturnItem)
- [ ] Día 3: Enums y utilidades
- [ ] Día 4-5: Repositorios

### Semana 2: Providers y UI Base
- [ ] Día 1-2: Providers (orders, returns)
- [ ] Día 3-4: Widgets base (cards, badges, tiles)
- [ ] Día 5: Diálogos

### Semana 3: Pantallas
- [ ] Día 1-2: OrdersListScreen
- [ ] Día 3-4: OrderDetailScreen
- [ ] Día 5: ReturnRequestScreen

### Semana 4: Integración y Testing
- [ ] Día 1-2: Integración con checkout (post-pago)
- [ ] Día 3: Pruebas de flujo completo
- [ ] Día 4-5: Ajustes y pulido

---

## 10. Consideraciones Especiales

### 10.1 Reembolsos
El reembolso se procesa via Edge Functions que llaman a Stripe:
```dart
// El cliente NO procesa Stripe directamente
// Solo envía la solicitud, el backend hace el reembolso
Future<void> cancelOrder(String orderId) async {
  final response = await supabase.functions.invoke(
    'cancel-order',
    body: {'order_id': orderId},
  );
  // El Edge Function maneja Stripe y actualiza la BD
}
```

### 10.2 Sincronización de Estado
Después de cancelar o crear devolución:
1. Invalidar provider de pedidos
2. Invalidar detalle del pedido específico
3. Mostrar feedback visual
4. Navegar si es necesario

### 10.3 Deep Links
```dart
// Para notificaciones push de estado de devolución
// /orders/abc123?showReturn=true
GoRoute(
  path: '/account/orders/:id',
  builder: (context, state) {
    final orderId = state.pathParameters['id']!;
    final showReturn = state.uri.queryParameters['showReturn'] == 'true';
    return OrderDetailScreen(
      orderId: orderId,
      scrollToReturn: showReturn,
    );
  },
),
```
