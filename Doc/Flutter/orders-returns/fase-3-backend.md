# Módulo 6: Pedidos y Devoluciones - Fase 3: Backend (Providers)

## 1. Provider de Lista de Pedidos

```dart
// lib/features/orders/providers/orders_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/models/order.dart';
import '../data/repositories/orders_repository.dart';

part 'orders_provider.freezed.dart';

// Repository provider
final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return OrdersRepository(supabase);
});

// State
@freezed
class OrdersListState with _$OrdersListState {
  const factory OrdersListState({
    @Default([]) List<Order> orders,
    @Default(false) bool isLoading,
    String? error,
  }) = _OrdersListState;
}

// Notifier
class OrdersListNotifier extends StateNotifier<OrdersListState> {
  final OrdersRepository _repository;

  OrdersListNotifier(this._repository) : super(const OrdersListState());

  Future<void> loadOrders({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
    );

    try {
      final orders = await _repository.getOrders();
      state = state.copyWith(
        orders: orders,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void removeOrder(String orderId) {
    state = state.copyWith(
      orders: state.orders.where((o) => o.id != orderId).toList(),
    );
  }

  void updateOrderStatus(String orderId, OrderStatus newStatus) {
    state = state.copyWith(
      orders: state.orders.map((order) {
        if (order.id == orderId) {
          return order.copyWith(status: newStatus);
        }
        return order;
      }).toList(),
    );
  }
}

// Provider
final ordersListProvider = 
    StateNotifierProvider<OrdersListNotifier, OrdersListState>((ref) {
  final repository = ref.watch(ordersRepositoryProvider);
  return OrdersListNotifier(repository);
});
```

---

## 2. Provider de Detalle de Pedido

```dart
// lib/features/orders/providers/order_detail_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/models/order.dart';
import '../data/models/return_request.dart';
import '../data/repositories/orders_repository.dart';
import '../data/repositories/returns_repository.dart';

part 'order_detail_provider.freezed.dart';

// State
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

// Notifier
class OrderDetailNotifier extends StateNotifier<OrderDetailState> {
  final String _orderId;
  final OrdersRepository _ordersRepository;
  final ReturnsRepository _returnsRepository;
  final Ref _ref;

  OrderDetailNotifier(
    this._orderId,
    this._ordersRepository,
    this._returnsRepository,
    this._ref,
  ) : super(const OrderDetailState()) {
    loadOrder();
  }

  Future<void> loadOrder() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final order = await _ordersRepository.getOrder(_orderId);
      
      if (order == null) {
        state = state.copyWith(
          isLoading: false,
          error: 'Pedido no encontrado',
        );
        return;
      }

      // Cargar devolución activa si aplica
      ReturnRequest? activeReturn;
      if (order.status.canRequestReturn || 
          order.status.toString().contains('return')) {
        activeReturn = await _returnsRepository.getActiveReturn(_orderId);
      }

      state = state.copyWith(
        order: order,
        activeReturn: activeReturn,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> cancelOrder() async {
    if (state.order == null || !state.order!.canCancel) return false;

    state = state.copyWith(isCancelling: true, error: null);

    try {
      await _ordersRepository.cancelOrder(_orderId);

      // Actualizar estado local
      state = state.copyWith(
        order: state.order!.copyWith(status: OrderStatus.cancelled),
        isCancelling: false,
        successMessage: 'Pedido cancelado. El reembolso se procesará en breve.',
      );

      // Notificar a la lista de pedidos
      _ref.read(ordersListProvider.notifier).updateOrderStatus(
        _orderId, 
        OrderStatus.cancelled,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isCancelling: false,
        error: e.toString(),
      );
      return false;
    }
  }

  void clearMessages() {
    state = state.copyWith(
      error: null,
      successMessage: null,
    );
  }
}

// Provider (family para múltiples pedidos)
final orderDetailProvider = StateNotifierProvider.family<
    OrderDetailNotifier, OrderDetailState, String>((ref, orderId) {
  final ordersRepository = ref.watch(ordersRepositoryProvider);
  final returnsRepository = ref.watch(returnsRepositoryProvider);
  return OrderDetailNotifier(
    orderId, 
    ordersRepository, 
    returnsRepository, 
    ref,
  );
});
```

---

## 3. Provider de Devoluciones

```dart
// lib/features/orders/providers/returns_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/returns_repository.dart';

// Repository provider
final returnsRepositoryProvider = Provider<ReturnsRepository>((ref) {
  final supabase = ref.watch(supabaseProvider);
  return ReturnsRepository(supabase);
});

// Provider simple para obtener devolución activa
final activeReturnProvider = FutureProvider.family<ReturnRequest?, String>(
  (ref, orderId) async {
    final repository = ref.watch(returnsRepositoryProvider);
    return repository.getActiveReturn(orderId);
  },
);

// Provider para todas las devoluciones del usuario
final userReturnsProvider = FutureProvider<List<ReturnRequest>>((ref) async {
  final repository = ref.watch(returnsRepositoryProvider);
  return repository.getUserReturns();
});
```

---

