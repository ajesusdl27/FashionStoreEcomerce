# 🎨 Guía de UX/UI para Dashboard - Usuarios No Técnicos

> **FashionStore Admin Dashboard v2.0**  
> Diseñado para facilitar el uso a administradores sin conocimientos técnicos

---

## 🎯 Principios de Diseño

### 1. **Claridad Visual**

- Jerarquía clara con tamaños de texto diferenciados
- Uso de iconos universales reconocibles
- Colores con significado consistente (verde = positivo, rojo = negativo)

### 2. **Lenguaje Sencillo**

- Evitar términos técnicos (no "query", "API", "RLS")
- Usar español neutral sin anglicismos
- Tooltips explicativos en conceptos complejos

### 3. **Feedback Visual Inmediato**

- Confirmaciones visibles de acciones
- Estados de carga claros
- Mensajes de error comprensibles

---

## 📱 Layout Responsive

### Desktop (1920px+)

```
┌─────────────────────────────────────────────────────────┐
│  FashionStore Admin    🏠 Dashboard  🌙 Dark Mode  👤 Admin │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────────┐   │
│  │ 💰 Ventas    │ ⏰ Pendientes│ ⭐ Más Vendido  │   │
│  │              │              │                  │   │
│  │ €12,450.00  │      15      │ Camiseta Retro  │   │
│  │ ▲ 12% ↑     │ 8 sin pagar  │ 45 unidades     │   │
│  └──────────────┴──────────────┴──────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📊 Ventas de los Últimos 7 Días                 │  │
│  │                                                  │  │
│  │    [Gráfico de Barras]                          │  │
│  │                                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────┬──────────────────────────┐  │
│  │ 📦 Productos con     │ 📋 Pedidos Recientes    │  │
│  │    Poco Stock        │                          │  │
│  │                      │                          │  │
│  │ [Lista alertas]      │ [Tabla pedidos]         │  │
│  └──────────────────────┴──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Mobile (375px)

```
┌─────────────────────┐
│ ☰  FashionStore    │
├─────────────────────┤
│ 💰 Ventas del Mes   │
│ €12,450             │
│ ▲ 12% vs mes ant.  │
├─────────────────────┤
│ ⏰ Pedidos          │
│    Pendientes       │
│       15            │
├─────────────────────┤
│ ⭐ Más Vendido      │
│ Camiseta Retro      │
│ 45 unidades         │
├─────────────────────┤
│ 📊 Ventas 7 Días    │
│                     │
│ [Gráfico Compacto] │
│                     │
├─────────────────────┤
│ 📦 Stock Bajo       │
│ [Ver 5 productos]   │
└─────────────────────┘
```

---

## 🎨 Paleta de Colores Semántica

### Estados de Negocio

| Color                   | Uso                     | Ejemplo                            |
| ----------------------- | ----------------------- | ---------------------------------- |
| 🟢 Verde (`#10b981`)    | Positivo, completado    | Ventas creciendo, pedido entregado |
| 🔴 Rojo (`#ef4444`)     | Negativo, urgente       | Ventas bajando, sin stock          |
| 🟡 Amarillo (`#f59e0b`) | Advertencia, pendiente  | Pedido pendiente, stock bajo       |
| 🔵 Azul (`#3b82f6`)     | Informativo, en proceso | Pedido enviado, en tránsito        |
| ⚪ Gris (`#6b7280`)     | Neutral, deshabilitado  | Sin cambios, cancelado             |
| 🟣 Morado (`#8b5cf6`)   | Especial, destacado     | Producto top, promoción            |

---

## 📊 KPIs Visuales

### KPI Card: Ventas del Mes

**Visual**:

```
┌────────────────────────────────┐
│ 💰 Ventas del Mes              │
│                                │
│        €12,450.00              │
│         ▲ 12.5%                │
│                                │
│ 156 pedidos este mes           │
│                                │
│ [Comparación con mes anterior] │
│  Actual: €12,450               │
│  Anterior: €11,070             │
│  Diferencia: +€1,380           │
└────────────────────────────────┘
```

**Tooltip (al pasar mouse)**:

```
┌──────────────────────────────────────┐
│ ℹ️ ¿Qué significa esto?              │
│                                      │
│ Suma total de todas las ventas del  │
│ mes actual, restando reembolsos.    │
│                                      │
│ El porcentaje muestra el cambio     │
│ comparado con el mes anterior.      │
└──────────────────────────────────────┘
```

