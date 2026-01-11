# 🏆 FashionStore - Especificación Completa para Reconstrucción

> Documento maestro para reconstruir la plataforma e-commerce de ropa deportiva desde cero con arquitectura sólida, UX/UI premium y lógica robusta.

---

## 1. 🎯 Visión del Proyecto

**FashionStore** es una tienda online de **ropa deportiva urbana (streetwear)** orientada a hombres. Combina estética premium con funcionalidad e-commerce completa.

### Propuesta de Valor

- **Para el cliente**: Experiencia de compra mobile-first, rápida y sin fricciones (guest checkout + cuentas opcionales)
- **Para el negocio**: Panel de administración completo con control total de inventario, pedidos y configuración
- **Diferenciador**: UX optimizada para conversión con transparencia total (costes visibles antes del checkout)

### Principios de Diseño

| Principio | Aplicación |
|-----------|------------|
| **Mobile-first** | Diseño desde 320px, adaptación progresiva a desktop |
| **Accesibilidad** | WCAG 2.1 AA mínimo, contraste 4.5:1, focus visible |
| **Transparencia** | Costes de envío visibles antes del formulario checkout |
| **Tema dual** | Dark mode por defecto con opción de tema claro |

### Identidad de Marca

| Elemento        | Especificación                                                                   |
| --------------- | -------------------------------------------------------------------------------- |
| **Estética**    | Dark mode, efectos neón, tipografía urbana bold, energía deportiva               |
| **Colores**     | Negro `#0a0a0a`, Verde neón `#CCFF00`, Coral `#FF4757`, Azul eléctrico `#3b82f6` |
| **Tipografías** | Bebas Neue (display), Oswald (headings), Space Grotesk (body)                    |
| **Tono**        | Energético, juvenil, premium, atlético                                           |

---

## 2. 🛠️ Stack Tecnológico

| Capa               | Tecnología                | Justificación                                    |
| ------------------ | ------------------------- | ------------------------------------------------ |
| **Framework**      | Astro 5.0 (hybrid mode)   | SSG para SEO (catálogo), SSR para checkout/admin |
| **Islands**        | React + @nanostores/react | Interactividad solo donde se necesita            |
| **Estilos**        | Tailwind CSS              | Desarrollo rápido, consistencia visual           |
| **Base de Datos**  | Supabase PostgreSQL       | RLS, Auth integrado, Storage, funciones SQL      |
| **Estado Cliente** | Nano Stores               | Carrito persistente en localStorage              |
| **Pagos**          | Stripe Checkout           | Seguro, webhooks, métodos múltiples              |
| **Emails**         | Resend                    | Confirmaciones automáticas                       |
| **Despliegue**     | Docker + VPS (Coolify)    | Control total, costes optimizados                |

---

## 3. 🗄️ Base de Datos - Esquema Completo

### 3.1 Tablas Principales

```sql
-- CATEGORÍAS
categories (
  id UUID PK,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ
)

-- PRODUCTOS
products (
  id UUID PK,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  offer_price NUMERIC(10,2) NULL,  -- Precio especial si is_offer=true
  category_id UUID FK → categories,
  active BOOLEAN DEFAULT true,
  is_offer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- VARIANTES (Stock por Talla)
product_variants (
  id UUID PK,
  product_id UUID FK → products CASCADE,
  size TEXT NOT NULL,              -- XS, S, M, L, XL, XXL
  stock INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, size)
)

-- IMÁGENES
product_images (
  id UUID PK,
  product_id UUID FK → products CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,       -- Para ordenar galería
  created_at TIMESTAMPTZ
)

-- PEDIDOS
orders (
  id UUID PK,
  customer_id UUID FK → auth.users NULL,  -- NULL = guest checkout
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'España',
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ
)

-- ITEMS DEL PEDIDO
order_items (
  id UUID PK,
  order_id UUID FK → orders CASCADE,
  product_id UUID FK → products,
  variant_id UUID FK → product_variants,
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL  -- Snapshot del precio
)

-- CONFIGURACIÓN GLOBAL
settings (
  key TEXT PK,
  value_text TEXT,
  value_bool BOOLEAN,
  value_number NUMERIC,
  description TEXT
)

-- PERFILES DE CLIENTE
customer_profiles (
  id UUID PK FK → auth.users CASCADE,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  default_postal_code TEXT,
  default_country TEXT DEFAULT 'España',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- GUÍA DE TALLAS (FASE FINAL)
size_guides (
  id UUID PK,
  category_id UUID FK → categories NULL,  -- NULL = guía global
  size TEXT NOT NULL,
  chest_cm INTEGER,
  waist_cm INTEGER,
  hip_cm INTEGER,
  length_cm INTEGER,
  notes TEXT
)
```

