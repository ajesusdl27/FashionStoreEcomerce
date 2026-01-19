# Módulo 6: Pedidos y Devoluciones (Customer-facing) - Análisis

## 1. Visión General

Sistema completo de gestión de pedidos y devoluciones desde la perspectiva del cliente:
- **Historial de pedidos**: Lista completa con estados y totales
- **Detalle de pedido**: Items, resumen, dirección, acciones
- **Cancelación**: Solo pedidos "paid" (no enviados)
- **Devoluciones**: Proceso completo de 30 días post-entrega
- **Reembolsos**: Via Stripe automático

---

## 2. Modelos de Datos

### 2.1 Tabla `orders`

```sql
orders (
  id UUID PRIMARY KEY,
  order_number INTEGER UNIQUE,           -- Secuencial #A000001
  customer_id UUID REFERENCES auth.users,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Dirección de envío
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'España',
  
  -- Estado del pedido
  status TEXT DEFAULT 'pending',
  -- Valores: pending, paid, shipped, delivered, cancelled,
  --          return_requested, return_approved, return_shipped,
  --          return_received, return_completed, partially_refunded
  
  -- Pagos
  stripe_session_id TEXT,
  total_amount NUMERIC(10,2),
  refunded_amount NUMERIC(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
)
```

### 2.2 Tabla `order_items`

```sql
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  product_id UUID REFERENCES products,
  variant_id UUID REFERENCES product_variants,
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
)
```

### 2.3 Tabla `returns`

```sql
returns (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  user_id UUID REFERENCES auth.users,
  
  status TEXT DEFAULT 'requested',
  -- Valores: requested, approved, shipped, received, completed, rejected
  
  refund_amount NUMERIC(10,2),
  refund_method TEXT DEFAULT 'original_payment',
  
  customer_notes TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  tracking_number TEXT,
  return_label_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

### 2.4 Tabla `return_items`

```sql
return_items (
  id UUID PRIMARY KEY,
  return_id UUID REFERENCES returns,
  order_item_id UUID REFERENCES order_items,
  product_variant_id UUID REFERENCES product_variants,
  
  quantity INTEGER NOT NULL,
  
  reason TEXT NOT NULL,
  -- Valores: size_mismatch, defective, not_as_described,
  --          changed_mind, arrived_late, other
  reason_details TEXT,
  
  inspection_status TEXT DEFAULT 'pending',
  -- Valores: pending, approved, rejected
  inspection_notes TEXT,
  restock_approved BOOLEAN DEFAULT FALSE,
  
  refund_amount NUMERIC(10,2)
)
```

---

## 3. Estados de Pedido

### 3.1 Flujo Principal

```
pending → paid → shipped → delivered
            ↓        
        cancelled
```

### 3.2 Flujo con Devolución

```
delivered → return_requested → return_approved → return_shipped 
                                    ↓
                              return_received → return_completed
                                    ↓
                               (rejected)
```

### 3.3 Configuración de Estados

```typescript
// order-status.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
  paid:      { label: 'Pagado',     bgClass: 'bg-green-500/20',  textClass: 'text-green-400' },
  shipped:   { label: 'Enviado',    bgClass: 'bg-blue-500/20',   textClass: 'text-blue-400' },
  delivered: { label: 'Entregado',  bgClass: 'bg-green-500/20',  textClass: 'text-green-400' },
  cancelled: { label: 'Cancelado',  bgClass: 'bg-red-500/20',    textClass: 'text-red-400' },
};

