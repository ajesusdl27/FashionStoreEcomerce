# Plan de Implementación - Módulo de Categorías Admin

**Fecha**: 18 de Enero 2026  
**Estado**: ✅ Implementado (18 de Enero 2026)  
**Prioridad**: Media

---

## Resumen Ejecutivo

Auditoría profunda del módulo de Categorías en el panel de administración. El módulo actual es funcional pero carece de validaciones críticas, tiene inconsistencias en UX y presenta oportunidades de mejora significativas para usuarios no técnicos.

---

## Resumen de Hallazgos

| Tipo               | Cantidad | Prioridad |
| ------------------ | -------- | --------- |
| 🔴 Bugs Críticos   | 2        | Alta      |
| 🟡 Bugs Medios     | 3        | Media     |
| 🟢 Mejoras Menores | 4        | Baja      |
| 🎨 Mejoras UX/UI   | 5        | Media     |

---

## Hallazgos Detallados

### 🔴 Bugs Críticos

#### 1. Sin Validación de Slug Único

**Archivo**: `src/pages/api/admin/categorias.ts` (líneas 27-33)

**Problema**: La API no verifica si el slug ya existe antes de crear/actualizar una categoría. Esto puede causar errores 500 por violación de constraint único en la base de datos.

**Impacto**:

- Error críptico para el usuario ("duplicate key violates unique constraint")
- Experiencia de usuario negativa

---

#### 2. Sin Validación de Campos Requeridos en Backend

**Archivo**: `src/pages/api/admin/categorias.ts` (líneas 27-31)

**Problema**: El backend no valida que `name` y `slug` no estén vacíos antes de insertar.

```typescript
// Línea 27 - Sin validación
const { name, slug, size_type } = await request.json();
// Se inserta directamente sin verificar
```

**Impacto**:

- Posible inserción de registros con campos vacíos
- Error de base de datos si `name` es NOT NULL

---

### 🟡 Bugs Medios

#### 3. Eliminación Sin Advertencia de Productos Asociados

**Archivo**: `src/pages/admin/categorias/index.astro` (líneas 352-359)

**Problema**: El modal de confirmación simplemente dice "Los productos asociados se quedarán sin categoría", pero no muestra CUÁNTOS productos serán afectados.

**Código Actual**:

```html
<p class="text-sm text-zinc-500 mb-6">
  Los productos asociados se quedarán sin categoría.
</p>
```

**Mejora Sugerida**: Mostrar el número de productos afectados antes de eliminar.

---

#### 4. Colores Hardcodeados (zinc) en Delete Modal

**Archivo**: `src/pages/admin/categorias/index.astro` (líneas 353-357)

**Problema**: El modal de eliminación usa `text-zinc-400` y `text-zinc-500` en lugar de variables semánticas como `text-muted-foreground`.

```html
<p class="text-zinc-400 mb-2"><!-- Debería ser text-muted-foreground --></p>
<p class="text-sm text-zinc-500 mb-6">
  <!-- Debería ser text-muted-foreground -->
</p>
```

**Impacto**: Inconsistencia visual en modo claro/oscuro.

---

#### 5. Alert Nativo en Errores de Eliminación

**Archivo**: `src/pages/admin/categorias/index.astro` (líneas 516-519)

**Problema**: Los errores de eliminación usan `alert()` nativo, rompiendo la coherencia visual.

```javascript
} catch (error: any) {
  alert("Error: " + error.message);  // Alert nativo
}
```

---

### 🟢 Mejoras Menores

#### 6. Sin Indicador de Carga Durante Operaciones

**Problema**: No hay feedback visual mientras se guarda/elimina una categoría. El usuario no sabe si la operación está en progreso.

---

#### 7. Sin Toast de Confirmación

**Problema**: Después de crear/editar/eliminar, la página simplemente se recarga sin ningún mensaje de éxito.

---

#### 8. Botones de Acción Solo Visibles al Hover

**Archivo**: `src/pages/admin/categorias/index.astro` (línea 87)

**Problema**: Los botones de editar/eliminar tienen `opacity-0 group-hover:opacity-100`. En dispositivos táctiles esto dificulta el acceso.

---

#### 9. Sin Búsqueda/Filtro de Categorías

