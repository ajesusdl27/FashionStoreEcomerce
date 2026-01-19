# Módulo 4: Panel de Administración - Análisis Completo

## 1. Visión General del Módulo

El Panel de Administración es una aplicación web completa que permite gestionar todos los aspectos de FashionStore. Construido con Astro + React Islands, incluye dashboard analítico, gestión de productos, pedidos, devoluciones, cupones, promociones, categorías, newsletter y configuración.

### Arquitectura Actual
```
src/
├── layouts/
│   └── AdminLayout.astro          # Layout base con sidebar
├── pages/admin/
│   ├── index.astro                # Dashboard principal
│   ├── login.astro                # Login administrativo
│   ├── productos/
│   │   ├── index.astro            # Listado de productos
│   │   ├── [id].astro             # Editar producto
│   │   └── nuevo.astro            # Crear producto
│   ├── categorias/
│   │   └── index.astro            # CRUD categorías
│   ├── pedidos/
│   │   ├── index.astro            # Listado de pedidos
│   │   └── [id].astro             # Detalle de pedido
│   ├── devoluciones/
│   │   ├── index.astro            # Listado devoluciones
│   │   └── [id].astro             # Gestión devolución
│   ├── cupones/
│   │   └── index.astro            # Gestión de cupones
│   ├── promociones/
│   │   ├── index.astro            # Gestión promociones
│   │   └── [id].astro             # Editar promoción
│   ├── newsletter/
│   │   └── index.astro            # Gestión suscriptores
│   └── configuracion/
│       └── index.astro            # Ajustes de tienda
├── components/islands/
│   ├── KPICard.tsx                # Tarjetas de métricas
│   ├── SalesChart.tsx             # Gráfico de ventas
│   ├── ImageUploader.tsx          # Subida de imágenes
│   └── admin/
│       ├── PromotionWizard.tsx    # Wizard crear promoción
│       ├── PromotionCalendar.tsx  # Calendario promociones
│       └── RuleBuilder.tsx        # Constructor reglas
└── lib/
    ├── analytics.ts               # Funciones analíticas
    └── promotionTemplates.ts      # Templates promociones
```

---

## 2. Funcionalidades por Sección

### 2.1 Dashboard Principal (`admin/index.astro`)

#### KPIs del Mes
```typescript
// Métricas principales mostradas
interface DashboardKPIs {
  monthlyRevenue: {
    total: number;           // Ingresos netos (total - reembolsos)
    orderCount: number;      // Número de pedidos
    trend: number;           // % comparado con mes anterior
  };
  pendingOrders: {
    total: number;           // Total pendientes
    pending: number;         // Estado 'pending'
    paid: number;            // Estado 'paid' (sin enviar)
  };
  bestSellingProduct: {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  };
}
```

#### Gráfico de Ventas (últimos 7 días)
```typescript
interface DailySales {
  date: string;      // 'yyyy-MM-dd'
  label: string;     // 'Lun 15', 'Mar 16', etc.
  revenue: number;   // Ingresos del día
  orderCount: number; // Pedidos del día
}
```

#### Alertas y Acciones Rápidas
- **Stock bajo**: Productos con variantes stock < 5
- **Pedidos recientes**: Últimos 5 pedidos con estado
- **Acceso directo**: Enlaces a secciones frecuentes

#### Manejo de Zona Horaria (España)
```typescript
function getSpainMidnightUTC(date: Date): Date {
  // Detecta DST automáticamente (GMT+1 o GMT+2)
  const isDST = date.toLocaleString('en-US', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'short'
  }).includes('GMT+2');
  
  const spainOffset = isDST ? 2 : 1;
  // Ajusta para obtener medianoche España en UTC
}
```

---

### 2.2 Gestión de Productos (`admin/productos/`)

#### Listado de Productos
```typescript
interface ProductListFilters {
  search: string;           // Búsqueda por nombre
  category: string | null;  // Filtro por categoría
  status: 'all' | 'active' | 'inactive' | 'offer' | 'low-stock';
}

interface ProductListItem {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  is_active: boolean;
  category: { name: string };
  images: string[];
  variants: ProductVariant[];  // Para calcular stock total
}
```

#### Formulario de Producto
```typescript
interface ProductForm {
  // Información básica
  name: string;
  slug: string;
  description: string;      // HTML (editor rico)
  
  // Categoría y precios
  category_id: string;
  price: number;
  offer_price: number | null;
  
  // Estado
  is_active: boolean;
  is_featured: boolean;
  
  // Imágenes (ordenadas)
  images: string[];         // URLs Cloudinary
  
  // Variantes por talla
  variants: {
    size: string;
    stock: number;
    sku?: string;
  }[];
}
```

