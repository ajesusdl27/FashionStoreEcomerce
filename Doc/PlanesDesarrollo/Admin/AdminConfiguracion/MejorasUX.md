# 🎨 Mejoras de UX/UI para Usuarios NO Técnicos

**Proyecto:** FashionStore - Módulo de Configuración  
**Fecha:** 20 de enero de 2026  
**Audiencia:** Marketing Managers y Administradores sin conocimientos técnicos

---

## 📋 Resumen Ejecutivo

Este documento detalla las mejoras de experiencia de usuario necesarias para que un **marketing manager sin conocimientos técnicos** pueda configurar completamente la tienda FashionStore sin necesidad de asistencia del equipo de desarrollo.

### Principios de Diseño

1. **Claridad sobre brevedad** - Mejor un mensaje largo y claro que uno corto y confuso
2. **Prevención sobre corrección** - Mejor prevenir errores que mostrar mensajes de error
3. **Feedback inmediato** - El usuario siempre sabe qué está pasando
4. **Guía contextual** - Ayuda disponible donde se necesita, sin interrumpir
5. **Reversibilidad** - Fácil deshacer cambios no deseados

---

## 1. 💡 Tooltips y Ayuda Contextual

### 1.1 Implementar Tooltips Explicativos

**Estado actual:** Los campos no tienen explicaciones contextuales.

**Propuesta:**

```astro
<!-- Componente de campo con tooltip -->
<div class="relative">
  <label for="shipping_cost" class="flex items-center gap-2 text-sm font-medium mb-2">
    Coste de envío estándar
    <button 
      type="button" 
      class="text-muted-foreground hover:text-foreground transition-colors"
      data-tooltip="Este es el precio que se cobrará por envío cuando el pedido no alcance el umbral de envío gratis. Se mostrará en el carrito y checkout."
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </label>
  <input type="number" id="shipping_cost" ... />
</div>

<!-- Tooltip flotante -->
<div id="tooltip" class="hidden absolute z-50 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs text-sm">
</div>
```

### 1.2 Textos de Ayuda Específicos por Campo

| Campo | Tooltip | Ejemplo de valor |
|-------|---------|------------------|
| `store_name` | "El nombre que aparecerá en emails, facturas y el header del sitio" | "FashionStore" |
| `store_email` | "Email principal de contacto. Los clientes lo verán en la página de contacto y en los emails de confirmación" | "contacto@mitienda.com" |
| `free_shipping_threshold` | "Pedidos con subtotal igual o mayor a esta cantidad tendrán envío gratis. Se muestra una barra de progreso en el carrito" | "50.00" |
| `shipping_cost` | "Precio de envío cuando no se alcanza el umbral de envío gratis" | "4.99" |
| `flash_offers_end` | "Cuando llegue esta fecha, la sección de ofertas se ocultará automáticamente. Déjalo vacío para que no expire" | "" |
| `social_instagram` | "URL completa de tu perfil de Instagram. Se mostrará el icono en el footer" | "https://instagram.com/fashionstore" |
| `tax_rate` | "Porcentaje de IVA para facturas. Si tus precios ya incluyen IVA, marca la casilla correspondiente" | "21" |

### 1.3 Sección de FAQ Colapsable

```astro
<!-- Al final de la página de configuración -->
<details class="admin-card">
  <summary class="font-heading text-lg cursor-pointer flex items-center justify-between">
    <span>❓ Preguntas Frecuentes</span>
    <svg class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </summary>
  
  <div class="mt-4 space-y-4 text-sm text-muted-foreground">
    <div>
      <p class="font-medium text-foreground">¿Cuándo se aplican los cambios?</p>
      <p>Los cambios se aplican inmediatamente al guardar. Los usuarios que estén navegando verán los nuevos valores en su próxima carga de página.</p>
    </div>
    
    <div>
      <p class="font-medium text-foreground">¿Qué pasa si cambio el precio de envío durante un checkout en proceso?</p>
      <p>Los checkouts en proceso mantienen el precio original. Solo nuevos carritos verán el precio actualizado.</p>
    </div>
    
    <div>
      <p class="font-medium text-foreground">¿Puedo deshacer cambios?</p>
      <p>Puedes ver el historial de cambios abajo y contactar soporte para restaurar valores anteriores.</p>
    </div>
  </div>
</details>
```