### 3.2 Funciones RPC (SECURITY DEFINER)

| Función                                 | Propósito                                  |
| --------------------------------------- | ------------------------------------------ |
| `reserve_stock(variant_id, quantity)`   | Reserva atómica de stock al crear checkout |
| `restore_stock(variant_id, quantity)`   | Restaura stock si checkout expira/cancela  |
| `create_checkout_order(...)`            | Crea pedido + items en transacción         |
| `update_order_status(order_id, status)` | Actualiza estado desde webhook             |
| `get_order_by_session(session_id)`      | Obtiene pedido por Stripe session          |
| `get_order_items(order_id)`             | Obtiene items de un pedido                 |
| `get_customer_orders(customer_id)`      | Historial de pedidos del cliente           |
| `get_customer_profile()`                | Perfil del cliente autenticado             |
| `upsert_customer_profile(...)`          | Crear/actualizar perfil                    |
| `get_size_guide(category_id)`           | Obtiene guía de tallas por categoría (fase final) |

### 3.3 Políticas RLS

| Tabla             | Anon                 | Authenticated Customer | Admin      |
| ----------------- | -------------------- | ---------------------- | ---------- |
| categories        | SELECT               | SELECT                 | FULL       |
| products          | SELECT (active=true) | SELECT (active=true)   | FULL       |
| product_variants  | SELECT               | SELECT                 | FULL       |
| product_images    | SELECT               | SELECT                 | FULL       |
| orders            | SELECT by session_id | SELECT own orders      | FULL       |
| order_items       | -                    | SELECT own             | FULL       |
| customer_profiles | -                    | SELECT/UPDATE own      | SELECT all |
| settings          | SELECT               | SELECT                 | FULL       |
| size_guides       | SELECT               | SELECT                 | FULL       |

---

## 4. 📱 Arquitectura de Páginas

### 4.1 Tienda Pública (SSG/SSR)

| Ruta                  | Renderizado | Descripción                                                        |
| --------------------- | ----------- | ------------------------------------------------------------------ |
| `/`                   | SSG         | Homepage con hero, categorías, ofertas flash, productos destacados |
| `/productos`          | SSG         | Catálogo con filtros (categoría, precio, ofertas) y ordenamiento   |
| `/productos/[slug]`   | SSG         | Detalle de producto con galería, selector talla, añadir al carrito |
| `/categoria/[slug]`   | SSG         | Productos filtrados por categoría                                  |
| `/carrito`            | SSR         | Página completa del carrito con resumen                            |
| `/checkout`           | SSR         | Formulario de datos + redirect a Stripe                            |
| `/checkout/exito`     | SSR         | Confirmación post-pago                                             |
| `/checkout/cancelado` | SSR         | Mensaje de pago cancelado                                          |

### 4.2 Área de Cliente (SSR + Protegida)

| Ruta                   | Descripción                          |
| ---------------------- | ------------------------------------ |
| `/cuenta/login`        | Login de cliente                     |
| `/cuenta/registro`     | Registro de cliente                  |
| `/cuenta`              | Dashboard con historial de pedidos   |
| `/cuenta/pedidos/[id]` | Detalle de un pedido                 |
| `/cuenta/perfil`       | Editar datos y dirección por defecto |