#### Sistema de Tallas por Categoría
```typescript
const SIZE_MAPPINGS = {
  clothing: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
  footwear: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  universal: ['Única']
};

// La categoría define qué tallas mostrar
interface Category {
  id: string;
  name: string;
  slug: string;
  size_type: 'clothing' | 'footwear' | 'universal';
}
```

#### Soft Delete
```typescript
// Los productos no se eliminan, solo se marcan
const { error } = await supabase
  .from('products')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', productId);

// En listados: .is('deleted_at', null)
```

---

### 2.3 Gestión de Categorías (`admin/categorias/`)

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  size_type: 'clothing' | 'footwear' | 'universal';
  created_at: string;
  product_count?: number;  // Calculado via subquery
}

// CRUD completo con validación de slug único
// El conteo de productos se calcula:
const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .eq('category_id', categoryId)
  .is('deleted_at', null);
```

---

### 2.4 Gestión de Pedidos (`admin/pedidos/`)

#### Estados de Pedido
```typescript
type OrderStatus = 
  | 'pending'           // Pago pendiente
  | 'paid'              // Pagado, sin enviar
  | 'shipped'           // Enviado
  | 'delivered'         // Entregado
  | 'cancelled'         // Cancelado
  | 'return_requested'  // Devolución solicitada
  | 'return_approved'   // Devolución aprobada
  | 'return_shipped'    // Cliente envió productos
  | 'return_received'   // Recibido en almacén
  | 'return_completed'  // Reembolso procesado
  | 'partially_refunded'; // Reembolso parcial

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'yellow', icon: '🕐' },
  paid: { label: 'Pagado', color: 'green', icon: '💰' },
  shipped: { label: 'Enviado', color: 'blue', icon: '📦' },
  delivered: { label: 'Entregado', color: 'emerald', icon: '✅' },
  cancelled: { label: 'Cancelado', color: 'red', icon: '❌' },
  // ... más estados
};
```

#### Listado con Paginación
```typescript
const PAGE_SIZE = 20;

const { data: orders, count } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(offset, offset + PAGE_SIZE - 1);
```

#### Detalle de Pedido
```typescript
interface OrderDetail {
  id: string;
  order_number: string;     // Formato FW-2025-XXXXX
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  
  // Tracking
  shipments?: OrderShipment[];
  
  // Devoluciones asociadas
  returns?: Return[];
}
```

---

### 2.5 Gestión de Devoluciones (`admin/devoluciones/`)

#### Estados de Devolución
```typescript
type ReturnStatus = 
  | 'requested'    // Cliente solicitó
  | 'approved'     // Admin aprobó
  | 'rejected'     // Admin rechazó
  | 'shipped'      // Cliente envió productos
  | 'received'     // Recibido en almacén
  | 'completed';   // Reembolso procesado

const RETURN_STATUS_CONFIG = {
  requested: { label: 'Solicitada', color: 'yellow' },
  approved: { label: 'Aprobada', color: 'blue' },
  rejected: { label: 'Rechazada', color: 'red' },
  shipped: { label: 'En tránsito', color: 'purple' },
  received: { label: 'Recibida', color: 'indigo' },
  completed: { label: 'Completada', color: 'green' },
};
```

#### Modelo de Devolución
```typescript
interface Return {
  id: string;
  order_id: string;
  reason: string;
  items: ReturnItem[];
  status: ReturnStatus;
  refund_amount: number | null;
  admin_notes: string | null;
  tracking_number: string | null;
  label_url: string | null;       // Etiqueta de envío generada
  created_at: string;
  updated_at: string;
  
  // Relaciones
  order: Order;
}

interface ReturnItem {
  order_item_id: string;
  quantity: number;
  reason?: string;
}
```

---

### 2.6 Gestión de Cupones (`admin/cupones/`)

```typescript
interface Coupon {
  id: string;
  code: string;              // Único, uppercase
  discount_type: 'percentage' | 'fixed';
  discount_value: number;    // % o € según tipo
  min_purchase: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  
  // Estado calculado
  status: 'active' | 'inactive' | 'expired' | 'exhausted';
}

// Cálculo de estado
function getCouponStatus(coupon: Coupon): string {
  if (!coupon.is_active) return 'inactive';
  
  const now = new Date();
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return 'expired';
  }
  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return 'exhausted';
  }
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return 'scheduled';
  }
  return 'active';
}
```

---

### 2.7 Gestión de Promociones (`admin/promociones/`)

#### Modelo de Promoción
```typescript
interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  mobile_image_url: string | null;
  cta_text: string;
  cta_link: string;
  cta_link_type: 'products' | 'offers' | 'category' | 'product';
  cta_link_category: string | null;
  coupon_id: string | null;
  locations: PromotionLocation[];
  priority: number;           // Mayor = más importante
  style_config: StyleConfig;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  template_id: string | null;
  rules: PromotionRule[];
  created_at: string;
}

