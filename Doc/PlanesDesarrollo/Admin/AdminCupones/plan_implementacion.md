# Plan de Implementación: Módulo de Cupones Admin

## Resumen Ejecutivo

Auditoría completa del módulo de cupones del panel de administración de FashionStore. Se analizaron los archivos de frontend, backend API, y esquema de base de datos para identificar errores, mejoras funcionales y optimizaciones de UX.

---

## Archivos Analizados

| Componente     | Archivo                                                                                                                                                                                                                 | Propósito                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Frontend Admin | [index.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/cupones/index.astro)                            | UI de gestión de cupones         |
| API Admin      | [cupones.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/admin/cupones.ts)                                  | CRUD de cupones con Stripe       |
| API Validación | [validate.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/coupons/validate.ts)                              | Validación de cupones checkout   |
| Checkout       | [create-session.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/checkout/create-session.ts)                 | Integración Stripe con descuento |
| Checkout UI    | [CheckoutForm.tsx](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/components/islands/CheckoutForm.tsx)                   | Aplicación de cupón en carrito   |
| Migración      | [015_create_coupons_table.sql](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/Doc/migrations/015_create_coupons_table.sql)   | Esquema y funciones RPC          |
| Migración      | [016_fix_coupon_usages_rls.sql](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/Doc/migrations/016_fix_coupon_usages_rls.sql) | Políticas RLS y mejoras          |

---

## Resumen de Hallazgos

### Tabla de Severidad

| Severidad      | Hallazgo                                          | Ubicación                           | Impacto                                        |
| -------------- | ------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| 🔴 **Crítico** | Falta validación de código único en API           | `cupones.ts:L82-86`                 | Códigos duplicados pueden causar conflictos    |
| 🔴 **Crítico** | No hay validación de porcentaje > 100%            | `cupones.ts:L82-86`                 | Descuentos imposibles pueden quebrar cálculos  |
| 🟠 **Medio**   | Sin edición de cupones existentes                 | `index.astro`                       | Administrador debe borrar y recrear            |
| 🟠 **Medio**   | Falta modal de confirmación para cambio de estado | `index.astro:L423-442`              | Click accidental puede desactivar cupón activo |
| 🟠 **Medio**   | Sin estadísticas de uso visibles                  | `index.astro`                       | Marketing no puede evaluar rendimiento         |
| 🟡 **Mejora**  | `alert()` nativo en eliminación                   | `index.astro:L449-455`              | UX inconsistente con resto del admin           |
| 🟡 **Mejora**  | Sin feedback visual de acciones                   | `index.astro`                       | Usuario no sabe si acción fue exitosa          |
| 🟡 **Mejora**  | Falta búsqueda/filtros de cupones                 | `index.astro`                       | Difícil encontrar cupón específico             |
| 🟢 **Bueno**   | Concurrencia manejada con `FOR UPDATE`            | `015_create_coupons_table.sql:L161` | ✓ Race conditions prevenidas                   |
| 🟢 **Bueno**   | Sincronización Stripe bidireccional               | `cupones.ts:L88-109`                | ✓ Rollback si falla Supabase                   |
| 🟢 **Bueno**   | Cálculo de descuento con límite máximo            | `validate_coupon()`                 | ✓ max_discount_amount respetado                |

---

## Análisis Detallado

### 1. Lógica de Descuentos ✓

La lógica actual es **correcta**:

```sql
-- En validate_coupon() - Líneas 125-132 de 015_create_coupons_table.sql
IF v_coupon.discount_type = 'percentage' THEN
  v_calculated_discount := p_cart_total * (v_coupon.discount_value / 100);
  IF v_coupon.max_discount_amount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount_amount THEN
    v_calculated_discount := v_coupon.max_discount_amount;
  END IF;
ELSE
  v_calculated_discount := LEAST(v_coupon.discount_value, p_cart_total);
END IF;
```

**Fortalezas:**

- Porcentaje aplica límite máximo si está definido
- Monto fijo nunca supera el total del carrito
- Stripe recibe el `stripe_coupon_id` correcto para aplicar descuento

### 2. Control de Concurrencia ✓

Implementación **robusta** con bloqueo pesimista:

```sql
-- En use_coupon() - Línea 161 de 015_create_coupons_table.sql
SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id FOR UPDATE;
```

El `FOR UPDATE` previene race conditions cuando múltiples usuarios intentan usar el mismo cupón simultáneamente.

### 3. Problemas Identificados

#### 3.1 Falta Validación de Código Único (API)

```typescript
// cupones.ts - Actual (L82-86)
if (!code || !discount_type || !discount_value) {
  return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { ... });
}
// ❌ No verifica si el código ya existe antes de crear en Stripe
```

**Problema:** Si el código ya existe en Supabase, la inserción falla DESPUÉS de crear el cupón en Stripe, dejando datos huérfanos.

#### 3.2 No Hay Edición de Cupones

Actualmente solo existe:

