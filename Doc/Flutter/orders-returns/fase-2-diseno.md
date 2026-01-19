# Módulo 6: Pedidos y Devoluciones - Fase 2: Diseño de Widgets

## 1. OrderStatusBadge

```dart
// lib/features/orders/presentation/widgets/order_status_badge.dart

import 'package:flutter/material.dart';
import '../../domain/enums/order_status.dart';

class OrderStatusBadge extends StatelessWidget {
  final OrderStatus status;
  final bool showAnimation;

  const OrderStatusBadge({
    required this.status,
    this.showAnimation = true,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showAnimation && !status.isFinal) ...[
            _PulsingDot(color: status.textColor),
            const SizedBox(width: 8),
          ],
          Text(
            status.label,
            style: TextStyle(
              color: status.textColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;

  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color.withValues(alpha: _animation.value),
          ),
        );
      },
    );
  }
}
```

---

## 2. OrderCard (para lista)

```dart
// lib/features/orders/presentation/widgets/order_card.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/order.dart';
import '../../domain/utils/order_utils.dart';
import 'order_status_badge.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onTap;

  const OrderCard({
    required this.order,
    this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final subtotal = calculateSubtotal(order.items);
    final total = calculateOrderTotal(order.items, order.appliedCoupon);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: ID + Status + Total
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Pedido ${order.displayId}',
                              style: theme.textTheme.titleSmall?.copyWith(
                                fontFamily: 'monospace',
                              ),
                            ),
                            if (order.appliedCoupon != null) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Cupón aplicado',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.green[700],
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          DateFormat('d MMM yyyy', 'es').format(order.createdAt),
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
                      OrderStatusBadge(status: order.status),
                      const SizedBox(height: 8),
                      Text(
                        NumberFormat.currency(
                          locale: 'es_ES',
                          symbol: '€',
                        ).format(total),
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),

              // Shipping info
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Dirección de envío',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.outline,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          order.shippingAddress,
                          style: theme.textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${order.shippingPostalCode} ${order.shippingCity}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.outline,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right,
                    color: theme.colorScheme.outline,
                  ),
                ],
              ),

              // Status message
              if (_getStatusMessage(order) != null) ...[
                const SizedBox(height: 12),
                Text(
                  _getStatusMessage(order)!,
                  style: TextStyle(
                    fontSize: 13,
                    color: order.status.textColor,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String? _getStatusMessage(Order order) {
    return switch (order.status) {
      OrderStatus.paid => '✓ Pago confirmado',
      OrderStatus.shipped => '📦 En camino',
      OrderStatus.delivered => '🎉 Entregado',
      _ => null,
    };
  }
}
```

---

## 3. OrderItemTile

```dart
// lib/features/orders/presentation/widgets/order_item_tile.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/order_item.dart';

class OrderItemTile extends StatelessWidget {
  final OrderItem item;
  final bool selectable;
  final bool selected;
  final ValueChanged<bool>? onSelectedChanged;

  const OrderItemTile({
    required this.item,
    this.selectable = false,
    this.selected = false,
    this.onSelectedChanged,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'es_ES', symbol: '€');

    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Checkbox (si es seleccionable)
          if (selectable) ...[
            Checkbox(
              value: selected,
              onChanged: (value) => onSelectedChanged?.call(value ?? false),
            ),
            const SizedBox(width: 8),
          ],

          // Imagen
          Container(
            width: 80,
            height: 100,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            clipBehavior: Clip.antiAlias,
            child: item.imageUrl != null
                ? Image.network(
                    item.imageUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _ImagePlaceholder(),
                  )
                : _ImagePlaceholder(),
          ),

          const SizedBox(width: 16),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Talla: ${item.size}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${currencyFormat.format(item.priceAtPurchase)} x ${item.quantity} ud${item.quantity > 1 ? 's' : ''}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
              ],
            ),
          ),

          // Precio total
          Text(
            currencyFormat.format(item.totalPrice),
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Icon(
        Icons.image_outlined,
        size: 32,
        color: Theme.of(context).colorScheme.outline,
      ),
    );
  }
}
```

