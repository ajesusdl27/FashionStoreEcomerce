# Módulo 07: Carrito de Compra

## 🎯 Objetivo

Implementar el sistema de carrito de compra con persistencia local, gestión de cantidades, cálculo de totales y validación de stock.

## 💾 Almacenamiento Local

### SharedPreferences

El carrito se almacena en SharedPreferences (no en Supabase) porque:
- Es local al dispositivo
- Persiste al cerrar la app
- Rápido acceso (no necesita red)
- Se sincroniza con servidor solo en checkout

**Key**: `fashionstore_cart`
**Formato**: JSON serializado de List<CartItem>

## 🏗️ Arquitectura del Módulo

```
features/cart/
├── data/
│   ├── datasources/
│   │   └── cart_local_datasource.dart
│   └── repositories/
│       └── cart_repository_impl.dart
│
├── domain/
│   ├── models/
│   │   ├── cart_item.dart (Freezed)
│   │   └── cart.dart (Freezed)
│   └── repositories/
│       └── cart_repository.dart (interface)
│
├── providers/
│   └── cart_providers.dart
│
└── presentation/
    ├── screens/
    │   └── cart_screen.dart
    └── widgets/
        ├── cart_item_card.dart
        ├── cart_summary.dart
        └── empty_cart.dart
```

## 📦 Modelos de Dominio (Freezed)

### 1. CartItem

```dart
@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    required String id,              // "{productId}-{variantId}"
    required String productId,
    required String productName,
    required String productSlug,
    required String variantId,
    required String size,
    required double price,           // Precio al añadir (puede haber cambiado)
    required String imageUrl,
    required int quantity,
    DateTime? addedAt,
  }) = _CartItem;
  
  factory CartItem.fromJson(Map<String, dynamic> json) => 
      _$CartItemFromJson(json);
  
  const CartItem._();
  
  double get subtotal => price * quantity;
  
  // Factory desde Product + Variant
  factory CartItem.fromProductAndVariant({
    required Product product,
    required ProductVariant variant,
    int quantity = 1,
  }) {
    return CartItem(
      id: '${product.id}-${variant.id}',
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantId: variant.id,
      size: variant.size,
      price: product.displayPrice,
      imageUrl: product.mainImage?.imageUrl ?? '',
      quantity: quantity,
      addedAt: DateTime.now(),
    );
  }
}
```

### 2. Cart

```dart
@freezed
class Cart with _$Cart {
  const factory Cart({
    @Default([]) List<CartItem> items,
  }) = _Cart;
  
  factory Cart.fromJson(Map<String, dynamic> json) => 
      _$CartFromJson(json);
  
  const Cart._();
  
  // Computed properties
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  
  double get subtotal => items.fold(0.0, (sum, item) => sum + item.subtotal);
  
  double calculateShipping(double freeShippingThreshold) {
    return subtotal >= freeShippingThreshold ? 0.0 : 4.99;
  }
  
  double calculateTotal(double freeShippingThreshold, [double discount = 0.0]) {
    return subtotal + calculateShipping(freeShippingThreshold) - discount;
  }
  
  bool get isEmpty => items.isEmpty;
  
  bool get hasItems => items.isNotEmpty;
  
  // Helpers
  CartItem? findItem(String itemId) {
    try {
      return items.firstWhere((item) => item.id == itemId);
    } catch (_) {
      return null;
    }
  }
  
  bool containsItem(String itemId) {
    return items.any((item) => item.id == itemId);
  }
}
```

## 🔌 Repository (Data Layer)

### Interface (Domain)

```dart
abstract class CartRepository {
  Future<Cart> getCart();
  Future<void> addItem(CartItem item);
  Future<void> removeItem(String itemId);
  Future<void> updateQuantity(String itemId, int quantity);
  Future<void> clear();
  Stream<Cart> watchCart();
}
```

### Datasource (Local)