type PromotionLocation = 
  | 'home_hero'          // Banner principal home
  | 'announcement_top'   // Barra superior
  | 'cart_sidebar'       // Sidebar del carrito
  | 'product_page';      // Página de producto
```

#### Configuración de Estilo
```typescript
interface StyleConfig {
  text_color: 'white' | 'black';
  text_align: 'left' | 'center' | 'right';
  overlay_enabled: boolean;
  overlay_position: 'left' | 'center' | 'right' | 'full';
  overlay_opacity: number;  // 0-100
}
```

#### Reglas de Visualización
```typescript
interface PromotionRule {
  id: string;
  type: 'cart_value' | 'day_of_week' | 'first_visit' | 'new_customer' | 'returning_customer';
  operator?: 'greater_than' | 'less_than' | 'equals';
  value: string | number | string[];
}

// Ejemplo: Mostrar solo si carrito > 50€ y es fin de semana
const rules: PromotionRule[] = [
  { id: '1', type: 'cart_value', operator: 'greater_than', value: 50 },
  { id: '2', type: 'day_of_week', value: ['6', '0'] }  // Sáb, Dom
];
```

#### Templates Predefinidos
```typescript
const PROMOTION_TEMPLATES = [
  {
    id: 'rebajas',
    name: 'Rebajas',
    emoji: '🛍️',
    category: 'seasonal',
    defaults: {
      title: '¡REBAJAS!',
      cta_text: '¡Comprar ahora!',
      cta_link: '/ofertas',
      suggested_locations: ['home_hero', 'announcement_top']
    }
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    emoji: '🖤',
    category: 'special',
    // ...
  },
  // san-valentin, navidad, nueva-coleccion, envio-gratis
];
```

#### Calendario de Promociones
El componente `PromotionCalendar` muestra:
- Vista mensual con navegación
- Promociones marcadas por fecha de inicio/fin
- Colores según estado: Verde (activa), Azul (programada), Gris (inactiva)
- Hover para ver detalles

---

### 2.8 Gestión de Newsletter (`admin/newsletter/`)

```typescript
interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  confirmed_at: string | null;   // Double opt-in
  gdpr_consent: boolean;
  gdpr_consent_date: string;
  unsubscribed_at: string | null;
  source: 'website' | 'checkout' | 'manual';
  created_at: string;
}

// Acciones de administrador
- Ver listado con filtros (activo/inactivo)
- Exportar lista (CSV)
- Eliminar suscriptor (GDPR)
- Reenviar confirmación
```

---

### 2.9 Configuración (`admin/configuracion/`)

```typescript
// Tabla settings: key-value store
interface Setting {
  id: string;
  key: string;
  value: string | null;
  value_bool: boolean | null;
  value_number: number | null;
  updated_at: string;
}

// Claves de configuración
const SETTINGS_KEYS = {
  // Tienda
  store_name: 'string',
  store_email: 'string',
  store_phone: 'string',
  
  // Envío
  shipping_free_threshold: 'number',
  shipping_standard_cost: 'number',
  
  // Ofertas
  offers_enabled: 'boolean',
  flash_offers_end: 'string',  // ISO date
  
  // Social
  instagram_url: 'string',
  facebook_url: 'string',
};
```

---

## 3. Componentes React Islands

### 3.1 KPICard
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  iconName: 'money' | 'clock' | 'star';
  trend?: number;       // % cambio vs anterior
  subtitle?: string;
  colorClass?: string;  // 'text-primary', 'text-green-400', etc.
}
```

### 3.2 SalesChart (Chart.js)
```typescript
interface SalesChartProps {
  data: DailySales[];  // 7 días
}

// Usa Chart.js con react-chartjs-2
// Gráfico de barras con tooltip personalizado
```

### 3.3 ImageUploader
```typescript
interface ImageUploaderProps {
  initialImages?: string[];
  onImagesChange?: (urls: string[]) => void;
  inputName?: string;
}

// Características:
// - Drag & drop
// - Múltiples imágenes
// - Reordenamiento
// - Preview con eliminación
// - Indicador de carga
// - Manejo de errores
```

