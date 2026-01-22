# Módulo 06: Catálogo de Productos

## 🎯 Objetivo

Implementar el sistema completo de catálogo: listado de productos con filtros, búsqueda, ordenación, navegación por categorías y página de detalle de producto con selector de tallas.

## 🗄️ Backend (Supabase)

### Tablas Involucradas

**categories:**
- `id`: UUID
- `name`: TEXT
- `slug`: TEXT (único)
- `size_type`: TEXT ('clothing', 'footwear', 'universal')
- `created_at`: TIMESTAMPTZ

**products:**
- `id`: UUID
- `name`: TEXT
- `slug`: TEXT (único)
- `description`: TEXT
- `price`: NUMERIC(10,2)
- `offer_price`: NUMERIC(10,2) nullable
- `category_id`: UUID (FK)
- `active`: BOOLEAN (default true)
- `is_offer`: BOOLEAN (default false)
- `deleted_at`: TIMESTAMPTZ (soft delete)
- `created_at`: TIMESTAMPTZ

**product_variants:**
- `id`: UUID
- `product_id`: UUID (FK)
- `size`: TEXT
- `stock`: INTEGER (>= 0)
- UNIQUE(product_id, size)

**product_images:**
- `id`: UUID
- `product_id`: UUID (FK)
- `image_url`: TEXT
- `order`: INTEGER (para ordenar imágenes)
- `created_at`: TIMESTAMPTZ

### Queries Principales

**Obtener productos con filtros:**
```sql
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  c.size_type,
  array_agg(
    json_build_object(
      'id', pi.id,
      'image_url', pi.image_url,
      'order', pi."order"
    ) ORDER BY pi."order"
  ) as images,
  array_agg(
    json_build_object(
      'id', pv.id,
      'size', pv.size,
      'stock', pv.stock
    )
  ) as variants
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.active = true 
  AND p.deleted_at IS NULL
  AND (category_id = ? OR ? IS NULL)  -- Filtro categoría
  AND (name ILIKE ? OR ? IS NULL)     -- Búsqueda
  AND (price >= ? OR ? IS NULL)       -- Precio mínimo
  AND (price <= ? OR ? IS NULL)       -- Precio máximo
  AND (is_offer = ? OR ? IS NULL)     -- Solo ofertas
GROUP BY p.id, c.name, c.slug, c.size_type
ORDER BY created_at DESC, name ASC
LIMIT 20 OFFSET ?
```

**Obtener producto por slug:**
```sql
SELECT ... (igual que arriba)
WHERE p.slug = ? AND p.active = true AND p.deleted_at IS NULL
```

## 🏗️ Arquitectura del Módulo

```
features/catalog/
├── data/
│   ├── datasources/
│   │   └── supabase_catalog_datasource.dart
│   └── repositories/
│       └── products_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── product.dart (Freezed)
│   │   ├── product_variant.dart (Freezed)
│   │   ├── product_image.dart (Freezed)
│   │   ├── category.dart (Freezed)
│   │   └── product_filters.dart (Freezed)
│   └── repositories/
│       └── products_repository.dart (interface)
│
├── providers/
│   ├── products_providers.dart
│   ├── categories_providers.dart
│   └── filters_provider.dart
│
└── presentation/
    ├── screens/
    │   ├── catalog_screen.dart
    │   ├── product_detail_screen.dart
    │   └── category_screen.dart
    └── widgets/
        ├── product_card.dart
        ├── product_grid.dart
        ├── filters_sheet.dart
        ├── product_gallery.dart
        ├── size_selector.dart
        ├── add_to_cart_button.dart
        └── size_guide_modal.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. Product

```dart
@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    required String slug,
    String? description,
    required double price,
    double? offerPrice,
    @Default(false) bool isOffer,
    String? categoryId,
    Category? category,
    @Default([]) List<ProductImage> images,
    @Default([]) List<ProductVariant> variants,
    required DateTime createdAt,
  }) = _Product;
  
  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  
  // Helpers
  const Product._();
  
  double get displayPrice => offerPrice ?? price;
  
  int get discountPercentage {
    if (offerPrice == null) return 0;
    return ((price - offerPrice!) / price * 100).round();
  }
  
  bool get hasStock => variants.any((v) => v.stock > 0);
  
  int get totalStock => variants.fold(0, (sum, v) => sum + v.stock);
  
  ProductImage? get mainImage => 
      images.isEmpty ? null : images.first;
}
```

### 2. ProductVariant

```dart
@freezed
class ProductVariant with _$ProductVariant {
  const factory ProductVariant({
    required String id,
    required String productId,
    required String size,
    required int stock,
  }) = _ProductVariant;
  