---

## 2. 🚦 Indicadores de Estado

### 2.1 Indicador de Cambios Sin Guardar

**Problema actual:** El usuario no sabe si tiene cambios pendientes.

**Solución:**

```javascript
// Detectar cambios en el formulario
const form = document.getElementById('settings-form');
const originalValues = new FormData(form);
let hasUnsavedChanges = false;

form.addEventListener('input', () => {
  const currentValues = new FormData(form);
  hasUnsavedChanges = !areFormDataEqual(originalValues, currentValues);
  updateUnsavedIndicator(hasUnsavedChanges);
});

function updateUnsavedIndicator(hasChanges) {
  const indicator = document.getElementById('unsaved-indicator');
  const saveBtn = document.getElementById('save-btn');
  
  if (hasChanges) {
    indicator.classList.remove('hidden');
    saveBtn.classList.add('animate-pulse');
    // Actualizar título de pestaña
    document.title = '● Configuración - FashionStore Admin';
  } else {
    indicator.classList.add('hidden');
    saveBtn.classList.remove('animate-pulse');
    document.title = 'Configuración - FashionStore Admin';
  }
}

// Advertir al salir con cambios sin guardar
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '¿Seguro que quieres salir? Tienes cambios sin guardar.';
  }
});
```

```astro
<!-- Indicador visual -->
<div id="unsaved-indicator" class="hidden fixed top-4 right-4 z-50">
  <div class="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    Tienes cambios sin guardar
  </div>
</div>
```

### 2.2 Estados de Configuración Activa/Inactiva

**Propuesta:** Mostrar claramente qué está activo.

```astro
<!-- Toggle con estado visual claro -->
<label class="flex items-center justify-between cursor-pointer p-4 rounded-lg transition-all
  {getSettingBool('offers_enabled') 
    ? 'bg-primary/10 border-2 border-primary/50' 
    : 'bg-muted/30 border border-border'}">
  <div>
    <span class="font-medium flex items-center gap-2">
      {getSettingBool('offers_enabled') ? (
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      ) : (
        <span class="w-2 h-2 rounded-full bg-muted"></span>
      )}
      Flash Offers
    </span>
    <p class="text-sm text-muted-foreground">
      {getSettingBool('offers_enabled') 
        ? '✅ Visible en la página principal' 
        : '❌ Oculta para los visitantes'}
    </p>
  </div>
  <!-- toggle switch -->
</label>
```

---

## 3. ✅ Validación Visual Inline

### 3.1 Validación en Tiempo Real

```javascript
// Validaciones específicas por tipo de campo
const validators = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Introduce un email válido (ej: contacto@tienda.com)';
    return null;
  },
  
  url: (value) => {
    if (!value) return null; // URLs opcionales
    try {
      new URL(value);
      return null;
    } catch {
      return 'Introduce una URL válida (ej: https://instagram.com/mitienda)';
    }
  },
  
  phone: (value) => {
    const regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!regex.test(value.replace(/\s/g, ''))) {
      return 'Formato de teléfono inválido (ej: +34 600 000 000)';
    }
    return null;
  },
  
  number_positive: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return 'Debe ser un número positivo';
    return null;
  },
  
  instagram_url: (value) => {
    if (!value) return null;
    if (!value.includes('instagram.com')) {
      return 'La URL debe ser de Instagram (https://instagram.com/...)';
    }
    return null;
  }
};

// Aplicar validación al campo
function validateField(input) {
  const validatorName = input.dataset.validator;
  if (!validatorName) return;
  
  const validator = validators[validatorName];
  const error = validator(input.value);
  
  const errorElement = input.parentElement.querySelector('.field-error');
  
  if (error) {
    input.classList.add('border-red-500', 'focus:ring-red-500');
    input.classList.remove('border-border', 'focus:ring-primary');
    
    if (errorElement) {
      errorElement.textContent = error;
      errorElement.classList.remove('hidden');
    }
  } else {
    input.classList.remove('border-red-500', 'focus:ring-red-500');
    input.classList.add('border-border', 'focus:ring-primary');
    
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }
}

// Event listeners
document.querySelectorAll('input[data-validator], textarea[data-validator]').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', debounce(() => validateField(input), 300));
});
```