---

## 4. OrderSummaryCard

```dart
// lib/features/orders/presentation/widgets/order_summary_card.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/order.dart';
import '../../domain/utils/order_utils.dart';

class OrderSummaryCard extends StatelessWidget {
  final Order order;

  const OrderSummaryCard({required this.order, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'es_ES', symbol: '€');

    final subtotal = calculateSubtotal(order.items);
    final coupon = order.appliedCoupon;
    final discount = calculateDiscount(subtotal, coupon);
    final shipping = calculateShipping(subtotal);
    final total = calculateOrderTotal(order.items, coupon);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
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
              'Resumen',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),

            // Subtotal
            _SummaryRow(
              label: 'Subtotal',
              value: currencyFormat.format(subtotal),
            ),

            // Descuento (si aplica)
            if (coupon != null && discount > 0) ...[
              const SizedBox(height: 8),
              _SummaryRow(
                label: 'Descuento (${coupon.code})',
                value: '-${currencyFormat.format(discount)}',
                valueColor: Colors.green,
                suffix: coupon.isPercentage
                    ? ' (-${coupon.discountValue.toInt()}%)'
                    : null,
              ),
            ],

            // Envío
            const SizedBox(height: 8),
            _SummaryRow(
              label: 'Envío',
              value: shipping == 0 ? 'Gratis' : currencyFormat.format(shipping),
              valueColor: shipping == 0 ? Colors.green : null,
            ),

            const Divider(height: 24),

            // Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  currencyFormat.format(total),
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final String? suffix;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.suffix,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.outline,
          ),
        ),
        Row(
          children: [
            Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: valueColor,
              ),
            ),
            if (suffix != null)
              Text(
                suffix!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.outline,
                ),
              ),
          ],
        ),
      ],
    );
  }
}
```

---

## 5. ShippingInfoCard

```dart
// lib/features/orders/presentation/widgets/shipping_info_card.dart

import 'package:flutter/material.dart';
import '../../data/models/order.dart';
import '../../domain/enums/order_status.dart';

class ShippingInfoCard extends StatelessWidget {
  final Order order;

  const ShippingInfoCard({required this.order, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
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
              'Envío y Datos',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),

            // Dirección
            _InfoSection(
              icon: Icons.location_on_outlined,
              title: 'Dirección de entrega',
              children: [
                Text(
                  order.customerName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  order.shippingAddress,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                Text(
                  '${order.shippingPostalCode}, ${order.shippingCity}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                Text(
                  order.shippingCountry.toUpperCase(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Contacto
            _InfoSection(
              icon: Icons.email_outlined,
              title: 'Contacto',
              children: [
                Text(
                  order.customerEmail,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
                if (order.customerPhone != null)
                  Text(
                    order.customerPhone!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
              ],
            ),

            // Status banner
            if (order.status == OrderStatus.shipped) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.blue.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.local_shipping, color: Colors.blue[700], size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pedido Enviado',
                            style: TextStyle(
                              color: Colors.blue[700],
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            'Tu pedido está en camino. Recibirás un aviso de la empresa de transporte.',
                            style: TextStyle(
                              color: Colors.blue[700]?.withValues(alpha: 0.8),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Widget> children;

  const _InfoSection({
    required this.icon,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: theme.colorScheme.outline),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.outline,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              ...children,
            ],
          ),
        ),
      ],
    );
  }
}
```

---

## 6. ReturnStatusBanner