// Transiciones válidas
export const VALID_TRANSITIONS = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],  // Estado final
  cancelled: [],  // Estado final
};
```

---

## 4. Estados de Devolución

```typescript
export const RETURN_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  SHIPPED: 'shipped',
  RECEIVED: 'received',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const RETURN_STATUS_CONFIG = {
  requested: { bg: 'bg-amber-500/10',   text: 'text-amber-500',   label: 'Pendiente' },
  approved:  { bg: 'bg-blue-500/10',    text: 'text-blue-500',    label: 'Aprobada' },
  shipped:   { bg: 'bg-purple-500/10',  text: 'text-purple-500',  label: 'Enviada' },
  received:  { bg: 'bg-cyan-500/10',    text: 'text-cyan-500',    label: 'En revisión' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completada' },
  rejected:  { bg: 'bg-red-500/10',     text: 'text-red-500',     label: 'Rechazada' },
};
```

---

## 5. Motivos de Devolución

```typescript
const RETURN_REASONS = [
  { value: 'size_mismatch',    label: 'Talla incorrecta' },
  { value: 'defective',        label: 'Producto defectuoso' },
  { value: 'not_as_described', label: 'No coincide con la descripción' },
  { value: 'changed_mind',     label: 'Cambio de opinión' },
  { value: 'arrived_late',     label: 'Llegó tarde' },
  { value: 'other',            label: 'Otro motivo' },
];
```

---

## 6. Lógica de Negocio

### 6.1 Cancelación de Pedido

**Condiciones:**
- Solo estado `paid` (no enviado aún)
- El cliente debe ser propietario del pedido

**Proceso:**
1. Verificar ownership (customer_id == user.id)
2. Verificar status == 'paid'
3. Procesar reembolso via Stripe
4. Actualizar status a 'cancelled'
5. Restaurar stock (si aplica)
6. Enviar email de confirmación

### 6.2 Solicitud de Devolución

**Condiciones:**
- Estado `delivered`
- Dentro de ventana de 30 días desde `delivered_at`
- No existe devolución activa para el pedido

**Proceso:**
1. Verificar elegibilidad
2. Crear registro en `returns` con status `requested`
3. Crear items en `return_items` con motivos
4. Calcular `refund_amount` estimado
5. Enviar email de confirmación

### 6.3 Cálculo de Reembolso

```typescript
// Por cada item devuelto
const estimatedRefund = orderItem.price_at_purchase * returnQuantity;

// Total = suma de todos los items
let totalEstimatedRefund = 0;
items.forEach(item => {
  totalEstimatedRefund += item.price_at_purchase * item.quantity;
});
```

---

## 7. APIs del Cliente

### 7.1 Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders` | Lista pedidos del usuario |
| GET | `/api/orders/:id` | Detalle de pedido |
| POST | `/api/orders/cancel` | Cancelar pedido |

### 7.2 Devoluciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/returns` | Crear solicitud |
| GET | `/api/returns?order_id=X` | Obtener devolución de pedido |

---

## 8. Formato de Número de Pedido

```typescript
// Formato: #A000001
formatOrderId(1)    → "#A000001"
formatOrderId(999)  → "#A000999"
formatOrderId(null) → "#PENDIENTE"

// Fallback para pedidos sin order_number
getDisplayOrderId({ order_number: null, id: "uuid..." }) 
→ "#12345678" (primeros 8 chars del UUID)
```

---

## 9. Configuración de Devoluciones

**Settings en BD:**
- `returns_enabled`: boolean (habilita/deshabilita sistema)
- `return_window_days`: integer (default 30 días)

**Validación de ventana:**
```typescript
const isReturnWindowValid = () => {
  if (!deliveredAt) return true;
  const delivered = new Date(deliveredAt);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSince <= 30;
};
```

---

## 10. Emails Transaccionales

| Evento | Función | Descripción |
|--------|---------|-------------|
| Cancelación | `sendOrderCancelled()` | Confirma cancelación y reembolso |
| Solicitud | `sendReturnConfirmation()` | Confirma recepción de solicitud |
| Aprobación | `sendReturnApproved()` | Instrucciones de envío |
| Rechazo | `sendReturnRejected()` | Motivo del rechazo |
| Completada | `sendRefundProcessed()` | Confirma reembolso procesado |

---

## 11. Páginas Existentes

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/cuenta/pedidos` | `cuenta/pedidos/index.astro` | Lista de pedidos |
| `/cuenta/pedidos/:id` | `cuenta/pedidos/[id].astro` | Detalle de pedido |

### Componentes:
- `OrderActions.tsx` - Botones cancelar/devolver + modal de devolución

---

## 12. Consideraciones para Flutter

### 12.1 Acciones por Estado

| Estado | Cancelar | Devolver | Invoice |
|--------|----------|----------|---------|
| pending | ❌ | ❌ | ❌ |
| paid | ✅ | ❌ | ✅ |
| shipped | ❌ | ❌ | ✅ |
| delivered | ❌ | ✅ (30d) | ✅ |
| cancelled | ❌ | ❌ | ❌ |

### 12.2 Información de Devolución a Mostrar

Cuando hay devolución activa:
- Estado con badge coloreado
- Instrucciones según estado:
  - `requested`: "Esperando aprobación"
  - `approved`: Dirección de envío + instrucciones
  - `shipped`/`received`: "En proceso"
  - `completed`: Monto reembolsado

### 12.3 Formulario de Devolución

Para cada item del pedido:
- Checkbox de selección
- Selector de cantidad (1 - cantidad original)
- Dropdown de motivo
- Campo texto para detalles adicionales

Notas generales del cliente (opcional)
