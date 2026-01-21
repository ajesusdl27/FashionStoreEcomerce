# Prompt: Rediseño y Optimización Frontend Admin - FashionStore

**Fecha:** 21 de Enero, 2026  
**Proyecto:** FashionStore - Sistema de Gestión Empresarial  
**Objetivo:** Auditoría, mejoras y estandarización del panel de administración con enfoque en eficiencia operativa y UX profesional

---

## 🎯 CONTEXTO Y OBJETIVO

Eres un experto en diseño UI/UX y desarrollo frontend especializado en **paneles de administración empresariales**. Tu tarea es **auditar, optimizar y estandarizar completamente el área de administración de FashionStore**, una tienda de streetwear premium.

**Objetivo principal:** Crear un panel de administración profesional, eficiente y consistente que permita gestionar todos los aspectos del negocio de forma intuitiva, manteniendo la identidad visual de la marca (neon green #CCFF00, diseño urbano/streetwear).

---

## 📋 PÁGINAS DEL PANEL ADMIN

### Páginas Core (CRÍTICAS)

1. **Dashboard (`/admin`)** - Vista general con KPIs y analytics
2. **Productos (`/admin/productos`)** - Gestión de catálogo
3. **Detalle/Editar Producto (`/admin/productos/[id]`)** - CRUD producto
4. **Nuevo Producto (`/admin/productos/nuevo`)** - Creación producto
5. **Pedidos (`/admin/pedidos`)** - Gestión de pedidos
6. **Detalle de Pedido (`/admin/pedidos/[id]`)** - Vista individual pedido

### Páginas de Gestión (IMPORTANTES)

7. **Categorías (`/admin/categorias`)** - CRUD categorías
8. **Cupones (`/admin/cupones`)** - Gestión de descuentos
9. **Promociones (`/admin/promociones`)** - Campañas promocionales
10. **Nueva Promoción (`/admin/promociones/nueva`)** - Wizard de promociones
11. **Calendario Promociones (`/admin/promociones/calendario`)** - Vista calendario
12. **Devoluciones (`/admin/devoluciones`)** - Gestión de returns

### Páginas de Comunicación (SECUNDARIAS)

13. **Newsletter (`/admin/newsletter`)** - Dashboard newsletter
14. **Suscriptores (`/admin/newsletter/subscribers`)** - Lista suscriptores
15. **Nueva Newsletter (`/admin/newsletter/new`)** - Editor newsletter
16. **Enviar Newsletter (`/admin/newsletter/send/[id]`)** - Programación envíos

### Páginas de Configuración (UTILIDAD)

17. **Configuración (`/admin/configuracion`)** - Settings generales
18. **Login Admin (`/admin/login`)** - Autenticación admin

---

## 🎨 SISTEMA DE DISEÑO ACTUAL

### Paleta de Colores

```css
/* Modo Claro */
--primary: 84 85% 35%; /* Verde oscuro para legibilidad */
--primary-foreground: 0 0% 100%; /* Blanco en botones */
--accent: 351 100% 63.5%; /* Rojo #FF4757 */
--muted-foreground: 240 5% 30%; /* Gris oscuro - WCAG AAA */
--background: 0 0% 100%; /* Blanco */
--card: 0 0% 100%; /* Blanco */

/* Modo Oscuro */
--primary: 84 100% 50%; /* Neon Green #CCFF00 */
--primary-foreground: 240 10% 3.9%; /* Negro en botones */
--accent: 351 100% 63.5%; /* Rojo */
--background: 240 10% 3.9%; /* Negro suave */
--card: 240 3.7% 15.9%; /* Card oscuro */
--muted: 240 3.7% 20%; /* Fondo secciones */
--border: 240 3.7% 25%; /* Bordes visibles */
```

### Componentes Base Existentes

**Clases CSS utilitarias:**
- `.admin-card` - Cards sólidas con bordes
- `.admin-card-interactive` - Cards con hover states
- `.stat-card` - Cards de estadísticas
- `.admin-table` - Tablas con filas alternadas
- `.badge-*` - Badges de estado (success, warning, danger, info)
- `.admin-btn-*` - Sistema de botones
- `.admin-input` - Inputs consistentes
- `.admin-select` - Selects estilizados
- `.glass` - Glassmorphism sutil

**Componentes React (islands/):**
- `KPICard.tsx` - Tarjetas de métricas con trends
- `SalesChart.tsx` - Gráfico de ventas
- `LogoUploader.tsx` - Subida de logo
- `PromotionWizard.tsx` - Wizard de promociones
- `PromotionCalendar.tsx` - Vista calendario
- `RuleBuilder.tsx` - Constructor de reglas
- `WysiwygEditor.tsx` - Editor rich text
- `ImageUploader.tsx` - Subida de imágenes
- `Toast.tsx` - Notificaciones

**Componentes UI genéricos:**
- `Card.tsx` - Card base
- `Modal.astro` - Modales
- `ConfirmModal.tsx` - Modal de confirmación
- `EmptyState.tsx` - Estados vacíos
- `Tabs.tsx` - Sistema de tabs
- `Select.tsx` - Select mejorado
- `Skeleton.astro` - Loading skeletons

---

## 🔍 AUDITORÍA INICIAL REQUERIDA

Antes de implementar mejoras, **analiza exhaustivamente** el código actual:

### 1. Arquitectura Admin Actual

```bash
# Estructura de archivos
src/
├── pages/admin/
│   ├── index.astro                    # Dashboard
│   ├── login.astro                    # Login
│   ├── productos/
│   │   ├── index.astro                # Lista productos
│   │   ├── [id].astro                 # Editar producto
│   │   └── nuevo.astro                # Crear producto
│   ├── pedidos/
│   │   ├── index.astro                # Lista pedidos
│   │   └── [id].astro                 # Detalle pedido
│   ├── categorias/index.astro
│   ├── cupones/index.astro
│   ├── promociones/
│   │   ├── index.astro
│   │   ├── nueva.astro
│   │   ├── editar/[id].astro
│   │   ├── calendario.astro
│   │   └── historial.astro
│   ├── devoluciones/
│   │   ├── index.astro
│   │   └── [id].astro
│   ├── newsletter/
│   │   ├── index.astro
│   │   ├── subscribers.astro
│   │   ├── new.astro
│   │   ├── edit/[id].astro
│   │   └── send/[id].astro
│   └── configuracion/index.astro
├── layouts/AdminLayout.astro           # Layout principal
└── components/
    ├── islands/admin/                  # Componentes React admin
    └── ui/                            # Componentes UI base
```

### 2. Componentes a Auditar

**Layout:**
- `AdminLayout.astro` - Sidebar, topbar, navegación
  - Sidebar desktop fijo (w-72)
  - Sidebar mobile con overlay
  - Topbar sticky con breadcrumb
  - User menu y logout

**Dashboard (index.astro):**
- [ ] KPI cards: Pedidos hoy, ingresos, productos, categorías, suscriptores
- [ ] Analytics: Ventas del mes, pedidos pendientes, producto más vendido
- [ ] Sales chart: Ventas últimos 7 días
- [ ] Recent orders table
- [ ] Low stock alerts
- [ ] Quick actions grid

**Tablas de Datos:**
- [ ] Productos: Grid/List view, filtros, búsqueda, paginación
- [ ] Pedidos: Estados, filtros por fecha, búsqueda, acciones rápidas
- [ ] Devoluciones: Timeline, estados, aprobaciones

**Formularios:**
- [ ] Productos: Multi-step, variantes, imágenes, SEO
- [ ] Cupones: Validaciones, restricciones
- [ ] Promociones: Wizard con preview

### 3. Análisis de Consistencia

**Evalúa:**
- [ ] ¿Todas las páginas usan `.admin-card`?
- [ ] ¿Los botones siguen `.admin-btn-*`?
- [ ] ¿Las tablas usan `.admin-table`?
- [ ] ¿Los badges son consistentes?
- [ ] ¿Los espaciados son uniformes? (`p-6`, `gap-6`, etc.)
- [ ] ¿Los iconos son de lucide-react?
- [ ] ¿Los estados de loading existen?
- [ ] ¿Los errores se muestran claramente?
- [ ] ¿Los success states tienen feedback?

---

## 📐 PRINCIPIOS DE DISEÑO ADMIN

### 1. Eficiencia Operativa

**Prioriza la velocidad de trabajo:**
- Acciones rápidas accesibles (editar, eliminar, duplicar)
- Atajos de teclado para acciones comunes
- Bulk actions para operaciones masivas
- Quick filters y búsqueda instantánea
- Loading states no bloqueantes
- Auto-save en formularios largos

**Ejemplo de acciones rápidas:**
```tsx
// ❌ ANTES - Acciones ocultas o lentas
<td>
  <a href={`/admin/productos/${id}`}>Ver</a>
</td>

// ✅ DESPUÉS - Acciones rápidas visibles
<td>
  <div className="flex items-center gap-2">
    <button className="admin-btn-icon" title="Editar">
      <Edit className="w-4 h-4" />
    </button>
    <button className="admin-btn-icon" title="Duplicar">
      <Copy className="w-4 h-4" />
    </button>
    <button className="admin-btn-icon text-red-500" title="Eliminar">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</td>
```

### 2. Jerarquía de Información Clara

**Usa datos estratégicamente:**
- KPIs destacados arriba (métricas principales)
- Datos secundarios en secciones colapsables
- Visualizaciones (charts) para tendencias
- Tablas para datos detallados
- Badges para estados rápidos
- Tooltips para info adicional

**Escalas de importancia:**
```
KPIs: text-4xl font-bold (pedidos hoy, ingresos)
Sección headers: text-xl font-heading
Subsecciones: text-lg font-medium
Body: text-base
Metadata: text-sm text-muted-foreground
```

### 3. Feedback Inmediato

**Todos los estados deben ser visibles:**
- **Loading**: Spinners, skeletons, disabled buttons
- **Success**: Toast verde, checkmark, animación
- **Error**: Toast rojo, mensaje claro, sugerencias
- **Warning**: Badge amarillo, icono de alerta
- **Info**: Badge azul, tooltip informativo

**Estados en botones:**
```tsx
<button 
  disabled={isLoading}
  className="admin-btn-primary"
>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Guardando...
    </>
  ) : (
    <>
      <Save className="w-4 h-4" />
      Guardar Producto
    </>
  )}
</button>
```

### 4. Consistencia Visual Total

**Aplica el sistema de diseño uniformemente:**
- Todas las páginas deben sentirse parte de un todo
- Mismo espaciado, mismo estilo de cards, mismos botones
- Iconos siempre de lucide-react
- Colores solo de la paleta definida
- Tipografía: display para títulos, heading para secciones, body para texto

**Checklist de consistencia:**
```
✓ Cards: .admin-card con p-6
✓ Spacing: gap-6 entre secciones, gap-4 entre elementos
✓ Buttons: admin-btn-primary, admin-btn-secondary, admin-btn-danger
✓ Tables: admin-table con hover states
✓ Badges: badge-success, badge-warning, badge-danger, badge-info
✓ Inputs: admin-input con focus ring
✓ Icons: lucide-react, w-4 h-4 en botones, w-5 h-5 en navegación
```

### 5. Responsive para Trabajo en Escritorio

**Desktop-first approach (opuesto al cliente):**
- Diseña para pantallas grandes (1280px+)
- Sidebar fijo visible
- Tablas con todas las columnas
- Multi-columna para formularios
- Adapta a tablet (768px+) con sidebar colapsable
- Móvil (< 768px) con sidebar overlay y layout simplificado

**Breakpoints:**
```css
Desktop: 1024px+ (layout completo, sidebar fijo)
Tablet: 768px-1023px (layout adaptado, sidebar colapsable)
Mobile: < 768px (layout simplificado, sidebar overlay)
```

### 6. Accesibilidad Empresarial

**Mantén estándares profesionales:**
- Contraste WCAG AA mínimo (AAA si posible)
- Focus visible en todos los interactivos
- Keyboard navigation completa
- ARIA labels en iconos
- Screen reader support
- Touch targets 44x44px (uso en tablets)

---

## 🎯 MEJORAS POR PÁGINA

### 1. DASHBOARD (/admin)

**Estado Actual:**
- ✅ KPI cards con iconos y valores
- ✅ Analytics con trends
- ✅ Sales chart últimos 7 días
- ✅ Recent orders table
- ✅ Low stock alerts
- ✅ Quick actions grid

**Mejoras a Implementar:**

#### KPIs Mejorados
```
┌─────────────────────────────────────────┐
│  [Icono]  PEDIDOS HOY                   │
│           24                            │
│           ↑ 5 vs ayer                   │
└─────────────────────────────────────────┘
```

**Añadir:**
- [ ] Comparación con periodo anterior
- [ ] Micro-gráficos (sparklines) en KPIs
- [ ] Click para drill-down a detalle
- [ ] Actualización en tiempo real (opcional)

#### Charts Mejorados
```
┌─────────────────────────────────────────┐
│  VENTAS DE LA SEMANA   [Día/Semana/Mes] │
│  ─────────────────────────────────────  │
│  [Gráfico de barras/líneas]            │
│                                         │
│  Comparar con: [Semana anterior ▼]     │
└─────────────────────────────────────────┘
```

**Añadir:**
- [ ] Selector de rango de fechas
- [ ] Comparación con periodo anterior
- [ ] Filtros por categoría/producto
- [ ] Export a CSV/PDF

#### Recent Orders Mejorado
```
┌─────────────────────────────────────────┐
│  PEDIDOS RECIENTES        [Ver todos →] │
│  ─────────────────────────────────────  │
│  #001  Cliente    €99  [Pagado]  Hoy   │
│  #002  Cliente    €79  [Enviado] Ayer  │
│  ─────────────────────────────────────  │
│  Click en fila para ver detalles        │
└─────────────────────────────────────────┘
```

**Añadir:**
- [ ] Highlight en pedidos urgentes
- [ ] Acciones rápidas (marcar como enviado)
- [ ] Filtro rápido por estado
- [ ] Sonido/notificación en pedidos nuevos (opcional)

#### Low Stock Alerts
```
┌─────────────────────────────────────────┐
│  STOCK BAJO              [8] [Gestionar]│
│  ─────────────────────────────────────  │
│  Producto X - Talla M    [2 uds] [Edit]│
│  Producto Y - Talla L    [0 uds] [Edit]│
│  ─────────────────────────────────────  │
│  Mostrar solo sin stock [Toggle]        │
└─────────────────────────────────────────┘
```

**Añadir:**
- [ ] Ordenar por stock ascendente
- [ ] Filtrar por categoría
- [ ] Acción rápida: actualizar stock inline
- [ ] Email alert cuando stock = 0

---

### 2. PRODUCTOS (/admin/productos)

**Objetivos del rediseño:**

#### Header con Acciones
```
┌─────────────────────────────────────────┐
│  PRODUCTOS           [+ Nuevo Producto] │
│                                         │
│  [Buscar...] [Categoría ▼] [Estado ▼]  │
│                                         │
│  [Grid View ≣] [List View ☰]           │
└─────────────────────────────────────────┘
```

#### Lista de Productos (Vista Tabla)
```
┌─────────────────────────────────────────────────────────────┐
│  ☑ | IMAGEN | NOMBRE | PRECIO | STOCK | CATEGORÍA | ACCIONES│
│  ☑ | [img]  | Camiseta X | €29.99 | 45 | Camisetas | [...] │
│  ☑ | [img]  | Pantalón Y | €59.99 | 12 | Pantalones| [...] │
│  ───────────────────────────────────────────────────────────│
│  [Bulk Actions: Eliminar | Duplicar | Exportar] (Si ☑ > 0)  │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Checkbox para bulk selection
- [ ] Vista grid/list toggle
- [ ] Filtros: categoría, precio, stock, estado
- [ ] Búsqueda instantánea (debounced)
- [ ] Ordenar por: nombre, precio, stock, fecha
- [ ] Paginación o infinite scroll
- [ ] Acciones rápidas: Edit, Duplicate, Delete, View

#### Vista Grid (Alternativa)
```
┌─────────────────────────────────────────┐
│  [Card] [Card] [Card] [Card]           │
│  [Card] [Card] [Card] [Card]           │
│                                         │
│  Cada card:                             │
│  ┌────────────────────┐                │
│  │ [☑] [Imagen]       │                │
│  │  Nombre producto   │                │
│  │  €29.99 | 45 uds  │                │
│  │  [Edit] [Delete]   │                │
│  └────────────────────┘                │
└─────────────────────────────────────────┘
```

---

### 3. CREAR/EDITAR PRODUCTO (/admin/productos/nuevo | [id])

**Objetivos del rediseño:**

#### Layout Multi-columna
```
┌──────────────────────┬──────────────────┐
│  INFORMACIÓN BÁSICA  │  VISTA PREVIA    │
│  ──────────────────  │  ──────────────  │
│  Nombre              │  [Imagen]        │
│  [Input]             │                  │
│                      │  Nombre Producto │
│  Descripción         │  €29.99          │
│  [WYSIWYG Editor]    │                  │
│                      │  [+ Carrito]     │
│  Precio              │                  │
│  [Input]             │                  │
│                      │                  │
│  ──────────────────  │                  │
│                      │                  │
│  VARIANTES Y STOCK   │                  │
│  ──────────────────  │                  │
│  [Tabla variantes]   │                  │
│  Talla | Stock | SKU │                  │
│  S     | 10    | XXX │                  │
│  M     | 20    | XXX │                  │
│  [+ Añadir talla]    │                  │
│                      │                  │
│  ──────────────────  │                  │
│                      │                  │
│  IMÁGENES            │                  │
│  ──────────────────  │                  │
│  [ImageUploader]     │                  │
│  [img][img][img][+]  │                  │
│                      │                  │
│  ──────────────────  │                  │
│                      │                  │
│  [Guardar] [Cancelar]│                  │
└──────────────────────┴──────────────────┘
```

**Características clave:**
- [ ] Auto-save en draft cada 30s
- [ ] Preview en tiempo real (desktop)
- [ ] Validación inline en campos
- [ ] Upload múltiple de imágenes (drag & drop)
- [ ] Editor WYSIWYG para descripción
- [ ] Gestión de variantes dinámica
- [ ] SEO fields colapsables
- [ ] Toast de éxito/error
- [ ] Botón "Guardar y crear otro"
- [ ] Breadcrumb: Productos > Nuevo Producto

---

### 4. PEDIDOS (/admin/pedidos)

**Objetivos del rediseño:**

#### Filtros y Búsqueda
```
┌─────────────────────────────────────────┐
│  PEDIDOS                                │
│                                         │
│  [Buscar por #, cliente, email...]     │
│                                         │
│  [Todos ▼] [Fecha ▼] [Monto ▼]        │
│  Estados: [Todos][Pendiente][Pagado]..  │
└─────────────────────────────────────────┘
```

#### Tabla de Pedidos
```
┌─────────────────────────────────────────────────────────────┐
│  # | CLIENTE | PRODUCTOS | TOTAL | ESTADO | FECHA | ACCIONES│
│────────────────────────────────────────────────────────────│
│  #001 | Juan P. | 3 items | €129 | [Pagado] | 21 Ene | [...] │
│  #002 | María G.| 1 item  | €59  | [Enviado]| 20 Ene | [...] │
│────────────────────────────────────────────────────────────│
│  Mostrando 1-25 de 156              [1][2][3]...[7] →      │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Filtros múltiples (estado, fecha, monto)
- [ ] Búsqueda por número, cliente, email
- [ ] Ordenar por columnas
- [ ] Paginación o virtual scrolling
- [ ] Acciones rápidas: Ver, Marcar como enviado, Factura
- [ ] Bulk actions: Exportar, Imprimir
- [ ] Highlight en pedidos urgentes (>2 días sin procesar)
- [ ] Badge de estado con colores claros

#### Estados de Pedido (Badges)
```tsx
const statusConfig = {
  pending: { label: 'Pendiente', class: 'badge-warning' },
  paid: { label: 'Pagado', class: 'badge-success' },
  shipped: { label: 'Enviado', class: 'badge-info' },
  delivered: { label: 'Entregado', class: 'badge-success' },
  cancelled: { label: 'Cancelado', class: 'badge-danger' },
  return_requested: { label: 'Dev. Solicitada', class: 'badge-warning' },
  // ... más estados
};
```

---

### 5. DETALLE DE PEDIDO (/admin/pedidos/[id])

**Objetivos del rediseño:**

#### Layout Completo
```
┌─────────────────────────────────────────────────────────────┐
│  ← Pedidos    PEDIDO #FS-001234        [Imprimir][Factura]  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────┬─────────────────┬──────────────┐  │
│  │ CLIENTE             │ ENVÍO           │ PAGO         │  │
│  │                     │                 │              │  │
│  │ Juan Pérez         │ Calle X, 123    │ Stripe       │  │
│  │ juan@email.com     │ Madrid, 28001   │ ••••1234     │  │
│  │ +34 600 000 000    │ España          │ €129.99      │  │
│  └─────────────────────┴─────────────────┴──────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TIMELINE DE ESTADO                                  │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ ✓ Confirmado      21 Ene, 10:30                     │   │
│  │ ✓ Pagado          21 Ene, 10:35                     │   │
│  │ ⊙ Procesando      Ahora                             │   │
│  │ ○ Enviado         Pendiente                         │   │
│  │ ○ Entregado       Pendiente                         │   │
│  │                                                      │   │
│  │ [Marcar como Enviado]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PRODUCTOS                                            │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ [img] Camiseta Oversize    Talla M   x2   €59.98    │   │
│  │ [img] Pantalón Cargo       Talla L   x1   €69.99    │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ Subtotal                                   €129.97   │   │
│  │ Envío                                      GRATIS    │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ TOTAL                                      €129.97   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ACCIONES                                             │   │
│  │ [Marcar Enviado] [Solicitar Devolución] [Reembolso] │   │
│  │ [Contactar Cliente] [Descargar Factura] [Imprimir]  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Vista completa de toda la información
- [ ] Timeline visual de estados
- [ ] Acciones contextuales según estado
- [ ] Botón rápido para cambiar estado
- [ ] Generar factura PDF
- [ ] Contactar cliente (email)
- [ ] Tracking de envío si disponible
- [ ] Historial de cambios
- [ ] Notas internas del admin

---

### 6. CATEGORÍAS (/admin/categorias)

**Objetivos del rediseño:**

#### Vista de Lista con Jerarquía
```
┌─────────────────────────────────────────┐
│  CATEGORÍAS           [+ Nueva Categoría]│
│  ─────────────────────────────────────  │
│                                         │
│  📦 Ropa                    [Edit][Del] │
│    ├─ Camisetas (45)       [Edit][Del] │
│    ├─ Pantalones (32)      [Edit][Del] │
│    └─ Sudaderas (28)       [Edit][Del] │
│                                         │
│  👟 Calzado                 [Edit][Del] │
│    ├─ Zapatillas (67)      [Edit][Del] │
│    └─ Botas (15)           [Edit][Del] │
│                                         │
│  🎒 Accesorios              [Edit][Del] │
│    ├─ Gorras (22)          [Edit][Del] │
│    └─ Mochilas (18)        [Edit][Del] │
└─────────────────────────────────────────┘
```

**Características:**
- [ ] Vista jerárquica (padre-hijo)
- [ ] Drag & drop para reordenar
- [ ] Contador de productos por categoría
- [ ] Edición inline de nombre
- [ ] Modal para nueva categoría
- [ ] Eliminar con confirmación
- [ ] Iconos/emojis por categoría (opcional)

---

### 7. CUPONES (/admin/cupones)

**Objetivos del rediseño:**

#### Lista de Cupones
```
┌─────────────────────────────────────────────────────────────┐
│  CUPONES                         [+ Nuevo Cupón]           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Activos][Programados][Expirados][Todos]                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WELCOME10          -10%      [Activo]              │   │
│  │ Usa: 45/100        Expira: 31 Dic 2026             │   │
│  │ [Editar][Duplicar][Desactivar]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BLACKFRIDAY        -50%      [Programado]          │   │
│  │ Inicia: 29 Nov     Expira: 30 Nov                  │   │
│  │ [Editar][Duplicar][Eliminar]                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Filtros por estado (activo, programado, expirado)
- [ ] Progreso de uso (45/100 usos)
- [ ] Fecha de expiración destacada
- [ ] Acciones: Editar, Duplicar, Activar/Desactivar
- [ ] Modal para crear/editar con validaciones
- [ ] Preview del descuento
- [ ] Restricciones claras (mínimo, productos, categorías)

---

### 8. PROMOCIONES (/admin/promociones)

**Objetivos del rediseño:**

#### Dashboard de Promociones
```
┌─────────────────────────────────────────────────────────────┐
│  PROMOCIONES          [Calendario] [+ Nueva Promoción]      │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Activas][Programadas][Finalizadas][Todas]                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎉 Rebajas de Invierno           [ACTIVA]          │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ 20% dto. en ropa de invierno                        │   │
│  │ Activa hasta: 31 Ene 2026                           │   │
│  │                                                      │   │
│  │ Ventas: €2,450 | Pedidos: 47 | Conv: 8.3%         │   │
│  │                                                      │   │
│  │ [Ver Estadísticas][Editar][Finalizar]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔥 Black Friday 2026           [PROGRAMADA]        │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ 50% dto. en todo el catálogo                        │   │
│  │ Inicia: 29 Nov 2026, 00:00                          │   │
│  │                                                      │   │
│  │ [Ver Detalles][Editar][Eliminar]                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Cards de promoción con métricas
- [ ] Filtros por estado
- [ ] Calendario view alternativo
- [ ] Wizard para nueva promoción
- [ ] Analytics por promoción
- [ ] Templates de promociones comunes
- [ ] Preview del banner/anuncio

---

### 9. DEVOLUCIONES (/admin/devoluciones)

**Objetivos del rediseño:**

#### Lista de Devoluciones
```
┌─────────────────────────────────────────────────────────────┐
│  DEVOLUCIONES                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Pendientes][Aprobadas][Completadas][Todas]               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #RET-001 | Pedido #FS-001234    [PENDIENTE]        │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ Cliente: Juan Pérez                                 │   │
│  │ Producto: Camiseta Oversize (M)                     │   │
│  │ Razón: Talla incorrecta                             │   │
│  │ Solicitado: 21 Ene, 10:30                           │   │
│  │                                                      │   │
│  │ [Ver Detalles][Aprobar][Rechazar]                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Filtros por estado
- [ ] Timeline de proceso
- [ ] Razones de devolución visibles
- [ ] Acciones rápidas: Aprobar/Rechazar
- [ ] Vista de detalle con imágenes (si aplica)
- [ ] Generar etiqueta de envío
- [ ] Actualizar stock automáticamente