  factory ProductVariant.fromJson(Map<String, dynamic> json) => 
      _$ProductVariantFromJson(json);
  
  const ProductVariant._();
  
  bool get isAvailable => stock > 0;
  bool get isLowStock => stock > 0 && stock <= 5;
}
```

### 3. ProductImage

```dart
@freezed
class ProductImage with _$ProductImage {
  const factory ProductImage({
    required String id,
    required String productId,
    required String imageUrl,
    @Default(0) int order,
  }) = _ProductImage;
  
  factory ProductImage.fromJson(Map<String, dynamic> json) => 
      _$ProductImageFromJson(json);
  
  const ProductImage._();
  
  // Cloudinary transformation
  String optimizedUrl({int? width, int? height, int quality = 80}) {
    if (!imageUrl.contains('cloudinary')) return imageUrl;
    
    final params = [
      if (width != null) 'w_$width',
      if (height != null) 'h_$height',
      'q_$quality',
      'f_auto',
    ].join(',');
    
    return imageUrl.replaceFirst('/upload/', '/upload/$params/');
  }
}
```

### 4. Category

```dart
enum SizeType {
  clothing,   // XS, S, M, L, XL, XXL
  footwear,   // 36-46
  universal;  // Talla única
  
  List<String> get availableSizes {
    switch (this) {
      case SizeType.clothing:
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      case SizeType.footwear:
        return List.generate(11, (i) => '${36 + i}');
      case SizeType.universal:
        return ['Única'];
    }
  }
}

@freezed
class Category with _$Category {
  const factory Category({
    required String id,
    required String name,
    required String slug,
    @Default(SizeType.clothing) SizeType sizeType,
    required DateTime createdAt,
  }) = _Category;
  
  factory Category.fromJson(Map<String, dynamic> json) => 
      _$CategoryFromJson(json);
}
```

### 5. ProductFilters

```dart
@freezed
class ProductFilters with _$ProductFilters {
  const factory ProductFilters({
    String? categoryId,
    String? searchQuery,
    double? minPrice,
    double? maxPrice,
    @Default(false) bool onlyOffers,
    @Default('created_at') String sortBy,
    @Default(false) bool ascending,
  }) = _ProductFilters;
  
  const ProductFilters._();
  
  bool get hasActiveFilters =>
      categoryId != null ||
      (searchQuery?.isNotEmpty ?? false) ||
      minPrice != null ||
      maxPrice != null ||
      onlyOffers;
}
```

## 🔌 Repository (Data Layer)

### Interface (Domain)

```dart
abstract class ProductsRepository {
  Future<List<Product>> getProducts({
    String? categoryId,
    String? searchQuery,
    double? minPrice,
    double? maxPrice,
    bool? onlyOffers,
    String sortBy = 'created_at',
    bool ascending = false,
    int limit = 20,
    int offset = 0,
  });
  
  Future<Product> getProductBySlug(String slug);
  
  Future<List<Category>> getCategories();
  
  Future<Category> getCategoryBySlug(String slug);
}
```

### Implementación

Usar Supabase queries con:
- `select()` con nested relations
- `.eq()`, `.gte()`, `.lte()` para filtros
- `.ilike()` para búsqueda
- `.order()` para ordenación
- `.limit()` y `.range()` para paginación

## 🎣 Providers (Riverpod)

### Products Providers

```dart
@riverpod
ProductsRepository productsRepository(ProductsRepositoryRef ref) {
  final datasource = SupabaseCatalogDatasource(SupabaseService.client);
  return ProductsRepositoryImpl(datasource);
}

