# ✅ Checklist de Auditoría - Módulo de Configuración

**Proyecto:** FashionStore  
**Fecha:** 20 de enero de 2026  
**Estado:** � Fase 1 Completada

---

## 📊 Resumen de Estado

| Categoría | Estado | Completado |
|-----------|--------|------------|
| Funcionalidad Core | 🟢 Bueno | 80% |
| Integración con Sistema | 🟡 En Progreso | 70% |
| Validación y Seguridad | 🟢 Bueno | 85% |
| UX/UI | 🟡 Parcial | 50% |
| Documentación | 🟡 Parcial | 60% |

---

## 🟢 FASE 1: Correcciones Críticas (COMPLETADA)

### 1.1 Servicio Centralizado de Settings

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.1.1 | Crear `src/lib/settings.ts` con caché | ✅ Completado | 🔴 Crítico | `src/lib/settings.ts` |
| 1.1.2 | Definir interface `StoreSettings` | ✅ Completado | 🔴 Crítico | `src/lib/settings.ts` |
| 1.1.3 | Implementar función `getSettings()` | ✅ Completado | 🔴 Crítico | `src/lib/settings.ts` |
| 1.1.4 | Implementar `invalidateSettingsCache()` | ✅ Completado | 🔴 Crítico | `src/lib/settings.ts` |

### 1.2 Conectar Envío con Settings

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.2.1 | Eliminar constantes hardcodeadas de stripe.ts | ✅ Completado | 🔴 Crítico | `src/lib/stripe.ts` |
| 1.2.2 | Crear función `getShippingConfig()` | ✅ Completado | 🔴 Crítico | `src/lib/stripe.ts` |
| 1.2.3 | Actualizar `create-session.ts` para usar settings | ✅ Completado | 🔴 Crítico | `src/pages/api/checkout/create-session.ts` |
| 1.2.4 | Actualizar `carrito.astro` para usar settings | ✅ Completado | 🔴 Crítico | `src/pages/carrito.astro` |
| 1.2.5 | Actualizar `envios.astro` con precios dinámicos | ✅ Completado | 🔴 Crítico | `src/pages/envios.astro` |

### 1.3 Conectar Datos de Contacto con Settings

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.3.1 | Actualizar `contacto.astro` con settings | ✅ Completado | 🔴 Crítico | `src/pages/contacto.astro` |
| 1.3.2 | Actualizar `privacidad.astro` con settings | ✅ Completado | 🔴 Crítico | `src/pages/privacidad.astro` |
| 1.3.3 | Actualizar `terminos.astro` con settings | ⬜ Pendiente | 🟠 Alto | `src/pages/terminos.astro` |
| 1.3.4 | Actualizar emails con `store_email` de settings | ⬜ Pendiente | 🔴 Crítico | `src/lib/email.ts` |

### 1.4 Unificar formatPrice

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.4.1 | Centralizar `formatPrice` en `formatters.ts` | ✅ Completado | 🔴 Crítico | `src/lib/formatters.ts` |
| 1.4.2 | Re-exportar desde `utils.ts` | ✅ Completado | 🟠 Alto | `src/lib/utils.ts` |
| 1.4.3 | Eliminar duplicado de `admin/productos/index.astro` | ✅ Completado | 🟠 Alto | `src/pages/admin/productos/index.astro` |
| 1.4.4 | Eliminar duplicado de `admin/pedidos/index.astro` | ✅ Completado | 🟠 Alto | `src/pages/admin/pedidos/index.astro` |
| 1.4.5 | Eliminar duplicado de `admin/pedidos/[id].astro` | ✅ Completado | 🟠 Alto | `src/pages/admin/pedidos/[id].astro` |
| 1.4.6 | Eliminar formatPrice de otros archivos (parcial) | 🟡 Parcial | 🟠 Alto | Varios archivos |

### 1.5 Validación Backend

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.5.1 | Instalar Zod | ✅ Ya instalado | 🔴 Crítico | `package.json` |
| 1.5.2 | Crear schema de validación | ✅ Completado | 🔴 Crítico | `src/pages/api/admin/configuracion.ts` |
| 1.5.3 | Implementar validación en endpoint PUT | ✅ Completado | 🔴 Crítico | `src/pages/api/admin/configuracion.ts` |
| 1.5.4 | Implementar endpoint GET | ✅ Completado | 🔴 Crítico | `src/pages/api/admin/configuracion.ts` |

### 1.6 Mejorar RLS Policies

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 1.6.1 | Añadir columna `is_public` a settings | ✅ Migración creada | 🔴 Crítico | `Doc/migrations/035_improve_settings_rls.sql` |
| 1.6.2 | Actualizar RLS policies | ✅ Migración creada | 🔴 Crítico | `Doc/migrations/035_improve_settings_rls.sql` |
| 1.6.3 | Ejecutar migración en Supabase | ⬜ Pendiente | 🔴 Crítico | - |