---

### 10. NEWSLETTER (/admin/newsletter)

**Objetivos del rediseño:**

#### Dashboard Newsletter
```
┌─────────────────────────────────────────────────────────────┐
│  NEWSLETTER                        [+ Nueva Newsletter]     │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────┬─────────┬─────────┬─────────┐               │
│  │ Total   │ Activos │ Abiertos│ Clicks  │               │
│  │ 1,245   │ 1,180   │ 42.5%   │ 8.3%    │               │
│  └─────────┴─────────┴─────────┴─────────┘               │
│                                                             │
│  CAMPAÑAS RECIENTES                                         │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎉 Rebajas de Invierno            [ENVIADA]        │   │
│  │ Enviado: 20 Ene, 10:00 | A 1,180 suscriptores      │   │
│  │ Abierto: 495 (42%) | Clicks: 98 (8%)               │   │
│  │ [Ver Estadísticas][Ver Campaña]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔔 Nuevos Productos                [PROGRAMADA]    │   │
│  │ Envío: 25 Ene, 09:00 | A 1,180 suscriptores        │   │
│  │ [Editar][Test][Cancelar][Enviar Ahora]             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] KPIs de newsletter (suscriptores, open rate, CTR)
- [ ] Lista de campañas enviadas con métricas
- [ ] Programar envíos
- [ ] Preview y test antes de enviar
- [ ] Segmentación de suscriptores
- [ ] Templates predefinidos
- [ ] Editor WYSIWYG para contenido

---

### 11. CONFIGURACIÓN (/admin/configuracion)

**Objetivos del rediseño:**

#### Tabs de Configuración
```
┌─────────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [General][Pagos][Envío][Email][Avanzado]                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ INFORMACIÓN GENERAL                                  │   │
│  │ ───────────────────────────────────────────────────│   │
│  │ Nombre de la tienda                                 │   │
│  │ [FashionStore                        ]              │   │
│  │                                                      │   │
│  │ Logo                                                 │   │
│  │ [LogoUploader]                                      │   │
│  │                                                      │   │
│  │ Email de contacto                                    │   │
│  │ [info@fashionstore.com              ]               │   │
│  │                                                      │   │
│  │ Teléfono                                             │   │
│  │ [+34 600 000 000                    ]               │   │
│  │                                                      │   │
│  │ [Guardar Cambios]                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- [ ] Tabs para organizar settings
- [ ] Secciones colapsables
- [ ] Validación de campos
- [ ] Preview de cambios (ej: logo)
- [ ] Guardar por sección
- [ ] Reset a valores por defecto
- [ ] Exportar/Importar configuración