```dart
class CartLocalDatasource {
  static const _cartKey = 'fashionstore_cart';
  final SharedPreferences _prefs;
  
  CartLocalDatasource(this._prefs);
  
  Future<Cart> getCart() async {
    final cartJson = _prefs.getString(_cartKey);
    if (cartJson == null) return const Cart();
    
    try {
      final data = jsonDecode(cartJson) as Map<String, dynamic>;
      return Cart.fromJson(data);
    } catch (e) {
      // Si hay error al parsear, retornar carrito vacío
      return const Cart();
    }
  }
  
  Future<void> saveCart(Cart cart) async {
    final cartJson = jsonEncode(cart.toJson());
    await _prefs.setString(_cartKey, cartJson);
  }
  
  Future<void> clearCart() async {
    await _prefs.remove(_cartKey);
  }
}
```

### Implementation

```dart
class CartRepositoryImpl implements CartRepository {
  final CartLocalDatasource _datasource;
  final _cartController = StreamController<Cart>.broadcast();
  
  CartRepositoryImpl(this._datasource) {
    // Cargar carrito inicial
    _loadInitialCart();
  }
  
  Future<void> _loadInitialCart() async {
    final cart = await _datasource.getCart();
    _cartController.add(cart);
  }
  
  @override
  Future<Cart> getCart() async {
    return _datasource.getCart();
  }
  
  @override
  Stream<Cart> watchCart() {
    return _cartController.stream;
  }
  
  @override
  Future<void> addItem(CartItem item) async {
    final cart = await getCart();
    
    // Verificar si el item ya existe
    final existingIndex = cart.items.indexWhere((i) => i.id == item.id);
    
    List<CartItem> updatedItems;
    if (existingIndex >= 0) {
      // Incrementar cantidad del item existente
      updatedItems = List.from(cart.items);
      final existingItem = updatedItems[existingIndex];
      updatedItems[existingIndex] = existingItem.copyWith(
        quantity: existingItem.quantity + item.quantity,
      );
    } else {
      // Agregar nuevo item
      updatedItems = [...cart.items, item];
    }
    
    final updatedCart = cart.copyWith(items: updatedItems);
    await _datasource.saveCart(updatedCart);
    _cartController.add(updatedCart);
  }
  
  @override
  Future<void> removeItem(String itemId) async {
    final cart = await getCart();
    final updatedItems = cart.items.where((item) => item.id != itemId).toList();
    final updatedCart = cart.copyWith(items: updatedItems);
    await _datasource.saveCart(updatedCart);
    _cartController.add(updatedCart);
  }
  
  @override
  Future<void> updateQuantity(String itemId, int quantity) async {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    
    final cart = await getCart();
    final updatedItems = cart.items.map((item) {
      return item.id == itemId ? item.copyWith(quantity: quantity) : item;
    }).toList();
    
    final updatedCart = cart.copyWith(items: updatedItems);
    await _datasource.saveCart(updatedCart);
    _cartController.add(updatedCart);
  }
  
  @override
  Future<void> clear() async {
    await _datasource.clearCart();
    _cartController.add(const Cart());
  }
  
  void dispose() {
    _cartController.close();
  }
}
```

## 🎣 Providers (Riverpod)

