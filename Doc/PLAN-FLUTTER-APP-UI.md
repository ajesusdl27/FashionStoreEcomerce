# 🎨 FashionStore Flutter App - UI/UX Design Document

> **Documento**: Especificación completa de diseño UI/UX para la aplicación móvil  
> **Referencia**: Este documento complementa el [Plan de Desarrollo Flutter](PLAN-FLUTTER-APP.md)  
> **Plataforma**: Android (inicial)  
> **Última actualización**: 27 de enero de 2026

---

## 📋 Índice

1. [Sistema de Diseño](#-sistema-de-diseño)
   - [Paleta de Colores](#paleta-de-colores)
   - [Tipografías](#tipografías)
   - [Espaciado y Grid](#espaciado-y-grid)
   - [Radios y Sombras](#radios-y-sombras)
   - [Tokens de Diseño](#tokens-de-diseño)
2. [Pantallas Públicas](#-pantallas-públicas)
   - [Homepage](#homepage)
   - [Catálogo de Productos](#catálogo-de-productos)
   - [Detalle de Producto](#detalle-de-producto)
   - [Carrito de Compras](#carrito-de-compras)
   - [Proceso de Checkout](#proceso-de-checkout)
3. [Área de Cliente](#-área-de-cliente)
   - [Autenticación](#autenticación)
   - [Dashboard de Cuenta](#dashboard-de-cuenta)
   - [Historial de Pedidos](#historial-de-pedidos)
   - [Detalle de Pedido](#detalle-de-pedido)
   - [Sistema de Devoluciones](#sistema-de-devoluciones)
   - [Gestión de Perfil](#gestión-de-perfil)
4. [Panel de Administración](#-panel-de-administración)
   - [Dashboard Admin](#dashboard-admin)
   - [Gestión de Productos](#gestión-de-productos)
   - [Gestión de Pedidos](#gestión-de-pedidos)
   - [Sistema de Devoluciones Admin](#sistema-de-devoluciones-admin)
   - [Configuración del Sistema](#configuración-del-sistema)
5. [Animaciones y Microinteracciones](#-animaciones-y-microinteracciones)
   - [Transiciones de Página](#transiciones-de-página)
   - [Feedback Táctil](#feedback-táctil)
   - [Estados de Carga](#estados-de-carga)
   - [Accesibilidad de Movimiento](#accesibilidad-de-movimiento)

---

## 🎨 Sistema de Diseño

### Paleta de Colores

#### Colores Primarios
```dart
class AppColors {
  // Primary - Neon Green
  static const primary = Color(0xFFCCFF00);
  static const primaryDark = Color(0xFF99CC00);
  static const primaryLight = Color(0xFFE6FF66);
  
  // Error/Accent - Coral
  static const error = Color(0xFFFF4757);
  static const errorDark = Color(0xFFCC3945);
  static const errorLight = Color(0xFFFF7585);
  
  // Background - Near Black
  static const background = Color(0xFF09090B);
  static const surface = Color(0xFF18181B);
  static const surfaceVariant = Color(0xFF27272A);
  
  // Text
  static const textPrimary = Color(0xFFFAFAFA);
  static const textSecondary = Color(0xFFA1A1AA);
  static const textTertiary = Color(0xFF71717A);
  
  // Status Colors
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);
  
  // Overlays
  static const overlay = Color(0x80000000); // 50% black
  static const shimmer = Color(0x1AFFFFFF); // 10% white
}
```

#### Gradientes
```dart
class AppGradients {
  static const neonGlow = LinearGradient(
    colors: [Color(0xFFCCFF00), Color(0xFF99CC00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const darkFade = LinearGradient(
    colors: [Color(0xFF09090B), Color(0x00000000)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  static const heroOverlay = LinearGradient(
    colors: [Color(0x00000000), Color(0xCC09090B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
```

### Tipografías

#### Familias de Fuentes
```dart
class AppFonts {
  // Títulos grandes - Bebas Neue (all caps)
  static const displayFamily = 'BebasNeue';
  
  // Subtítulos y navegación - Oswald
  static const headingFamily = 'Oswald';
  
  // Cuerpo de texto - Space Grotesk
  static const bodyFamily = 'SpaceGrotesk';
}
```

#### Escalas Tipográficas
```dart
class AppTextStyles {
  // Display - Bebas Neue
  static const displayLarge = TextStyle(
    fontFamily: AppFonts.displayFamily,
    fontSize: 48,
    height: 1.0,
    fontWeight: FontWeight.w700,
    letterSpacing: 2.0,
  );
  
  static const displayMedium = TextStyle(
    fontFamily: AppFonts.displayFamily,
    fontSize: 36,
    height: 1.1,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.5,
  );
  
  static const displaySmall = TextStyle(
    fontFamily: AppFonts.displayFamily,
    fontSize: 28,
    height: 1.2,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.0,
  );
  
  // Headings - Oswald
  static const headlineLarge = TextStyle(
    fontFamily: AppFonts.headingFamily,
    fontSize: 24,
    height: 1.3,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static const headlineMedium = TextStyle(
    fontFamily: AppFonts.headingFamily,
    fontSize: 20,
    height: 1.3,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.25,
  );
  
  static const headlineSmall = TextStyle(
    fontFamily: AppFonts.headingFamily,
    fontSize: 18,
    height: 1.4,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
  );
  
  // Body - Space Grotesk
  static const bodyLarge = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 16,
    height: 1.5,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
  );
  
  static const bodyMedium = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 14,
    height: 1.5,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
  );
  
  static const bodySmall = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 12,
    height: 1.5,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
  );
  
  // Labels
  static const labelLarge = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 14,
    height: 1.4,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static const labelMedium = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 12,
    height: 1.4,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static const labelSmall = TextStyle(
    fontFamily: AppFonts.bodyFamily,
    fontSize: 11,
    height: 1.4,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
  );
}
```

### Espaciado y Grid

#### Tokens de Espaciado (Base 16px = 4 units)
```dart
class AppSpacing {
  static const unit = 4.0;
  
  // Micro spacing
  static const xxs = unit * 1;    // 4px
  static const xs = unit * 2;     // 8px
  static const sm = unit * 3;     // 12px
  static const md = unit * 4;     // 16px (base)
  static const lg = unit * 6;     // 24px
  static const xl = unit * 8;     // 32px
  static const xxl = unit * 12;   // 48px
  static const xxxl = unit * 16;  // 64px
  
  // Layout specific
  static const pageHorizontal = md;  // 16px
  static const pageVertical = lg;    // 24px
  static const sectionGap = xl;      // 32px
  static const componentGap = md;    // 16px
}
```

#### Grid System
```dart
class AppGrid {
  static const columns = 4;  // Mobile grid
  static const gutter = AppSpacing.md;  // 16px
  static const margin = AppSpacing.md;  // 16px
  
  // Breakpoints
  static const mobileMax = 599;
  static const tabletMin = 600;
  static const tabletMax = 1023;
  static const desktopMin = 1024;
}
```

### Radios y Sombras

#### Border Radius
```dart
class AppRadius {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const full = 9999.0;
  
  // Component specific
  static const card = md;           // 12px
  static const button = sm;         // 8px
  static const input = sm;          // 8px
  static const badge = full;        // pill shape
  static const bottomSheet = lg;    // 16px (top corners)
}
```

#### Sombras con Efecto Neon Glow
```dart
class AppShadows {
  // Standard elevation shadows
  static const elevation1 = [
    BoxShadow(
      color: Color(0x0A000000),
      offset: Offset(0, 1),
      blurRadius: 3,
      spreadRadius: 0,
    ),
  ];
  
  static const elevation2 = [
    BoxShadow(
      color: Color(0x14000000),
      offset: Offset(0, 2),
      blurRadius: 6,
      spreadRadius: 0,
    ),
  ];
  
  static const elevation3 = [
    BoxShadow(
      color: Color(0x1F000000),
      offset: Offset(0, 4),
      blurRadius: 12,
      spreadRadius: 0,
    ),
  ];
  
  // Neon glow effects
  static const neonGlowPrimary = [
    BoxShadow(
      color: Color(0x80CCFF00), // Primary with 50% opacity
      offset: Offset(0, 0),
      blurRadius: 20,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x40CCFF00), // Primary with 25% opacity
      offset: Offset(0, 0),
      blurRadius: 40,
      spreadRadius: 0,
    ),
  ];
  
  static const neonGlowError = [
    BoxShadow(
      color: Color(0x80FF4757), // Error with 50% opacity
      offset: Offset(0, 0),
      blurRadius: 16,
      spreadRadius: 0,
    ),
  ];
  
  // Card shadows
  static const cardShadow = [
    BoxShadow(
      color: Color(0x40000000),
      offset: Offset(0, 4),
      blurRadius: 16,
      spreadRadius: -2,
    ),
  ];
}
```

### Tokens de Diseño

#### Iconos
```dart
class AppIcons {
  static const defaultSize = 24.0;
  static const small = 16.0;
  static const medium = 24.0;
  static const large = 32.0;
  static const xlarge = 48.0;
}
```

#### Durations (ver sección de Animaciones para detalles)
```dart
class AppDurations {
  static const fast = Duration(milliseconds: 200);
  static const normal = Duration(milliseconds: 300);
  static const slow = Duration(milliseconds: 400);
  static const verySlow = Duration(milliseconds: 600);
}
```

#### Curves
```dart
class AppCurves {
  static const easeInOut = Curves.easeInOut;
  static const easeOut = Curves.easeOut;
  static const easeIn = Curves.easeIn;
  static const spring = Curves.elasticOut;
}
```

---

## 🏠 Pantallas Públicas

### Homepage

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [≡]  FASHIONSTORE      [🔍] [🛒] │ ← AppBar
├────────────────────────────────────┤
│                                    │
│    ╔══════════════════════════╗   │
│    ║                          ║   │
│    ║  HERO IMAGE              ║   │ ← Hero Section
│    ║  "NEW COLLECTION"        ║   │   (fullscreen)
│    ║  [SHOP NOW] ─────────→   ║   │   (neon button)
│    ╚══════════════════════════╝   │
│                                    │
├────────────────────────────────────┤
│  📂 CATEGORÍAS                     │ ← Section Header
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ 👕     │ │ 👖     │ │ 👗     │ │ ← Category Grid
│  │ Tops   │ │ Bottoms│ │ Dresses│ │   (2 columns)
│  └────────┘ └────────┘ └────────┘ │
│  ┌────────┐ ┌────────┐            │
│  │ 👟     │ │ 👜     │            │
│  │ Shoes  │ │ Bags   │            │
│  └────────┘ └────────┘            │
│                                    │
├────────────────────────────────────┤
│  ⚡ OFERTAS FLASH  [🔴 LIVE]      │ ← Flash Offers
│  ┌──────────────┐ ┌──────────────┐│   (horizontal scroll)
│  │ [!20%]       │ │ [!15%]       ││   (coral badge)
│  │  Image       │ │  Image       ││
│  │ Product 1    │ │ Product 2    ││
│  │ $50  $40     │ │ $30  $25.50  ││
│  └──────────────┘ └──────────────┘│
│                                    │
├────────────────────────────────────┤
│  ⭐ PRODUCTOS DESTACADOS           │ ← Featured Products
│  ┌──────────────┐ ┌──────────────┐│   (2-column grid)
│  │  Image       │ │  Image       ││
│  │ Product 3    │ │ Product 4    ││
│  │ $45.00       │ │ $60.00       ││
│  │ [♡] [🛒]     │ │ [♡] [🛒]     ││
│  └──────────────┘ └──────────────┘│
│  ┌──────────────┐ ┌──────────────┐│
│  │  Image       │ │  Image       ││
│  │ Product 5    │ │ Product 6    ││
│  │ $35.00       │ │ $55.00       ││
│  │ [♡] [🛒]     │ │ [♡] [🛒]     ││
│  └──────────────┘ └──────────────┘│
│         [Ver más...]              │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. HeroSection Widget**
```dart
class HeroSection extends StatelessWidget {
  final String imageUrl;
  final String title;
  final String? subtitle;
  final VoidCallback onShopNow;
  
  // Características:
  // - CachedNetworkImage con AspectRatio 16:9
  // - Gradient overlay (heroOverlay)
  // - Animated title con Bebas Neue
  // - Neon glow button
  // - Parallax effect al scroll
}
```

**2. CategoryCard Widget**
```dart
class CategoryCard extends StatelessWidget {
  final Category category;
  final VoidCallback onTap;
  
  // Características:
  // - Card con border radius 12px
  // - Icon emoji grande (48px)
  // - Nombre en Oswald
  // - Ripple effect + haptic feedback
  // - Elevation 2 en hover
}
```

**3. FlashOfferCard Widget**
```dart
class FlashOfferCard extends StatelessWidget {
  final Product product;
  final double discountPercentage;
  
  // Características:
  // - Width fijo 160px para scroll horizontal
  // - Badge coral con "!20%" en top-right
  // - Original price con strikethrough
  // - Discounted price con primary color
  // - Countdown timer (opcional)
  // - Neon glow sutil en el badge
}
```

**4. ProductCard Widget**
```dart
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final VoidCallback onAddToCart;
  final VoidCallback onToggleFavorite;
  final bool isFavorite;
  
  // Características:
  // - AspectRatio 3:4 para imagen
  // - Favorite icon en top-right (heartbeat animation)
  // - Quick add to cart button en bottom
  // - Stock badge si < 5 unidades
  // - Price con tipografía Space Grotesk bold
}
```

#### Navegación
- **AppBar**: Drawer icon (left), logo (center), search + cart (right)
- **BottomNavigationBar**: 4 tabs (Home, Catálogo, Pedidos, Perfil)
- **Scroll**: SingleChildScrollView con RefreshIndicator

---

### Catálogo de Productos

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  CATÁLOGO         [🔍] [═══]  │ ← AppBar + Filters
├────────────────────────────────────┤
│  📂 Categoría > Tops               │ ← Breadcrumb
│  ┌────────────────────────────────┐│
│  │ [Precio ▼] [Talla ▼] [Color ▼]││ ← Filter Chips
│  └────────────────────────────────┘│
│  [Grid] [List]  │  240 productos   │ ← View Toggle + Count
├────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐│
│  │  Image       │ │  Image       ││ ← Product Grid
│  │ Product A    │ │ Product B    ││   (2 columns)
│  │ $45.00       │ │ $50.00       ││
│  │ [♡] [🛒]     │ │ [♡] [🛒]     ││
│  └──────────────┘ └──────────────┘│
│  ┌──────────────┐ ┌──────────────┐│
│  │  Image       │ │  Image       ││
│  │ Product C    │ │ Product D    ││
│  │ $35.00       │ │ $60.00       ││
│  │ [♡] [🛒]     │ │ [♡] [🛒]     ││
│  └──────────────┘ └──────────────┘│
│          [Loading more...]         │ ← Infinite scroll
└────────────────────────────────────┘
```

#### Componentes Clave

**1. FilterChip Widget**
```dart
class FilterChipGroup extends StatelessWidget {
  final List<FilterOption> options;
  final Function(FilterOption) onSelected;
  
  // Características:
  // - Chips con border primary cuando activo
  // - Background surface cuando inactivo
  // - Scroll horizontal si muchas opciones
  // - Badge con número de filtros activos
}
```

**2. FilterDrawer Widget**
```dart
class FilterDrawer extends StatelessWidget {
  final ProductFilters currentFilters;
  final Function(ProductFilters) onApply;
  
  // Características:
  // - Drawer desde la derecha
  // - Secciones: Precio (RangeSlider), Tallas (CheckboxList), Colores (ColorGrid)
  // - Botones: "Limpiar" + "Aplicar" (neon button)
  // - Contador de productos que cumplen filtros
}
```

**3. ViewToggle Widget**
```dart
class ViewToggle extends StatelessWidget {
  final ViewMode currentMode; // grid | list
  final Function(ViewMode) onToggle;
  
  // Características:
  // - Toggle buttons con iconos
  // - Active state con background primary
  // - Smooth transition entre vistas
}
```

**4. ProductListTile Widget (vista lista)**
```dart
class ProductListTile extends StatelessWidget {
  final Product product;
  
  // Características:
  // - Leading: imagen cuadrada 80x80px
  // - Title: nombre del producto
  // - Subtitle: categoría + tallas disponibles
  // - Trailing: precio + add to cart icon
  // - Divider entre items
}
```

#### Comportamiento
- **Infinite Scroll**: Lazy loading con pagination (20 productos por página)
- **Pull to Refresh**: RefreshIndicator para recargar catálogo
- **Search**: Barra de búsqueda con debounce (500ms)
- **Sorting**: Dropdown con opciones (Relevancia, Precio ↑, Precio ↓, Nuevo, Popular)

---

### Detalle de Producto

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  PRODUCTO           [♡] [🛒] │ ← AppBar
├────────────────────────────────────┤
│  ╔════════════════════════════════╗│
│  ║                                ║│ ← Image Gallery
│  ║     MAIN IMAGE                 ║│   (swipeable)
│  ║                                ║│   (zoom on tap)
│  ╚════════════════════════════════╝│
│  [● ○ ○ ○]  ←─────────────────────┤ PageIndicator
│                                    │
│  PRODUCT NAME IN BEBAS NEUE        │ ← Title
│  ⭐⭐⭐⭐☆ 4.5 (120 reviews)        │ ← Rating
│                                    │
│  $45.00                            │ ← Price
│  ───────────────────────────────── │
│  📏 TALLA                          │ ← Size Selector
│  [S] [M] [L] [XL]                  │   (chips)
│  ⚠️ Solo 3 unidades disponibles    │ ← Stock Badge (si <5)
│  ───────────────────────────────── │
│  🎨 COLOR                          │ ← Color Selector
│  [⚫] [⚪] [🔴]                     │   (color circles)
│  ───────────────────────────────── │
│  📝 DESCRIPCIÓN                    │ ← Description
│  This is a high-quality product    │   (expandable)
│  made with premium materials...    │
│  [Ver más ▼]                       │
│  ───────────────────────────────── │
│  💳 CUPÓN                          │ ← Coupon Input
│  [Ingresa código] [Aplicar]        │   (opcional)
│  ───────────────────────────────── │
│  🚚 Envío gratis en pedidos >$100  │ ← Shipping Info
│  📦 Entrega en 3-5 días hábiles    │
│                                    │
└────────────────────────────────────┘
│  [   AGREGAR AL CARRITO   ] ──→   │ ← Sticky Button
└────────────────────────────────────┘
```

#### Componentes Clave

**1. ImageGallery Widget**
```dart
class ImageGallery extends StatefulWidget {
  final List<String> imageUrls;
  
  // Características:
  // - PageView.builder con AspectRatio 1:1
  // - Smooth page indicators (dots)
  // - Zoom on double tap (InteractiveViewer)
  // - Swipe con physics personalizado
  // - Loading skeleton mientras carga
}
```

**2. SizeSelector Widget**
```dart
class SizeSelector extends StatelessWidget {
  final List<Size> availableSizes;
  final Size? selectedSize;
  final Function(Size) onSelect;
  
  // Características:
  // - Chips con border cuando seleccionado
  // - Disabled style si no hay stock
  // - Tooltip con medidas al long press
  // - Haptic feedback en selección
}
```

**3. ColorSelector Widget**
```dart
class ColorSelector extends StatelessWidget {
  final List<ProductColor> colors;
  final ProductColor? selectedColor;
  final Function(ProductColor) onSelect;
  
  // Características:
  // - Círculos de color con border primary si seleccionado
  // - Check icon blanco en círculo seleccionado
  // - Name del color en label pequeño
  // - Disabled si no hay stock
}
```

**4. StockBadge Widget**
```dart
class StockBadge extends StatelessWidget {
  final int stockCount;
  
  // Características:
  // - Badge coral con texto "Solo X unidades"
  // - Pulsating animation si stock < 3
  // - Warning icon
  // - Display solo si stock < 5
}
```

**5. AddToCartButton Widget (Sticky Bottom)**
```dart
class AddToCartButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isEnabled;
  
  // Características:
  // - Sticky al final con SafeArea
  // - Background primary con neon glow
  // - Loading spinner cuando isLoading
  // - Disabled style si falta talla/color
  // - Scale animation en tap
  // - Haptic feedback
}
```

#### Comportamiento
- **Validación**: No permitir agregar al carrito sin seleccionar talla/color
- **Stock Reservation**: Al agregar al carrito, llamar RPC `reserve_stock`
- **Toast Feedback**: "Producto agregado al carrito" con undo action
- **Scroll**: SingleChildScrollView con sticky button al final

---

### Carrito de Compras

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  CARRITO                [🗑️]  │ ← AppBar
├────────────────────────────────────┤
│  ┌────────────────────────────────┐│
│  │ [Img] Product Name      $45.00 ││ ← CartItem
│  │       Size: M | Color: Black   ││
│  │       [−] 1 [+]        ───────→││   (qty selector)
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product Name      $30.00 ││
│  │       Size: L | Color: White   ││
│  │       [−] 2 [+]        ───────→││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product Name      $50.00 ││
│  │       Size: S | Color: Red     ││
│  │       [−] 1 [+]        ───────→││
│  └────────────────────────────────┘│
│                                    │
├────────────────────────────────────┤
│  💳 CUPÓN                          │ ← Coupon Section
│  ┌────────────────────────────────┐│
│  │ [SUMMER20]            [✓ −20%] ││   (applied)
│  └────────────────────────────────┘│
│  [+ Agregar cupón]                 │
│                                    │
├────────────────────────────────────┤
│  RESUMEN                           │ ← Order Summary
│  Subtotal:              $125.00    │
│  Descuento (SUMMER20):  −$25.00    │   (green)
│  Envío:                 Gratis     │   (green)
│  ─────────────────────────────────││
│  TOTAL:                 $100.00    │   (large, bold)
│                                    │
└────────────────────────────────────┘
│  [   PROCEDER AL CHECKOUT   ] ──→ │ ← Sticky Button
└────────────────────────────────────┘
```

#### Componentes Clave

**1. CartItem Widget**
```dart
class CartItem extends StatelessWidget {
  final CartItemModel item;
  final Function(int) onQuantityChange;
  final VoidCallback onRemove;
  
  // Características:
  // - Dismissible para eliminar (swipe left)
  // - Leading: imagen 80x80px
  // - Title: nombre del producto
  // - Subtitle: talla, color, precio unitario
  // - Trailing: qty selector + precio total
  // - Stock warning si qty > stock disponible
}
```

**2. QuantitySelector Widget**
```dart
class QuantitySelector extends StatelessWidget {
  final int quantity;
  final int maxQuantity;
  final Function(int) onChange;
  
  // Características:
  // - Botones [−] y [+] con border
  // - Display quantity en el centro
  // - Disable [+] si quantity == maxQuantity
  // - Disable [−] si quantity == 1
  // - Haptic feedback
}
```

**3. CouponInput Widget**
```dart
class CouponInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onApply;
  final bool isLoading;
  
  // Características:
  // - TextField con hint "Código de cupón"
  // - Botón "Aplicar" inline
  // - Loading spinner mientras valida
  // - Success checkmark si válido
  // - Error message si inválido
}
```

**4. AppliedCoupon Widget**
```dart
class AppliedCoupon extends StatelessWidget {
  final Coupon coupon;
  final double discountAmount;
  final VoidCallback onRemove;
  
  // Características:
  // - Card con background surfaceVariant
  // - Code en bold + percentage/fixed discount
  // - Discount amount en success color
  // - Remove icon button
  // - Checkmark icon
}
```

**5. OrderSummary Widget**
```dart
class OrderSummary extends StatelessWidget {
  final double subtotal;
  final double discount;
  final double shipping;
  final double total;
  
  // Características:
  // - Card con elevation
  // - Rows con label + valor
  // - Divider antes del total
  // - Total con fontSize grande
  // - Success color para descuentos/envío gratis
}
```

#### Comportamiento
- **Empty State**: Ilustración + mensaje "Tu carrito está vacío" + botón "Ir a catálogo"
- **Swipe to Delete**: Dismissible con confirmación
- **Real-time Stock**: Validar stock antes de checkout
- **Coupon Validation**: Llamar RPC `validate_coupon` al aplicar
- **Stock Warning**: Badge coral si qty > stock disponible

---

### Proceso de Checkout

#### Wireframe ASCII (3 Pasos)

**PASO 1: Dirección de Envío**
```
┌────────────────────────────────────┐
│  [←]  CHECKOUT           [1] 2  3  │ ← Progress Indicator
├────────────────────────────────────┤
│  📍 DIRECCIÓN DE ENVÍO             │
│  ┌────────────────────────────────┐│
│  │ Nombre completo                ││ ← Form Fields
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Email                          ││
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Teléfono                       ││
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Dirección                      ││
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────┐ ┌────────┐ ┌─────────┐│
│  │ Ciudad │ │ Estado │ │ CP      ││
│  │ [____] │ │ [____] │ │ [_____] ││
│  └────────┘ └────────┘ └─────────┘│
│                                    │
│  [☐] Guardar como dirección        │
│      predeterminada                │
│                                    │
└────────────────────────────────────┘
│  [   CONTINUAR   ] ───────────────→│ ← Next Button
└────────────────────────────────────┘
```

**PASO 2: Método de Pago**
```
┌────────────────────────────────────┐
│  [←]  CHECKOUT            1 [2] 3  │
├────────────────────────────────────┤
│  💳 MÉTODO DE PAGO                 │
│  ┌────────────────────────────────┐│
│  │ ● Tarjeta de crédito/débito    ││ ← Radio Options
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │   [STRIPE ELEMENTS]            ││ ← Stripe Card Input
│  │   Card number                  ││   (WebView o native)
│  │   [________________]           ││
│  │   MM/YY    CVC                 ││
│  │   [____]   [___]               ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ ○ PayPal                       ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ ○ Google Pay                   ││
│  └────────────────────────────────┘│
│                                    │
│  [☐] Guardar método de pago        │
│                                    │
└────────────────────────────────────┘
│  [   CONTINUAR   ] ───────────────→│
└────────────────────────────────────┘
```

**PASO 3: Confirmación**
```
┌────────────────────────────────────┐
│  [←]  CHECKOUT            1  2 [3] │
├────────────────────────────────────┤
│  ✅ REVISAR PEDIDO                 │
│  ───────────────────────────────── │
│  📍 ENVÍO A:                       │ ← Address Summary
│  John Doe                          │
│  123 Main St, Apt 4B               │
│  New York, NY 10001                │
│  [Editar]                          │
│  ───────────────────────────────── │
│  💳 PAGO CON:                      │ ← Payment Summary
│  •••• •••• •••• 4242               │
│  [Editar]                          │
│  ───────────────────────────────── │
│  🛒 PRODUCTOS (3)                  │ ← Cart Summary
│  Product A (M, Black) x1    $45.00 │
│  Product B (L, White) x2    $60.00 │
│  Product C (S, Red) x1      $50.00 │
│  ───────────────────────────────── │
│  RESUMEN                           │
│  Subtotal:              $155.00    │
│  Descuento:             −$25.00    │
│  Envío:                 Gratis     │
│  ─────────────────────────────────││
│  TOTAL:                 $130.00    │
│                                    │
└────────────────────────────────────┘
│  [   CONFIRMAR PEDIDO   ] ──────→ │ ← Submit Button
└────────────────────────────────────┘
```

#### Componentes Clave

**1. CheckoutStepper Widget**
```dart
class CheckoutStepper extends StatelessWidget {
  final int currentStep; // 1, 2, 3
  final List<String> stepLabels;
  
  // Características:
  // - Progress indicator con 3 pasos
  // - Active step con primary color
  // - Completed steps con checkmark
  // - Inactive steps con grey
  // - Labels opcionales debajo
}
```

**2. ShippingForm Widget**
```dart
class ShippingForm extends StatefulWidget {
  final ShippingAddress? initialAddress;
  final Function(ShippingAddress) onSubmit;
  
  // Características:
  // - Form con GlobalKey
  // - TextFields con validators
  // - Autocomplete para ciudad/estado (opcional)
  // - Checkbox para guardar dirección
  // - Loading state en botón
}
```

**3. PaymentMethodSelector Widget**
```dart
class PaymentMethodSelector extends StatelessWidget {
  final PaymentMethod selectedMethod;
  final Function(PaymentMethod) onSelect;
  
  // Características:
  // - Radio list tiles
  // - Icons para cada método
  // - Expandable card para stripe elements
  // - Saved cards list (si aplica)
  // - "Añadir nueva tarjeta" option
}
```

**4. StripeCardInput Widget**
```dart
class StripeCardInput extends StatefulWidget {
  final Function(PaymentMethodData) onComplete;
  
  // Características:
  // - Integración con flutter_stripe
  // - CardField widget nativo
  // - Validation en tiempo real
  // - Error messages debajo del campo
  // - Iconos de marcas de tarjetas
}
```

**5. OrderReview Widget**
```dart
class OrderReview extends StatelessWidget {
  final ShippingAddress address;
  final PaymentMethod paymentMethod;
  final List<CartItem> items;
  final OrderSummaryData summary;
  
  // Características:
  // - Resumen de dirección con botón editar
  // - Resumen de pago con botón editar
  // - Lista de productos colapsable
  // - Order summary expandido
  // - Terms & conditions checkbox
}
```

#### Comportamiento
- **Validación por Paso**: No permitir avanzar sin completar el paso actual
- **Navegación**: Botones "Atrás" y "Continuar" para navegar entre pasos
- **Loading States**: Loading spinner en botones de acción
- **Error Handling**: Toast messages para errores de pago
- **Success**: Navegar a OrderConfirmation screen tras pago exitoso

---

## 👤 Área de Cliente

### Autenticación

#### Wireframe ASCII (Login)
```
┌────────────────────────────────────┐
│  [←]  INICIAR SESIÓN               │
├────────────────────────────────────┤
│                                    │
│    ╔════════════════╗              │
│    ║  [LOGO]        ║              │ ← Logo
│    ╚════════════════╝              │
│                                    │
│    BIENVENIDO                      │ ← Bebas Neue
│    A FASHIONSTORE                  │
│                                    │
│  ┌────────────────────────────────┐│
│  │ Email                          ││ ← Form Fields
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Contraseña                     ││
│  │ [________________] [👁️]        ││
│  └────────────────────────────────┘│
│  [¿Olvidaste tu contraseña?]       │ ← Link
│                                    │
│  [   INICIAR SESIÓN   ] ─────────→│ ← Primary Button
│                                    │
│  ─────── o continúa con ──────────│ ← Divider
│                                    │
│  [G] Google  [F] Facebook          │ ← Social Login
│                                    │
│  ¿No tienes cuenta? [Regístrate]   │ ← Link to Register
└────────────────────────────────────┘
```

#### Wireframe ASCII (Registro)
```
┌────────────────────────────────────┐
│  [←]  CREAR CUENTA                 │
├────────────────────────────────────┤
│                                    │
│    ÚNETE A                         │
│    FASHIONSTORE                    │
│                                    │
│  ┌────────────────────────────────┐│
│  │ Nombre completo                ││
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Email                          ││
│  │ [________________]             ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Contraseña                     ││
│  │ [________________] [👁️]        ││
│  └────────────────────────────────┘│
│  Password strength: [▓▓▓▓░░░░]     │ ← Strength Indicator
│  ┌────────────────────────────────┐│
│  │ Confirmar contraseña           ││
│  │ [________________] [👁️]        ││
│  └────────────────────────────────┘│
│                                    │
│  [☐] Acepto los términos y         │ ← Checkbox
│      condiciones                   │
│  [☐] Deseo recibir promociones     │
│                                    │
│  [   CREAR CUENTA   ] ────────────→│
│                                    │
│  ¿Ya tienes cuenta? [Inicia sesión]│
└────────────────────────────────────┘
```

#### Componentes Clave

**1. AuthForm Widget**
```dart
class AuthForm extends StatefulWidget {
  final AuthMode mode; // login | register
  final Function(AuthCredentials) onSubmit;
  
  // Características:
  // - Form con validators
  // - Password visibility toggle
  // - Password strength indicator (register)
  // - Terms checkbox (register)
  // - Loading state
  // - Error messages inline
}
```

**2. PasswordStrengthIndicator Widget**
```dart
class PasswordStrengthIndicator extends StatelessWidget {
  final String password;
  
  // Características:
  // - Progress bar con colores (rojo, amarillo, verde)
  // - Label: "Débil", "Media", "Fuerte"
  // - Validación: longitud, mayúsculas, números, símbolos
}
```

**3. SocialLoginButtons Widget**
```dart
class SocialLoginButtons extends StatelessWidget {
  final Function(SocialProvider) onLogin;
  
  // Características:
  // - Botones para Google, Facebook
  // - Icons con colores de marca
  // - Loading state individual por botón
  // - Error handling
}
```

---

### Dashboard de Cuenta

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [≡]  MI CUENTA            [⚙️]    │
├────────────────────────────────────┤
│  ┌────────────────────────────────┐│
│  │  [👤]  John Doe                ││ ← User Header
│  │  john.doe@email.com            ││
│  │  Miembro desde 2024            ││
│  └────────────────────────────────┘│
│                                    │
│  ┌──────────┐ ┌──────────┐        │ ← Quick Stats
│  │ 🛒 12    │ │ 💰 $540  │        │
│  │ Pedidos  │ │ Gastado  │        │
│  └──────────┘ └──────────┘        │
│                                    │
├────────────────────────────────────┤
│  📦 MIS PEDIDOS               [>]  │ ← Menu Items
├────────────────────────────────────┤
│  ↩️ DEVOLUCIONES              [>]  │
├────────────────────────────────────┤
│  ♡ FAVORITOS                  [>]  │
├────────────────────────────────────┤
│  📍 DIRECCIONES               [>]  │
├────────────────────────────────────┤
│  💳 MÉTODOS DE PAGO           [>]  │
├────────────────────────────────────┤
│  👤 DATOS PERSONALES          [>]  │
├────────────────────────────────────┤
│  🔔 NOTIFICACIONES            [>]  │
├────────────────────────────────────┤
│  🚪 CERRAR SESIÓN                  │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. UserHeader Widget**
```dart
class UserHeader extends StatelessWidget {
  final User user;
  final VoidCallback onEditProfile;
  
  // Características:
  // - Avatar (imagen o iniciales)
  // - Nombre en Oswald
  // - Email en texto secundario
  // - Fecha de registro
  // - Edit icon button
}
```

**2. QuickStatsCard Widget**
```dart
class QuickStatsCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  
  // Características:
  // - Card compacto
  // - Icon grande con primary color
  // - Value en bold (displayMedium)
  // - Label en texto secundario
}
```

**3. AccountMenuItem Widget**
```dart
class AccountMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final Widget? trailing;
  
  // Características:
  // - ListTile con leading icon
  // - Title en Oswald
  // - Optional subtitle
  // - Trailing chevron o custom widget
  // - Divider entre items
  // - Ripple effect
}
```

---

### Historial de Pedidos

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  MIS PEDIDOS          [🔍]    │
├────────────────────────────────────┤
│  [Todos] [Pendientes] [Enviados]   │ ← Tabs
│  [Entregados] [Cancelados]         │
│                                    │
│  ┌────────────────────────────────┐│
│  │ Pedido #10001        🟢 Enviado││ ← OrderCard
│  │ 15 Ene 2026 • 3 productos      ││
│  │                                ││
│  │ [Img] Product A x1             ││
│  │ [Img] Product B x2             ││
│  │                                ││
│  │ Total: $130.00                 ││
│  │                                ││
│  │ [Ver detalles] [Rastrear envío]││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Pedido #10000      🟡 Pendiente││
│  │ 10 Ene 2026 • 1 producto       ││
│  │                                ││
│  │ [Img] Product C x1             ││
│  │                                ││
│  │ Total: $50.00                  ││
│  │                                ││
│  │ [Ver detalles]                 ││
│  └────────────────────────────────┘│
│                                    │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. OrderTabs Widget**
```dart
class OrderTabs extends StatelessWidget {
  final OrderStatus? selectedStatus;
  final Function(OrderStatus?) onSelect;
  
  // Características:
  // - Horizontal scroll tabs
  // - Badge con contador por tab
  // - Active tab con border bottom primary
  // - "Todos" muestra todos los estados
}
```

**2. OrderCard Widget**
```dart
class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onViewDetails;
  final VoidCallback? onTrackShipment;
  
  // Características:
  // - Card con elevation 2
  // - Header: número de pedido + status badge
  // - Fecha y cantidad de productos
  // - Preview de productos (max 3 imágenes)
  // - Total en bold
  // - Action buttons según estado
}
```

**3. StatusBadge Widget**
```dart
class StatusBadge extends StatelessWidget {
  final OrderStatus status;
  
  // Características:
  // - Badge con color según estado:
  //   • Pendiente: warning (amarillo)
  //   • Procesando: info (azul)
  //   • Enviado: success (verde)
  //   • Entregado: success (verde)
  //   • Cancelado: error (coral)
  // - Icon según estado
  // - Text en labelSmall
}
```

---

### Detalle de Pedido

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  PEDIDO #10001                │
├────────────────────────────────────┤
│  🟢 ENVIADO                        │ ← Status Badge
│  15 Ene 2026, 10:30 AM             │
│                                    │
│  ┌────────────────────────────────┐│
│  │ SEGUIMIENTO                    ││ ← OrderTimeline
│  │                                ││
│  │ ✅ Pedido realizado            ││
│  │    15 Ene, 10:30 AM            ││
│  │    │                           ││
│  │ ✅ Pago confirmado             ││
│  │    15 Ene, 10:32 AM            ││
│  │    │                           ││
│  │ ✅ En preparación              ││
│  │    15 Ene, 11:00 AM            ││
│  │    │                           ││
│  │ ● Enviado                      ││ ← Current
│  │    16 Ene, 9:15 AM             ││
│  │    Tracking: 1Z999AA10123456   ││
│  │    │                           ││
│  │ ○ En tránsito                 ││ ← Pending
│  │    Estimado: 18 Ene            ││
│  │    │                           ││
│  │ ○ Entregado                    ││
│  │    Estimado: 20 Ene            ││
│  └────────────────────────────────┘│
│                                    │
│  📦 PRODUCTOS (3)                  │ ← Products Section
│  ┌────────────────────────────────┐│
│  │ [Img] Product Name      $45.00 ││
│  │       Size: M | Color: Black   ││
│  │       Qty: 1                   ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product Name      $60.00 ││
│  │       Size: L | Color: White   ││
│  │       Qty: 2                   ││
│  └────────────────────────────────┘│
│                                    │
│  📍 DIRECCIÓN DE ENVÍO             │ ← Shipping Address
│  John Doe                          │
│  123 Main St, Apt 4B               │
│  New York, NY 10001                │
│  +1 234 567 8900                   │
│                                    │
│  💳 MÉTODO DE PAGO                 │ ← Payment Method
│  •••• •••• •••• 4242               │
│  Visa                              │
│                                    │
│  📝 RESUMEN                        │ ← Summary
│  Subtotal:              $155.00    │
│  Descuento:             −$25.00    │
│  Envío:                 Gratis     │
│  ─────────────────────────────────││
│  TOTAL:                 $130.00    │
│                                    │
│  [Rastrear envío]  [Solicitar      │ ← Actions
│                     devolución]    │
│  [Solicitar factura]               │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. OrderTimeline Widget**
```dart
class OrderTimeline extends StatelessWidget {
  final Order order;
  final List<OrderEvent> events;
  
  // Características:
  // - Timeline vertical con dots y líneas
  // - Completed steps con checkmark (success color)
  // - Current step con pulsating dot (primary color)
  // - Pending steps con hollow dot (grey)
  // - Timestamp para cada evento
  // - Tracking number si disponible
}
```

**2. OrderProductItem Widget**
```dart
class OrderProductItem extends StatelessWidget {
  final OrderItem item;
  final VoidCallback? onTap;
  
  // Características:
  // - Leading image 60x60px
  // - Title: nombre del producto
  // - Subtitle: talla, color, cantidad
  // - Trailing: precio
  // - Non-dismissible (read-only)
}
```

**3. TrackShipmentButton Widget**
```dart
class TrackShipmentButton extends StatelessWidget {
  final String trackingNumber;
  final String carrier;
  final VoidCallback onTrack;
  
  // Características:
  // - Outline button con icon
  // - Abre modal con tracking details
  // - Link externo a carrier website
  // - Copy tracking number al clipboard
}
```

---

### Sistema de Devoluciones

#### Wireframe ASCII (Solicitar Devolución)
```
┌────────────────────────────────────┐
│  [←]  SOLICITAR DEVOLUCIÓN         │
├────────────────────────────────────┤
│  Pedido #10001                     │
│                                    │
│  📦 SELECCIONA PRODUCTOS           │ ← Product Selection
│  ┌────────────────────────────────┐│
│  │ [✓] Product A           $45.00 ││ ← Checkbox
│  │     [−] 1 [+]                  ││   + Qty Selector
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [✓] Product B           $30.00 ││
│  │     [−] 1 [+]                  ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [☐] Product C           $50.00 ││
│  │     [−] 0 [+]                  ││
│  └────────────────────────────────┘│
│                                    │
│  ❓ MOTIVO DE DEVOLUCIÓN           │ ← Reason Selection
│  ┌────────────────────────────────┐│
│  │ ● Talla incorrecta             ││ ← Radio Options
│  │ ○ Producto defectuoso          ││
│  │ ○ No cumple expectativas       ││
│  │ ○ Llegó tarde                  ││
│  │ ○ Otro                         ││
│  └────────────────────────────────┘│
│                                    │
│  💬 COMENTARIOS ADICIONALES        │ ← Comments
│  ┌────────────────────────────────┐│
│  │ (Opcional)                     ││
│  │ [                            ] ││
│  │ [                            ] ││
│  └────────────────────────────────┘│
│                                    │
│  📸 FOTOS (Opcional)               │ ← Photo Upload
│  [+ Agregar fotos]                 │
│  [Img1] [Img2] [Img3]              │
│                                    │
│  💰 REEMBOLSO ESTIMADO             │ ← Refund Estimate
│  Productos devueltos:    $75.00    │
│  Descuento proporcional: −$12.50   │
│  Comisión devolución:    −$5.00    │
│  ─────────────────────────────────││
│  TOTAL A REEMBOLSAR:     $57.50    │
│                                    │
│  [   ENVIAR SOLICITUD   ] ───────→│
└────────────────────────────────────┘
```

#### Wireframe ASCII (Seguimiento de Devolución)
```
┌────────────────────────────────────┐
│  [←]  DEVOLUCIÓN #R10001           │
├────────────────────────────────────┤
│  🟡 EN INSPECCIÓN                  │ ← Status Badge
│  18 Ene 2026                       │
│                                    │
│  ┌────────────────────────────────┐│
│  │ SEGUIMIENTO                    ││ ← ReturnTimeline
│  │                                ││
│  │ ✅ Solicitud creada            ││
│  │    15 Ene, 2:30 PM             ││
│  │    │                           ││
│  │ ✅ Solicitud aprobada          ││
│  │    16 Ene, 9:00 AM             ││
│  │    │                           ││
│  │ ✅ Etiqueta de envío generada  ││
│  │    16 Ene, 9:05 AM             ││
│  │    [Descargar PDF]             ││
│  │    │                           ││
│  │ ✅ Producto enviado            ││
│  │    17 Ene, 11:00 AM            ││
│  │    │                           ││
│  │ ✅ Producto recibido           ││
│  │    18 Ene, 3:15 PM             ││
│  │    │                           ││
│  │ ● En inspección                ││ ← Current
│  │    En progreso...              ││
│  │    │                           ││
│  │ ○ Inspección completada        ││ ← Pending
│  │    Pendiente                   ││
│  │    │                           ││
│  │ ○ Reembolso procesado          ││
│  │    Pendiente                   ││
│  └────────────────────────────────┘│
│                                    │
│  📦 PRODUCTOS (2)                  │
│  [Img] Product A x1        $45.00  │
│  [Img] Product B x1        $30.00  │
│                                    │
│  ❓ MOTIVO                         │
│  Talla incorrecta                  │
│                                    │
│  💬 COMENTARIOS                    │
│  Los productos eran muy grandes... │
│                                    │
│  💰 REEMBOLSO ESTIMADO: $57.50     │
│                                    │
│  [Descargar etiqueta] [Cancelar    │
│                        devolución] │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. ReturnableProductItem Widget**
```dart
class ReturnableProductItem extends StatelessWidget {
  final OrderItem item;
  final bool isSelected;
  final int returnQuantity;
  final Function(bool) onToggle;
  final Function(int) onQuantityChange;
  
  // Características:
  // - Checkbox para selección
  // - Product info (imagen, nombre, precio)
  // - Quantity selector (max = ordered quantity)
  // - Disabled si no es retornable (>30 días)
}
```

**2. ReturnReasonSelector Widget**
```dart
class ReturnReasonSelector extends StatelessWidget {
  final ReturnReason? selectedReason;
  final Function(ReturnReason) onSelect;
  
  // Características:
  // - Radio options con motivos predefinidos
  // - TextField adicional si selecciona "Otro"
  // - Icons descriptivos para cada motivo
}
```

**3. PhotoUploader Widget**
```dart
class PhotoUploader extends StatefulWidget {
  final List<File> photos;
  final Function(List<File>) onPhotosChanged;
  final int maxPhotos; // default 5
  
  // Características:
  // - Grid de thumbnails
  // - "+" button para agregar
  // - Image picker (cámara o galería)
  // - Remove button en cada foto
  // - Preview en tap
  // - Compresión de imágenes
}
```

**4. ReturnTimeline Widget**
```dart
class ReturnTimeline extends StatelessWidget {
  final Return returnData;
  final List<ReturnEvent> events;
  
  // Características:
  // - Similar a OrderTimeline
  // - Estados específicos de devolución
  // - Link a etiqueta de envío si disponible
  // - Inspection notes si aplica
}
```

**5. RefundEstimate Widget**
```dart
class RefundEstimate extends StatelessWidget {
  final double productsTotal;
  final double discountAdjustment;
  final double returnFee;
  final double estimatedRefund;
  
  // Características:
  // - Card con breakdown de reembolso
  // - Success color para total
  // - Warning si hay comisión
  // - Info tooltip para explicar cálculo
}
```

---

### Gestión de Perfil

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  PERFIL                 [💾] │ ← Save Button
├────────────────────────────────────┤
│           [👤]                     │ ← Avatar
│      [Cambiar foto]                │
│                                    │
│  📝 INFORMACIÓN PERSONAL           │
│  ┌────────────────────────────────┐│
│  │ Nombre completo                ││
│  │ [John Doe___________]          ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Email                          ││
│  │ [john.doe@email.com] [✓]       ││ ← Verified
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Teléfono                       ││
│  │ [+1 234 567 8900___]           ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Fecha de nacimiento            ││
│  │ [01/01/1990_____] [📅]         ││
│  └────────────────────────────────┘│
│                                    │
│  🔒 SEGURIDAD                      │
│  [Cambiar contraseña]         [>]  │
│  [Autenticación de dos factores] > │
│                                    │
│  🔔 PREFERENCIAS                   │
│  [☑] Notificaciones push           │
│  [☑] Emails promocionales          │
│  [☐] SMS marketing                 │
│                                    │
│  ⚠️ ZONA DE PELIGRO                │
│  [Eliminar mi cuenta]              │
│                                    │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. ProfileForm Widget**
```dart
class ProfileForm extends StatefulWidget {
  final User user;
  final Function(UserUpdateData) onSave;
  
  // Características:
  // - Form con validators
  // - Avatar picker (cámara/galería)
  // - Email con verified badge
  // - Date picker para fecha de nacimiento
  // - Phone input con formato
  // - Auto-save o save button
}
```

**2. AvatarPicker Widget**
```dart
class AvatarPicker extends StatelessWidget {
  final String? currentAvatarUrl;
  final Function(File) onPickImage;
  
  // Características:
  // - Círculo con imagen actual o iniciales
  // - "Cambiar foto" button
  // - Image picker (cámara/galería)
  // - Crop tool
  // - Loading state durante upload
}
```

**3. SecuritySection Widget**
```dart
class SecuritySection extends StatelessWidget {
  final VoidCallback onChangePassword;
  final VoidCallback onManage2FA;
  
  // Características:
  // - List tiles con navegación
  // - Status indicators (activo/inactivo)
  // - Icons de seguridad
}
```

**4. PreferencesSection Widget**
```dart
class PreferencesSection extends StatelessWidget {
  final UserPreferences preferences;
  final Function(UserPreferences) onChange;
  
  // Características:
  // - Switch tiles para cada preferencia
  // - Descriptions bajo cada opción
  // - Real-time updates
  // - GDPR compliance info
}
```

---

## 🔧 Panel de Administración

### Dashboard Admin

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [≡]  ADMIN PANEL          [🔔] [👤]│
├────────────────────────────────────┤
│  📊 RESUMEN GENERAL                │
│  ┌──────────┐ ┌──────────┐        │ ← KPI Cards
│  │ 💰       │ │ 📦       │        │   (2 columns)
│  │ $12,450  │ │ 58       │        │
│  │ Ventas   │ │ Pedidos  │        │
│  │ Hoy      │ │ Hoy      │        │
│  │ +15% ↑   │ │ +8% ↑    │        │
│  └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐        │
│  │ 👥       │ │ ⚠️       │        │
│  │ 234      │ │ 12       │        │
│  │ Clientes │ │ Stock    │        │
│  │ Activos  │ │ Bajo     │        │
│  │ +5% ↑    │ │ ─        │        │
│  └──────────┘ └──────────┘        │
│                                    │
│  📈 VENTAS ÚLTIMOS 7 DÍAS          │
│  ┌────────────────────────────────┐│
│  │      ╭─╮                       ││ ← Simple Chart
│  │    ╭─╯ ╰╮  ╭╮                 ││   (Line/Bar)
│  │  ╭─╯    ╰──╯╰──╮              ││
│  │ ╭╯              ╰─             ││
│  │ L M M J V S D                  ││
│  └────────────────────────────────┘│
│                                    │
│  🔥 PRODUCTOS TOP                  │
│  1. Product A        45 vendidos   │
│  2. Product B        38 vendidos   │
│  3. Product C        32 vendidos   │
│                                    │
│  ⚡ OFERTAS FLASH         [🟢 ON]  │ ← Real-time Toggle
│  [────●────────]  Activas          │
│                                    │
│  📋 ACCIONES RÁPIDAS               │
│  [Nuevo producto] [Ver pedidos]    │
│  [Gestionar stock] [Devoluciones]  │
│                                    │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. KpiCard Widget**
```dart
class KpiCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final String? changePercentage;
  final bool isPositive;
  final VoidCallback? onTap;
  
  // Características:
  // - Card con elevation 2
  // - Icon grande con primary color
  // - Value en displayMedium
  // - Label en texto secundario
  // - Change percentage con arrow y color
  //   (success si positivo, error si negativo)
  // - Tap para ver detalles
}
```

**2. SalesChart Widget**
```dart
class SalesChart extends StatelessWidget {
  final List<SalesData> data;
  final ChartType type; // line | bar
  
  // Características:
  // - Integración con fl_chart o similar
  // - Responsive height
  // - Tooltips en tap
  // - Gradient fill
  // - Animated on load
  // - Labels en eje X e Y
}
```

**3. TopProductsList Widget**
```dart
class TopProductsList extends StatelessWidget {
  final List<ProductSalesData> products;
  final int maxItems; // default 5
  
  // Características:
  // - Numbered list
  // - Product thumbnail
  // - Nombre del producto
  // - Sales count
  // - Tap para ver producto
}
```

**4. FlashOffersToggle Widget (Realtime)**
```dart
class FlashOffersToggle extends StatefulWidget {
  final bool currentStatus;
  final Function(bool) onToggle;
  
  // Características:
  // - Switch con estado ON/OFF
  // - Real-time sync con Supabase (settings table)
  // - Neon glow cuando activo
  // - Status label ("Activas" / "Inactivas")
  // - Confirmation dialog antes de toggle
  // - Loading state durante cambio
  // - Error handling
}
```

---

### Gestión de Productos

#### Wireframe ASCII (Lista)
```
┌────────────────────────────────────┐
│  [←]  PRODUCTOS        [🔍] [+]    │ ← Add Button
├────────────────────────────────────┤
│  [Grid] [List]  │  [Filtros ▼]     │ ← View + Filters
│                                    │
│  ┌────────────────────────────────┐│
│  │ [Img] Product A                ││ ← ProductListItem
│  │       $45.00 • 25 en stock     ││
│  │       Activo • Tops            ││
│  │                        [⋯]     ││ ← Menu
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product B                ││
│  │       $30.00 • 3 en stock ⚠️   ││ ← Low stock warning
│  │       Activo • Bottoms         ││
│  │                        [⋯]     ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product C                ││
│  │       $50.00 • 0 en stock 🚫   ││ ← Out of stock
│  │       Inactivo • Dresses       ││
│  │                        [⋯]     ││
│  └────────────────────────────────┘│
│                                    │
└────────────────────────────────────┘
```

#### Wireframe ASCII (Edición Rápida)
```
┌────────────────────────────────────┐
│  EDITAR PRODUCTO                   │ ← Bottom Sheet
├────────────────────────────────────┤
│  [Img] Product A                   │
│                                    │
│  Nombre:                           │
│  [Product A_________]              │
│                                    │
│  Precio:                           │
│  [$ 45.00____]                     │
│                                    │
│  Stock por talla:                  │ ← InlineStockEditor
│  S:  [−] 5  [+]                    │
│  M:  [−] 10 [+]                    │
│  L:  [−] 8  [+]                    │
│  XL: [−] 2  [+] ⚠️ Bajo            │
│                                    │
│  Estado:                           │
│  [●] Activo  [○] Inactivo          │
│                                    │
│  [Cancelar]      [Guardar cambios] │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. ProductListItem Widget**
```dart
class ProductListItem extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  
  // Características:
  // - Leading image 60x60px
  // - Title: nombre del producto
  // - Subtitle: precio, stock, estado, categoría
  // - Stock badge (success si >10, warning si 1-10, error si 0)
  // - Trailing: menu (editar, eliminar)
  // - Swipe actions (editar, eliminar)
}
```

**2. InlineStockEditor Widget**
```dart
class InlineStockEditor extends StatelessWidget {
  final Map<String, int> stockBySizes; // {"S": 5, "M": 10, ...}
  final Function(String size, int newStock) onStockChange;
  
  // Características:
  // - Row por cada talla
  // - Quantity selector (−/+)
  // - Warning badge si stock < 5
  // - Real-time validation
  // - Totales al final
}
```

**3. ProductFilterDrawer Widget**
```dart
class ProductFilterDrawer extends StatelessWidget {
  final ProductFilters currentFilters;
  final Function(ProductFilters) onApply;
  
  // Características:
  // - Filtros: Categoría, Estado, Rango de precio, Stock
  // - Checkboxes y range sliders
  // - "Limpiar" y "Aplicar" buttons
  // - Contador de productos
}
```

**4. SoftDeleteConfirmation Widget**
```dart
class SoftDeleteConfirmation extends StatelessWidget {
  final Product product;
  final VoidCallback onConfirm;
  
  // Características:
  // - Dialog con advertencia
  // - Info: soft delete (is_deleted = true)
  // - Botones: "Cancelar" y "Eliminar" (error color)
  // - Loading state
}
```

---

### Gestión de Pedidos

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  PEDIDOS          [🔍]        │
├────────────────────────────────────┤
│  [Todos] [Pendientes] [Enviados]   │ ← Tabs
│  [Entregados] [Cancelados]         │
│                                    │
│  Filtrar por fecha: [Hoy ▼]        │ ← Date Filter
│                                    │
│  ┌────────────────────────────────┐│
│  │ #10001  🟢 Enviado             ││ ← OrderListItem
│  │ John Doe • 15 Ene 2026         ││
│  │ 3 productos • $130.00          ││
│  │                        [Ver >] ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ #10000  🟡 Pendiente           ││
│  │ Jane Smith • 10 Ene 2026       ││
│  │ 1 producto • $50.00            ││
│  │                        [Ver >] ││
│  └────────────────────────────────┘│
│                                    │
└────────────────────────────────────┘
```

#### Wireframe ASCII (Detalle Admin)
```
┌────────────────────────────────────┐
│  [←]  PEDIDO #10001                │
├────────────────────────────────────┤
│  🟡 Pendiente                      │
│                                    │
│  CAMBIAR ESTADO:                   │
│  [Procesando] [Enviado] [Entregado]│ ← Quick Actions
│  [Cancelar pedido]                 │
│                                    │
│  👤 CLIENTE                        │
│  John Doe                          │
│  john.doe@email.com                │
│  +1 234 567 8900                   │
│                                    │
│  📦 PRODUCTOS (3)                  │
│  [Lista de productos...]           │
│                                    │
│  📍 DIRECCIÓN                      │
│  [Dirección completa...]           │
│                                    │
│  💳 PAGO                           │
│  Stripe • $130.00                  │
│  Payment Intent: pi_xxx            │
│  [Ver en Stripe]                   │
│                                    │
│  📝 NOTAS INTERNAS                 │
│  [Agregar nota...]                 │
│  • Admin: "Verificar dirección"    │
│    10 Ene, 2:30 PM                 │
│                                    │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. OrderListItem Widget (Admin)**
```dart
class OrderListItem extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;
  
  // Características:
  // - Order number en bold
  // - Status badge con color
  // - Customer name
  // - Date y hora
  // - Products count + total
  // - Tap para ver detalle
  // - Long press para acciones rápidas
}
```

**2. OrderStatusChanger Widget**
```dart
class OrderStatusChanger extends StatelessWidget {
  final Order order;
  final Function(OrderStatus) onStatusChange;
  
  // Características:
  // - Chip buttons para cada estado posible
  // - Disabled si transición no válida
  // - Confirmation dialog
  // - Auto-send email notification
  // - Update tracking si status = "shipped"
}
```

**3. OrderNotesSection Widget**
```dart
class OrderNotesSection extends StatefulWidget {
  final Order order;
  final List<OrderNote> notes;
  final Function(String) onAddNote;
  
  // Características:
  // - Lista de notas con autor y timestamp
  // - Input para agregar nueva nota
  // - Solo visible para admins
  // - Real-time updates (opcional)
}
```

---

### Sistema de Devoluciones Admin

#### Wireframe ASCII (Dashboard Devoluciones)
```
┌────────────────────────────────────┐
│  [←]  DEVOLUCIONES     [🔍]        │
├────────────────────────────────────┤
│  📊 MÉTRICAS                       │ ← ReturnsMetricsDashboard
│  ┌──────────┐ ┌──────────┐        │
│  │ 12       │ │ 8        │        │
│  │ Pendientes│ │ En       │        │
│  │          │ │ Inspección│        │
│  └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐        │
│  │ $420     │ │ 95%      │        │
│  │ Reembolsos│ │ Tasa     │        │
│  │ Pendientes│ │ Aprobación│       │
│  └──────────┘ └──────────┘        │
│                                    │
│  [Pendientes] [En inspección]      │ ← Tabs
│  [Aprobadas] [Rechazadas]          │
│                                    │
│  ┌────────────────────────────────┐│
│  │ #R10001  🟡 Pendiente          ││ ← ReturnListItem
│  │ Pedido #10001 • John Doe       ││
│  │ 2 productos • $75.00           ││
│  │                    [Revisar >] ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ #R10000  🔵 En inspección      ││
│  │ Pedido #10000 • Jane Smith     ││
│  │ 1 producto • $50.00            ││
│  │                    [Revisar >] ││
│  └────────────────────────────────┘│
│                                    │
└────────────────────────────────────┘
```

#### Wireframe ASCII (Inspección de Devolución)
```
┌────────────────────────────────────┐
│  [←]  INSPECCIÓN #R10001           │
├────────────────────────────────────┤
│  🟡 PENDIENTE DE INSPECCIÓN        │
│                                    │
│  📦 PRODUCTOS (2)                  │
│  ┌────────────────────────────────┐│
│  │ [Img] Product A                ││
│  │ Qty: 1 • $45.00                ││
│  │                                ││
│  │ ✅ ESTADO DEL PRODUCTO          ││ ← Inspection Form
│  │ [●] Excelente                  ││
│  │ [○] Bueno                      ││
│  │ [○] Defectuoso                 ││
│  │ [○] No retornable              ││
│  │                                ││
│  │ Notas:                         ││
│  │ [_____________________]        ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ [Img] Product B                ││
│  │ Qty: 1 • $30.00                ││
│  │ [Similar form...]              ││
│  └────────────────────────────────┘│
│                                    │
│  ❓ MOTIVO DEL CLIENTE             │
│  Talla incorrecta                  │
│                                    │
│  📸 FOTOS ADJUNTAS (3)             │
│  [Img1] [Img2] [Img3]              │
│                                    │
│  💰 DECISIÓN DE REEMBOLSO          │
│  ┌────────────────────────────────┐│
│  │ [●] Aprobar reembolso completo ││
│  │     $57.50                     ││
│  │ [○] Aprobar parcial:           ││
│  │     [$ ______]                 ││
│  │ [○] Rechazar devolución        ││
│  │     Motivo: [_____________]    ││
│  └────────────────────────────────┘│
│                                    │
│  [Cancelar]        [Completar      │
│                     inspección]    │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. ReturnsMetricsDashboard Widget**
```dart
class ReturnsMetricsDashboard extends StatelessWidget {
  final ReturnsMetrics metrics;
  
  // Características:
  // - Grid de KPI cards
  // - Métricas: pendientes, en inspección, reembolsos pendientes, tasa aprobación
  // - Real-time updates
  // - Tap para filtrar lista
}
```

**2. ReturnListItem Widget (Admin)**
```dart
class ReturnListItem extends StatelessWidget {
  final Return returnData;
  final VoidCallback onReview;
  
  // Características:
  // - Return ID en bold
  // - Status badge
  // - Order number + customer name
  // - Products count + refund amount
  // - "Revisar" button
  // - Priority badge si >3 días pendiente
}
```

**3. ProductInspectionForm Widget**
```dart
class ProductInspectionForm extends StatefulWidget {
  final OrderItem item;
  final Function(InspectionResult) onComplete;
  
  // Características:
  // - Product thumbnail + info
  // - Radio options para estado
  // - TextField para notas
  // - Photo viewer para fotos del cliente
  // - Validation
}
```

**4. RefundDecision Widget**
```dart
class RefundDecision extends StatefulWidget {
  final double estimatedRefund;
  final Function(RefundDecisionData) onDecide;
  
  // Características:
  // - Radio options: aprobar completo, parcial, rechazar
  // - TextField para monto parcial
  // - TextField para motivo de rechazo
  // - Validation
  // - Preview de email al cliente
}
```

---

### Configuración del Sistema

#### Wireframe ASCII
```
┌────────────────────────────────────┐
│  [←]  CONFIGURACIÓN                │
├────────────────────────────────────┤
│  ⚡ OFERTAS FLASH                  │
│  ┌────────────────────────────────┐│
│  │ Estado: [────●────────] ON     ││ ← ToggleSwitch Realtime
│  │ 🟢 Activas                     ││
│  │                                ││
│  │ Última actualización:          ││
│  │ 27 Ene 2026, 10:30 AM          ││
│  │ por Admin User                 ││
│  └────────────────────────────────┘│
│                                    │
│  🎨 APARIENCIA                     │
│  ┌────────────────────────────────┐│
│  │ Tema: [●] Oscuro [○] Claro     ││
│  │ Color primario: [#CCFF00] [🎨] ││
│  └────────────────────────────────┘│
│                                    │
│  📧 NOTIFICACIONES                 │
│  ┌────────────────────────────────┐│
│  │ [☑] Nuevos pedidos             ││
│  │ [☑] Stock bajo                 ││
│  │ [☑] Devoluciones pendientes    ││
│  │ [☐] Newsletter subscribers     ││
│  └────────────────────────────────┘│
│                                    │
│  💰 PAGOS                          │
│  ┌────────────────────────────────┐│
│  │ Stripe: [Configurado ✓]        ││
│  │ [Ver dashboard] [Reconfigurar] ││
│  └────────────────────────────────┘│
│                                    │
│  🚚 ENVÍOS                         │
│  ┌────────────────────────────────┐│
│  │ Envío gratis desde: [$ 100]    ││
│  │ Costo estándar: [$ 10]         ││
│  │ Tiempo estimado: [3-5 días]    ││
│  └────────────────────────────────┘│
│                                    │
│  [Guardar cambios]                 │
└────────────────────────────────────┘
```

#### Componentes Clave

**1. FlashOffersToggleRealtime Widget**
```dart
class FlashOffersToggleRealtime extends StatefulWidget {
  // Características:
  // - Switch con estado ON/OFF
  // - Real-time sync con Supabase
  // - Subscription a cambios en settings table
  // - Display último cambio (timestamp + user)
  // - Confirmation dialog
  // - Optimistic updates
  // - Error handling con rollback
  // - Neon glow effect cuando activo
}
```

**2. SettingsSection Widget**
```dart
class SettingsSection extends StatelessWidget {
  final String title;
  final Widget child;
  
  // Características:
  // - Card con title
  // - Padding consistente
  // - Dividers entre secciones
}
```

**3. ColorPicker Widget**
```dart
class ColorPicker extends StatelessWidget {
  final Color currentColor;
  final Function(Color) onColorChange;
  
  // Características:
  // - Swatch de colores predefinidos
  // - Custom color picker (opcional)
  // - Preview del color seleccionado
  // - Hex value display
}
```

---

## 🎬 Animaciones y Microinteracciones

### Transiciones de Página

#### Configuraciones
```dart
class AppPageTransitions {
  // Fade-up transition (default para la mayoría)
  static PageRouteBuilder<T> fadeUp<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionDuration: AppDurations.slow, // 400ms
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 0.03); // Slight upward movement
        const end = Offset.zero;
        const curve = Curves.easeOut;
        
        final tween = Tween(begin: begin, end: end);
        final curvedAnimation = CurvedAnimation(
          parent: animation,
          curve: curve,
        );
        final offsetAnimation = tween.animate(curvedAnimation);
        
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: offsetAnimation,
            child: child,
          ),
        );
      },
    );
  }
  
  // Slide-in-right (para navegación hacia adelante)
  static PageRouteBuilder<T> slideInRight<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionDuration: AppDurations.normal, // 300ms
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        const curve = Curves.easeInOut;
        
        final tween = Tween(begin: begin, end: end);
        final offsetAnimation = animation.drive(tween.chain(
          CurveTween(curve: curve),
        ));
        
        return SlideTransition(
          position: offsetAnimation,
          child: child,
        );
      },
    );
  }
  
  // Scale-fade (para modals)
  static PageRouteBuilder<T> scaleFade<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionDuration: AppDurations.normal, // 300ms
      opaque: false, // Permite ver la página detrás
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.9, end: 1.0).animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOut,
              ),
            ),
            child: child,
          ),
        );
      },
    );
  }
}
```

#### Uso
```dart
// En navegación
Navigator.of(context).push(
  AppPageTransitions.fadeUp(ProductDetailPage(product: product)),
);

// Para bottom sheets y modals
showModalBottomSheet(
  context: context,
  transitionAnimationController: AnimationController(
    vsync: this,
    duration: AppDurations.normal,
  ),
  builder: (context) => FilterDrawer(),
);
```

---

### Feedback Táctil

#### Configuraciones de Haptics
```dart
class AppHaptics {
  // Light feedback (seleccionar chip, toggle switch)
  static void light() {
    HapticFeedback.lightImpact();
  }
  
  // Medium feedback (botones estándar, añadir al carrito)
  static void medium() {
    HapticFeedback.mediumImpact();
  }
  
  // Heavy feedback (eliminar item, confirmar pedido)
  static void heavy() {
    HapticFeedback.heavyImpact();
  }
  
  // Selection (scroll entre opciones, cambiar talla)
  static void selection() {
    HapticFeedback.selectionClick();
  }
  
  // Success (pedido completado, pago exitoso)
  static void success() {
    HapticFeedback.mediumImpact();
    Future.delayed(Duration(milliseconds: 100), () {
      HapticFeedback.lightImpact();
    });
  }
  
  // Error (pago rechazado, validación fallida)
  static void error() {
    HapticFeedback.heavyImpact();
    Future.delayed(Duration(milliseconds: 50), () {
      HapticFeedback.heavyImpact();
    });
  }
}
```

#### Scale Animation en Botones
```dart
class ScaleButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onPressed;
  final double scaleAmount; // default 0.95
  final Duration duration; // default 150ms
  final bool enableHaptic; // default true
  
  @override
  _ScaleButtonState createState() => _ScaleButtonState();
}

class _ScaleButtonState extends State<ScaleButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration ?? Duration(milliseconds: 150),
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scaleAmount ?? 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        _controller.forward();
        if (widget.enableHaptic ?? true) {
          AppHaptics.medium();
        }
      },
      onTapUp: (_) {
        _controller.reverse();
        widget.onPressed();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: widget.child,
      ),
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

---

### Estados de Carga

#### Skeleton Shimmer
```dart
class ShimmerLoading extends StatefulWidget {
  final Widget child;
  final bool isLoading;
  final Color baseColor; // default surfaceVariant
  final Color highlightColor; // default shimmer
  
  @override
  _ShimmerLoadingState createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 1500),
    )..repeat();
  }
  
  @override
  Widget build(BuildContext context) {
    if (!widget.isLoading) {
      return widget.child;
    }
    
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return ShaderMask(
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                widget.baseColor ?? AppColors.surfaceVariant,
                widget.highlightColor ?? AppColors.shimmer,
                widget.baseColor ?? AppColors.surfaceVariant,
              ],
              stops: [
                0.0,
                0.5,
                1.0,
              ],
              begin: Alignment(-1.0 - _controller.value * 2, 0.0),
              end: Alignment(1.0 - _controller.value * 2, 0.0),
            ).createShader(bounds);
          },
          child: widget.child,
        );
      },
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

#### Skeleton Widgets
```dart
class SkeletonCard extends StatelessWidget {
  final double height;
  final double? width;
  
  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      isLoading: true,
      child: Container(
        height: height,
        width: width,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.card),
        ),
      ),
    );
  }
}

class SkeletonText extends StatelessWidget {
  final double width;
  final double height; // default 16
  
  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      isLoading: true,
      child: Container(
        height: height ?? 16,
        width: width,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppRadius.xs),
        ),
      ),
    );
  }
}

class SkeletonAvatar extends StatelessWidget {
  final double size;
  
  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      isLoading: true,
      child: Container(
        height: size,
        width: size,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
```

#### Lottie Animations (Opcional)
```dart
class LoadingAnimation extends StatelessWidget {
  final String animationPath; // assets/animations/loading.json
  final double size;
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Lottie.asset(
        animationPath,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}

// Uso
LoadingAnimation(
  animationPath: 'assets/animations/shopping_bag.json',
  size: 200,
)
```

#### Spinner con Neon Glow
```dart
class NeonSpinner extends StatelessWidget {
  final double size;
  final Color color; // default primary
  
  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        boxShadow: AppShadows.neonGlowPrimary,
      ),
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? AppColors.primary,
        ),
        strokeWidth: 3,
      ),
    );
  }
}
```

---

### Accesibilidad de Movimiento

#### Detección de Preferencias
```dart
class ReducedMotionDetector {
  static bool get prefersReducedMotion {
    // En Flutter Web
    if (kIsWeb) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // En Flutter Mobile (Android)
    // Requiere implementación nativa o package
    return false; // Default
  }
}
```

#### Wrapper para Animaciones Condicionales
```dart
class ConditionalAnimation extends StatelessWidget {
  final Widget child;
  final Widget Function(Widget child) animationBuilder;
  final bool forceDisable;
  
  @override
  Widget build(BuildContext context) {
    final reducedMotion = ReducedMotionDetector.prefersReducedMotion;
    
    if (reducedMotion || forceDisable) {
      return child;
    }
    
    return animationBuilder(child);
  }
}

// Uso
ConditionalAnimation(
  child: ProductCard(product: product),
  animationBuilder: (child) {
    return FadeTransition(
      opacity: animation,
      child: child,
    );
  },
)
```

#### Delays Escalonados para Listas
```dart
class StaggeredList extends StatelessWidget {
  final List<Widget> children;
  final Duration staggerDelay; // default 100ms
  final Axis scrollDirection;
  
  @override
  Widget build(BuildContext context) {
    final reducedMotion = ReducedMotionDetector.prefersReducedMotion;
    
    return ListView.builder(
      scrollDirection: scrollDirection,
      itemCount: children.length,
      itemBuilder: (context, index) {
        if (reducedMotion) {
          return children[index];
        }
        
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final delay = (staggerDelay ?? Duration(milliseconds: 100)) * index;
            final progress = (_controller.value * 1000 - delay.inMilliseconds)
                .clamp(0.0, 1000.0) / 1000.0;
            
            return Opacity(
              opacity: progress,
              child: Transform.translate(
                offset: Offset(0, 20 * (1 - progress)),
                child: child,
              ),
            );
          },
          child: children[index],
        );
      },
    );
  }
}

// Uso
StaggeredList(
  children: products.map((p) => ProductCard(product: p)).toList(),
  staggerDelay: Duration(milliseconds: 100),
)
```

---

## 📚 Referencias Cruzadas

### Enlaces Bidireccionales

Este documento complementa el [Plan de Desarrollo Flutter](PLAN-FLUTTER-APP.md) con especificaciones detalladas de UI/UX.

**Consultar el plan principal para**:
- Stack tecnológico y dependencias
- Estructura de carpetas
- Configuración de Supabase y Stripe
- Modelos de datos (Freezed)
- Patrones de arquitectura (Riverpod, Repository)
- RPCs y funcionalidades del backend
- Fases de desarrollo

**Referencia a este documento desde el plan principal**:
- Sección de "Diseño UI/UX" enlaza a este documento
- Componentes específicos mencionados en fases de desarrollo

---

## ✅ Checklist de Implementación UI/UX

### Sistema de Diseño
- [ ] Implementar `AppColors` con paleta completa
- [ ] Configurar fuentes (Bebas Neue, Oswald, Space Grotesk)
- [ ] Crear `AppTextStyles` con escalas tipográficas
- [ ] Definir `AppSpacing` y grid system
- [ ] Implementar `AppRadius` y `AppShadows`
- [ ] Crear `AppGradients` con neon effects

### Componentes Base
- [ ] `ScaleButton` con haptic feedback
- [ ] `ShimmerLoading` para skeletons
- [ ] `StatusBadge` con estados de pedido
- [ ] `NeonSpinner` con glow effect
- [ ] `ConditionalAnimation` para accesibilidad

### Pantallas Públicas
- [ ] Homepage con hero y categorías
- [ ] Catálogo con filtros y búsqueda
- [ ] Detalle de producto con galería
- [ ] Carrito con cupones
- [ ] Checkout en 3 pasos con Stripe

### Área de Cliente
- [ ] Autenticación (login/registro)
- [ ] Dashboard de cuenta
- [ ] Historial de pedidos con filtros
- [ ] Detalle de pedido con timeline
- [ ] Sistema de devoluciones completo
- [ ] Gestión de perfil

### Panel Admin
- [ ] Dashboard con KPIs
- [ ] Gestión de productos con stock editor
- [ ] Gestión de pedidos por estado
- [ ] Sistema de devoluciones admin
- [ ] Configuración con toggle realtime

### Animaciones
- [ ] Transiciones de página (fade-up, slide-in)
- [ ] Haptic feedback en acciones clave
- [ ] Loading states (skeleton, spinner)
- [ ] Staggered animations en listas
- [ ] Soporte prefers-reduced-motion

---

**Fin del documento**  
Para consultas o sugerencias, referirse al [Plan de Desarrollo Flutter](PLAN-FLUTTER-APP.md) principal.