**Problema**: Con muchas categorías, no hay forma de buscar o filtrar.

---

### 🎨 Mejoras UX/UI para Usuarios No Técnicos

| Mejora                              | Descripción                                             |
| ----------------------------------- | ------------------------------------------------------- |
| Tooltip explicativo para "Slug"     | Muchos usuarios no saben qué es un "slug"               |
| Preview de URL completa             | Mostrar `/categoria/mi-slug` en tiempo real             |
| Confirmación de cambio de size_type | Si la categoría tiene productos, advertir consecuencias |
| Drag & Drop para reordenar          | Permitir cambiar orden de categorías visualmente        |
| Categorías anidadas (futuro)        | Subcategorías para mejor organización                   |

---

## Fases de Desarrollo

### Fase 1: Correcciones Críticas 🔴

**Prioridad**: Alta  
**Estimación**: 2-3 horas

#### 1.1 Validación de Slug Único en API

**Archivo**: `src/pages/api/admin/categorias.ts`

```typescript
// Función helper (añadir al inicio del archivo)
async function isSlugUnique(
  authClient: ReturnType<typeof createAuthenticatedClient>,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = authClient.from("categories").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.maybeSingle();
  return !data;
}

// En POST (línea ~27):
const { name, slug, size_type } = await request.json();

// Validar campos requeridos
if (!name?.trim() || !slug?.trim()) {
  return new Response(
    JSON.stringify({
      error: "El nombre y el slug son obligatorios",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

// Validar slug único
if (!(await isSlugUnique(authClient, slug))) {
  return new Response(
    JSON.stringify({
      error: "Ya existe una categoría con este slug",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}

// En PUT (línea ~73):
if (!(await isSlugUnique(authClient, slug, id))) {
  return new Response(
    JSON.stringify({
      error: "Ya existe otra categoría con este slug",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

#### 1.2 Sanitización de Slug

**Archivo**: `src/pages/api/admin/categorias.ts`

```typescript
// Normalizar el slug en el servidor (backup al frontend)
const normalizedSlug = slug
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
```

---

### Fase 2: Mejoras Funcionales 🟡

**Prioridad**: Media  
**Estimación**: 2-3 horas

#### 2.1 Mostrar Cantidad de Productos en Confirmación de Eliminación

**Archivo**: `src/pages/admin/categorias/index.astro`

```html
<!-- Añadir data-count al botón delete -->
<button
  class="delete-category p-2 ..."
  data-id={cat.id}
  data-name={cat.name}
  data-count={cat.productCount}  <!-- NUEVO -->
>

<!-- Actualizar modal de confirmación -->
<p class="text-muted-foreground mb-2">
  Vas a eliminar: <strong class="text-foreground" id="delete-name"></strong>
</p>
<p id="delete-warning" class="text-sm text-muted-foreground mb-6"></p>
```

```javascript
// En el handler del botón delete
const { id, name, count } = (btn as HTMLElement).dataset;
const productCount = parseInt(count || '0');

document.getElementById('delete-warning')!.textContent =
  productCount > 0
    ? `⚠️ ${productCount} producto${productCount !== 1 ? 's' : ''} quedará${productCount !== 1 ? 'n' : ''} sin categoría.`
    : 'Esta categoría no tiene productos asociados.';
```

#### 2.2 Corregir Colores Hardcodeados

**Archivo**: `src/pages/admin/categorias/index.astro`

```diff
- <p class="text-zinc-400 mb-2">
+ <p class="text-muted-foreground mb-2">

- <p class="text-sm text-zinc-500 mb-6">
+ <p class="text-sm text-muted-foreground mb-6">
```

#### 2.3 Reemplazar Alert Nativo con Mensaje Inline

```html
<!-- Añadir contenedor de error en delete modal -->
<div
  id="delete-error"
  class="hidden p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm"
></div>
```

```javascript
// En el handler de confirm-delete
} catch (error: any) {
  const errorDiv = document.getElementById('delete-error');
  if (errorDiv) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  }
}
```

---

### Fase 3: Mejoras de Experiencia de Usuario 🎨

**Prioridad**: Media  
**Estimación**: 3-4 horas

#### 3.1 Indicadores de Estado y Loading

```javascript
// Añadir clase de loading al botón
const saveBtn = document.getElementById('save-category');
saveBtn?.setAttribute('disabled', 'true');
saveBtn!.innerHTML = `
  <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
  Guardando...
`;
```

#### 3.2 Toast de Confirmación

```javascript
// Función helper para mostrar toast
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
    type === 'success'
      ? 'bg-green-500 text-white'
      : 'bg-red-500 text-white'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Usar en lugar de window.location.reload()