---

## 🎨 COMPONENTES UI A MEJORAR

### 1. Sistema de Botones Unificado

```tsx
// Variantes existentes
.admin-btn-primary    // Acción principal (verde)
.admin-btn-secondary  // Acción secundaria (gris)
.admin-btn-danger     // Acción destructiva (rojo)
.admin-btn-ghost      // Botón transparente
.admin-btn-icon       // Botón solo icono

// Uso consistente
<button className="admin-btn-primary">
  <Save className="w-4 h-4" />
  Guardar Producto
</button>
```

### 2. Badge System

```tsx
// Variantes existentes
.badge-success  // Verde (entregado, activo)
.badge-warning  // Amarillo (pendiente, procesando)
.badge-danger   // Rojo (cancelado, error)
.badge-info     // Azul (enviado, info)
.badge-muted    // Gris (inactivo)

// Uso consistente
<span className="badge-success">Entregado</span>
```

### 3. Admin Cards

```tsx
// Variantes
.admin-card              // Card básica
.admin-card-interactive  // Con hover
.stat-card              // Para KPIs

// Componentes internos
.stat-value  // Valor grande (text-4xl)
.stat-label  // Label pequeño (text-sm)
.stat-icon   // Contenedor de icono
```

### 4. Admin Table

```css
.admin-table              // Tabla base
.admin-table thead        // Header con fondo
.admin-table tbody tr     // Filas con hover
.admin-table tbody tr:nth-child(odd)  // Filas alternadas
```

