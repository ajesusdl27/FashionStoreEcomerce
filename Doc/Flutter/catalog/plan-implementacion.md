# Plan de Implementación: Catálogo de Productos en Flutter

## 1. Resumen Ejecutivo

### Objetivo
Migrar el módulo de catálogo de productos de FashionStore a Flutter, manteniendo todas las funcionalidades de navegación, filtrado, visualización de productos y gestión del carrito.

### Alcance
- Listado de productos con filtros
- Detalle de producto con galería
- Navegación por categorías
- Sistema de carrito local
- Integración con Supabase existente

### Tiempo Estimado
**12-15 días** de desarrollo

---

## 2. Fases del Desarrollo

| Fase | Descripción | Duración |
|------|-------------|----------|
| 1 | Preparación y estructura | 2 días |
| 2 | Diseño UI/UX | 2 días |
| 3 | Backend/Repositorios | 3 días |
| 4 | Frontend/Widgets | 5-8 días |

---

## 3. Arquitectura Propuesta

### 3.1 Estructura de Carpetas
```
lib/
├── features/
│   └── catalog/
│       ├── data/
│       │   ├── models/
│       │   │   ├── product_model.dart
│       │   │   ├── category_model.dart
│       │   │   ├── product_variant_model.dart
│       │   │   └── product_image_model.dart
│       │   └── repositories/
│       │       ├── product_repository.dart
│       │       └── category_repository.dart
│       ├── domain/
│       │   └── entities/
│       │       ├── product.dart
│       │       └── category.dart
│       ├── presentation/
│       │   ├── providers/
│       │   │   ├── products_provider.dart
│       │   │   ├── categories_provider.dart
│       │   │   └── product_filters_provider.dart
│       │   ├── screens/
│       │   │   ├── products_screen.dart
│       │   │   ├── product_detail_screen.dart
│       │   │   └── category_screen.dart
│       │   └── widgets/
│       │       ├── product_card.dart
│       │       ├── product_grid.dart
│       │       ├── product_filters_sheet.dart
│       │       ├── product_gallery.dart
│       │       ├── size_selector.dart
│       │       ├── add_to_cart_button.dart
│       │       ├── size_guide_modal.dart
│       │       └── price_display.dart
│       └── catalog.dart  // barrel export
│
├── features/
│   └── cart/
│       ├── data/
│       │   ├── models/
│       │   │   └── cart_item_model.dart
│       │   └── repositories/
│       │       └── cart_repository.dart
│       ├── presentation/
│       │   ├── providers/
│       │   │   └── cart_provider.dart
│       │   └── widgets/
│       │       ├── cart_badge.dart
│       │       └── cart_sheet.dart
│       └── cart.dart
```

### 3.2 Modelos de Datos

```dart
// product_model.dart
class ProductModel {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? offerPrice;
  final String? categoryId;
  final bool active;
  final bool isOffer;
  final DateTime createdAt;
  
  // Relaciones
  final CategoryModel? category;
  final List<ProductVariantModel> variants;
  final List<ProductImageModel> images;
  
  // Computed
  bool get hasOffer => isOffer && offerPrice != null;
  double get displayPrice => hasOffer ? offerPrice! : price;
  int get totalStock => variants.fold(0, (sum, v) => sum + v.stock);
  bool get isAvailable => totalStock > 0;
  bool get isLowStock => totalStock > 0 && totalStock <= 5;
  int get discountPercent => hasOffer 
    ? ((price - offerPrice!) / price * 100).round() 
    : 0;
}

// cart_item_model.dart
class CartItemModel {
  final String id;  // productId-variantId
  final String productId;
  final String productName;
  final String productSlug;
  final String variantId;
  final String size;
  final double price;
  final String imageUrl;
  final int quantity;
}
```

### 3.3 Providers (Riverpod)

```dart
// products_provider.dart
@riverpod
class ProductsNotifier extends _$ProductsNotifier {
  @override
  Future<List<ProductModel>> build(ProductFilters filters) async {
    return ref.read(productRepositoryProvider).getProducts(filters);
  }
}

// product_filters_provider.dart
@riverpod
class ProductFilters extends _$ProductFilters {
  @override
  ProductFiltersState build() => ProductFiltersState.initial();
  
  void setCategory(String? categorySlug) {...}
  void setSearch(String query) {...}
  void setPriceRange(double? min, double? max) {...}
  void setOffersOnly(bool value) {...}
  void setSortBy(ProductSortBy sort) {...}
  void clearAll() {...}
}

// cart_provider.dart
@riverpod
class CartNotifier extends _$CartNotifier {
  @override
  List<CartItemModel> build() {
    _loadFromStorage();
    return [];
  }
  
  void addItem(CartItemModel item, {int quantity = 1}) {...}
  void removeItem(String itemId) {...}
  void updateQuantity(String itemId, int quantity) {...}
  void clear() {...}
}

@riverpod
int cartCount(CartCountRef ref) {
  return ref.watch(cartNotifierProvider)
    .fold(0, (sum, item) => sum + item.quantity);
}

@riverpod
double cartSubtotal(CartSubtotalRef ref) {
  return ref.watch(cartNotifierProvider)
    .fold(0, (sum, item) => sum + item.price * item.quantity);
}
```

