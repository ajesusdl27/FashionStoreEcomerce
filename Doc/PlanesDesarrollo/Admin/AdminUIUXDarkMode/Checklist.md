# Checklist de Verificación: Sistema de Theming

> **Uso**: Marcar cada item tras verificar/implementar.
> Usar [x] para completado, [ ] para pendiente, [!] para bloqueado.

---

## 🔴 FASE 1: Correcciones Críticas

### 1.1 Contraste de Texto

- [x] Verificar ratio de `muted-foreground` en modo claro ≥ 4.5:1
- [x] Actualizar valor en `global.css` si es necesario
- [x] Re-testear en todas las páginas del admin

### 1.2 Toggle Switch Visibility

- [x] Añadir borde al track del toggle en `configuracion/index.astro`
- [x] Aplicar mismo fix en `promociones/editar/[id].astro`
- [x] Verificar visualmente en modo claro (estado off)

---

## 🟡 FASE 2: Consistencia Visual

### 2.1 Colores Hardcodeados

- [x] Reemplazar `bg-white` por `bg-card` en toggle thumb (configuracion)
- [x] Reemplazar `bg-white` por `bg-card` en toggle thumb (promociones)
- [x] Buscar otros usos de `bg-white` en páginas admin
- [x] Documentar excepción de newsletter templates

### 2.2 Componente Reutilizable

- [x] Crear `src/components/ui/ToggleSwitch.astro`
- [x] Migrar toggles existentes a usar el componente
- [x] Verificar que no hay regresiones visuales

---

## 🟢 FASE 3: Mejoras de UX

### 3.1 Theme Toggle Mejorado

- [x] Añadir opción "Sistema" (prefers-color-scheme)
- [x] Implementar ciclo Light → Dark → System
- [x] Añadir label visible en desktop ("Claro", "Oscuro", "Auto")
- [x] Añadir icono Monitor para modo Sistema

### 3.2 Transiciones

- [x] Añadir transición suave al cambiar tema (300ms)
- [x] Añadir micro-animación al icono del toggle
- [x] Verificar que no hay parpadeos

### 3.3 Sincronización

- [x] Implementar listener de `storage` event
- [x] Testear con dos pestañas abiertas
- [x] Verificar que el cambio se refleja inmediatamente

### 3.4 FOUC Prevention

- [x] Actualizar script inline para soportar "system"
- [x] Testear hard refresh en ambos modos
- [x] Verificar en navegación SPA/MPA

---

## 🟢 FASE 4: Accesibilidad

### 4.1 Reducción de Movimiento

- [x] Añadir media query `prefers-reduced-motion` en `global.css`
- [x] Testear con DevTools emulando la preferencia
- [x] Verificar que animaciones se desactivan

### 4.2 Optimización de Rendimiento

- [x] Condicionar transición del body solo durante cambio activo
- [x] Verificar que no hay repaint innecesario
- [x] Medir con DevTools Performance

---

## ✅ Testing Final

### Visual Testing

- [ ] Screenshot modo claro - Dashboard
- [ ] Screenshot modo oscuro - Dashboard
- [ ] Screenshot modo claro - Configuración
- [ ] Screenshot modo oscuro - Configuración
- [ ] Comparar con capturas anteriores

### Functional Testing

- [ ] Toggle cambia tema correctamente
- [ ] Preferencia persiste tras recargar página
- [ ] Modo "Sistema" responde a cambio de OS
- [ ] Multi-pestaña sincroniza
- [ ] No hay FOUC en ningún escenario

### Accessibility Testing

- [ ] Ejecutar axe-core/Lighthouse
- [ ] Verificar contraste pasa WCAG AA
- [ ] Navegar con teclado (Tab + Enter)
- [ ] Verificar ARIA labels

### Cross-Browser

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Responsive

- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## 📝 Notas de Implementación

### Archivos Modificados

| Archivo                         | Cambio                                 |
| ------------------------------- | -------------------------------------- |
| `global.css`                    | Variables de contraste, reduced-motion |
| `ThemeToggle.tsx`               | Lógica completa renovada               |
| `BaseLayout.astro`              | Script FOUC actualizado                |
| `configuracion/index.astro`     | Fix toggles                            |
| `promociones/editar/[id].astro` | Fix toggles                            |
| `ToggleSwitch.astro`            | Nuevo componente                       |

### Dependencias Nuevas

- Ninguna (solo Lucide ya existente)

### Breaking Changes

- Ninguno esperado

---

## 🏁 Criterios de Aceptación

Para considerar la tarea COMPLETADA:

1. ✅ Todos los items de Fase 1 marcados
2. ✅ Todos los items de Fase 2 marcados
3. ✅ Todos los items de Testing Final pasados
4. ⚪ Fases 3-4 pueden ser mejoras incrementales

---

## Firma de Verificación

| Rol           | Nombre | Fecha | Firma |
| ------------- | ------ | ----- | ----- |
| Desarrollador |        |       |       |
| QA            |        |       |       |
| Product Owner |        |       |       |
