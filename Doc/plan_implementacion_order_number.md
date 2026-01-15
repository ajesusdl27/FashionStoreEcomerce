# Plan de Implementación: Sistema de Numeración de Pedidos

## 📊 División de Tareas por Fases

Este documento divide la implementación del sistema de numeración secuencial en tareas concretas y ordenadas.

---

## 🔵 FASE 1: PREPARACIÓN Y UTILIDADES (Sin Impacto en Producción)

### Tarea 1.1: Crear Utilidades Base
**Archivo:** `src/lib/order-utils.ts`
**Tiempo estimado:** 30 min

```typescript
// Crear archivo completo con todas las funciones
export const formatOrderId = (orderNumber: number | null | undefined): string => { /* ... */ }
export const parseOrderId = (input: string): number | null => { /* ... */ }
export const isOrderIdFormat = (input: string): boolean => { /* ... */ }
export const formatInvoiceNumber = (orderNumber: number): string => { /* ... */ }
export const getDisplayOrderId = (order: { order_number?: number | null, id: string }): string => { /* ... */ }
```

**Verificación:**
- [ ] Archivo creado sin errores TypeScript
- [ ] Funciones exportadas correctamente

---

### Tarea 1.2: Crear Tests Unitarios
**Archivo:** `src/lib/order-utils.test.ts`
**Tiempo estimado:** 30 min

**Tests a implementar:**
- ✅ formatOrderId con números válidos
- ✅ formatOrderId con números inválidos
- ✅ formatOrderId con números fuera de rango
- ✅ parseOrderId con formatos válidos
- ✅ parseOrderId con formatos inválidos
- ✅ isOrderIdFormat con varios inputs
- ✅ formatInvoiceNumber
- ✅ getDisplayOrderId con y sin order_number

**Verificación:**
- [ ] Todos los tests pasan
- [ ] Cobertura > 90%

**Comando:**
```bash
npm run test src/lib/order-utils.test.ts
```

---

### Tarea 1.3: Preparar Scripts SQL
**Archivos:** 
- `Doc/migrations/026_add_order_number_polished.sql`
- `Doc/migrations/rollback_026.sql`

**Tiempo estimado:** 20 min

**Verificación:**
- [ ] Script de migración completo
- [ ] Script de rollback completo
- [ ] Comentarios claros en ambos
- [ ] Sintaxis SQL validada

---

### Tarea 1.4: Backup y Configuración
**Tiempo estimado:** 15 min

**Acciones:**
1. Crear backup completo de base de datos Supabase
2. Documentar estado actual (número de pedidos, última fecha, etc.)
3. Preparar entorno de pruebas

**Verificación:**
- [ ] Backup descargado y verificado
- [ ] Entorno de desarrollo listo
- [ ] Credenciales de Supabase confirmadas

---

## 🟢 FASE 2: MIGRACIÓN DE BASE DE DATOS (**Requiere Ventana de Mantenimiento**)

### Tarea 2.1: Ejecutar Migración SQL
**Archivo:** `Doc/migrations/026_add_order_number_polished.sql`
**Tiempo estimado:** 10 min (ejecución) + 20 min (verificación)
**Impacto:** 🔴 Bloqueo temporal de escrituras en tabla `orders`

**Pasos:**
1. Anunciar ventana de mantenimiento (15 min aprox.)
2. Conectar a Supabase SQL Editor
3. Copiar contenido de `026_add_order_number_polished.sql`
4. Ejecutar script completo
5. Revisar mensajes de `RAISE NOTICE`

**Verificación:**
```sql
-- Verificación 1: Columna creada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'order_number';

-- Verificación 2: Todos los pedidos tienen número
SELECT COUNT(*) as total, COUNT(order_number) as with_number 
FROM orders;

-- Verificación 3: Índice creado
SELECT indexname FROM pg_indexes 
WHERE tablename = 'orders' AND indexname = 'idx_orders_order_number';

-- Verificación 4: Constraint de unicidad
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'orders' AND constraint_name = 'orders_order_number_unique';

-- Verificación 5: Secuencia correcta
SELECT last_value FROM orders_order_number_seq;
```

