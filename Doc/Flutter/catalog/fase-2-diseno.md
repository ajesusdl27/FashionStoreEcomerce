# Fase 2: Diseño UI/UX - Catálogo de Productos

## 2.1 Especificaciones de Diseño

### 2.1.1 Tema de Colores (referencia web)
```dart
// lib/core/theme/app_colors.dart (extender)

// Colores específicos de catálogo
static const Color offerPrice = Color(0xFFFF4757);    // Accent - precios rebajados
static const Color stockLow = Color(0xFFFFC107);      // Amarillo - pocas unidades
static const Color stockOut = Color(0xFFFF4757);      // Rojo - agotado
static const Color successAdd = Color(0xFF10B981);    // Verde - añadido al carrito
static const Color cardBg = Color(0xFF1A1A1A);        // Fondo de tarjetas
```

### 2.1.2 Tipografía Específica
```dart
// Títulos de productos
static TextStyle productTitle = TextStyle(
  fontFamily: 'Space Grotesk',
  fontSize: 14,
  fontWeight: FontWeight.w500,
  height: 1.3,
);

// Precios
static TextStyle priceNormal = TextStyle(
  fontFamily: 'Space Grotesk',
  fontSize: 16,
  fontWeight: FontWeight.w700,
);

static TextStyle priceOffer = TextStyle(
  fontFamily: 'Space Grotesk',
  fontSize: 16,
  fontWeight: FontWeight.w700,
  color: AppColors.offerPrice,
);

static TextStyle priceStrikethrough = TextStyle(
  fontFamily: 'Space Grotesk',
  fontSize: 14,
  fontWeight: FontWeight.w400,
  decoration: TextDecoration.lineThrough,
  color: AppColors.mutedForeground,
);

// Badges
static TextStyle badgeText = TextStyle(
  fontFamily: 'Space Grotesk',
  fontSize: 12,
  fontWeight: FontWeight.w700,
  letterSpacing: 0.5,
);
```

---

## 2.2 Wireframes de Pantallas

### 2.2.1 ProductsScreen (Listado)

```
┌────────────────────────────────┐
│ ◀  Productos        🔍  🛒(3) │  <- AppBar con búsqueda y carrito
├────────────────────────────────┤
│ [🎛️ Filtros]  24 productos    │  <- Barra de filtros
├────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐     │
│ │  [IMG]   │ │  [IMG]   │     │
│ │  -20%    │ │          │     │  <- Grid 2 columnas móvil
│ ├──────────┤ ├──────────┤     │
│ │Camiseta  │ │Pantalón  │     │
│ │€29.99    │ │€49.99    │     │
│ └──────────┘ └──────────┘     │
│                               │
│ ┌──────────┐ ┌──────────┐     │
│ │  [IMG]   │ │  [IMG]   │     │
│ │⚡ Últimas│ │ AGOTADO  │     │
│ ├──────────┤ ├──────────┤     │
│ │Zapatillas│ │Sudadera  │     │
│ │€89.99    │ │€39.99    │     │
│ └──────────┘ └──────────┘     │
└────────────────────────────────┘
```

### 2.2.2 ProductFiltersSheet (BottomSheet)

```
┌────────────────────────────────┐
│ ─────────  (drag handle)       │
│                                │
│ Filtros                    ✕   │
├────────────────────────────────┤
│                                │
│ Buscar                         │
│ ┌──────────────────────────┐   │
│ │ 🔍 Buscar productos...   │   │
│ └──────────────────────────┘   │
│                                │
│ Categorías                     │
│ ○ Todas                        │
│ ○ Camisetas                    │
│ ● Pantalones                   │  <- Radio buttons
│ ○ Zapatillas                   │
│ ○ Accesorios                   │
│                                │
│ Rango de Precio                │
│ ●────────────────────●         │  <- RangeSlider
│ €0                     €200    │
│                                │
│ 🔥 Solo ofertas        [  ]    │  <- Switch
│                                │
│ Ordenar por                    │
│ ┌──────────────────────────┐   │
│ │ Más recientes         ▼  │   │
│ └──────────────────────────┘   │
│                                │
│ [  Limpiar filtros  ]          │
│ [█████ APLICAR █████]          │
└────────────────────────────────┘
```

### 2.2.3 ProductDetailScreen

