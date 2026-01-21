# Guía de Accesibilidad - FashionStore

**Versión:** 1.0  
**Fecha:** 21 de Enero, 2026  
**Para:** Equipo de desarrollo FashionStore

---

## 📋 Introducción

Esta guía documenta los estándares de accesibilidad implementados en FashionStore y proporciona pautas para mantener y mejorar la accesibilidad en desarrollos futuros.

**Nivel de cumplimiento actual:** WCAG 2.1 AA

---

## 🎯 Principios WCAG 2.1

### 1. Perceptible
La información y los componentes de la interfaz deben ser presentables a los usuarios de manera perceptible.

### 2. Operable
Los componentes de la interfaz y la navegación deben ser operables.

### 3. Comprensible
La información y el manejo de la interfaz deben ser comprensibles.

### 4. Robusto
El contenido debe ser robusto para que pueda ser interpretado de forma fiable por una amplia variedad de agentes de usuario, incluidas las tecnologías asistivas.

---

## ✅ Checklist de Accesibilidad para Nuevos Componentes

### Interactividad

- [ ] **Touch Targets:** Mínimo 44x44px (usar clases `w-11 h-11` o `touch-target`)
- [ ] **Estados de Focus:** Visible y claro (outline o ring)
- [ ] **Estados de Hover:** Cambio visual claro
- [ ] **Estados Disabled:** Visualmente diferenciado y `disabled` attribute
- [ ] **Loading States:** Spinner o indicador visual con ARIA

### Navegación por Teclado

- [ ] **Tab Order:** Lógico y predecible
- [ ] **Enter/Space:** Activa botones y links
- [ ] **ESC:** Cierra modales y dropdowns
- [ ] **Arrow Keys:** Navega en listas/menús donde aplique
- [ ] **Focus Trap:** Implementado en modales

### ARIA Attributes

- [ ] **aria-label:** En botones sin texto visible
- [ ] **aria-labelledby:** Para títulos de modales/secciones
- [ ] **aria-describedby:** Para descripciones adicionales
- [ ] **aria-expanded:** En dropdowns y menús colapsables
- [ ] **aria-current:** En links de navegación activos
- [ ] **aria-live:** Para contenido dinámico
- [ ] **role:** Cuando el elemento semántico no es suficiente

### Semántica HTML

- [ ] **Headings:** Jerarquía correcta (h1 → h2 → h3)
- [ ] **Landmarks:** `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] **Buttons vs Links:** `<button>` para acciones, `<a>` para navegación
- [ ] **Forms:** Labels asociados a inputs
- [ ] **Lists:** `<ul>/<ol>` para grupos de elementos

### Contenido Visual

- [ ] **Alt Text:** Descriptivo en imágenes informativas, vacío en decorativas
- [ ] **Color Contrast:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- [ ] **Color Only:** No usar solo color para transmitir información
- [ ] **Text Sizing:** Escalable sin pérdida de funcionalidad

### Modales y Overlays

- [ ] **Focus Management:** Focus trap implementado
- [ ] **ESC to Close:** Funcional
- [ ] **Focus Return:** Vuelve al trigger al cerrar
- [ ] **Backdrop:** `aria-hidden="true"`
- [ ] **ARIA Roles:** `role="dialog"` y `aria-modal="true"`

---

## 🛠️ Componentes y Patrones Accesibles

### Sistema de Toast

```tsx
// ✅ Correcto
import { toast } from '@/components/islands/Toast';

toast.success('Producto añadido al carrito');
toast.error('Error al procesar el pago');

// ❌ Incorrecto
alert('Producto añadido'); // No accesible, no respeta tema
```

**Características:**
- ✅ ARIA live regions dinámicos
- ✅ Respeta tema claro/oscuro
- ✅ Auto-dismiss configurable
- ✅ Diferentes tipos (success, error, warning, info)

---

### Botones y Touch Targets

```tsx
// ✅ Correcto - 44x44px mínimo
<button className="w-11 h-11 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>

// ❌ Incorrecto - Demasiado pequeño
<button className="w-6 h-6">
  <Icon />
</button>
```

**Guías:**
- Mínimo: 44x44px (Apple HIG, WCAG 2.1 AA)
- Desktop: 32x32px puede ser aceptable
- Mobile/Tablet: Siempre 44x44px

---

### Modales con Focus Trap

```tsx
import { FocusTrap } from 'focus-trap-react';

<FocusTrap
  active={isOpen}
  focusTrapOptions={{
    initialFocus: () => closeButtonRef.current,
    escapeDeactivates: true,
    clickOutsideDeactivates: true,
  }}
>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Título del Modal</h2>
    {/* Contenido */}
  </div>
</FocusTrap>
```

**Checklist Modal:**
- ✅ Focus trap activado
- ✅ Focus inicial definido
- ✅ ESC para cerrar
- ✅ Click fuera cierra
- ✅ Focus return al cerrar
- ✅ Body scroll bloqueado

---

### Skip Links

```html
<!-- En BaseLayout.astro -->
<a href="#main-content" class="sr-only">
  Saltar al contenido principal
</a>

<!-- En PublicLayout.astro -->
<main id="main-content" tabindex="-1">
  <!-- Contenido -->
</main>
```

**Clase sr-only:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... */
}

.sr-only:focus {
  position: fixed;
  top: 1rem;
  left: 1rem;
  /* Visible on focus */
}
```

---

### Navegación con ARIA

```tsx
<nav aria-label="Navegación principal">
  <a href="/" aria-current={isActive('/') ? 'page' : undefined}>
    Inicio
  </a>
  <a href="/productos" aria-current={isActive('/productos') ? 'page' : undefined}>
    Productos
  </a>
</nav>
```