---

## 4. Pantallas Principales

### 4.1 ProductsScreen (`/productos`)
```dart
// Estructura
Scaffold(
  appBar: AppBar(title: Text(pageTitle)),
  body: Column(
    children: [
      // Contador y botón filtros
      _FilterBar(),
      // Grid de productos
      Expanded(child: _ProductGrid()),
    ],
  ),
)

// Funcionalidades
- Pull-to-refresh
- Infinite scroll / pagination
- Filtros en BottomSheet
- Empty state cuando no hay resultados
- Error state con retry
- Loading skeletons
```

### 4.2 ProductDetailScreen (`/productos/:slug`)
```dart
// Estructura
Scaffold(
  body: CustomScrollView(
    slivers: [
      // App bar con imagen colapsable
      SliverAppBar(expandedHeight: 400),
      SliverToBoxAdapter(child: _ProductInfo()),
      SliverToBoxAdapter(child: _SizeSelector()),
      SliverToBoxAdapter(child: _AddToCartButton()),
    ],
  ),
  // Sticky bottom bar en móvil
  bottomNavigationBar: _StickyAddToCart(),
)

// Funcionalidades
- Galería con PageView + indicadores
- Zoom en imagen (photo_view)
- Breadcrumbs navegables
- Selector de tallas interactivo
- Guía de tallas modal
- Feedback háptico al añadir
- Hero animation desde grid
```

### 4.3 CategoryScreen (`/categoria/:slug`)
```dart
// Estructura similar a ProductsScreen
// pero con sidebar de categorías en tablet/desktop
// y filtro de categoría pre-seleccionado
```

---

## 5. Widgets Clave

### 5.1 ProductCard
```dart
class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback? onTap;
  
  // Elementos:
  // - Hero(tag: product.id)
  // - CachedNetworkImage con placeholder
  // - Badge descuento (si hasOffer)
  // - Badge "Últimas X unidades" (si isLowStock)
  // - Overlay "AGOTADO" (si !isAvailable)
  // - Nombre truncado
  // - PriceDisplay (precio normal/oferta)
}
```

### 5.2 ProductFiltersSheet
```dart
class ProductFiltersSheet extends ConsumerWidget {
  // Secciones:
  // - SearchBar con debounce
  // - Lista de categorías (Radio/Chips)
  // - RangeSlider para precio
  // - Switch "Solo ofertas"
  // - DropdownButton ordenación
  // - Botón "Limpiar filtros"
  // - Botón "Aplicar" (cierra sheet)
}
```

### 5.3 SizeSelector
```dart
class SizeSelector extends StatelessWidget {
  final List<ProductVariantModel> variants;
  final ProductVariantModel? selected;
  final ValueChanged<ProductVariantModel> onSelected;
  
  // Grid de chips/botones
  // Deshabilitado si stock = 0
  // Icono ⚡ si stock bajo
  // Borde destacado si seleccionado
}
```

### 5.4 AddToCartButton
```dart
class AddToCartButton extends ConsumerStatefulWidget {
  // Estados:
  // - disabled (sin talla seleccionada)
  // - idle (listo para añadir)
  // - loading (animación)
  // - success (checkmark verde)
  // - error (X rojo)
  
  // Feedback:
  // - HapticFeedback.mediumImpact()
  // - Animación de transición
  // - Texto dinámico según estado
}
```

---

## 6. Rutas GoRouter

```dart
// catalog_routes.dart
final catalogRoutes = [
  GoRoute(
    path: '/productos',
    name: 'products',
    builder: (context, state) => ProductsScreen(
      initialCategory: state.queryParams['categoria'],
      initialSearch: state.queryParams['q'],
    ),
  ),
  GoRoute(
    path: '/productos/:slug',
    name: 'product-detail',
    builder: (context, state) => ProductDetailScreen(
      slug: state.pathParameters['slug']!,
    ),
  ),
  GoRoute(
    path: '/categoria/:slug',
    name: 'category',
    builder: (context, state) => CategoryScreen(
      slug: state.pathParameters['slug']!,
    ),
  ),
];
```

