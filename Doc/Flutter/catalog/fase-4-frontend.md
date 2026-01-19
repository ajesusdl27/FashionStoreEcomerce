# Fase 4: Frontend y Widgets - Catálogo de Productos

## 4.1 Widget: ProductCard

```dart
// lib/features/catalog/presentation/widgets/product_card.dart
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../data/models/product_model.dart';
import 'package:fashionstore/core/utils/formatters.dart';
import 'package:fashionstore/core/utils/image_utils.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback? onTap;
  
  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen con badges
          _ProductImage(product: product),
          const SizedBox(height: 8),
          // Nombre del producto
          Text(
            product.name,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          // Precio
          _PriceDisplay(product: product),
        ],
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final ProductModel product;
  
  const _ProductImage({required this.product});
  
  @override
  Widget build(BuildContext context) {
    final imageUrl = product.mainImageUrl;
    
    return AspectRatio(
      aspectRatio: 1,
      child: Stack(
        children: [
          // Imagen principal con Hero
          Positioned.fill(
            child: Hero(
              tag: 'product-image-${product.id}',
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: ImageSizes.card(imageUrl),
                        fit: BoxFit.cover,
                        placeholder: (context, url) => _buildShimmer(),
                        errorWidget: (context, url, error) => _buildErrorWidget(),
                      )
                    : _buildPlaceholder(),
              ),
            ),
          ),
          
          // Badge de descuento
          if (product.hasOffer)
            Positioned(
              top: 8,
              left: 8,
              child: _DiscountBadge(percent: product.discountPercent),
            ),
          
          // Badge de stock bajo
          if (product.isLowStock && product.isAvailable)
            Positioned(
              bottom: 8,
              left: 8,
              right: 8,
              child: _LowStockBadge(stock: product.totalStock),
            ),
          
          // Overlay de agotado
          if (!product.isAvailable)
            Positioned.fill(
              child: _SoldOutOverlay(),
            ),
        ],
      ),
    );
  }
  
  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: AppColors.cardBg,
      highlightColor: AppColors.border,
      child: Container(color: AppColors.cardBg),
    );
  }
  
  Widget _buildErrorWidget() {
    return Container(
      color: AppColors.cardBg,
      child: const Center(
        child: Icon(Icons.image_not_supported_outlined, color: AppColors.mutedForeground),
      ),
    );
  }
  
  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.cardBg,
      child: const Center(
        child: Icon(Icons.image_outlined, color: AppColors.mutedForeground),
      ),
    );
  }
}

class _DiscountBadge extends StatelessWidget {
  final int percent;
  
  const _DiscountBadge({required this.percent});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '-$percent%',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _LowStockBadge extends StatelessWidget {
  final int stock;
  
  const _LowStockBadge({required this.stock});
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.9),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.bolt, size: 14, color: Colors.black87),
          const SizedBox(width: 4),
          Text(
            'Últimas $stock unidades',
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _SoldOutOverlay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.background.withOpacity(0.8),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(4),
          ),
          child: const Text(
            'AGOTADO',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );
  }
}

class _PriceDisplay extends StatelessWidget {
  final ProductModel product;
  
  const _PriceDisplay({required this.product});
  
  @override
  Widget build(BuildContext context) {
    if (product.hasOffer) {
      return Row(
        children: [
          Text(
            formatPrice(product.offerPrice!),
            style: const TextStyle(
              color: AppColors.accent,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            formatPrice(product.price),
            style: TextStyle(
              color: AppColors.mutedForeground,
              fontSize: 14,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        ],
      );
    }
    
    return Text(
      formatPrice(product.price),
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}
```

---

## 4.2 Widget: ProductGrid

