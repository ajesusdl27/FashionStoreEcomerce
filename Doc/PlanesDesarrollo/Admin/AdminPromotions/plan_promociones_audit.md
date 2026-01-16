# FashionStore - Plan de Implementación COMPLETO

## Sistema de Promociones: Mejoras por Fases

---

## 📋 Resumen del Análisis

| Categoría                    | Cantidad |
| ---------------------------- | -------- |
| 🔴 Errores Críticos          | 1        |
| 🟠 Errores de Alta Prioridad | 4        |
| 🟡 Mejoras UX No-Técnicos    | 15       |
| 🔵 Mejoras Técnicas          | 8        |
| 🟣 Features CMS              | 12       |

---

## 🔴 FASE 0: Fixes Críticos (1 día)

### 0.1 Vulnerabilidad XSS en `cta_link`

**Archivo:** [promociones.ts](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/api/admin/promociones.ts)

**Problema:** El campo `cta_link` acepta cualquier valor incluyendo `javascript:` URLs.

**Solución:**

```typescript
// Añadir al inicio del archivo
const sanitizeUrl = (url: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  // Solo permitir rutas relativas o HTTPS
  if (trimmed.startsWith('/') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Si empieza con http:// (sin s), convertir a https
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }
  // Rechazar javascript:, data:, etc.
  return '/productos';
};

// En POST y PUT, usar:
cta_link: sanitizeUrl(cta_link),
```

**Criterio de aceptación:** URLs tipo `javascript:alert(1)` deben ser rechazadas.

---

### 0.2 Eliminar código duplicado en live preview

**Archivo:** [nueva.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/nueva.astro)

**Problema:** La sección "Vista Previa en Vivo" aparece duplicada (líneas 44-140 y 567-663).

**Solución:** Eliminar la segunda instancia (líneas 567-663).

---

## 🟠 FASE 1: UX para Usuarios No-Técnicos (3-4 días)

### 1.1 Selector de Enlaces en Lugar de Input Texto

**Problema actual:** Usuario debe escribir manualmente `/productos` o `/categoria/x`.

**Archivos afectados:**

- [nueva.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/nueva.astro) (líneas 309-322)
- [editar/[id].astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/editar/%5Bid%5D.astro) (líneas 293-307)

**Solución propuesta:**

```html
<div>
  <label class="block text-xs text-muted-foreground mb-1">
    ¿A dónde lleva el botón?
  </label>

  <!-- Selector de tipo de destino -->
  <select
    name="cta_link_type"
    class="admin-input w-full mb-2"
    id="cta-link-type"
  >
    <option value="products">📦 Página de productos</option>
    <option value="category">📁 Una categoría específica</option>
    <option value="product">🛍️ Un producto específico</option>
    <option value="custom">🔗 URL personalizada</option>
  </select>

  <!-- Selector dinámico según tipo -->
  <div id="cta-link-category" class="hidden">
    <select name="cta_link_category" class="admin-input w-full">
      <!-- Populado dinámicamente con categorías -->
    </select>
  </div>

  <div id="cta-link-product" class="hidden">
    <input
      type="text"
      placeholder="Buscar producto..."
      class="admin-input w-full"
    />
    <!-- Autocomplete de productos -->
  </div>

  <div id="cta-link-custom" class="hidden">
    <input
      type="text"
      name="cta_link"
      placeholder="/mi-pagina"
      class="admin-input w-full"
    />
    <p class="text-xs text-muted-foreground mt-1">
      Ejemplo: /ofertas, /nueva-coleccion
    </p>
  </div>
</div>
```

---

### 1.2 Reemplazar Terminología Técnica

| Término Actual       | Problema           | Nuevo Término        |
| -------------------- | ------------------ | -------------------- |
| CTA (Call to Action) | Jerga de marketing | "Botón principal"    |
| `cta_text`           | Código técnico     | "Texto del botón"    |
| `cta_link`           | Código técnico     | "¿A dónde lleva?"    |
| `home_hero`          | ID técnico         | "Banner inicio"      |
| `announcement_top`   | ID técnico         | "Aviso superior"     |
| Prioridad            | Confuso            | "Orden de aparición" |
| `style_config`       | JSON técnico       | "Diseño visual"      |