### 5. Loading States

```tsx
// Skeleton
<Skeleton className="h-48 w-full" />

// Spinner en botón
<button disabled>
  <Loader2 className="w-4 h-4 animate-spin" />
  Cargando...
</button>

// Página completa
<DashboardSkeleton />
```

### 6. Empty States

```tsx
<EmptyState
  icon={<Package className="w-12 h-12" />}
  title="No hay productos"
  description="Crea tu primer producto para empezar"
  action={
    <Button href="/admin/productos/nuevo">
      Crear Producto
    </Button>
  }
/>
```

### 7. Modales Consistentes

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h3>Confirmar Eliminación</h3>
  </ModalHeader>
  <ModalBody>
    <p>¿Estás seguro de que quieres eliminar este producto?</p>
  </ModalBody>
  <ModalFooter>
    <button className="admin-btn-secondary" onClick={onClose}>
      Cancelar
    </button>
    <button className="admin-btn-danger" onClick={onConfirm}>
      Eliminar
    </button>
  </ModalFooter>
</Modal>
```

---

## 📱 RESPONSIVE ADMIN

### Desktop (1024px+) - PRIORIDAD

**Layout completo:**
- Sidebar fijo (w-72) siempre visible
- Main content con padding generoso (p-8)
- Tablas con todas las columnas
- Formularios multi-columna (grid-cols-2)
- Charts grandes y legibles
- Hover states completos

### Tablet (768px - 1023px)

**Layout adaptado:**
- Sidebar colapsable con toggle
- Main content con padding medio (p-6)
- Tablas con scroll horizontal si necesario
- Formularios híbridos (algunas 2 cols)
- Charts responsive

### Mobile (< 768px)

**Layout simplificado:**
- Sidebar overlay con botón hamburger
- Main content con padding reducido (p-4)
- Tablas convertidas a cards
- Formularios single-column
- Charts compactos
- Acciones en bottom sheet o dropdown

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. Server-Side Rendering (Astro)

```tsx
// ✅ Renderizar en servidor
<AdminLayout>
  <ProductsTable products={products} />