```
┌────────────────────────────────┐
│ ◀                    ♥   🛒   │  <- AppBar transparente
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │                            │ │
│ │        [IMAGEN]            │ │  <- PageView con galería
│ │                            │ │
│ │           -25%             │ │  <- Badge descuento
│ │                            │ │
│ └────────────────────────────┘ │
│    ●  ○  ○  ○                  │  <- Indicadores página
│                                │
│ Inicio / Productos / Camisetas │  <- Breadcrumbs
│                                │
│ CAMISETA URBAN STYLE           │  <- Nombre (display font)
│                                │
│ €29.99  €39.99                 │  <- Precio actual + tachado
│                                │
│ Descripción del producto que   │
│ explica características...     │
│                                │
│ Talla              Guía →      │
│ ┌────┬────┬────┬────┬────┐    │
│ │ XS │ S  │ M  │ L  │ XL │    │  <- Selector tallas
│ └────┴────┴────┴────┴────┘    │
│                                │
│ ⚡ 3 unidades disponibles      │  <- Warning stock bajo
│                                │
│ ┌──────────────────────────┐   │
│ │ AÑADIR AL CARRITO €29.99 │   │  <- Botón CTA
│ └──────────────────────────┘   │
└────────────────────────────────┘

// Sticky Bar Móvil (al hacer scroll)
┌────────────────────────────────┐
│ [img] Camiseta...  M  [AÑADIR]│
└────────────────────────────────┘
```

### 2.2.4 SizeGuideModal

```
┌────────────────────────────────┐
│ Guía de Tallas             ✕   │
├────────────────────────────────┤
│                                │
│ Mide tu cuerpo y compara...    │
│                                │
│ ┌──────┬────────┬────────┬───┐ │
│ │Talla │ Pecho  │Cintura │...│ │
│ ├──────┼────────┼────────┼───┤ │
│ │ XS   │ 82-87  │ 66-71  │...│ │
│ │ S    │ 88-93  │ 72-77  │...│ │
│ │ M    │ 94-99  │ 78-83  │...│ │
│ │ L    │100-105 │ 84-89  │...│ │
│ │ XL   │106-111 │ 90-95  │...│ │
│ └──────┴────────┴────────┴───┘ │
│                                │
│ 💡 Si tienes dudas, contacta   │
│    con nosotros...             │
└────────────────────────────────┘
```

---

## 2.3 Especificaciones de Componentes

### 2.3.1 ProductCard

```dart
// Dimensiones
const double cardAspectRatio = 0.75; // altura = width * 1.33
const double imageAspectRatio = 1.0; // cuadrada
const double cardBorderRadius = 8.0;
const double cardPadding = 0.0; // imagen full-bleed

// Estados visuales
- Normal: elevation 0, border subtle
- Hover/Press: elevation 2, scale 1.02
- Disabled (agotado): opacity 0.7, overlay

// Badges posiciones
- Descuento: top-left, padding 8
- Stock bajo: bottom, full-width
- Agotado: center overlay
```

### 2.3.2 SizeSelector

```dart
// Dimensiones de chips
const double chipMinWidth = 48.0;
const double chipHeight = 44.0;
const double chipSpacing = 8.0;
const double chipBorderRadius = 8.0;

// Estados
- Disponible: border-border, bg-card
- Seleccionado: border-primary, bg-primary/10
- Agotado: opacity 0.5, cursor disabled
- Stock bajo: muestra ⚡ inline

// Texto
- Talla: Space Grotesk 14 medium
```

### 2.3.3 AddToCartButton

```dart
// Dimensiones
const double buttonHeight = 56.0;
const double buttonBorderRadius = 0.0; // full-width, bordes rectos

// Estados con colores
- Disabled: bg-muted, text-muted-foreground
- Idle: bg-primary, text-primary-foreground
- Loading: bg-primary + spinner
- Success: bg-emerald-500, checkmark icon
- Error: bg-accent, X icon

// Animaciones
- Transición entre estados: 300ms ease
- Pulse effect on success
```

### 2.3.4 ProductGallery

```dart
// PageView principal
- Aspect ratio: 1:1 (cuadrado)
- BorderRadius: 0 (top full-bleed)
- PageController con viewportFraction: 1.0

// Indicadores (dots)
- Size: 8x8 activo, 6x6 inactivo
- Color: primary activo, muted inactivo
- Spacing: 8px

// Thumbnails (opcional desktop)
- Size: 64x64
- Border: 2px, transparent o primary si activo
- Spacing: 8px
```

---

## 2.4 Animaciones y Transiciones

### 2.4.1 Hero Animation (Grid → Detail)
```dart
// En ProductCard
Hero(
  tag: 'product-image-${product.id}',
  child: CachedNetworkImage(...),
)

// En ProductDetailScreen
Hero(
  tag: 'product-image-${product.id}',
  child: ProductGallery(...),
)
```

