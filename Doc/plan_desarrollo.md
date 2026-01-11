# 🚀 FashionStore - Plan de Desarrollo por Fases

> Plan maestro escalable y mantenible para construir una tienda e-commerce de streetwear premium con UI/UX excepcional.

---

## 📋 Resumen Ejecutivo

Este plan divide el desarrollo en **11 fases progresivas**, cada una construyendo sobre la anterior. El enfoque es:

- **Mobile-first**: Diseño desde 320px hasta desktop
- **Escalable**: Arquitectura modular con componentes reutilizables
- **Mantenible**: Código limpio, tipado fuerte, patrones consistentes
- **UI/UX Premium**: Animaciones fluidas, microinteracciones, dark mode

---

## 📊 Progreso Actual

| Fase                | Estado        | Descripción                                    |
| ------------------- | ------------- | ---------------------------------------------- |
| 1. Setup & Database | ✅ Completada | Astro 5, React, Tailwind, Nanostores, Supabase |
| 2. Design System    | 🔲 Pendiente  | Componentes UI, layouts, header/footer         |
| 3. Catálogo         | 🔲 Pendiente  | Homepage, productos, categorías                |
| 4. Carrito          | 🔲 Pendiente  | Store, slide-over, persistencia                |
| 5. Autenticación    | 🔲 Pendiente  | Admin/cliente login, middleware                |
| 6. Panel Admin      | 🔲 Pendiente  | Dashboard, CRUD productos/pedidos              |
| 7. Checkout         | 🔲 Pendiente  | 3 pasos, Stripe, webhooks                      |
| 8. Emails           | 🔲 Pendiente  | Resend, confirmación pedido                    |
| 9. Optimización     | 🔲 Pendiente  | LCP, CLS, accesibilidad                        |
| 10. Deploy          | 🔲 Pendiente  | Docker, VPS, monitorización                    |
| 11. Extras          | 🔲 Opcional   | Guía tallas, wishlist, reviews                 |

---

## 🔧 Fase 1: Setup y Database ✅

### Completado

- [x] Proyecto Astro 5.0 (server mode)
- [x] TypeScript strict + path aliases (`@/`)
- [x] Tailwind CSS con tokens de marca (colores, fuentes, animaciones)
- [x] React + @nanostores/react
- [x] Estructura de carpetas según especificación
- [x] `.env.example` con variables
- [x] `src/lib/supabase.ts` - Cliente Supabase
- [x] `src/lib/utils.ts` - Helpers (formatPrice, cn, slugify)
- [x] `src/stores/cart.ts` - Carrito con persistencia localStorage
- [x] `src/middleware.ts` - Protección /admin y /cuenta
- [x] `src/layouts/BaseLayout.astro` - SEO, dark mode
- [x] `src/layouts/PublicLayout.astro` - Header/footer con menú mobile
- [x] `src/layouts/AdminLayout.astro` - Sidebar navegación
- [x] `src/pages/index.astro` - Homepage con hero/categorías/ofertas
- [x] `src/styles/global.css` - Fuentes Google, utilidades

### Pendiente (Manual)

- [x] Copiar `.env.example` a `.env` con credenciales reales
- [x] Ejecutar migraciones en Supabase Dashboard
- [x] Verificar RLS policies

---

## 🎨 Fase 2: Design System (Días 4-7)

### Objetivo

Crear sistema de componentes reutilizables con animaciones premium.

### Checklist

#### 2.1 Componentes UI Base

- [ ] **Button.astro/tsx** - Estados: idle, hover, loading, disabled
- [ ] **Input.astro** - Focus glow, error shake
- [ ] **Modal.astro** - Fade + scale, backdrop blur
- [ ] **Badge.astro** - Variantes colores, pulse
- [ ] **Skeleton.astro** - Shimmer animation
- [ ] **Toast.tsx** - Slide-in, auto-dismiss

#### 2.2 Header Mejorado

- [ ] Badge carrito con bounce animation
- [ ] Backdrop-blur al scroll
- [ ] CartIcon.tsx (React island)

#### 2.3 Animaciones

