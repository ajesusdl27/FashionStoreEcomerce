# Módulo 4: Panel de Administración - Fase 2: Diseño UI

## 1. Layout Principal del Admin

### 1.1 AdminScaffold

```dart
// lib/features/admin/common/widgets/admin_scaffold.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'side_menu.dart';
import 'admin_app_bar.dart';

class AdminScaffold extends ConsumerWidget {
  final Widget child;
  final String? title;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  
  const AdminScaffold({
    required this.child,
    this.title,
    this.actions,
    this.floatingActionButton,
    super.key,
  });
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 1024;
    final isTablet = MediaQuery.sizeOf(context).width >= 768;
    
    return Scaffold(
      appBar: isDesktop ? null : AdminAppBar(
        title: title,
        actions: actions,
      ),
      drawer: isDesktop ? null : const AdminDrawer(),
      body: Row(
        children: [
          // Sidebar permanente en desktop
          if (isDesktop) const AdminSideMenu(),
          
          // Sidebar compacto en tablet
          if (isTablet && !isDesktop) const AdminSideMenuCompact(),
          
          // Contenido principal
          Expanded(
            child: Column(
              children: [
                if (isDesktop) 
                  AdminTopBar(title: title, actions: actions),
                Expanded(
                  child: Container(
                    color: Theme.of(context).colorScheme.surfaceContainerLow,
                    child: child,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

/// Drawer para móvil
class AdminDrawer extends StatelessWidget {
  const AdminDrawer({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    Icons.store,
                    size: 32,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'FashionStore',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(),
            
            // Menu items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: adminMenuItems.map((item) {
                  return _AdminDrawerItem(item: item);
                }).toList(),
              ),
            ),
            
            // Logout
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Cerrar Sesión'),
              onTap: () {
                // TODO: Logout
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _AdminDrawerItem extends StatelessWidget {
  final AdminMenuItem item;
  
  const _AdminDrawerItem({required this.item});
  
  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    final isActive = currentPath.startsWith(item.path);
    
    return ListTile(
      leading: Icon(
        isActive ? item.activeIcon : item.icon,
        color: isActive ? Theme.of(context).colorScheme.primary : null,
      ),
      title: Text(
        item.title,
        style: TextStyle(
          fontWeight: isActive ? FontWeight.w600 : null,
          color: isActive ? Theme.of(context).colorScheme.primary : null,
        ),
      ),
      selected: isActive,
      onTap: () {
        Navigator.pop(context);
        context.go(item.path);
      },
    );
  }
}
```

### 1.2 Side Menu (Desktop)

