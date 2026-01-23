# 🔍 Análisis del Sistema de Devoluciones - Admin Panel

**Fecha:** 23 de Enero, 2026  
**Autor:** Análisis Técnico Senior  
**Versión:** 1.0  
**Estado:** Completado

---

## 1. Resumen Ejecutivo

El sistema de devoluciones de FashionStore está **funcional pero presenta inconsistencias importantes** en el flujo de estados que afectan la experiencia del administrador. 

### 🔴 Hallazgos Críticos

1. **El problema de "aprobación prematura" NO es un bug de auto-aprobación**, sino una **falta del estado `shipped` en la interfaz del cliente** - el cliente no tiene manera de indicar que envió el paquete, por lo que el admin puede marcar como "recibida" una devolución que aún no ha sido enviada.

2. **Sin reembolso real vía Stripe** - El sistema marca devoluciones como "completadas" pero **NO ejecuta el reembolso** en Stripe.

3. **Falta validación de cantidades** - Se puede solicitar devolver más unidades de las compradas.

---

## 2. Análisis Técnico Detallado

### 2.1 Arquitectura y Estructura de Archivos

#### ✅ Organización General: **CORRECTA**

```
src/
├── pages/
│   ├── api/
│   │   ├── returns.ts              # API cliente (POST/GET)
│   │   └── admin/returns.ts        # API admin (GET/PUT/PATCH)
│   └── admin/
│       └── devoluciones/
│           ├── index.astro         # Lista de devoluciones
│           └── [id].astro          # Detalle de devolución
├── components/
│   └── orders/
│       └── OrderActions.tsx        # Solicitud de devolución cliente
└── lib/
    └── email.ts                    # Templates de email
```

#### 📋 Archivos Clave de Devoluciones

| Archivo | Propósito | Líneas | Estado |
|---------|-----------|--------|--------|
| [src/pages/api/returns.ts](src/pages/api/returns.ts) | API cliente para crear/ver devoluciones | 289 | ⚠️ Falta validación |
| [src/pages/api/admin/returns.ts](src/pages/api/admin/returns.ts) | API admin para gestionar devoluciones | 319 | ⚠️ Sin reembolso Stripe |
| [src/pages/admin/devoluciones/index.astro](src/pages/admin/devoluciones/index.astro) | Lista de devoluciones admin | 232 | ✅ OK |
| [src/pages/admin/devoluciones/[id].astro](src/pages/admin/devoluciones/[id].astro) | Detalle de devolución admin | 478 | ✅ OK |
| [src/components/orders/OrderActions.tsx](src/components/orders/OrderActions.tsx) | Modal de solicitud cliente | 552 | ⚠️ Falta marcar envío |

---

### 2.2 Flujo de Estados - Análisis Profundo

#### Estados Definidos en Base de Datos

```sql
-- Doc/migrations/021_create_returns_system.sql (línea 27-35)
status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
  'requested',   -- Solicitud enviada por cliente
  'approved',    -- Aprobada por admin, esperando envío
  'shipped',     -- Cliente ha enviado el paquete
  'received',    -- Paquete recibido, en inspección
  'completed',   -- Reembolso procesado
  'rejected'     -- Rechazada por admin
))
```

#### Diagrama de Flujo de Estados - ACTUAL vs ESPERADO

```
FLUJO ESPERADO (Correcto en BD):
┌─────────────┐    Aprobar    ┌─────────────┐   Cliente    ┌─────────────┐
│  requested  │──────────────▶│  approved   │───envía─────▶│   shipped   │
└─────────────┘               └─────────────┘              └─────────────┘
                                    │                            │
                              Rechazar│                     Admin recibe
                                    ▼                            ▼
                              ┌─────────────┐              ┌─────────────┐
                              │  rejected   │              │  received   │
                              └─────────────┘              └─────────────┘
                                                                 │
                                                           Completar
                                                                 ▼
                                                           ┌─────────────┐
                                                           │  completed  │
                                                           └─────────────┘

FLUJO ACTUAL (Bug de implementación):
┌─────────────┐    Aprobar    ┌─────────────┐   Admin      ┌─────────────┐
│  requested  │──────────────▶│  approved   │───recibe────▶│  received   │
└─────────────┘               └─────────────┘   DIRECTAMENTE└─────────────┘
                                                    ⚠️ SE SALTA "shipped"
```

#### 🔴 PROBLEMA CRÍTICO IDENTIFICADO

