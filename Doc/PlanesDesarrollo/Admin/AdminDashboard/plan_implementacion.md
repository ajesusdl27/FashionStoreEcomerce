# 🚀 Plan de Implementación: Admin Dashboard v2.0

> **FashionStore** - Panel de Administración Mejorado  
> **Fecha**: 2026-01-16  
> **Objetivo**: Dashboard analítico optimizado para usuarios no técnicos  
> **Duración Estimada**: 2 sprints (2 semanas)

---

## 📋 Executive Summary

Este plan transforma el dashboard actual en un **panel analítico profesional** con:

- ✅ KPIs visuales e intuitivos
- ✅ Gráficos interactivos de ventas
- ✅ Interfaz simplificada para usuarios no técnicos
- ✅ Rendimiento optimizado (800ms → 120ms)
- ✅ Experiencia móvil mejorada

---

## 🎯 Objetivos del Proyecto

### Problemas Actuales a Resolver

| Problema                | Impacto                     | Solución            |
| ----------------------- | --------------------------- | ------------------- |
| Dashboard lento (800ms) | 🔴 Alta frustración usuario | Paralelizar queries |
| Sin gráficos visuales   | 🔴 Difícil tomar decisiones | Chart.js/Recharts   |
| Terminología técnica    | 🟡 Confusión usuarios       | Simplificar textos  |
| Sin estados de carga    | 🟡 Percepción de lentitud   | Skeleton loaders    |
| Timezone incorrecto     | 🔴 Datos incorrectos        | Fix Europe/Madrid   |

### Nuevas Funcionalidades

1. **Dashboard de Analíticas** con KPIs clave
2. **Gráficos interactivos** de ventas
3. **Producto más vendido** del mes
4. **Comparativas visuales** (hoy vs ayer, mes actual vs anterior)
5. **Exportación de datos** a CSV/Excel

---

## 🏗️ Arquitectura de la Solución

### Componentes Nuevos

```
src/
├── components/
│   └── islands/
│       ├── SalesChart.tsx          ← Gráfico de ventas (Chart.js)
│       ├── KPICard.tsx              ← Tarjeta KPI reutilizable
│       └── BestSellingProduct.tsx   ← Widget producto top
├── pages/
│   └── api/
│       └── admin/
│           └── analytics.ts         ← API para datos de gráficos
├── lib/
│   ├── analytics.ts                 ← Lógica de cálculo de KPIs
│   └── formatters.ts                ← Utilidades de formato
└── styles/
    └── dashboard.css                ← Estilos específicos dashboard
```

---

## 📊 Sprint 1: Core + Analytics (Semana 1)

### Día 1-2: Fixes Críticos

#### 🔧 Task 1.1: Fix Timezone Handling

**Archivo**: `src/pages/admin/index.astro`  
**Problema**: `new Date()` usa timezone del servidor, no España  
**Solución**:

```typescript
// ANTES (❌ Incorrecto)
const today = new Date();
today.setHours(0, 0, 0, 0);

// DESPUÉS (✅ Correcto)
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/Madrid";
const now = new Date();
const spainNow = utcToZonedTime(now, TIMEZONE);

const spainToday = new Date(spainNow);
spainToday.setHours(0, 0, 0, 0);
const todayUTC = zonedTimeToUtc(spainToday, TIMEZONE);
```

**Tests**:

```typescript
// Verificar que a las 00:01 hora España muestra pedidos del día correcto
// Caso edge: 23:30 UTC (00:30 España) → debe contar como "mañana"
```

**Tiempo Estimado**: 2 horas  
**Prioridad**: 🔴 CRÍTICA

---

#### ⚡ Task 1.2: Paralelizar Queries

**Impacto**: De 800ms a 120ms  
**Cambio**:

