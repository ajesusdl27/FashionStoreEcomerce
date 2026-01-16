# 📋 Plan de Implementación: Sistema de Devoluciones (Admin Returns)

**Versión:** 1.0  
**Fecha:** 2026-01-16  
**Estado:** Pendiente de revisión

---

## 📌 Resumen Ejecutivo

El sistema de devoluciones de FashionStore está **parcialmente implementado** pero presenta **deficiencias críticas** que impiden su uso en producción. Este documento detalla los problemas identificados y el plan de corrección.

---

## 🔴 Problemas Críticos Identificados

### 1. Sin Procesamiento Real de Reembolsos en Stripe

**Descripción:** El sistema marca las devoluciones como "completadas" pero **NO ejecuta el reembolso real** a través de Stripe.

**Ubicación:** `process_return` RPC en `Doc/migrations/029_add_return_label.sql`

**Impacto:** El cliente no recibe su dinero aunque el admin marque la devolución como completada.

**Solución:**

```typescript
// Nuevo endpoint: src/pages/api/admin/process-refund.ts
import { stripe } from "@/lib/stripe";

export const POST: APIRoute = async ({ request, cookies }) => {
  // 1. Verificar admin
  // 2. Obtener return con orden y stripe_session_id
  // 3. Recuperar payment_intent de Stripe
  // 4. Crear refund: stripe.refunds.create({ payment_intent, amount })
  // 5. Actualizar return con stripe_refund_id
};
```

---

### 2. Inconsistencia de Estados entre Vistas

**Descripción:** Los estados de pedidos relacionados con devoluciones no se muestran correctamente en todas las vistas.

| Archivo                     | Estados Definidos                  |
| --------------------------- | ---------------------------------- |
| `admin/index.astro`         | ✅ 11 estados (incluye `return_*`) |
| `admin/pedidos/[id].astro`  | ❌ 5 estados (falta `return_*`)    |
| `cuenta/pedidos/[id].astro` | ❌ 5 estados (falta `return_*`)    |

**Solución:** Actualizar `statusConfig` en los archivos afectados:

```typescript
// Añadir a statusConfig en admin/pedidos/[id].astro y cuenta/pedidos/[id].astro
return_requested: { label: "Dev. Solicitada", bgClass: "bg-amber-500/10", textClass: "text-amber-500" },
return_approved: { label: "Dev. Aprobada", bgClass: "bg-amber-500/10", textClass: "text-amber-500" },
return_shipped: { label: "Dev. Enviada", bgClass: "bg-purple-500/10", textClass: "text-purple-500" },
return_received: { label: "Dev. Recibida", bgClass: "bg-cyan-500/10", textClass: "text-cyan-500" },
return_completed: { label: "Reembolsado", bgClass: "bg-emerald-500/10", textClass: "text-emerald-500" },
partially_refunded: { label: "Reemb. Parcial", bgClass: "bg-amber-500/10", textClass: "text-amber-500" },
```

---

### 3. Falta Validación de Cantidades Devueltas

**Descripción:** No se valida que la cantidad a devolver no exceda la cantidad comprada.

**Ubicación:** `src/pages/api/returns.ts` línea 131

**Solución:**

```typescript
// Añadir antes de crear returnItems
for (const item of items) {
  const orderItem = orderItemsMap.get(item.order_item_id);
  if (!orderItem) {
    return new Response(JSON.stringify({ error: "Item no encontrado" }), {
      status: 400,
    });
  }
  if (item.quantity > orderItem.quantity) {
    return new Response(
      JSON.stringify({ error: "Cantidad excede la comprada" }),
      { status: 400 }
    );
  }
}
```

---

### 4. `delivered_at` No Se Actualiza Automáticamente

**Descripción:** Cuando el admin cambia el estado a "delivered", el campo `delivered_at` no se actualiza, causando que la validación de plazo de devolución falle.

**Ubicación:** `src/pages/api/admin/pedidos.ts`

**Solución:**