```dart
// lib/features/catalog/presentation/widgets/product_grid.dart
import 'package:flutter/material.dart';
import '../../data/models/product_model.dart';
import 'product_card.dart';
import 'product_card_skeleton.dart';

class ProductGrid extends StatelessWidget {
  final List<ProductModel> products;
  final bool isLoading;
  final VoidCallback? onRefresh;
  final void Function(ProductModel)? onProductTap;
  final ScrollController? controller;
  
  const ProductGrid({
    super.key,
    required this.products,
    this.isLoading = false,
    this.onRefresh,
    this.onProductTap,
    this.controller,
  });
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return _buildSkeletonGrid(context);
    }
    
    if (products.isEmpty) {
      return _buildEmptyState(context);
    }
    
    return RefreshIndicator(
      onRefresh: () async => onRefresh?.call(),
      color: Theme.of(context).colorScheme.primary,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final crossAxisCount = _getColumnCount(constraints.maxWidth);
          final spacing = constraints.maxWidth < 600 ? 12.0 : 16.0;
          
          return GridView.builder(
            controller: controller,
            padding: EdgeInsets.all(spacing),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: spacing,
              crossAxisSpacing: spacing,
              childAspectRatio: 0.65, // Imagen + texto
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return ProductCard(
                product: product,
                onTap: () => onProductTap?.call(product),
              );
            },
          );
        },
      ),
    );
  }
  
  int _getColumnCount(double width) {
    if (width < 400) return 2;
    if (width < 600) return 2;
    if (width < 900) return 3;
    if (width < 1200) return 4;
    return 5;
  }
  
  Widget _buildSkeletonGrid(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = _getColumnCount(constraints.maxWidth);
        final spacing = constraints.maxWidth < 600 ? 12.0 : 16.0;
        
        return GridView.builder(
          padding: EdgeInsets.all(spacing),
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: spacing,
            crossAxisSpacing: spacing,
            childAspectRatio: 0.65,
          ),
          itemCount: 6,
          itemBuilder: (context, index) => const ProductCardSkeleton(),
        );
      },
    );
  }
  
  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No se encontraron productos',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Prueba con otros filtros o términos de búsqueda',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 4.3 Widget: ProductCardSkeleton

```dart
// lib/features/catalog/presentation/widgets/product_card_skeleton.dart
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class ProductCardSkeleton extends StatelessWidget {
  const ProductCardSkeleton({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.cardBg,
      highlightColor: AppColors.border,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen placeholder
          AspectRatio(
            aspectRatio: 1,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Título placeholder
          Container(
            height: 14,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 6),
          // Segunda línea título
          Container(
            height: 14,
            width: 100,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 8),
          // Precio placeholder
          Container(
            height: 18,
            width: 70,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 4.4 Widget: ProductFiltersSheet

```dart
// lib/features/catalog/presentation/widgets/product_filters_sheet.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/category_model.dart';
import '../../data/models/product_filters.dart';
import '../providers/product_filters_provider.dart';
import '../providers/categories_provider.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class ProductFiltersSheet extends ConsumerStatefulWidget {
  const ProductFiltersSheet({super.key});
  
  @override
  ConsumerState<ProductFiltersSheet> createState() => _ProductFiltersSheetState();
}

class _ProductFiltersSheetState extends ConsumerState<ProductFiltersSheet> {
  late TextEditingController _searchController;
  late TextEditingController _minPriceController;
  late TextEditingController _maxPriceController;
  late ProductFilters _tempFilters;
  
  @override
  void initState() {
    super.initState();
    _tempFilters = ref.read(productFiltersNotifierProvider);
    _searchController = TextEditingController(text: _tempFilters.search ?? '');
    _minPriceController = TextEditingController(
      text: _tempFilters.minPrice?.toString() ?? '',
    );
    _maxPriceController = TextEditingController(
      text: _tempFilters.maxPrice?.toString() ?? '',
    );
  }
  
  @override
  void dispose() {
    _searchController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            children: [
              // Drag handle
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Filtros',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Búsqueda
                    _buildSearchSection(),
                    const SizedBox(height: 24),
                    
                    // Categorías
                    categoriesAsync.when(
                      data: (categories) => _buildCategoriesSection(categories),
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (_, __) => const Text('Error al cargar categorías'),
                    ),
                    const SizedBox(height: 24),
                    
                    // Rango de precio
                    _buildPriceRangeSection(),
                    const SizedBox(height: 24),
                    
                    // Solo ofertas
                    _buildOffersSection(),
                    const SizedBox(height: 24),
                    
                    // Ordenar por
                    _buildSortSection(),
                    const SizedBox(height: 32),
                    
                    // Botones de acción
                    _buildActionButtons(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildSearchSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Buscar'),
        const SizedBox(height: 8),
        TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Buscar productos...',
            prefixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) {
            _tempFilters = _tempFilters.copyWith(search: value);
          },
        ),
      ],
    );
  }
  
  Widget _buildCategoriesSection(List<CategoryModel> categories) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Categorías'),
        const SizedBox(height: 8),
        // Opción "Todas"
        RadioListTile<String?>(
          title: const Text('Todas'),
          value: null,
          groupValue: _tempFilters.categorySlug,
          onChanged: (value) {
            setState(() {
              _tempFilters = _tempFilters.copyWith(categorySlug: value);
            });
          },
          contentPadding: EdgeInsets.zero,
          dense: true,
        ),
        // Categorías dinámicas
        ...categories.map((cat) => RadioListTile<String?>(
          title: Text(cat.name),
          value: cat.slug,
          groupValue: _tempFilters.categorySlug,
          onChanged: (value) {
            setState(() {
              _tempFilters = _tempFilters.copyWith(categorySlug: value);
            });
          },
          contentPadding: EdgeInsets.zero,
          dense: true,
        )),
      ],
    );
  }
  
  Widget _buildPriceRangeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Rango de Precio'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _minPriceController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Min €',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onChanged: (value) {
                  final min = double.tryParse(value);
                  _tempFilters = _tempFilters.copyWith(minPrice: min);
                },
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text('-'),
            ),
            Expanded(
              child: TextField(
                controller: _maxPriceController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Max €',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onChanged: (value) {
                  final max = double.tryParse(value);
                  _tempFilters = _tempFilters.copyWith(maxPrice: max);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildOffersSection() {
    return SwitchListTile(
      title: Row(
        children: [
          const Icon(Icons.local_fire_department, color: AppColors.accent),
          const SizedBox(width: 8),
          const Text('Solo ofertas'),
        ],
      ),
      value: _tempFilters.offersOnly,
      onChanged: (value) {
        setState(() {
          _tempFilters = _tempFilters.copyWith(offersOnly: value);
        });
      },
      contentPadding: EdgeInsets.zero,
    );
  }
  
  Widget _buildSortSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Ordenar por'),
        const SizedBox(height: 8),
        DropdownButtonFormField<ProductSortBy>(
          value: _tempFilters.sortBy,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: const [
            DropdownMenuItem(
              value: ProductSortBy.newest,
              child: Text('Más recientes'),
            ),
            DropdownMenuItem(
              value: ProductSortBy.priceAsc,
              child: Text('Precio: menor a mayor'),
            ),
            DropdownMenuItem(
              value: ProductSortBy.priceDesc,
              child: Text('Precio: mayor a menor'),
            ),
            DropdownMenuItem(
              value: ProductSortBy.nameAz,
              child: Text('Nombre A-Z'),
            ),
          ],
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _tempFilters = _tempFilters.copyWith(sortBy: value);
              });
            }
          },
        ),
      ],
    );
  }
  
  Widget _buildActionButtons() {
    return Column(
      children: [
        // Limpiar filtros
        if (_tempFilters.hasActiveFilters)
          TextButton(
            onPressed: () {
              setState(() {
                _tempFilters = const ProductFilters();
                _searchController.clear();
                _minPriceController.clear();
                _maxPriceController.clear();
              });
            },
            child: const Text('Limpiar filtros'),
          ),
        const SizedBox(height: 8),
        // Aplicar
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              ref.read(productFiltersNotifierProvider.notifier)
                  .applyFilters(_tempFilters);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text('APLICAR'),
          ),
        ),
      ],
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 1,
        color: AppColors.mutedForeground,
      ),
    );
  }
}
```

---

## 4.5 Widget: SizeSelector

```dart
// lib/features/catalog/presentation/widgets/size_selector.dart
import 'package:flutter/material.dart';
import '../../data/models/product_variant_model.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class SizeSelector extends StatelessWidget {
  final List<ProductVariantModel> variants;
  final ProductVariantModel? selected;
  final ValueChanged<ProductVariantModel> onSelected;
  
  const SizeSelector({
    super.key,
    required this.variants,
    required this.selected,
    required this.onSelected,
  });
  
  // Orden estándar de tallas
  static const _sizeOrder = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46',
    'Única',
  ];
  
  List<ProductVariantModel> get _sortedVariants {
    return [...variants]..sort((a, b) {
      final indexA = _sizeOrder.indexOf(a.size);
      final indexB = _sizeOrder.indexOf(b.size);
      if (indexA == -1 && indexB == -1) return a.size.compareTo(b.size);
      if (indexA == -1) return 1;
      if (indexB == -1) return -1;
      return indexA.compareTo(indexB);
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _sortedVariants.map((variant) {
        final isSelected = selected?.id == variant.id;
        final isAvailable = variant.isAvailable;
        
        return _SizeChip(
          size: variant.size,
          isSelected: isSelected,
          isAvailable: isAvailable,
          isLowStock: variant.isLowStock,
          onTap: isAvailable ? () => onSelected(variant) : null,
        );
      }).toList(),
    );
  }
}

class _SizeChip extends StatelessWidget {
  final String size;
  final bool isSelected;
  final bool isAvailable;
  final bool isLowStock;
  final VoidCallback? onTap;
  
  const _SizeChip({
    required this.size,
    required this.isSelected,
    required this.isAvailable,
    required this.isLowStock,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          constraints: const BoxConstraints(minWidth: 48),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.card,
            border: Border.all(
              color: isSelected 
                  ? AppColors.primary 
                  : isAvailable 
                      ? AppColors.border 
                      : AppColors.border.withOpacity(0.5),
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                size,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isAvailable
                      ? (isSelected ? AppColors.primary : AppColors.foreground)
                      : AppColors.mutedForeground.withOpacity(0.5),
                ),
              ),
              if (isLowStock && isAvailable) ...[
                const SizedBox(width: 4),
                Icon(
                  Icons.bolt,
                  size: 14,
                  color: Colors.amber[600],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 4.6 Widget: AddToCartButton

```dart
// lib/features/catalog/presentation/widgets/add_to_cart_button.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/product_model.dart';
import '../../data/models/product_variant_model.dart';
import 'package:fashionstore/features/cart/presentation/providers/cart_provider.dart';
import 'package:fashionstore/core/utils/formatters.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

enum AddToCartStatus { disabled, idle, loading, success, error }

class AddToCartButton extends ConsumerStatefulWidget {
  final ProductModel product;
  final ProductVariantModel? selectedVariant;
  
  const AddToCartButton({
    super.key,
    required this.product,
    required this.selectedVariant,
  });
  
  @override
  ConsumerState<AddToCartButton> createState() => _AddToCartButtonState();
}

class _AddToCartButtonState extends ConsumerState<AddToCartButton> {
  AddToCartStatus _status = AddToCartStatus.disabled;
  
  @override
  void didUpdateWidget(covariant AddToCartButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selectedVariant != oldWidget.selectedVariant) {
      setState(() {
        _status = widget.selectedVariant != null && widget.selectedVariant!.isAvailable
            ? AddToCartStatus.idle
            : AddToCartStatus.disabled;
      });
    }
  }
  
  Future<void> _handleAddToCart() async {
    if (_status != AddToCartStatus.idle) return;
    
    final variant = widget.selectedVariant!;
    final product = widget.product;
    
    setState(() => _status = AddToCartStatus.loading);
    
    // Feedback háptico
    HapticFeedback.mediumImpact();
    
    try {
      await ref.read(cartNotifierProvider.notifier).addItem(
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantId: variant.id,
        size: variant.size,
        price: product.displayPrice,
        imageUrl: product.mainImageUrl ?? '',
      );
      
      setState(() => _status = AddToCartStatus.success);
      
      // Feedback háptico de éxito
      HapticFeedback.lightImpact();
      
      // Reset después de animación
      await Future.delayed(const Duration(milliseconds: 1500));
      if (mounted) {
        setState(() => _status = AddToCartStatus.idle);
      }
    } catch (e) {
      setState(() => _status = AddToCartStatus.error);
      
      await Future.delayed(const Duration(milliseconds: 2000));
      if (mounted) {
        setState(() => _status = AddToCartStatus.idle);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final variant = widget.selectedVariant;
    final isDisabled = variant == null || !variant.isAvailable;
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _status == AddToCartStatus.idle ? _handleAddToCart : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: _getBackgroundColor(),
          foregroundColor: _getForegroundColor(),
          disabledBackgroundColor: AppColors.muted,
          disabledForegroundColor: AppColors.mutedForeground,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24),
        ),
        child: _buildContent(),
      ),
    );
  }
  
  Color _getBackgroundColor() {
    switch (_status) {
      case AddToCartStatus.success:
        return const Color(0xFF10B981); // Emerald
      case AddToCartStatus.error:
        return AppColors.accent;
      default:
        return AppColors.primary;
    }
  }
  
  Color _getForegroundColor() {
    switch (_status) {
      case AddToCartStatus.success:
      case AddToCartStatus.error:
        return Colors.white;
      default:
        return AppColors.primaryForeground;
    }
  }
  
  Widget _buildContent() {
    switch (_status) {
      case AddToCartStatus.disabled:
        return const Text(
          'SELECCIONA UNA TALLA',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 1,
          ),
        );
      
      case AddToCartStatus.loading:
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(_getForegroundColor()),
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'AÑADIENDO...',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
              ),
            ),
          ],
        );
      
      case AddToCartStatus.success:
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.check, size: 20),
            SizedBox(width: 8),
            Text(
              '¡AÑADIDO!',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
              ),
            ),
          ],
        );
      
      case AddToCartStatus.error:
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.error_outline, size: 20),
            SizedBox(width: 8),
            Text(
              'ERROR',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
              ),
            ),
          ],
        );
      
      case AddToCartStatus.idle:
        return Text(
          'AÑADIR AL CARRITO - ${formatPrice(widget.product.displayPrice)}',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 1,
          ),
        );
    }
  }
}
```

---

## 4.7 Screen: ProductsScreen

```dart
// lib/features/catalog/presentation/screens/products_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/models/product_model.dart';
import '../providers/products_provider.dart';
import '../providers/product_filters_provider.dart';
import '../widgets/product_grid.dart';
import '../widgets/product_filters_sheet.dart';
import 'package:fashionstore/features/cart/presentation/widgets/cart_badge.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  final String? initialCategory;
  final String? initialSearch;
  final bool initialOffersOnly;
  
  const ProductsScreen({
    super.key,
    this.initialCategory,
    this.initialSearch,
    this.initialOffersOnly = false,
  });
  
  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  @override
  void initState() {
    super.initState();
    // Aplicar filtros iniciales desde URL
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notifier = ref.read(productFiltersNotifierProvider.notifier);
      if (widget.initialCategory != null) {
        notifier.setCategory(widget.initialCategory);
      }
      if (widget.initialSearch != null) {
        notifier.setSearch(widget.initialSearch);
      }
      if (widget.initialOffersOnly) {
        notifier.setOffersOnly(true);
      }
    });
  }
  
  void _openFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const ProductFiltersSheet(),
    );
  }
  
  void _navigateToProduct(ProductModel product) {
    context.pushNamed('product-detail', pathParameters: {'slug': product.slug});
  }
  
  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(productFiltersNotifierProvider);
    final productsAsync = ref.watch(filteredProductsProvider);
    
    // Título dinámico
    String pageTitle = 'Productos';
    if (filters.search != null && filters.search!.isNotEmpty) {
      pageTitle = 'Resultados para "${filters.search}"';
    } else if (filters.offersOnly) {
      pageTitle = 'Ofertas';
    } else if (filters.categorySlug != null) {
      pageTitle = filters.categorySlug!; // TODO: obtener nombre real
    }
    
    return Scaffold(
      appBar: AppBar(
        title: Text(pageTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _openFilters,
          ),
          const CartBadge(),
        ],
      ),
      body: Column(
        children: [
          // Barra de filtros
          _FilterBar(
            hasActiveFilters: filters.hasActiveFilters,
            onFiltersTap: _openFilters,
            productCount: productsAsync.valueOrNull?.length ?? 0,
          ),
          // Grid de productos
          Expanded(
            child: productsAsync.when(
              data: (products) => ProductGrid(
                products: products,
                onProductTap: _navigateToProduct,
                onRefresh: () => ref.invalidate(filteredProductsProvider),
              ),
              loading: () => const ProductGrid(products: [], isLoading: true),
              error: (error, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48),
                    const SizedBox(height: 16),
                    Text('Error: $error'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(filteredProductsProvider),
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  final bool hasActiveFilters;
  final VoidCallback onFiltersTap;
  final int productCount;
  
  const _FilterBar({
    required this.hasActiveFilters,
    required this.onFiltersTap,
    required this.productCount,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
          ),
        ),
      ),
      child: Row(
        children: [
          // Botón de filtros
          OutlinedButton.icon(
            onPressed: onFiltersTap,
            icon: const Icon(Icons.tune, size: 18),
            label: const Text('Filtros'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
          ),
          if (hasActiveFilters) ...[
            const SizedBox(width: 8),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                shape: BoxShape.circle,
              ),
            ),
          ],
          const Spacer(),
          // Contador
          Text(
            '$productCount productos',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 4.8 Screen: ProductDetailScreen (Esqueleto)

```dart
// lib/features/catalog/presentation/screens/product_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/product_variant_model.dart';
import '../providers/products_provider.dart';
import '../widgets/size_selector.dart';
import '../widgets/add_to_cart_button.dart';
import '../widgets/product_gallery.dart';
import 'package:fashionstore/features/cart/presentation/widgets/cart_badge.dart';
import 'package:fashionstore/core/utils/formatters.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  
  const ProductDetailScreen({super.key, required this.slug});
  
  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  ProductVariantModel? _selectedVariant;
  
  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productBySlugProvider(widget.slug));
    
    return Scaffold(
      body: productAsync.when(
        data: (product) {
          if (product == null) {
            return const Center(child: Text('Producto no encontrado'));
          }
          
          return CustomScrollView(
            slivers: [
              // App Bar con galería
              SliverAppBar(
                expandedHeight: MediaQuery.of(context).size.width,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: ProductGallery(
                    images: product.sortedImages,
                    heroTag: 'product-image-${product.id}',
                  ),
                ),
                actions: const [CartBadge()],
              ),
              
              // Contenido
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Breadcrumbs
                      _Breadcrumbs(product: product),
                      const SizedBox(height: 16),
                      
                      // Nombre
                      Text(
                        product.name,
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontFamily: 'Bebas Neue',
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Precio
                      _PriceSection(product: product),
                      const SizedBox(height: 16),
                      
                      // Descripción
                      if (product.description != null) ...[
                        Text(
                          product.description!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.mutedForeground,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                      
                      // Selector de talla
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'TALLA',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 1,
                              color: AppColors.mutedForeground,
                            ),
                          ),
                          TextButton(
                            onPressed: () => _showSizeGuide(context),
                            child: const Text('Guía de tallas →'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      SizeSelector(
                        variants: product.variants,
                        selected: _selectedVariant,
                        onSelected: (variant) {
                          setState(() => _selectedVariant = variant);
                        },
                      ),
                      
                      // Warning de stock bajo
                      if (_selectedVariant != null && _selectedVariant!.isLowStock)
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Row(
                            children: [
                              Icon(Icons.bolt, size: 16, color: Colors.amber[600]),
                              const SizedBox(width: 4),
                              Text(
                                '${_selectedVariant!.stock} unidades disponibles',
                                style: TextStyle(
                                  color: Colors.amber[600],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      
                      const SizedBox(height: 24),
                      
                      // Botón añadir
                      AddToCartButton(
                        product: product,
                        selectedVariant: _selectedVariant,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }
  
  void _showSizeGuide(BuildContext context) {
    // TODO: Implementar modal de guía de tallas
    showDialog(
      context: context,
      builder: (context) => const AlertDialog(
        title: Text('Guía de Tallas'),
        content: Text('Próximamente...'),
      ),
    );
  }
}

// Widgets auxiliares (_Breadcrumbs, _PriceSection, ProductGallery)
// se implementarían en archivos separados por brevedad
```

---

## 4.9 Widget: CartBadge

```dart
// lib/features/cart/presentation/widgets/cart_badge.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import 'package:fashionstore/core/theme/app_colors.dart';

class CartBadge extends ConsumerWidget {
  const CartBadge({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    
    return IconButton(
      icon: Badge(
        label: Text('$count'),
        isLabelVisible: count > 0,
        backgroundColor: AppColors.primary,
        textColor: AppColors.primaryForeground,
        child: const Icon(Icons.shopping_bag_outlined),
      ),
      onPressed: () {
        // TODO: Abrir carrito drawer o navegar
        context.pushNamed('cart');
      },
    );
  }
}
```

---

## 4.10 Checklist de Frontend

- [ ] ProductCard widget completo con badges
- [ ] ProductGrid con skeleton y empty state
- [ ] ProductCardSkeleton con shimmer
- [ ] ProductFiltersSheet con todas las secciones
- [ ] SizeSelector con ordenación y estados
- [ ] AddToCartButton con transiciones
- [ ] ProductsScreen con filtros y refresh
- [ ] ProductDetailScreen con galería
- [ ] CartBadge con contador reactivo
- [ ] Hero animations funcionando
- [ ] Haptic feedback en acciones
- [ ] Responsive grid funcionando
- [ ] Pull-to-refresh implementado
- [ ] Error states con retry
