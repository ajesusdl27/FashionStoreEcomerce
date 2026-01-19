# Fase 3: Backend e Integración - Catálogo de Productos

## 3.1 Repositorio de Categorías

```dart
// lib/features/catalog/data/repositories/category_repository.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/category_model.dart';

part 'category_repository.g.dart';

@riverpod
CategoryRepository categoryRepository(CategoryRepositoryRef ref) {
  return CategoryRepository(Supabase.instance.client);
}

class CategoryRepository {
  final SupabaseClient _client;
  
  CategoryRepository(this._client);
  
  /// Obtener todas las categorías ordenadas por nombre
  Future<List<CategoryModel>> getCategories() async {
    final response = await _client
        .from('categories')
        .select()
        .order('name');
    
    return (response as List)
        .map((json) => CategoryModel.fromJson(json))
        .toList();
  }
  
  /// Obtener categoría por slug
  Future<CategoryModel?> getCategoryBySlug(String slug) async {
    final response = await _client
        .from('categories')
        .select()
        .eq('slug', slug)
        .maybeSingle();
    
    if (response == null) return null;
    return CategoryModel.fromJson(response);
  }
  
  /// Obtener categoría por ID
  Future<CategoryModel?> getCategoryById(String id) async {
    final response = await _client
        .from('categories')
        .select()
        .eq('id', id)
        .maybeSingle();
    
    if (response == null) return null;
    return CategoryModel.fromJson(response);
  }
}
```

---

## 3.2 Repositorio de Productos

```dart
// lib/features/catalog/data/repositories/product_repository.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product_model.dart';
import '../models/product_filters.dart';

part 'product_repository.g.dart';

@riverpod
ProductRepository productRepository(ProductRepositoryRef ref) {
  return ProductRepository(Supabase.instance.client);
}

class ProductRepository {
  final SupabaseClient _client;
  
  ProductRepository(this._client);
  
  /// Query base con joins de relaciones
  static const String _selectQuery = '''
    *,
    category:categories(id, name, slug, size_type),
    images:product_images(id, image_url, order),
    variants:product_variants(id, size, stock)
  ''';
  
  /// Obtener productos con filtros
  Future<List<ProductModel>> getProducts({
    ProductFilters filters = const ProductFilters(),
    int limit = 20,
    int offset = 0,
  }) async {
    var query = _client
        .from('products')
        .select(_selectQuery)
        .eq('active', true)
        .isFilter('deleted_at', null);
    
    // Filtro por categoría (necesita lookup del ID)
    if (filters.categorySlug != null) {
      final catResponse = await _client
          .from('categories')
          .select('id')
          .eq('slug', filters.categorySlug!)
          .maybeSingle();
      
      if (catResponse != null) {
        query = query.eq('category_id', catResponse['id']);
      }
    }
    
    // Filtro de búsqueda
    if (filters.search != null && filters.search!.isNotEmpty) {
      query = query.or(
        'name.ilike.%${filters.search}%,'
        'description.ilike.%${filters.search}%'
      );
    }
    
    // Filtro de precio mínimo
    if (filters.minPrice != null) {
      query = query.gte('price', filters.minPrice!);
    }
    
    // Filtro de precio máximo
    if (filters.maxPrice != null) {
      query = query.lte('price', filters.maxPrice!);
    }
    
    // Filtro solo ofertas
    if (filters.offersOnly) {
      query = query.eq('is_offer', true);
    }
    
    // Ordenación
    switch (filters.sortBy) {
      case ProductSortBy.newest:
        query = query.order('created_at', ascending: false);
        break;
      case ProductSortBy.priceAsc:
        query = query.order('price', ascending: true);
        break;
      case ProductSortBy.priceDesc:
        query = query.order('price', ascending: false);
        break;
      case ProductSortBy.nameAz:
        query = query.order('name', ascending: true);
        break;
    }
    
    // Paginación
    query = query.range(offset, offset + limit - 1);
    
    final response = await query;
    
    return (response as List)
        .map((json) => ProductModel.fromJson(_normalizeProductJson(json)))
        .toList();
  }
  
  /// Obtener producto por slug
  Future<ProductModel?> getProductBySlug(String slug) async {
    final response = await _client
        .from('products')
        .select(_selectQuery)
        .eq('slug', slug)
        .eq('active', true)
        .isFilter('deleted_at', null)
        .maybeSingle();
    
    if (response == null) return null;
    return ProductModel.fromJson(_normalizeProductJson(response));
  }
  
  /// Obtener producto por ID
  Future<ProductModel?> getProductById(String id) async {
    final response = await _client
        .from('products')
        .select(_selectQuery)
        .eq('id', id)
        .eq('active', true)
        .isFilter('deleted_at', null)
        .maybeSingle();
    
    if (response == null) return null;
    return ProductModel.fromJson(_normalizeProductJson(response));
  }
  
  /// Obtener productos en oferta
  Future<List<ProductModel>> getOfferProducts({int limit = 8}) async {
    final response = await _client
        .from('products')
        .select(_selectQuery)
        .eq('active', true)
        .eq('is_offer', true)
        .isFilter('deleted_at', null)
        .limit(limit);
    
    return (response as List)
        .map((json) => ProductModel.fromJson(_normalizeProductJson(json)))
        .toList();
  }
  
  /// Obtener productos destacados (más recientes)
  Future<List<ProductModel>> getFeaturedProducts({int limit = 8}) async {
    final response = await _client
        .from('products')
        .select(_selectQuery)
        .eq('active', true)
        .isFilter('deleted_at', null)
        .order('created_at', ascending: false)
        .limit(limit);
    
    return (response as List)
        .map((json) => ProductModel.fromJson(_normalizeProductJson(json)))
        .toList();
  }
  
  /// Obtener productos por categoría
  Future<List<ProductModel>> getProductsByCategory(
    String categoryId, {
    int limit = 20,
    int offset = 0,
  }) async {
    final response = await _client
        .from('products')
        .select(_selectQuery)
        .eq('category_id', categoryId)
        .eq('active', true)
        .isFilter('deleted_at', null)
        .order('created_at', ascending: false)
        .range(offset, offset + limit - 1);
    
    return (response as List)
        .map((json) => ProductModel.fromJson(_normalizeProductJson(json)))
        .toList();
  }
  
  /// Normalizar JSON de Supabase para Freezed
  Map<String, dynamic> _normalizeProductJson(Map<String, dynamic> json) {
    // Supabase devuelve relaciones como listas/objetos anidados
    // Freezed espera nombres en snake_case, pero las relaciones
    // pueden venir con el alias que definimos en select
    return {
      ...json,
      // Asegurar que category sea el objeto correcto
      'category': json['category'],
      // Asegurar que images sea una lista
      'images': json['images'] ?? [],
      // Asegurar que variants sea una lista
      'variants': json['variants'] ?? [],
    };
  }
}
```