### 4.3 Panel Admin (SSR + Protegido)

| Ruta                     | Descripción                              |
| ------------------------ | ---------------------------------------- |
| `/admin/login`           | Login de administrador                   |
| `/admin`                 | Dashboard con métricas y accesos rápidos |
| `/admin/productos`       | Lista de productos con búsqueda/filtros  |
| `/admin/productos/nuevo` | Crear producto con imágenes y variantes  |
| `/admin/productos/[id]`  | Editar producto existente                |
| `/admin/categorias`      | CRUD de categorías                       |
| `/admin/pedidos`         | Lista de pedidos con filtro por estado   |
| `/admin/pedidos/[id]`    | Detalle y cambio de estado               |
| `/admin/configuracion`   | Settings de la tienda                    |

---

## 5. 🛒 Flujos de Usuario

### 5.1 Flujo de Compra (Guest)

```
Navegar catálogo → Seleccionar producto → Elegir talla → Añadir al carrito
       ↓
Ver carrito → Proceder checkout → Formulario datos → Stripe Payment
       ↓
[Stripe Webhook] → Pedido = "paid" → Email confirmación → Página éxito
```

### 5.2 Flujo de Compra (Cliente Registrado)

```
Login → Navegar → Añadir al carrito → Checkout (datos pre-llenados)
       ↓
Pago → Pedido vinculado a cuenta → Visible en historial
```

### 5.3 Reserva de Stock (Anti Race Condition)

```
1. Usuario hace checkout → reserve_stock() decrementa stock atómicamente
2. Usuario va a Stripe → tiene 15 min para pagar (reducido para evitar bloqueos)
3. Si paga → stock ya está decrementado ✓
4. Si expira/cancela → restore_stock() devuelve el stock
```

---

## 6. 🎨 UX/UI Guidelines (Mobile-First)

### 6.1 Sistema de Diseño Base

| Token | Mobile | Desktop | Notas |
|-------|--------|---------|-------|
| **Breakpoints** | 320px base | 768px (md), 1024px (lg), 1280px (xl) | Diseño desde móvil |
| **Touch targets** | Mínimo 44x44px | 36x36px permitido | Accesibilidad táctil |
| **Espaciado base** | 16px (1rem) | Escala progresiva | Consistencia |
| **Tipografía body** | 16px mínimo | 16-18px | Legibilidad móvil |
| **Contraste** | 4.5:1 mínimo | 4.5:1 mínimo | WCAG AA |

### 6.2 Homepage - Estructura Mobile-First

```
┌─────────────────────────────────┐
│  [HEADER STICKY]                │
│  Logo | ☰ Menu | 🔍 | 🛒(3)     │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │    HERO IMAGEN/GIF     │    │  ← NO video (mejor LCP)
│  │    (aspect-ratio 4:5)  │    │
│  │                        │    │
│  │  "NUEVA COLECCIÓN"     │    │
│  │  [CTA PRINCIPAL]       │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  📦 Envío gratis +50€           │  ← Trust bar sticky
│  🔄 30 días devolución          │
│  🔒 Pago 100% seguro            │
├─────────────────────────────────┤
│  CATEGORÍAS          [Ver más]  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │  ← Scroll horizontal
│  │    │ │    │ │    │ │    │   │    con indicadores
│  └────┘ └────┘ └────┘ └────┘   │
│  ● ○ ○ ○                        │
├─────────────────────────────────┤
│  🔥 OFERTAS           [Ver más] │
│  (badge -20%, SIN countdown)    │  ← FOMO honesto
│  [Card] [Card] [Card]           │
├─────────────────────────────────┤
│  NOVEDADES                      │
│  Grid 2 columnas                │
│  [Card] [Card]                  │
│  [Card] [Card]                  │
├─────────────────────────────────┤
│  [FOOTER]                       │
└─────────────────────────────────┘
```