```typescript
// Al actualizar status a 'delivered'
if (status === "delivered" && currentStatus !== "delivered") {
  await supabase
    .from("orders")
    .update({ status, delivered_at: new Date().toISOString() })
    .eq("id", orderId);
}
```

---

## 🟠 Problemas Moderados

### 5. Descuentos/Cupones No Considerados en Reembolso

**Descripción:** El cálculo de reembolso usa `price_at_purchase` directamente sin considerar descuentos proporcionales.

**Impacto:** Si un cliente usó un cupón de 20%, se reembolsa el precio completo.

**Solución:** Calcular descuento proporcional por item basado en `coupon_usages`.

---

### 6. Sin Notificaciones Email para Cambios de Estado

**Estados sin notificación:**

- ❌ Devolución aprobada
- ❌ Devolución rechazada
- ❌ Devolución completada (reembolso procesado)

**Solución:** Crear templates y funciones:

- `sendReturnApproved()`
- `sendReturnRejected()`
- `sendReturnCompleted()`

---

### 7. Sin Tabla de Histórico de Estados

**Descripción:** No existe `return_status_history` para auditoría detallada.

**Solución:**

```sql
CREATE TABLE return_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES returns(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🟡 Problemas Menores

| #   | Problema                             | Ubicación                        | Esfuerzo |
| --- | ------------------------------------ | -------------------------------- | -------- |
| 8   | Dirección devolución hardcodeada     | `email.ts`, `OrderActions.tsx`   | Bajo     |
| 9   | `return_label_url` sin funcionalidad | Campo en BD                      | Medio    |
| 10  | Sin categoría "no retornable"        | Schema productos                 | Bajo     |
| 11  | Sin búsqueda en lista devoluciones   | `admin/devoluciones/index.astro` | Bajo     |
| 12  | Sin acciones en lote                 | Panel admin                      | Medio    |

---

## 📅 Cronograma de Implementación

### Fase 1: Correcciones Críticas (Semana 1)

- [ ] Actualizar `statusConfig` en todas las vistas
- [ ] Añadir validación de cantidades en `/api/returns.ts`
- [ ] Corregir actualización de `delivered_at`
- [ ] Integrar reembolsos reales con Stripe

### Fase 2: Mejoras de UX (Semana 2)

- [ ] Implementar emails para cambios de estado
- [ ] Crear tabla `return_status_history`
- [ ] Mover dirección devolución a configuración

### Fase 3: Funcionalidades Avanzadas (Semana 3-4)

- [ ] Dashboard de métricas de devoluciones
- [ ] Generación de etiquetas PDF
- [ ] Búsqueda y filtros avanzados
- [ ] Integración con notas de crédito

---

## 📁 Archivos Afectados

| Archivo                               | Tipo de Cambio        |
| ------------------------------------- | --------------------- |
| `src/pages/api/returns.ts`            | Validación cantidades |
| `src/pages/api/admin/returns.ts`      | Integración Stripe    |
| `src/pages/api/admin/pedidos.ts`      | Fix delivered_at      |
| `src/pages/admin/pedidos/[id].astro`  | Añadir estados        |
| `src/pages/cuenta/pedidos/[id].astro` | Añadir estados        |
| `src/lib/email.ts`                    | Nuevos templates      |
| `Doc/migrations/030_*.sql`            | Nueva migración       |

---

## ✅ Criterios de Aceptación

1. **Reembolsos:** El dinero se devuelve al cliente vía Stripe
2. **Estados:** Todos los estados de devolución visibles en todas las vistas
3. **Validación:** No se puede devolver más cantidad de la comprada
4. **Plazos:** La validación de 30 días funciona correctamente
5. **Emails:** Cliente recibe notificación en cada cambio de estado

---

## 🔗 Referencias

- [Stripe Refunds API](https://docs.stripe.com/api/refunds)
- [Migración 029: return_label](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/Doc/migrations/029_add_return_label.sql)
- [API Returns](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/returns.ts)
