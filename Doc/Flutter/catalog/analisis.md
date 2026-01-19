# Análisis del Módulo: Catálogo de Productos

## 1. Visión General

### Descripción del Módulo
El catálogo de productos es el núcleo comercial de FashionStore. Incluye:
- Listado de productos con filtros y ordenación
- Página de detalle de producto con galería de imágenes
- Navegación por categorías
- Sistema de variantes (tallas) y stock
- Integración con carrito de compras
- Soporte para ofertas y promociones

### Prioridad
**#2** - Esencial para que los clientes exploren y seleccionen productos.

---

## 2. Páginas Web Actuales

### 2.1 Listado de Productos (`/productos`)
**Archivo:** `src/pages/productos/index.astro`

**Funcionalidades:**
- Grid responsivo de productos (2-4 columnas según viewport)
- Filtros: categoría, búsqueda, rango de precio, ofertas
- Ordenación: recientes, precio asc/desc, nombre A-Z
- URL con query params para compartir filtros
- Contador de productos encontrados

**Query Supabase:**
```typescript
supabase
  .from("products")
  .select(`
    *,
    category:categories(name, slug),
    images:product_images(image_url, order),
    variants:product_variants(id, size, stock)
  `)
  .eq("active", true)
  // + filtros dinámicos (category_id, price range, is_offer)
  .order(sortBy, { ascending: sortOrder })
```

### 2.2 Detalle de Producto (`/productos/[slug]`)
**Archivo:** `src/pages/productos/[slug].astro`

**Funcionalidades:**
- Galería de imágenes con thumbnails
- Breadcrumbs de navegación
- Precios (normal y oferta con % descuento)
- Selector de talla con indicador de stock
- Botón "Añadir al carrito" con feedback visual
- Sticky bar móvil para añadir al carrito
- Modal de guía de tallas (ropa vs calzado)
- Banner de promociones contextual

### 2.3 Página de Categoría (`/categoria/[slug]`)
**Archivo:** `src/pages/categoria/[slug].astro`

**Funcionalidades:**
- Productos filtrados por categoría
- Sidebar con lista de categorías
- Breadcrumbs de navegación
- Grid de productos idéntico al listado general

---

## 3. Componentes Clave

### 3.1 ProductCard.astro
**Ubicación:** `src/components/product/ProductCard.astro`

**Características:**
- Imagen optimizada (Cloudinary)
- Badge de descuento (% off)
- Indicador "Últimas X unidades"
- Overlay "AGOTADO" si stock = 0
- Precio tachado si hay oferta
- Hover effect con zoom y overlay

**Props:**
```typescript
interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    offer_price?: number | null;
    is_offer?: boolean;
    category?: { name: string; slug: string } | null;
    images?: { image_url: string; order: number }[] | null;
    variants?: { id: string; size: string; stock: number }[] | null;
  };
  class?: string;
}
```

### 3.2 ProductFilters.tsx (React Island)
**Ubicación:** `src/components/islands/ProductFilters.tsx`

**Características:**
- Búsqueda con input y botón
- Lista de categorías (clickable)
- Rango de precios (min/max)
- Toggle "Solo ofertas"
- Select de ordenación
- Botón "Limpiar filtros"
- Mobile: drawer lateral con backdrop
- Desktop: sidebar sticky

**Estado interno:**
```typescript
const [isOpen, setIsOpen] = useState(false);     // Drawer móvil
const [search, setSearch] = useState(initialSearch);
const [minPrice, setMinPrice] = useState(initialMinPrice);
const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
```

### 3.3 ProductAddToCart.tsx (React Island)
**Ubicación:** `src/components/islands/ProductAddToCart.tsx`

**Características:**
- Selector de talla visual (botones)
- Orden de tallas (XS→XXL para ropa, 36→46 para calzado)
- Indicador de stock bajo (⚡)
- Estados del botón: idle, loading, success, error
- Feedback háptico (navigator.vibrate)
- Sticky bar en móvil al hacer scroll
- Modal "Guía de tallas" con tabla

**Estado interno:**
```typescript
const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [showStickyBar, setShowStickyBar] = useState(false);
const [showSizeGuide, setShowSizeGuide] = useState(false);
```

### 3.4 Cart Store (Nanostores)
**Ubicación:** `src/stores/cart.ts`

**Estructura del item:**
```typescript
interface CartItem {
  id: string;           // productId-variantId
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  size: string;
  price: number;
  imageUrl: string;
  quantity: number;
}
```

**Acciones:**
- `addToCart(item, quantity)`
- `removeFromCart(itemId)`
- `updateQuantity(itemId, quantity)`
- `clearCart()`

**Computed:**
- `$cartCount` - total de items
- `$cartSubtotal` - suma de precios

**Persistencia:** LocalStorage con key `fashionstore_cart`

