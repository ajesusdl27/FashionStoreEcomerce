# Prompt para Fase 06: Catálogo de Productos

## 📋 Contexto

Fases 01-05 completadas. Implementaré el catálogo completo: listado con filtros, búsqueda, detalle de producto y selector de tallas.

## 📚 Documentación

Lee: `Doc/Flutter/06-CATALOGO-PRODUCTOS.md`

## ✅ Tareas

### 6.1: Modelos Freezed

Crear en `lib/features/catalog/domain/models/`:

1. **product.dart**: Product con helpers (displayPrice, discountPercentage, hasStock)
2. **product_variant.dart**: Variant con (isAvailable, isLowStock)
3. **product_image.dart**: Image con optimizedUrl() para Cloudinary
4. **category.dart**: Category con SizeType enum
5. **product_filters.dart**: Filtros con hasActiveFilters

**EJECUTAR:** `flutter pub run build_runner build --delete-conflicting-outputs`

**Checklist:**
- [ ] 5 modelos creados
- [ ] build_runner ejecutado
- [ ] *.freezed.dart y *.g.dart generados

---

### 6.2: Repository

**Interface:** `lib/features/catalog/domain/repositories/products_repository.dart`

Métodos:
- getProducts(filtros, paginación)
- getProductBySlug(slug)
- getCategories()
- getCategoryBySlug(slug)

**Datasource:** `lib/features/catalog/data/datasources/supabase_catalog_datasource.dart`

Queries Supabase con:
- Nested relations (category, images, variants)
- Filtros dinámicos (.eq, .gte, .lte, .ilike)
- Ordenación (.order)

**Implementation:** `lib/features/catalog/data/repositories/products_repository_impl.dart`

**Checklist:**
- [ ] Interface creada
- [ ] Datasource con queries
- [ ] Implementation completa
- [ ] Nested queries funcionan

---

### 6.3: Providers

Crear en `lib/features/catalog/providers/`:

1. **products_providers.dart**:
   - productsRepository
   - filteredProducts (usa filtros)
   - product(slug)

2. **categories_providers.dart**:
   - categories
   - category(slug)

3. **filters_provider.dart**:
   - ProductFiltersNotifier (StateNotifier)
   - Métodos: setCategory, setSearchQuery, setPriceRange, toggleOnlyOffers, reset

**EJECUTAR:** build_runner

**Checklist:**
- [ ] 3 archivos de providers
- [ ] Code generation ejecutada
- [ ] ProductFiltersNotifier funcional

---

### 6.4: ProductCard Widget

**Archivo:** `lib/features/catalog/presentation/widgets/product_card.dart`

**Elementos:**
- CachedNetworkImage con Cloudinary optimization
- Badge descuento (top-left) si isOffer
- Badge categoría
- Overlay "AGOTADO" si !hasStock
- Nombre (max 2 líneas)
- Precio con tachado si oferta
- "Últimas X unidades" si stock <= 5

**Checklist:**
- [ ] Layout correcto
- [ ] Badges posicionados
- [ ] Precios formateados
- [ ] Hover effect (scale 0.98)

---

### 6.5: CatalogScreen

**Archivo:** `lib/features/catalog/presentation/screens/catalog_screen.dart`

**Elementos:**
- AppBar con botón filtros
- ProductGrid (2 columnas móvil)
- FloatingActionButton → FiltersSheet
- Pull to refresh
- Empty state si sin productos

**Estados:** Loading (shimmer), Error, Empty, Success

**Checklist:**
- [ ] Grid responsivo
- [ ] Filtros abren en sheet
- [ ] Pull to refresh
- [ ] Estados manejados

---

### 6.6: FiltersSheet

**Archivo:** `lib/features/catalog/presentation/widgets/filters_sheet.dart`

**BottomSheet con:**
- Header: "Filtros" + "Limpiar"
- Categorías (chips wrap)
- RangeSlider precio (0-500€)
- Toggle "Solo ofertas"
- Radio buttons ordenación
- Botón "Aplicar Filtros"

**Checklist:**
- [ ] Todas las secciones
- [ ] Aplica filtros al provider
- [ ] Cierra al aplicar

---

### 6.7: ProductDetailScreen

**Archivo:** `lib/features/catalog/presentation/screens/product_detail_screen.dart`

**Secciones:**
1. ProductGallery (swipeable)
2. Nombre + precio + badges
3. Descripción
4. SizeSelector
5. AddToCartButton (sticky)

**Checklist:**
- [ ] Todas las secciones
- [ ] Gallery swipeable
- [ ] SizeSelector funcional
- [ ] AddToCartButton (por implementar lógica en Fase 07)

---

### 6.8: ProductGallery Widget

PageView con:
- Swipe horizontal
- Dots indicadores
- Tap → full screen (photo_view)

**Checklist:**
- [ ] Swipe funciona
- [ ] Indicadores
- [ ] Full screen

---

### 6.9: SizeSelector Widget

Wrap de botones (48x48px):
- Selected: borde primary
- Disabled: tachado, opacity 0.4
- Normal: borde muted
- Low stock: ⚡ icon

**Checklist:**
- [ ] Botones por talla
- [ ] Estados visuales
- [ ] onSelect callback

---

## 🧪 Verificación

```bash
flutter run
```

**Tests:**
- [ ] Ver catálogo con productos
- [ ] Aplicar filtro categoría
- [ ] Buscar producto
- [ ] Filtro precio funciona
- [ ] Tap producto → detalle
- [ ] Swipe galería
- [ ] Seleccionar talla

**Checklist:**
- [ ] Todos los tests pasan
- [ ] UI exacta a diseño
- [ ] Imágenes cargan (Cloudinary)

## ✅ Checklist Final

- [ ] Modelos y build_runner
- [ ] Repository completo
- [ ] Providers funcionando
- [ ] ProductCard widget
- [ ] CatalogScreen
- [ ] FiltersSheet
- [ ] ProductDetailScreen
- [ ] ProductGallery
- [ ] SizeSelector
- [ ] Tests pasados

## 📝 Reportar Completado

```
✅ FASE 06 COMPLETADA

Archivos creados: [listar]
Tests: Catálogo ✅, Filtros ✅, Detalle ✅, Gallery ✅

Estado: LISTO PARA FASE 07 (Carrito)
```

## 🎯 Próximo

**FASE-07-CARRITO.md**