---

### KPI Card: Pedidos Pendientes

**Visual**:

```
┌────────────────────────────────┐
│ ⏰ Pedidos Pendientes          │
│                                │
│           15                   │
│                                │
│ • 8 sin pagar                  │
│ • 7 por enviar                 │
│                                │
│ [Ver Todos] →                  │
└────────────────────────────────┘
```

**Estado de Alerta (>20 pendientes)**:

```
┌────────────────────────────────┐
│ ⚠️ ¡Atención Requerida!        │
│                                │
│          23 🔴                 │
│                                │
│ Hay más pedidos pendientes     │
│ de lo habitual                 │
│                                │
│ [Gestionar Ahora] →            │
└────────────────────────────────┘
```

---

### KPI Card: Producto Más Vendido

**Visual**:

```
┌────────────────────────────────┐
│ ⭐ Producto Más Vendido        │
│                                │
│ Camiseta Retro Vintage         │
│                                │
│ 🏆 45 unidades vendidas        │
│ 💰 €1,350.00 en ingresos       │
│                                │
│ [Ver Producto] →               │
└────────────────────────────────┘
```

**Con Imagen del Producto**:

```
┌────────────────────────────────┐
│ ⭐ Producto Más Vendido        │
│                                │
│  ┌──────┐  Camiseta Retro      │
│  │[IMG] │  Vintage             │
│  └──────┘                      │
│           45 vendidas          │
│           €1,350.00            │
│                                │
│ [Ver Detalles] →               │
└────────────────────────────────┘
```

---

## 📈 Gráfico de Ventas

### Diseño Interactivo

**Componentes**:

1. **Título descriptivo**: "Evolución de Ventas - Últimos 7 Días"
2. **Leyenda clara**: Cada barra representa un día
3. **Tooltip informativo**: Aparece al pasar el mouse
4. **Acciones rápidas**: Botón "Exportar" y "Ver Mes Completo"

**Ejemplo de Tooltip**:

```
┌────────────────────────────┐
│ 📅 Martes 14 de Enero     │
│                            │
│ 💰 Ventas: €1,850.00      │
│ 📦 Pedidos: 23            │
│ 📊 Ticket medio: €80.43   │
└────────────────────────────┘
```

**Visualización de Datos**:

```
Ventas (€)
│
2000 ┤
     │     ▓▓       ▓▓
1500 ┤  ▓▓ ▓▓    ▓▓ ▓▓
     │  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓
1000 ┤  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓
     │  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓
 500 ┤  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓
     │  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓
   0 └──────────────────────
      Lun Mar Mié Jue Vie Sáb Dom

[Exportar CSV] [Ver Mes Completo →]
```

---

## 🔔 Notificaciones y Feedback

### Mensajes de Éxito

```
┌─────────────────────────────────────┐
│ ✅ Datos actualizados correctamente │
└─────────────────────────────────────┘
```

### Mensajes de Error (Amigables)

```
❌ EVITAR:
"Supabase RLS policy violation: user not authorized"

✅ USAR:
"No tienes permisos para ver esta información.
Contacta con el administrador principal."
```

```
❌ EVITAR:
"Network timeout after 5000ms"

✅ USAR:
"La conexión está lenta. Intentando de nuevo...
Si el problema persiste, recarga la página."
```

### Estados de Carga

**Skeleton Loader**:

```
┌────────────────────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒                    │
│                                │
│        ▒▒▒▒▒▒▒▒▒              │
│         ▒▒▒▒▒                 │
│                                │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒              │
└────────────────────────────────┘
```

**Con Animación de Pulso**:

- Las áreas grises (`▒`) pulsan suavemente
- Indica que el contenido se está cargando
- Mantiene la estructura visual esperada

---

## 🏷️ Badges de Estado (Pedidos)

### Estados Principales