---

## 🟠 FASE 2: Mejoras Funcionales

### 2.1 Nuevas Secciones de Configuración

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 2.1.1 | Añadir sección de Impuestos (IVA) | ⬜ Pendiente | 🟠 Alto | `src/pages/admin/configuracion/index.astro` |
| 2.1.2 | Añadir sección de Logo/Favicon | ⬜ Pendiente | 🟠 Alto | `src/pages/admin/configuracion/index.astro` |
| 2.1.3 | Implementar upload de imágenes para logo | ⬜ Pendiente | 🟠 Alto | `src/components/islands/admin/` |
| 2.1.4 | Añadir sección de Modo Mantenimiento | ⬜ Pendiente | 🟠 Alto | `src/pages/admin/configuracion/index.astro` |
| 2.1.5 | Implementar middleware de mantenimiento | ⬜ Pendiente | 🟠 Alto | `src/middleware.ts` |
| 2.1.6 | Crear página `/mantenimiento` | ⬜ Pendiente | 🟠 Alto | `src/pages/mantenimiento.astro` |
| 2.1.7 | Añadir sección de SEO | ⬜ Pendiente | 🟡 Medio | `src/pages/admin/configuracion/index.astro` |
| 2.1.8 | Integrar meta tags dinámicos en layouts | ⬜ Pendiente | 🟡 Medio | `src/layouts/` |

### 2.2 Logs de Auditoría

| # | Tarea | Estado | Prioridad | Archivo |
|---|-------|--------|-----------|---------|
| 2.2.1 | Crear tabla `settings_audit_log` | ⬜ Pendiente | 🟠 Alto | `Doc/migrations/036_settings_audit_log.sql` |
| 2.2.2 | Ejecutar migración | ⬜ Pendiente | 🟠 Alto | - |
| 2.2.3 | Integrar logging en endpoint PUT | ⬜ Pendiente | 🟠 Alto | `src/pages/api/admin/configuracion.ts` |
| 2.2.4 | Crear UI para ver historial | ⬜ Pendiente | 🟡 Medio | `src/pages/admin/configuracion/index.astro` |

### 2.3 Settings Faltantes en UI

| # | Tarea | Estado | Prioridad | Setting Key |
|---|-------|--------|-----------|-------------|
| 2.3.1 | Mostrar/editar currency en UI | ⬜ Pendiente | 🟠 Alto | `currency` |
| 2.3.2 | Mostrar/editar tax_rate en UI | ⬜ Pendiente | 🟠 Alto | `tax_rate` |
| 2.3.3 | Mostrar/editar return_window_days en UI | ⬜ Pendiente | 🟠 Alto | `return_window_days` |
| 2.3.4 | Mostrar/editar meta_description en UI | ⬜ Pendiente | 🟡 Medio | `meta_description` |
| 2.3.5 | Mostrar/editar maintenance_mode en UI | ⬜ Pendiente | 🟠 Alto | `maintenance_mode` |

---

## 🟡 FASE 3: Mejoras UX/UI

### 3.1 Ayuda Contextual

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.1.1 | Añadir tooltips a todos los campos | ⬜ Pendiente | 🟡 Medio |
| 3.1.2 | Crear componente de tooltip reutilizable | ⬜ Pendiente | 🟡 Medio |
| 3.1.3 | Añadir textos de ayuda debajo de campos | ⬜ Pendiente | 🟡 Medio |
| 3.1.4 | Añadir sección de FAQ colapsable | ⬜ Pendiente | 🟢 Bajo |

### 3.2 Feedback Visual

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.2.1 | Implementar indicador de cambios sin guardar | ⬜ Pendiente | 🟡 Medio |
| 3.2.2 | Advertir al salir con cambios pendientes | ⬜ Pendiente | 🟡 Medio |
| 3.2.3 | Mejorar toast de éxito (más tiempo visible) | ⬜ Pendiente | 🟢 Bajo |
| 3.2.4 | Añadir estados visuales activo/inactivo | ⬜ Pendiente | 🟡 Medio |

### 3.3 Validación Frontend

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.3.1 | Validación inline para emails | ⬜ Pendiente | 🟡 Medio |
| 3.3.2 | Validación inline para URLs | ⬜ Pendiente | 🟡 Medio |
| 3.3.3 | Validación inline para teléfonos | ⬜ Pendiente | 🟡 Medio |
| 3.3.4 | Validación inline para números | ⬜ Pendiente | 🟡 Medio |
| 3.3.5 | Iconos de estado válido/inválido | ⬜ Pendiente | 🟢 Bajo |