</AdminLayout>

// ✅ Hidratar solo componentes interactivos
<ProductFilters client:load />
<ImageUploader client:visible />
```

### 2. Paginación y Virtual Scrolling

```tsx
// Para listas largas (>100 items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={80}
>
  {ProductRow}
</FixedSizeList>
```

### 3. Debounce en Búsquedas

```tsx
import { useDebouncedValue } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

// Solo buscar cuando debouncedSearch cambia
useEffect(() => {
  fetchProducts(debouncedSearch);
}, [debouncedSearch]);
```

### 4. Optimistic Updates

```tsx
// Actualizar UI inmediatamente, revertir si falla
const handleToggleActive = async (id: string) => {
  // Optimistic update
  setProducts(prev => 
    prev.map(p => p.id === id ? {...p, active: !p.active} : p)
  );
  
  try {
    await updateProduct(id, { active: !product.active });
    showToast('Producto actualizado', 'success');
  } catch (error) {
    // Revertir en caso de error
    setProducts(prev => 
      prev.map(p => p.id === id ? {...p, active: !p.active} : p)
    );
    showToast('Error al actualizar', 'error');
  }
};
```

### 5. Cache de Datos

```tsx
// React Query para cache automático
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

---

## 🎯 ACCESIBILIDAD ADMIN