```dart
// Datasource
@riverpod
CartLocalDatasource cartLocalDatasource(CartLocalDatasourceRef ref) {
  // Usar StorageService que wrappea SharedPreferences
  final prefs = ref.watch(sharedPreferencesProvider);
  return CartLocalDatasource(prefs);
}

// Repository
@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  final datasource = ref.watch(cartLocalDatasourceProvider);
  return CartRepositoryImpl(datasource);
}

// Stream del carrito (reactivo)
@riverpod
Stream<Cart> cartStream(CartStreamRef ref) {
  final repository = ref.watch(cartRepositoryProvider);
  return repository.watchCart();
}

// Cart actual
@riverpod
Cart cart(CartRef ref) {
  final cartAsync = ref.watch(cartStreamProvider);
  return cartAsync.when(
    data: (cart) => cart,
    loading: () => const Cart(),
    error: (_, __) => const Cart(),
  );
}

// Computed: total items (para badge)
@riverpod
int cartCount(CartCountRef ref) {
  final cart = ref.watch(cartProvider);
  return cart.totalItems;
}

// Computed: subtotal
@riverpod
double cartSubtotal(CartSubtotalRef ref) {
  final cart = ref.watch(cartProvider);
  return cart.subtotal;
}

// Controller para acciones
@riverpod
class CartController extends _$CartController {
  @override
  FutureOr<void> build() {}
  
  Future<void> addItem(CartItem item) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(cartRepositoryProvider);
      await repository.addItem(item);
    });
  }
  
  Future<void> removeItem(String itemId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(cartRepositoryProvider);
      await repository.removeItem(itemId);
    });
  }
  
  Future<void> updateQuantity(String itemId, int quantity) async {
    final repository = ref.read(cartRepositoryProvider);
    await repository.updateQuantity(itemId, quantity);
  }
  
  Future<void> clear() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(cartRepositoryProvider);
      await repository.clear();
    });
  }
}
```

## 🖼️ Pantallas de Presentación

### CartScreen

**Ruta**: `/carrito`

**Elementos UI:**
- AppBar con título "Carrito" + cantidad de items
- Lista de CartItemCard (si hasItems)
- EmptyCart widget (si isEmpty)
- CartSummary (sticky bottom)
- AppButton.primary "Proceder al Checkout" (bottom)

**Estados:**
- Empty: EmptyCart con CTA "Explorar Productos"
- Has Items: Lista + resumen + botón
- Loading: Shimmer o spinner en botón

**Especificaciones:**
- Lista scrollable con separadores
- Botón checkout sticky bottom (shadow elevado)
- Confirmación al eliminar item (dialog)

## 🎨 Widgets Personalizados

### 1. CartItemCard

**Ubicación**: `lib/features/cart/presentation/widgets/cart_item_card.dart`

**Props:**
- item: CartItem
- onUpdateQuantity: Function(int)
- onRemove: VoidCallback

**Layout:**
```
[ Imagen ]  Nombre del producto
            Talla: M
            €XX.XX × cantidad
            [ - ] [ 2 ] [ + ]  [ 🗑️ ]
```

**Elementos:**
- Imagen del producto (80x80px, optimizada)
- Nombre (max 2 líneas)
- Talla (label small, muted)
- Precio unitario × cantidad
- Botones +/- para cantidad (min: 1, max: 10)
- TextField centro para cantidad (editable)
- Botón eliminar (icon trash, color error)

**Especificaciones:**
- Card con padding `AppSpacing.md`
- Border radius `AppSpacing.radiusLg`
- Spacing entre elementos: `AppSpacing.gapSm`
- Botones +/-: 36x36px
- Animación al eliminar (slide + fade out)

### 2. CartSummary

**Ubicación**: `lib/features/cart/presentation/widgets/cart_summary.dart`

**Props:**
- cart: Cart
- freeShippingThreshold: double (default 50.0)
- discount: double (default 0.0, usado en checkout con cupones)

**Layout:**
```
Resumen del Pedido
━━━━━━━━━━━━━━━━━━━━━
Subtotal              €XX.XX
Envío                 €4.99
  └─ Envío gratis a partir de €50
Descuento            -€XX.XX
━━━━━━━━━━━━━━━━━━━━━
Total                 €XX.XX
```

**Elementos:**
- Título "Resumen del Pedido" (headingMedium)
- Líneas de cálculo:
  - Subtotal (suma de items)
  - Envío (o "GRATIS" si >= threshold)
  - Descuento (si > 0)
- Divider
- Total (headingLarge, color primary)
- Mensaje de envío gratis (si aplica)

**Especificaciones:**
- Card o Container con background card
- Padding: `AppSpacing.md`
- Spacing entre líneas: `AppSpacing.gapSm`
- Font subtotal/envío: bodyMedium
- Font total: headingLarge

### 3. EmptyCart