**Criterios de éxito:**
- [ ] Columna `order_number` existe y es NOT NULL
- [ ] Todos los pedidos tienen un `order_number` único
- [ ] Índice creado correctamente
- [ ] Constraint de unicidad activo
- [ ] Secuencia configurada con el valor máximo actual + 1

**Plan de contingencia:**
- Si algo falla: Ejecutar `rollback_026.sql` inmediatamente
- Si la migración tarda >5 min: Investigar bloqueos con `pg_stat_activity`

---

### Tarea 2.2: Actualizar RPC Function
**Función:** `create_checkout_order`
**Tiempo estimado:** 15 min

**Acción:**
1. Abrir Supabase SQL Editor
2. Localizar función actual:
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'create_checkout_order';
   ```
3. Ejecutar nueva versión (ver plan de migración sección 1.3)

**Verificación:**
```sql
-- Test manual de la función
SELECT create_checkout_order(
  'Test User',
  'test@example.com',
  NULL,
  'Test Address',
  'Madrid',
  '28001',
  'España',
  100.00,
  NULL,
  '[]'::jsonb
);

-- Debe retornar JSON: {"order_id": "...", "order_number": 123}
```

**Criterios de éxito:**
- [ ] Función retorna JSON con ambos campos
- [ ] `order_number` es un entero positivo
- [ ] Pedido se crea correctamente en la tabla

---

## 🟡 FASE 3: ACTUALIZACIÓN DE BACKEND (APIs y Servicios)

### Tarea 3.1: Actualizar API Create Session
**Archivo:** `src/pages/api/checkout/create-session.ts`
**Tiempo estimado:** 30 min

**Cambios a realizar:**

1. **Importar utilidades (línea ~3):**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar llamada RPC (línea ~113):**
   ```typescript
   // ANTES:
   const { data: orderId, error: orderError } = await supabase.rpc('create_checkout_order', { ... });
   
   // DESPUÉS:
   const { data: orderResult, error: orderError } = await supabase.rpc('create_checkout_order', { ... });
   
   if (orderError || !orderResult) {
     // rollback...
   }
   
   const orderId = orderResult.order_id;
   const orderNumber = orderResult.order_number;
   const formattedOrderId = formatOrderId(orderNumber);
   
   console.log(`Order created: ${formattedOrderId} (UUID: ${orderId})`);
   ```

3. **Actualizar metadata de Stripe (línea ~190):**
   ```typescript
   metadata: {
     order_id: orderId,
     order_number: orderNumber,
     order_slug: formattedOrderId,
     coupon_id: validatedCoupon?.id || ''
   }
   ```

4. **Actualizar referencias a `orderId` en rollbacks (múltiples líneas):**
   - Asegurar que todas las referencias usan `orderId` (el UUID)
   - Añadir logs con `formattedOrderId` para debugging

**Verificación:**
- [ ] Código compila sin errores TypeScript
- [ ] No hay referencias a `orderId` sin definir
- [ ] Metadata incluye los 3 campos nuevos

---

### Tarea 3.2: Actualizar API Invoices
**Archivo:** `src/pages/api/invoices/request.ts`
**Tiempo estimado:** 20 min

**Cambios a realizar:**

1. **Importar utilidades (línea ~3):**
   ```typescript
   import { formatOrderId, formatInvoiceNumber } from '@/lib/order-utils';
   ```

2. **Actualizar query de pedido (línea ~44):**
   ```typescript
   const { data: order, error: orderError } = await supabase
     .from('orders')
     .select('id, order_number, customer_email, total_amount, created_at, status')
     .eq('id', orderId)
     .eq('customer_email', user.email)
     .in('status', ['paid', 'shipped', 'delivered'])
     .single();
   ```

3. **Usar nuevo formato en generación (línea ~100+):**
   ```typescript
   const formattedOrderId = formatOrderId(order.order_number);
   const invoiceNumber = formatInvoiceNumber(order.order_number);
   
   // Pasar al PDF generator
   const pdfBuffer = await generateInvoicePDF({
     orderId: formattedOrderId,
     invoiceNumber: invoiceNumber,
     // ... resto
   });
   ```

**Verificación:**
- [ ] Código compila
- [ ] Query incluye `order_number`
- [ ] Formato de factura es correcto

---

### Tarea 3.3: Actualizar Email Service
**Archivo:** `src/lib/email.ts`
**Tiempo estimado:** 45 min

**Cambios a realizar:**

1. **Importar utilidades (línea ~2):**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar interfaz `OrderEmailData` (línea ~15):**
   ```typescript
   export interface OrderEmailData {
     orderId: string;
     orderNumber: number;  // ⚠️ NUEVO
     customerName: string;
     // ... resto sin cambios
   }
   ```

3. **Actualizar `sendOrderConfirmation` (línea ~35):**
   ```typescript
   export async function sendOrderConfirmation(order: OrderEmailData): Promise<{ success: boolean; error?: string }> {
     // ...
     const formattedOrderId = formatOrderId(order.orderNumber);
     
     // En subject:
     subject: `✓ Pedido confirmado ${formattedOrderId} - FashionStore`,
     
     // En ticket PDF:
     ticketBuffer = await generateTicketPDF({
       orderId: formattedOrderId,  // Cambiar de order.orderId
       // ... resto
     });
     
     // En nombre de archivo:
     filename: `ticket-${formattedOrderId.replace('#', '')}.pdf`,
   }
   ```

4. **Actualizar interfaz `OrderShippedData` en `email-templates.ts`:**
   ```typescript
   export interface OrderShippedData {
     orderId: string;
     orderNumber?: number;  // ⚠️ NUEVO (opcional para compatibilidad)
     // ... resto
   }
   ```

5. **Actualizar `sendOrderShipped` (línea ~110):**
   ```typescript
   export async function sendOrderShipped(data: OrderShippedData): Promise<{ success: boolean; error?: string }> {
     // ...
     const displayId = data.orderNumber 
       ? formatOrderId(data.orderNumber) 
       : `#${data.orderId.slice(0, 8).toUpperCase()}`; // Fallback
     
     // En subject:
     subject: `🚚 ¡Tu pedido ${displayId} ha sido enviado! - FashionStore`,
   }
   ```

6. **Actualizar `sendReturnConfirmation` (similar):**
   ```typescript
   // Añadir orderNumber al interface ReturnEmailData
   // Usar formatOrderId en subject y body
   ```

**Verificación:**
- [ ] Interfaces actualizadas
- [ ] Todas las funciones usan el nuevo formato
- [ ] Fallbacks funcionan para datos antiguos
- [ ] Código compila sin errores

---

### Tarea 3.4: Actualizar Webhooks
**Archivo:** `src/pages/api/webhooks/stripe.ts`
**Tiempo estimado:** 20 min

**Cambios a realizar:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **En handler de `checkout.session.completed`:**
   ```typescript
   case 'checkout.session.completed': {
     const session = event.data.object;
     const orderId = session.metadata?.order_id;
     const orderNumber = session.metadata?.order_number;
     
     console.log(`Payment completed for order: ${formatOrderId(Number(orderNumber))} (UUID: ${orderId})`);
     
     // Al llamar sendOrderConfirmation, incluir orderNumber
     // (Obtener de la BD si no está en metadata)
   }
   ```

**Verificación:**
- [ ] Logs muestran formato correcto
- [ ] Webhook procesa metadata correctamente

---

## 🔴 FASE 4: ACTUALIZACIÓN DE FRONTEND (Componentes y Páginas)

### Tarea 4.1: Actualizar Admin - Listado de Pedidos
**Archivo:** `src/pages/admin/pedidos/index.astro`
**Tiempo estimado:** 40 min

**Cambios:**

1. **Importar utilidades (línea ~3):**
   ```typescript
   import { formatOrderId, parseOrderId, isOrderIdFormat } from '@/lib/order-utils';
   ```

2. **Actualizar query base (línea ~11):**
   ```typescript
   let query = supabase
     .from("orders")
     .select("*, order_number", { count: "exact" })
     .order("created_at", { ascending: false });
   ```

3. **Implementar búsqueda inteligente (después de línea ~15):**
   ```typescript
   const searchTerm = Astro.url.searchParams.get("search");
   
   if (searchTerm) {
     const trimmed = searchTerm.trim();
     
     if (isOrderIdFormat(trimmed)) {
       const parsedNumber = parseOrderId(trimmed);
       if (parsedNumber) {
         query = query.eq("order_number", parsedNumber);
       }
     } else {
       query = query.or(`customer_email.ilike.%${trimmed}%,customer_name.ilike.%${trimmed}%`);
     }
   }
   ```

4. **Añadir campo de búsqueda en HTML (antes de la tabla):**
   ```astro
   <form method="GET" action="/admin/pedidos" class="mb-6">
     <div class="flex gap-2">
       <input
         type="text"
         name="search"
         placeholder="Buscar por #A000001, email o nombre..."
         value={searchTerm || ""}
         class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
       />
       <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
         Buscar
       </button>
       {searchTerm && (
         <a href="/admin/pedidos" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
           Limpiar
         </a>
       )}
     </div>
   </form>
   ```

5. **Actualizar display en tabla (columna de ID):**
   ```astro
   <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
     <a href={`/admin/pedidos/${order.id}`} class="text-blue-400 hover:text-blue-300">
       {formatOrderId(order.order_number)}
     </a>
   </td>
   ```

**Verificación:**
- [ ] Página carga sin errores
- [ ] Todos los pedidos muestran formato `#A000XXX`
- [ ] Búsqueda por número funciona
- [ ] Búsqueda por email funciona
- [ ] Links funcionan correctamente