### 6.3 Producto - Optimizado para Conversión

| Elemento | Mobile | Desktop |
|----------|--------|--------|
| **Galería** | Swipe horizontal + indicadores dots + tap para lightbox con pinch-zoom | Thumbnails laterales + hover zoom |
| **Selector Talla** | Botones grandes (44px altura), "Pocas unidades" si stock < 5, tallas agotadas deshabilitadas | Igual + hover states |
| **CTA** | Botón full-width sticky en bottom, estados: idle → loading → success → error | Botón grande en sidebar |
| **Precios** | Precio actual grande, tachado pequeño arriba si oferta | Igual |

```
Selector de Talla:
┌─────────────────────────────────────────┐
│  Talla                                  │
├─────────────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│  │ S │ │ M │ │ L │ │XL │ │XXL│        │
│  │ ✓ │ │ ✓ │ │⚡2│ │ ✓ │ │ ✕ │        │
│  └───┘ └───┘ └───┘ └───┘ └───┘        │
│                                         │
│  ⚡ Últimas 2 unidades en talla L       │
│  ✕ = Agotado (deshabilitado)            │
└─────────────────────────────────────────┘
```

### 6.4 Carrito - Flujo sin Fricciones

| Componente | Mobile | Desktop |
|------------|--------|--------|
| **Mini-cart** | Bottom sheet (swipe up) | Slide-over derecha |
| **Icono header** | Badge con cantidad visible | Badge con cantidad |
| **Edición cantidad** | Botones +/- grandes (44px) | Botones +/- o input |
| **Eliminar** | Swipe left → botón rojo | Icono 🗑️ |
| **Envío preview** | Calculadora CP visible ANTES de checkout | Sidebar con cálculo |
| **Upsell** | "Añade X€ para envío gratis" con barra progreso | Igual |

```
Carrito Mobile (Bottom Sheet):
┌─────────────────────────────────┐
│  ══════════════════ (handle)   │
│  TU CARRITO (3)         [✕]    │
├─────────────────────────────────┤
│  [img] Producto 1               │
│        Talla M                  │
│        45.00€                   │
│        [-] 1 [+]    ← swipe 🗑️ │
├─────────────────────────────────┤
│  📍 Calcular envío:             │
│  [CP: _____] [Calcular]         │
│  Envío: 4.95€ (o GRATIS +50€)   │
├─────────────────────────────────┤
│  💡 Añade 5€ más = envío GRATIS │
│  [████████████░░░] 45€/50€      │
├─────────────────────────────────┤
│  TOTAL: 49.95€                  │
│  [    IR AL CHECKOUT    ]       │  ← Sticky bottom
└─────────────────────────────────┘
```

### 6.5 Checkout - Transparencia Total

```
Paso 1: RESUMEN (Mobile)
┌─────────────────────────────────┐
│  [1]────[2]────[3]              │
│  Resumen  Datos   Pago          │
├─────────────────────────────────┤
│  [img] Producto 1 x1      45€   │
│  [img] Producto 2 x1      75€   │
├─────────────────────────────────┤
│  Subtotal:              120.00€ │
│  Envío:                   4.95€ │
│  ───────────────────────────    │
│  TOTAL:                124.95€  │
├─────────────────────────────────┤
│  [    CONTINUAR →    ]          │
└─────────────────────────────────┘

Paso 2: DATOS ENVÍO
┌─────────────────────────────────┐
│  Email* (para confirmación)     │
│  [_________________________]    │
│                                 │
│  Nombre completo*               │
│  [_________________________]    │
│                                 │
│  Teléfono                       │
│  [_________________________]    │
│                                 │
│  Dirección*                     │
│  [_________________________]    │
│                                 │
│  CP*          Ciudad*           │
│  [______]     [_____________]   │
│                                 │
│  [ ] Guardar para próximas      │
│      compras (clientes)         │
├─────────────────────────────────┤
│  [← Volver]  [CONTINUAR →]      │
└─────────────────────────────────┘

Paso 3: PAGO (Redirect a Stripe)
┌─────────────────────────────────┐
│  Resumen de tu pedido           │
│  ─────────────────────────      │
│  2 productos            120.00€ │
│  Envío                    4.95€ │
│  TOTAL                 124.95€  │
│                                 │
│  Envío a:                       │
│  Juan García                    │
│  Calle Mayor 123                │
│  28001 Madrid                   │
│                                 │
│  [  PAGAR CON STRIPE  ]         │
│                                 │
│  🔒 Serás redirigido a Stripe   │
│     para completar el pago      │
│     de forma segura             │
└─────────────────────────────────┘
```

