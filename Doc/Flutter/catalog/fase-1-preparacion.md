# Fase 1: Preparación y Estructura - Catálogo de Productos

## 1.1 Crear Estructura de Carpetas

```bash
# Ejecutar en terminal desde la raíz del proyecto Flutter
mkdir -p lib/features/catalog/data/models
mkdir -p lib/features/catalog/data/repositories
mkdir -p lib/features/catalog/domain/entities
mkdir -p lib/features/catalog/presentation/providers
mkdir -p lib/features/catalog/presentation/screens
mkdir -p lib/features/catalog/presentation/widgets
mkdir -p lib/features/cart/data/models
mkdir -p lib/features/cart/data/repositories
mkdir -p lib/features/cart/presentation/providers
mkdir -p lib/features/cart/presentation/widgets
```

---

## 1.2 Instalar Dependencias

```yaml
# pubspec.yaml - agregar a dependencies
dependencies:
  # Ya instalados de fase auth
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3
  supabase_flutter: ^2.3.0
  go_router: ^13.0.0
  
  # Nuevos para catálogo
  cached_network_image: ^3.3.1      # Caché de imágenes
  shimmer: ^3.0.0                   # Skeletons de carga
  photo_view: ^0.15.0               # Galería con zoom
  hive_flutter: ^1.1.0              # Persistencia carrito
  flutter_staggered_grid_view: ^0.7.0  # Grid flexible

dev_dependencies:
  # Ya instalados
  riverpod_generator: ^2.3.9
  build_runner: ^2.4.8
  
  # Nuevos para Hive
  hive_generator: ^2.0.1
```

```bash
# Instalar dependencias
flutter pub get
```

---

## 1.3 Configurar Hive para Carrito

### 1.3.1 Inicialización en main.dart
```dart
// lib/main.dart
import 'package:hive_flutter/hive_flutter.dart';
import 'package:fashionstore/features/cart/data/models/cart_item_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializar Hive
  await Hive.initFlutter();
  Hive.registerAdapter(CartItemModelAdapter());
  await Hive.openBox<CartItemModel>('cart');
  
  // Inicializar Supabase (ya existente)
  await Supabase.initialize(...);
  
  runApp(const ProviderScope(child: MyApp()));
}
```

---

## 1.4 Crear Modelos de Datos

### 1.4.1 CategoryModel
```dart
// lib/features/catalog/data/models/category_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'category_model.freezed.dart';
part 'category_model.g.dart';

enum SizeType { clothing, footwear, universal }

@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    required String id,
    required String name,
    required String slug,
    @Default(SizeType.clothing) SizeType sizeType,
    DateTime? createdAt,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);
}

// Extensión para el tamaño según categoría
extension CategoryModelX on CategoryModel {
  List<String> get availableSizes {
    switch (sizeType) {
      case SizeType.clothing:
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      case SizeType.footwear:
        return ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
      case SizeType.universal:
        return ['Única'];
    }
  }
}
```

### 1.4.2 ProductVariantModel
```dart
// lib/features/catalog/data/models/product_variant_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_variant_model.freezed.dart';
part 'product_variant_model.g.dart';

@freezed
class ProductVariantModel with _$ProductVariantModel {
  const ProductVariantModel._();
  
  const factory ProductVariantModel({
    required String id,
    required String productId,
    required String size,
    @Default(0) int stock,
  }) = _ProductVariantModel;

  factory ProductVariantModel.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantModelFromJson(json);
  
  bool get isAvailable => stock > 0;
  bool get isLowStock => stock > 0 && stock <= 5;
}
```

### 1.4.3 ProductImageModel
```dart
// lib/features/catalog/data/models/product_image_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_image_model.freezed.dart';
part 'product_image_model.g.dart';

@freezed
class ProductImageModel with _$ProductImageModel {
  const factory ProductImageModel({
    required String id,
    required String productId,
    required String imageUrl,
    @Default(0) int order,
    DateTime? createdAt,
  }) = _ProductImageModel;

  factory ProductImageModel.fromJson(Map<String, dynamic> json) =>
      _$ProductImageModelFromJson(json);
}
```

