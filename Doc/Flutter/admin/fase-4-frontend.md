# Módulo 4: Panel de Administración - Fase 4: Frontend (Screens)

## 1. Dashboard Screen

```dart
// lib/features/admin/dashboard/presentation/screens/dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../common/widgets/admin_scaffold.dart';
import '../../../common/widgets/stat_card.dart';
import '../../providers/analytics_provider.dart';
import '../widgets/sales_chart.dart';
import '../widgets/low_stock_alert.dart';
import '../widgets/recent_orders_list.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyticsAsync = ref.watch(dashboardAnalyticsProvider);
    
    return AdminScaffold(
      title: 'Dashboard',
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => ref.invalidate(dashboardAnalyticsProvider),
          tooltip: 'Actualizar datos',
        ),
      ],
      child: analyticsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _ErrorView(
          error: error.toString(),
          onRetry: () => ref.invalidate(dashboardAnalyticsProvider),
        ),
        data: (data) => _DashboardContent(data: data),
      ),
    );
  }
}

class _DashboardContent extends StatelessWidget {
  final AnalyticsData data;
  
  const _DashboardContent({required this.data});
  
  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'es_ES', symbol: '€');
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Título del mes
          Text(
            'Resumen de ${DateFormat.MMMM('es').format(DateTime.now())}',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          
          // KPIs Grid
          LayoutBuilder(
            builder: (context, constraints) {
              final crossAxisCount = constraints.maxWidth > 1200 ? 4 
                  : constraints.maxWidth > 800 ? 3 
                  : constraints.maxWidth > 500 ? 2 
                  : 1;
              
              return GridView.count(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.8,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  StatCard(
                    title: 'Ingresos del Mes',
                    value: currencyFormat.format(data.monthlyRevenue.total),
                    icon: Icons.euro,
                    iconColor: Colors.green,
                    trend: data.monthlyRevenue.trend,
                    subtitle: '${data.monthlyRevenue.orderCount} pedidos',
                    onTap: () => context.go('/admin/orders'),
                  ),
                  StatCard(
                    title: 'Pedidos Pendientes',
                    value: '${data.pendingOrders.total}',
                    icon: Icons.access_time,
                    iconColor: Colors.orange,
                    subtitle: '${data.pendingOrders.paid} listos para enviar',
                    onTap: () => context.go('/admin/orders?status=paid'),
                  ),
                  if (data.bestSellingProduct != null)
                    StatCard(
                      title: 'Más Vendido',
                      value: '${data.bestSellingProduct!.totalQuantity} uds',
                      icon: Icons.star,
                      iconColor: Colors.amber,
                      subtitle: data.bestSellingProduct!.productName,
                      onTap: () => context.go('/admin/products/${data.bestSellingProduct!.productId}'),
                    ),
                  StatCard(
                    title: 'Stock Bajo',
                    value: '${data.lowStockProducts.length}',
                    icon: Icons.inventory_2,
                    iconColor: data.lowStockProducts.isEmpty ? Colors.green : Colors.red,
                    subtitle: data.lowStockProducts.isEmpty 
                        ? 'Todo en orden' 
                        : 'Productos por reponer',
                    onTap: () => context.go('/admin/products?status=low-stock'),
                  ),
                ],
              );
            },
          ),
          
          const SizedBox(height: 32),
          
          // Gráfico de ventas y alertas
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 900) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: _SalesChartCard(data: data.salesLast7Days),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      flex: 1,
                      child: LowStockAlert(products: data.lowStockProducts),
                    ),
                  ],
                );
              }
              
              return Column(
                children: [
                  _SalesChartCard(data: data.salesLast7Days),
                  const SizedBox(height: 24),
                  LowStockAlert(products: data.lowStockProducts),
                ],
              );
            },
          ),
          
          const SizedBox(height: 32),
          
          // Pedidos recientes
          RecentOrdersList(orders: data.recentOrders),
        ],
      ),
    );
  }
}

class _SalesChartCard extends StatelessWidget {
  final List<DailySales> data;
  
  const _SalesChartCard({required this.data});
  
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
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Ventas - Últimos 7 días',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                _TotalSalesBadge(data: data),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 250,
              child: SalesChart(data: data),
            ),
          ],
        ),
      ),
    );
  }
}

class _TotalSalesBadge extends StatelessWidget {
  final List<DailySales> data;
  
  const _TotalSalesBadge({required this.data});
  
  @override
  Widget build(BuildContext context) {
    final total = data.fold<double>(0, (sum, d) => sum + d.revenue);
    final format = NumberFormat.currency(locale: 'es_ES', symbol: '€');
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        format.format(total),
        style: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.w600,
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
            'Error al cargar datos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(error),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }
}
```