| Componente   | Animación       | Timing |
| ------------ | --------------- | ------ |
| Button Hover | Scale + shadow  | 150ms  |
| Modal Open   | Fade + scale    | 300ms  |
| Toast Enter  | Slide-in        | 200ms  |
| Menu Open    | Slide + stagger | 400ms  |

---

## 📦 Fase 3: Catálogo y Productos (Días 8-12)

### Checklist

- [ ] **ProductCard.astro** - Hover zoom, badge oferta, lazy loading
- [ ] **ProductGallery.astro** - Swipe mobile, thumbnails desktop
- [ ] **SizeSelector.astro** - Touch-friendly 44px, low-stock indicator
- [ ] `/productos/index.astro` - Grid + filtros
- [ ] `/productos/[slug].astro` - Detalle + añadir carrito
- [ ] `/categoria/[slug].astro` - Filtro por categoría
- [ ] **SearchOverlay.tsx** - Predictivo con debounce 300ms

---

## 🛒 Fase 4: Carrito (Días 13-15)

### Checklist

- [ ] **CartSlideOver.tsx** - Bottom sheet mobile / slide-over desktop
- [ ] **AddToCartButton.tsx** - Estados loading/success/error
- [ ] **QuantitySelector.tsx** - Botones +/- animados
- [ ] Barra progreso envío gratis
- [ ] `/carrito.astro` - Página completa

---

## 🔐 Fase 5: Autenticación (Días 16-18)

### Checklist

- [ ] `/admin/login.astro`
- [ ] `/cuenta/login.astro`
- [ ] `/cuenta/registro.astro` - Auth desde frontend
- [ ] `/cuenta/index.astro` - Dashboard cliente
- [ ] `/api/auth/login.ts`, `logout.ts`, `register.ts`

---

## ⚙️ Fase 6: Panel Admin (Días 19-23)

### Checklist

- [ ] Dashboard con stats (pedidos hoy, ingresos, stock bajo)
- [ ] CRUD productos con image uploader
- [ ] CRUD categorías
- [ ] Gestión pedidos con cambio de estado
- [ ] Configuración tienda

---

## 💳 Fase 7: Checkout y Pagos (Días 24-27)

### Checklist

- [ ] `/checkout.astro` - 3 pasos
- [ ] `/api/checkout/create-session.ts` - Stripe + reserva stock
- [ ] `/api/webhooks/stripe.ts` - checkout.session.completed/expired
- [ ] `/checkout/exito.astro` - Confetti
- [ ] `/checkout/cancelado.astro`

---

## 📧 Fase 8: Emails (Días 28-29)

- [ ] Setup Resend
- [ ] Template confirmación pedido
- [ ] Trigger desde webhook

---

## 🚀 Fase 9: Optimización (Días 30-32)

- [ ] Imágenes WebP, lazy loading
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] Lighthouse > 90 (Performance, Accessibility)
- [ ] SEO meta tags, structured data

---

## 🌐 Fase 10: Deploy (Días 33-34)

- [ ] Dockerfile multi-stage
- [ ] Deploy VPS/Coolify
- [ ] Stripe claves live
- [ ] Sentry monitorización

---

## 🎁 Fase 11: Extras Opcionales

- [ ] Guía de tallas
- [ ] Wishlist
- [ ] Reviews

---

## 🗂️ Estructura de Carpetas

```
fashionstore/
├── public/fonts/
├── src/
│   ├── components/
│   │   ├── ui/          # Button, Input, Modal, Badge, Skeleton
│   │   ├── product/     # ProductCard, ProductGallery, SizeSelector
│   │   └── islands/     # AddToCartButton, CartIcon, CartSlideOver (React)
│   ├── layouts/         # Base, Public, Admin
│   ├── lib/             # supabase, utils
│   ├── pages/           # index, productos, categoria, admin, cuenta, api
│   ├── stores/          # cart.ts
│   ├── styles/          # global.css
│   └── middleware.ts
├── migrations/          # SQL (ejecutar en Supabase)
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

> **Notas Clave:**
>
> - Auth clientes desde **frontend** (evitar bloqueo Cloudflare)
> - Diseño **mobile-first** (320px primero)
> - Costes envío visibles **antes** del checkout
> - Reserva stock: **15 minutos**
> - **Sin countdowns falsos** - FOMO honesto