### 1.4.4 ProductModel
```dart
// lib/features/catalog/data/models/product_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'category_model.dart';
import 'product_variant_model.dart';
import 'product_image_model.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

@freezed
class ProductModel with _$ProductModel {
  const ProductModel._();
  
  const factory ProductModel({
    required String id,
    required String name,
    required String slug,
    String? description,
    required double price,
    double? offerPrice,
    String? categoryId,
    @Default(true) bool active,
    @Default(false) bool isOffer,
    DateTime? createdAt,
    // Relaciones
    CategoryModel? category,
    @Default([]) List<ProductVariantModel> variants,
    @Default([]) List<ProductImageModel> images,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
  
  // Computed properties
  bool get hasOffer => isOffer && offerPrice != null;
  double get displayPrice => hasOffer ? offerPrice! : price;
  int get totalStock => variants.fold(0, (sum, v) => sum + v.stock);
  bool get isAvailable => totalStock > 0;
  bool get isLowStock => totalStock > 0 && totalStock <= 5;
  
  int get discountPercent {
    if (!hasOffer) return 0;
    return ((price - offerPrice!) / price * 100).round();
  }
  
  String? get mainImageUrl {
    if (images.isEmpty) return null;
    final sorted = [...images]..sort((a, b) => a.order.compareTo(b.order));
    return sorted.first.imageUrl;
  }
  
  List<ProductImageModel> get sortedImages {
    return [...images]..sort((a, b) => a.order.compareTo(b.order));
  }
}
```

### 1.4.5 CartItemModel (con Hive)
```dart
// lib/features/cart/data/models/cart_item_model.dart
import 'package:hive/hive.dart';

part 'cart_item_model.g.dart';

@HiveType(typeId: 0)
class CartItemModel extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String productId;
  
  @HiveField(2)
  final String productName;
  
  @HiveField(3)
  final String productSlug;
  
  @HiveField(4)
  final String variantId;
  
  @HiveField(5)
  final String size;
  
  @HiveField(6)
  final double price;
  
  @HiveField(7)
  final String imageUrl;
  
  @HiveField(8)
  int quantity;

  CartItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productSlug,
    required this.variantId,
    required this.size,
    required this.price,
    required this.imageUrl,
    this.quantity = 1,
  });

  /// Genera el ID compuesto
  static String generateId(String productId, String variantId) =>
      '$productId-$variantId';

  /// Crear desde producto + variante seleccionada
  factory CartItemModel.fromProduct({
    required String productId,
    required String productName,
    required String productSlug,
    required String variantId,
    required String size,
    required double price,
    required String imageUrl,
    int quantity = 1,
  }) {
    return CartItemModel(
      id: generateId(productId, variantId),
      productId: productId,
      productName: productName,
      productSlug: productSlug,
      variantId: variantId,
      size: size,
      price: price,
      imageUrl: imageUrl,
      quantity: quantity,
    );
  }

  /// Crear copia con cantidad actualizada
  CartItemModel copyWith({int? quantity}) {
    return CartItemModel(
      id: id,
      productId: productId,
      productName: productName,
      productSlug: productSlug,
      variantId: variantId,
      size: size,
      price: price,
      imageUrl: imageUrl,
      quantity: quantity ?? this.quantity,
    );
  }
  
  /// Total del item
  double get total => price * quantity;
}
```

---

## 1.5 Crear Filtros de Productos