```dart
// lib/features/admin/common/widgets/side_menu.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminMenuItem {
  final String title;
  final IconData icon;
  final IconData activeIcon;
  final String path;
  
  const AdminMenuItem({
    required this.title,
    required this.icon,
    required this.activeIcon,
    required this.path,
  });
}

const adminMenuItems = [
  AdminMenuItem(
    title: 'Dashboard',
    icon: Icons.dashboard_outlined,
    activeIcon: Icons.dashboard,
    path: '/admin/dashboard',
  ),
  AdminMenuItem(
    title: 'Productos',
    icon: Icons.inventory_2_outlined,
    activeIcon: Icons.inventory_2,
    path: '/admin/products',
  ),
  AdminMenuItem(
    title: 'Categorías',
    icon: Icons.category_outlined,
    activeIcon: Icons.category,
    path: '/admin/categories',
  ),
  AdminMenuItem(
    title: 'Cupones',
    icon: Icons.local_offer_outlined,
    activeIcon: Icons.local_offer,
    path: '/admin/coupons',
  ),
  AdminMenuItem(
    title: 'Promociones',
    icon: Icons.campaign_outlined,
    activeIcon: Icons.campaign,
    path: '/admin/promotions',
  ),
  AdminMenuItem(
    title: 'Pedidos',
    icon: Icons.shopping_bag_outlined,
    activeIcon: Icons.shopping_bag,
    path: '/admin/orders',
  ),
  AdminMenuItem(
    title: 'Devoluciones',
    icon: Icons.assignment_return_outlined,
    activeIcon: Icons.assignment_return,
    path: '/admin/returns',
  ),
  AdminMenuItem(
    title: 'Newsletter',
    icon: Icons.mail_outlined,
    activeIcon: Icons.mail,
    path: '/admin/newsletter',
  ),
  AdminMenuItem(
    title: 'Configuración',
    icon: Icons.settings_outlined,
    activeIcon: Icons.settings,
    path: '/admin/settings',
  ),
];

class AdminSideMenu extends StatelessWidget {
  const AdminSideMenu({super.key});
  
  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          right: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Column(
        children: [
          // Logo header
          Container(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.store,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'FashionStore',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Panel Admin',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const Divider(height: 1),
          
          // Menu items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              children: adminMenuItems.map((item) {
                final isActive = currentPath.startsWith(item.path);
                return _SideMenuItem(
                  item: item,
                  isActive: isActive,
                );
              }).toList(),
            ),
          ),
          
          // User section
          const Divider(height: 1),
          _UserSection(),
        ],
      ),
    );
  }
}

class _SideMenuItem extends StatelessWidget {
  final AdminMenuItem item;
  final bool isActive;
  
  const _SideMenuItem({
    required this.item,
    required this.isActive,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: isActive 
            ? theme.colorScheme.primaryContainer 
            : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () => context.go(item.path),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            child: Row(
              children: [
                Icon(
                  isActive ? item.activeIcon : item.icon,
                  size: 22,
                  color: isActive 
                      ? theme.colorScheme.primary 
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.title,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                      color: isActive 
                          ? theme.colorScheme.primary 
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UserSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // final adminUser = ref.watch(adminAuthProvider).valueOrNull;
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Text(
              'A', // Primera letra del nombre
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Admin',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Super Admin',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 20),
            onPressed: () {
              // TODO: Logout
            },
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
    );
  }
}

/// Versión compacta para tablet (solo iconos)
class AdminSideMenuCompact extends StatelessWidget {
  const AdminSideMenuCompact({super.key});
  
  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    
    return Container(
      width: 72,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          right: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 16),
          // Logo
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.store,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(height: 24),
          
          // Menu items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: adminMenuItems.map((item) {
                final isActive = currentPath.startsWith(item.path);
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Tooltip(
                    message: item.title,
                    preferBelow: false,
                    child: InkWell(
                      onTap: () => context.go(item.path),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isActive 
                              ? Theme.of(context).colorScheme.primaryContainer 
                              : null,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          isActive ? item.activeIcon : item.icon,
                          color: isActive 
                              ? Theme.of(context).colorScheme.primary 
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 2. Componentes de Dashboard

### 2.1 StatCard (KPI Card)

```dart
// lib/features/admin/common/widgets/stat_card.dart

