# Prompt: Rediseño y Optimización Frontend Cliente - FashionStore

**Fecha:** 21 de Enero, 2026  
**Proyecto:** FashionStore - Sistema de Gestión Empresarial  
**Objetivo:** Rediseño completo del frontend cliente con enfoque en UI/UX moderna y responsive

---

## 🎯 CONTEXTO Y OBJETIVO

Eres un experto en diseño UI/UX y desarrollo frontend. Tu tarea es **rediseñar y optimizar completamente el área cliente de FashionStore**, una tienda de streetwear premium, aplicando los mismos principios de diseño que se utilizan en el área de administración.

**Objetivo principal:** Crear una experiencia de usuario moderna, profesional y consistente en todas las páginas del cliente, manteniendo la identidad visual de la marca (neon green #CCFF00, diseño urbano/streetwear).

---

## 📋 PÁGINAS A REDISEÑAR

### Páginas Principales (PRIORITARIAS)

1. **Homepage (`/`)** - Página de inicio
2. **Checkout (`/checkout`)** - Proceso de compra
3. **Perfil de Usuario (`/cuenta`)** - Perfil del cliente
4. **Mis Pedidos (`/cuenta/pedidos`)** - Historial de pedidos
5. **Detalle de Pedido (`/cuenta/pedidos/[id]`)** - Vista individual de pedido

### Páginas del Footer (SECUNDARIAS)

6. **Contacto (`/contacto`)** - Formulario de contacto
7. **Envíos y Devoluciones (`/envios`)** - Información de envíos
8. **Política de Privacidad (`/privacidad`)** - Legal
9. **Términos y Condiciones (`/terminos`)** - Legal
10. **Sobre Nosotros** (si existe) - Información de la empresa

### Páginas Adicionales

11. **Productos (`/productos`)** - Catálogo con filtros
12. **Detalle de Producto (`/productos/[slug]`)** - Vista individual
13. **Carrito (`/carrito`)** - Vista completa del carrito
14. **Categorías (`/categoria/[slug]`)** - Productos por categoría

---

## 🎨 SISTEMA DE DISEÑO BASE

### Referencia: Configuración de Admin

El área de administración utiliza un diseño moderno y profesional que debe servir como **inspiración y guía**:

**Componentes clave del admin:**
- `.admin-card` - Cards con bordes sutiles y hover states
- `.stat-card` - Cards de estadísticas con iconos grandes
- `.admin-table` - Tablas con filas alternadas y hover
- `.badge-*` - Badges con diferentes variantes
- `.admin-btn-*` - Botones con estados claros
- `.glass` - Efecto glassmorphism sutil

**Paleta de colores:**
```css
/* Modo Claro */
--primary: 84 85% 35%; /* Verde oscuro */
--accent: 351 100% 63.5%; /* Rojo */
--muted-foreground: 240 5% 30%; /* Gris oscuro - Contraste AAA */

/* Modo Oscuro */
--primary: 84 100% 50%; /* Neon Green #CCFF00 */
--accent: 351 100% 63.5%; /* Rojo */
--background: 240 10% 3.9%; /* Negro suave */
```

**Espaciado consistente:**
- Containers: `px-4 md:px-6 lg:px-8`
- Cards: `p-6` o `p-4` en mobile
- Gap entre elementos: `gap-4` o `gap-6`

---

## 🔍 ANÁLISIS PREVIO REQUERIDO

Antes de rediseñar, **analiza exhaustivamente** el código actual:

### 1. Arquitectura Actual

```bash
# Revisa la estructura de carpetas
src/
├── pages/              # Rutas de Astro
├── layouts/           # PublicLayout.astro, BaseLayout.astro
├── components/
│   ├── islands/       # Componentes React interactivos
│   ├── product/       # ProductCard, etc.
│   └── ui/           # Componentes UI reutilizables
└── styles/           # global.css con sistema de diseño
```

### 2. Componentes Existentes a Revisar

**Componentes React (islands/):**
- `HeaderNavigation.tsx` - Navegación principal
- `HeaderSearch.tsx` - Búsqueda
- `CartSlideOver.tsx` - Carrito lateral
- `UserMenu.tsx` - Menú de usuario
- `ProductFilters.tsx` - Filtros de productos
- `CheckoutForm.tsx` - Formulario de checkout
- `ProfileForm.tsx` - Formulario de perfil

**Componentes Astro:**
- `ProductCard.astro` - Tarjeta de producto
- `CloudinaryImage.astro` - Imágenes optimizadas

### 3. Estilos Globales

Revisa `src/styles/global.css`:
- Variables CSS HSL
- Clases utility (`.glass`, `.admin-card`, etc.)
- Sistema de animaciones
- Responsive breakpoints

---

## 📐 PRINCIPIOS DE DISEÑO A APLICAR

### 1. Diseño Consistente con Admin

**Aplica el mismo lenguaje visual:**
- Cards con bordes sutiles y sombras suaves
- Hover states claros con transiciones suaves
- Iconos de lucide-react consistentes
- Espaciado uniforme y predecible
- Tipografía jerárquica clara

**Ejemplo de transformación:**
```tsx
// ❌ ANTES - Card genérico sin estilo
<div className="border p-4 rounded">
  <h3>Producto</h3>
</div>

// ✅ DESPUÉS - Card estilo admin
<div className="admin-card hover:border-primary/30 transition-colors group">
  <h3 className="font-heading text-lg mb-2">Producto</h3>
  <div className="flex items-center gap-4">
    {/* Contenido */}
  </div>
</div>
```

### 2. Responsive First

**Mobile-first approach:**
- Diseña primero para móvil (320px+)
- Adapta para tablet (768px+)
- Optimiza para desktop (1024px+)
- Touch targets mínimo 44x44px (ya implementado)

**Breakpoints consistentes:**
```css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Ultra wide */
```

### 3. Microinteracciones y Animaciones

**Añade detalles que mejoren la experiencia:**
- Hover states con `scale-[1.02]` sutil
- Transiciones suaves (`duration-300`)
- Loading states con spinners
- Success states con animaciones
- Skeleton screens mientras carga

**Respeta `prefers-reduced-motion`:**
```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

const prefersReducedMotion = useReducedMotion();
const animationClass = prefersReducedMotion ? '' : 'animate-fade-up';
```

### 4. Jerarquía Visual Clara

**Usa tipografía estratégicamente:**
- `font-display` (Bebas Neue) - Títulos impactantes
- `font-heading` (Oswald) - Headings secundarios
- `font-body` (Space Grotesk) - Texto de lectura

**Escalas de texto:**
```
Títulos principales: text-4xl md:text-5xl lg:text-6xl
Subtítulos: text-2xl md:text-3xl
Headings: text-xl md:text-2xl
Body: text-base
Secundario: text-sm
```

### 5. Imágenes y Media Optimizados

**Usa CloudinaryImage para todas las imágenes:**
```tsx
<CloudinaryImage
  src={imageUrl}
  alt="Descripción descriptiva"
  width={800}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>
```

**Picture element para heros:**
```html
<picture>
  <source srcset="mobile.webp" media="(max-width: 768px)" />
  <img src="desktop.webp" alt="Hero" loading="eager" fetchpriority="high" />
</picture>
```

---

## 🎯 REDISEÑO POR PÁGINA

### 1. HOMEPAGE (/)

**Problemas actuales a resolver:**
- [ ] Hero section poco impactante
- [ ] Productos destacados sin jerarquía clara
- [ ] Categorías sin hover states atractivos
- [ ] Newsletter footer básico
- [ ] Falta de social proof

**Objetivos del rediseño:**

#### Hero Section Mejorado
```
┌─────────────────────────────────────────┐
│  [Imagen Full Width + Overlay]          │
│                                         │
│  NUEVA COLECCIÓN 2026                  │
│  Streetwear Premium                     │
│  [CTA Principal] [CTA Secundario]      │
│                                         │
│  [Stats: 500+ Productos | Envío 24h]   │
└─────────────────────────────────────────┘
```

**Implementación sugerida:**
- Hero con parallax sutil (opcional, usar `useReducedMotion`)
- CTAs con glow effect en hover
- Stats cards con iconos de lucide-react
- Overlay gradient para mejor legibilidad

#### Productos Destacados (Featured Products)
```
┌─────────────────────────────────────────┐
│  NOVEDADES  [Ver todo →]               │
│                                         │
│  [Card] [Card] [Card] [Card]           │
│  Grid responsive: 1/2/3/4 columns      │
└─────────────────────────────────────────┘
```

**Mejoras a implementar:**
- Cards con efecto de elevación en hover
- Overlay con "Vista rápida" en hover desktop
- Badges de "Nuevo" o "Oferta" más visibles
- Transiciones suaves entre grid layouts
- Loading skeletons mientras carga

#### Categorías
```
┌─────────────────────────────────────────┐
│  COMPRA POR CATEGORÍA                   │
│                                         │
│  [Imagen Grande]  [Imagen Med] [Med]   │
│   ZAPATILLAS      CAMISETAS  PANTALONES│
│                                         │
│  Grid asimétrico para mayor interés    │
└─────────────────────────────────────────┘
```

**Características:**
- Layout tipo masonry o asimétrico
- Imágenes con overlay oscuro y texto claro
- Hover con zoom de imagen (scale-110)
- Badge con número de productos

#### Sección de Confianza
```
┌─────────────────────────────────────────┐
│  [Icono Envío]  [Icono Devolución]     │
│   Envío Gratis   Devoluciones 30 días  │
│                                         │
│  [Icono Pago]    [Icono Soporte]       │
│   Pago Seguro    Soporte 24/7          │
└─────────────────────────────────────────┘
```

#### Newsletter Mejorado
- Fondo degradado o imagen de fondo
- Input grande con botón integrado
- Texto convincente sobre beneficios
- Checkbox de privacidad elegante

---

### 2. CHECKOUT (/checkout)

**Problemas actuales:**
- [ ] Formulario largo sin división clara
- [ ] Resumen de pedido poco visible
- [ ] Validación de campos básica
- [ ] Sin indicadores de progreso
- [ ] Falta de trust signals

**Objetivos del rediseño:**

#### Layout de 2 Columnas (Desktop)
```
┌─────────────────────┬─────────────────┐
│  PASO 1/3           │   RESUMEN       │
│  Información        │   [Productos]   │
│  de envío           │                 │
│                     │   Subtotal      │
│  [Formulario]       │   Envío         │
│                     │   Total         │
│  [Siguiente]        │                 │
│                     │   [Pagar]       │
└─────────────────────┴─────────────────┘
```

#### Stepper de Progreso
```
1. Envío  →  2. Pago  →  3. Confirmación
   [●]        [ ]         [ ]
```

**Implementación:**
- Stepper visual con iconos
- Formulario con validación en tiempo real
- Mensajes de error claros bajo cada campo
- Loading states en botones
- Resumen sticky en desktop

#### Trust Signals
- Iconos de métodos de pago aceptados
- Sello de "Pago Seguro SSL"
- Badge de "Envío Gratis" si aplica
- Política de devolución visible

#### Resumen de Pedido Mejorado
```
┌─────────────────────────────────────┐
│  TU PEDIDO                          │
│  ───────────────────────────────    │
│  [Img] Producto 1      €29.99       │
│        Talla M x 2                  │
│                                     │
│  [Img] Producto 2      €39.99       │
│        Talla L x 1                  │
│  ───────────────────────────────    │
│  Subtotal             €99.97        │
│  Envío                GRATIS        │
│  ───────────────────────────────    │
│  TOTAL                €99.97        │
│  ═════════════════════════════════  │
│  [FINALIZAR COMPRA]                 │
└─────────────────────────────────────┘
```

---

### 3. PERFIL DE USUARIO (/cuenta)

**Problemas actuales:**
- [ ] Diseño básico sin personalidad
- [ ] Navegación entre secciones confusa
- [ ] Formularios sin estados de guardado

**Objetivos del rediseño:**

#### Layout con Sidebar (Desktop)
```
┌───────────┬─────────────────────────┐
│ SIDEBAR   │  CONTENIDO              │
│           │                         │
│ [Avatar]  │  MI PERFIL              │
│ Usuario   │  ─────────              │
│           │  [Formulario]           │
│ • Perfil  │                         │
│ • Pedidos │  [Guardar Cambios]      │
│ • Direc.  │                         │
│ • Config  │                         │
│ ─────     │                         │
│ [Logout]  │                         │
└───────────┴─────────────────────────┘
```

#### Avatar y Header
- Avatar editable con hover overlay "Cambiar foto"
- Nombre de usuario destacado
- Badge de "Cliente VIP" si aplica
- Estadísticas: "X pedidos realizados"

#### Navegación Lateral
```tsx
const navItems = [
  { icon: User, label: 'Mi Perfil', href: '/cuenta' },
  { icon: Package, label: 'Mis Pedidos', href: '/cuenta/pedidos' },
  { icon: MapPin, label: 'Direcciones', href: '/cuenta/direcciones' },
  { icon: Settings, label: 'Configuración', href: '/cuenta/configuracion' },
];
```

**Características:**
- Items con hover state y icono
- Item activo con fondo primary/10
- Responsive: Tabs horizontales en móvil

#### Formulario de Perfil
- Campos agrupados lógicamente
- Labels flotantes o fijos claros
- Validación en tiempo real
- Toast de éxito al guardar
- Estados disabled mientras guarda

---

### 4. MIS PEDIDOS (/cuenta/pedidos)

**Problemas actuales:**
- [ ] Lista de pedidos poco visual
- [ ] Estados sin colores claros
- [ ] Falta de filtros/búsqueda
- [ ] Sin vista rápida de detalles

**Objetivos del rediseño:**

#### Vista de Lista Mejorada
```
┌─────────────────────────────────────────┐
│  MIS PEDIDOS            [Filtros ▼]     │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #FS-001234      [Entregado ✓]   │   │
│  │ 15 Enero 2026                   │   │
│  │                                 │   │
│  │ [Mini] [Mini] [Mini]  +2        │   │
│  │ 3 productos     Total: €129.99  │   │
│  │                                 │   │
│  │ [Ver Detalles] [Factura]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #FS-001233      [En tránsito 📦]│   │
│  │ ...                             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Características Clave

**Cards de Pedido:**
- Número de pedido destacado
- Badge de estado con color (verde/azul/rojo)
- Miniaturas de productos
- Acciones rápidas (ver, factura, devolver)
- Hover con elevación

**Filtros:**
```tsx
<select className="admin-select">
  <option>Todos</option>
  <option>Entregados</option>
  <option>En tránsito</option>
  <option>Procesando</option>
  <option>Cancelados</option>
</select>
```

**Estados con Badges:**
```tsx
const statusVariants = {
  delivered: 'badge-success',
  shipped: 'badge-info',
  processing: 'badge-warning',
  cancelled: 'badge-danger',
};
```

#### Empty State
Si no hay pedidos:
```
┌─────────────────────────────────────┐
│     [Icono de caja vacía]           │
│                                     │
│   No has realizado pedidos aún     │
│                                     │
│   [Explorar Productos]              │
└─────────────────────────────────────┘
```

---

### 5. DETALLE DE PEDIDO (/cuenta/pedidos/[id])

**Objetivos del rediseño:**

#### Layout Completo
```
┌─────────────────────────────────────────┐
│  ← Volver    PEDIDO #FS-001234          │
│                                         │
│  ┌─────────────────┬─────────────────┐ │
│  │ TIMELINE        │   RESUMEN       │ │
│  │                 │                 │ │
│  │ ✓ Confirmado    │ Subtotal €X     │ │
│  │ ✓ Procesando    │ Envío   €X      │ │
│  │ ⊙ En tránsito   │ Total   €X      │ │
│  │ ○ Entregado     │                 │ │
│  │                 │ [Factura PDF]   │ │
│  └─────────────────┴─────────────────┘ │
│                                         │
│  PRODUCTOS                              │
│  ─────────────────────────────────────  │
│  [Lista de productos del pedido]        │
│                                         │
│  INFORMACIÓN DE ENVÍO                   │
│  ─────────────────────────────────────  │
│  [Dirección de entrega]                 │
└─────────────────────────────────────────┘
```

#### Timeline de Estado
```tsx
const orderSteps = [
  { label: 'Confirmado', date: '15 Ene, 10:30', completed: true },
  { label: 'Procesando', date: '15 Ene, 14:00', completed: true },
  { label: 'Enviado', date: '16 Ene, 09:00', completed: true },
  { label: 'Entregado', date: 'Pendiente', completed: false },
];
```

**Visualización:**
- Línea vertical conectando pasos
- Checkmarks verdes en completados
- Círculo con pulse en paso actual
- Fechas y horas legibles

#### Tracking de Envío
Si está enviado:
```
┌─────────────────────────────────────┐
│  SEGUIMIENTO                        │
│  Transportista: DHL Express         │
│  Código: DHL123456789ES            │
│                                     │
│  [Rastrear Envío →]                │
└─────────────────────────────────────┘
```

#### Acciones del Pedido
```tsx
<div className="flex gap-4">
  <button className="admin-btn-secondary">
    <FileText className="w-4 h-4" />
    Descargar Factura
  </button>
  <button className="admin-btn-secondary">
    <MessageCircle className="w-4 h-4" />
    Contactar Soporte
  </button>
  {canReturn && (
    <button className="admin-btn-danger">
      <RotateCcw className="w-4 h-4" />
      Solicitar Devolución
    </button>
  )}
</div>
```

---

### 6. PRODUCTOS (/productos)

**Objetivos del rediseño:**

#### Layout con Filtros Laterales
```
┌─────────┬───────────────────────────────┐
│ FILTROS │  PRODUCTOS       [Grid/List]  │
│         │  ───────────                  │
│ Precio  │  [Card] [Card] [Card] [Card]  │
│ [Rango] │  [Card] [Card] [Card] [Card]  │
│         │                               │
│ Talla   │  [Paginación]                 │
│ □ S     │                               │
│ □ M     │                               │
│ □ L     │                               │
│         │                               │
│ Marca   │                               │
│ ...     │                               │
└─────────┴───────────────────────────────┘
```

**Mobile: Filtros en Modal**
```
┌─────────────────────────────────────┐
│  [Filtros ⚙] [Ordenar ▼]  [Grid ≣] │
│                                     │
│  [Card]      [Card]                 │
│  [Card]      [Card]                 │
└─────────────────────────────────────┘
```

#### ProductCard Mejorado
```tsx
<div className="group relative">
  {/* Imagen con overlay en hover */}
  <div className="relative overflow-hidden rounded-lg">
    <CloudinaryImage />
    
    {/* Quick View en hover (desktop) */}
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <button className="bg-primary text-primary-foreground px-4 py-2">
        Vista Rápida
      </button>
    </div>
    
    {/* Badges */}
    <div className="absolute top-2 left-2">
      {isNew && <span className="badge-success">Nuevo</span>}
      {discount && <span className="badge-error">-{discount}%</span>}
    </div>
    
    {/* Wishlist */}
    <button className="absolute top-2 right-2">
      <Heart className="w-5 h-5" />
    </button>
  </div>
  
  {/* Info */}
  <div className="mt-3">
    <h3 className="font-medium group-hover:text-primary transition-colors">
      {product.name}
    </h3>
    <div className="flex items-center gap-2 mt-1">
      <span className="font-bold">{finalPrice}</span>
      {hasDiscount && (
        <span className="text-sm line-through text-muted-foreground">
          {originalPrice}
        </span>
      )}
    </div>
  </div>
</div>
```

#### Filtros Mejorados
- Checkboxes custom con estilo admin
- Range slider para precio
- Chips de filtros activos arriba
- "Limpiar todo" button
- Contador de resultados

---

### 7. DETALLE DE PRODUCTO (/productos/[slug])

**Objetivos del rediseño:**

#### Layout de 2 Columnas
```
┌──────────────────┬─────────────────────┐
│  GALERÍA         │  INFO               │
│  [Imagen Grande] │  Nombre Producto    │
│                  │  ★★★★☆ (24 reviews) │
│  [Mini] [Mini]   │                     │
│  [Mini] [Mini]   │  €59.99  €49.99     │
│                  │                     │
│                  │  Talla: M ⊙ L ○ XL  │
│                  │  Color: Negro       │
│                  │                     │
│                  │  [- 1 +]            │
│                  │  [AÑADIR AL CARRITO]│
│                  │                     │
│                  │  ✓ Envío gratis     │
│                  │  ✓ Devolución 30d   │
└──────────────────┴─────────────────────┘

DESCRIPCIÓN | CARACTERÍSTICAS | REVIEWS
──────────────────────────────────────
[Contenido en tabs]
```

#### Galería de Imágenes
- Imagen principal grande
- Thumbnails abajo o lateral
- Zoom en hover (desktop)
- Lightbox al click
- Swipe en móvil

#### Selector de Variantes
```tsx
// Tallas
<div className="flex gap-2">
  {sizes.map(size => (
    <button
      className={`px-4 py-2 border rounded-lg transition-all ${
        selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      {size.label}
      {size.stock === 0 && <span className="line-through" />}
    </button>
  ))}
</div>
```

#### Add to Cart CTA Mejorado
```tsx
<button className="w-full py-4 bg-primary text-primary-foreground font-heading text-lg tracking-wider hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50">
  {loading ? <Loader2 className="animate-spin" /> : 'AÑADIR AL CARRITO'}
</button>
```

#### Trust Badges
```
┌─────────────────────────────────────┐
│ [Icono] Envío gratis >50€           │
│ [Icono] Devolución gratuita 30 días│
│ [Icono] Pago seguro                 │
│ [Icono] Garantía oficial            │
└─────────────────────────────────────┘
```

#### Tabs de Información
```tsx
<Tabs defaultValue="description">
  <TabsList>
    <Tab value="description">Descripción</Tab>
    <Tab value="specs">Características</Tab>
    <Tab value="reviews">Reviews (24)</Tab>
    <Tab value="shipping">Envío</Tab>
  </TabsList>
  
  <TabContent value="description">
    {/* Rich text description */}
  </TabContent>
</Tabs>
```

#### Sección de Reviews
- Rating promedio destacado
- Distribución de estrellas (5★: 60%, 4★: 30%...)
- Reviews cards con avatar, nombre, fecha
- Filtros por estrellas
- Paginación

---

### 8. CARRITO (/carrito)

**Objetivos del rediseño:**

#### Layout de 2 Columnas
```
┌─────────────────────┬─────────────────┐
│  PRODUCTOS          │   RESUMEN       │
│  ─────────          │   ─────         │
│  [Item 1]           │   Subtotal €X   │
│  [- 1 +] [Eliminar] │   Cupón  -€X    │
│                     │   Envío  €X     │
│  [Item 2]           │   ─────────     │
│  [- 1 +] [Eliminar] │   Total  €X     │
│                     │                 │
│  [+ Cupón]          │   [CHECKOUT]    │
│                     │                 │
│  [← Seguir]         │   [PayPal]      │
└─────────────────────┴─────────────────┘
```

#### Item de Carrito Mejorado
```tsx
<div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
  {/* Imagen */}
  <img className="w-24 h-24 object-cover rounded-lg" />
  
  {/* Info */}
  <div className="flex-1">
    <h3 className="font-medium">{product.name}</h3>
    <p className="text-sm text-muted-foreground">
      Talla: {size} | Color: {color}
    </p>
    <p className="font-bold mt-1">{price}</p>
  </div>
  
  {/* Quantity */}
  <div className="flex flex-col items-end gap-2">
    <QuantitySelector value={qty} onChange={handleChange} />
    <button className="text-xs text-accent hover:underline">
      Eliminar
    </button>
  </div>
</div>
```

#### Cupón de Descuento
```tsx
<div className="border border-dashed border-border rounded-lg p-4">
  <label className="text-sm font-medium mb-2 block">
    ¿Tienes un cupón?
  </label>
  <div className="flex gap-2">
    <input 
      type="text" 
      placeholder="CODIGO"
      className="admin-input flex-1"
    />
    <button className="admin-btn-secondary">
      Aplicar
    </button>
  </div>
</div>
```

#### Resumen Sticky
- Se mantiene visible al scroll (desktop)
- Cálculo de envío dinámico
- Progress bar para envío gratis
- CTAs claros y destacados

#### Empty Cart State
```
┌─────────────────────────────────────┐
│     [Icono carrito vacío]           │
│                                     │
│   Tu carrito está vacío            │
│   ¡Descubre nuestros productos!    │
│                                     │
│   [Explorar Productos]              │
└─────────────────────────────────────┘
```

---

### 9-10. PÁGINAS LEGALES (Footer)

**Contacto, Envíos, Privacidad, Términos**

#### Template Consistente
```
┌─────────────────────────────────────┐
│  [Breadcrumb: Inicio > Contacto]    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │   TÍTULO DE LA PÁGINA         │ │
│  │   ───────────────────         │ │
│  │                               │ │
│  │   [Contenido]                 │ │
│  │                               │ │
│  │   [Secciones con headings]    │ │
│  │                               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Página de Contacto Específica
```
┌─────────────────────┬─────────────────┐
│  FORMULARIO         │   INFORMACIÓN   │
│  ─────────          │   ─────────     │
│  Nombre             │   [Icono] Email │
│  [Input]            │   info@...      │
│                     │                 │
│  Email              │   [Icono] Tel   │
│  [Input]            │   +34 ...       │
│                     │                 │
│  Mensaje            │   [Icono] Dir   │
│  [Textarea]         │   Calle...      │
│                     │                 │
│  [Enviar]           │   [Mapa?]       │
└─────────────────────┴─────────────────┘
```

**Características:**
- Formulario con validación
- Iconos de lucide-react para contacto
- Cards con info de contacto
- FAQs accordion si aplica
- Breadcrumbs en todas

---

## 🎨 COMPONENTES UI A CREAR/MEJORAR

### 1. Button Component Unificado

```tsx
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Uso:
<Button variant="primary" size="lg" loading={isLoading}>
  Añadir al Carrito
</Button>
```

### 2. Card Component

```tsx
// src/components/ui/Card.tsx
<Card className="hover:border-primary/30 transition-colors">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
  <CardFooter>
    {/* Acciones */}
  </CardFooter>
</Card>
```

### 3. Badge Component Mejorado

```tsx
// Variantes ya existen en global.css
<Badge variant="success">Entregado</Badge>
<Badge variant="warning">Procesando</Badge>
<Badge variant="error">Cancelado</Badge>
<Badge variant="info">Enviado</Badge>
```

### 4. Input Component

```tsx
// src/components/ui/Input.tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  leftIcon={<Mail className="w-4 h-4" />}
/>
```

### 5. Tabs Component

```tsx
// Para detalles de producto, perfil, etc.
<Tabs>
  <TabsList>
    <Tab>Descripción</Tab>
    <Tab>Reviews</Tab>
  </TabsList>
  <TabContent>{/* ... */}</TabContent>
</Tabs>
```

### 6. Modal Component

```tsx
// Modal reutilizable con focus trap
<Modal isOpen={isOpen} onClose={close}>
  <ModalHeader>Título</ModalHeader>
  <ModalBody>{/* ... */}</ModalBody>
  <ModalFooter>
    <Button>Aceptar</Button>
  </ModalFooter>
</Modal>
```

### 7. Skeleton Component

```tsx
// Para loading states
<Skeleton className="h-48 w-full" />
<Skeleton className="h-4 w-3/4" />
```

### 8. Empty State Component

```tsx
<EmptyState
  icon={<ShoppingBag />}
  title="No hay productos"
  description="Explora nuestro catálogo"
  action={<Button>Ver Productos</Button>}
/>
```

---

## 📱 OPTIMIZACIÓN RESPONSIVE

### Mobile (< 768px)

**Adaptaciones clave:**
- Navegación hamburger (ya implementado)
- Grids: 1 o 2 columnas máximo
- Cards full-width con padding reducido
- Forms: Labels arriba, no flotantes
- CTAs: Full-width, height 48px mínimo
- Filtros en modal/drawer
- Tabs horizontales con scroll

### Tablet (768px - 1024px)

**Adaptaciones:**
- Grids: 2-3 columnas
- Sidebar colapsable
- Forms: 2 columnas donde tenga sentido
- Híbrido entre mobile y desktop

### Desktop (> 1024px)

**Aprovecha el espacio:**
- Grids: 3-4 columnas
- Sidebar fijo visible
- Hover states completos
- Tooltips informativos
- Quick actions en hover

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. Imágenes

- ✅ Usa CloudinaryImage en todas las imágenes
- ✅ `loading="lazy"` excepto hero (`loading="eager"`)
- ✅ `sizes` attribute apropiado
- ✅ Picture element para imágenes críticas

### 2. Code Splitting

```tsx
// Lazy load componentes pesados
const Modal = lazy(() => import('./Modal'));
const Chart = lazy(() => import('./Chart'));

// Suspense con fallback
<Suspense fallback={<Skeleton />}>
  <Modal />
</Suspense>
```

### 3. Astro Islands

```tsx
// Cargar según estrategia
<Component client:load />       // Crítico
<Component client:idle />       // Cuando idle
<Component client:visible />    // Cuando visible
<Component client:media="(max-width: 768px)" /> // Condicional
```

### 4. Optimizar Re-renders

```tsx
// Memoización estratégica
const ProductCard = memo(({ product }) => {
  // ...
});

// useCallback para funciones
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## 🎯 ACCESIBILIDAD (YA IMPLEMENTADA)

**Mantén los estándares actuales:**
- ✅ Touch targets 44x44px
- ✅ Contraste WCAG AA/AAA
- ✅ ARIA attributes completos
- ✅ Focus management
- ✅ Skip links
- ✅ Screen reader support
- ✅ Keyboard navigation

**No regreses en accesibilidad:**
- Todos los botones deben ser `<button>` o `<a>`
- Imágenes con alt descriptivo
- Forms con labels
- Estados de error claros
- Loading states anunciados

---

## 🧪 TESTING Y VALIDACIÓN

### Checklist Post-Rediseño

**Funcionalidad:**
- [ ] Todas las páginas cargan sin errores
- [ ] Navegación funciona correctamente
- [ ] Forms validan y envían
- [ ] Checkout completo funciona
- [ ] Imágenes cargan optimizadas

**Responsive:**
- [ ] Mobile 375px (iPhone SE)
- [ ] Mobile 390px (iPhone 12)
- [ ] Tablet 768px (iPad)
- [ ] Desktop 1280px
- [ ] Desktop 1920px

**Navegadores:**
- [ ] Chrome (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Edge

**Performance:**
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

**Accesibilidad:**
- [ ] Navegación completa por teclado
- [ ] Screen reader (NVDA o VoiceOver)
- [ ] Contraste verificado
- [ ] Touch targets 44px

---

## 📋 ORDEN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1: Componentes Base (Semana 1)
1. Button component unificado
2. Card component
3. Input/Form components
4. Modal component
5. Tabs component

### Fase 2: Páginas Principales (Semana 2)
1. Homepage rediseño
2. Productos (catálogo + filtros)
3. Detalle de producto
4. Carrito mejorado

### Fase 3: Checkout y Cuenta (Semana 3)
1. Checkout flow completo
2. Perfil de usuario
3. Mis pedidos (lista + detalle)

### Fase 4: Footer y Polish (Semana 4)
1. Páginas del footer
2. Microinteracciones
3. Loading states
4. Empty states
5. Testing y ajustes finales

---

## 💡 TIPS FINALES

### 1. Consistencia Visual
- Usa las mismas clases del admin (`.admin-card`, `.admin-btn-*`)
- Mantén espaciado consistente
- Iconos siempre de lucide-react
- Paleta de colores del sistema de diseño

### 2. Progresividad
- Empieza por componentes base
- Construye páginas con esos componentes
- Itera sobre el diseño
- No intentes hacerlo todo perfecto de una vez

### 3. Referencia el Admin
- Revisa cómo están diseñadas las páginas de admin
- Adapta ese lenguaje visual al cliente
- Mantén la misma calidad y atención al detalle

### 4. User Feedback
- Loading states en todas las acciones
- Success/error toasts siempre
- Validación en tiempo real
- Estados disabled claros

### 5. Mobile First
- Diseña primero para móvil
- Escala hacia arriba
- Touch targets grandes
- Menos información por pantalla

---

## 🎬 RESULTADO ESPERADO

Al final del rediseño, FashionStore debe:

✅ **Verse profesional y moderno** como el área admin
✅ **Ser completamente responsive** en todos los dispositivos
✅ **Mantener accesibilidad WCAG 2.1 AA**
✅ **Tener micro-interacciones pulidas**
✅ **Cargar rápido** con imágenes optimizadas
✅ **Guiar al usuario** de forma clara hacia la conversión
✅ **Inspirar confianza** con diseño consistente
✅ **Reflejar la identidad** streetwear/urbana de la marca

---

## 📞 RECURSOS Y REFERENCIAS

### Documentación del Proyecto
- `GUIA-ACCESIBILIDAD.md` - Mantener estándares
- `CHANGELOG-MEJORAS-UI-UX.md` - Ver mejoras ya implementadas
- `src/styles/global.css` - Sistema de diseño base

### Inspiración de Diseño
- Páginas de admin del proyecto (mejores prácticas)
- Shopify Polaris Design System
- shadcn/ui components
- Vercel Design System

### Herramientas
- Lighthouse (performance)
- Figma (mockups opcionales)
- DevTools responsive mode
- ColorBox.io (contraste)

---

**¡Éxito con el rediseño! 🚀**

Crea una experiencia de usuario excepcional que haga brillar FashionStore.