---

### Tarea 4.2: Actualizar Admin - Detalle de Pedido
**Archivo:** `src/pages/admin/pedidos/[id].astro`
**Tiempo estimado:** 20 min

**Cambios:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar query (línea ~10+):**
   ```typescript
   const { data: order } = await supabase
     .from("orders")
     .select(`
       *,
       order_number,
       order_items (
         id,
         quantity,
         price_at_purchase,
         product:products (id, name, slug),
         variant:product_variants (id, size)
       )
     `)
     .eq("id", id)
     .single();
   ```

3. **Actualizar header:**
   ```astro
   <div class="flex items-center justify-between mb-6">
     <h1 class="text-3xl font-bold text-white">
       Pedido {formatOrderId(order.order_number)}
     </h1>
     <span class="text-gray-400 text-sm">UUID: {order.id}</span>
   </div>
   ```

**Verificación:**
- [ ] Página carga correctamente
- [ ] Header muestra formato correcto
- [ ] UUID visible para debugging

---

### Tarea 4.3: Actualizar Admin - Devoluciones
**Archivos:** 
- `src/pages/admin/devoluciones/index.astro`
- `src/pages/admin/devoluciones/[id].astro`

**Tiempo estimado:** 25 min

**Cambios en `index.astro`:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar query:**
   ```typescript
   const { data: returns } = await supabase
     .from("returns")
     .select(`
       *,
       order:orders (
         id,
         order_number,
         customer_name,
         customer_email
       )
     `)
     .order("created_at", { ascending: false });
   ```

