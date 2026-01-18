# Prompt: Auditoría Expert de Categorías Admin

**Rol**: Desarrollador Senior Full Stack (+10 años de experiencia).
**Misión**: Realizar una auditoría profunda y plan de mejora para el módulo de **Categorías** en el panel de Administración.

## Contexto y Archivos Clave

Debes analizar el código fuente actual relacionado con la gestión de categorías:

- **Frontend**: `src/pages/admin/categorias/index.astro` (y cualquier componente relacionado o modales).
- **Backend API**: `src/pages/api/admin/categorias.ts`.
- **Base de Datos**: Esquema de `categories` (suposición basada en el uso de Supabase).

## Objetivos del Análisis

1.  **Auditoría de Código y Funcionalidad**:
    - Buscar errores, bugs y "code smells".
    - Identificar incoherencias en la lógica de negocio.
    - Evaluar la integración con otros módulos (ej. Productos).
    - Verificar validaciones (lado cliente y servidor).

2.  **Experiencia de Usuario (UX) - Enfoque "No Técnico"**:
    - El sistema debe ser extremadamente amigable para un usuario final sin conocimientos de programación.
    - Evaluar la claridad de la interfaz, mensajes de feedback (éxito/error), y facilidad de uso.
    - Proponer mejoras para simplificar flujos (ej. creación, edición, eliminación).

3.  **Plan de Implementación**:
    - Diseñar un plan estructurado por fases para aplicar las correcciones y mejoras.

## Entregable Requerido

Debes generar un documento detallado llamado `plan_implementacion.md` (o nombre similar) y guardarlo en el directorio:
`Doc/PlanesDesarrollo/Admin/AdminCategorias/`

El documento debe seguir una estructura profesional (similar a otros planes del proyecto) e incluir:

- **Resumen de Hallazgos**: Tabla o lista con errores críticos, medios y mejoras.
- **Fases de Desarrollo**:
  - Fase 1: Correcciones Críticas (Bugs, seguridad).
  - Fase 2: Mejoras Funcionales y de Lógica.
  - Fase 3: Experiencia de Usuario (UX/UI).
- **Detalle Técnico**: Snippets de código sugeridos para las soluciones.
- **Checklist de Verificación**: Pruebas para asegurar que todo funciona correctamente.

---

**Instrucción Final**: Procede a leer los archivos, analizar el estado actual y generar el plan de implementación en la ruta indicada.