import 'package:flutter/material.dart';

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color? iconColor;
  final double? trend;
  final String? subtitle;
  final VoidCallback? onTap;
  
  const StatCard({
    required this.title,
    required this.value,
    required this.icon,
    this.iconColor,
    this.trend,
    this.subtitle,
    this.onTap,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = iconColor ?? theme.colorScheme.primary;
    
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
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.outline,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          value,
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: color,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      icon,
                      color: color,
                      size: 28,
                    ),
                  ),
                ],
              ),
              
              if (trend != null || subtitle != null) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    if (trend != null)
                      _TrendBadge(trend: trend!),
                    if (trend != null && subtitle != null)
                      const SizedBox(width: 8),
                    if (subtitle != null)
                      Expanded(
                        child: Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.outline,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _TrendBadge extends StatelessWidget {
  final double trend;
  
  const _TrendBadge({required this.trend});
  
  @override
  Widget build(BuildContext context) {
    final isPositive = trend >= 0;
    final color = isPositive ? Colors.green : Colors.red;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isPositive ? Icons.trending_up : Icons.trending_down,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            '${isPositive ? '+' : ''}${trend.toStringAsFixed(1)}%',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
```

### 2.2 Sales Chart

```dart
// lib/features/admin/dashboard/presentation/widgets/sales_chart.dart

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../models/analytics_data.dart';

class SalesChart extends StatelessWidget {
  final List<DailySales> data;
  
  const SalesChart({required this.data, super.key});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    if (data.isEmpty) {
      return Center(
        child: Text(
          'No hay datos de ventas disponibles',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.outline,
          ),
        ),
      );
    }
    
    final maxY = data.map((d) => d.revenue).reduce((a, b) => a > b ? a : b);
    final roundedMaxY = ((maxY / 100).ceil() * 100).toDouble();
    
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: roundedMaxY > 0 ? roundedMaxY : 100,
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipRoundedRadius: 8,
            tooltipPadding: const EdgeInsets.all(12),
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              final sale = data[group.x.toInt()];
              return BarTooltipItem(
                '${sale.label}\n',
                theme.textTheme.bodySmall!.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                children: [
                  TextSpan(
                    text: '${sale.revenue.toStringAsFixed(2)}€\n',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  TextSpan(
                    text: '${sale.orderCount} pedidos',
                    style: const TextStyle(
                      fontWeight: FontWeight.normal,
                      fontSize: 12,
                    ),
                  ),
                ],
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= data.length) return const SizedBox();
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    data[value.toInt()].label,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 50,
              getTitlesWidget: (value, meta) {
                if (value == 0) return const SizedBox();
                return Text(
                  '${value.toInt()}€',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: roundedMaxY > 0 ? roundedMaxY / 4 : 25,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: theme.colorScheme.outlineVariant.withValues(alpha: 0.3),
              strokeWidth: 1,
            );
          },
        ),
        barGroups: data.asMap().entries.map((entry) {
          final index = entry.key;
          final sale = entry.value;
          
          return BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                toY: sale.revenue,
                color: theme.colorScheme.primary,
                width: 28,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(6),
                  topRight: Radius.circular(6),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
```

### 2.3 Low Stock Alert

```dart
// lib/features/admin/dashboard/presentation/widgets/low_stock_alert.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../common/models/analytics_data.dart';

class LowStockAlert extends StatelessWidget {
  final List<LowStockProduct> products;
  
  const LowStockAlert({required this.products, super.key});
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    if (products.isEmpty) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: Colors.green,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                'Stock en niveles óptimos',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: Colors.green,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return Card(
      elevation: 0,
      color: Colors.orange.withValues(alpha: 0.05),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Colors.orange.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: Colors.orange,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Stock bajo (${products.length} productos)',
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: Colors.orange.shade800,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: products.length.clamp(0, 5),
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final product = products[index];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 4,
                ),
                leading: product.imageUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          product.imageUrl!,
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                        ),
                      )
                    : Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.image_not_supported_outlined),
                      ),
                title: Text(
                  product.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  _formatStockInfo(product.variants),
                  style: TextStyle(
                    color: Colors.orange.shade700,
                    fontSize: 12,
                  ),
                ),
                trailing: FilledButton.tonal(
                  onPressed: () => context.go('/admin/products/${product.id}'),
                  child: const Text('Editar'),
                ),
              );
            },
          ),
          
          if (products.length > 5)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Center(
                child: TextButton(
                  onPressed: () => context.go('/admin/products?status=low-stock'),
                  child: Text('Ver todos (${products.length})'),
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  String _formatStockInfo(List<VariantStock> variants) {
    final lowStock = variants.where((v) => v.stock < 5).toList();
    if (lowStock.isEmpty) return '';
    
    if (lowStock.length <= 2) {
      return lowStock.map((v) => '${v.size}: ${v.stock}').join(', ');
    }
    
    return '${lowStock.length} tallas con stock bajo';
  }
}
```

---

## 3. Componentes de Formulario

### 3.1 Image Uploader

```dart
// lib/features/admin/common/widgets/image_uploader.dart

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:reorderable_grid_view/reorderable_grid_view.dart';

class ImageUploader extends StatefulWidget {
  final List<String> initialImages;
  final ValueChanged<List<String>>? onImagesChanged;
  final Future<String> Function(Uint8List bytes, String fileName) onUpload;
  final int maxImages;
  
  const ImageUploader({
    this.initialImages = const [],
    this.onImagesChanged,
    required this.onUpload,
    this.maxImages = 10,
    super.key,
  });
  
  @override
  State<ImageUploader> createState() => _ImageUploaderState();
}

class _ImageUploaderState extends State<ImageUploader> {
  late List<_ImageItem> _images;
  bool _isUploading = false;
  
  @override
  void initState() {
    super.initState();
    _images = widget.initialImages
        .map((url) => _ImageItem(url: url))
        .toList();
  }
  
  Future<void> _pickImages() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: true,
      withData: true,
    );
    
    if (result == null || result.files.isEmpty) return;
    
    final remainingSlots = widget.maxImages - _images.length;
    final filesToUpload = result.files.take(remainingSlots).toList();
    
    for (final file in filesToUpload) {
      if (file.bytes == null) continue;
      
      setState(() {
        _images.add(_ImageItem(isUploading: true));
        _isUploading = true;
      });
      
      try {
        final url = await widget.onUpload(file.bytes!, file.name);
        setState(() {
          final index = _images.lastIndexWhere((i) => i.isUploading);
          if (index != -1) {
            _images[index] = _ImageItem(url: url);
          }
        });
      } catch (e) {
        setState(() {
          _images.removeWhere((i) => i.isUploading && i.url == null);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
    
    setState(() => _isUploading = false);
    _notifyChange();
  }
  
  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
    _notifyChange();
  }
  
  void _reorderImages(int oldIndex, int newIndex) {
    setState(() {
      final item = _images.removeAt(oldIndex);
      _images.insert(newIndex, item);
    });
    _notifyChange();
  }
  
  void _notifyChange() {
    final urls = _images
        .where((i) => i.url != null)
        .map((i) => i.url!)
        .toList();
    widget.onImagesChanged?.call(urls);
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Grid de imágenes
        ReorderableGridView.count(
          crossAxisCount: 3,
          childAspectRatio: 1,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          onReorder: _reorderImages,
          children: [
            for (var i = 0; i < _images.length; i++)
              _ImageTile(
                key: ValueKey(_images[i].url ?? 'uploading_$i'),
                imageUrl: _images[i].url,
                isUploading: _images[i].isUploading,
                isFirst: i == 0,
                onRemove: () => _removeImage(i),
              ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Botón de agregar
        if (_images.length < widget.maxImages)
          OutlinedButton.icon(
            onPressed: _isUploading ? null : _pickImages,
            icon: const Icon(Icons.add_photo_alternate_outlined),
            label: Text(
              _images.isEmpty 
                  ? 'Agregar imágenes' 
                  : 'Agregar más (${_images.length}/${widget.maxImages})',
            ),
          ),
        
        const SizedBox(height: 8),
        Text(
          'Arrastra para reordenar. La primera imagen será la principal.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.outline,
          ),
        ),
      ],
    );
  }
}

class _ImageItem {
  final String? url;
  final bool isUploading;
  
  _ImageItem({
    this.url,
    this.isUploading = false,
  });
}

class _ImageTile extends StatelessWidget {
  final String? imageUrl;
  final bool isUploading;
  final bool isFirst;
  final VoidCallback onRemove;
  
  const _ImageTile({
    required this.imageUrl,
    required this.isUploading,
    required this.isFirst,
    required this.onRemove,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isFirst 
              ? theme.colorScheme.primary 
              : theme.colorScheme.outlineVariant,
          width: isFirst ? 2 : 1,
        ),
      ),
      child: Stack(
        children: [
          // Imagen o placeholder
          ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: isUploading
                ? Container(
                    color: theme.colorScheme.surfaceContainerHighest,
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  )
                : imageUrl != null
                    ? Image.network(
                        imageUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                      )
                    : Container(
                        color: theme.colorScheme.surfaceContainerHighest,
                        child: const Icon(Icons.image_not_supported),
                      ),
          ),
          
          // Badge "Principal"
          if (isFirst)
            Positioned(
              left: 4,
              bottom: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Principal',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          
          // Botón eliminar
          if (!isUploading)
            Positioned(
              right: 4,
              top: 4,
              child: IconButton.filled(
                onPressed: onRemove,
                icon: const Icon(Icons.close, size: 16),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(4),
                  minimumSize: const Size(28, 28),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
```

### 3.2 Variant Editor (Tallas y Stock)

```dart
// lib/features/admin/products/presentation/widgets/variant_editor.dart

import 'package:flutter/material.dart';

class VariantEditor extends StatefulWidget {
  final List<VariantData> variants;
  final ValueChanged<List<VariantData>> onChanged;
  final SizeType sizeType;
  
  const VariantEditor({
    required this.variants,
    required this.onChanged,
    required this.sizeType,
    super.key,
  });
  
  @override
  State<VariantEditor> createState() => _VariantEditorState();
}

class _VariantEditorState extends State<VariantEditor> {
  late List<VariantData> _variants;
  
  @override
  void initState() {
    super.initState();
    _variants = List.from(widget.variants);
    _ensureAllSizes();
  }
  
  @override
  void didUpdateWidget(VariantEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sizeType != widget.sizeType) {
      _ensureAllSizes();
    }
  }
  
  void _ensureAllSizes() {
    final sizes = _getSizesForType(widget.sizeType);
    
    // Agregar tallas que faltan
    for (final size in sizes) {
      if (!_variants.any((v) => v.size == size)) {
        _variants.add(VariantData(size: size, stock: 0));
      }
    }
    
    // Ordenar según el orden del tipo
    _variants.sort((a, b) {
      final indexA = sizes.indexOf(a.size);
      final indexB = sizes.indexOf(b.size);
      return indexA.compareTo(indexB);
    });
    
    setState(() {});
  }
  
  List<String> _getSizesForType(SizeType type) {
    return switch (type) {
      SizeType.clothing => ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      SizeType.footwear => ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
      SizeType.universal => ['Única'],
    };
  }
  
  void _updateStock(int index, int stock) {
    setState(() {
      _variants[index] = _variants[index].copyWith(stock: stock);
    });
    widget.onChanged(_variants);
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Stock por Talla',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Tipo de tallas: ${widget.sizeType.displayName}',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.outline,
          ),
        ),
        const SizedBox(height: 16),
        
        // Grid de tallas
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: _variants.asMap().entries.map((entry) {
            final index = entry.key;
            final variant = entry.value;
            
            return _VariantTile(
              size: variant.size,
              stock: variant.stock,
              onStockChanged: (stock) => _updateStock(index, stock),
            );
          }).toList(),
        ),
        
        // Resumen
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Stock total:',
                style: theme.textTheme.bodyMedium,
              ),
              Text(
                '${_variants.fold(0, (sum, v) => sum + v.stock)} unidades',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _VariantTile extends StatelessWidget {
  final String size;
  final int stock;
  final ValueChanged<int> onStockChanged;
  
  const _VariantTile({
    required this.size,
    required this.stock,
    required this.onStockChanged,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLowStock = stock > 0 && stock < 5;
    final isOutOfStock = stock == 0;
    
    return Container(
      width: 100,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isOutOfStock 
            ? Colors.red.withValues(alpha: 0.05)
            : isLowStock
                ? Colors.orange.withValues(alpha: 0.05)
                : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isOutOfStock
              ? Colors.red.withValues(alpha: 0.3)
              : isLowStock
                  ? Colors.orange.withValues(alpha: 0.3)
                  : theme.colorScheme.outlineVariant,
        ),
      ),
      child: Column(
        children: [
          Text(
            size,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _StockButton(
                icon: Icons.remove,
                onPressed: stock > 0 ? () => onStockChanged(stock - 1) : null,
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 32,
                child: Text(
                  '$stock',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isOutOfStock 
                        ? Colors.red 
                        : isLowStock 
                            ? Colors.orange 
                            : null,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _StockButton(
                icon: Icons.add,
                onPressed: () => onStockChanged(stock + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StockButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  
  const _StockButton({
    required this.icon,
    this.onPressed,
  });
  
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 24,
      height: 24,
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, size: 14),
        padding: EdgeInsets.zero,
        style: IconButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
        ),
      ),
    );
  }
}

class VariantData {
  final String size;
  final int stock;
  final String? sku;
  
  const VariantData({
    required this.size,
    required this.stock,
    this.sku,
  });
  
  VariantData copyWith({
    String? size,
    int? stock,
    String? sku,
  }) {
    return VariantData(
      size: size ?? this.size,
      stock: stock ?? this.stock,
      sku: sku ?? this.sku,
    );
  }
}

enum SizeType {
  clothing,
  footwear,
  universal;
  
  String get displayName => switch (this) {
    SizeType.clothing => 'Ropa (XXS-XXL)',
    SizeType.footwear => 'Calzado (36-46)',
    SizeType.universal => 'Talla única',
  };
}
```

---

## 4. Data Tables

### 4.1 Orders Data Table

```dart
// lib/features/admin/orders/presentation/widgets/orders_data_table.dart

import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class OrdersDataTable extends StatelessWidget {
  final List<OrderSummary> orders;
  final bool isLoading;
  final int totalCount;
  final int currentPage;
  final ValueChanged<int> onPageChanged;
  
  const OrdersDataTable({
    required this.orders,
    required this.isLoading,
    required this.totalCount,
    required this.currentPage,
    required this.onPageChanged,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm', 'es');
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: DataTable2(
        columnSpacing: 12,
        horizontalMargin: 16,
        minWidth: 700,
        headingRowDecoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
          ),
        ),
        columns: const [
          DataColumn2(
            label: Text('Nº Pedido'),
            size: ColumnSize.S,
          ),
          DataColumn2(
            label: Text('Cliente'),
            size: ColumnSize.L,
          ),
          DataColumn2(
            label: Text('Fecha'),
            size: ColumnSize.M,
          ),
          DataColumn2(
            label: Text('Total'),
            size: ColumnSize.S,
            numeric: true,
          ),
          DataColumn2(
            label: Text('Estado'),
            size: ColumnSize.M,
          ),
          DataColumn2(
            label: Text(''),
            size: ColumnSize.S,
          ),
        ],
        rows: orders.map((order) {
          return DataRow2(
            onTap: () => context.go('/admin/orders/${order.id}'),
            cells: [
              DataCell(
                Text(
                  order.orderNumber,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              DataCell(Text(order.customerName)),
              DataCell(Text(dateFormat.format(order.createdAt))),
              DataCell(
                Text(
                  '${order.totalAmount.toStringAsFixed(2)}€',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              DataCell(OrderStatusBadge(status: order.status)),
              DataCell(
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () => context.go('/admin/orders/${order.id}'),
                ),
              ),
            ],
          );
        }).toList(),
        empty: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.inbox_outlined,
                  size: 48,
                  color: theme.colorScheme.outline,
                ),
                const SizedBox(height: 16),
                Text(
                  'No hay pedidos',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class OrderStatusBadge extends StatelessWidget {
  final OrderStatus status;
  
  const OrderStatusBadge({required this.status, super.key});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: status.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: status.color.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            status.icon,
            style: const TextStyle(fontSize: 12),
          ),
          const SizedBox(width: 6),
          Text(
            status.displayName,
            style: TextStyle(
              color: status.color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

// Extension para OrderStatus
extension OrderStatusUI on OrderStatus {
  String get displayName => switch (this) {
    OrderStatus.pending => 'Pendiente',
    OrderStatus.paid => 'Pagado',
    OrderStatus.shipped => 'Enviado',
    OrderStatus.delivered => 'Entregado',
    OrderStatus.cancelled => 'Cancelado',
    OrderStatus.returnRequested => 'Devolución solicitada',
    OrderStatus.returnApproved => 'Devolución aprobada',
    OrderStatus.returnShipped => 'Devolución en tránsito',
    OrderStatus.returnReceived => 'Devolución recibida',
    OrderStatus.returnCompleted => 'Devolución completada',
    OrderStatus.partiallyRefunded => 'Reembolso parcial',
  };
  
  String get icon => switch (this) {
    OrderStatus.pending => '🕐',
    OrderStatus.paid => '💰',
    OrderStatus.shipped => '📦',
    OrderStatus.delivered => '✅',
    OrderStatus.cancelled => '❌',
    OrderStatus.returnRequested => '↩️',
    OrderStatus.returnApproved => '✓',
    OrderStatus.returnShipped => '🚚',
    OrderStatus.returnReceived => '📥',
    OrderStatus.returnCompleted => '💸',
    OrderStatus.partiallyRefunded => '💱',
  };
  
  Color get color => switch (this) {
    OrderStatus.pending => Colors.amber,
    OrderStatus.paid => Colors.green,
    OrderStatus.shipped => Colors.blue,
    OrderStatus.delivered => Colors.teal,
    OrderStatus.cancelled => Colors.red,
    OrderStatus.returnRequested => Colors.orange,
    OrderStatus.returnApproved => Colors.indigo,
    OrderStatus.returnShipped => Colors.purple,
    OrderStatus.returnReceived => Colors.deepPurple,
    OrderStatus.returnCompleted => Colors.green,
    OrderStatus.partiallyRefunded => Colors.cyan,
  };
}
```

---

## 5. Dialogs y Modales

### 5.1 Confirmation Dialog

```dart
// lib/features/admin/common/widgets/confirmation_dialog.dart

import 'package:flutter/material.dart';

Future<bool> showConfirmationDialog(
  BuildContext context, {
  required String title,
  required String message,
  String confirmText = 'Confirmar',
  String cancelText = 'Cancelar',
  bool isDangerous = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => ConfirmationDialog(
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText,
      isDangerous: isDangerous,
    ),
  );
  
  return result ?? false;
}

class ConfirmationDialog extends StatelessWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final bool isDangerous;
  
  const ConfirmationDialog({
    required this.title,
    required this.message,
    required this.confirmText,
    required this.cancelText,
    required this.isDangerous,
    super.key,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Row(
        children: [
          if (isDangerous)
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                color: Colors.red,
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.help_outline,
                color: theme.colorScheme.primary,
              ),
            ),
          const SizedBox(width: 12),
          Expanded(child: Text(title)),
        ],
      ),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text(cancelText),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          style: isDangerous
              ? FilledButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                )
              : null,
          child: Text(confirmText),
        ),
      ],
    );
  }
}
```

---

## 6. Checklist de Diseño UI

### Layout
- [ ] AdminScaffold con responsive
- [ ] SideMenu desktop (expandido)
- [ ] SideMenu tablet (compacto)
- [ ] Drawer móvil
- [ ] TopBar con acciones

### Dashboard
- [ ] StatCard con trend
- [ ] SalesChart con fl_chart
- [ ] LowStockAlert
- [ ] RecentOrdersList

### Formularios
- [ ] ImageUploader con drag & drop
- [ ] VariantEditor por tipo de talla
- [ ] Rich text editor integrado
- [ ] Date pickers

### Data Tables
- [ ] OrdersDataTable
- [ ] ProductsDataTable
- [ ] CouponsDataTable
- [ ] StatusBadges para cada entidad

### Dialogs
- [ ] ConfirmationDialog
- [ ] FormDialog (categorías, cupones)
- [ ] ImagePreviewDialog