// Estado de filtros (mutable)
@riverpod
class ProductFiltersNotifier extends _$ProductFiltersNotifier {
  @override
  ProductFilters build() => const ProductFilters();
  
  void setCategory(String? categoryId) {
    state = state.copyWith(categoryId: categoryId);
  }
  
  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query.isEmpty ? null : query);
  }
  
  void setPriceRange(double? min, double? max) {
    state = state.copyWith(minPrice: min, maxPrice: max);
  }
  
  void toggleOnlyOffers() {
    state = state.copyWith(onlyOffers: !state.onlyOffers);
  }
  
  void setSorting(String sortBy, bool ascending) {
    state = state.copyWith(sortBy: sortBy, ascending: ascending);
  }
  
  void reset() {
    state = const ProductFilters();
  }
}

// Productos filtrados (derivado de filtros)
@riverpod
Future<List<Product>> filteredProducts(FilteredProductsRef ref) async {
  final filters = ref.watch(productFiltersNotifierProvider);
  final repository = ref.watch(productsRepositoryProvider);
  
  return repository.getProducts(
    categoryId: filters.categoryId,
    searchQuery: filters.searchQuery,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    onlyOffers: filters.onlyOffers ? true : null,
    sortBy: filters.sortBy,
    ascending: filters.ascending,
  );
}

// Producto individual por slug
@riverpod
Future<Product> product(ProductRef ref, String slug) async {
  final repository = ref.watch(productsRepositoryProvider);
  return repository.getProductBySlug(slug);
}
```

### Categories Providers

```dart
@riverpod
Future<List<Category>> categories(CategoriesRef ref) async {
  final repository = ref.watch(productsRepositoryProvider);
  return repository.getCategories();
}

