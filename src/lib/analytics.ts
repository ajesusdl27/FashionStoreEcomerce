/**
 * Analytics functions for admin dashboard
 * Provides business intelligence and reporting capabilities
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyRevenue {
  total: number;
  orderCount: number;
  trend: number;
  comparison: {
    current: number;
    previous: number;
    difference: number;
  };
}

interface PendingOrders {
  total: number;
  pending: number;
  paid: number;
  orders: any[];
}

interface BestSellingProduct {
  product: {
    id: string;
    name: string;
    price: number;
    offer_price: number | null;
  };
  totalQuantity: number;
  totalRevenue: number;
}

interface DailySales {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

/**
 * Get Spain midnight in UTC (handles DST automatically)
 */
function getSpainMidnightUTC(date: Date = new Date()): Date {
  // Use Intl API to detect Spain's current offset
  const spainTimeStr = date.toLocaleString('en-US', { 
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const [datePart] = spainTimeStr.split(', ');
  const parts = datePart?.split('/') ?? [];
  const [month = '01', day = '01', year = '2024'] = parts;
  const spainDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
  
  // Detect if DST is active (GMT+2) or not (GMT+1)
  const isDST = date.toLocaleString('en-US', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'short'
  }).includes('GMT+2');
  
  const spainOffset = isDST ? 2 : 1;
  spainDate.setUTCHours(0 - spainOffset);
  
  return spainDate;
}

/**
 * Obtener ingresos totales del mes actual con comparación
 */
export async function getMonthlyRevenue(client: SupabaseClient): Promise<MonthlyRevenue> {
  const now = new Date();
  const spainNowMidnight = getSpainMidnightUTC(now);
  
  const monthStart = startOfMonth(spainNowMidnight);
  const monthEnd = endOfMonth(spainNowMidnight);
  monthEnd.setUTCHours(23, 59, 59, 999);
  
  const { data, error } = await client
    .from('orders')
    .select('total_amount, refunded_amount')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', monthStart.toISOString())
    .lte('created_at', monthEnd.toISOString());

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

  const { data: lastMonthData } = await client
    .from('orders')
    .select('total_amount, refunded_amount')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', lastMonthStart.toISOString())
    .lte('created_at', lastMonthEnd.toISOString());

  const lastMonthRevenue = lastMonthData?.reduce((sum, order) => {
    const orderTotal = Number(order.total_amount) || 0;
    const refunded = Number(order.refunded_amount) || 0;
    return sum + (orderTotal - refunded);
  }, 0) || 0;

  const trend = lastMonthRevenue > 0 
    ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  return {
    total: totalRevenue,
    orderCount,
    trend: Math.round(trend * 10) / 10,
    comparison: {
      current: totalRevenue,
      previous: lastMonthRevenue,
      difference: totalRevenue - lastMonthRevenue
    }
  };
}

/**
 * Obtener pedidos pendientes de procesar
 */
export async function getPendingOrders(client: SupabaseClient): Promise<PendingOrders> {
  const { data, error } = await client
    .from('orders')
    .select('id, customer_name, created_at, total_amount, status')
    .in('status', ['pending', 'paid'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  const pendingCount = data?.filter(o => o.status === 'pending').length || 0;
  const paidCount = data?.filter(o => o.status === 'paid').length || 0;

  return {
    total: data?.length || 0,
    pending: pendingCount,
    paid: paidCount,
    orders: data?.slice(0, 5) || []
  };
}

/**
 * Obtener el producto más vendido del mes
 */
export async function getBestSellingProduct(client: SupabaseClient): Promise<BestSellingProduct | null> {
  const now = new Date();
  const monthStart = getSpainMidnightUTC(startOfMonth(now));

  // First, get orders from this month
  const { data: orders, error: ordersError } = await client
    .from('orders')
    .select('id')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', monthStart.toISOString());

  if (ordersError) throw ordersError;
  if (!orders || orders.length === 0) return null;

  const orderIds = orders.map(o => o.id);

  // Then get order items for those orders
  const { data, error } = await client
    .from('order_items')
    .select(`
      product_id,
      quantity,
      order_id,
      product:products (
        id,
        name,
        price,
        offer_price
      )
    `)
    .in('order_id', orderIds);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  // Group by product and sum quantities
  const productSales = data.reduce((acc, item: any) => {
    const productId = item.product_id;
    if (!productId || !item.product) return acc;

    // Handle array vs object (Supabase returns array for relations)
    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    if (!product) return acc;

    if (!acc[productId]) {
      acc[productId] = {
        product: product,
        totalQuantity: 0,
        totalRevenue: 0
      };
    }

    acc[productId].totalQuantity += item.quantity;
    const price = product.offer_price || product.price;
    acc[productId].totalRevenue += item.quantity * Number(price);

    return acc;
  }, {} as Record<string, BestSellingProduct>);

  const products = Object.values(productSales);
  if (products.length === 0) return null;
  
  const bestSelling = products.sort((a, b) => b.totalQuantity - a.totalQuantity)[0];

  return bestSelling || null;
}

/**
 * Obtener ventas de los últimos 7 días para gráfico
 * FIXED: Single query instead of 7 sequential queries (N+1 fix)
 */
export async function getSalesLast7Days(client: SupabaseClient): Promise<DailySales[]> {
  const now = new Date();
  const rangeStart = getSpainMidnightUTC(subDays(now, 6));
  const rangeEnd = new Date(getSpainMidnightUTC(now));
  rangeEnd.setUTCHours(rangeEnd.getUTCHours() + 24);

  const { data } = await client
    .from('orders')
    .select('total_amount, refunded_amount, created_at')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', rangeStart.toISOString())
    .lt('created_at', rangeEnd.toISOString());

  // Build a map of day boundaries for grouping
  const dayBuckets: Map<string, { revenue: number; count: number }> = new Map();
  const dayMeta: { key: string; date: Date }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const key = format(date, 'yyyy-MM-dd');
    dayBuckets.set(key, { revenue: 0, count: 0 });
    dayMeta.push({ key, date });
  }

  // Assign each order to its day bucket using Spain timezone
  (data || []).forEach(order => {
    const orderDate = new Date(order.created_at);
    // Convert to Spain date string for bucketing
    const spainDateStr = orderDate.toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' }); // YYYY-MM-DD
    const bucket = dayBuckets.get(spainDateStr);
    if (bucket) {
      const orderTotal = Number(order.total_amount) || 0;
      const refunded = Number(order.refunded_amount) || 0;
      bucket.revenue += (orderTotal - refunded);
      bucket.count++;
    }
  });

  return dayMeta.map(({ key, date }) => {
    const bucket = dayBuckets.get(key)!;
    return {
      date: key,
      label: format(date, 'EEE d', { locale: es }),
      revenue: bucket.revenue,
      orderCount: bucket.count,
    };
  });
}

// ============================================
// EXTENDED ANALYTICS FOR DASHBOARD V2
// ============================================

export interface DashboardExtendedMetrics {
  /** Average order value for current month */
  aov: number;
  /** Returns overview */
  returns: {
    total: number;
    pending: number;
    totalRefunded: number;
    rate: number;
  };
  /** Active coupons info */
  coupons: {
    activeCount: number;
    usagesThisMonth: number;
    totalDiscount: number;
  };
  /** Shipments in transit */
  shipmentsInTransit: number;
  /** Active promotions count */
  activePromotions: number;
  /** Order status distribution */
  orderStatusDistribution: Record<string, number>;
  /** Revenue by category (top 5) */
  revenueByCategory: { name: string; revenue: number }[];
}

/**
 * Get extended dashboard metrics in a single parallelized call.
 * Surfaces data from tables not previously shown on the dashboard.
 */
export async function getDashboardExtendedMetrics(
  client: SupabaseClient,
  monthlyOrderCount: number,
  monthlyRevenue: number,
): Promise<DashboardExtendedMetrics> {
  const now = new Date();
  const monthStart = startOfMonth(getSpainMidnightUTC(now));

  const [
    { data: returnsData },
    { count: totalOrdersCount },
    { data: activeCoupons },
    { data: couponUsagesData },
    { count: shipmentsInTransit },
    { count: activePromotions },
    { data: allOrderStatuses },
    { data: orderItemsData },
  ] = await Promise.all([
    // Returns overview
    client
      .from('returns')
      .select('id, status, refund_amount'),

    // Total orders count (for return rate)
    client
      .from('orders')
      .select('*', { count: 'exact', head: true }),

    // Active coupons
    client
      .from('coupons')
      .select('id, code, current_uses, discount_value, discount_type')
      .eq('is_active', true),

    // Coupon usages this month
    client
      .from('coupon_usages')
      .select('id, coupon_id')
      .gte('used_at', monthStart.toISOString()),

    // Shipments in transit (shipped but not delivered)
    client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'shipped'),

    // Active promotions
    client
      .from('promotions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('start_date', now.toISOString())
      .gte('end_date', now.toISOString()),

    // All orders for status distribution (last 30 days)
    client
      .from('orders')
      .select('status')
      .gte('created_at', subDays(now, 30).toISOString()),

    // Order items this month with product+category for revenue breakdown
    client
      .from('order_items')
      .select(`
        quantity,
        price_at_purchase,
        product:products(
          category:categories(name)
        )
      `)
      .gte('created_at', monthStart.toISOString()),
  ]);

  // Returns aggregation
  const returns = (returnsData || []);
  const returnsPending = returns.filter((r: any) => ['requested', 'approved'].includes(r.status)).length;
  const totalRefunded = returns
    .filter((r: any) => r.status === 'completed' && r.refund_amount)
    .reduce((sum: number, r: any) => sum + (Number(r.refund_amount) || 0), 0);
  const returnRate = totalOrdersCount && totalOrdersCount > 0
    ? (returns.length / totalOrdersCount) * 100
    : 0;

  // Coupons
  const couponUsagesCount = couponUsagesData?.length || 0;
  const totalCouponDiscount = (activeCoupons || []).reduce((sum: number, c: any) => {
    return sum + (Number(c.current_uses) * Number(c.discount_value || 0));
  }, 0);

  // Order status distribution
  const statusDist: Record<string, number> = {};
  (allOrderStatuses || []).forEach((o: any) => {
    statusDist[o.status] = (statusDist[o.status] || 0) + 1;
  });

  // Revenue by category
  const catRevenue: Record<string, number> = {};
  (orderItemsData || []).forEach((item: any) => {
    const catName = item.product?.category?.name || 'Sin categoría';
    const revenue = Number(item.quantity) * Number(item.price_at_purchase || 0);
    catRevenue[catName] = (catRevenue[catName] || 0) + revenue;
  });
  const revenueByCategory = Object.entries(catRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // AOV
  const aov = monthlyOrderCount > 0 ? monthlyRevenue / monthlyOrderCount : 0;

  return {
    aov,
    returns: {
      total: returns.length,
      pending: returnsPending,
      totalRefunded,
      rate: Math.round(returnRate * 10) / 10,
    },
    coupons: {
      activeCount: activeCoupons?.length || 0,
      usagesThisMonth: couponUsagesCount,
      totalDiscount: totalCouponDiscount,
    },
    shipmentsInTransit: shipmentsInTransit || 0,
    activePromotions: activePromotions || 0,
    orderStatusDistribution: statusDist,
    revenueByCategory,
  };
}
