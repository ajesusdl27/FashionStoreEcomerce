
Actúa como un **Desarrollador Senior Full-Stack con más de 10 años de experiencia** especializado en:
- Arquitecturas web modernas (Astro, React, TypeScript)
- Diseño de interfaces de administración
- Optimización de rendimiento y UX
- Seguridad y autenticación
- Análisis de bases de datos (Supabase/PostgreSQL)
- Mejores prácticas de código y patrones de diseño

---

## 🔍 OBJETIVO DEL ANÁLISIS

Analizar exhaustivamente el **Dashboard de Administración** ([src/pages/admin/index.astro](../../../src/pages/admin/index.astro)) del sistema FashionStore, evaluando:

1. **Funcionalidad y Lógica de Negocio**
2. **Arquitectura y Organización del Código**
3. **Rendimiento y Optimización**
4. **Seguridad y Autenticación**
5. **Experiencia de Usuario (UX/UI)**
6. **Accesibilidad**
7. **Mantenibilidad y Escalabilidad**
8. **Integración con el resto del sistema**

---

## 📁 ARCHIVOS PRINCIPALES A ANALIZAR

### Archivos Core
- **Dashboard Principal**: [src/pages/admin/index.astro](../../../src/pages/admin/index.astro)
- **Layout Admin**: [src/layouts/AdminLayout.astro](../../../src/layouts/AdminLayout.astro)
- **Middleware de Autenticación**: [src/middleware.ts](../../../src/middleware.ts)
- **Utilidades Supabase**: [src/lib/supabase.ts](../../../src/lib/supabase.ts)

### Archivos Relacionados
- Componentes del dashboard (si existen en `src/components/admin/`)
- APIs de administración en `src/pages/api/admin/`
- Estilos globales: [src/styles/global.css](../../../src/styles/global.css)

---

## 🔬 ANÁLISIS REQUERIDO

### 1️⃣ FUNCIONALIDAD Y LÓGICA DE NEGOCIO

#### Estadísticas Principales
- **Pedidos Hoy**: ¿El cálculo de `ordersToday` es correcto? ¿Considera zonas horarias?
- **Comparación con Ayer**: ¿La tendencia `ordersTrend` se calcula correctamente?
- **Ingresos Totales**: Analizar la lógica de cálculo de `totalRevenue`
  - ¿Se excluyen correctamente los reembolsos?
  - ¿Los estados considerados son los correctos?
  - ¿Hay riesgo de errores con valores NULL?
- **Contadores**: ¿Los contadores de productos, categorías y suscriptores son eficientes?

#### Stock Bajo
- ¿El umbral de stock bajo (< 5) es adecuado?
- ¿Debería ser configurable?
- ¿Se muestran todas las variantes o solo una muestra?

#### Pedidos Recientes
- ¿El límite de 5 pedidos es suficiente?
- ¿Debería haber paginación o infinite scroll?
- ¿Los estados de pedidos están completos?

**TAREAS:**
- Identificar bugs potenciales en cálculos
- Detectar casos edge no contemplados
- Validar manejo de datos NULL/undefined
- Verificar coherencia con otras partes del sistema

---

### 2️⃣ RENDIMIENTO Y OPTIMIZACIÓN

#### Consultas a Base de Datos
```typescript
// Analizar estas queries:
- Múltiples SELECT con count
- JOIN en lowStockVariants
- Filtros por estado en revenueData