### 6.6 Header Mobile

```
┌─────────────────────────────────┐
│  [☰]  [LOGO]      [🔍] [🛒3]    │
└─────────────────────────────────┘
        ↓ Tap ☰
┌─────────────────────────────────┐
│  [✕]                            │
│  ─────────────────────────      │
│  🏠 Inicio                      │
│  👕 Productos                   │
│  🔥 Ofertas                     │
│  ─────────────────────────      │
│  👤 Mi Cuenta                   │
│  📦 Mis Pedidos                 │
│  ─────────────────────────      │
│  [🌙/☀️ Cambiar tema]           │
│  ─────────────────────────      │
│  📞 Contacto                    │
│  📄 Términos y Condiciones      │
└─────────────────────────────────┘
```

### 6.7 Buscador Predictivo

| Aspecto | Especificación |
|---------|---------------|
| **Trigger** | Click en 🔍 → Overlay fullscreen (mobile) / Dropdown (desktop) |
| **Debounce** | 300ms antes de buscar |
| **Caché** | 5 minutos para términos frecuentes |
| **Resultados** | Máximo 5 productos con thumbnail + precio |
| **Sin resultados** | "No encontramos '[término]'. ¿Buscabas...?" + sugerencias |
| **Búsquedas populares** | Mostrar al abrir sin query |

### 6.8 Admin - Productividad

| Principio | Aplicación |
|-----------|------------|
| **Clarity** | Tablas limpias, badges de estado con colores semánticos |
| **Efficiency** | Acciones en fila, búsqueda instantánea, bulk actions |
| **Feedback** | Toast notifications, loading states, confirmaciones destructivas |
| **Responsive** | Sidebar colapsable en móvil, tablas con scroll horizontal |
| **Dark/Light** | Tema independiente del público (preferencia de admin) |

---

## 7. 🔐 Autenticación

### 7.1 Tipos de Usuario

| Rol         | Permisos                                                          |
| ----------- | ----------------------------------------------------------------- |
| **Anónimo** | Navegar catálogo, usar carrito, guest checkout                    |
| **Cliente** | Todo lo anterior + crear cuenta, ver historial, guardar dirección |
| **Admin**   | Acceso completo al panel de administración                        |

### 7.2 Implementación

- **Método**: Email + Password via Supabase Auth
- **Diferenciación**: `user_metadata.is_admin = true/false`
- **Middleware**: Protege `/admin/*` (solo admins) y `/cuenta/*` (solo autenticados)
- **Cookies**: `sb-access-token` y `sb-refresh-token` (httpOnly)

---

## 8. 💳 Pagos (Stripe)

### 8.1 Flujo

1. **Frontend** → API route con datos de checkout
2. **Backend** → Reserva stock, crea pedido "pending", crea Stripe Session
3. **Redirect** → Usuario paga en Stripe Checkout
4. **Webhook** → `checkout.session.completed` actualiza pedido a "paid"
5. **Email** → Confirmación automática via Resend

### 8.2 Métodos de Pago

- Tarjeta (Apple Pay / Google Pay incluidos)
- PayPal
- Klarna (compra ahora, paga después)