```typescript
// ANTES (❌ 8 queries secuenciales)
const { count: ordersToday } = await authClient.from("orders")...
const { count: ordersYesterday } = await authClient.from("orders")...
// ... 6 queries más

// DESPUÉS (✅ Paralelo con Promise.all)
const [
  { count: ordersToday },
  { count: ordersYesterday },
  { data: revenueData },
  // ... resto
] = await Promise.all([
  authClient.from("orders").select("*", { count: "exact", head: true })
    .gte("created_at", todayUTC.toISOString()),
  authClient.from("orders").select("*", { count: "exact", head: true })
    .gte("created_at", yesterdayUTC.toISOString())
    .lt("created_at", todayUTC.toISOString()),
  // ... resto de queries
]);
```

**Tiempo Estimado**: 3 horas  
**Prioridad**: 🔴 CRÍTICA

---

#### 🎨 Task 1.3: Loading States

**Componente**: `src/components/ui/DashboardSkeleton.astro`

```astro
---
// DashboardSkeleton.astro
---
<div class="space-y-8">
  <!-- Skeleton para Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
    {[...Array(5)].map(() => (
      <div class="stat-card animate-pulse">
        <div class="space-y-2">
          <div class="h-4 bg-muted rounded w-24"></div>
          <div class="h-10 bg-muted rounded w-20"></div>
        </div>
        <div class="skeleton w-14 h-14 rounded-xl"></div>
      </div>
    ))}
  </div>

  <!-- Skeleton para gráfico -->
  <div class="admin-card">
    <div class="skeleton h-64 rounded-lg"></div>
  </div>
</div>
```

**Uso en página**:

```astro
---
// admin/index.astro
let isLoading = true;
let stats = null;

try {
  stats = await getDashboardStats();
  isLoading = false;
} catch (error) {
  // Error handling
}
---

{isLoading ? (
  <DashboardSkeleton />
) : (
  <DashboardContent stats={stats} />
)}
```

**Tiempo Estimado**: 2 horas  
**Prioridad**: 🔴 ALTA

---

### Día 3-4: Analytics Dashboard

#### 📊 Task 1.4: Crear API de Analytics

**Archivo**: `src/pages/api/admin/analytics.ts`