```astro
<!-- Campo con validación visual -->
<div>
  <label for="store_email" class="block text-sm font-medium text-muted-foreground mb-2">
    Email de contacto
  </label>
  <input 
    type="email" 
    id="store_email" 
    name="store_email"
    data-validator="email"
    value={getSettingValue("store_email", "")}
    class="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
  />
  <p class="field-error hidden text-sm text-red-400 mt-1"></p>
</div>
```

### 3.2 Indicadores de Validez

```astro
<!-- Icono de estado en el campo -->
<div class="relative">
  <input type="email" id="store_email" class="pr-10 ..." />
  <div class="absolute right-3 top-1/2 -translate-y-1/2">
    <!-- Estado válido -->
    <svg class="w-5 h-5 text-green-500 hidden" id="store_email-valid">
      <path d="M5 13l4 4L19 7" />
    </svg>
    <!-- Estado inválido -->
    <svg class="w-5 h-5 text-red-500 hidden" id="store_email-invalid">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
</div>
```

---

## 4. 🔔 Confirmaciones para Cambios Críticos

### 4.1 Modal de Confirmación

```astro
<!-- Modal de confirmación -->
<div id="confirm-modal" class="fixed inset-0 z-50 hidden">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeConfirmModal()"></div>
  
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
    <div class="bg-card border border-border rounded-2xl p-6 shadow-2xl">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="font-heading text-lg" id="confirm-title">¿Confirmar cambios?</h3>
          <p class="text-sm text-muted-foreground" id="confirm-subtitle"></p>
        </div>
      </div>
      
      <div id="confirm-message" class="text-muted-foreground mb-6">
        <!-- Mensaje dinámico -->
      </div>
      
      <div class="flex justify-end gap-3">
        <button type="button" onclick="closeConfirmModal()" class="admin-btn-secondary">
          Cancelar
        </button>
        <button type="button" id="confirm-action-btn" class="admin-btn-primary">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</div>
```

### 4.2 Cambios que Requieren Confirmación

```javascript
const criticalChanges = {
  offers_enabled: {
    fromTrue: {
      title: '¿Desactivar ofertas?',
      message: 'La sección de Flash Offers desaparecerá de la página principal. Los productos en oferta seguirán disponibles pero no se mostrarán destacados.',
      buttonText: 'Sí, desactivar'
    },
    fromFalse: {
      title: '¿Activar ofertas?',
      message: 'Se mostrará la sección de Flash Offers en la página principal con los productos marcados como oferta.',
      buttonText: 'Activar ofertas'
    }
  },
  
  maintenance_mode: {
    fromFalse: {
      title: '⚠️ ¿Activar modo mantenimiento?',
      message: 'Los visitantes NO podrán acceder a la tienda y verán un mensaje de mantenimiento. Solo los administradores podrán navegar normalmente.',
      buttonText: 'Activar mantenimiento',
      buttonClass: 'bg-yellow-500 hover:bg-yellow-600'
    }
  },
  
  shipping_cost: {
    significant_change: {
      title: '¿Cambiar coste de envío?',
      message: (oldValue, newValue) => `
        Estás cambiando el coste de envío de ${oldValue}€ a ${newValue}€.
        Este cambio afectará a todos los nuevos pedidos inmediatamente.
        Los carritos en proceso pueden mostrar el precio anterior hasta que refresquen.
      `,
      buttonText: 'Aplicar nuevo precio'
    }
  }
};

function checkCriticalChanges(fieldName, oldValue, newValue) {
  const config = criticalChanges[fieldName];
  if (!config) return null;
  
  // Lógica para determinar qué confirmación mostrar
  if (fieldName === 'offers_enabled') {
    return oldValue === true ? config.fromTrue : config.fromFalse;
  }
  
  if (fieldName === 'maintenance_mode' && newValue === true) {
    return config.fromFalse;
  }
  
  if (fieldName === 'shipping_cost') {
    const diff = Math.abs(parseFloat(newValue) - parseFloat(oldValue));
    if (diff > 1) { // Cambio > 1€
      return {
        ...config.significant_change,
        message: config.significant_change.message(oldValue, newValue)
      };
    }
  }
  
  return null;
}
```