---

## 3.3 Repositorio del Carrito

```dart
// lib/features/cart/data/repositories/cart_repository.dart
import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/cart_item_model.dart';

part 'cart_repository.g.dart';

@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  return CartRepository();
}

class CartRepository {
  static const String _boxName = 'cart';
  Box<CartItemModel>? _box;
  
  /// Obtener o abrir el box de Hive
  Future<Box<CartItemModel>> get box async {
    if (_box != null && _box!.isOpen) return _box!;
    _box = await Hive.openBox<CartItemModel>(_boxName);
    return _box!;
  }
  
  /// Obtener todos los items del carrito
  Future<List<CartItemModel>> getItems() async {
    final b = await box;
    return b.values.toList();
  }
  
  /// Obtener un item por ID
  Future<CartItemModel?> getItem(String itemId) async {
    final b = await box;
    return b.get(itemId);
  }
  
  /// Añadir o actualizar item
  Future<void> saveItem(CartItemModel item) async {
    final b = await box;
    await b.put(item.id, item);
  }
  
  /// Eliminar item
  Future<void> deleteItem(String itemId) async {
    final b = await box;
    await b.delete(itemId);
  }
  
  /// Limpiar carrito completo
  Future<void> clear() async {
    final b = await box;
    await b.clear();
  }
  
  /// Stream de cambios (para escuchar actualizaciones)
  Stream<BoxEvent> watchChanges() async* {
    final b = await box;
    yield* b.watch();
  }
}
```

---

## 3.4 Providers de Estado

### 3.4.1 Categories Provider
```dart
// lib/features/catalog/presentation/providers/categories_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/category_model.dart';
import '../../data/repositories/category_repository.dart';

part 'categories_provider.g.dart';

/// Provider para lista de categorías (cached)
@Riverpod(keepAlive: true)
Future<List<CategoryModel>> categories(CategoriesRef ref) async {
  final repository = ref.watch(categoryRepositoryProvider);
  return repository.getCategories();
}

/// Provider para categoría específica por slug
@riverpod
Future<CategoryModel?> categoryBySlug(
  CategoryBySlugRef ref,
  String slug,
) async {
  final repository = ref.watch(categoryRepositoryProvider);
  return repository.getCategoryBySlug(slug);
}
```