3. **Actualizar display:**
   ```astro
   <td class="px-6 py-4">
     <a href={`/admin/pedidos/${ret.order.id}`} class="text-blue-400 hover:text-blue-300">
       {formatOrderId(ret.order.order_number)}
     </a>
   </td>
   ```

**Cambios similares en `[id].astro`**

**Verificación:**
- [ ] Listado muestra números correctamente
- [ ] Links a pedidos funcionan
- [ ] Detalle de devolución muestra número del pedido

---

### Tarea 4.4: Actualizar Área Cliente - Listado
**Archivo:** `src/pages/cuenta/pedidos/index.astro`
**Tiempo estimado:** 20 min

**Cambios:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar query:**
   ```typescript
   const { data: orders } = await supabase
     .from("orders")
     .select("*, order_number")
     .eq("customer_email", user.email)
     .order("created_at", { ascending: false });
   ```

3. **Actualizar display en tarjetas:**
   ```astro
   <h3 class="text-lg font-semibold text-gray-900">
     Pedido {formatOrderId(order.order_number)}
   </h3>
   ```

**Verificación:**
- [ ] Página carga correctamente
- [ ] Tarjetas muestran formato correcto
- [ ] Links funcionan

---

### Tarea 4.5: Actualizar Área Cliente - Detalle
**Archivo:** `src/pages/cuenta/pedidos/[id].astro`
**Tiempo estimado:** 30 min