---

## 5. 📱 Mejoras de Diseño Responsivo

### 5.1 Reorganización en Dispositivos Móviles

```css
/* Estilos responsivos para configuración */
@media (max-width: 768px) {
  /* Hacer campos full-width */
  .admin-card .grid-cols-2 {
    @apply grid-cols-1;
  }
  
  /* Aumentar tamaño de targets táctiles */
  .admin-card input,
  .admin-card textarea,
  .admin-card select {
    @apply py-4 text-base;
  }
  
  /* Botón de guardar fijo en móvil */
  .save-button-container {
    @apply fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border;
  }
  
  /* Secciones colapsables en móvil */
  .admin-card {
    @apply cursor-pointer;
  }
  
  .admin-card-content {
    @apply hidden;
  }
  
  .admin-card.expanded .admin-card-content {
    @apply block;
  }
}
```

### 5.2 Acordeones para Móvil

```javascript
// En móvil, convertir secciones en acordeones
if (window.innerWidth <= 768) {
  document.querySelectorAll('.admin-card').forEach(card => {
    const header = card.querySelector('.flex.items-center.gap-3');
    const content = card.querySelector('.space-y-4:not(.flex.items-center)');
    
    if (header && content) {
      content.classList.add('admin-card-content', 'hidden');
      
      header.addEventListener('click', () => {
        card.classList.toggle('expanded');
        content.classList.toggle('hidden');
      });
      
      // Añadir indicador de expandir
      const chevron = document.createElement('svg');
      chevron.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />`;
      chevron.className = 'w-5 h-5 ml-auto transition-transform';
      header.appendChild(chevron);
    }
  });
}
```

---

## 6. ⌨️ Accesibilidad y Atajos de Teclado

### 6.1 Keyboard Shortcuts

```javascript
// Atajos de teclado
document.addEventListener('keydown', (e) => {
  // Ctrl+S o Cmd+S para guardar
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('settings-form').requestSubmit();
  }
  
  // Escape para cancelar/cerrar modales
  if (e.key === 'Escape') {
    closeConfirmModal();
    closeAnyOpenTooltip();
  }
  
  // Tab navigation mejorada
  // (ya funciona por defecto pero añadir focus visible mejorado)
});
```

### 6.2 Focus Visible Mejorado

```css
/* Focus visible accesible */
input:focus-visible,
textarea:focus-visible,
button:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
}

/* Skip links para navegación rápida */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-4 focus:rounded-lg;
}
```

### 6.3 ARIA Labels

```astro
<!-- Mejorar accesibilidad -->
<div role="region" aria-labelledby="store-info-heading">
  <h2 id="store-info-heading" class="font-heading text-lg">Información de la Tienda</h2>
  
  <div>
    <label for="store_name" id="store_name-label">Nombre de la tienda</label>
    <input 
      type="text" 
      id="store_name" 
      aria-labelledby="store_name-label"
      aria-describedby="store_name-hint"
      required
    />
    <p id="store_name-hint" class="text-sm text-muted-foreground">
      Aparecerá en emails, facturas y el header del sitio
    </p>
  </div>
</div>

<!-- Toggle con role switch -->
<label class="relative">
  <input 
    type="checkbox" 
    role="switch"
    aria-checked={getSettingBool('offers_enabled')}
    aria-label="Activar sección de ofertas"
  />
  <span class="sr-only">Activar Flash Offers</span>
</label>
```

---

## 7. 📊 Feedback Visual Mejorado

### 7.1 Toast Notifications Mejoradas

```astro
<!-- Toast container -->
<div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  <!-- Toasts se añaden dinámicamente -->
</div>
```

```javascript
function showToast({ type, title, message, duration = 5000 }) {
  const container = document.getElementById('toast-container');
  
  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
  };
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.className = `
    ${colors[type]} 
    border rounded-lg p-4 shadow-lg 
    flex items-start gap-3 
    animate-slide-in-right
    max-w-sm
  `;
  
  toast.innerHTML = `
    <span class="text-xl">${icons[type]}</span>
    <div class="flex-1">
      <p class="font-medium">${title}</p>
      ${message ? `<p class="text-sm opacity-80 mt-1">${message}</p>` : ''}
    </div>
    <button onclick="this.parentElement.remove()" class="opacity-60 hover:opacity-100">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Auto-remove después de duration
  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Usar después de guardar
showToast({
  type: 'success',
  title: 'Configuración guardada',
  message: 'Los cambios se aplicarán inmediatamente en la tienda'
});
```

