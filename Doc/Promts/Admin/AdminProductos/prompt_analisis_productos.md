# 🛍️ Prompt de Análisis Exhaustivo: Módulo de Productos (Admin)

---

## 👤 ROL

Actúa como un **Desarrollador Senior Full-Stack con más de 10 años de experiencia** especializado en:

- Arquitecturas web modernas (Astro 5.0, React Islands, TypeScript)
- Desarrollo de sistemas e-commerce y CMS
- Diseño de interfaces de administración intuitivas
- Bases de datos PostgreSQL/Supabase (RLS, RPC, triggers)
- Optimización de rendimiento y UX para usuarios no técnicos
- Accesibilidad web (WCAG 2.1)
- Mejores prácticas de código y patrones de diseño

---

## 🎯 OBJETIVO DEL ANÁLISIS

Analizar **exhaustivamente** el módulo de **Gestión de Productos** del panel de administración de FashionStore, evaluando:

1. **Funcionalidad completa y lógica de negocio**
2. **Errores, bugs y casos edge no contemplados**
3. **Inconsistencias en el código, datos o UI**
4. **Integración con otros módulos** (pedidos, categorías, stock, promociones, carrito)
5. **Rendimiento y optimización de consultas**
6. **Experiencia de Usuario (UX/UI)** para administradores no técnicos
7. **Seguridad y validaciones**
8. **Accesibilidad**
9. **Mantenibilidad y escalabilidad**

---

## 📁 ARCHIVOS A ANALIZAR

### 🔴 Archivos Core del Módulo