**Cambios:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar query:**
   ```typescript
   const { data: order } = await supabase
     .from("orders")
     .select(`
       *,
       order_number,
       order_items (
         id,
         quantity,
         price_at_purchase,
         product:products (id, name, slug),
         variant:product_variants (id, size)
       )
     `)
     .eq("id", id)
     .eq("customer_email", user.email)
     .single();
   ```

3. **Actualizar título:**
   ```astro
   <h1 class="text-3xl font-bold text-gray-900 mb-2">
     Pedido {formatOrderId(order.order_number)}
   </h1>
   ```

4. **Actualizar componente InvoiceButton:**
   ```astro
   <InvoiceButton
     orderId={order.id}
     orderNumber={order.order_number}
     orderStatus={order.status}
     client:load
   />
   ```

**Verificación:**
- [ ] Página carga
- [ ] Título correcto
- [ ] Botón de factura recibe props correctas

---

### Tarea 4.6: Actualizar Página de Éxito
**Archivo:** `src/pages/checkout/exito.astro`
**Tiempo estimado:** 35 min

**Cambios:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar query de order (línea ~75):**
   ```typescript
   const { data: orderData } = await supabase
     .from("orders")
     .select("*, order_number")
     .eq("id", session.metadata.order_id)
     .single();
   ```

3. **Actualizar emailData (línea ~85+):**
   ```typescript
   const emailData = {
     orderId: order.id,
     orderNumber: order.order_number,  // ⚠️ NUEVO
     customerName: order.customer_name,
     customerEmail: order.customer_email,
     shippingAddress: order.shipping_address,
     shippingCity: order.shipping_city,
     shippingPostalCode: order.shipping_postal_code,
     shippingCountry: order.shipping_country,
     totalAmount: order.total_amount,
     orderDate: new Date(order.created_at),
     items: orderItems.map((item: any) => ({
       productName: item.product.name,
       size: item.variant.size,
       quantity: item.quantity,
       price: item.price_at_purchase,
     })),
   };
   ```

4. **Actualizar display en HTML:**
   ```astro
   <h1 class="text-4xl font-bold text-green-600 mb-4">
     ¡Pedido Confirmado!
   </h1>
   <p class="text-xl text-gray-700 mb-8">
     Tu pedido {formatOrderId(order.order_number)} ha sido recibido correctamente
   </p>
   ```

**Verificación:**
- [ ] Página muestra número correcto
- [ ] Email se envía con número correcto
- [ ] No hay errores en consola

---

### Tarea 4.7: Actualizar Componentes React
**Archivos:**
- `src/components/InvoiceButton.tsx`
- `src/components/RequestInvoiceModal.tsx`

**Tiempo estimado:** 25 min

**Cambios en `InvoiceButton.tsx`:**

1. **Importar utilidades:**
   ```typescript
   import { formatOrderId } from '@/lib/order-utils';
   ```

2. **Actualizar interfaz:**
   ```typescript
   interface InvoiceButtonProps {
     orderId: string;
     orderNumber: number;  // ⚠️ CAMBIAR de string a number
     orderStatus: string;
   }
   ```

3. **Formatear en el componente:**
   ```typescript
   export default function InvoiceButton({ orderId, orderNumber, orderStatus }: InvoiceButtonProps) {
     const formattedOrderId = formatOrderId(orderNumber);
     
     return (
       <>
         {/* ... */}
         <RequestInvoiceModal
           orderId={orderId}
           orderNumber={formattedOrderId}  // Pasar ya formateado
           onClose={() => setShowModal(false)}
           onSuccess={handleSuccess}
         />
       </>
     );
   }
   ```

**Cambios en `RequestInvoiceModal.tsx`:**

1. **Interfaz ya recibe string formateado:**
   ```typescript
   interface RequestInvoiceModalProps {
     orderId: string;
     orderNumber: string;  // Ya viene como #A000001
     onClose: () => void;
     onSuccess: () => void;
   }
   ```

2. **Display en modal:**
   ```tsx
   <h3 className="text-lg font-semibold mb-4">
     Solicitar Factura - Pedido {orderNumber}
   </h3>
   ```

**Verificación:**
- [ ] Componentes compilan sin errores TypeScript
- [ ] Props se pasan correctamente
- [ ] Display es correcto

---

## ✅ FASE 5: TESTING Y VERIFICACIÓN

### Tarea 5.1: Tests Unitarios
**Tiempo estimado:** 15 min