**Archivos a modificar:**

- Labels en formularios de nueva y editar
- Opciones de zonas
- Tooltips de ayuda

---

### 1.3 Añadir Tooltips de Ayuda Contextual

**Problema:** Usuario no sabe qué hace cada opción.

**Solución:** Añadir iconos `?` con tooltips explicativos:

```html
<label class="block text-sm font-medium mb-2 flex items-center gap-2">
  Orden de aparición
  <span
    class="tooltip"
    title="Si hay varias promociones activas, la de número más bajo aparece primero. Ej: 1 = primera, 10 = después"
  >
    <svg class="w-4 h-4 text-muted-foreground"><!-- ? icon --></svg>
  </span>
</label>
```

---

### 1.4 Previsualización de Zonas Visual

**Problema:** Usuario no sabe cómo se ve cada zona en la tienda.

**Solución:** Añadir imágenes/mockups de cada zona:

```html
<div class="grid grid-cols-2 gap-4">
  <label class="zone-option">
    <input type="checkbox" name="locations" value="home_hero" />
    <div class="zone-preview">
      <img src="/images/admin/zone-home-hero.png" alt="Vista previa" />
      <span>Banner de inicio</span>
      <small>Se muestra arriba de todo en la página principal</small>
    </div>
  </label>
  <!-- Repetir para cada zona -->
</div>
```

---

### 1.5 Selector Visual de Colores (No Texto)

**Problema actual:** Selector de color de texto es un dropdown con texto.

**Archivos:**

- [nueva.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/nueva.astro) (líneas 254-261)

**Solución:**

```html
<div class="flex gap-2">
  <label class="color-option cursor-pointer">
    <input type="radio" name="style_text_color" value="white" class="sr-only" />
    <div
      class="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center"
    >
      <span class="text-xs">Aa</span>
    </div>
    <span class="text-xs">Blanco</span>
  </label>
  <label class="color-option cursor-pointer">
    <input type="radio" name="style_text_color" value="black" class="sr-only" />
    <div
      class="w-8 h-8 rounded-full bg-black border-2 border-gray-300 flex items-center justify-center"
    >
      <span class="text-xs text-white">Aa</span>
    </div>
    <span class="text-xs">Negro</span>
  </label>
  <!-- Más colores -->
</div>
```

---

### 1.6 Mensaje de Confirmación de Guardado (Toast)

**Problema:** Después de guardar, redirecciona sin feedback claro.

**Archivos:**

- [nueva.astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/nueva.astro) (línea 760)
- [editar/[id].astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/admin/promociones/editar/%5Bid%5D.astro) (línea 556)

**Solución:** Implementar sistema de Toast global:

```typescript
// Guardar mensaje en sessionStorage antes de redirect
sessionStorage.setItem(
  "toast",
  JSON.stringify({
    type: "success",
    message: "¡Promoción guardada correctamente!",
  })
);
window.location.href = "/admin/promociones";

// En index.astro, leer y mostrar toast
```

---

### 1.7 Validación en Tiempo Real del Formulario

**Problema:** Errores solo aparecen al intentar guardar.

**Solución:** Validación inline con indicadores visuales:

```javascript
// Validar título mientras escribe
titleInput.addEventListener("blur", () => {
  if (titleInput.value.length < 3) {
    showFieldError(titleInput, "El título debe tener al menos 3 caracteres");
  } else {
    clearFieldError(titleInput);
  }
});
```

---

### 1.8 Texto Explicativo en Sección de Cupones

**Problema:** Usuario no entiende la relación promoción-cupón.

**Solución:**

```html
<div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
  <h4 class="font-medium text-blue-400 mb-2">
    💡 ¿Cómo funcionan los cupones?
  </h4>
  <p class="text-sm text-muted-foreground">
    Si vinculas un cupón, el código aparecerá en el banner y los clientes podrán
    copiarlo. El descuento se aplica cuando lo usan en el checkout.
  </p>
</div>
```

---

### 1.9 Fechas con Formato Legible

**Problema:** `datetime-local` muestra formato técnico.

**Solución:**