| Archivo                                                                                | Descripción                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------- |
| [src/pages/admin/productos/index.astro](file:///src/pages/admin/productos/index.astro) | **Lista de productos** - Vista principal    |
| [src/pages/admin/productos/nuevo.astro](file:///src/pages/admin/productos/nuevo.astro) | **Crear producto** - Formulario de alta     |
| [src/pages/admin/productos/[id].astro](file:///src/pages/admin/productos/[id].astro)   | **Editar producto** - Formulario de edición |
| [src/pages/api/admin/productos.ts](file:///src/pages/api/admin/productos.ts)           | **API REST** - Endpoints CRUD               |

### 🟡 Archivos Relacionados

| Archivo                                                                                            | Descripción                       |
| -------------------------------------------------------------------------------------------------- | --------------------------------- |
| [src/layouts/AdminLayout.astro](file:///src/layouts/AdminLayout.astro)                             | Layout general del admin          |
| [src/middleware.ts](file:///src/middleware.ts)                                                     | Middleware de autenticación       |
| [src/lib/supabase.ts](file:///src/lib/supabase.ts)                                                 | Cliente de Supabase               |
| [src/components/product/ProductCard.astro](file:///src/components/product/ProductCard.astro)       | Componente de tarjeta de producto |
| [src/components/islands/ProductAddToCart.tsx](file:///src/components/islands/ProductAddToCart.tsx) | Componente de añadir al carrito   |

### 🟢 Base de Datos

- Tablas: `products`, `product_variants`, `categories`
- Políticas RLS relacionadas con productos
- Triggers y funciones de stock
- Relaciones entre tablas

---

## 🔬 ANÁLISIS PROFUNDO REQUERIDO

### 1️⃣ FUNCIONALIDAD Y LÓGICA DE NEGOCIO

#### Lista de Productos (`index.astro`)

- [ ] ¿Se cargan todos los productos correctamente?
- [ ] ¿La búsqueda funciona en tiempo real?
- [ ] ¿Los filtros por categoría funcionan?
- [ ] ¿El ordenamiento (nombre, precio, stock, fecha) funciona correctamente?
- [ ] ¿La paginación está implementada o carga todo de golpe?
- [ ] ¿Se muestra correctamente el stock total de cada producto (suma de variantes)?
- [ ] ¿Los estados de producto (activo/inactivo) se reflejan correctamente?

#### Crear Producto (`nuevo.astro`)

- [ ] ¿El formulario valida todos los campos obligatorios?
- [ ] ¿Se pueden subir imágenes? ¿Funciona el drag & drop?
- [ ] ¿Las variantes (talla, color, stock) se crean correctamente?
- [ ] ¿Se puede seleccionar la categoría del producto?
- [ ] ¿Se guardan correctamente los campos de SEO (meta title, description)?
- [ ] ¿El precio y precio de oferta se validan (precio_oferta < precio)?
- [ ] ¿Se genera automáticamente el slug a partir del nombre?
- [ ] ¿Hay validación de slug único?

#### Editar Producto (`[id].astro`)

- [ ] ¿Se cargan todos los datos existentes del producto?
- [ ] ¿Se pueden modificar las variantes existentes?
- [ ] ¿Se pueden añadir nuevas variantes?
- [ ] ¿Se pueden eliminar variantes? ¿Qué pasa con variantes en pedidos pendientes?
- [ ] ¿Las imágenes existentes se muestran y pueden reordenarse?
- [ ] ¿Hay confirmación antes de cambios críticos?

#### API Productos (`productos.ts`)

- [ ] **GET**: ¿Devuelve datos completos (con variantes, categoría)?
- [ ] **POST**: ¿Crea producto y variantes en transacción atómica?
- [ ] **PUT**: ¿Actualiza correctamente todos los campos?
- [ ] **DELETE**: ¿Maneja productos con pedidos asociados? ¿Soft delete o hard delete?
- [ ] ¿Hay validación del token de autenticación?
- [ ] ¿Se verifica que el usuario sea admin?

---

### 2️⃣ ERRORES E INCONSISTENCIAS A BUSCAR

#### Bugs Potenciales

- [ ] Valores NULL/undefined sin manejar
- [ ] Race conditions en actualización de stock
- [ ] Inconsistencia entre precio mostrado y precio en BD
- [ ] Imágenes rotas o URLs inválidas
- [ ] Problemas de zona horaria en fechas
- [ ] Duplicación de datos al guardar rápidamente

#### Inconsistencias de Datos

- [ ] Productos sin categoría asignada
- [ ] Variantes huérfanas (sin producto padre)
- [ ] Precios negativos o stock negativo
- [ ] Slugs duplicados
- [ ] Imágenes sin alt text

#### Inconsistencias de UI

- [ ] Estados de loading/error no manejados
- [ ] Mensajes de éxito/error inconsistentes
- [ ] Formularios que no limpian al navegar
- [ ] Breadcrumbs incorrectos
- [ ] Navegación rota entre páginas

---

### 3️⃣ INTEGRACIÓN CON OTROS MÓDULOS

Verificar coherencia con:

| Módulo          | Verificación                                            |
| --------------- | ------------------------------------------------------- |
| **Pedidos**     | ¿Los productos en pedidos muestran info correcta?       |
| **Carrito**     | ¿El stock se valida antes de añadir al carrito?         |
| **Categorías**  | ¿Se actualizan productos al cambiar/eliminar categoría? |
| **Promociones** | ¿Se aplican descuentos correctamente?                   |
| **Búsqueda**    | ¿Los productos nuevos aparecen en búsqueda?             |
| **Frontend**    | ¿Los cambios se reflejan inmediatamente?                |

---

### 4️⃣ RENDIMIENTO Y OPTIMIZACIÓN

#### Consultas a Base de Datos

```typescript
// Analizar:
- ¿Hay N+1 queries al cargar variantes?
- ¿Se usan índices en campos de búsqueda/filtro?
- ¿Las consultas de listado están paginadas?
- ¿Se hace SELECT * o solo campos necesarios?
```

#### Frontend

- [ ] ¿Las imágenes están optimizadas (formatos modernos, lazy loading)?
- [ ] ¿Se cachean datos que no cambian frecuentemente?
- [ ] ¿Hay debounce en la búsqueda?
- [ ] ¿El tiempo de respuesta del formulario es aceptable?

---

### 5️⃣ EXPERIENCIA DE USUARIO (UX) PARA NO TÉCNICOS

> **CRÍTICO**: El administrador puede NO ser técnico. Evaluar facilidad de uso.

#### Claridad y Simplicidad

- [ ] ¿Los campos del formulario tienen labels descriptivos?
- [ ] ¿Hay textos de ayuda/tooltips explicando cada campo?
- [ ] ¿Los mensajes de error son comprensibles para no técnicos?
- [ ] ¿El flujo de creación de producto es intuitivo?

#### Feedback Visual

- [ ] ¿Hay indicadores claros de guardado/cargando?
- [ ] ¿Se confirman las acciones exitosas visualmente?
- [ ] ¿Los errores de validación son específicos y claros?
- [ ] ¿Hay preview de cómo se verá el producto?

#### Prevención de Errores

- [ ] ¿Hay confirmación antes de eliminar?
- [ ] ¿Se avisa si hay cambios sin guardar al salir?
- [ ] ¿Se pueden deshacer acciones importantes?
- [ ] ¿El auto-guardado de borradores está implementado?

#### Accesibilidad

- [ ] ¿Todos los inputs tienen labels asociados?
- [ ] ¿El contraste de colores es adecuado?
- [ ] ¿Se puede navegar completamente con teclado?
- [ ] ¿Hay atributos ARIA donde corresponde?

---

### 6️⃣ SEGURIDAD

- [ ] ¿Todas las rutas verifican autenticación de admin?
- [ ] ¿Los datos de entrada se sanitizan?
- [ ] ¿Hay protección contra XSS en campos de texto?
- [ ] ¿Las políticas RLS protegen los datos correctamente?
- [ ] ¿Los uploads de imágenes validan tipo y tamaño?

---

## 📋 FORMATO DE ENTREGA

### Proporcionar:

1. **Resumen Ejecutivo** (3-5 bullets con hallazgos principales)

2. **Lista de Errores/Bugs Detectados**

   ```
   | ID | Severidad | Archivo | Línea | Descripción | Solución Propuesta |
   ```

3. **Lista de Inconsistencias**

   ```
   | ID | Tipo | Descripción | Impacto | Acción |
   ```

4. **Análisis de Integración**
   - Diagrama de relaciones entre módulos
   - Puntos de fallo potenciales

5. **Mejoras Propuestas**
   | Prioridad | Mejora | Beneficio | Esfuerzo |
   |-----------|--------|-----------|----------|

6. **Plan de Mejoras UX para No Técnicos**
   - Mejoras inmediatas (quick wins)
   - Mejoras a mediano plazo
   - Rediseños recomendados

7. **Plan de Implementación**
   - Orden de prioridades
   - Dependencias entre mejoras
   - Estimación de tiempo

---

## ⚙️ CONTEXTO TÉCNICO

### Stack del Proyecto

- **Framework**: Astro 5.0 con React Islands
- **Estilos**: Tailwind CSS (dark mode first)
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth con middleware
- **Storage**: Supabase Storage para imágenes
- **Pagos**: Stripe (integrado en checkout)

### Convenciones del Proyecto

- Revisa `/.agent/workflows/fashionstore-rules.md` para las reglas del proyecto
- Componentes Astro para UI estática
- React Islands solo para interactividad
- Colores: `--primary: #CCFF00`, `--accent: #FF4757`

---

## 🚀 INSTRUCCIONES FINALES

1. **Lee TODOS los archivos mencionados** antes de comenzar el análisis
2. **Ejecuta el proyecto localmente** para probar funcionalidades
3. **Documenta CADA problema encontrado** con evidencia (código, screenshots)
4. **Propón soluciones concretas** con código de ejemplo cuando sea relevante
5. **Prioriza las mejoras** según impacto en usuario y complejidad técnica
6. **Genera un plan de implementación realista** con fases

---

> 📌 **Recuerda**: El objetivo final es tener un módulo de productos **robusto, sin errores, bien integrado y fácil de usar para cualquier persona**, aunque no tenga conocimientos técnicos.
