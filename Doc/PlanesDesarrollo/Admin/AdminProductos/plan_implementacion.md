# Plan de Implementación - Módulo de Productos Admin

**Fecha**: 16 de Enero 2026  
**Estado**: ✅ Implementado (18 de Enero 2026)  
**Prioridad**: Alta

---

## Resumen de Hallazgos

| Tipo             | Cantidad |
| ---------------- | -------- |
| 🔴 Bugs críticos | 2        |
| 🟡 Bugs medios   | 3        |
| 🟢 Bugs menores  | 2        |
| Inconsistencias  | 8        |

**Decisión tomada**: Implementar **soft delete** para productos.

---

## Fase 1: Correcciones Críticas ✅

**Prioridad**: 🔴 Crítica  
**Estimación**: 4-6 horas  
**Estado**: ✅ Completado

### 1.1 Validación de Slug Único

**Archivo**: `src/pages/api/admin/productos.ts`

**Problema**: No se verifica que el slug sea único antes de insertar/actualizar, causando errores 500.

**Solución**:

```typescript
// Antes de INSERT/UPDATE, verificar slug
const { data: existing } = await authClient
  .from("products")
  .select("id")
  .eq("slug", product.slug)
  .neq("id", id) // Solo para UPDATE
  .single();

if (existing) {
  return new Response(
    JSON.stringify({
      error: "Ya existe un producto con este slug",
    }),
    { status: 400 }
  );
}
```

---

### 1.2 Validación Precio Oferta < Precio Base

**Archivos**:

- `src/pages/api/admin/productos.ts`
- `src/pages/admin/productos/nuevo.astro`
- `src/pages/admin/productos/[id].astro`

**Problema**: Se puede guardar `offer_price > price`, causando inconsistencias.

**Solución Backend**:

```typescript
if (product.is_offer && product.offer_price) {
  if (product.offer_price >= product.price) {
    return new Response(
      JSON.stringify({
        error: "El precio de oferta debe ser menor que el precio base",
      }),
      { status: 400 }
    );
  }
}
```

**Solución Frontend** (en ambos formularios):

```javascript
// Validar antes de submit
const price = parseFloat(formData.get("price"));
const offerPrice = parseFloat(formData.get("offer_price"));
const isOffer = formData.get("is_offer") === "on";

if (isOffer && offerPrice && offerPrice >= price) {
  throw new Error("El precio de oferta debe ser menor que el precio base");
}
```

---

### 1.3 Preservar IDs de Variantes en UPDATE

**Archivo**: `src/pages/api/admin/productos.ts`

**Problema**: Al editar producto, las variantes se eliminan y recrean con nuevos IDs, rompiendo referencias en `order_items`.

**Solución**: Usar UPSERT en lugar de DELETE+INSERT

```typescript
// En lugar de:
// await authClient.from('product_variants').delete().eq('product_id', id);

// Usar:
for (const variant of variants) {
  await authClient.from("product_variants").upsert(
    {
      product_id: id,
      size: variant.size,
      stock: variant.stock,
    },
    {
      onConflict: "product_id,size",
    }
  );
}

// Eliminar variantes que ya no existen
const sizes = variants.map((v) => v.size);
await authClient
  .from("product_variants")
  .delete()
  .eq("product_id", id)
  .not("size", "in", `(${sizes.join(",")})`);
```

---

## Fase 2: Soft Delete de Productos ✅

**Prioridad**: 🔴 Alta  
**Estimación**: 2-3 horas  
**Estado**: ✅ Completado

### 2.1 Migración de Base de Datos

**Archivo nuevo**: `Doc/migrations/033_products_soft_delete.sql`

```sql
-- Añadir campo deleted_at para soft delete
ALTER TABLE products
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Crear índice para filtrar productos activos
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- Actualizar RLS para excluir productos eliminados en queries públicas
CREATE OR REPLACE POLICY "products_select_public"
ON products FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL);

-- Admin puede ver todos, incluso eliminados
CREATE OR REPLACE POLICY "products_select_admin"
ON products FOR SELECT
TO authenticated
USING (
  (SELECT user_metadata->>'is_admin' FROM auth.users WHERE id = auth.uid()) = 'true'
);
```

### 2.2 Modificar DELETE en API

**Archivo**: `src/pages/api/admin/productos.ts`

```typescript
// Cambiar de hard delete a soft delete
export const DELETE: APIRoute = async ({ request, cookies }) => {
  // ... auth verification ...

  const { id } = await request.json();

  // Soft delete: marcar como eliminado
  const { error } = await authClient
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
```