### 3.4.2 Product Filters Provider
```dart
// lib/features/catalog/presentation/providers/product_filters_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/product_filters.dart';

part 'product_filters_provider.g.dart';

@riverpod
class ProductFiltersNotifier extends _$ProductFiltersNotifier {
  @override
  ProductFilters build() => const ProductFilters();
  
  void setCategory(String? categorySlug) {
    state = state.copyWith(categorySlug: categorySlug);
  }
  
  void setSearch(String? query) {
    state = state.copyWith(
      search: query?.isEmpty == true ? null : query,
    );
  }
  
  void setPriceRange({double? min, double? max}) {
    state = state.copyWith(minPrice: min, maxPrice: max);
  }
  
  void setOffersOnly(bool value) {
    state = state.copyWith(offersOnly: value);
  }
  
  void setSortBy(ProductSortBy sortBy) {
    state = state.copyWith(sortBy: sortBy);
  }
  
  void clearAll() {
    state = const ProductFilters();
  }
  
  void applyFilters(ProductFilters filters) {
    state = filters;
  }
}
```

### 3.4.3 Products Provider
```dart
// lib/features/catalog/presentation/providers/products_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/product_model.dart';
import '../../data/models/product_filters.dart';
import '../../data/repositories/product_repository.dart';
import 'product_filters_provider.dart';

part 'products_provider.g.dart';

/// Provider para lista de productos con filtros actuales
@riverpod
Future<List<ProductModel>> filteredProducts(FilteredProductsRef ref) async {
  final filters = ref.watch(productFiltersNotifierProvider);
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProducts(filters: filters);
}

/// Provider para producto individual por slug
@riverpod
Future<ProductModel?> productBySlug(
  ProductBySlugRef ref,
  String slug,
) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProductBySlug(slug);
}

/// Provider para productos en oferta (Home)
@riverpod
Future<List<ProductModel>> offerProducts(OfferProductsRef ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getOfferProducts();
}

/// Provider para productos destacados (Home)
@riverpod
Future<List<ProductModel>> featuredProducts(FeaturedProductsRef ref) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getFeaturedProducts();
}

/// Provider para productos de una categoría específica
@riverpod
Future<List<ProductModel>> productsByCategory(
  ProductsByCategoryRef ref,
  String categoryId,
) async {
  final repository = ref.watch(productRepositoryProvider);
  return repository.getProductsByCategory(categoryId);
}

/// Provider para el conteo de productos con filtros actuales
@riverpod
Future<int> productsCount(ProductsCountRef ref) async {
  final products = await ref.watch(filteredProductsProvider.future);
  return products.length;
}
```

### 3.4.4 Cart Provider
```dart
// lib/features/cart/presentation/providers/cart_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/cart_item_model.dart';
import '../../data/repositories/cart_repository.dart';

part 'cart_provider.g.dart';

@Riverpod(keepAlive: true)
class CartNotifier extends _$CartNotifier {
  @override
  Future<List<CartItemModel>> build() async {
    final repository = ref.watch(cartRepositoryProvider);
    return repository.getItems();
  }
  
  /// Añadir item al carrito
  Future<void> addItem({
    required String productId,
    required String productName,
    required String productSlug,
    required String variantId,
    required String size,
    required double price,
    required String imageUrl,
    int quantity = 1,
  }) async {
    final repository = ref.watch(cartRepositoryProvider);
    final currentItems = state.valueOrNull ?? [];
    
    final itemId = CartItemModel.generateId(productId, variantId);
    final existingIndex = currentItems.indexWhere((item) => item.id == itemId);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad del item existente
      final existing = currentItems[existingIndex];
      final updated = existing.copyWith(quantity: existing.quantity + quantity);
      await repository.saveItem(updated);
    } else {
      // Crear nuevo item
      final newItem = CartItemModel.fromProduct(
        productId: productId,
        productName: productName,
        productSlug: productSlug,
        variantId: variantId,
        size: size,
        price: price,
        imageUrl: imageUrl,
        quantity: quantity,
      );
      await repository.saveItem(newItem);
    }
    
    // Refrescar estado
    ref.invalidateSelf();
  }
  
  /// Actualizar cantidad de un item
  Future<void> updateQuantity(String itemId, int quantity) async {
    final repository = ref.watch(cartRepositoryProvider);
    
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    
    final item = await repository.getItem(itemId);
    if (item != null) {
      final updated = item.copyWith(quantity: quantity);
      await repository.saveItem(updated);
      ref.invalidateSelf();
    }
  }
  
  /// Eliminar item del carrito
  Future<void> removeItem(String itemId) async {
    final repository = ref.watch(cartRepositoryProvider);
    await repository.deleteItem(itemId);
    ref.invalidateSelf();
  }
  
  /// Limpiar carrito completo
  Future<void> clear() async {
    final repository = ref.watch(cartRepositoryProvider);
    await repository.clear();
    ref.invalidateSelf();
  }
}

/// Provider para el conteo total de items
@riverpod
int cartCount(CartCountRef ref) {
  final cartAsync = ref.watch(cartNotifierProvider);
  return cartAsync.when(
    data: (items) => items.fold(0, (sum, item) => sum + item.quantity),
    loading: () => 0,
    error: (_, __) => 0,
  );
}

/// Provider para el subtotal del carrito
@riverpod
double cartSubtotal(CartSubtotalRef ref) {
  final cartAsync = ref.watch(cartNotifierProvider);
  return cartAsync.when(
    data: (items) => items.fold(0.0, (sum, item) => sum + item.total),
    loading: () => 0.0,
    error: (_, __) => 0.0,
  );
}

/// Provider para verificar si un item está en el carrito
@riverpod
bool isInCart(IsInCartRef ref, String productId, String variantId) {
  final cartAsync = ref.watch(cartNotifierProvider);
  final itemId = CartItemModel.generateId(productId, variantId);
  return cartAsync.when(
    data: (items) => items.any((item) => item.id == itemId),
    loading: () => false,
    error: (_, __) => false,
  );
}
```

