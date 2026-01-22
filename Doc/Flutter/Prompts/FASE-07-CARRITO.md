# Prompt para Fase 07: Carrito de Compra

## 📋 Contexto

Fases 01-06 completadas. Implementaré el carrito con persistencia local y cálculo de totales.

## 📚 Documentación

Lee: `Doc/Flutter/07-CARRITO.md`

## ✅ Tareas

### 7.1: Modelos Freezed

Crear en `lib/features/cart/domain/models/`:

1. **cart_item.dart**: Con helper fromProductAndVariant
2. **cart.dart**: Con computed (subtotal, totalItems, calculateShipping, calculateTotal)

**EJECUTAR:** build_runner

**Checklist:**
- [ ] Modelos creados
- [ ] Helpers implementados
- [ ] build_runner OK

---

### 7.2: Repository

**CartLocalDatasource** (`data/datasources/`):
- Usar SharedPreferences
- Key: 'fashionstore_cart'
- Métodos: getCart, saveCart, clearCart

**CartRepositoryImpl** (`data/repositories/`):
- Stream<Cart> para reactividad
- addItem (merge si existe)
- removeItem
- updateQuantity
- clear

**Checklist:**
- [ ] Datasource con SharedPreferences
- [ ] Repository con Stream
- [ ] Todas las operaciones

---

### 7.3: Providers

Actualizar `lib/features/cart/providers/cart_providers.dart`:

```dart
@riverpod
CartRepository cartRepository(CartRepositoryRef ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  final datasource = CartLocalDatasource(prefs);
  return CartRepositoryImpl(datasource);
}

@riverpod
Stream<Cart> cartStream(CartStreamRef ref) {
  final repository = ref.watch(cartRepositoryProvider);
  return repository.watchCart();
}

@riverpod
Cart cart(CartRef ref) {
  final cartAsync = ref.watch(cartStreamProvider);
  return cartAsync.when(
    data: (cart) => cart,
    loading: () => const Cart(),
    error: (_, __) => const Cart(),
  );
}

@riverpod
int cartCount(CartCountRef ref) {
  final cart = ref.watch(cartProvider);
  return cart.totalItems;
}

@riverpod
class CartController extends _$CartController {
  @override
  FutureOr<void> build() {}
  
  Future<void> addItem(CartItem item) async { /* ... */ }
  Future<void> removeItem(String itemId) async { /* ... */ }
  Future<void> updateQuantity(String itemId, int quantity) async { /* ... */ }
  Future<void> clear() async { /* ... */ }
}
```

**EJECUTAR:** build_runner

**Checklist:**
- [ ] Todos los providers
- [ ] CartController completo
- [ ] build_runner OK

---

### 7.4: SharedPreferences Provider

**Archivo:** `lib/core/services/storage_service.dart`

```dart
@riverpod
Future<SharedPreferences> sharedPreferences(SharedPreferencesRef ref) async {
  return await SharedPreferences.getInstance();
}
```

**Checklist:**
- [ ] Provider creado

---

### 7.5: CartScreen

**Archivo:** `lib/features/cart/presentation/screens/cart_screen.dart`

**UI:**
- AppBar "Carrito (X items)"
- Lista de CartItemCard
- EmptyCart si isEmpty
- CartSummary sticky bottom
- Botón "Proceder al Checkout"

**Checklist:**
- [ ] Estados: empty, hasItems
- [ ] CartItemCard por item
- [ ] CartSummary
- [ ] Botón checkout navega

---

### 7.6: CartItemCard Widget

**Layout:**
```
[Imagen] Nombre Producto
         Talla: M
         €25.00 × 2
         [−] [2] [+]  [🗑️]
```

**Checklist:**
- [ ] Imagen 80x80
- [ ] Botones +/-
- [ ] Botón eliminar
- [ ] Confirmación al eliminar

---

### 7.7: Integrar con ProductDetail

**Modificar:** `lib/features/catalog/presentation/widgets/add_to_cart_button.dart`

**Implementar onPressed:**
```dart
final cartController = ref.read(cartControllerProvider.notifier);

await cartController.addItem(
  CartItem.fromProductAndVariant(
    product: widget.product,
    variant: selectedVariant,
    quantity: 1,
  ),
);

// Success feedback
```

**Checklist:**
- [ ] Añadir al carrito funciona
- [ ] Badge actualiza
- [ ] Success feedback

---

## 🧪 Verificación

**Tests:**
- [ ] Añadir producto desde detalle
- [ ] Aparece en carrito
- [ ] Badge actualiza
- [ ] Incrementar cantidad
- [ ] Decrementar cantidad
- [ ] Eliminar item
- [ ] Cálculo subtotal correcto
- [ ] Cálculo envío correcto (gratis >= 50€)
- [ ] Cerrar app → abrir → carrito persiste

## ✅ Checklist Final

- [ ] Modelos + build_runner
- [ ] Repository + Stream
- [ ] Providers completos
- [ ] CartScreen funcional
- [ ] CartItemCard
- [ ] Integración con ProductDetail
- [ ] Persistencia funciona
- [ ] Cálculos correctos

## 📝 Reporte

```
✅ FASE 07 COMPLETADA

Archivos: [listar]
Tests: Add ✅, Remove ✅, Update ✅, Persist ✅, Cálculos ✅

Estado: LISTO PARA FASE 08 (Checkout)
```

## 🎯 Próximo

**FASE-08-CHECKOUT.md**