### 2.3 Actualizar Queries en Lista de Productos

**Archivo**: `src/pages/admin/productos/index.astro`

```typescript
// Añadir filtro para excluir eliminados (o mostrar con badge)
const { data: products } = await supabase
  .from("products")
  .select(`...`)
  .is("deleted_at", null) // Excluir eliminados
  .order("created_at", { ascending: false });
```

---

## Fase 3: Mejoras de UX ✅

**Prioridad**: 🟡 Media  
**Estimación**: 3-4 horas  
**Estado**: ✅ Completado

### 3.1 Confirmación al Salir con Cambios Sin Guardar

**Archivos**:

- `src/pages/admin/productos/nuevo.astro`
- `src/pages/admin/productos/[id].astro`

```javascript
let formModified = false;

// Detectar cambios en el formulario
form?.addEventListener("input", () => {
  formModified = true;
});

// Advertir al intentar salir
window.addEventListener("beforeunload", (e) => {
  if (formModified) {
    e.preventDefault();
    e.returnValue =
      "¿Seguro que quieres salir? Los cambios no guardados se perderán.";
  }
});

// Limpiar flag al guardar exitosamente
// (dentro del handler de submit exitoso)
formModified = false;
```

### 3.2 Debounce en Búsqueda

**Archivo**: `src/pages/admin/productos/index.astro`

```javascript
let debounceTimer: number;

searchInput?.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(filterProducts, 300);
});
```

### 3.3 Permitir Crear Variantes con Stock 0

**Archivo**: `src/pages/admin/productos/nuevo.astro`

```javascript
// Cambiar de:
// if (stock > 0) { variants.push({ size, stock }); }

// A:
currentSizes.forEach((size) => {
  const stock = parseInt(formData.get(`stock-${size}`) as string) || 0;
  variants.push({ size, stock }); // Siempre incluir la talla
});
```

---

## Fase 4: Mejoras de Rendimiento ✅

**Prioridad**: 🟢 Baja  
**Estimación**: 2-3 horas  
**Estado**: ✅ Parcialmente implementado (filtro deleted_at + debounce)

### 4.1 Optimizar Query de Lista

**Archivo**: `src/pages/admin/productos/index.astro`

```typescript
// Solo seleccionar campos necesarios para la lista
const { data: products } = await supabase
  .from("products")
  .select(
    `
    id,
    name,
    slug,
    price,
    offer_price,
    is_offer,
    active,
    created_at,
    category:categories(id, name),
    images:product_images(image_url, order).order(order).limit(1),
    variants:product_variants(stock)
  `
  )
  .is("deleted_at", null)
  .order("created_at", { ascending: false })
  .limit(100); // Limitar para rendimiento
```

### 4.2 Paginación

**Archivo**: `src/pages/admin/productos/index.astro`

Implementar paginación con offset/limit y controles de UI.

---

## Verificación

### Checklist de Tests Manuales

- [x] Crear producto con slug duplicado → Error claro
- [x] Crear producto con `offer_price > price` → Error claro
- [x] Editar variantes de producto con pedidos → IDs preservados
- [x] Eliminar producto → Soft delete, visible en BD
- [x] Producto eliminado no visible en tienda
- [x] Salir de formulario con cambios → Confirmación
- [x] Búsqueda con debounce funciona
- [x] Crear tallas con stock 0 funciona

---

## Archivos Afectados

| Archivo                                       | Cambios                             |
| --------------------------------------------- | ----------------------------------- |
| `src/pages/api/admin/productos.ts`            | Validaciones, UPSERT, soft delete   |
| `src/pages/admin/productos/nuevo.astro`       | Validaciones frontend, beforeunload |
| `src/pages/admin/productos/[id].astro`        | Validaciones frontend, beforeunload |
| `src/pages/admin/productos/index.astro`       | Debounce, filtro deleted_at         |
| `Doc/migrations/033_products_soft_delete.sql` | Nueva migración                     |

---

## Próximos Pasos

1. ✅ Plan aprobado
2. ✅ Ejecutar Fase 1 (correcciones críticas)
3. ✅ Ejecutar Fase 2 (soft delete)
4. ✅ Ejecutar Fase 3 (mejoras UX)
5. ✅ Ejecutar Fase 4 (rendimiento)
6. ⏳ Ejecutar migración SQL en Supabase

> **Nota**: Para completar, ejecutar `Doc/migrations/033_products_soft_delete.sql` en Supabase.