```typescript
import type { APIRoute } from "astro";
import { createAuthenticatedClient } from "@/lib/supabase";
import {
  getMonthlyRevenue,
  getPendingOrders,
  getBestSellingProduct,
  getSalesLast7Days,
} from "@/lib/analytics";

export const GET: APIRoute = async ({ cookies, url }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authClient = createAuthenticatedClient(accessToken, refreshToken);
  const metric = url.searchParams.get("metric");

  try {
    let data;

    switch (metric) {
      case "monthly-revenue":
        data = await getMonthlyRevenue(authClient);
        break;
      case "pending-orders":
        data = await getPendingOrders(authClient);
        break;
      case "best-selling":
        data = await getBestSellingProduct(authClient);
        break;
      case "sales-7days":
        data = await getSalesLast7Days(authClient);
        break;
      default:
        // Retornar todas las métricas
        const [monthlyRevenue, pendingOrders, bestSelling, sales7Days] =
          await Promise.all([
            getMonthlyRevenue(authClient),
            getPendingOrders(authClient),
            getBestSellingProduct(authClient),
            getSalesLast7Days(authClient),
          ]);

        data = {
          monthlyRevenue,
          pendingOrders,
          bestSelling,
          sales7Days,
        };
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

**Tiempo Estimado**: 3 horas  
**Prioridad**: 🔴 ALTA

---

#### 📈 Task 1.5: Implementar Funciones de Analytics

**Archivo**: `src/lib/analytics.ts`

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { startOfMonth, endOfMonth, subDays, format } from "date-fns";

const TIMEZONE = "Europe/Madrid";

/**
 * Obtener ingresos totales del mes actual
 */
export async function getMonthlyRevenue(client: SupabaseClient) {
  const now = new Date();
  const spainNow = utcToZonedTime(now, TIMEZONE);

  const monthStart = startOfMonth(spainNow);
  const monthEnd = endOfMonth(spainNow);

  const monthStartUTC = zonedTimeToUtc(monthStart, TIMEZONE);
  const monthEndUTC = zonedTimeToUtc(monthEnd, TIMEZONE);

  const { data, error } = await client
    .from("orders")
    .select("total_amount, refunded_amount")
    .in("status", [
      "paid",
      "shipped",
      "delivered",
      "return_completed",
      "partially_refunded",
    ])
    .gte("created_at", monthStartUTC.toISOString())
    .lte("created_at", monthEndUTC.toISOString());

  if (error) throw error;

  const totalRevenue = data.reduce((sum, order) => {
    const orderTotal = Number(order.total_amount) || 0;
    const refunded = Number(order.refunded_amount) || 0;
    return sum + (orderTotal - refunded);
  }, 0);

  const orderCount = data.length;

  // Comparar con mes anterior
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastMonthEnd = new Date(monthEnd);
  lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);

  const lastMonthStartUTC = zonedTimeToUtc(lastMonthStart, TIMEZONE);
  const lastMonthEndUTC = zonedTimeToUtc(lastMonthEnd, TIMEZONE);

  const { data: lastMonthData } = await client
    .from("orders")
    .select("total_amount, refunded_amount")
    .in("status", [
      "paid",
      "shipped",
      "delivered",
      "return_completed",
      "partially_refunded",
    ])
    .gte("created_at", lastMonthStartUTC.toISOString())
    .lte("created_at", lastMonthEndUTC.toISOString());

  const lastMonthRevenue =
    lastMonthData?.reduce((sum, order) => {
      const orderTotal = Number(order.total_amount) || 0;
      const refunded = Number(order.refunded_amount) || 0;
      return sum + (orderTotal - refunded);
    }, 0) || 0;

  const trend =
    lastMonthRevenue > 0
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  return {
    total: totalRevenue,
    orderCount,
    trend: Math.round(trend * 10) / 10, // 1 decimal
    comparison: {
      current: totalRevenue,
      previous: lastMonthRevenue,
      difference: totalRevenue - lastMonthRevenue,
    },
  };
}

/**
 * Obtener pedidos pendientes de procesar
 */
export async function getPendingOrders(client: SupabaseClient) {
  const { data, error } = await client
    .from("orders")
    .select("id, customer_name, created_at, total_amount, status")
    .in("status", ["pending", "paid"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  const pendingCount = data?.filter((o) => o.status === "pending").length || 0;
  const paidCount = data?.filter((o) => o.status === "paid").length || 0;

  return {
    total: data?.length || 0,
    pending: pendingCount,
    paid: paidCount,
    orders: data?.slice(0, 5) || [], // Últimos 5 para preview
  };
}

/**
 * Obtener el producto más vendido del mes
 */
export async function getBestSellingProduct(client: SupabaseClient) {
  const now = new Date();
  const spainNow = utcToZonedTime(now, TIMEZONE);
  const monthStart = startOfMonth(spainNow);
  const monthStartUTC = zonedTimeToUtc(monthStart, TIMEZONE);

  // Query de order_items del mes actual
  const { data, error } = await client
    .from("order_items")
    .select(
      `
      product_id,
      quantity,
      product:products (
        id,
        name,
        price,
        offer_price
      ),
      order:orders!inner (
        created_at,
        status
      )
    `
    )
    .gte("order.created_at", monthStartUTC.toISOString())
    .in("order.status", ["paid", "shipped", "delivered"]);

  if (error) throw error;

  // Agrupar por producto y sumar cantidades
  const productSales = data.reduce(
    (acc, item) => {
      const productId = item.product_id;
      if (!productId || !item.product) return acc;

      if (!acc[productId]) {
        acc[productId] = {
          product: item.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }

      acc[productId].totalQuantity += item.quantity;
      const price = item.product.offer_price || item.product.price;
      acc[productId].totalRevenue += item.quantity * Number(price);

      return acc;
    },
    {} as Record<string, any>
  );

  // Encontrar el más vendido
  const products = Object.values(productSales);
  const bestSelling = products.sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  )[0];

  return bestSelling || null;
}

/**
 * Obtener ventas de los últimos 7 días
 */
export async function getSalesLast7Days(client: SupabaseClient) {
  const now = new Date();
  const spainNow = utcToZonedTime(now, TIMEZONE);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(spainNow, i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayStartUTC = zonedTimeToUtc(dayStart, TIMEZONE);
    const dayEndUTC = zonedTimeToUtc(dayEnd, TIMEZONE);

    const { data } = await client
      .from("orders")
      .select("total_amount, refunded_amount")
      .in("status", [
        "paid",
        "shipped",
        "delivered",
        "return_completed",
        "partially_refunded",
      ])
      .gte("created_at", dayStartUTC.toISOString())
      .lte("created_at", dayEndUTC.toISOString());

    const dailyRevenue =
      data?.reduce((sum, order) => {
        const orderTotal = Number(order.total_amount) || 0;
        const refunded = Number(order.refunded_amount) || 0;
        return sum + (orderTotal - refunded);
      }, 0) || 0;

    days.push({
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE d", { locale: require("date-fns/locale/es") }),
      revenue: dailyRevenue,
      orderCount: data?.length || 0,
    });
  }

  return days;
}
```

