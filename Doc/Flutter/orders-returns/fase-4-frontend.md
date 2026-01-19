# Módulo 6: Pedidos y Devoluciones - Fase 4: Frontend (Screens)

## 1. OrdersListScreen

```dart
// lib/features/orders/presentation/screens/orders_list_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/orders_provider.dart';
import '../widgets/order_card.dart';

class OrdersListScreen extends ConsumerStatefulWidget {
  const OrdersListScreen({super.key});

  @override
  ConsumerState<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends ConsumerState<OrdersListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ordersListProvider.notifier).loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ordersListProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('MIS PEDIDOS'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: state.isLoading && state.orders.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.orders.isEmpty
              ? _ErrorView(
                  error: state.error!,
                  onRetry: () => ref.read(ordersListProvider.notifier)
                      .loadOrders(refresh: true),
                )
              : state.orders.isEmpty
                  ? _EmptyOrdersView(
                      onShopNow: () => context.go('/'),
                    )
                  : RefreshIndicator(
                      onRefresh: () async {
                        await ref.read(ordersListProvider.notifier)
                            .loadOrders(refresh: true);
                      },
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final order = state.orders[index];
                          return OrderCard(
                            order: order,
                            onTap: () => context.push(
                              '/account/orders/${order.id}',
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

class _EmptyOrdersView extends StatelessWidget {
  final VoidCallback onShopNow;

  const _EmptyOrdersView({required this.onShopNow});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.shopping_bag_outlined,
                size: 48,
                color: theme.colorScheme.outline,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              '¿Todavía sin pedidos?',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Explora nuestra colección y encuentra tu próximo look favorito',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.outline,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onShopNow,
              icon: const Icon(Icons.shopping_cart_outlined),
              label: const Text('Ir a la tienda'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error al cargar pedidos',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: onRetry,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 2. OrderDetailScreen

```dart
// lib/features/orders/presentation/screens/order_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../providers/order_detail_provider.dart';
import '../widgets/order_status_badge.dart';
import '../widgets/order_item_tile.dart';
import '../widgets/order_summary_card.dart';
import '../widgets/shipping_info_card.dart';
import '../widgets/order_actions_card.dart';
import '../dialogs/cancel_order_dialog.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({required this.orderId, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(orderDetailProvider(orderId));
    final theme = Theme.of(context);

    // Listen for success/error messages
    ref.listen<OrderDetailState>(
      orderDetailProvider(orderId),
      (previous, next) {
        if (next.successMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(next.successMessage!),
              backgroundColor: Colors.green,
            ),
          );
          ref.read(orderDetailProvider(orderId).notifier).clearMessages();
        }
        if (next.error != null && previous?.error != next.error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(next.error!),
              backgroundColor: theme.colorScheme.error,
            ),
          );
        }
      },
    );

    if (state.isLoading && state.order == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (state.order == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.search_off, size: 64),
              const SizedBox(height: 16),
              const Text('Pedido no encontrado'),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.pop(),
                child: const Text('Volver'),
              ),
            ],
          ),
        ),
      );
    }

    final order = state.order!;
    final dateFormat = DateFormat('d MMMM yyyy, HH:mm', 'es_ES');

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            pinned: true,
            expandedHeight: 120,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => context.pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.only(left: 56, bottom: 16),
              title: Text(
                'PEDIDO ${order.displayId}',
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header con fecha y estado
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Realizado el ${dateFormat.format(order.createdAt)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.outline,
                        ),
                      ),
                      OrderStatusBadge(status: order.status),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Productos
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(
                        color: theme.colorScheme.outlineVariant
                            .withValues(alpha: 0.5),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Productos (${order.items.length})',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const Divider(height: 1),
                        ...order.items.map((item) => Column(
                          children: [
                            OrderItemTile(item: item),
                            if (item != order.items.last)
                              const Divider(height: 1),
                          ],
                        )),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Resumen
                  OrderSummaryCard(order: order),

                  const SizedBox(height: 16),

                  // Información de envío
                  ShippingInfoCard(order: order),

                  const SizedBox(height: 16),

                  // Acciones (cancelar/devolver)
                  OrderActionsCard(
                    order: order,
                    activeReturn: state.activeReturn,
                    isCancelling: state.isCancelling,
                    onCancel: () => _showCancelDialog(context, ref),
                    onRequestReturn: () => context.push(
                      '/account/orders/$orderId/return',
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Link de ayuda
                  Center(
                    child: TextButton(
                      onPressed: () => context.push('/contact'),
                      child: Text(
                        '¿Necesitas ayuda con este pedido?',
                        style: theme.textTheme.bodySmall?.copyWith(
                          decoration: TextDecoration.underline,
                          color: theme.colorScheme.outline,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showCancelDialog(BuildContext context, WidgetRef ref) async {
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

## 3. ReturnRequestScreen

```dart
// lib/features/orders/presentation/screens/return_request_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../providers/order_detail_provider.dart';
import '../../providers/return_request_provider.dart';
import '../widgets/return_item_selector.dart';
import '../dialogs/return_success_dialog.dart';

class ReturnRequestScreen extends ConsumerWidget {
  final String orderId;

  const ReturnRequestScreen({required this.orderId, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderState = ref.watch(orderDetailProvider(orderId));
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'es_ES', symbol: '€');

    // Si no hay pedido cargado todavía
    if (orderState.order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Solicitar Devolución')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final formState = ref.watch(returnRequestFormProvider(orderId));

    // Listen for success
    ref.listen<ReturnRequestFormState>(
      returnRequestFormProvider(orderId),
      (previous, next) {
        if (next.isSuccess && previous?.isSuccess != true) {
          _showSuccessDialog(context, ref);
        }
      },
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Solicitar Devolución'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Header info
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pedido ${formState.order.displayId}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Selecciona los artículos que deseas devolver',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
              ],
            ),
          ),

          // Error banner
          if (formState.error != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: theme.colorScheme.errorContainer,
              child: Row(
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 20,
                    color: theme.colorScheme.onErrorContainer,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      formState.error!,
                      style: TextStyle(
                        color: theme.colorScheme.onErrorContainer,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () => ref
                        .read(returnRequestFormProvider(orderId).notifier)
                        .clearError(),
                    color: theme.colorScheme.onErrorContainer,
                  ),
                ],
              ),
            ),

          // Items list
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: formState.order.items.length + 1, // +1 para notas
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                // Último item: notas del cliente
                if (index == formState.order.items.length) {
                  return _CustomerNotesField(
                    value: formState.customerNotes,
                    onChanged: (value) => ref
                        .read(returnRequestFormProvider(orderId).notifier)
                        .setCustomerNotes(value),
                  );
                }

                final item = formState.order.items[index];
                final selection = formState.selectedItems[item.id] ??
                    const ReturnItemSelection();

                return ReturnItemSelector(
                  item: item,
                  selected: selection.selected,
                  selectedQuantity: selection.quantity,
                  selectedReason: selection.reason,
                  reasonDetails: selection.reasonDetails,
                  onSelectedChanged: (value) => ref
                      .read(returnRequestFormProvider(orderId).notifier)
                      .toggleItem(item.id, value),
                  onQuantityChanged: (value) => ref
                      .read(returnRequestFormProvider(orderId).notifier)
                      .updateItemQuantity(item.id, value),
                  onReasonChanged: (value) => ref
                      .read(returnRequestFormProvider(orderId).notifier)
                      .updateItemReason(item.id, value),
                  onReasonDetailsChanged: (value) => ref
                      .read(returnRequestFormProvider(orderId).notifier)
                      .updateItemReasonDetails(item.id, value),
                );
              },
            ),
          ),

          // Bottom bar con resumen y botón
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              border: Border(
                top: BorderSide(
                  color: theme.colorScheme.outlineVariant,
                ),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Reembolso estimado
                  if (formState.hasSelectedItems)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Reembolso estimado',
                            style: theme.textTheme.bodyMedium,
                          ),
                          Text(
                            currencyFormat.format(formState.estimatedRefund),
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Botón de enviar
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: formState.isSubmitting || !formState.hasSelectedItems
                          ? null
                          : () => ref
                              .read(returnRequestFormProvider(orderId).notifier)
                              .submitReturnRequest(),
                      child: formState.isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : const Text('Enviar Solicitud'),
                    ),
                  ),

                  // Disclaimer
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'El reembolso se procesará en 5-7 días hábiles tras recibir el artículo.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.outline,
                        fontSize: 11,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showSuccessDialog(BuildContext context, WidgetRef ref) async {
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const ReturnSuccessDialog(),
    );
    
    if (context.mounted) {
      context.go('/account/orders/$orderId');
    }
  }
}

class _CustomerNotesField extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _CustomerNotesField({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Notas adicionales (opcional)',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(
                hintText: 'Describe cualquier detalle adicional sobre tu devolución...',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 4. Diálogos

### 4.1 CancelOrderDialog

```dart
// lib/features/orders/presentation/dialogs/cancel_order_dialog.dart

import 'package:flutter/material.dart';

class CancelOrderDialog extends StatelessWidget {
  const CancelOrderDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Row(
        children: [
          Icon(
            Icons.warning_amber_rounded,
            color: theme.colorScheme.error,
          ),
          const SizedBox(width: 12),
          const Text('Cancelar Pedido'),
        ],
      ),
      content: const Text(
        '¿Estás seguro de que deseas cancelar este pedido?\n\n'
        'Se procesará automáticamente el reembolso completo a tu método de pago original. '
        'Esta acción no se puede deshacer.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('No, mantener pedido'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          style: FilledButton.styleFrom(
            backgroundColor: theme.colorScheme.error,
          ),
          child: const Text('Sí, cancelar'),
        ),
      ],
    );
  }
}
```

### 4.2 ReturnSuccessDialog

```dart
// lib/features/orders/presentation/dialogs/return_success_dialog.dart

import 'package:flutter/material.dart';

class ReturnSuccessDialog extends StatefulWidget {
  const ReturnSuccessDialog({super.key});

  @override
  State<ReturnSuccessDialog> createState() => _ReturnSuccessDialogState();
}

class _ReturnSuccessDialogState extends State<ReturnSuccessDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 16),
          ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 48,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            '¡Solicitud Enviada!',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Tu solicitud de devolución ha sido registrada correctamente.\n\n'
            'Recibirás un email con las instrucciones de envío una vez que sea aprobada.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.outline,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Entendido'),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 5. Integración con Navegación

```dart
// En app_router.dart

import 'features/orders/presentation/screens/orders_list_screen.dart';
import 'features/orders/presentation/screens/order_detail_screen.dart';
import 'features/orders/presentation/screens/return_request_screen.dart';

// Rutas protegidas (requieren autenticación)
ShellRoute(
  builder: (context, state, child) => AuthGuard(child: child),
  routes: [
    // ... otras rutas de cuenta
    
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
  ],
),
```

---

## 6. Widget de Acceso Rápido (para AccountScreen)

```dart
// lib/features/orders/presentation/widgets/recent_orders_preview.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../providers/orders_provider.dart';
import 'order_status_badge.dart';

class RecentOrdersPreview extends ConsumerWidget {
  const RecentOrdersPreview({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(ordersListProvider);
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'es_ES', symbol: '€');

    // Mostrar solo los 3 pedidos más recientes
    final recentOrders = state.orders.take(3).toList();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Pedidos Recientes',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextButton(
                  onPressed: () => context.push('/account/orders'),
                  child: const Text('Ver todos'),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Content
          if (state.isLoading && recentOrders.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (recentOrders.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.shopping_bag_outlined,
                      size: 48,
                      color: theme.colorScheme.outline,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'No hay pedidos todavía',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.outline,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...recentOrders.map((order) => InkWell(
              onTap: () => context.push('/account/orders/${order.id}'),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            order.displayId,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('d MMM yyyy', 'es')
                                .format(order.createdAt),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.outline,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        OrderStatusBadge(
                          status: order.status,
                          showAnimation: false,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          currencyFormat.format(order.totalAmount ?? 0),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.chevron_right,
                      color: theme.colorScheme.outline,
                    ),
                  ],
                ),
              ),
            )),
        ],
      ),
    );
  }
}
```

---

## 7. Checklist de Screens

### Pantallas principales
- [ ] `OrdersListScreen` - Lista con pull-to-refresh
- [ ] `OrderDetailScreen` - Detalle completo con acciones
- [ ] `ReturnRequestScreen` - Formulario de solicitud

### Diálogos
- [ ] `CancelOrderDialog` - Confirmación de cancelación
- [ ] `ReturnSuccessDialog` - Éxito con animación

### Widgets auxiliares
- [ ] `RecentOrdersPreview` - Para AccountScreen

### Integración
- [ ] Configurar rutas en GoRouter
- [ ] Proteger rutas con AuthGuard
- [ ] Añadir acceso desde AccountScreen