| Estado             | Badge                 | Color       | Descripción Usuario              |
| ------------------ | --------------------- | ----------- | -------------------------------- |
| `pending`          | Pendiente             | 🟡 Amarillo | Esperando pago del cliente       |
| `paid`             | Pagado                | 🟢 Verde    | Pago recibido, listo para enviar |
| `shipped`          | Enviado               | 🔵 Azul     | En camino al cliente             |
| `delivered`        | Entregado             | 🟢 Verde    | Recibido por el cliente          |
| `cancelled`        | Cancelado             | 🔴 Rojo     | Pedido cancelado                 |
| `return_requested` | Devolución Solicitada | 🟡 Amarillo | Cliente pidió devolución         |
| `return_completed` | Reembolsado           | 🟣 Morado   | Dinero devuelto al cliente       |

**Ejemplo Visual**:

```
┌──────────────────────────────────────┐
│ Pedido #A000123                      │
│                                      │
│ Juan Pérez                           │
│ €85.00                    🟢 Pagado │
│ 14 Ene 2026, 10:30                  │
└──────────────────────────────────────┘
```

---

## 🎓 Tour Guiado (Onboarding)

### Primera Visita al Dashboard

**Paso 1: Bienvenida**

```
┌────────────────────────────────────────┐
│ 👋 ¡Bienvenido a tu Panel de Control! │
│                                        │
│ Aquí encontrarás todo lo que necesitas│
│ para gestionar tu tienda.              │
│                                        │
│ Te mostraremos las funciones más      │
│ importantes en un tour rápido.        │
│                                        │
│           [Comenzar Tour]  [Saltar]   │
└────────────────────────────────────────┘
```

**Paso 2: KPIs**

```
        ↓ Este es el indicador de ventas
┌────────────────────────────────┐
│ 💰 Ventas del Mes              │← Muestra tus ingresos
│                                │  del mes actual
│        €12,450.00              │
│         ▲ 12.5%                │← El cambio respecto
│                                │  al mes anterior
│ 156 pedidos este mes           │
└────────────────────────────────┘

[Siguiente →]
```

**Paso 3: Gráfico**

```
        ↓ Pasa el mouse sobre las barras
┌─────────────────────────────────────┐
│ 📊 Ventas de los Últimos 7 Días    │
│                                     │
│    [Gráfico Interactivo]            │← para ver detalles
│                                     │  de cada día
│                                     │
└─────────────────────────────────────┘

[Siguiente →]
```

---

## 💡 Ayuda Contextual

### Tooltips Informativos

**Icono de Ayuda (ⓘ)** en cada sección:

```
Ventas del Mes ⓘ
```

Al hacer clic:

```
┌──────────────────────────────────────────┐
│ 💡 Ayuda: Ventas del Mes                │
│                                          │
│ Este indicador muestra:                 │
│                                          │
│ • Total de dinero recibido este mes     │
│ • Número de pedidos completados         │
│ • Comparación con el mes anterior       │
│                                          │
│ 📝 Nota: Se descuentan automáticamente  │
│ los reembolsos de devoluciones.         │
│                                          │
│                    [Entendido]           │
└──────────────────────────────────────────┘
```

---

## 📱 Experiencia Móvil Optimizada

### Gestos Táctiles

| Gesto            | Acción                  |
| ---------------- | ----------------------- |
| 👆 Tap           | Seleccionar/Abrir       |
| 👈 Swipe izq/der | Navegar entre secciones |
| 👇 Pull down     | Refrescar datos         |
| 🔍 Pinch         | Zoom en gráficos        |

### Botones Táctiles

- **Mínimo 44x44px** (Apple HIG)
- Espaciado de 8px entre botones
- Feedback visual al tocar (cambio de color)

**Antes (❌ Difícil de tocar)**:

```
[Guardar] [Cancelar]  ← Botones pequeños pegados
```

**Después (✅ Fácil de tocar)**:

```
┌────────────────┐
│    Guardar     │  ← Botón grande
└────────────────┘

┌────────────────┐
│    Cancelar    │  ← Separado
└────────────────┘
```

---

## 🎯 Acciones Rápidas

### Tarjetas Accionables

**Hover State (Desktop)**:

```
┌────────────────────────────────┐
│ 📦 Stock Bajo                  │
│                                │
│ Camiseta Retro - Talla M       │
│ 🔴 Solo quedan 2 unidades      │
│                                │
│         [Reabastecer →]        │← Aparece al hover
└────────────────────────────────┘
```

**Mobile (Siempre visible)**:

