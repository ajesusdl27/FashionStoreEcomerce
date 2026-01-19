# Módulo Sistema de Diseño - Análisis y Theme Completo

## 1. Colores del Sistema (de tailwind.config.mjs y global.css)

### 1.1 Paleta Light Mode
| Token | HSL | Hex Aproximado | Uso |
|-------|-----|----------------|-----|
| `background` | 0 0% 100% | #ffffff | Fondo principal |
| `foreground` | 240 10% 3.9% | #09090b | Texto principal |
| `primary` | 84 85% 35% | #5D8A00 | Acciones principales (verde oscuro) |
| `primary-foreground` | 0 0% 100% | #ffffff | Texto sobre primary |
| `accent` | 351 100% 63.5% | #FF4757 | Alertas, badges importantes |
| `accent-foreground` | 0 0% 98% | #fafafa | Texto sobre accent |
| `muted` | 240 4.8% 95.9% | #f4f4f5 | Fondos secundarios |
| `muted-foreground` | 240 3.8% 46.1% | #71717a | Texto secundario |
| `card` | 0 0% 100% | #ffffff | Fondo de tarjetas |
| `border` | 240 5.9% 90% | #e4e4e7 | Bordes |
| `input` | 240 5.9% 90% | #e4e4e7 | Inputs |
| `ring` | 84 85% 35% | #5D8A00 | Focus ring |

### 1.2 Paleta Dark Mode
| Token | HSL | Hex Aproximado | Uso |
|-------|-----|----------------|-----|
| `background` | 240 10% 3.9% | #09090b | Fondo principal |
| `foreground` | 0 0% 98% | #fafafa | Texto principal |
| `primary` | 84 100% 50% | #CCFF00 | Acciones principales (verde neón) |
| `primary-foreground` | 240 10% 3.9% | #09090b | Texto sobre primary |
| `accent` | 351 100% 63.5% | #FF4757 | Alertas |
| `muted` | 240 3.7% 15.9% | #27272a | Fondos secundarios |
| `card` | 240 3.7% 15.9% | #18181b | Fondo de tarjetas |
| `border` | 240 3.7% 15.9% | #27272a | Bordes |

---

## 2. Tipografía

```dart
// Fuentes del proyecto original:
// - Display (títulos grandes): Bebas Neue
// - Heading (encabezados): Oswald
// - Body (texto): Space Grotesk
```

| Uso | Fuente | Pesos |
|-----|--------|-------|
| Display | Bebas Neue | 400 |
| Heading | Oswald | 400, 500, 600, 700 |
| Body | Space Grotesk | 400, 500, 600, 700 |

---

## 3. Animaciones Definidas

| Nombre | Tipo | Duración |
|--------|------|----------|
| `fade-in` | Opacidad | 0.3s |
| `fade-up` | Opacidad + translateY | 0.4s |
| `slide-in-right` | translateX | 0.3s |
| `slide-in-bottom` | translateY | 0.3s |
| `bounce-subtle` | Scale | 0.4s |
| `pulse-glow` | BoxShadow | 2s infinite |
| `shimmer` | Background position | 2s infinite |

---

## 4. Componentes UI Base (de /components/ui)

| Componente | Variantes | Props |
|------------|-----------|-------|
| `Button.astro` | primary, secondary, ghost, danger | size: sm/md/lg |
| `Badge.astro` | success, warning, danger, info, muted, primary | - |
| `Input.astro` | - | type, placeholder, required |
| `Select.tsx` | - | options, value, onChange |
| `Modal.astro` | - | title, isOpen |
| `ConfirmModal.tsx` | - | title, message, onConfirm, onCancel |
| `Skeleton.astro` | - | width, height |
| `CloudinaryImage.astro` | - | src, alt, width, transformations |

---

## 5. Clases de Estilo Global

### Glass Effect
```css
.glass {
  @apply bg-card/95 backdrop-blur-sm border border-border;
}
```

### Neon Glow
```css
.neon-glow {
  @apply shadow-[0_0_20px_rgba(204,255,0,0.3)];
}
```

### Admin Card
```css
.admin-card {
  @apply bg-card border border-border rounded-xl p-6;
}
```

### Badges
```css
.badge-success { @apply bg-green-500/20 text-green-600 border border-green-500/30; }
.badge-warning { @apply bg-yellow-500/20 text-yellow-600 border border-yellow-500/30; }
.badge-danger  { @apply bg-red-500/20 text-red-600 border border-red-500/30; }
.badge-info    { @apply bg-blue-500/20 text-blue-600 border border-blue-500/30; }
.badge-primary { @apply bg-primary/20 text-primary border border-primary/30; }
```

---

## 6. Espaciado y Radios

| Token | Valor |
|-------|-------|
| Border radius (cards) | 16px (rounded-2xl) |
| Border radius (buttons) | 8px (rounded-lg) |
| Border radius (badges) | 9999px (rounded-full) |
| Padding cards | 24px (p-6) |
| Padding buttons md | 12px 24px (py-3 px-6) |
| Gap entre items | 16px (gap-4) |