- `POST` → Crear cupón
- `PUT` → Toggle estado (solo `is_active`)
- `DELETE` → Eliminar cupón

**Falta:** Capacidad de editar fechas, límites, valores sin recrear el cupón.

#### 3.3 UX de Confirmaciones

```javascript
// index.astro - L449-451 (Actual)
if (!confirm("¿Estás seguro de eliminar este cupón?...")) {
  return;
}
```

Usa `window.confirm()` nativo que es inconsistente con el diseño del admin panel.

---

## Fases de Desarrollo

### Fase 1: Correcciones Críticas

**Duración estimada:** 2-3 horas

#### 1.1 Validar Código Único Antes de Crear

##### [MODIFY] [cupones.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/admin/cupones.ts)

Agregar validación después de L86:

```typescript
// Verificar que el código no exista ya
const { data: existing } = await authClient
  .from("coupons")
  .select("id")
  .eq("code", code.toUpperCase())
  .maybeSingle();

if (existing) {
  return new Response(
    JSON.stringify({ error: "Ya existe un cupón con ese código" }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

#### 1.2 Validar Valores de Descuento

Después de la validación de campos requeridos:

```typescript
// Validar valor de descuento
const discountVal = parseFloat(discount_value);
if (discount_type === "percentage" && (discountVal <= 0 || discountVal > 100)) {
  return new Response(
    JSON.stringify({
      error: "El porcentaje debe estar entre 1 y 100",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

if (discount_type === "fixed" && discountVal <= 0) {
  return new Response(
    JSON.stringify({
      error: "El monto debe ser mayor a 0",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

#### 1.3 Validar Fechas Coherentes

```typescript
// Validar fechas
if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
  return new Response(
    JSON.stringify({
      error: "La fecha de fin debe ser posterior a la fecha de inicio",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

---

### Fase 2: Mejoras Funcionales

**Duración estimada:** 4-5 horas

#### 2.1 Implementar Edición de Cupones

##### [MODIFY] [cupones.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/admin/cupones.ts)

Expandir el método PUT para aceptar más campos:

```typescript
export const PUT: APIRoute = async ({ request, cookies }) => {
  // ... autenticación existente ...

  const {
    id,
    is_active,
    min_purchase_amount,
    max_discount_amount,
    start_date,
    end_date,
    max_uses,
    max_uses_per_customer,
  } = await request.json();

  // Construir objeto de actualización dinámicamente
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof is_active === "boolean") updateData.is_active = is_active;
  if (min_purchase_amount !== undefined)
    updateData.min_purchase_amount = parseFloat(min_purchase_amount) || 0;
  if (max_discount_amount !== undefined)
    updateData.max_discount_amount = max_discount_amount
      ? parseFloat(max_discount_amount)
      : null;
  if (start_date !== undefined) updateData.start_date = start_date || null;
  if (end_date !== undefined) updateData.end_date = end_date || null;
  if (max_uses !== undefined)
    updateData.max_uses = max_uses ? parseInt(max_uses) : null;
  if (max_uses_per_customer !== undefined)
    updateData.max_uses_per_customer = max_uses_per_customer
      ? parseInt(max_uses_per_customer)
      : 1;

  const { error } = await authClient
    .from("coupons")
    .update(updateData)
    .eq("id", id);
  // ...
};
```

> [!IMPORTANT]
> El código y tipo/valor de descuento **NO** se pueden editar porque están sincronizados con Stripe. Para cambiarlos, el usuario debe eliminar y crear uno nuevo.

#### 2.2 Agregar Vista de Estadísticas

##### [MODIFY] [index.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/cupones/index.astro)

Agregar consulta de estadísticas en el frontmatter:

```typescript
// Estadísticas agregadas
const { data: stats } = await authClient
  .from("coupon_usages")
  .select("coupon_id, coupons(discount_type, discount_value)")
  .order("used_at", { ascending: false });

const usageStats = coupons?.map((c) => ({
  ...c,
  totalRevenue: stats?.filter((s) => s.coupon_id === c.id).length || 0,
}));
```

Y mostrar en la tabla una columna de "Ingresos Generados" (calculado del total de órdenes con ese cupón).

#### 2.3 Implementar Búsqueda/Filtros

Agregar barra de búsqueda y filtros por estado:

```html
<div class="flex gap-4 mb-6">
  <input
    type="text"
    id="search-coupon"
    placeholder="Buscar por código..."
    class="admin-input flex-1"
  />
  <select id="filter-status" class="admin-input">
    <option value="">Todos</option>
    <option value="active">Activos</option>
    <option value="inactive">Inactivos</option>
    <option value="expired">Expirados</option>
  </select>
</div>
```

---

### Fase 3: Experiencia de Usuario (UX/UI)

**Duración estimada:** 3-4 horas

#### 3.1 Reemplazar Alertas Nativas

##### [MODIFY] [index.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/cupones/index.astro)

Crear modal de confirmación reutilizable:

```html
<!-- Delete Confirmation Modal -->
<div
  id="delete-modal"
  class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden items-center justify-center p-4"
>
  <div class="bg-card border border-border rounded-2xl w-full max-w-md p-6">
    <div class="flex items-center gap-3 text-amber-400 mb-4">
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 class="font-heading text-lg">Confirmar Eliminación</h3>
    </div>
    <p class="text-muted-foreground mb-6">
      ¿Estás seguro de eliminar el cupón <strong id="delete-code"></strong>?
      Esta acción eliminará también el cupón de Stripe y no se puede deshacer.
    </p>
    <div class="flex gap-3 justify-end">
      <button id="cancel-delete" class="admin-btn">Cancelar</button>
      <button
        id="confirm-delete"
        class="admin-btn bg-red-500 hover:bg-red-600 text-white"
      >
        Eliminar
      </button>
    </div>
  </div>
</div>
```

#### 3.2 Implementar Toast Notifications

Usar sistema de toasts existente en el proyecto o crear componente:

```typescript
function showToast(message: string, type: "success" | "error" | "info") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg animate-slideUp z-50 
    ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"} text-white`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```

#### 3.3 Agregar Modal de Edición

Crear un formulario modal para editar cupones existentes (campos editables: fechas, límites, compra mínima).

#### 3.4 Indicadores Visuales de Estado

Mejorar la visualización de cupones con indicadores claros:

```html
<!-- Cupón expirado -->
<span class="badge badge-warning">Expirado</span>

<!-- Cupón agotado -->
<span class="badge badge-error">Sin usos</span>

<!-- Cupón próximo a expirar (7 días) -->
<span class="badge badge-warning">Expira pronto</span>
```

---

## Verificación

### Tests Manuales

| #   | Escenario             | Pasos                                      | Resultado Esperado                             |
| --- | --------------------- | ------------------------------------------ | ---------------------------------------------- |
| 1   | Crear cupón %         | Crear cupón 20% con código único           | ✅ Aparece en lista, se crea en Stripe         |
| 2   | Crear cupón duplicado | Intentar crear cupón con código existente  | ✅ Error: "Ya existe un cupón con ese código"  |
| 3   | Porcentaje > 100      | Crear cupón con 150%                       | ✅ Error de validación                         |
| 4   | Fechas inválidas      | Fecha fin antes de fecha inicio            | ✅ Error de validación                         |
| 5   | Toggle estado         | Click en badge de estado                   | ✅ Estado cambia, se muestra toast             |
| 6   | Eliminar cupón        | Click en ícono eliminar                    | ✅ Modal de confirmación, se elimina de Stripe |
| 7   | Usar cupón checkout   | Aplicar cupón válido en checkout           | ✅ Descuento se aplica correctamente           |
| 8   | Cupón agotado         | Intentar usar cupón con max_uses alcanzado | ✅ Error: "límite de usos alcanzado"           |
| 9   | Cupón expirado        | Intentar usar cupón con end_date pasado    | ✅ Error: "Este código ha expirado"            |
| 10  | Compra mínima         | Usar cupón con carrito menor al mínimo     | ✅ Error: "Compra mínima de X€ requerida"      |

### Verificación en Browser

1. **Navegador:** Abrir `http://localhost:4321/admin/cupones`
2. **Crear cupón:** Click "Nuevo Cupón" → Rellenar formulario → Verificar aparece en lista
3. **Validar Stripe:** Verificar en dashboard de Stripe que el cupón aparece
4. **Probar checkout:** Ir a `/checkout` → Aplicar código → Verificar descuento

---

## Checklist de Implementación

### Fase 1: Críticas

- [ ] Validación de código único en API `cupones.ts`
- [ ] Validación de porcentaje 1-100%
- [ ] Validación de fecha fin > fecha inicio
- [ ] Mensaje de error claro si Stripe falla

### Fase 2: Funcionales

- [ ] Expandir PUT para editar más campos
- [ ] Query de estadísticas de uso
- [ ] Implementar búsqueda por código
- [ ] Filtros por estado (activo/inactivo/expirado)

### Fase 3: UX

- [ ] Modal de confirmación para eliminar
- [ ] Toast de éxito/error en acciones
- [ ] Modal de edición de cupón
- [ ] Indicadores visuales de estado
- [ ] Loading states en botones

---

## Notas Técnicas

### Limitaciones de Stripe

- El **código** y **tipo/valor de descuento** no se pueden editar una vez creados en Stripe
- Para cambiarlos, se debe eliminar y crear un cupón nuevo
- El `stripe_coupon_id` es inmutable

### RLS y Seguridad

Las políticas RLS están correctamente configuradas:

- Solo admins pueden CRUD en `coupons`
- Lectura pública solo de cupones activos (para validación)
- `coupon_usages` tiene INSERT abierto para webhooks

### Idempotencia

La función `use_coupon()` es idempotente gracias al constraint `UNIQUE(coupon_id, customer_email, order_id)` y manejo de `unique_violation`.