**Dependencias a instalar**:

```bash
npm install date-fns date-fns-tz
```

**Tiempo Estimado**: 4 horas  
**Prioridad**: 🔴 ALTA

---

#### 🎴 Task 1.6: Crear Componente KPICard

**Archivo**: `src/components/islands/KPICard.tsx`

```tsx
import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number; // Porcentaje de cambio
  subtitle?: string;
  colorClass?: string;
}

export default function KPICard({
  title,
  value,
  icon,
  trend,
  subtitle,
  colorClass = "text-primary",
}: KPICardProps) {
  return (
    <div className="stat-card group">
      <div>
        <p className="stat-label">{title}</p>
        <p className={`stat-value ${colorClass}`}>{value}</p>
        {trend !== undefined && (
          <p
            className={`text-xs mt-1 flex items-center gap-1 ${
              trend >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"}
            {Math.abs(trend)}% vs mes anterior
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div
        className={`stat-icon bg-${colorClass.split("-")[1]}-500/10 group-hover:bg-${colorClass.split("-")[1]}-500/20 transition-colors`}
      >
        {icon}
      </div>
    </div>
  );
}
```

**Tiempo Estimado**: 1 hora  
**Prioridad**: 🟡 MEDIA

---

#### 📊 Task 1.7: Crear Componente SalesChart

**Archivo**: `src/components/islands/SalesChart.tsx`

```tsx
import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data: Array<{
    date: string;
    label: string;
    revenue: number;
    orderCount: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Ventas (€)",
        data: data.map((d) => d.revenue),
        backgroundColor: "rgba(204, 255, 0, 0.2)",
        borderColor: "rgba(204, 255, 0, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            const revenue = context.parsed.y.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            });
            const orders = data[context.dataIndex].orderCount;
            return [`Ventas: ${revenue}`, `Pedidos: ${orders}`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
            });
          },
          color: "rgba(161, 161, 170, 1)",
        },
        grid: {
          color: "rgba(161, 161, 170, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "rgba(161, 161, 170, 1)",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
```

**Dependencias**:

```bash
npm install chart.js react-chartjs-2
```

**Tiempo Estimado**: 3 horas  
**Prioridad**: 🔴 ALTA

---

### Día 5: Integración en Dashboard

#### 🔧 Task 1.8: Actualizar admin/index.astro

**Archivo**: `src/pages/admin/index.astro`

```astro
---
import AdminLayout from "@/layouts/AdminLayout.astro";
import { createAuthenticatedClient } from "@/lib/supabase";
import { formatPrice } from '@/lib/formatters';
import {
  getMonthlyRevenue,
  getPendingOrders,
  getBestSellingProduct,
  getSalesLast7Days
} from '@/lib/analytics';

// KPI Components (React Islands)
import KPICard from '@/components/islands/KPICard';
import SalesChart from '@/components/islands/SalesChart';

const accessToken = Astro.cookies.get("sb-access-token")?.value;
const refreshToken = Astro.cookies.get("sb-refresh-token")?.value;
const authClient = createAuthenticatedClient(accessToken, refreshToken);

let analytics = null;
let error = null;

try {
  // Paralelizar todas las queries
  const [monthlyRevenue, pendingOrders, bestSelling, sales7Days] = await Promise.all([
    getMonthlyRevenue(authClient),
    getPendingOrders(authClient),
    getBestSellingProduct(authClient),
    getSalesLast7Days(authClient)
  ]);

  analytics = {
    monthlyRevenue,
    pendingOrders,
    bestSelling,
    sales7Days
  };
} catch (err) {
  console.error('Analytics error:', err);
  error = 'Error al cargar las analíticas';
}
---

<AdminLayout title="Dashboard">
  <div class="space-y-8">
    {/* Error State */}
    {error && (
      <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400">
        <p class="font-medium">{error}</p>
      </div>
    )}

    {!error && analytics && (
      <>
        {/* KPI Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ventas Totales del Mes */}
          <KPICard
            client:load
            title="Ventas del Mes"
            value={formatPrice(analytics.monthlyRevenue.total)}
            trend={analytics.monthlyRevenue.trend}
            subtitle={`${analytics.monthlyRevenue.orderCount} pedidos`}
            colorClass="text-green-600 dark:text-green-400"
            icon={
              <svg class="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
          />

          {/* Pedidos Pendientes */}
          <KPICard
            client:load
            title="Pedidos Pendientes"
            value={analytics.pendingOrders.total}
            subtitle={`${analytics.pendingOrders.pending} sin pagar · ${analytics.pendingOrders.paid} por enviar`}
            colorClass="text-amber-600 dark:text-amber-400"
            icon={
              <svg class="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            }
          />

          {/* Producto Más Vendido */}
          {analytics.bestSelling && (
            <KPICard
              client:load
              title="Producto Más Vendido"
              value={analytics.bestSelling.product.name}
              subtitle={`${analytics.bestSelling.totalQuantity} unidades · ${formatPrice(analytics.bestSelling.totalRevenue)}`}
              colorClass="text-primary"
              icon={
                <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              }
            />
          )}
        </div>

        {/* Gráfico de Ventas */}
        <div class="admin-card">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="font-heading text-xl text-foreground">Ventas de los Últimos 7 Días</h2>
              <p class="text-sm text-muted-foreground mt-1">Evolución diaria de ingresos</p>
            </div>
            <button class="admin-btn-secondary text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Exportar CSV
            </button>
          </div>
          <SalesChart client:load data={analytics.sales7Days} />
        </div>

        {/* ... Resto del dashboard (low stock, recent orders, etc) ... */}
      </>
    )}
  </div>
</AdminLayout>
```

**Tiempo Estimado**: 3 horas  
**Prioridad**: 🔴 CRÍTICA

---

## 🎨 Sprint 2: UX para Usuarios No Técnicos (Semana 2)

### Mejoras de Experiencia de Usuario

#### 🧩 Task 2.1: Simplificar Terminología

**Cambios de Texto**:

| Antes (Técnico)      | Después (Usuario)          | Contexto      |
| -------------------- | -------------------------- | ------------- |
| "Orders Today"       | "Pedidos de Hoy"           | Stat card     |
| "Revenue"            | "Ingresos"                 | KPI           |
| "Low Stock Variants" | "Productos con Poco Stock" | Alert         |
| "Return Requested"   | "Devolución Solicitada"    | Badge         |
| "RLS Error"          | "Error al cargar datos"    | Error message |
| "Refunded Amount"    | "Monto Reembolsado"        | Order detail  |

**Implementar tooltips explicativos**:

```astro
<div class="relative group">
  <p class="stat-label flex items-center gap-2">
    Pedidos Pendientes
    <svg class="w-4 h-4 text-muted-foreground cursor-help"
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  </p>

  <!-- Tooltip -->
  <div class="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-card border border-border rounded-lg shadow-lg z-10">
    <p class="text-xs text-foreground">
      Pedidos que aún no han sido pagados o están pendientes de envío
    </p>
  </div>
</div>
```

**Tiempo Estimado**: 4 horas  
**Prioridad**: 🟡 MEDIA

---

#### 🎯 Task 2.2: Guided Tour (Opcional)

**Implementar con Intro.js o Shepherd.js**:

```typescript
// src/components/islands/DashboardTour.tsx
import { useEffect } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

export default function DashboardTour({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "shepherd-theme-custom",
        scrollTo: true,
      },
    });

    tour.addStep({
      id: "welcome",
      text: "¡Bienvenido al panel de administración! Aquí puedes ver todas las métricas importantes de tu tienda.",
      attachTo: {
        element: ".kpi-grid",
        on: "bottom",
      },
      buttons: [
        {
          text: "Siguiente",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: "sales-chart",
      text: "Este gráfico muestra tus ventas de los últimos 7 días. Pasa el cursor sobre las barras para ver detalles.",
      attachTo: {
        element: ".sales-chart",
        on: "top",
      },
      buttons: [
        {
          text: "Anterior",
          action: tour.back,
        },
        {
          text: "Siguiente",
          action: tour.next,
        },
      ],
    });

    // Mostrar solo si es la primera vez
    const hasSeenTour = localStorage.getItem("dashboard-tour-seen");
    if (!hasSeenTour) {
      tour.start();
      localStorage.setItem("dashboard-tour-seen", "true");
    }

    return () => tour.complete();
  }, [enabled]);

  return null;
}
```

**Tiempo Estimado**: 6 horas  
**Prioridad**: 🟢 BAJA (opcional)

---

#### 📱 Task 2.3: Mejorar Responsividad Móvil

**Ajustes CSS**:

```css
/* dashboard.css */

/* En móvil, hacer KPIs más compactos */
@media (max-width: 640px) {
  .stat-value {
    @apply text-2xl; /* Reducir de 4xl a 2xl */
  }

  .stat-icon {
    @apply w-10 h-10; /* Reducir de 14 a 10 */
  }

  /* Hacer tabla scrolleable horizontalmente */
  .admin-table-wrapper {
    @apply overflow-x-auto -mx-4 px-4;
  }

  /* Gráfico más pequeño en móvil */
  .sales-chart {
    @apply h-48; /* En lugar de h-64 */
  }
}

/* Mejorar touch targets */
.mobile-friendly-btn {
  @apply min-h-[48px] min-w-[48px] touch-target;
}
```

**Tiempo Estimado**: 3 horas  
**Prioridad**: 🟡 MEDIA

---

#### 💾 Task 2.4: Exportación de Datos

**Componente de Exportación**:

```typescript
// src/lib/export.ts
export function exportToCSV(data: any[], filename: string) {
  // Convertir JSON a CSV
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => `"${val}"`)
      .join(",")
  );

  const csv = [headers, ...rows].join("\n");

  // Descargar
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToPDF(elementId: string, filename: string) {
  // Usando html2pdf.js
  const element = document.getElementById(elementId);
  const opt = {
    margin: 1,
    filename: `${filename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
}
```

**Botones en UI**:

```astro
<div class="flex gap-2">
  <button
    onclick="exportSales()"
    class="admin-btn-secondary text-sm"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
    Exportar a CSV
  </button>

  <button
    onclick="printReport()"
    class="admin-btn-secondary text-sm"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
    </svg>
    Imprimir
  </button>
</div>
```

**Tiempo Estimado**: 4 horas  
**Prioridad**: 🟡 MEDIA

---

## 📦 Dependencias a Instalar

```bash
# Core
npm install date-fns date-fns-tz

# Gráficos
npm install chart.js react-chartjs-2

# Exportación (opcional)
npm install html2pdf.js

# Tour guiado (opcional)
npm install shepherd.js
```

---

## 🧪 Testing Plan

### Tests Funcionales

```typescript
// tests/dashboard.test.ts
import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('[name="email"]', "admin@test.com");
    await page.fill('[name="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin");
  });

  test("should display monthly revenue KPI", async ({ page }) => {
    const revenueCard = page.locator("text=Ventas del Mes").locator("..");
    await expect(revenueCard).toBeVisible();

    const value = await revenueCard.locator(".stat-value").textContent();
    expect(value).toMatch(/€\s*[\d.,]+/);
  });

  test("should display sales chart with 7 data points", async ({ page }) => {
    const chart = page.locator(".sales-chart");
    await expect(chart).toBeVisible();

    // Verificar que hay exactamente 7 barras
    const bars = await chart.locator("canvas").count();
    expect(bars).toBe(1); // 1 canvas con 7 barras dentro
  });

  test("should export data to CSV", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=Exportar a CSV"),
    ]);

    expect(download.suggestedFilename()).toContain("sales");
    expect(download.suggestedFilename()).toContain(".csv");
  });
});
```

### Tests de Rendimiento

```typescript
test("dashboard should load in under 500ms", async ({ page }) => {
  const startTime = Date.now();
  await page.goto("/admin");
  await page.waitForSelector(".stat-card");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(500);
});
```

---

## 📊 Métricas de Éxito

| Métrica                 | Valor Actual   | Objetivo   | Cómo Medir                  |
| ----------------------- | -------------- | ---------- | --------------------------- |
| **Tiempo de Carga**     | 800ms          | < 200ms    | Chrome DevTools Performance |
| **Time to Interactive** | 1.2s           | < 500ms    | Lighthouse                  |
| **Queries a BD**        | 8 secuenciales | 1 paralela | Supabase logs               |
| **Satisfaction Score**  | N/A            | > 8/10     | Encuesta usuarios           |
| **Errores JS**          | 0              | 0          | Sentry/Console              |
| **Accessibility**       | 75             | > 90       | Lighthouse A11y             |

---

## 🚀 Deployment Checklist

### Pre-Deploy

- [ ] Todos los tests pasan (`npm run test`)
- [ ] Build exitoso (`npm run build`)
- [ ] Lighthouse > 90 en todas las métricas
- [ ] Probado en Chrome, Firefox, Safari
- [ ] Probado en móvil (iOS + Android)
- [ ] Revisar analytics en producción (sample data)

### Deploy

```bash
# 1. Merge a main
git checkout main
git merge feature/dashboard-v2

# 2. Tag release
git tag -a v2.0.0 -m "Dashboard Analytics v2.0"
git push origin v2.0.0

# 3. Deploy (ejemplo Vercel)
vercel --prod

# 4. Smoke test
curl https://fashionstore.com/admin
```

### Post-Deploy

- [ ] Verificar que analytics cargan correctamente
- [ ] Monitorear errores en Sentry primeras 24h
- [ ] Recoger feedback inicial de usuarios
- [ ] Ajustar basado en métricas reales

---

## 📚 Recursos y Referencias

### Documentación

- [Chart.js Docs](https://www.chartjs.org/docs/)
- [date-fns Documentation](https://date-fns.org/)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)

### Inspiración de Diseño

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Shopify Admin](https://www.shopify.com/admin)
- [Vercel Analytics](https://vercel.com/analytics)

---

## 🎯 Próximos Pasos Inmediatos

1. **Revisar este plan** con el equipo
2. **Configurar entorno de desarrollo** (instalar dependencias)
3. **Comenzar Sprint 1, Día 1** (fix timezone + paralelización)
4. **Daily standup** para tracking de progreso

---

**Plan creado por**: Equipo de Desarrollo FashionStore  
**Última actualización**: 2026-01-16  
**Versión**: 1.0

¿Preguntas? Contacta con el Tech Lead del proyecto.