### Keyboard Navigation

```tsx
// Tab order lógico
<div>
  <input tabIndex={1} />
  <input tabIndex={2} />
  <button tabIndex={3}>Guardar</button>
</div>

// Atajos de teclado
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### ARIA Labels

```tsx
// Botones con solo icono
<button 
  className="admin-btn-icon"
  aria-label="Editar producto"
>
  <Edit className="w-4 h-4" />
</button>

// Estados dinámicos
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  {isLoading ? 'Cargando...' : `${products.length} productos encontrados`}
</div>
```

### Focus Management

```tsx
// Focus en modales
useEffect(() => {
  if (isOpen) {
    const firstInput = modalRef.current?.querySelector('input');
    firstInput?.focus();
  }
}, [isOpen]);

// Focus trap en modales
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <Modal>
    {/* Contenido */}
  </Modal>
</FocusTrap>
```

---

## 🧪 TESTING Y VALIDACIÓN

### Checklist Post-Rediseño

**Funcionalidad:**
- [ ] Todas las páginas admin cargan correctamente
- [ ] CRUD completo funciona (Create, Read, Update, Delete)
- [ ] Filtros y búsquedas funcionan
- [ ] Formularios validan correctamente
- [ ] Estados de carga se muestran
- [ ] Errores se capturan y muestran
- [ ] Success states con feedback

**Consistencia Visual:**
- [ ] Todas las cards usan `.admin-card`
- [ ] Todos los botones usan `.admin-btn-*`
- [ ] Todas las tablas usan `.admin-table`
- [ ] Todos los badges usan `.badge-*`
- [ ] Espaciado consistente (`gap-6`, `p-6`)
- [ ] Iconos de lucide-react uniformes
- [ ] Colores de la paleta HSL

**Performance:**
- [ ] Dashboard carga en < 2s
- [ ] Listas paginadas/virtualizadas
- [ ] Búsquedas con debounce
- [ ] Imágenes optimizadas (Cloudinary)
- [ ] No hay re-renders innecesarios

**Responsive:**
- [ ] Desktop 1920px funcional
- [ ] Desktop 1280px funcional
- [ ] Tablet 768px funcional
- [ ] Mobile 375px funcional

**Accesibilidad:**
- [ ] Navegación completa por teclado
- [ ] Focus visible en todos los elementos
- [ ] ARIA labels en iconos
- [ ] Screen reader compatible
- [ ] Contraste WCAG AA mínimo

---

## 📋 ORDEN DE IMPLEMENTACIÓN

### Fase 1: Auditoría y Componentes Base (Semana 1)
1. Auditar código actual
2. Documentar inconsistencias
3. Crear/mejorar componentes base:
   - Button unificado
   - Card variants
   - Modal system
   - Empty states
   - Loading states

### Fase 2: Páginas Core (Semana 2)
1. Dashboard con analytics mejorados
2. Lista de productos con filtros
3. Formulario crear/editar producto
4. Lista de pedidos
5. Detalle de pedido

### Fase 3: Gestión (Semana 3)
1. Categorías con jerarquía
2. Cupones con validaciones
3. Promociones con wizard
4. Devoluciones con timeline

### Fase 4: Comunicación y Config (Semana 4)
1. Newsletter dashboard
2. Editor newsletter
3. Configuración con tabs
4. Testing y ajustes finales

---

## 💡 BEST PRACTICES ADMIN

### 1. Acciones Rápidas Siempre Visibles

```tsx
// ✅ BUENO - Acciones accesibles
<tr>
  <td>{product.name}</td>
  <td>
    <div className="flex gap-2">
      <button><Edit /></button>
      <button><Trash2 /></button>
    </div>
  </td>