```html
<div class="grid grid-cols-2 gap-4">
  <div>
    <label>📅 ¿Cuándo empieza?</label>
    <input type="date" name="start_date_day" />
    <input type="time" name="start_date_time" />
  </div>
  <div>
    <label>📅 ¿Cuándo termina? (opcional)</label>
    <input type="date" name="end_date_day" />
    <input type="time" name="end_date_time" />
    <small>Déjalo vacío si no tiene fecha de fin</small>
  </div>
</div>
```

---

### 1.10 Consistencia entre Formularios Nueva/Editar

**Problema:** El formulario de editar tiene diferencias con el de crear:

- Editar no tiene live preview
- Labels diferentes para las mismas opciones
- Editar muestra `zone.id` en lugar de label amigable

**Solución:** Extraer secciones comunes a componentes reutilizables.

---

## 🟡 FASE 2: Funcionalidad Mejorada (5-6 días)

### 2.1 Zona `product_page` Completamente Funcional

**Problema:** Configurada en admin pero no renderiza bien.

**Archivo:** [productos/[slug].astro](file:///c:/Users/anton/Desktop/Development/VictoriaFPII/Sistema%20de%20Gesti%C3%B3n%20Empresarial/SegundoTrimestre/Proyectos/FashionStore/src/pages/productos/%5Bslug%5D.astro)

**Ubicación actual:** Línea 202-205

**Mejora necesaria:** Verificar que el componente recibe y muestra la promoción correctamente.

---

### 2.2 Sistema de Alertas/Avisos para Admin

**Nuevas alertas:**

- ⚠️ Promoción expira en 24h
- ⚠️ Promoción sin impresiones en 7 días
- ⚠️ Cupón vinculado agotado

---

### 2.3 Duplicar con Personalización

**Mejora del duplicado actual:** En lugar de solo crear copia, abrir modal para personalizar:

```
┌─ Duplicar Promoción ───────────────────┐
│                                         │
│  Título: [Rebajas de Verano (Copia)]   │
│                                         │
│  ☐ Mantener mismas fechas               │
│  ☐ Mantener mismo cupón                 │
│  ☑ Empezar como borrador                │
│                                         │
│         [Cancelar]  [Crear copia]       │
└─────────────────────────────────────────┘
```

---

### 2.4 Historial de Cambios

Nueva tabla para auditoría:

```sql
CREATE TABLE promotion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id),
  changed_by UUID REFERENCES auth.users(id),
  action TEXT CHECK (action IN ('created', 'updated', 'activated', 'deactivated', 'deleted')),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.5 Vista Previa en Diferentes Dispositivos

Añadir toggle para ver preview en móvil/tablet/desktop:

```html
<div class="flex gap-2 mb-4">
  <button data-preview="desktop" class="active">🖥️</button>
  <button data-preview="tablet">📱</button>
  <button data-preview="mobile">📲</button>
</div>
<div id="preview-container" class="aspect-[16/9]">
  <!-- Preview cambia de tamaño según selección -->
</div>
```

---

## 🔵 FASE 3: Sistema CMS No-Code (2-3 semanas)

### 3.1 Wizard Paso a Paso

Nuevo componente React:

```
┌─ Paso 1 de 4: Tipo ─────────────────────┐
│  [●] Banner visual                       │
│  [ ] Descuento automático               │
│  [ ] Envío gratis                       │
│                    [Siguiente →]         │
└──────────────────────────────────────────┘
```

---

### 3.2 Constructor de Reglas Visual

```
┌─ Condiciones ────────────────────────────┐
│                                          │
│  Mostrar cuando:                         │
│  ┌──────────────────────────────────┐   │
│  │ [Carrito ▼] [supera ▼] [€50]     │   │
│  │                          [+ Y]   │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ [Es ▼] [día de la semana ▼]      │   │
│  │ [Lun][Mar][Mie][Jue][Vie][ ][ ]  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Vista previa de la regla:               │
│  "Se muestra cuando el carrito supera    │
│   50€ Y es de lunes a viernes"           │
└──────────────────────────────────────────┘
```

---

### 3.3 Templates Predefinidos

Crear galería de templates:

| Template           | Descripción       | Campos Prepopulados   |
| ------------------ | ----------------- | --------------------- |
| 🛍️ Rebajas         | Descuento general | "REBAJAS", rojo, 20%  |
| 💝 San Valentín    | Campaña febrero   | Corazones, rosa       |
| 🖤 Black Friday    | Noviembre         | Negro, amarillo       |
| 🎄 Navidad         | Diciembre         | Verde, rojo, nieve    |
| 🆕 Nueva colección | Lanzamiento       | Elegante, minimalista |

---

### 3.4 Calendario de Promociones

Vista tipo Google Calendar:

```
┌─ Enero 2026 ────────────────────────────┐
│ Lu  Ma  Mi  Ju  Vi  Sá  Do              │
│                 1   2   3   4           │
│ ═══════════════════════════             │
│ 5   6   7   8   9  10  11               │
│ ▓▓▓▓▓ Rebajas Invierno ▓▓▓▓▓            │
│ 12  13  14  15  16  17  18              │
│                                          │
│ [+ Nueva]        [Exportar calendario]  │
└──────────────────────────────────────────┘
```

---

### 3.5 Borradores Auto-guardados

```sql
-- Nueva tabla
CREATE TABLE promotion_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  promotion_data JSONB NOT NULL,
  last_saved TIMESTAMPTZ DEFAULT NOW()
);
```

Con auto-save cada 30 segundos en el frontend.

---

## 🟣 FASE 4: Analytics y Reportes (1-2 semanas)

### 4.1 Tracking de Impresiones

```typescript
// En PromotionBanner.tsx
useEffect(() => {
  if (promotion) {
    // Enviar evento de impresión
    fetch("/api/promotions/track", {
      method: "POST",
      body: JSON.stringify({
        promotion_id: promotion.id,
        zone,
        event: "impression",
      }),
    });
  }
}, [promotion]);
```

---

### 4.2 Dashboard de Métricas

```
┌─ Promoción: Rebajas de Verano ──────────┐
│                                          │
│  👁️ 12,340 impresiones                  │
│  👆 1,234 clics (10% CTR)               │
│  🛒 123 conversiones                     │
│  💰 €4,320 ventas atribuidas            │
│                                          │
│  [📊 Ver gráfico temporal]              │
│  [📥 Exportar datos]                    │
└──────────────────────────────────────────┘
```

---

### 4.3 Comparativa de Promociones

Tabla comparativa de rendimiento entre promociones.

---

## ✅ Criterios de Aceptación por Fase

### Fase 0

- [x] No se pueden guardar URLs `javascript:`
- [x] Solo existe una sección de preview

### Fase 1

- [x] Usuario puede seleccionar destino del botón sin escribir URL
- [x] Todos los textos son comprensibles sin conocimiento técnico
- [x] Hay tooltips de ayuda en campos complejos
- [x] Se muestra toast de confirmación al guardar
- [ ] Validación muestra errores antes de enviar

### Fase 2

- [x] Zona product_page funciona correctamente
- [ ] Admin recibe alertas de promociones por expirar
- [x] Se puede duplicar con personalización
- [ ] Existe historial de cambios

### Fase 3

- [ ] Wizard guía creación paso a paso
- [ ] Constructor de reglas funciona sin código
- [ ] Hay al menos 5 templates disponibles
- [ ] El calendario muestra todas las promociones
- [ ] Borradores se guardan automáticamente

### Fase 4

- [ ] Se registran impresiones por promoción
- [ ] Dashboard muestra métricas clave
- [ ] Se pueden comparar promociones
- [ ] Datos exportables a CSV

---

## 📅 Estimación de Tiempos

| Fase   | Duración    | Dependencias |
| ------ | ----------- | ------------ |
| Fase 0 | 1 día       | Ninguna      |
| Fase 1 | 3-4 días    | Fase 0       |
| Fase 2 | 5-6 días    | Fase 1       |
| Fase 3 | 2-3 semanas | Fase 2       |
| Fase 4 | 1-2 semanas | Fase 3       |

**Total estimado:** ~5-6 semanas

---

## 🚀 Recomendación

Sugiero empezar por **Fase 0 + Fase 1** ya que:

1. Fase 0 es obligatoria (seguridad)
2. Fase 1 mejora significativamente la experiencia sin requerir cambios arquitectónicos grandes
3. Las fases posteriores pueden planificarse según feedback de usuarios reales