---

## 7. Integración con Supabase

### 7.1 Repository: Productos
```dart
class ProductRepository {
  final SupabaseClient _client;
  
  Future<List<ProductModel>> getProducts({
    String? categorySlug,
    String? search,
    double? minPrice,
    double? maxPrice,
    bool offersOnly = false,
    ProductSortBy sortBy = ProductSortBy.newest,
    int limit = 20,
    int offset = 0,
  }) async {
    var query = _client
      .from('products')
      .select('''
        *,
        category:categories(id, name, slug, size_type),
        images:product_images(id, image_url, order),
        variants:product_variants(id, size, stock)
      ''')
      .eq('active', true)
      .isFilter('deleted_at', null);
    
    // Aplicar filtros dinámicos...
    
    final response = await query;
    return response.map((json) => ProductModel.fromJson(json)).toList();
  }
  
  Future<ProductModel?> getProductBySlug(String slug) async {...}
}
```

### 7.2 Repository: Categorías
```dart
class CategoryRepository {
  final SupabaseClient _client;
  
  Future<List<CategoryModel>> getCategories() async {
    final response = await _client
      .from('categories')
      .select()
      .order('name');
    return response.map((json) => CategoryModel.fromJson(json)).toList();
  }
  
  Future<CategoryModel?> getCategoryBySlug(String slug) async {...}
}
```

---

## 8. Gestión del Carrito

### 8.1 Persistencia Local
```dart
// Usar Hive para persistencia
@HiveType(typeId: 0)
class CartItemModel extends HiveObject {
  @HiveField(0)
  final String id;
  // ... otros campos
}

// En el provider
class CartNotifier extends _$CartNotifier {
  late Box<CartItemModel> _box;
  
  @override
  List<CartItemModel> build() {
    _initBox();
    return [];
  }
  
  Future<void> _initBox() async {
    _box = await Hive.openBox<CartItemModel>('cart');
    state = _box.values.toList();
  }
  
  void addItem(CartItemModel item, {int quantity = 1}) {
    // Lógica de agregar/actualizar
    _box.put(item.id, updatedItem);
    state = _box.values.toList();
  }
}
```

### 8.2 Sincronización UI
```dart
// Badge en AppBar
Consumer(
  builder: (context, ref, child) {
    final count = ref.watch(cartCountProvider);
    return Badge(
      label: Text('$count'),
      isLabelVisible: count > 0,
      child: IconButton(
        icon: Icon(Icons.shopping_bag_outlined),
        onPressed: () => showCartSheet(context),
      ),
    );
  },
)
```

---

## 9. Optimización de Imágenes

### 9.1 URLs de Cloudinary
```dart
// Generar URL optimizada
String getOptimizedImageUrl(String url, {int width = 400}) {
  if (!url.contains('res.cloudinary.com')) return url;
  
  // Insertar transformaciones
  final parts = url.split('/upload/');
  if (parts.length != 2) return url;
  
  return '${parts[0]}/upload/w_$width,q_auto,f_auto/${parts[1]}';
}
```

### 9.2 Caché de Imágenes
```dart
CachedNetworkImage(
  imageUrl: getOptimizedImageUrl(product.images.first.imageUrl),
  placeholder: (context, url) => Shimmer.fromColors(
    baseColor: Colors.grey[800]!,
    highlightColor: Colors.grey[700]!,
    child: Container(color: Colors.grey[800]),
  ),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
)
```

---

## 10. Testing

### 10.1 Unit Tests
- `ProductModel.fromJson()` parsing
- `CartNotifier` add/remove/update
- `ProductFiltersState` mutations
- Cálculos de precio y descuento

### 10.2 Widget Tests
- `ProductCard` muestra datos correctamente
- `SizeSelector` selección y estados disabled
- `AddToCartButton` transiciones de estado

### 10.3 Integration Tests
- Flujo completo: buscar → ver → añadir
- Filtros actualizan resultados
- Carrito persiste entre sesiones

---

## 11. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo carga listado | < 1s |
| Tiempo carga imágenes | < 500ms (con caché) |
| Frame rate scroll | 60 fps |
| Tamaño caché imágenes | < 100 MB |
| Crashes | 0% |

---

## 12. Dependencias del Proyecto

```yaml
# pubspec.yaml (adicionales para catálogo)
dependencies:
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  photo_view: ^0.14.0
  hive_flutter: ^1.1.0
  flutter_staggered_grid_view: ^0.7.0  # Grid masonry opcional

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.0
```