### 7.2 Previsualización de Cambios

```astro
<!-- Panel de previsualización (para cambios visuales como logo) -->
<div class="admin-card">
  <h3 class="font-heading text-lg mb-4">Vista previa</h3>
  
  <div class="border border-dashed border-border rounded-xl p-6">
    <div class="bg-background rounded-lg p-4 space-y-4">
      <!-- Header preview -->
      <div class="flex items-center gap-3 pb-4 border-b border-border">
        <img id="preview-logo" src="" alt="Logo" class="h-10 object-contain" />
        <span id="preview-store-name" class="font-display text-xl"></span>
      </div>
      
      <!-- Footer preview -->
      <div class="text-sm text-muted-foreground">
        <p>Contacto: <span id="preview-email"></span></p>
        <p>Tel: <span id="preview-phone"></span></p>
        <p><span id="preview-address"></span></p>
      </div>
    </div>
  </div>
</div>
```

```javascript
// Actualizar preview en tiempo real
document.getElementById('store_name').addEventListener('input', (e) => {
  document.getElementById('preview-store-name').textContent = e.target.value;
});

document.getElementById('store_email').addEventListener('input', (e) => {
  document.getElementById('preview-email').textContent = e.target.value;
});
// ... etc
```

---

## 8. 📚 Guía Rápida In-App

### 8.1 Onboarding Tour

```javascript
// Tour guiado para nuevos usuarios (usando shepherd.js o similar)
const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: { enabled: true },
    classes: 'shadow-lg bg-card border border-border rounded-xl'
  }
});

tour.addStep({
  id: 'welcome',
  text: `
    <div class="p-4">
      <h3 class="font-heading text-lg mb-2">¡Bienvenido a Configuración!</h3>
      <p class="text-muted-foreground">
        Aquí puedes personalizar tu tienda FashionStore. 
        Te mostraremos las secciones más importantes.
      </p>
    </div>
  `,
  buttons: [
    { text: 'Saltar tour', action: tour.cancel },
    { text: 'Siguiente', action: tour.next }
  ]
});

tour.addStep({
  id: 'store-info',
  attachTo: { element: '#store-info-section', on: 'bottom' },
  text: `
    <div class="p-4">
      <h3 class="font-heading text-lg mb-2">Información de la Tienda</h3>
      <p class="text-muted-foreground">
        Estos datos aparecerán en toda la web: emails de confirmación, 
        facturas, página de contacto...
      </p>
    </div>
  `,
  buttons: [
    { text: 'Anterior', action: tour.back },
    { text: 'Siguiente', action: tour.next }
  ]
});

// Mostrar tour solo la primera vez
if (!localStorage.getItem('config-tour-completed')) {
  tour.start();
  tour.on('complete', () => localStorage.setItem('config-tour-completed', 'true'));
}
```

---

## 📊 Métricas de Éxito UX

| Métrica | Estado Actual | Objetivo |
|---------|---------------|----------|
| Tiempo para completar configuración básica | ~10 min | < 5 min |
| Errores de validación por sesión | Alto | < 1 |
| Llamadas a soporte por configuración | ? | 0 |
| Satisfacción usuario (NPS) | ? | > 8/10 |
| Tasa de abandono en página de config | ? | < 5% |

---

## ✅ Checklist de Implementación UX

### Prioridad Alta
- [ ] Tooltips explicativos en todos los campos
- [ ] Indicador de cambios sin guardar
- [ ] Validación inline en tiempo real
- [ ] Confirmación para cambios críticos
- [ ] Toast notifications mejoradas

### Prioridad Media
- [ ] Preview en tiempo real
- [ ] Keyboard shortcuts (Ctrl+S)
- [ ] Reorganización responsiva móvil
- [ ] ARIA labels completos
- [ ] FAQ colapsable

### Prioridad Baja
- [ ] Tour guiado para nuevos usuarios
- [ ] Dark mode preview
- [ ] Historial de cambios visual
- [ ] Export/Import de configuración