**Causa Raíz:** El cliente **NO tiene interfaz para marcar el envío** de su devolución.

**Ubicación del problema:**
- [src/components/orders/OrderActions.tsx](src/components/orders/OrderActions.tsx#L265-L279)

```tsx
// Líneas 265-279: Solo muestra instrucciones, pero NO hay botón para marcar envío
{(existingReturn.status === 'approved' || existingReturn.status === 'requested') && (
  <div className="bg-muted/30 border-t border-current/10 p-4 space-y-3">
    <div className="flex items-start gap-2">
      <p className="text-xs text-muted-foreground">
        Incluye el número de pedido en el paquete...
      </p>
    </div>
    {/* ⚠️ FALTA: Botón "He enviado mi paquete" */}
  </div>
)}
```

**Función SQL que SÍ existe pero NO se usa:**
- [Doc/migrations/028_add_return_order_statuses.sql](Doc/migrations/028_add_return_order_statuses.sql#L189-L226)

```sql
-- Función disponible pero NO implementada en frontend
CREATE OR REPLACE FUNCTION mark_return_shipped(
  p_return_id UUID,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
-- ... permite al cliente marcar su devolución como enviada
```

**Impacto:**
- El admin ve devoluciones en estado "aprobada" y puede marcarlas como "recibidas" sin que el cliente haya enviado nada
- Crea confusión sobre qué devoluciones están realmente en tránsito

---

### 2.3 Seguridad y Permisos (RLS)

#### ✅ Políticas Correctamente Implementadas

```sql
-- Doc/migrations/021_create_returns_system.sql (líneas 151-170)

-- Usuarios solo ven sus propias devoluciones
CREATE POLICY "Users can view their own returns" ON returns
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- Solo admins pueden actualizar devoluciones
CREATE POLICY "Admins can update returns" ON returns
  FOR UPDATE USING (is_admin());
```

#### ⚠️ Vulnerabilidades Menores Detectadas

| Problema | Ubicación | Riesgo | Solución |
|----------|-----------|--------|----------|
| Sin política DELETE | `returns` table | Bajo | Añadir política para admins |
| `customer_notes` sin sanitización | API returns.ts L30 | Bajo | Validar longitud y caracteres |

---

### 2.4 Integración con Stripe - CRÍTICO

#### 🔴 Sin Reembolso Real

**Ubicación:** [src/pages/api/admin/returns.ts](src/pages/api/admin/returns.ts#L145-L165)

```typescript
// Líneas 145-165: Solo llama a RPC, NO procesa reembolso
const { error } = await supabase.rpc("process_return", {
  p_return_id: return_id,
  p_action: action,  // 'complete' NO ejecuta refund en Stripe
  p_notes: notes || null,
  // ⚠️ NO hay llamada a stripe.refunds.create()
});
```

**Comparación con cancelaciones (SÍ funciona):**
- [src/pages/api/orders/cancel.ts](src/pages/api/orders/cancel.ts#L97-L103) **SÍ** procesa reembolsos:

```typescript
// Líneas 97-103: Cancelaciones SÍ usan Stripe
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: 'requested_by_customer',
});
```

---

## 3. Análisis de UX - Perspectiva No Técnica

### 3.1 Problemas de Usabilidad Identificados

#### 📍 Panel Admin - Devoluciones

| #  | Problema | Severidad | Ubicación |
|----|----------|-----------|-----------|
| 1  | Sin búsqueda por cliente/pedido | Alta | [index.astro](src/pages/admin/devoluciones/index.astro) |
| 2  | Sin paginación (escala mal) | Media | [index.astro](src/pages/admin/devoluciones/index.astro) |
| 3  | Sin acciones en lote | Media | Todo el módulo |
| 4  | Confirmaciones con `prompt()` nativo | Baja | [[id].astro](src/pages/admin/devoluciones/[id].astro#L411) |
| 5  | Sin indicador de devoluciones nuevas | Alta | Sidebar/Dashboard |

#### 📍 Flujo del Administrador - Análisis de Clics

**Aprobar una devolución simple:**
1. Click en "Devoluciones" en sidebar
2. Click en "Ver detalles" de la devolución
3. Click en "Aprobar Devolución"
4. **Total: 3 clicks** ✅ Aceptable

**Completar con inspección de items:**
1. Click en "Devoluciones" en sidebar
2. Click en "Ver detalles"
3. Click "Marcar como Recibida"
4. Click "✓ Aprobar" por cada item
5. Click "Completar y Reembolsar"
6. **Total: 5+ clicks** ⚠️ Podría optimizarse

### 3.2 Propuestas de Mejora UX

#### Mejora 1: Indicador de Devoluciones Pendientes

```astro
<!-- En AdminLayout.astro - Sidebar -->
<a href="/admin/devoluciones" class="sidebar-link">
  Devoluciones
  {pendingReturnsCount > 0 && (
    <span class="badge-warning">{pendingReturnsCount}</span>
  )}
</a>
```

#### Mejora 2: Búsqueda Rápida

```astro
<!-- En index.astro -->
<input 
  type="search" 
  placeholder="Buscar por cliente, pedido o email..."
  class="admin-input"
/>
```

---

## 4. Errores e Inconsistencias Detectados

### 4.1 Bugs Funcionales

| #  | Bug | Severidad | Archivo | Línea |
|----|-----|-----------|---------|-------|
| 1  | Cliente no puede marcar envío | 🔴 Crítico | OrderActions.tsx | 265-279 |
| 2  | Reembolso no ejecuta Stripe | 🔴 Crítico | admin/returns.ts | 145-165 |
| 3  | Sin validación de cantidad máxima | 🟡 Medio | returns.ts | 131 |
| 4  | `delivered_at` no se actualiza | 🟡 Medio | admin/pedidos.ts | - |

### 4.2 Code Smells

| #  | Smell | Archivo | Línea | Solución |
|----|-------|---------|-------|----------|
| 1  | Dirección hardcodeada | OrderActions.tsx | 287-291 | Mover a settings |
| 2  | Razones de devolución duplicadas | OrderActions.tsx + returns.ts | 28-35 | Crear constante compartida |
| 3  | Magic number 30 (días) | OrderActions.tsx | 201 | Usar settings.return_window_days |

### 4.3 Inconsistencias de Estados en Vistas

| Vista | Estados Soportados | Faltantes |
|-------|-------------------|-----------|
| admin/index.astro | 11 ✅ | - |
| admin/pedidos/[id].astro | 5 ❌ | `return_*` (6 estados) |
| cuenta/pedidos/[id].astro | 5 ❌ | `return_*` (6 estados) |
| cuenta/pedidos/index.astro | 5 ❌ | `return_*` (6 estados) |

---

## 5. Solución al Bug de Estados

### 5.1 Diagnóstico

**Síntoma reportado:** "Hay un fallo de lógica con los estados que hace que tenga que aprobarla antes de que me llegue"

**Interpretación correcta:** El admin percibe que "aprueba" una devolución pero luego no sabe si el cliente la envió. El sistema permite pasar de "approved" directamente a "received" sin verificar "shipped".

### 5.2 Causa Raíz

La función `mark_return_shipped` existe en la base de datos pero **nunca se expuso al frontend del cliente**.

**Ubicación:**
- ✅ SQL: [028_add_return_order_statuses.sql#L189-L226](Doc/migrations/028_add_return_order_statuses.sql#L189-L226)
- ❌ API: No existe `/api/returns/ship`
- ❌ UI: No hay botón en OrderActions.tsx

### 5.3 Solución Propuesta

#### Paso 1: Crear Endpoint API

```typescript
// NUEVO: src/pages/api/returns/ship.ts
import type { APIRoute } from "astro";
import { createAuthenticatedClient } from "@/lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;
  
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  const supabase = createAuthenticatedClient(accessToken, refreshToken);
  const { return_id, tracking_number } = await request.json();

  const { error } = await supabase.rpc("mark_return_shipped", {
    p_return_id: return_id,
    p_tracking_number: tracking_number || null,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
```

#### Paso 2: Añadir Botón en UI Cliente

```tsx
// MODIFICAR: src/components/orders/OrderActions.tsx
// Después de línea 279, dentro del bloque existingReturn.status === 'approved'

{existingReturn.status === 'approved' && (
  <div className="mt-4 space-y-3">
    <input
      type="text"
      placeholder="Número de seguimiento (opcional)"
      value={trackingNumber}
      onChange={(e) => setTrackingNumber(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg"
    />
    <button
      onClick={handleMarkShipped}
      className="w-full px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg"
    >
      📦 He enviado mi paquete
    </button>
  </div>
)}
```

#### Paso 3: Integrar Reembolso Stripe

```typescript
// MODIFICAR: src/pages/api/admin/returns.ts
// En la acción 'complete', después de llamar al RPC

if (action === 'complete') {
  // Obtener datos para reembolso
  const { data: returnData } = await supabase
    .from('returns')
    .select('refund_amount, orders:order_id (stripe_session_id)')
    .eq('id', return_id)
    .single();

  if (returnData?.orders?.stripe_session_id && returnData.refund_amount > 0) {
    const session = await stripe.checkout.sessions.retrieve(
      returnData.orders.stripe_session_id
    );
    
    if (session.payment_intent) {
      await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
        amount: Math.round(returnData.refund_amount * 100), // Convertir a centavos
        reason: 'requested_by_customer',
      });
    }
  }
}
```

---

## 6. Plan de Acción Priorizado

### Fase 1: Correcciones Críticas (1-2 días)

| Prioridad | Tarea | Esfuerzo | Archivos |
|-----------|-------|----------|----------|
| 🔴 P0 | Crear `/api/returns/ship` | 2h | Nuevo archivo |
| 🔴 P0 | Añadir botón "He enviado" en OrderActions | 2h | OrderActions.tsx |
| 🔴 P0 | Integrar reembolso Stripe | 4h | admin/returns.ts |
| 🔴 P0 | Añadir validación de cantidad máxima | 1h | returns.ts |

### Fase 2: Mejoras de UX (3-4 días)

| Prioridad | Tarea | Esfuerzo | Archivos |
|-----------|-------|----------|----------|
| 🟡 P1 | Unificar estados en todas las vistas | 3h | pedidos/[id].astro (x2) |
| 🟡 P1 | Añadir búsqueda en lista devoluciones | 2h | admin/devoluciones/index.astro |
| 🟡 P1 | Indicador de pendientes en sidebar | 1h | AdminLayout.astro |
| 🟡 P1 | Mover dirección a configuración | 2h | email.ts, OrderActions.tsx |

### Fase 3: Mejoras Avanzadas (1 semana)

| Prioridad | Tarea | Esfuerzo | Archivos |
|-----------|-------|----------|----------|
| 🟢 P2 | Tabla return_status_history | 4h | Nueva migración |
| 🟢 P2 | Dashboard de métricas | 8h | Nuevos componentes |
| 🟢 P2 | Etiquetas de devolución PDF | 8h | Nueva funcionalidad |
| 🟢 P2 | Acciones en lote | 4h | index.astro |

---

## 7. Conclusiones y Recomendaciones

### ✅ Aspectos Positivos

1. **Arquitectura correcta** - Separación clara entre API cliente y admin
2. **RLS bien implementado** - Seguridad a nivel de base de datos
3. **Emails completos** - Templates profesionales para notificaciones
4. **Flujo SQL correcto** - La función `process_return` es robusta

### ⚠️ Prioridades Inmediatas

1. **IMPLEMENTAR** el endpoint y UI para que el cliente marque el envío
2. **INTEGRAR** reembolsos reales con Stripe (como ya existe en cancelaciones)
3. **UNIFICAR** los estados de devolución en todas las vistas

### 📊 Métricas de Éxito

Una vez implementadas las correcciones:

- [ ] Cliente puede marcar su devolución como enviada
- [ ] Admin ve claramente qué devoluciones están en tránsito vs esperando envío
- [ ] Reembolsos se procesan automáticamente en Stripe
- [ ] Tiempo promedio de gestión de devolución < 5 clics

---

## Apéndice: Referencias

### Archivos Analizados

1. [Doc/migrations/021_create_returns_system.sql](Doc/migrations/021_create_returns_system.sql)
2. [Doc/migrations/028_add_return_order_statuses.sql](Doc/migrations/028_add_return_order_statuses.sql)
3. [Doc/migrations/029_add_return_label.sql](Doc/migrations/029_add_return_label.sql)
4. [src/pages/api/returns.ts](src/pages/api/returns.ts)
5. [src/pages/api/admin/returns.ts](src/pages/api/admin/returns.ts)
6. [src/pages/admin/devoluciones/index.astro](src/pages/admin/devoluciones/index.astro)
7. [src/pages/admin/devoluciones/[id].astro](src/pages/admin/devoluciones/[id].astro)
8. [src/components/orders/OrderActions.tsx](src/components/orders/OrderActions.tsx)
9. [src/lib/email.ts](src/lib/email.ts)

### Documentación Previa

- [plan_devoluciones_audit.md](Doc/PlanesDesarrollo/Admin/AdminReturns/plan_devoluciones_audit.md) - Auditoría anterior (parcialmente desactualizada)