### 2.4.2 Add to Cart Animation
```dart
// Secuencia de estados
1. Tap → scale down (0.95) [50ms]
2. Release → scale up (1.0) [100ms]
3. Loading state [300ms mínimo]
4. Success flash + checkmark [200ms]
5. Reset to idle [1500ms delay]

// Haptic feedback
HapticFeedback.mediumImpact(); // Al añadir
```

### 2.4.3 Filter Sheet Animation
```dart
// BottomSheet entrada
showModalBottomSheet(
  isScrollControlled: true,
  backgroundColor: Colors.transparent,
  transitionAnimationController: AnimationController(
    duration: Duration(milliseconds: 300),
    vsync: this,
  ),
  builder: (context) => DraggableScrollableSheet(
    initialChildSize: 0.7,
    maxChildSize: 0.9,
    minChildSize: 0.5,
    ...
  ),
);
```

### 2.4.4 Skeleton Loading
```dart
// Shimmer para ProductCard
Shimmer.fromColors(
  baseColor: AppColors.cardBg,
  highlightColor: AppColors.border,
  child: Column(
    children: [
      AspectRatio(aspectRatio: 1, child: Container(color: Colors.white)),
      SizedBox(height: 8),
      Container(height: 14, width: double.infinity, color: Colors.white),
      SizedBox(height: 4),
      Container(height: 16, width: 80, color: Colors.white),
    ],
  ),
);
```

---

## 2.5 Responsive Breakpoints

### 2.5.1 Grid de Productos
```dart
int getGridColumns(double width) {
  if (width < 400) return 2;      // Móvil pequeño
  if (width < 600) return 2;      // Móvil grande
  if (width < 900) return 3;      // Tablet
  if (width < 1200) return 4;     // Desktop
  return 5;                        // Desktop grande
}

double getGridSpacing(double width) {
  return width < 600 ? 12.0 : 16.0;
}
```

### 2.5.2 Product Detail Layout
```dart
// Mobile (<600): Stack vertical
// Tablet (600-900): 60% imagen, 40% info
// Desktop (>900): 50% imagen, 50% info
```

---

## 2.6 Iconografía

### 2.6.1 Iconos Necesarios
```dart
// AppBar
Icons.arrow_back_ios_new    // Volver
Icons.search                // Buscar
Icons.shopping_bag_outlined // Carrito
Icons.favorite_border       // Favoritos

// Filtros
Icons.tune                  // Botón filtros
Icons.close                 // Cerrar
Icons.check_circle          // Categoría seleccionada

// Producto
Icons.local_fire_department // Ofertas
Icons.bolt                  // Stock bajo (o emoji ⚡)
Icons.straighten            // Guía tallas

// Carrito
Icons.add                   // Incrementar
Icons.remove                // Decrementar
Icons.delete_outline        // Eliminar

// Estados
Icons.check                 // Éxito
Icons.error_outline         // Error
```

---

## 2.7 Accesibilidad

### 2.7.1 Semántica
```dart
// ProductCard
Semantics(
  label: '${product.name}, ${formatPrice(product.displayPrice)}. '
         '${product.hasOffer ? "En oferta, ${product.discountPercent}% de descuento" : ""}'
         '${!product.isAvailable ? "Agotado" : ""}',
  button: true,
  child: ...,
)

// SizeSelector
Semantics(
  label: 'Talla $size, ${variant.isAvailable ? "disponible" : "agotado"}'
         '${variant.isLowStock ? ", pocas unidades" : ""}',
  selected: isSelected,
  button: true,
  child: ...,
)
```

### 2.7.2 Contrast Ratios
- Texto sobre fondo oscuro: mínimo 4.5:1
- Precios y CTAs: mínimo 7:1
- Estados disabled: mínimo 3:1

---

## 2.8 Checklist de Diseño

- [ ] Colores específicos de catálogo definidos
- [ ] Tipografía para precios y badges
- [ ] Wireframes de ProductsScreen
- [ ] Wireframes de ProductDetailScreen
- [ ] Wireframes de FilterSheet
- [ ] Especificaciones de ProductCard
- [ ] Especificaciones de SizeSelector
- [ ] Especificaciones de AddToCartButton
- [ ] Hero animation configurado
- [ ] Shimmer skeletons diseñados
- [ ] Grid responsivo definido
- [ ] Iconos listados
- [ ] Semántica de accesibilidad