---

## 2. Products List Screen

```dart
// lib/features/admin/products/presentation/screens/products_list_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../common/widgets/admin_scaffold.dart';
import '../../../common/widgets/confirmation_dialog.dart';
import '../../providers/admin_products_provider.dart';
import '../widgets/product_filters.dart';
import '../widgets/products_grid.dart';

class ProductsListScreen extends ConsumerStatefulWidget {
  const ProductsListScreen({super.key});
  
  @override
  ConsumerState<ProductsListScreen> createState() => _ProductsListScreenState();
}

class _ProductsListScreenState extends ConsumerState<ProductsListScreen> {
  String _search = '';
  String? _categoryId;
  ProductStatusFilter _status = ProductStatusFilter.all;
  int _page = 1;
  
  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(adminProductsListProvider(
      search: _search.isEmpty ? null : _search,
      categoryId: _categoryId,
      status: _status,
      page: _page,
    ));
    
    return AdminScaffold(
      title: 'Productos',
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => ref.invalidate(adminProductsListProvider),
          tooltip: 'Actualizar',
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/admin/products/new'),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo Producto'),
      ),
      child: Column(
        children: [
          // Filtros
          ProductFilters(
            search: _search,
            categoryId: _categoryId,
            status: _status,
            onSearchChanged: (value) => setState(() {
              _search = value;
              _page = 1;
            }),
            onCategoryChanged: (value) => setState(() {
              _categoryId = value;
              _page = 1;
            }),
            onStatusChanged: (value) => setState(() {
              _status = value;
              _page = 1;
            }),
          ),
          
          // Lista de productos
          Expanded(
            child: productsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error: $error'),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => ref.invalidate(adminProductsListProvider),
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
              data: (products) {
                if (products.isEmpty) {
                  return _EmptyProductsView(hasFilters: _hasActiveFilters);
                }
                
                return ProductsGrid(
                  products: products,
                  onEdit: (product) => context.go('/admin/products/${product.id}'),
                  onToggleActive: (product) => _toggleActive(product),
                  onDelete: (product) => _deleteProduct(product),
                );
              },
            ),
          ),
          
          // Paginación
          _PaginationBar(
            currentPage: _page,
            onPageChanged: (page) => setState(() => _page = page),
          ),
        ],
      ),
    );
  }
  
  bool get _hasActiveFilters => 
      _search.isNotEmpty || _categoryId != null || _status != ProductStatusFilter.all;
  
  Future<void> _toggleActive(Product product) async {
    await ref.read(adminProductsListProvider(
      search: _search.isEmpty ? null : _search,
      categoryId: _categoryId,
      status: _status,
      page: _page,
    ).notifier).toggleActive(product.id, !product.isActive);
  }
  
  Future<void> _deleteProduct(Product product) async {
    final confirmed = await showConfirmationDialog(
      context,
      title: 'Eliminar producto',
      message: '¿Estás seguro de que quieres eliminar "${product.name}"? Esta acción se puede deshacer.',
      confirmText: 'Eliminar',
      isDangerous: true,
    );
    
    if (confirmed) {
      await ref.read(adminProductsListProvider(
        search: _search.isEmpty ? null : _search,
        categoryId: _categoryId,
        status: _status,
        page: _page,
      ).notifier).deleteProduct(product.id);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Producto eliminado')),
        );
      }
    }
  }
}

class _EmptyProductsView extends StatelessWidget {
  final bool hasFilters;
  
  const _EmptyProductsView({required this.hasFilters});
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            hasFilters ? Icons.search_off : Icons.inventory_2_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            hasFilters 
                ? 'No se encontraron productos' 
                : 'No hay productos',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasFilters 
                ? 'Prueba con otros filtros' 
                : 'Crea tu primer producto',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          if (!hasFilters) ...[
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => context.go('/admin/products/new'),
              icon: const Icon(Icons.add),
              label: const Text('Crear Producto'),
            ),
          ],
        ],
      ),
    );
  }
}

class _PaginationBar extends StatelessWidget {
  final int currentPage;
  final ValueChanged<int> onPageChanged;
  
  const _PaginationBar({
    required this.currentPage,
    required this.onPageChanged,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: currentPage > 1 
                ? () => onPageChanged(currentPage - 1) 
                : null,
          ),
          const SizedBox(width: 16),
          Text('Página $currentPage'),
          const SizedBox(width: 16),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () => onPageChanged(currentPage + 1),
          ),
        ],
      ),
    );
  }
}
```