```dart
// lib/features/orders/presentation/widgets/return_status_banner.dart

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../data/models/return_request.dart';

class ReturnStatusBanner extends StatelessWidget {
  final ReturnRequest returnRequest;

  const ReturnStatusBanner({required this.returnRequest, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = returnRequest.status;

    return Container(
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: status.textColor.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.assignment_return,
                  color: status.textColor,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Devolución ${status.label}',
                        style: TextStyle(
                          color: status.textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        status.customerMessage,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.outline,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Instrucciones de envío (si aplica)
          if (status.showShippingInstructions) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface.withValues(alpha: 0.5),
                border: Border(
                  top: BorderSide(
                    color: status.textColor.withValues(alpha: 0.1),
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Dirección de envío
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: Colors.blue[600],
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Dirección de envío',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: theme.colorScheme.outline,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'FashionStore Devoluciones\n'
                              'Calle de la Moda 123\n'
                              '28001 Madrid, España',
                              style: theme.textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Instrucciones
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.info_outline,
                        size: 16,
                        color: Colors.amber[700],
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Incluye el número de pedido en el paquete. '
                          'El reembolso se procesará en 5-7 días hábiles tras recibir el artículo.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.outline,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Etiqueta de devolución (si disponible)
                  if (returnRequest.returnLabelUrl != null) ...[
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => _openReturnLabel(context),
                      icon: const Icon(Icons.download, size: 18),
                      label: const Text('Descargar etiqueta'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _openReturnLabel(BuildContext context) async {
    final url = Uri.parse(returnRequest.returnLabelUrl!);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }
}
```

---

## 7. ReturnItemSelector

```dart
// lib/features/orders/presentation/widgets/return_item_selector.dart

import 'package:flutter/material.dart';
import '../../data/models/order_item.dart';
import '../../domain/enums/return_reason.dart';
import 'return_reason_dropdown.dart';

class ReturnItemSelector extends StatelessWidget {
  final OrderItem item;
  final bool selected;
  final int selectedQuantity;
  final ReturnReason selectedReason;
  final String? reasonDetails;
  final ValueChanged<bool> onSelectedChanged;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<ReturnReason> onReasonChanged;
  final ValueChanged<String> onReasonDetailsChanged;

  const ReturnItemSelector({
    required this.item,
    required this.selected,
    required this.selectedQuantity,
    required this.selectedReason,
    this.reasonDetails,
    required this.onSelectedChanged,
    required this.onQuantityChanged,
    required this.onReasonChanged,
    required this.onReasonDetailsChanged,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: selected 
            ? theme.colorScheme.primaryContainer.withValues(alpha: 0.3)
            : null,
        borderRadius: BorderRadius.circular(12),
        border: selected
            ? Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.3))
            : null,
      ),
      child: Column(
        children: [
          // Item con checkbox
          ListTile(
            leading: Checkbox(
              value: selected,
              onChanged: (value) => onSelectedChanged(value ?? false),
            ),
            title: Text(
              item.productName,
              style: theme.textTheme.titleSmall,
            ),
            subtitle: Text('Talla: ${item.size}'),
            trailing: item.imageUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.imageUrl!,
                      width: 50,
                      height: 60,
                      fit: BoxFit.cover,
                    ),
                  )
                : null,
          ),

          // Opciones (expandidas cuando está seleccionado)
          if (selected)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cantidad
                  Row(
                    children: [
                      Text(
                        'Cantidad a devolver:',
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: theme.colorScheme.outline.withValues(alpha: 0.3),
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18),
                              onPressed: selectedQuantity > 1
                                  ? () => onQuantityChanged(selectedQuantity - 1)
                                  : null,
                              constraints: const BoxConstraints(
                                minWidth: 36,
                                minHeight: 36,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                '$selectedQuantity',
                                style: theme.textTheme.titleSmall,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 18),
                              onPressed: selectedQuantity < item.quantity
                                  ? () => onQuantityChanged(selectedQuantity + 1)
                                  : null,
                              constraints: const BoxConstraints(
                                minWidth: 36,
                                minHeight: 36,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'de ${item.quantity}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.outline,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Motivo
                  ReturnReasonDropdown(
                    value: selectedReason,
                    onChanged: onReasonChanged,
                  ),

                  // Detalles adicionales
                  if (selectedReason.requiresDetails ||
                      (reasonDetails?.isNotEmpty ?? false)) ...[
                    const SizedBox(height: 12),
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Detalles adicionales',
                        hintText: 'Describe el problema...',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      maxLines: 2,
                      onChanged: onReasonDetailsChanged,
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}
```