## 4. Provider de Solicitud de Devolución

```dart
// lib/features/orders/providers/return_request_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/models/order.dart';
import '../data/models/order_item.dart';
import '../data/repositories/returns_repository.dart';
import '../domain/enums/return_reason.dart';

part 'return_request_provider.freezed.dart';

// Selección de un item para devolución
@freezed
class ReturnItemSelection with _$ReturnItemSelection {
  const factory ReturnItemSelection({
    @Default(false) bool selected,
    @Default(1) int quantity,
    @Default(ReturnReason.sizeMismatch) ReturnReason reason,
    @Default('') String reasonDetails,
  }) = _ReturnItemSelection;
}

// Estado del formulario de devolución
@freezed
class ReturnRequestFormState with _$ReturnRequestFormState {
  const ReturnRequestFormState._();

  const factory ReturnRequestFormState({
    required Order order,
    @Default({}) Map<String, ReturnItemSelection> selectedItems,
    @Default('') String customerNotes,
    @Default(false) bool isSubmitting,
    String? error,
    String? returnId, // Set on success
  }) = _ReturnRequestFormState;

  bool get hasSelectedItems => 
      selectedItems.values.any((item) => item.selected);

  double get estimatedRefund {
    double total = 0;
    for (final entry in selectedItems.entries) {
      if (!entry.value.selected) continue;
      
      final orderItem = order.items.firstWhere(
        (i) => i.id == entry.key,
        orElse: () => throw StateError('Item not found'),
      );
      total += orderItem.priceAtPurchase * entry.value.quantity;
    }
    return total;
  }

  bool get isSuccess => returnId != null;
}

// Notifier
class ReturnRequestFormNotifier extends StateNotifier<ReturnRequestFormState> {
  final ReturnsRepository _repository;
  final Ref _ref;

  ReturnRequestFormNotifier(
    Order order,
    this._repository,
    this._ref,
  ) : super(ReturnRequestFormState(order: order)) {
    // Inicializar selección para todos los items
    final initialSelection = <String, ReturnItemSelection>{};
    for (final item in order.items) {
      initialSelection[item.id] = const ReturnItemSelection();
    }
    state = state.copyWith(selectedItems: initialSelection);
  }

  void toggleItem(String itemId, bool selected) {
    final current = state.selectedItems[itemId];
    if (current == null) return;

    state = state.copyWith(
      selectedItems: {
        ...state.selectedItems,
        itemId: current.copyWith(selected: selected),
      },
    );
  }

  void updateItemQuantity(String itemId, int quantity) {
    final current = state.selectedItems[itemId];
    if (current == null) return;

    // Validar cantidad
    final orderItem = state.order.items.firstWhere((i) => i.id == itemId);
    final validQuantity = quantity.clamp(1, orderItem.quantity);

    state = state.copyWith(
      selectedItems: {
        ...state.selectedItems,
        itemId: current.copyWith(quantity: validQuantity),
      },
    );
  }

  void updateItemReason(String itemId, ReturnReason reason) {
    final current = state.selectedItems[itemId];
    if (current == null) return;

    state = state.copyWith(
      selectedItems: {
        ...state.selectedItems,
        itemId: current.copyWith(reason: reason),
      },
    );
  }

  void updateItemReasonDetails(String itemId, String details) {
    final current = state.selectedItems[itemId];
    if (current == null) return;

    state = state.copyWith(
      selectedItems: {
        ...state.selectedItems,
        itemId: current.copyWith(reasonDetails: details),
      },
    );
  }

  void setCustomerNotes(String notes) {
    state = state.copyWith(customerNotes: notes);
  }

  Future<bool> submitReturnRequest() async {
    if (!state.hasSelectedItems) {
      state = state.copyWith(
        error: 'Selecciona al menos un artículo para devolver',
      );
      return false;
    }

    state = state.copyWith(isSubmitting: true, error: null);

    try {
      // Preparar items para enviar
      final items = <ReturnItemInput>[];
      
      for (final entry in state.selectedItems.entries) {
        if (!entry.value.selected) continue;

        final orderItem = state.order.items.firstWhere(
          (i) => i.id == entry.key,
        );

        items.add(ReturnItemInput(
          orderItemId: entry.key,
          productVariantId: orderItem.variantId!,
          quantity: entry.value.quantity,
          reason: entry.value.reason,
          reasonDetails: entry.value.reasonDetails.isEmpty 
              ? null 
              : entry.value.reasonDetails,
          estimatedRefund: orderItem.priceAtPurchase * entry.value.quantity,
        ));
      }

      final returnId = await _repository.createReturn(
        orderId: state.order.id,
        items: items,
        customerNotes: state.customerNotes.isEmpty 
            ? null 
            : state.customerNotes,
      );

      state = state.copyWith(
        isSubmitting: false,
        returnId: returnId,
      );

      // Invalidar providers relacionados
      _ref.invalidate(orderDetailProvider(state.order.id));
      _ref.invalidate(activeReturnProvider(state.order.id));

      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: e.toString(),
      );
      return false;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Provider (family por orderId)
final returnRequestFormProvider = StateNotifierProvider.family<
    ReturnRequestFormNotifier, ReturnRequestFormState, String>((ref, orderId) {
  // Necesitamos el pedido para inicializar
  final orderState = ref.watch(orderDetailProvider(orderId));
  final order = orderState.order;
  
  if (order == null) {
    throw StateError('Order not loaded');
  }

  final repository = ref.watch(returnsRepositoryProvider);
  return ReturnRequestFormNotifier(order, repository, ref);
});
```