</tr>

// ❌ MALO - Acciones ocultas en menú
<tr>
  <td>{product.name}</td>
  <td>
    <Dropdown>
      <MenuItem>Editar</MenuItem>
      <MenuItem>Eliminar</MenuItem>
    </Dropdown>
  </td>
</tr>
```

### 2. Feedback Inmediato

```tsx
// ✅ BUENO - Toast + Estado
const handleSave = async () => {
  setIsSaving(true);
  try {
    await saveProduct(data);
    showToast('Producto guardado', 'success');
  } catch (error) {
    showToast('Error al guardar', 'error');
  } finally {
    setIsSaving(false);
  }
};
```

### 3. Confirmación en Acciones Destructivas

```tsx
// ✅ BUENO - Confirmar antes de eliminar
const handleDelete = () => {
  showConfirmModal({
    title: '¿Eliminar producto?',
    message: 'Esta acción no se puede deshacer',
    onConfirm: async () => {
      await deleteProduct(id);
      showToast('Producto eliminado', 'success');
    }
  });
};
```

### 4. Estados de Carga No Bloqueantes

```tsx
// ✅ BUENO - Skeleton mientras carga
{isLoading ? (
  <DashboardSkeleton />
) : (
  <DashboardContent data={data} />
)}

// ❌ MALO - Spinner bloqueante
{isLoading && <FullScreenSpinner />}
```

### 5. Bulk Actions

```tsx
// ✅ BUENO - Acciones masivas
<div>
  {selectedIds.length > 0 && (
    <div className="flex gap-2 mb-4">
      <button onClick={handleBulkDelete}>
        Eliminar {selectedIds.length} seleccionados
      </button>
      <button onClick={handleBulkExport}>
        Exportar
      </button>
    </div>
  )}
  <Table selectable onSelect={setSelectedIds} />