### 3.4 PromotionWizard
```typescript
interface PromotionWizardProps {
  categories: Category[];
  coupons: Coupon[];
  existingDraft?: PromotionDraft;
}

// Wizard de 4 pasos:
// 1. Selección de template
// 2. Contenido (título, descripción, CTA)
// 3. Imágenes y estilo
// 4. Programación y reglas
```

### 3.5 PromotionCalendar
```typescript
interface PromotionCalendarProps {
  promotions: Promotion[];
}

// Vista mensual interactiva
// Navegación por meses
// Indicadores de promociones activas/programadas
```

### 3.6 RuleBuilder
```typescript
interface RuleBuilderProps {
  initialRules?: Rule[];
  onChange?: (rules: Rule[]) => void;
}

// Tipos de regla:
// - Valor del carrito (>, <, =)
// - Día de la semana (selección múltiple)
// - Primera visita (boolean)
// - Cliente nuevo (boolean)
// - Cliente recurrente (boolean)
```

---

## 4. API Endpoints Utilizados

### 4.1 Subida de Imágenes
```typescript
// POST /api/upload
// Body: FormData con 'file'
// Response: { url: string }  // URL de Cloudinary
```

### 4.2 Acciones de Productos
```typescript
// POST /api/admin/products/delete
// Body: { productId: string }
// Response: { success: boolean }
```

### 4.3 Acciones de Pedidos
```typescript
// POST /api/admin/orders/update-status
// Body: { orderId: string, status: OrderStatus }

// POST /api/admin/orders/add-tracking
// Body: { orderId: string, carrier: string, trackingNumber: string }
```

### 4.4 Acciones de Devoluciones
```typescript
// POST /api/admin/returns/approve
// Body: { returnId: string, notes?: string }

// POST /api/admin/returns/reject
// Body: { returnId: string, reason: string }

// POST /api/admin/returns/complete
// Body: { returnId: string, refundAmount: number }
```

---

## 5. Patrones y Consideraciones

### 5.1 Autenticación Administrativa
```typescript
// En cada página admin (frontmatter):
const supabase = createAuthenticatedClient(Astro);
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return Astro.redirect('/admin/login');
}

// Verificar rol de admin (tabla admin_users o metadata)
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (!adminUser) {
  return Astro.redirect('/admin/login?error=unauthorized');
}
```

### 5.2 Notificaciones Toast
```typescript
// Sistema de notificaciones en cliente
function showToast(message: string, type: 'success' | 'error' | 'info') {
  // Implementación con CSS transitions
}
```

### 5.3 Confirmación de Acciones Destructivas
```typescript
// Modal de confirmación antes de:
// - Eliminar producto
// - Cancelar pedido
// - Rechazar devolución
```

### 5.4 Validación de Formularios
```typescript
// Server-side en Astro
// Client-side en React Islands
// Mensajes de error descriptivos
```

---

## 6. Datos de Ejemplo

### Dashboard KPIs
```json
{
  "monthlyRevenue": {
    "total": 15420.50,
    "orderCount": 87,
    "trend": 12.5
  },
  "pendingOrders": {
    "total": 5,
    "pending": 2,
    "paid": 3
  },
  "bestSellingProduct": {
    "name": "Camiseta Premium",
    "totalQuantity": 45,
    "totalRevenue": 1795.55
  }
}
```

### Producto de Ejemplo
```json
{
  "id": "uuid",
  "name": "Blazer Elegante",
  "slug": "blazer-elegante",
  "description": "<p>Blazer de corte...</p>",
  "price": 149.99,
  "offer_price": 119.99,
  "category_id": "cat-uuid",
  "is_active": true,
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "variants": [
    { "size": "S", "stock": 5 },
    { "size": "M", "stock": 8 },
    { "size": "L", "stock": 3 }
  ]
}
```

---

## 7. Dependencias Clave

### Frontend (React Islands)
- **chart.js** + **react-chartjs-2**: Gráficos
- **date-fns**: Manejo de fechas
- React useState/useEffect para estado local

### Backend
- **Supabase Client**: Consultas con RLS
- **Cloudinary**: Almacenamiento de imágenes

---

## 8. Notas para Migración Flutter

1. **Decisión arquitectónica**: ¿Admin como app separada o sección protegida?
2. **Gráficos**: Usar `fl_chart` o `syncfusion_flutter_charts`
3. **Editor rico**: `flutter_quill` para descripciones HTML
4. **Tablas de datos**: `data_table_2` o `pluto_grid` para listados
5. **Drag & drop**: `reorderable_grid` para imágenes
6. **Calendarios**: `table_calendar` o `syncfusion_flutter_calendar`
7. **Wizard**: `im_stepper` o implementación custom
8. **Roles**: Implementar RBAC para diferentes niveles de admin
