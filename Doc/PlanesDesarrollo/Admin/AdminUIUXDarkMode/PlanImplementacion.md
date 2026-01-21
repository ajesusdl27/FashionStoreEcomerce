# Plan de Implementación: Sistema de Theming Admin

> **Objetivo**: Corregir inconsistencias y mejorar la experiencia de usuario del sistema de temas claro/oscuro del panel de administración.

---

## 📊 Resumen de Esfuerzo

| Fase   | Tareas                | Esfuerzo | Prioridad  |
| ------ | --------------------- | -------- | ---------- |
| Fase 1 | Correcciones Críticas | ~2h      | 🔴 Urgente |
| Fase 2 | Consistencia Visual   | ~3h      | 🟡 Alta    |
| Fase 3 | Mejoras UX            | ~4h      | 🟢 Media   |
| Fase 4 | Accesibilidad         | ~2h      | 🟢 Media   |

**Total Estimado**: ~11 horas

---

## FASE 1: Correcciones Críticas 🔴

_Afectan directamente la usabilidad y legibilidad_

### 1.1 Mejorar Contraste de Texto Muted en Modo Claro

**Problema**: `muted-foreground` tiene ratio ~4.2:1, cercano al límite WCAG.

**Archivo**: `src/styles/global.css`

```diff
  :root {
    /* LIGHT MODE COLORS */
-   --muted-foreground: 240 3.8% 46.1%;
+   --muted-foreground: 240 5% 35%;  /* Más oscuro para mejor contraste */
  }
```

**Verificación**: Usar herramienta de contraste para confirmar ratio ≥ 4.5:1

---

### 1.2 Mejorar Visibilidad del Toggle Switch (Estado Off)

**Problema**: El track del toggle es casi invisible sobre fondo claro.

**Archivos afectados**:

- `src/pages/admin/configuracion/index.astro` (líneas 182-183, 772-773, 894-895)
- `src/pages/admin/promociones/editar/[id].astro` (línea 218)

```diff
- <div class="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary ...">
+ <div class="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:bg-primary peer-checked:border-primary ...">
```

**Beneficio**: Añadir borde hace el toggle distinguible en modo claro.

---

## FASE 2: Consistencia Visual 🟡

_Eliminar colores hardcodeados y asegurar uso de variables_

### 2.1 Reemplazar `bg-white` en Toggle Thumbs

**Archivos**:

- `src/pages/admin/configuracion/index.astro`
- `src/pages/admin/promociones/editar/[id].astro`

```diff
- <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full ...">
+ <div class="absolute left-1 top-1 w-4 h-4 bg-card rounded-full shadow-sm ...">
```

**Razón**: `bg-card` es blanco en light mode y gris oscuro en dark mode, adaptándose automáticamente.

---

### 2.2 Crear Componente Reutilizable para Toggle Switch

**Nuevo archivo**: `src/components/ui/ToggleSwitch.astro`

```astro
---
interface Props {
  id: string;
  name: string;
  checked?: boolean;
  label: string;
  description?: string;
}

const { id, name, checked = false, label, description } = Astro.props;
---

<label class="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
  <div>
    <span class="font-medium">{label}</span>
    {description && <p class="text-sm text-muted-foreground">{description}</p>}
  </div>
  <div class="relative">
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      class="sr-only peer setting-input"
    />
    <div class="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:bg-primary peer-checked:border-primary transition-colors">
    </div>
    <div class="absolute left-1 top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-transform peer-checked:translate-x-5">
    </div>
  </div>
</label>
```

**Beneficio**: Centraliza estilos, facilita mantenimiento.

---

### 2.3 Documentar Excepción de Newsletter Templates

**Archivo**: `src/pages/admin/newsletter/send/[id].astro`

Añadir comentario explicativo:

```html
<!--
  ⚠️ NOTA: Los templates de email usan colores hexadecimales hardcodeados
  intencionalmente porque los clientes de email (Gmail, Outlook, etc.)
  no soportan CSS custom properties.
  
  Colores de marca usados:
  - Brand: #CCFF00 (verde neón)
  - Background: #0a0a0a, #1a1a1a (dark)
  - Text: #666, #999 (grays)
-->
```

---

## FASE 3: Mejoras de UX 🟢

_Para usuarios no técnicos_

### 3.1 Añadir Opción "Sistema" al Theme Selector

**Archivo**: `src/components/ThemeToggle.tsx`

```tsx
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolvedTheme = () => {
      const resolved =
        savedTheme === "system" || !savedTheme
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : (savedTheme as "light" | "dark");

      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    updateResolvedTheme();
    mediaQuery.addEventListener("change", updateResolvedTheme);

    return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const Icon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Sun : Moon;
  const label =
    theme === "system"
      ? "Tema: Sistema"
      : `Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`;

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5 transition-transform duration-200" />
    </button>
  );
}
```

---

### 3.2 Añadir Transición Suave al Icono

En el mismo componente, añadir animación:

```tsx
<Icon className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
```

---

### 3.3 Sincronización Multi-Pestaña

Añadir listener de storage:

```tsx
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "theme" && e.newValue) {
      setTheme(e.newValue as Theme);
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

---

### 3.4 Actualizar FOUC Prevention Script

**Archivo**: `src/layouts/BaseLayout.astro`

```html
<script is:inline>
  (function () {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const isDark =
      theme === "dark" || ((theme === "system" || !theme) && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
  })();
</script>
```

---

## FASE 4: Accesibilidad y Optimización 🟢

### 4.1 Implementar prefers-reduced-motion

**Archivo**: `src/styles/global.css`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 4.2 Optimizar Transiciones del Body

```diff
  body {
-   @apply bg-background text-foreground font-body antialiased transition-colors duration-300;
+   @apply bg-background text-foreground font-body antialiased;
  }

+ /* Transición solo cuando hay cambio de tema activo */
+ html.theme-transitioning body {
+   transition: background-color 300ms ease, color 300ms ease;
+ }
```

En ThemeToggle, añadir la clase temporalmente:

```tsx
const toggleTheme = () => {
  document.documentElement.classList.add("theme-transitioning");
  // ... cambiar tema
  setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 300);
};
```

---

## Verificación Post-Implementación

### Checklist de Testing

- [ ] Toggle cambia entre Light / Dark / System
- [ ] Preferencia persiste tras recargar
- [ ] No hay FOUC al cargar
- [ ] Contraste de texto muted ≥ 4.5:1 en ambos modos
- [ ] Toggle switches visibles en modo claro (estado off)
- [ ] Transiciones suaves sin lag
- [ ] Sistema respeta prefers-reduced-motion
- [ ] Multi-pestaña sincroniza tema
- [ ] Todos los componentes usan variables CSS

### Herramientas de Verificación

1. **Chrome DevTools** > Rendering > Emulate CSS media:
   - `prefers-color-scheme: dark/light`
   - `prefers-reduced-motion: reduce`

2. **axe DevTools** o **Lighthouse** para auditoría de accesibilidad

3. **WCAG Contrast Checker** para ratios de color

---

## Dependencias y Riesgos

| Riesgo                             | Mitigación                         |
| ---------------------------------- | ---------------------------------- |
| Cambios en global.css afectan todo | Testear en todas las páginas admin |
| ThemeToggle refactor extenso       | Mantener backwards compatibility   |
| Newsletter templates intocables    | Documentar excepción               |

---

## Próximos Pasos

1. ✅ Aprobar este plan
2. Implementar Fase 1 (Crítica)
3. Testear en staging
4. Implementar Fases 2-4 iterativamente
5. Documentar en README del proyecto