---

## 5. Provider de Cancelación

```dart
// lib/features/orders/providers/cancel_order_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../data/repositories/orders_repository.dart';

part 'cancel_order_provider.freezed.dart';

@freezed
class CancelOrderState with _$CancelOrderState {
  const factory CancelOrderState({
    @Default(false) bool isCancelling,
    @Default(false) bool success,
    String? error,
  }) = _CancelOrderState;
}

class CancelOrderNotifier extends StateNotifier<CancelOrderState> {
  final OrdersRepository _repository;
  final Ref _ref;

  CancelOrderNotifier(this._repository, this._ref) 
      : super(const CancelOrderState());

  Future<bool> cancelOrder(String orderId) async {
    state = state.copyWith(
      isCancelling: true, 
      error: null, 
      success: false,
    );

    try {
      await _repository.cancelOrder(orderId);
      
      state = state.copyWith(
        isCancelling: false,
        success: true,
      );

      // Actualizar providers relacionados
      _ref.invalidate(orderDetailProvider(orderId));
      _ref.read(ordersListProvider.notifier).updateOrderStatus(
        orderId, 
        OrderStatus.cancelled,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isCancelling: false,
        error: e.toString(),
      );
      return false;
    }
  }

  void reset() {
    state = const CancelOrderState();
  }
}

final cancelOrderProvider = 
    StateNotifierProvider<CancelOrderNotifier, CancelOrderState>((ref) {
  final repository = ref.watch(ordersRepositoryProvider);
  return CancelOrderNotifier(repository, ref);
});
```

---

## 6. Provider de Supabase (si no existe)

```dart
// lib/core/providers/supabase_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(supabaseProvider).auth.currentUser;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
```

---

## 7. Diagrama de Dependencias

```
                    ┌─────────────────────┐
                    │  supabaseProvider   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ordersRepository│  │returnsRepository│  │ (other repos)   │
└────────┬────────┘  └────────┬────────┘  └─────────────────┘
         │                    │
         │    ┌───────────────┴───────────────┐
         │    │                               │
         ▼    ▼                               ▼
┌─────────────────┐                 ┌─────────────────────┐
│ ordersListProv  │                 │ activeReturnProv    │
└────────┬────────┘                 └─────────────────────┘
         │
         ▼
┌─────────────────────┐           ┌─────────────────────┐
│ orderDetailProv(id) │◄─────────►│returnRequestFormProv│
└─────────────────────┘           └─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│ cancelOrderProvider │
└─────────────────────┘
```

---

## 8. Ejemplo de Uso en Screens

```dart
// En OrdersListScreen
class OrdersListScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends ConsumerState<OrdersListScreen> {
  @override
  void initState() {
    super.initState();
    // Cargar pedidos al iniciar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ordersListProvider.notifier).loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ordersListProvider);
    
    if (state.isLoading && state.orders.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null) {
      return Center(child: Text('Error: ${state.error}'));
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(ordersListProvider.notifier).loadOrders(refresh: true),
      child: ListView.builder(
        itemCount: state.orders.length,
        itemBuilder: (context, index) {
          final order = state.orders[index];
          return OrderCard(
            order: order,
            onTap: () => context.push('/account/orders/${order.id}'),
          );
        },
      ),
    );
  }
}

// En OrderDetailScreen
class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(orderDetailProvider(orderId));
    
    return Scaffold(
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.order == null
              ? const Center(child: Text('Pedido no encontrado'))
              : _OrderDetailContent(
                  order: state.order!,
                  activeReturn: state.activeReturn,
                  isCancelling: state.isCancelling,
                  onCancel: () => _confirmCancel(context, ref),
                  onRequestReturn: () => context.push(
                    '/account/orders/$orderId/return',
                  ),
                ),
    );
  }
  
  Future<void> _confirmCancel(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => const CancelOrderDialog(),
    );
    
    if (confirmed == true) {
      await ref.read(orderDetailProvider(orderId).notifier).cancelOrder();
    }
  }
}
```

---

## 9. Checklist de Providers

- [ ] `ordersRepositoryProvider` - Singleton del repositorio
- [ ] `ordersListProvider` - Lista de pedidos con refresh
- [ ] `orderDetailProvider(id)` - Detalle con devolución activa
- [ ] `returnsRepositoryProvider` - Singleton del repositorio
- [ ] `activeReturnProvider(orderId)` - Devolución activa del pedido
- [ ] `returnRequestFormProvider(orderId)` - Formulario de solicitud
- [ ] `cancelOrderProvider` - Proceso de cancelación
- [ ] `supabaseProvider` - Cliente de Supabase