---

## 8. ReturnReasonDropdown

```dart
// lib/features/orders/presentation/widgets/return_reason_dropdown.dart

import 'package:flutter/material.dart';
import '../../domain/enums/return_reason.dart';

class ReturnReasonDropdown extends StatelessWidget {
  final ReturnReason value;
  final ValueChanged<ReturnReason> onChanged;

  const ReturnReasonDropdown({
    required this.value,
    required this.onChanged,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<ReturnReason>(
      value: value,
      decoration: const InputDecoration(
        labelText: 'Motivo de devolución',
        border: OutlineInputBorder(),
        isDense: true,
      ),
      items: ReturnReason.values.map((reason) {
        return DropdownMenuItem(
          value: reason,
          child: Text(reason.label),
        );
      }).toList(),
      onChanged: (newValue) {
        if (newValue != null) {
          onChanged(newValue);
        }
      },
    );
  }
}
```

---

## 9. OrderActionsCard

```dart
// lib/features/orders/presentation/widgets/order_actions_card.dart

import 'package:flutter/material.dart';
import '../../data/models/order.dart';
import '../../data/models/return_request.dart';
import 'return_status_banner.dart';

class OrderActionsCard extends StatelessWidget {
  final Order order;
  final ReturnRequest? activeReturn;
  final bool isCancelling;
  final VoidCallback? onCancel;
  final VoidCallback? onRequestReturn;

  const OrderActionsCard({
    required this.order,
    this.activeReturn,
    this.isCancelling = false,
    this.onCancel,
    this.onRequestReturn,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Si hay devolución activa, mostrar su estado
    if (activeReturn != null) {
      return ReturnStatusBanner(returnRequest: activeReturn!);
    }

    final canCancel = order.canCancel;
    final canReturn = order.canRequestReturn();
    final daysLeft = order.daysLeftForReturn;

    // Si no hay acciones disponibles
    if (!canCancel && !canReturn) {
      // Si expiró la ventana de devolución
      if (order.status.canRequestReturn && !order.isWithinReturnWindow()) {
        return Card(
          elevation: 0,
          color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  Icons.schedule,
                  color: theme.colorScheme.outline,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'El plazo de 30 días para devoluciones ha expirado',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
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
              'Gestión del Pedido',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),

            // Cancelar
            if (canCancel)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: isCancelling ? null : onCancel,
                  icon: isCancelling
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.close),
                  label: Text(isCancelling ? 'Cancelando...' : 'Cancelar Pedido'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: theme.colorScheme.error,
                    side: BorderSide(color: theme.colorScheme.error.withValues(alpha: 0.5)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),

            // Devolver
            if (canReturn) ...[
              if (canCancel) const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onRequestReturn,
                  icon: const Icon(Icons.assignment_return),
                  label: const Text('Solicitar Devolución'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.amber[700],
                    side: BorderSide(color: Colors.amber.withValues(alpha: 0.5)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              if (daysLeft != null && daysLeft <= 7)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    '⚠️ Quedan $daysLeft días para solicitar devolución',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.amber[700],
                    ),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## 10. Checklist de Widgets

- [ ] `OrderStatusBadge` - Badge con color y animación
- [ ] `OrderCard` - Tarjeta para lista de pedidos
- [ ] `OrderItemTile` - Tile de producto en pedido
- [ ] `OrderSummaryCard` - Resumen de totales
- [ ] `ShippingInfoCard` - Dirección y contacto
- [ ] `ReturnStatusBanner` - Estado de devolución activa
- [ ] `ReturnItemSelector` - Selector de items a devolver
- [ ] `ReturnReasonDropdown` - Dropdown de motivos
- [ ] `OrderActionsCard` - Botones de acción
