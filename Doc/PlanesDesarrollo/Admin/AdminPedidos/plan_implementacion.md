# Plan de Implementación: Auditoría del Módulo de Pedidos

> **Fecha:** 2026-01-18  
> **Versión:** 1.0  
> **Estado:** ✅ Fases 1 y 2 Completadas

> [!TIP]
> Ver el [walkthrough.md](file:///C:/Users/anton/.gemini/antigravity/brain/f3002423-3396-44fd-8d13-3a07449d2bd0/walkthrough.md) para detalles de la implementación y capturas de pantalla.

---

## 1. Resumen Ejecutivo de la Auditoría

### 🟡 Estado General: MEJORABLE

El módulo de Pedidos es **funcional** pero presenta varias oportunidades de mejora en calidad de código, experiencia de usuario y robustez. No se detectaron bugs críticos que afecten la operativa, pero sí patrones de código que incrementan la deuda técnica y dificultan el mantenimiento.

#### Puntos Fuertes

- ✅ Validación de permisos de admin en API (`is_admin` check)
- ✅ Sistema de estados bien definido con colores semáforo
- ✅ Integración con envío de emails al marcar como enviado
- ✅ Buena estructura de componentes (separación Astro/React)
- ✅ Tests existentes para `order-utils.ts` con buena cobertura
- ✅ Lógica de devolución con ventana de 30 días implementada

#### Áreas de Mejora Críticas

- 🔴 **Duplicación masiva**: `statusConfig` definido en 5+ archivos
- 🔴 **UX pobre para acciones destructivas**: Usa `confirm()` nativo del navegador
- 🔴 **Sin feedback visual**: Falta spinner en botón "Actualizar Estado" del admin
- 🟠 **Magic strings**: Estados hardcodeados sin constantes centralizadas
- 🟠 **Sin validación de transiciones**: La API acepta cualquier cambio de estado

---

## 2. Lista de Problemas Detectados

### 🔴 CRÍTICOS (Seguridad/Funcionalidad)

| ID   | Problema                                                               | Archivo            | Línea |
| ---- | ---------------------------------------------------------------------- | ------------------ | ----- |
| C-01 | Sin validación de transiciones de estado lógicas                       | `pedidos.ts`       | 30-35 |
| C-02 | Native `confirm()` para cancelar pedido - UX pobre y no personalizable | `OrderActions.tsx` | 98    |

### 🟠 IMPORTANTES (Mantenibilidad/DX)

| ID   | Problema                                                         | Ubicación                                                                     |
| ---- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| I-01 | `statusConfig` duplicado en 5+ archivos                          | `index.astro`, `[id].astro`, `cuenta/pedidos/[id].astro`, `admin/index.astro` |
| I-02 | Magic strings: `'pending'`, `'paid'`, `'shipped'` sin constantes | Todo el codebase                                                              |
| I-03 | Sin spinner/loading state en botón "Actualizar Estado" de admin  | `[id].astro`                                                                  |
| I-04 | Inconsistencia de colores entre admin y customer views           | `statusConfig` en diferentes archivos                                         |

### 🟢 MEJORAS (UX/Optimización)

| ID   | Problema                                            | Descripción                         |
| ---- | --------------------------------------------------- | ----------------------------------- |
| M-01 | Sin búsqueda por número de pedido                   | Solo hay filtro por estado          |
| M-02 | Sin timeline visual de estados                      | Falta visualización del historial   |
| M-03 | Sin confirmación toast después de acciones exitosas | Solo mensaje inline en admin        |
| M-04 | Sin exportación de pedidos (CSV/Excel)              | Funcionalidad común en admin panels |

---

## 3. Propuestas de Mejora

### 3.1 Mejoras Técnicas

#### Crear Constantes Unificadas

```typescript
// NUEVO: src/lib/constants/order-status.ts
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pendiente",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
    borderColor: "border-l-yellow-500",
  },
  paid: {
    label: "Pagado",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    borderColor: "border-l-green-500",
  },
  shipped: {
    label: "Enviado",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    borderColor: "border-l-blue-500",
  },
  delivered: {
    label: "Entregado",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    borderColor: "border-l-green-500",
  },
  cancelled: {
    label: "Cancelado",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderColor: "border-l-red-500",
  },
};

// Transiciones válidas: Estado actual -> Estados permitidos
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [], // Estado final
  cancelled: [], // Estado final
};
```

#### Validar Transiciones en API

```typescript
// MODIFICAR: src/pages/api/admin/pedidos.ts
import { ORDER_STATUS, VALID_TRANSITIONS } from "@/lib/constants/order-status";

// Añadir validación de transición
const { data: currentOrder } = await authClient
  .from("orders")
  .select("status")
  .eq("id", id)
  .single();

const allowedNext = VALID_TRANSITIONS[currentOrder.status];
if (!allowedNext.includes(status)) {
  return new Response(
    JSON.stringify({
      error: `No puedes cambiar de "${currentOrder.status}" a "${status}"`,
    }),
    { status: 400 }
  );
}
```

---

### 3.2 Mejoras UX/UI

#### Modal de Confirmación Personalizado

Reemplazar `confirm()` nativo por un modal React con:

- 🎨 Diseño consistente con el sistema de diseño
- ⚠️ Iconografía de advertencia
- 📝 Mensaje claro sobre consecuencias
- ✅ Botones con estados de loading

#### Sistema de Toasts

Implementar toasts para feedback inmediato:

- ✅ Éxito: "Pedido actualizado correctamente"
- ⚠️ Advertencia: "El email no pudo enviarse"
- ❌ Error: "No se pudo actualizar el pedido"

#### Spinners en Botones

Añadir estados de loading en:

- Botón "Actualizar Estado" en página de detalle admin
- Ya existe en OrderActions.tsx (cancelar) ✅

---

## 4. Plan de Acción por Fases

### FASE 1: Correcciones Críticas (Prioridad Alta)

**Duración estimada:** 2-3 horas

#### [NEW] [order-status.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/lib/constants/order-status.ts)

- Crear constantes `ORDER_STATUS` y `ORDER_STATUS_CONFIG`
- Crear mapa de transiciones válidas `VALID_TRANSITIONS`
- Exportar tipos TypeScript

#### [MODIFY] [pedidos.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/admin/pedidos.ts)

- Importar constantes desde `order-status.ts`
- Añadir validación de transiciones de estado
- Mejorar mensajes de error para usuarios no técnicos

#### [MODIFY] [index.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/index.astro)

- Importar `ORDER_STATUS_CONFIG` de constantes
- Eliminar `statusConfig` duplicado local

#### [MODIFY] [[id].astro (admin)](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/%5Bid%5D.astro)

- Importar `ORDER_STATUS_CONFIG` de constantes
- Eliminar `statusConfig` duplicado local

---

### FASE 2: Mejoras de UX y Feedback (Prioridad Media)

**Duración estimada:** 3-4 horas

#### [NEW] [ConfirmModal.tsx](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/ui/ConfirmModal.tsx)

- Modal reutilizable con variantes (danger, warning, info)
- Props: title, message, confirmText, cancelText, onConfirm, onCancel
- Estado de loading en botón confirmar

#### [MODIFY] [OrderActions.tsx](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/orders/OrderActions.tsx)

- Reemplazar `confirm()` por `ConfirmModal`
- Mensaje amigable: "¿Seguro que quieres cancelar este pedido? Los artículos volverán a estar disponibles."

#### [MODIFY] [[id].astro (admin)](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/pedidos/%5Bid%5D.astro)

- Añadir spinner al botón "Actualizar Estado"
- Deshabilitar select durante la operación
- Integrar sistema de toasts para feedback

#### [NEW/REUSE] Toast System

- Si existe: reutilizar componente existente
- Si no existe: crear `Toast.tsx` con animaciones

---

### FASE 3: Optimización y Nuevas Funcionalidades (Prioridad Baja)

**Duración estimada:** 4-6 horas

#### Búsqueda por Número de Pedido

- Añadir campo de búsqueda en `index.astro`
- Utilizar `parseOrderId` de `order-utils.ts` para búsqueda flexible

#### Refactorizar Customer View

- [MODIFY] [[id].astro (cuenta)](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/cuenta/pedidos/%5Bid%5D.astro)
- Importar constantes compartidas
- Asegurar consistencia de colores con admin

---

## 5. Plan de Verificación

### Tests Automatizados Existentes

```bash
# Ejecutar tests existentes de order-utils
npm run test -- src/lib/order-utils.test.ts
```

> Ya existen 184 líneas de tests en `order-utils.test.ts` con cobertura de `formatOrderId`, `parseOrderId`, `isOrderIdFormat`, `formatInvoiceNumber`, y `getDisplayOrderId`.

### Tests Manuales Recomendados

#### Test 1: Validación de Transiciones de Estado

1. Ir a `/admin/pedidos`
2. Seleccionar un pedido con estado "Pagado"
3. Intentar cambiar directamente a "Entregado" (saltando "Enviado")
4. **Esperado:** Mensaje de error indicando que la transición no es válida

#### Test 2: Modal de Confirmación (Post Fase 2)

1. Ir a `/cuenta/pedidos/[id]` con un pedido en estado "Pagado"
2. Click en "Cancelar Pedido"
3. **Esperado:** Modal estilizado aparece (no alert nativo)
4. Click en "Cancelar" en el modal
5. **Esperado:** Modal se cierra sin cancelar el pedido
6. Repetir y click en "Confirmar Cancelación"
7. **Esperado:** Spinner aparece, pedido se cancela

#### Test 3: Spinner en Admin

1. Ir a `/admin/pedidos/[id]`
2. Cambiar estado de "Pagado" a "Enviado" (llenando datos de envío)
3. Click en "Marcar como Enviado"
4. **Esperado:** Botón muestra spinner durante la operación

#### Test 4: Consistencia de Colores

1. Abrir `/admin/pedidos` y `/cuenta/pedidos` en pestañas lado a lado
2. Comparar colores de badges de estado
3. **Esperado:** Colores idénticos después de Fase 1

---

## 6. Archivos Afectados - Resumen

| Archivo                                  | Fase | Acción    |
| ---------------------------------------- | ---- | --------- |
| `src/lib/constants/order-status.ts`      | 1    | NUEVO     |
| `src/pages/api/admin/pedidos.ts`         | 1    | MODIFICAR |
| `src/pages/admin/pedidos/index.astro`    | 1    | MODIFICAR |
| `src/pages/admin/pedidos/[id].astro`     | 1, 2 | MODIFICAR |
| `src/components/ui/ConfirmModal.tsx`     | 2    | NUEVO     |
| `src/components/orders/OrderActions.tsx` | 2    | MODIFICAR |
| `src/pages/cuenta/pedidos/[id].astro`    | 3    | MODIFICAR |

---

## 7. Notas Adicionales

> [!IMPORTANT]
> **Decisión requerida del usuario:**  
> ¿Deseas que también unifique los colores de estado con el módulo de Devoluciones (`OrderActions.tsx` línea 207-214 usa un `statusConfig` diferente para estados de devolución)?

> [!TIP]
> El archivo `order-utils.test.ts` ya tiene 184 líneas de tests. Recomiendo añadir tests para las nuevas funciones de validación de transiciones cuando se creen.

---

**Siguiente paso:** Esperar aprobación del usuario para comenzar implementación de Fase 1.