### 8.3 Webhooks Críticos

| Evento                       | Acción                               |
| ---------------------------- | ------------------------------------ |
| `checkout.session.completed` | Pedido → "paid", trigger email       |
| `checkout.session.expired`   | restore_stock(), opcional: notificar |

---

## 9. ⚙️ Configuración de Tienda

### 9.1 Settings Dinámicos

| Key                       | Tipo   | Uso                                  |
| ------------------------- | ------ | ------------------------------------ |
| `offers_enabled`          | bool   | Mostrar/ocultar Flash Offers en home |
| `store_name`              | text   | Nombre en header/footer/emails       |
| `store_email`             | text   | Email de contacto                    |
| `store_phone`             | text   | Teléfono de contacto                 |
| `store_address`           | text   | Dirección física                     |
| `shipping_base_price`     | number | Coste envío estándar                 |
| `shipping_free_threshold` | number | Pedido mínimo para envío gratis      |
| `tax_rate`                | number | IVA (0 = no mostrar)                 |
| `social_instagram`        | text   | URL Instagram                        |
| `social_twitter`          | text   | URL Twitter/X                        |
| `social_tiktok`           | text   | URL TikTok                           |
| `low_stock_threshold`     | number | Umbral para mostrar "Pocas unidades" (default: 5) |

---

## 10. 📧 Emails Transaccionales

### 10.1 Email de Confirmación de Pedido

```
Asunto: ¡Pedido confirmado! #ORDER_ID

Contenido:
- Logo tienda
- Saludo personalizado
- Número de pedido
- Lista de items (imagen, nombre, talla, cantidad, precio)
- Dirección de envío
- Total pagado
- Próximos pasos
- Contacto tienda
```

---

## 11. 📊 Métricas Dashboard Admin

| Métrica | Cálculo |
|---------|--------|
| Pedidos Hoy | COUNT donde fecha = hoy |
| Ingresos Semana | SUM(total) donde fecha >= 7 días |
| Productos Activos | COUNT donde active = true |
| Stock Bajo | COUNT variantes donde stock < threshold |

---

## 12. 🔧 Variables de Entorno

```env
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
PUBLIC_SITE_URL=
NODE_ENV=
```

---

## 13. 📁 Estructura de Proyecto Recomendada

```
src/
├── components/
│   ├── ui/           # Button, Input, Modal, Badge, Skeleton, Toast, ProgressBar
│   ├── product/      # ProductCard, ProductGallery, SizeSelector, SizeGuideModal
│   ├── cart/         # CartItem, CartSlideOver, CartSummary, ShippingCalculator, FreeShippingProgress
│   ├── checkout/     # CheckoutForm, CheckoutSteps, OrderSummary
│   ├── search/       # SearchOverlay, SearchResults, PopularSearches
│   ├── auth/         # LoginForm, RegisterForm, AccountIcon
│   └── admin/        # Sidebar, DataTable, StatsCard
├── layouts/
│   ├── BaseLayout.astro
│   ├── PublicLayout.astro
│   └── AdminLayout.astro
├── pages/
│   ├── index.astro
│   ├── productos/
│   ├── categoria/
│   ├── carrito.astro
│   ├── checkout.astro
│   ├── cuenta/
│   ├── admin/
│   └── api/
│       ├── auth/
│       ├── checkout/
│       ├── customer/
│       └── webhooks/
├── stores/
│   └── cart.ts
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── utils.ts
└── middleware.ts
```

---

## 14. ✅ Checklist de Desarrollo

### Fase 1: Setup y Database

- [ ] Proyecto Astro + Tailwind + React
- [ ] Supabase: tablas principales
- [ ] RLS: políticas para todas las tablas
- [ ] Funciones RPC
- [ ] Storage: bucket product-images
- [ ] Índices de BD para queries frecuentes
- [ ] Datos seed

### Fase 2: Frontend Base (Mobile-First)