**Ubicación**: `lib/features/cart/presentation/widgets/empty_cart.dart`

**Elementos:**
- Icon shopping-cart (size 80, color muted, opacity 0.3)
- Título "Tu carrito está vacío" (headingMedium)
- Mensaje "Explora nuestro catálogo y añade productos" (bodyMedium, muted)
- AppButton.primary "Explorar Catálogo" (navegación a /productos)

**Especificaciones:**
- Centrado vertical y horizontalmente
- Max width 400px
- Spacing: `AppSpacing.lg` entre elementos

## 🔧 Lógica de Negocio

### Cálculo de Envío

```dart
double calculateShipping(double subtotal) {
  const double freeShippingThreshold = 50.0;
  const double shippingCost = 4.99;
  
  return subtotal >= freeShippingThreshold ? 0.0 : shippingCost;
}
```

### Validación de Cantidad

- Mínimo: 1
- Máximo: 10 (por AppConstants.maxQuantityPerItem)
- Si se intenta más, mostrar toast "Máximo 10 unidades por producto"

### Validación de Stock (en Checkout)

Antes de proceder a checkout, validar que todos los items tienen stock:

```dart
Future<bool> validateStock(List<CartItem> items) async {
  for (final item in items) {
    final variant = await getVariantById(item.variantId);
    if (variant.stock < item.quantity) {
      // Mostrar error: "Stock insuficiente para {productName}"
      return false;
    }
  }
  return true;
}
```

## 🎭 Animaciones

### Añadir al Carrito (desde ProductDetail)

1. Animación del botón: scale pulse
2. Vibración háptica
3. Feedback visual (checkmark)
4. Badge del carrito incrementa con animación scale

### Eliminar del Carrito

1. Confirmación dialog: "¿Eliminar este producto?"
2. Si confirma: Slide out + fade out (300ms)
3. Lista se reorganiza con animación

### Actualizar Cantidad

- Debounce de 500ms antes de guardar (evitar múltiples writes)
- Animación sutil en el número

## ✅ Verificación del Módulo

### Checklist

- [ ] Modelos Freezed creados y generados
- [ ] CartLocalDatasource con SharedPreferences
- [ ] Repository con todas las operaciones
- [ ] Providers Riverpod (cart, cartCount, cartController)
- [ ] CartScreen con estados (empty, hasItems)
- [ ] CartItemCard con +/- y eliminar
- [ ] CartSummary con cálculos correctos
- [ ] EmptyCart con CTA
- [ ] Persistencia funciona (cerrar app → abrir → carrito se mantiene)
- [ ] Badge de carrito en bottom nav actualiza en tiempo real
- [ ] Validaciones de cantidad (min 1, max 10)
- [ ] Confirmación al eliminar item

### Tests Manuales

1. **Añadir al carrito:**
   - Desde ProductDetail → añadir item
   - Verificar que aparece en CarScreen
   - Badge actualiza correctamente

2. **Cantidad:**
   - Incrementar con botón +
   - Decrementar con botón -
   - Editar manualmente en TextField
   - No permitir < 1 ni > 10

3. **Eliminar:**
   - Tap en botón eliminar
   - Confirmar en dialog
   - Item desaparece con animación

4. **Cálculos:**
   - Subtotal correcto
   - Envío gratis si >= 50€
   - Envío 4.99€ si < 50€
   - Total suma correctamente

5. **Persistencia:**
   - Añadir items
   - Cerrar app
   - Abrir app
   - Verificar que carrito se mantiene

6. **Empty state:**
   - Eliminar todos los items
   - Verificar que muestra EmptyCart
   - Tap en "Explorar" → navega a catalog

## 🎯 Siguiente Paso

Una vez completado este módulo, proceder a:

**Módulo 08: Checkout y Pagos** - Implementar proceso de pago con Stripe y validación de cupones.

---

**Tiempo Estimado**: 4-6 horas
**Complejidad**: Media
**Dependencias**: Módulos 01-06 completados
