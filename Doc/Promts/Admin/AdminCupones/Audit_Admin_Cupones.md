# Prompt: Auditoría Expert de Cupones Admin

**Rol**: Desarrollador Senior Full Stack (+10 años de experiencia).
**Misión**: Realizar una auditoría profunda y plan de mejora para el módulo de **Cupones** en el panel de Administración.

## Contexto y Archivos Clave

Debes analizar el código fuente actual relacionado con la gestión de cupones:

- **Frontend**: `src/pages/admin/cupones/index.astro` (y cualquier componente relacionado o modales).
- **Backend API**: `src/pages/api/admin/cupones.ts`.
- **Base de Datos**: Esquema de `coupons` (revisar `Doc/migrations/015_create_coupons_table.sql` y `Doc/migrations/016_fix_coupon_usages_rls.sql`).

## Objetivos del Análisis

1.  **Auditoría de Código y Funcionalidad**:
    - Buscar errores, bugs y "code smells".
    - Indentificar problemas de concurrencia (ej. uso de cupones simultáneo).
    - Verificar la lógica de descuento (porcentaje vs monto fijo).
    - Evaluar la integración con el checkout y órdenes.
    - Verificar validaciones (fechas de expiración, límites de uso, mínimo de compra).

2.  **Experiencia de Usuario (UX) - Enfoque "No Técnico"**:
    - El sistema debe ser intuitivo para gestores de marketing.
    - Evaluar la claridad al crear reglas de cupones.
    - Proponer mejoras para visualizar el uso de cupones (estadísticas simples).
    - Simplificar la creación/edición de cupones complejos.

3.  **Plan de Implementación**:
    - Diseñar un plan estructurado por fases para aplicar las correcciones y mejoras.

## Entregable Requerido

Debes generar un documento detallado llamado `plan_implementacion.md` y guardarlo en el directorio:
`Doc/PlanesDesarrollo/Admin/AdminCupones/`

El documento debe seguir una estructura profesional e incluir:

- **Resumen de Hallazgos**: Tabla con errores críticos, medios y mejoras.
- **Fases de Desarrollo**:
  - Fase 1: Correcciones Críticas (Lógica de descuentos, concurrencia).
  - Fase 2: Mejoras Funcionales (Validaciones avanzadas, estadísticas).
  - Fase 3: Experiencia de Usuario (UX/UI).
- **Detalle Técnico**: Snippets de código sugeridos.
- **Checklist de Verificación**: Pruebas específicas para escenarios de descuentos.

---

**Instrucción Final**: Procede a leer los archivos indicados, analizar el estado actual y generar el plan de implementación en la ruta indicada.