```
┌────────────────────────────────┐
│ 📦 Stock Bajo                  │
│                                │
│ Camiseta Retro - Talla M       │
│ 🔴 2 unidades                  │
│                                │
│      [Reabastecer →]           │← Siempre visible
└────────────────────────────────┘
```

---

## 🔄 Flujo de Exportación de Datos

### Proceso Simplificado

**Paso 1: Seleccionar formato**

```
┌──────────────────────────────┐
│ Exportar Ventas              │
│                              │
│ Selecciona el formato:       │
│                              │
│ ○ Excel (.xlsx)             │
│   Mejor para análisis       │
│                              │
│ ○ CSV (.csv)                │
│   Compatible con todo       │
│                              │
│ ○ PDF (.pdf)                │
│   Para imprimir             │
│                              │
│     [Descargar]  [Cancelar] │
└──────────────────────────────┘
```

**Paso 2: Feedback de descarga**

```
┌──────────────────────────────┐
│ ✅ ¡Listo!                   │
│                              │
│ Tu archivo se está           │
│ descargando...               │
│                              │
│ ventas_enero_2026.xlsx       │
│                              │
│ Si no se descarga            │
│ automáticamente:             │
│                              │
│      [Descargar de nuevo]    │
└──────────────────────────────┘
```

---

## 🎨 Temas Dark/Light

### Toggle Visual

**Light Mode**:

```
┌────────┐
│ ☀️ 🌙  │  ← Clic para cambiar a oscuro
└────────┘
```

**Dark Mode**:

```
┌────────┐
│ ☀️ 🌙  │  ← Clic para cambiar a claro
└────────┘
```

### Contraste Adecuado

| Modo  | Fondo     | Texto     | Ratio     |
| ----- | --------- | --------- | --------- |
| Light | `#ffffff` | `#09090b` | 16.5:1 ✅ |
| Dark  | `#09090b` | `#fafafa` | 16.5:1 ✅ |

Cumple WCAG AAA (>7:1)

---

## 🔍 Búsqueda y Filtros

### Barra de Búsqueda Inteligente

**Placeholder Descriptivo**:

```
┌─────────────────────────────────────────┐
│ 🔍 Buscar pedidos por cliente, email... │
└─────────────────────────────────────────┘
```

**Con Sugerencias**:

```
┌─────────────────────────────────────────┐
│ 🔍 juan                                 │
└─────────────────────────────────────────┘
  ┌─────────────────────────────────────┐
  │ Resultados:                         │
  │                                     │
  │ 👤 Juan Pérez (3 pedidos)          │
  │ 👤 Juana García (1 pedido)         │
  │ 📧 juan@example.com                │
  └─────────────────────────────────────┘
```

### Filtros Visuales

**Chips de Filtro**:

```
Filtros Activos:

[🗓️ Últimos 7 días ×]  [💰 > €50 ×]  [🟢 Pagados ×]

         [Limpiar Todos]
```

---

## ✅ Checklist de UX para Desarrolladores

Al implementar cada componente, verificar:

- [ ] ¿El texto es comprensible sin conocimientos técnicos?
- [ ] ¿Los iconos son universales y reconocibles?
- [ ] ¿Hay tooltips de ayuda en conceptos complejos?
- [ ] ¿Los errores se muestran en lenguaje claro?
- [ ] ¿Las acciones tienen feedback visual inmediato?
- [ ] ¿Los botones son lo suficientemente grandes (44px mínimo móvil)?
- [ ] ¿El contraste de color cumple WCAG AA (4.5:1)?
- [ ] ¿Funciona bien en móvil sin zoom?
- [ ] ¿Los loading states mantienen la estructura visual?
- [ ] ¿Cada acción tiene confirmación visual?

---

## 📚 Glosario para Usuarios No Técnicos

| Término Técnico  | Versión Usuario         |
| ---------------- | ----------------------- |
| Query            | Búsqueda                |
| API Error        | Error de conexión       |
| Database timeout | Cargando muy lento      |
| RLS violation    | Sin permisos            |
| Refresh token    | Renovar sesión          |
| Cache            | Datos guardados         |
| Deploy           | Actualización           |
| Rollback         | Deshacer cambios        |
| Throttle         | Límite de velocidad     |
| Webhook          | Notificación automática |

---

**Guía creada para**: Desarrolladores Frontend  
**Objetivo**: Implementar UX accesible y comprensible  
**Última actualización**: 2026-01-16