```dart
// lib/features/catalog/data/models/product_filters.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_filters.freezed.dart';

enum ProductSortBy {
  newest,
  priceAsc,
  priceDesc,
  nameAz,
}

@freezed
class ProductFilters with _$ProductFilters {
  const factory ProductFilters({
    String? categorySlug,
    String? search,
    double? minPrice,
    double? maxPrice,
    @Default(false) bool offersOnly,
    @Default(ProductSortBy.newest) ProductSortBy sortBy,
  }) = _ProductFilters;
  
  factory ProductFilters.initial() => const ProductFilters();
}

extension ProductFiltersX on ProductFilters {
  bool get hasActiveFilters =>
      categorySlug != null ||
      (search != null && search!.isNotEmpty) ||
      minPrice != null ||
      maxPrice != null ||
      offersOnly;
  
  /// Construir query params para URL
  Map<String, String> toQueryParams() {
    final params = <String, String>{};
    if (categorySlug != null) params['categoria'] = categorySlug!;
    if (search != null && search!.isNotEmpty) params['q'] = search!;
    if (minPrice != null) params['minPrice'] = minPrice.toString();
    if (maxPrice != null) params['maxPrice'] = maxPrice.toString();
    if (offersOnly) params['ofertas'] = 'true';
    if (sortBy != ProductSortBy.newest) {
      switch (sortBy) {
        case ProductSortBy.priceAsc:
          params['orden'] = 'price';
          params['dir'] = 'asc';
          break;
        case ProductSortBy.priceDesc:
          params['orden'] = 'price';
          break;
        case ProductSortBy.nameAz:
          params['orden'] = 'name';
          params['dir'] = 'asc';
          break;
        default:
          break;
      }
    }
    return params;
  }
}
```

---

## 1.6 Utilidades de Imagen

```dart
// lib/core/utils/image_utils.dart

/// Verifica si una URL es de Cloudinary
bool isCloudinaryUrl(String url) {
  return url.contains('res.cloudinary.com');
}

/// Genera URL optimizada de Cloudinary
String getOptimizedImageUrl(String url, {int width = 400, int? height}) {
  if (!isCloudinaryUrl(url)) return url;
  
  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/file.ext
  final parts = url.split('/upload/');
  if (parts.length != 2) return url;
  
  final transformations = <String>[
    'w_$width',
    if (height != null) 'h_$height',
    'q_auto',
    'f_auto',
  ].join(',');
  
  return '${parts[0]}/upload/$transformations/${parts[1]}';
}

/// URLs predefinidas para diferentes tamaños
class ImageSizes {
  static String thumbnail(String url) => getOptimizedImageUrl(url, width: 100);
  static String card(String url) => getOptimizedImageUrl(url, width: 400);
  static String detail(String url) => getOptimizedImageUrl(url, width: 800);
  static String full(String url) => getOptimizedImageUrl(url, width: 1200);
}
```

---

## 1.7 Generar Código

```bash
# Generar código de Freezed, Riverpod y Hive
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 1.8 Crear Barrel Exports

```dart
// lib/features/catalog/catalog.dart
export 'data/models/category_model.dart';
export 'data/models/product_model.dart';
export 'data/models/product_variant_model.dart';
export 'data/models/product_image_model.dart';
export 'data/models/product_filters.dart';
export 'data/repositories/product_repository.dart';
export 'data/repositories/category_repository.dart';
export 'presentation/providers/products_provider.dart';
export 'presentation/providers/categories_provider.dart';
export 'presentation/providers/product_filters_provider.dart';
export 'presentation/screens/products_screen.dart';
export 'presentation/screens/product_detail_screen.dart';
export 'presentation/screens/category_screen.dart';
```

```dart
// lib/features/cart/cart.dart
export 'data/models/cart_item_model.dart';
export 'data/repositories/cart_repository.dart';
export 'presentation/providers/cart_provider.dart';
export 'presentation/widgets/cart_badge.dart';
export 'presentation/widgets/cart_sheet.dart';
```

---

## 1.9 Checklist de Preparación

- [ ] Estructura de carpetas creada
- [ ] Dependencias instaladas (cached_network_image, shimmer, photo_view, hive)
- [ ] Hive inicializado en main.dart
- [ ] CategoryModel creado con size_type
- [ ] ProductVariantModel creado con stock
- [ ] ProductImageModel creado con order
- [ ] ProductModel creado con relaciones y computed
- [ ] CartItemModel creado con Hive annotations
- [ ] ProductFilters creado con enum SortBy
- [ ] ImageUtils creado para Cloudinary
- [ ] build_runner ejecutado sin errores
- [ ] Barrel exports creados