- [ ] Layouts (Base, Public, Admin) con soporte tema dual
- [ ] Componentes UI reutilizables con touch targets 44px
- [ ] Header mobile con menú hamburguesa
- [ ] Header desktop con navegación expandida
- [ ] Footer con redes sociales dinámicas
- [ ] Sistema de breakpoints y spacing consistente
- [ ] Focus states accesibles (outline visible)

### Fase 3: Catálogo

- [ ] Homepage mobile-first (hero imagen, NO video)
- [ ] Trust bar con iconos envío/devolución/seguridad
- [ ] Categorías con scroll horizontal + indicadores
- [ ] Ofertas con badge descuento (SIN countdown falso)
- [ ] Grid productos responsive (2 cols mobile, 4 desktop)
- [ ] Listado productos con filtros
- [ ] Detalle producto con galería swipe (mobile) / hover (desktop)
- [ ] Selector tallas con indicador de stock bajo
- [ ] Buscador predictivo con debounce 300ms

### Fase 4: Carrito

- [ ] Store Nano Stores con persistencia localStorage
- [ ] Bottom sheet mobile / Slide-over desktop
- [ ] Badge cantidad en icono header
- [ ] Edición cantidad con botones +/- grandes
- [ ] Swipe to delete (mobile)
- [ ] Calculadora de envío visible (ANTES de checkout)
- [ ] Barra progreso "X€ para envío gratis"
- [ ] Validación de stock en tiempo real

### Fase 5: Autenticación

- [ ] Admin login + middleware (no accesible sin /admin)
- [ ] Cliente registro/login (DESDE FRONTEND)
- [ ] Área de cliente con historial
- [ ] Perfil con dirección por defecto

### Fase 6: Panel Admin

- [ ] Dashboard con métricas
- [ ] CRUD productos con upload imágenes
- [ ] CRUD categorías
- [ ] Gestión pedidos
- [ ] Configuración

### Fase 7: Checkout (Transparencia)

- [ ] Checkout en 3 pasos claros con indicador progreso
- [ ] Paso 1: Resumen con total visible
- [ ] Paso 2: Formulario datos envío
- [ ] Paso 3: Confirmación + redirect Stripe
- [ ] Integración Stripe Checkout
- [ ] Webhooks (completed + expired)
- [ ] Reserva atómica de stock (15 min)
- [ ] Páginas éxito/error

### Fase 8: Emails

- [ ] Template confirmación de pedido
- [ ] Integración Resend

### Fase 9: Optimización

- [ ] Imágenes optimizadas (WebP, lazy loading)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1
- [ ] Accesibilidad: audit Lighthouse > 90
- [ ] SEO: meta tags, structured data

### Fase 10: Deploy

- [ ] Docker
- [ ] Deploy en producción
- [ ] Webhooks Stripe producción
- [ ] Backup automático BD
- [ ] Monitorización errores (Sentry o similar)

### Fase 11: Guía de Tallas (FINAL - Opcional)

- [ ] Tabla `size_guides` en Supabase
- [ ] Función RPC `get_size_guide(category_id)`
- [ ] Ruta `/guia-tallas`
- [ ] Modal guía de tallas en selector de producto
- [ ] CRUD guía de tallas en admin

---

> **Notas Importantes**:
> - Para la autenticación de clientes, usar `supabase.auth.signUp()` **desde el frontend (React)** en lugar del backend, ya que Cloudflare puede bloquear requests server-side a Supabase Auth.
> - El diseño es **mobile-first**: siempre desarrollar primero para 320px y escalar hacia arriba.
> - Los **costes de envío deben ser visibles** en el carrito, antes de iniciar el checkout, para evitar abandonos.
> - La reserva de stock es de **15 minutos** (no 30) para evitar bloqueos innecesarios.
> - Nunca usar **countdowns falsos** que se reinician; el FOMO debe ser honesto ("Pocas unidades").