---

## 4. Modelo de Datos

### 4.1 Tabla: categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  size_type TEXT DEFAULT 'clothing' 
    CHECK (size_type IN ('clothing', 'footwear', 'universal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Tabla: products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  offer_price NUMERIC(10, 2) CHECK (offer_price IS NULL OR offer_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  is_offer BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,  -- Soft delete
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Tabla: product_variants
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE(product_id, size)
);
```

### 4.4 Tabla: product_images
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 Relaciones
```
categories 1───M products
products 1───M product_variants
products 1───M product_images
```

---

## 5. Características Especiales

### 5.1 Sistema de Imágenes
- **Cloudinary** para optimización automática
- Transformaciones: width, height, crop, quality
- Responsive srcset: 400, 800, 1200px
- Blur placeholder para carga progresiva
- Fallback para URLs no-Cloudinary

### 5.2 Sistema de Ofertas
- Campo `is_offer` para marcar productos
- Campo `offer_price` para precio rebajado
- Badge visual con % de descuento calculado
- Filtro "Solo ofertas" en listado
- Setting global `offers_enabled` con fecha de fin

### 5.3 Control de Stock
- Stock por variante (talla)
- Indicador visual "Últimas X unidades" (stock ≤ 5)
- Botón deshabilitado si agotado
- Overlay "AGOTADO" en tarjeta de producto

### 5.4 Tipos de Talla
- **clothing:** XS, S, M, L, XL, XXL
- **footwear:** 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46
- **universal:** Talla única
- Guía de tallas adaptativa según tipo

---

## 6. Flujos de Usuario

### 6.1 Explorar Catálogo
```
1. Usuario entra a /productos
2. Ve grid de productos (más recientes)
3. Aplica filtros (categoría, precio, ofertas)
4. URL se actualiza con query params
5. Click en producto → detalle
```

### 6.2 Ver Producto
```
1. Usuario entra a /productos/[slug]
2. Ve galería, precio, descripción
3. Click en thumbnail → cambia imagen principal
4. Selecciona talla disponible
5. Click "Añadir al carrito"
6. Feedback visual de éxito
7. Sticky bar aparece en móvil al scrollear
```

### 6.3 Añadir al Carrito
```
1. Usuario selecciona talla
2. Click "AÑADIR AL CARRITO - €XX"
3. Estado → loading (spinner)
4. addToCart() actualiza store
5. Estado → success (checkmark)
6. Vibración háptica (móvil)
7. Estado → idle (reset)
```

---

## 7. Estilos y UX

### 7.1 Grid Responsivo
- **Mobile (< 640px):** 2 columnas
- **Tablet (640-1024px):** 3 columnas
- **Desktop (> 1024px):** 3-4 columnas
- Gap: 1rem (mobile), 1.5rem (desktop)

### 7.2 Animaciones
- Hover en tarjeta: scale-105, overlay fade
- Cambio de imagen: transición suave
- Botón añadir: estados con transición 300ms
- Drawer filtros: slide-in-right

### 7.3 Colores de Estados
- **Precio normal:** foreground
- **Precio oferta:** accent (#FF4757)
- **Éxito añadir:** emerald-500
- **Stock bajo:** yellow-400/amber
- **Primary (CTA):** #CCFF00

---

## 8. Dependencias Técnicas

### Frontend
- **React:** Islands para interactividad (filtros, carrito)
- **Nanostores:** Estado compartido del carrito
- **Astro:** SSR para páginas y componentes
- **TailwindCSS:** Estilos

### Backend
- **Supabase:** Queries con joins (select nested)
- **Cloudinary:** Hosting y optimización de imágenes
- **RLS Policies:** Productos activos visibles públicamente

---

## 9. Consideraciones para Flutter

### 9.1 Migración de Estado
| Web (Nanostores) | Flutter (Riverpod) |
|------------------|-------------------|
| `$cart` atom | `cartProvider` StateNotifier |
| `$cartCount` computed | `cartCountProvider` derived |
| LocalStorage | SharedPreferences / Hive |

### 9.2 Componentes a Crear
- `ProductCard` widget
- `ProductGrid` con GridView
- `ProductFiltersSheet` (BottomSheet)
- `ProductDetailScreen` con galería
- `SizeSelector` widget
- `AddToCartButton` con estados
- `SizeGuideModal` dialog

### 9.3 Paquetes Recomendados
- **cached_network_image:** Caché de imágenes
- **shimmer:** Skeletons de carga
- **photo_view:** Galería con zoom
- **flutter_riverpod:** Estado
- **hive_flutter:** Persistencia carrito

### 9.4 Optimización de Imágenes
- Usar URLs de Cloudinary con transformaciones
- Implementar lazy loading
- Placeholders mientras carga
- Caché local con policy de expiración