@riverpod
Future<Category> category(CategoryRef ref, String slug) async {
  final repository = ref.watch(productsRepositoryProvider);
  return repository.getCategoryBySlug(slug);
}
```

## 🖼️ Pantallas de Presentación

### 1. CatalogScreen

**Ruta**: `/productos`

**Elementos UI:**
- AppBar con título "Catálogo" + botón filtros + botón búsqueda
- ProductGrid (2 columnas móvil, 3-4 tablet)
- Floating Action Button para abrir FiltersSheet
- Pull to refresh
- Scroll infinito (cargar más al llegar al final)
- Badge de filtros activos

**Estados:**
- Loading: ShimmerLoading.product()
- Error: ErrorView con retry
- Empty: EmptyState "No hay productos"
- Success: Grid de productos

**Filtros aplicables:**
- Categoría (lista de categorías)
- Búsqueda (texto libre)
- Rango de precio (sliders)
- Solo ofertas (toggle)
- Ordenar por (dropdown: recientes, precio asc/desc, nombre A-Z)

### 2. ProductDetailScreen

**Ruta**: `/productos/:slug`

**Elementos UI:**
- AppBar con botón back + título dinámico (nombre del producto)
- ProductGallery (swipeable con indicadores)
- Breadcrumbs (Inicio > Categoría > Producto)
- Nombre del producto (`headingLarge`)
- Precio con tachado si hay oferta
- Badge de descuento (-XX%)
- Descripción del producto
- SizeSelector (botones de tallas)
- Indicador de stock bajo (si stock <= 5)
- AddToCartButton (sticky en bottom al scrollear)
- Link "Guía de tallas" (abre modal)

**Secciones:**
1. **Gallery** (top, height: 400px móvil, 500px tablet)
2. **Info principal** (nombre, precio, badges)
3. **Descripción** (collapsible si es muy largo)
4. **Selector de talla** (required antes de añadir al carrito)
5. **Botón añadir al carrito** (sticky bottom bar)

**Estados:**
- Loading: ShimmerLoading de detalle
- Error: ErrorView "Producto no encontrado"
- Success: Mostrar todo

### 3. CategoryScreen

**Ruta**: `/categoria/:slug`

**Elementos UI:**
- AppBar con título de categoría
- Imagen hero de categoría (opcional)
- Descripción breve de categoría
- ProductGrid (igual que CatalogScreen)
- Filtros aplicables (mismos que catalog, pero categoría pre-seleccionada)

## 🎨 Widgets Personalizados

### 1. ProductCard

**Ubicación**: `lib/features/catalog/presentation/widgets/product_card.dart`

**Props:**
- product: Product
- onTap: VoidCallback

**Elementos:**
- Container con AspectRatio(1.0) para la imagen
- CachedNetworkImage con optimización Cloudinary
- Stack para badges:
  - Badge de descuento (top-left) si tiene oferta
  - Badge de categoría (top-left debajo del descuento)
  - Overlay "AGOTADO" (center) si stock = 0
- Nombre del producto (max 2 líneas, ellipsis)
- Precio con tachado si hay oferta
- Indicador "Últimas X unidades" si stock <= 5

**Estados visuales:**
- Normal
- Pressed (scale 0.98)
- Out of stock (opacity 0.6 + overlay)

**Especificaciones:**
- Border radius: `AppSpacing.radiusLg`
- Imagen: width 100%, fit: cover
- Padding info: `AppSpacing.sm`
- Spacing entre elementos: `AppSpacing.gapXs`

### 2. ProductGrid

**Ubicación**: `lib/features/catalog/presentation/widgets/product_grid.dart`

**Props:**
- products: List<Product>
- onProductTap: Function(Product)
- isLoading: bool
- onLoadMore: VoidCallback?

**Características:**
- GridView.builder con SliverGridDelegate
- crossAxisCount: 2 (móvil), 3 (tablet), 4 (desktop)
- mainAxisSpacing y crossAxisSpacing: `AppSpacing.gapMd`
- Scroll infinito (detectar cuando llega al 80% del scroll)
- Pull to refresh (RefreshIndicator)

### 3. FiltersSheet

**Ubicación**: `lib/features/catalog/presentation/widgets/filters_sheet.dart`

**Props:**
- currentFilters: ProductFilters
- onApply: Function(ProductFilters)

**Elementos (dentro de BottomSheet):**
- Header: "Filtros" + botón "Limpiar todo" + botón X
- Sección "Categorías": Lista de chips (wrap)
- Sección "Precio": RangeSlider (0-500€)
- Toggle "Solo ofertas"
- Sección "Ordenar": Radio buttons
  - Más recientes
  - Precio: menor a mayor
  - Precio: mayor a menor
  - Nombre: A-Z
- Footer: AppButton.primary "Aplicar Filtros" (fullWidth)

**Especificaciones:**
- Max height: 80% de pantalla
- Border radius top: `AppSpacing.radiusXl`
- Padding: `AppSpacing.md`
- Scroll si contenido es muy largo
- Drag to dismiss

### 4. ProductGallery

**Ubicación**: `lib/features/catalog/presentation/widgets/product_gallery.dart`

**Props:**
- images: List<ProductImage>

**Características:**
- PageView.builder para swipe horizontal
- Indicadores de página (dots) abajo
- Tap en imagen para full screen (usar photo_view)
- Lazy loading de imágenes
- Caché de imágenes

**Especificaciones:**
- Height: 400px (móvil), 500px (tablet)
- Transición suave entre imágenes
- Indicadores: CircleAvatar con color primary

### 5. SizeSelector

**Ubicación**: `lib/features/catalog/presentation/widgets/size_selector.dart`

**Props:**
- variants: List<ProductVariant>
- sizeType: SizeType
- selectedVariantId: String?
- onSelect: Function(ProductVariant)

**Características:**
- Wrap de botones (uno por talla)
- Botón selected: Borde primary, fondo primary/10
- Botón disabled (sin stock): Tachado, opacity 0.4
- Botón normal: Borde muted
- Indicador de stock bajo: ⚡ icon en botón

**Especificaciones:**
- Tamaño botón: 48x48px (square)
- Border radius: `AppSpacing.radiusSm`
- Font: `AppTypography.labelMedium`
- Spacing: `AppSpacing.gapSm`

### 6. AddToCartButton

**Ubicación**: `lib/features/catalog/presentation/widgets/add_to_cart_button.dart`

**Props:**
- product: Product
- selectedVariant: ProductVariant?
- onAdd: VoidCallback

**Estados:**
- Idle: "AÑADIR AL CARRITO - €XX.XX"
- Loading: Spinner + "Añadiendo..."
- Success: Checkmark + "¡Añadido!" (2 segundos)
- Disabled: Si no hay talla seleccionada o sin stock

**Sticky Behavior:**
- Al hacer scroll down > 200px, mostrar como sticky bottom bar
- Animación fade in/out
- Shadow elevado

**Especificaciones:**
- AppButton.primary fullWidth
- Icon: shopping-cart
- Vibración háptica al añadir (mobile)

### 7. SizeGuideModal

**Ubicación**: `lib/features/catalog/presentation/widgets/size_guide_modal.dart`

**Props:**
- sizeType: SizeType

**Contenido:**
- Dialog o BottomSheet
- Título "Guía de Tallas"
- Tabla según sizeType:
  - **Clothing**: XS-XXL con medidas (pecho, cintura, cadera)
  - **Footwear**: 36-46 con equivalencias (EU, US, UK, CM)
  - **Universal**: Mensaje "Talla única"
- Botón "Cerrar"

## 🔍 Búsqueda y Filtros

### Lógica de Búsqueda

- Buscar en: nombre del producto (case-insensitive)
- Mínimo 3 caracteres para buscar
- Debounce de 500ms (no buscar en cada keystroke)
- Highlight de términos en resultados (opcional)

### Persistencia de Filtros

- Guardar filtros en URL query params (web)
- Guardar último filtro usado en SharedPreferences
- Restaurar filtros al volver a catalog

### Optimización

- Caché de productos (Riverpod keepAlive)
- Paginación (cargar 20 productos a la vez)
- Prefetch de imágenes al scrollear

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados y generados
- [ ] Repository con queries de Supabase optimizadas
- [ ] Providers de productos y categorías
- [ ] CatalogScreen con grid y filtros
- [ ] ProductDetailScreen completo
- [ ] ProductCard con badges y estados
- [ ] FiltersSheet funcional
- [ ] ProductGallery con swipe
- [ ] SizeSelector con indicadores de stock
- [ ] AddToCartButton con sticky behavior
- [ ] SizeGuideModal con tablas
- [ ] Búsqueda con debounce funciona
- [ ] Imágenes se optimizan con Cloudinary
- [ ] Scroll infinito carga más productos

### Tests Manuales

1. **Catálogo:**
   - Ver grid de productos
   - Scroll infinito carga más
   - Pull to refresh actualiza

2. **Filtros:**
   - Filtrar por categoría → solo muestra esa categoría
   - Filtrar por precio → respeta rango
   - Solo ofertas → solo productos con oferta
   - Ordenar → cambia orden correctamente
   - Limpiar filtros → resetea todo

3. **Búsqueda:**
   - Buscar "camiseta" → muestra resultados
   - Buscar con < 3 caracteres → no busca
   - Buscar inexistente → muestra empty state

4. **Detalle:**
   - Ver producto → carga imágenes y datos
   - Swipe gallery → cambia imagen
   - Seleccionar talla → habilita botón añadir
   - Añadir al carrito → success feedback
   - Talla sin stock → botón disabled

5. **Performance:**
   - Imágenes cargan rápido (Cloudinary)
   - No lag al scrollear
   - Transiciones suaves

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 07: Carrito de Compra** - Implementar carrito local con persistencia y cálculos.

---

**Tiempo Estimado**: 8-10 horas
**Complejidad**: Alta
**Dependencias**: Módulos 01-05 completados