---

## 3. Product Form Screen

```dart
// lib/features/admin/products/presentation/screens/product_form_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../common/widgets/admin_scaffold.dart';
import '../../../common/widgets/image_uploader.dart';
import '../../providers/admin_products_provider.dart';
import '../widgets/variant_editor.dart';

class ProductFormScreen extends ConsumerStatefulWidget {
  final String? productId;
  
  const ProductFormScreen({this.productId, super.key});
  
  @override
  ConsumerState<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends ConsumerState<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _nameController;
  late TextEditingController _slugController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;
  late TextEditingController _offerPriceController;
  
  String? _categoryId;
  SizeType _sizeType = SizeType.clothing;
  List<String> _images = [];
  List<VariantData> _variants = [];
  bool _isActive = true;
  bool _isFeatured = false;
  
  bool _isLoading = false;
  bool _isInitialized = false;
  
  bool get isEditing => widget.productId != null;
  
  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _slugController = TextEditingController();
    _descriptionController = TextEditingController();
    _priceController = TextEditingController();
    _offerPriceController = TextEditingController();
    
    // Auto-generar slug desde nombre
    _nameController.addListener(_generateSlug);
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _slugController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _offerPriceController.dispose();
    super.dispose();
  }
  
  void _generateSlug() {
    if (!isEditing || !_isInitialized) {
      final name = _nameController.text;
      final slug = name
          .toLowerCase()
          .replaceAll(RegExp(r'[áàäâ]'), 'a')
          .replaceAll(RegExp(r'[éèëê]'), 'e')
          .replaceAll(RegExp(r'[íìïî]'), 'i')
          .replaceAll(RegExp(r'[óòöô]'), 'o')
          .replaceAll(RegExp(r'[úùüû]'), 'u')
          .replaceAll(RegExp(r'ñ'), 'n')
          .replaceAll(RegExp(r'[^a-z0-9\s-]'), '')
          .replaceAll(RegExp(r'\s+'), '-')
          .replaceAll(RegExp(r'-+'), '-')
          .trim();
      _slugController.text = slug;
    }
  }
  
  void _initializeFromProduct(Product product) {
    if (_isInitialized) return;
    
    _nameController.text = product.name;
    _slugController.text = product.slug;
    _descriptionController.text = product.description ?? '';
    _priceController.text = product.price.toString();
    _offerPriceController.text = product.offerPrice?.toString() ?? '';
    _categoryId = product.categoryId;
    _sizeType = product.category?.sizeType ?? SizeType.clothing;
    _images = List.from(product.images);
    _variants = product.variants.map((v) => VariantData(
      size: v.size,
      stock: v.stock,
      sku: v.sku,
    )).toList();
    _isActive = product.isActive;
    _isFeatured = product.isFeatured;
    
    _isInitialized = true;
  }
  
  @override
  Widget build(BuildContext context) {
    // Cargar producto si estamos editando
    if (isEditing) {
      final productAsync = ref.watch(adminProductDetailProvider(widget.productId!));
      
      return productAsync.when(
        loading: () => AdminScaffold(
          title: 'Cargando...',
          child: const Center(child: CircularProgressIndicator()),
        ),
        error: (error, _) => AdminScaffold(
          title: 'Error',
          child: Center(child: Text('Error: $error')),
        ),
        data: (product) {
          if (product == null) {
            return AdminScaffold(
              title: 'Producto no encontrado',
              child: const Center(child: Text('El producto no existe')),
            );
          }
          _initializeFromProduct(product);
          return _buildForm();
        },
      );
    }
    
    return _buildForm();
  }
  
  Widget _buildForm() {
    return AdminScaffold(
      title: isEditing ? 'Editar Producto' : 'Nuevo Producto',
      actions: [
        if (isEditing)
          TextButton.icon(
            onPressed: _isLoading ? null : () => context.go('/admin/products'),
            icon: const Icon(Icons.close),
            label: const Text('Cancelar'),
          ),
        const SizedBox(width: 8),
        FilledButton.icon(
          onPressed: _isLoading ? null : _saveProduct,
          icon: _isLoading 
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.save),
          label: Text(_isLoading ? 'Guardando...' : 'Guardar'),
        ),
      ],
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Layout responsivo
              LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 900) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 2, child: _buildMainForm()),
                        const SizedBox(width: 24),
                        Expanded(flex: 1, child: _buildSidebar()),
                      ],
                    );
                  }
                  
                  return Column(
                    children: [
                      _buildMainForm(),
                      const SizedBox(height: 24),
                      _buildSidebar(),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildMainForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Información básica
        _SectionCard(
          title: 'Información Básica',
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Nombre del producto *',
                hintText: 'Ej: Camiseta Premium',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El nombre es obligatorio';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _slugController,
              decoration: const InputDecoration(
                labelText: 'Slug (URL) *',
                hintText: 'camiseta-premium',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El slug es obligatorio';
                }
                if (!RegExp(r'^[a-z0-9-]+$').hasMatch(value)) {
                  return 'Solo letras minúsculas, números y guiones';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Descripción',
                hintText: 'Describe el producto...',
                alignLabelWithHint: true,
              ),
              maxLines: 5,
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Imágenes
        _SectionCard(
          title: 'Imágenes',
          children: [
            ImageUploader(
              initialImages: _images,
              onImagesChanged: (urls) => setState(() => _images = urls),
              onUpload: _uploadImage,
              maxImages: 10,
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Variantes
        _SectionCard(
          title: 'Inventario',
          children: [
            VariantEditor(
              variants: _variants,
              sizeType: _sizeType,
              onChanged: (variants) => setState(() => _variants = variants),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildSidebar() {
    return Column(
      children: [
        // Estado
        _SectionCard(
          title: 'Estado',
          children: [
            SwitchListTile(
              title: const Text('Producto activo'),
              subtitle: const Text('Visible en la tienda'),
              value: _isActive,
              onChanged: (value) => setState(() => _isActive = value),
            ),
            SwitchListTile(
              title: const Text('Destacado'),
              subtitle: const Text('Mostrar en página principal'),
              value: _isFeatured,
              onChanged: (value) => setState(() => _isFeatured = value),
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Precios
        _SectionCard(
          title: 'Precios',
          children: [
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(
                labelText: 'Precio *',
                prefixText: '€ ',
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'El precio es obligatorio';
                }
                if (double.tryParse(value) == null) {
                  return 'Introduce un número válido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _offerPriceController,
              decoration: const InputDecoration(
                labelText: 'Precio de oferta',
                prefixText: '€ ',
                hintText: 'Dejar vacío si no hay oferta',
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Categoría
        _SectionCard(
          title: 'Categoría',
          children: [
            // Selector de categoría (Consumer para categorías)
            Consumer(
              builder: (context, ref, _) {
                final categoriesAsync = ref.watch(adminCategoriesListProvider);
                
                return categoriesAsync.when(
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const Text('Error al cargar categorías'),
                  data: (categories) => DropdownButtonFormField<String>(
                    value: _categoryId,
                    decoration: const InputDecoration(
                      labelText: 'Categoría *',
                    ),
                    items: categories.map((cat) => DropdownMenuItem(
                      value: cat.id,
                      child: Text(cat.name),
                    )).toList(),
                    onChanged: (value) {
                      if (value != null) {
                        final category = categories.firstWhere((c) => c.id == value);
                        setState(() {
                          _categoryId = value;
                          _sizeType = category.sizeType;
                        });
                      }
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Selecciona una categoría';
                      }
                      return null;
                    },
                  ),
                );
              },
            ),
          ],
        ),
      ],
    );
  }
  
  Future<String> _uploadImage(Uint8List bytes, String fileName) async {
    // Implementar subida a Supabase Storage
    final supabase = ref.read(supabaseClientProvider);
    
    final path = 'products/${DateTime.now().millisecondsSinceEpoch}_$fileName';
    
    await supabase.storage.from('images').uploadBinary(path, bytes);
    
    final url = supabase.storage.from('images').getPublicUrl(path);
    return url;
  }
  
  Future<void> _saveProduct() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_images.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Añade al menos una imagen')),
      );
      return;
    }
    
    if (_categoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona una categoría')),
      );
      return;
    }
    
    setState(() => _isLoading = true);
    
    try {
      final formData = ProductFormData(
        name: _nameController.text,
        slug: _slugController.text,
        description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
        price: double.parse(_priceController.text),
        offerPrice: _offerPriceController.text.isEmpty 
            ? null 
            : double.parse(_offerPriceController.text),
        categoryId: _categoryId!,
        images: _images,
        isActive: _isActive,
        isFeatured: _isFeatured,
        variants: _variants.map((v) => VariantFormData(
          size: v.size,
          stock: v.stock,
          sku: v.sku,
        )).toList(),
      );
      
      final mutations = ref.read(productMutationsProvider.notifier);
      
      if (isEditing) {
        await mutations.updateProduct(widget.productId!, formData);
      } else {
        await mutations.createProduct(formData);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isEditing ? 'Producto actualizado' : 'Producto creado'),
          ),
        );
        context.go('/admin/products');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  
  const _SectionCard({
    required this.title,
    required this.children,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }
}
```