**Breadcrumbs:**
```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Inicio</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/productos">Productos</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Camisetas</li>
  </ol>
</nav>
```

---

### Imágenes Accesibles

```tsx
// ✅ Imagen informativa
<img src={product.image} alt={product.name} />

// ✅ Imagen decorativa
<img src="/decoration.svg" alt="" aria-hidden="true" />

// ✅ CloudinaryImage (ya optimizado)
<CloudinaryImage 
  src={imageUrl} 
  alt="Descripción clara y concisa"
  loading="lazy"
/>
```

**Guías de Alt Text:**
- **Productos:** Nombre del producto
- **Categorías:** Nombre de la categoría
- **Promociones:** Descripción de la promoción
- **Logos:** Nombre de la marca
- **Decorativas:** `alt=""` vacío

---

### Hook useReducedMotion

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function MyComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
      Contenido
    </div>
  );
}
```

**Cuándo usar:**
- Animaciones de entrada/salida
- Transiciones complejas
- Efectos de hover animados
- Carruseles automáticos

---

## 🧪 Testing de Accesibilidad

### Herramientas Automáticas

1. **Lighthouse** (Chrome DevTools)
   - Accessibility Score
   - Contraste de color
   - ARIA attributes
   - Names y labels

2. **axe DevTools** (Extensión de navegador)
   - Análisis profundo de WCAG
   - Explicaciones detalladas
   - Sugerencias de corrección

3. **WAVE** (Extensión de navegador)
   - Visualización de elementos accesibles
   - Estructura de headings
   - Contraste de color

### Testing Manual

#### Navegación por Teclado

1. **Tab** - Navega hacia adelante
2. **Shift + Tab** - Navega hacia atrás
3. **Enter** - Activa links y botones
4. **Space** - Activa botones
5. **ESC** - Cierra modales
6. **Arrow Keys** - Navega en menús

**Checklist:**
- [ ] Todo es alcanzable con Tab
- [ ] Orden de foco es lógico
- [ ] Focus es claramente visible
- [ ] No hay focus traps accidentales
- [ ] Modales atrapan el foco correctamente

#### Lectores de Pantalla

**NVDA (Windows - Gratuito):**
```
Ctrl + Alt + N - Iniciar NVDA
Insert - Tecla modificadora NVDA
Insert + Down - Modo exploración
```

**VoiceOver (Mac/iOS - Integrado):**
```
Cmd + F5 - Activar/Desactivar
VO + Right Arrow - Siguiente elemento
VO + Cmd + H - Siguiente heading
```

**Checklist:**
- [ ] Todo el contenido es anunciado
- [ ] Headings correctos
- [ ] Links descriptivos
- [ ] Imágenes con alt apropiado
- [ ] Estados de formularios claros
- [ ] Notificaciones dinámicas anunciadas

#### Contraste de Color

**Herramientas:**
- WebAIM Contrast Checker
- Chrome DevTools (Inspect → Accessibility)
- ColorBox.io

**Requisitos:**
- Texto normal: 4.5:1 (AA), 7:1 (AAA)
- Texto grande: 3:1 (AA), 4.5:1 (AAA)
- Componentes UI: 3:1 (AA)

---

## 🚫 Errores Comunes a Evitar

### ❌ NO hacer

```tsx
// NO - Div como botón
<div onClick={handleClick}>Click me</div>

// NO - Link sin href
<a onClick={navigate}>Go somewhere</a>

// NO - Alt text genérico
<img src="product.jpg" alt="image" />

// NO - Hardcoded alert
alert('Acción completada');

// NO - Touch target pequeño
<button className="w-6 h-6">×</button>

// NO - Color solo para indicar estado
<span className="text-red-500">Error</span>
```

### ✅ SÍ hacer

```tsx
// SÍ - Button semántico
<button onClick={handleClick}>Click me</button>

// SÍ - Link con href
<a href="/somewhere">Go somewhere</a>

// SÍ - Alt text descriptivo
<img src="product.jpg" alt="Camiseta negra Nike talla M" />

// SÍ - Sistema toast
toast.success('Acción completada');

// SÍ - Touch target apropiado
<button className="w-11 h-11">×</button>

// SÍ - Icono + texto para estado
<span className="flex items-center gap-2">
  <AlertCircle className="w-4 h-4 text-red-500" />
  <span>Error en el formulario</span>
</span>
```

---

## 📚 Recursos Adicionales

### Documentación

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

### Herramientas

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Lectores de Pantalla

- [NVDA](https://www.nvaccess.org/) (Windows - Gratuito)
- VoiceOver (Mac/iOS - Integrado)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows - Pago)

---

## 🎓 Formación Recomendada

### Cursos

1. **Web Accessibility by Google** (Udacity - Gratuito)
2. **Introduction to Web Accessibility** (W3C - edX)
3. **Accessibility for Web Design** (LinkedIn Learning)

### Certificaciones

- **IAAP WAS Certification** (Web Accessibility Specialist)
- **DHS Trusted Tester** (Accessible ICT Testing)

---

## 📞 Contacto y Soporte

Para dudas sobre accesibilidad en FashionStore:

1. Consultar esta guía
2. Revisar componentes implementados
3. Testing con herramientas automáticas
4. Testing manual con teclado y lector de pantalla

---

**Última actualización:** 21 de Enero, 2026  
**Mantenido por:** Equipo de desarrollo FashionStore  
**Versión de la guía:** 1.0