showToast('Categoría guardada correctamente');
setTimeout(() => window.location.reload(), 1000);
```

#### 3.3 Tooltip Explicativo para "Slug"

```html
<label
  for="category-slug"
  class="block text-sm font-medium text-foreground mb-2"
>
  Slug (URL) <span class="text-red-500">*</span>
  <button
    type="button"
    class="ml-1 text-muted-foreground hover:text-foreground"
    title="El slug es la parte de la URL que identifica esta categoría. Por ejemplo: /categoria/camisetas"
  >
    <svg
      class="w-4 h-4 inline"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </button>
</label>
```

#### 3.4 Preview de URL Completa

```html
<!-- Debajo del input de slug -->
<p id="slug-preview" class="text-xs text-muted-foreground mt-1.5">
  URL: <span class="font-mono text-primary">/categoria/</span
  ><span id="slug-value" class="font-mono text-primary"></span>
</p>
```

```javascript
// Actualizar preview en tiempo real
categorySlugInput?.addEventListener("input", () => {
  const preview = document.getElementById("slug-value");
  if (preview) preview.textContent = categorySlugInput.value || "...";
});
```

#### 3.5 Mejorar Visibilidad de Botones en Móvil

```diff
- <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
+ <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
```

---

## Migración de Base de Datos

No se requiere migración para esta fase. El esquema actual es suficiente:

```sql
-- Esquema actual (referencia)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  size_type TEXT DEFAULT 'clothing' CHECK (size_type IN ('clothing', 'footwear', 'universal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Checklist de Verificación

### Tests Manuales

- [ ] **Crear categoría con slug duplicado** → Debe mostrar error claro "Ya existe una categoría con este slug"
- [ ] **Crear categoría sin nombre** → Debe mostrar error "El nombre y el slug son obligatorios"
- [ ] **Editar categoría cambiando slug a uno existente** → Debe mostrar error
- [ ] **Eliminar categoría con productos** → Modal debe mostrar cantidad exacta de productos afectados
- [ ] **Visual: Modo claro** → Verificar que no hay colores grises inconsistentes
- [ ] **Visual: Modo oscuro** → Verificar que no hay colores grises inconsistentes
- [ ] **Móvil: Botones de acción** → Deben ser visibles sin necesidad de hover
- [ ] **UX: Loading en guardar** → Debe mostrar spinner mientras guarda
- [ ] **UX: Toast de confirmación** → Debe aparecer mensaje de éxito antes de recargar
- [ ] **Preview de URL** → Al escribir nombre, la preview debe actualizarse

### Navegador de Verificación

1. Abrir `http://localhost:4321/admin/categorias`
2. Probar crear nueva categoría
3. Intentar duplicar slug existente
4. Editar categoría existente
5. Eliminar categoría con y sin productos
6. Verificar en modo claro y oscuro

---

## Archivos Afectados

| Archivo                                  | Cambios                             |
| ---------------------------------------- | ----------------------------------- |
| `src/pages/api/admin/categorias.ts`      | Validaciones, sanitización de slug  |
| `src/pages/admin/categorias/index.astro` | UX improvements, colores semánticos |

---

## Próximos Pasos

1. ✅ Plan aprobado
2. ✅ Ejecutar Fase 1 (correcciones críticas)
3. ✅ Ejecutar Fase 2 (mejoras funcionales)
4. ✅ Ejecutar Fase 3 (mejoras UX)
5. ✅ Verificación manual

---

## Mejoras Futuras (No incluidas en este plan)

| Mejora                        | Complejidad | Valor |
| ----------------------------- | ----------- | ----- |
| Búsqueda/filtro de categorías | Baja        | Medio |
| Drag & Drop para reordenar    | Media       | Alto  |
| Categorías anidadas           | Alta        | Alto  |
| Imágenes para categorías      | Media       | Medio |
| Soft delete de categorías     | Baja        | Medio |