---

## 4. Orders List Screen

```dart
// lib/features/admin/orders/presentation/screens/orders_list_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../common/widgets/admin_scaffold.dart';
import '../../providers/admin_orders_provider.dart';
import '../widgets/orders_data_table.dart';
import '../widgets/order_status_filter.dart';

class OrdersListScreen extends ConsumerStatefulWidget {
  const OrdersListScreen({super.key});
  
  @override
  ConsumerState<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends ConsumerState<OrdersListScreen> {
  OrderStatus? _statusFilter;
  String _search = '';
  int _page = 1;
  
  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(adminOrdersListProvider(
      statusFilter: _statusFilter,
      search: _search.isEmpty ? null : _search,
      page: _page,
    ));
    
    return AdminScaffold(
      title: 'Pedidos',
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => ref.invalidate(adminOrdersListProvider),
          tooltip: 'Actualizar',
        ),
      ],
      child: Column(
        children: [
          // Barra de filtros
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Búsqueda
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar por nombre, email o nº pedido...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _search = value;
                        _page = 1;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 16),
                
                // Filtro de estado
                OrderStatusFilter(
                  selectedStatus: _statusFilter,
                  onStatusChanged: (status) {
                    setState(() {
                      _statusFilter = status;
                      _page = 1;
                    });
                  },
                ),
              ],
            ),
          ),
          
          // Tabla de pedidos
          Expanded(
            child: ordersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(child: Text('Error: $error')),
              data: (result) => Column(
                children: [
                  Expanded(
                    child: OrdersDataTable(
                      orders: result.orders,
                      isLoading: false,
                      totalCount: result.totalCount,
                      currentPage: result.currentPage,
                      onPageChanged: (page) => setState(() => _page = page),
                    ),
                  ),
                  
                  // Paginación
                  _buildPagination(result),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPagination(OrdersListResult result) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Mostrando ${result.orders.length} de ${result.totalCount} pedidos',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: result.hasPreviousPage
                    ? () => setState(() => _page--)
                    : null,
              ),
              Text('Página $_page de ${result.totalPages}'),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: result.hasNextPage
                    ? () => setState(() => _page++)
                    : null,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

---

## 5. Checklist de Pantallas

### Dashboard
- [ ] `DashboardScreen` con KPIs
- [ ] Grid responsivo de StatCards
- [ ] `SalesChart` integrado
- [ ] `LowStockAlert` con navegación
- [ ] `RecentOrdersList` con acciones

### Productos
- [ ] `ProductsListScreen` con filtros
- [ ] `ProductsGrid` responsivo
- [ ] `ProductFormScreen` crear/editar
- [ ] `ImageUploader` integrado
- [ ] `VariantEditor` por tipo de talla
- [ ] Validación de formulario

### Pedidos
- [ ] `OrdersListScreen` con paginación
- [ ] `OrderDetailScreen` completo
- [ ] `OrderStatusFilter` dropdown
- [ ] `OrderTimeline` de estados
- [ ] Acciones: enviar, entregar, cancelar

### Devoluciones
- [ ] `ReturnsListScreen` con tabs
- [ ] `ReturnDetailScreen` 
- [ ] Acciones: aprobar, rechazar, completar
- [ ] Calculador de reembolso

### Cupones y Promociones
- [ ] `CouponsScreen` con dialog CRUD
- [ ] `PromotionsListScreen`
- [ ] `PromotionWizardScreen` 4 pasos
- [ ] `PromotionCalendarScreen`
- [ ] `RuleBuilder` widget

### Newsletter y Settings
- [ ] `NewsletterScreen` con export
- [ ] `SettingsScreen` con tabs