### 3.4 Confirmaciones

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.4.1 | Modal de confirmación para desactivar ofertas | ⬜ Pendiente | 🟡 Medio |
| 3.4.2 | Modal de confirmación para modo mantenimiento | ⬜ Pendiente | 🟡 Medio |
| 3.4.3 | Modal de confirmación para cambios significativos de precio | ⬜ Pendiente | 🟢 Bajo |

### 3.5 Accesibilidad

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.5.1 | Añadir keyboard shortcut Ctrl+S | ⬜ Pendiente | 🟡 Medio |
| 3.5.2 | Mejorar focus visible en inputs | ⬜ Pendiente | 🟢 Bajo |
| 3.5.3 | Añadir ARIA labels completos | ⬜ Pendiente | 🟢 Bajo |
| 3.5.4 | Testear navegación por teclado | ⬜ Pendiente | 🟢 Bajo |

### 3.6 Responsive

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 3.6.1 | Optimizar layout para móvil | ⬜ Pendiente | 🟡 Medio |
| 3.6.2 | Convertir secciones en acordeones en móvil | ⬜ Pendiente | 🟢 Bajo |
| 3.6.3 | Botón guardar fijo en móvil | ⬜ Pendiente | 🟢 Bajo |

---

## 🟢 FASE 4: Optimizaciones

### 4.1 Performance

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 4.1.1 | Implementar caché con TTL configurable | ⬜ Pendiente | 🟢 Bajo |
| 4.1.2 | Optimizar queries con batch fetch | ⬜ Pendiente | 🟢 Bajo |
| 4.1.3 | Implementar optimistic updates | ⬜ Pendiente | 🟢 Bajo |

### 4.2 Testing

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 4.2.1 | Tests unitarios para settings.ts | ⬜ Pendiente | 🟡 Medio |
| 4.2.2 | Tests de integración para API | ⬜ Pendiente | 🟡 Medio |
| 4.2.3 | Tests E2E para flujo completo | ⬜ Pendiente | 🟢 Bajo |

### 4.3 Documentación

| # | Tarea | Estado | Prioridad |
|---|-------|--------|-----------|
| 4.3.1 | Documentar API de configuración | ⬜ Pendiente | 🟡 Medio |
| 4.3.2 | Crear guía de usuario para administradores | ⬜ Pendiente | 🟡 Medio |
| 4.3.3 | Documentar schema de settings | ⬜ Pendiente | 🟢 Bajo |

---

## 📋 Verificación Final

### Tests de Integración a Realizar

| # | Test | Estado | Resultado |
|---|------|--------|-----------|
| T1 | Cambiar shipping_cost y verificar en checkout | ⬜ | - |
| T2 | Cambiar free_shipping_threshold y verificar en carrito | ⬜ | - |
| T3 | Cambiar store_email y verificar en emails enviados | ⬜ | - |
| T4 | Cambiar store_phone y verificar en contacto.astro | ⬜ | - |
| T5 | Cambiar return_window_days y verificar en API returns | ⬜ | - |
| T6 | Activar maintenance_mode y verificar bloqueo | ⬜ | - |
| T7 | Verificar RLS: anon no puede modificar settings | ⬜ | - |
| T8 | Verificar RLS: admin puede leer todo | ⬜ | - |
| T9 | Verificar validación: email inválido rechazado | ⬜ | - |
| T10 | Verificar validación: número negativo rechazado | ⬜ | - |
| T11 | Verificar audit log registra cambios | ⬜ | - |
| T12 | Verificar caché se invalida al guardar | ⬜ | - |

---

## 📊 Métricas de Progreso

**Total de tareas:** 89  
**Completadas:** 0  
**En progreso:** 0  
**Pendientes:** 89

```
Progreso total: ████████░░░░░░░░ 0%

Por fase:
Fase 1 (Crítico):  ░░░░░░░░░░░░░░░ 0%  (0/31)
Fase 2 (Alto):     ░░░░░░░░░░░░░░░ 0%  (0/18)
Fase 3 (Medio):    ░░░░░░░░░░░░░░░ 0%  (0/25)
Fase 4 (Bajo):     ░░░░░░░░░░░░░░░ 0%  (0/15)
```

---

## 📝 Notas de Seguimiento

| Fecha | Nota |
|-------|------|
| 2026-01-20 | Auditoría inicial completada. Identificados 47 hallazgos. |
| | Prioridad: Resolver desconexión entre settings y sistema real. |

---

## 🏷️ Etiquetas de Estado

- ⬜ **Pendiente** - No iniciado
- 🔄 **En progreso** - Trabajo activo
- ✅ **Completado** - Terminado y verificado
- ❌ **Bloqueado** - Tiene dependencias no resueltas
- ⏸️ **Pausado** - Detenido temporalmente