</div>
```

---

## 🎬 RESULTADO ESPERADO

Al final del rediseño, el Panel Admin debe:

✅ **Ser eficiente y rápido** - Operaciones comunes en < 3 clicks
✅ **Verse profesional** - Diseño consistente y pulido
✅ **Tener feedback claro** - Estados, errores, éxitos visibles
✅ **Ser completamente responsive** - Desktop, tablet, móvil
✅ **Mantener accesibilidad** - WCAG AA, keyboard nav, ARIA
✅ **Cargar rápido** - Paginación, cache, optimistic updates
✅ **Guiar al administrador** - UX intuitiva, acciones claras
✅ **Prevenir errores** - Validaciones, confirmaciones

---

## 📞 RECURSOS

### Documentación del Proyecto
- `GUIA-ACCESIBILIDAD.md` - Estándares a mantener
- `src/styles/global.css` - Sistema de diseño completo
- `AdminLayout.astro` - Layout base del admin

### Inspiración de Diseño Admin
- Stripe Dashboard
- Shopify Admin
- Vercel Dashboard
- Linear App
- shadcn/ui components

### Herramientas
- Lighthouse (performance)
- Chrome DevTools (responsive, performance)
- axe DevTools (accesibilidad)
- React DevTools (optimización)

---

**¡Éxito con la optimización del admin! 🚀**

Crea un panel de administración que haga que gestionar FashionStore sea un placer.