---

## 3.5 Utilidades de Formato

```dart
// lib/core/utils/formatters.dart

/// Formatear precio en euros
String formatPrice(double price) {
  return '€${price.toStringAsFixed(2).replaceAll('.', ',')}';
}

/// Formatear precio con símbolo al final (estilo español)
String formatPriceEs(double price) {
  final formatted = price.toStringAsFixed(2).replaceAll('.', ',');
  return '$formatted €';
}

/// Calcular porcentaje de descuento
int calculateDiscountPercent(double original, double offer) {
  if (original <= 0) return 0;
  return ((original - offer) / original * 100).round();
}

/// Formatear texto de stock
String formatStockText(int stock) {
  if (stock <= 0) return 'Agotado';
  if (stock <= 5) return '⚡ $stock unidades disponibles';
  return 'En stock';
}
```

---

## 3.6 Configurar Rutas

```dart
// lib/core/router/catalog_routes.dart
import 'package:go_router/go_router.dart';
import 'package:fashionstore/features/catalog/presentation/screens/products_screen.dart';
import 'package:fashionstore/features/catalog/presentation/screens/product_detail_screen.dart';
import 'package:fashionstore/features/catalog/presentation/screens/category_screen.dart';

final catalogRoutes = [
  GoRoute(
    path: '/productos',
    name: 'products',
    builder: (context, state) {
      return ProductsScreen(
        initialCategory: state.uri.queryParameters['categoria'],
        initialSearch: state.uri.queryParameters['q'],
        initialOffersOnly: state.uri.queryParameters['ofertas'] == 'true',
      );
    },
  ),
  GoRoute(
    path: '/productos/:slug',
    name: 'product-detail',
    builder: (context, state) {
      final slug = state.pathParameters['slug']!;
      return ProductDetailScreen(slug: slug);
    },
  ),
  GoRoute(
    path: '/categoria/:slug',
    name: 'category',
    builder: (context, state) {
      final slug = state.pathParameters['slug']!;
      return CategoryScreen(slug: slug);
    },
  ),
];

// Añadir al router principal en app_router.dart
// routes: [
//   ...authRoutes,
//   ...catalogRoutes,
// ]
```

---

## 3.7 Generar Código

```bash
# Generar código de Riverpod y Freezed
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 3.8 Tests de Repositorios

```dart
// test/features/catalog/data/repositories/product_repository_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockSupabaseClient extends Mock implements SupabaseClient {}

void main() {
  group('ProductRepository', () {
    late MockSupabaseClient mockClient;
    late ProductRepository repository;
    
    setUp(() {
      mockClient = MockSupabaseClient();
      repository = ProductRepository(mockClient);
    });
    
    test('getProducts returns list of products', () async {
      // Arrange
      when(() => mockClient.from('products').select(any()))
          .thenAnswer((_) async => [mockProductJson]);
      
      // Act
      final products = await repository.getProducts();
      
      // Assert
      expect(products, isNotEmpty);
      expect(products.first.name, equals('Test Product'));
    });
    
    test('getProducts applies category filter', () async {
      // Test que el filtro de categoría se aplica correctamente
    });
    
    test('getProducts applies price range', () async {
      // Test que el rango de precios se aplica
    });
  });
}
```

---

## 3.9 Checklist de Backend

- [ ] CategoryRepository implementado
- [ ] ProductRepository con todos los métodos
- [ ] CartRepository con Hive
- [ ] CategoriesProvider creado
- [ ] ProductFiltersNotifier con todas las acciones
- [ ] FilteredProductsProvider con filtros reactivos
- [ ] CartNotifier con addItem, removeItem, updateQuantity, clear
- [ ] CartCount y CartSubtotal providers
- [ ] Formatters de precio y stock
- [ ] Rutas de catálogo configuradas
- [ ] build_runner ejecutado sin errores
- [ ] Tests básicos de repositorios