**Comandos:**
```bash
npm run test src/lib/order-utils.test.ts
npm run type-check
npm run lint
```

**Verificación:**
- [ ] Todos los tests pasan
- [ ] No hay errores TypeScript
- [ ] No hay warnings de lint

---

### Tarea 5.2: Test Manual - Checkout Flow
**Tiempo estimado:** 20 min

**Pasos:**
1. Añadir producto al carrito
2. Ir a checkout
3. Completar formulario
4. Usar tarjeta de prueba: `4242 4242 4242 4242`, exp `12/34`, CVC `123`
5. Completar pago

**Verificar:**
- [ ] Página éxito muestra `#A000XXX`
- [ ] Email recibido tiene formato correcto
- [ ] PDF adjunto tiene número correcto
- [ ] Stripe Dashboard > Payments > metadata correcto

---

### Tarea 5.3: Test Manual - Admin Panel
**Tiempo estimado:** 15 min

**Pasos:**
1. Login como admin
2. Ir a `/admin/pedidos`
3. Verificar listado
4. Buscar por `#A000001`
5. Buscar por `A1`
6. Buscar por `1`
7. Buscar por email
8. Entrar al detalle

**Verificar:**
- [ ] Todos los pedidos muestran `#A000XXX`
- [ ] Búsqueda por número funciona
- [ ] Búsqueda por email funciona
- [ ] Detalle muestra formato correcto
- [ ] Cambio de estado funciona

---

### Tarea 5.4: Test Manual - Área Cliente
**Tiempo estimado:** 15 min

**Pasos:**
1. Login como cliente
2. Ir a `/cuenta/pedidos`
3. Verificar listado
4. Entrar al detalle de un pedido `paid`
5. Solicitar factura

**Verificar:**
- [ ] Listado muestra `#A000XXX`
- [ ] Detalle muestra formato correcto
- [ ] Factura se genera con `FV-A000XXX`
- [ ] PDF correcto

---

### Tarea 5.5: Test Manual - Emails
**Tiempo estimado:** 10 min

**Pasos:**
1. Marcar un pedido como `shipped` desde admin
2. Revisar email recibido

**Verificar:**
- [ ] Asunto tiene `#A000XXX`
- [ ] Cuerpo muestra número correcto

---

## 🚀 FASE 6: DEPLOY A PRODUCCIÓN

### Tarea 6.1: Merge y Build
**Tiempo estimado:** 15 min

**Pasos:**
```bash
# Asegurar que estás en la rama correcta
git checkout feature/order-number-migration

# Pull latest main
git checkout main
git pull origin main

# Merge feature
git merge feature/order-number-migration

# Build local
npm run build

# Verificar que no hay errores
```

**Verificación:**
- [ ] Build exitoso
- [ ] No hay errores TypeScript
- [ ] No hay warnings críticos

---

### Tarea 6.2: Deploy
**Tiempo estimado:** 10 min

**Pasos:**
```bash
# Push a main
git push origin main

# Verificar en plataforma de hosting (Vercel/Netlify/etc.)
# Esperar a que el deploy complete
```

**Verificación:**
- [ ] Deploy exitoso
- [ ] Logs sin errores
- [ ] Health check OK

---

### Tarea 6.3: Smoke Test en Producción
**Tiempo estimado:** 20 min

**Tests críticos:**
1. Crear pedido real de prueba (bajo valor)
2. Verificar email
3. Verificar admin
4. Verificar factura

**Verificación:**
- [ ] Checkout funciona
- [ ] Emails llegan con formato correcto
- [ ] Admin muestra números correctos
- [ ] Búsqueda funciona
- [ ] Facturas se generan correctamente

---

### Tarea 6.4: Monitorización
**Tiempo estimado:** Continuo (primeras 24h)

**Métricas a vigilar:**

1. **Logs de aplicación:**
   ```bash
   # Buscar errores relacionados
   grep -i "order_number" logs/app.log
   grep -i "formatOrderId" logs/app.log
   ```

2. **Base de datos:**
   ```sql
   -- Pedidos creados desde el deploy
   SELECT id, order_number, created_at 
   FROM orders 
   WHERE created_at > '2026-01-15 12:00:00' 
   ORDER BY created_at DESC 
   LIMIT 10;
   
   -- Verificar que no hay nulls nuevos
   SELECT COUNT(*) FROM orders WHERE order_number IS NULL AND created_at > '2026-01-15 12:00:00';
   ```

