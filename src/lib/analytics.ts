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
  const [month, day, year] = datePart.split('/');
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

  const trend = lastMonth Revenue > 0 
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

  const { data, error } = await client
    .from('order_items')
    .select(`
      product_id,
      quantity,
      product:products!inner (
        id,
        name,
        price,
        offer_price
      ),
      order:orders!inner (
        created_at,
        status
      )
    `)
    .gte('order.created_at', monthStart.toISOString())
    .in('order.status', ['paid', 'shipped', 'delivered']);

  if (error) throw error;

  // Agrupar por producto y sumar cantidades
  const productSales = data.reduce((acc, item: any) => {
    const productId = item.product_id;
    if (!productId || !item.product) return acc;

    if (!acc[productId]) {
      acc[productId] = {
        product: item.product,
        totalQuantity: 0,
        totalRevenue: 0
      };
    }

    acc[productId].totalQuantity += item.quantity;
    const price = item.product.offer_price || item.product.price;
    acc[productId].totalRevenue += item.quantity * Number(price);

    return acc;
  }, {} as Record<string, BestSellingProduct>);

  const products = Object.values(productSales);
  const bestSelling = products.sort((a, b) => b.totalQuantity - a.totalQuantity)[0];

  return bestSelling || null;
}

/**
 * Obtener ventas de los últimos 7 días para gráfico
 */
export async function getSalesLast7Days(client: SupabaseClient): Promise<DailySales[]> {
  const now = new Date();
  const days: DailySales[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dayStart = getSpainMidnightUTC(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(dayEnd.getUTCHours() + 24);

    const { data } = await client
      .from('orders')
      .select('total_amount, refunded_amount')
      .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString());

    const dailyRevenue = data?.reduce((sum, order) => {
      const orderTotal = Number(order.total_amount) || 0;
      const refunded = Number(order.refunded_amount) || 0;
      return sum + (orderTotal - refunded);
    }, 0) || 0;

    days.push({
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE d', { locale: es }),
      revenue: dailyRevenue,
      orderCount: data?.length || 0
    });
  }

  return days;
}