3. **Stripe Dashboard:**
   - Verificar metadata en nuevos payments
   - Verificar que `order_slug` está presente

4. **Emails:**
   - Verificar logs de Resend
   - Confirmar formato correcto en asuntos

**Alertas críticas:**
- 🔴 Pedidos sin `order_number` después del deploy
- 🔴 Errores 500 en checkout
- 🔴 Emails no se envían
- 🟡 Búsquedas lentas en admin (>2s)

---

## 📊 RESUMEN DE TIEMPO ESTIMADO

| Fase | Tiempo | Impacto |
|------|--------|---------|
| Fase 1: Preparación | 1.5h | ✅ Ninguno |
| Fase 2: Base de Datos | 1h | 🔴 Alto (mantenimiento) |
| Fase 3: Backend | 2.5h | ✅ Ninguno (hasta deploy) |
| Fase 4: Frontend | 3.5h | ✅ Ninguno (hasta deploy) |
| Fase 5: Testing | 1.5h | ✅ Ninguno |
| Fase 6: Deploy | 1h | 🟡 Medio |
| **TOTAL** | **11h** | - |

---

## 🎯 CHECKLIST FINAL PRE-DEPLOY

### Base de Datos
- [ ] Migración 026 ejecutada y verificada
- [ ] Todos los pedidos tienen `order_number`
- [ ] Secuencia configurada correctamente
- [ ] RPC actualizado y probado
- [ ] Backup reciente disponible

### Código
- [ ] Todos los tests pasan
- [ ] No hay errores TypeScript
- [ ] Build exitoso
- [ ] Código commiteado y pusheado

### Testing
- [ ] Smoke test checkout OK
- [ ] Smoke test admin OK
- [ ] Smoke test área cliente OK
- [ ] Smoke test facturas OK
- [ ] Smoke test emails OK

### Documentación
- [ ] README actualizado
- [ ] Plan de migración completo
- [ ] Rollback documentado
- [ ] Equipo informado

### Producción
- [ ] Ventana de mantenimiento comunicada
- [ ] Monitorización configurada
- [ ] Plan de contingencia preparado
- [ ] Contactos de emergencia disponibles

---

## 🆘 CONTINGENCIAS

### Si el checkout falla después del deploy:

1. **Verificar logs:**
   ```bash
   # Buscar errores específicos
   grep -i "create_checkout_order" logs/app.log | tail -50
   ```

2. **Verificar que RPC retorna JSON correcto:**
   ```sql
   SELECT create_checkout_order(...); -- Test manual
   ```

3. **Si es crítico:**
   ```bash
   # Rollback de código
   git revert HEAD
   git push origin main
   ```

### Si emails no se envían:

1. **Verificar interfaz `OrderEmailData`:**
   - Todas las llamadas pasan `orderNumber`

2. **Fallback temporal:**
   ```typescript
   // En email.ts, añadir fallback
   const displayId = order.orderNumber 
     ? formatOrderId(order.orderNumber)
     : `#${order.orderId.slice(0, 8).toUpperCase()}`;
   ```

### Si búsqueda en admin no funciona:

1. **Verificar índice:**
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'orders';
   ```

2. **Verificar query:**
   - Logs de Supabase
   - Network tab del navegador

### Si facturación falla:

1. **Verificar query incluye `order_number`**
2. **Verificar función `formatInvoiceNumber`**
3. **Logs del PDF generator**

---

## 📞 CONTACTOS

- **Desarrollador Principal:** [Tu nombre]
- **DBA / DevOps:** [Contacto]
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://support.stripe.com

---

## ✨ MEJORAS POST-IMPLEMENTACIÓN

Una vez estabilizado el sistema (1-2 semanas):

- [ ] Migrar pedidos antiguos para mostrar formato legacy
- [ ] Implementar exportación CSV con nuevo formato
- [ ] API de tracking público por número
- [ ] Dashboard de analytics
- [ ] Etiquetas de envío con QR
- [ ] Optimización de índices si hay performance issues

---

**Última actualización:** 15/01/2026
**Versión del plan:** 1.0
