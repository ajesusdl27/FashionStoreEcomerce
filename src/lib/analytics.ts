/**
 * Analytics functions for admin dashboard
 * Provides business intelligence and reporting capabilities
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

const TIMEZONE = 'Europe/Madrid';

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
 * Obtener ingresos totales del mes actual con comparación
 */
export async function getMonthlyRevenue(client: SupabaseClient): Promise<MonthlyRevenue> {
  const now = new Date();
  const spainNow = utcToZonedTime(now, TIMEZONE);
  
  const monthStart = startOfMonth(spainNow);
  const monthEnd = endOfMonth(spainNow);
  
  const monthStartUTC = zonedTimeToUtc(monthStart, TIMEZONE);
  const monthEndUTC = zonedTimeToUtc(monthEnd, TIMEZONE);

  const { data, error } = await client
    .from('orders')
    .select('total_amount, refunded_amount')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', monthStartUTC.toISOString())
    .lte('created_at', monthEndUTC.toISOString());

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
    .from('orders')
    .select('total_amount, refunded_amount')
    .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
    .gte('created_at', lastMonthStartUTC.toISOString())
    .lte('created_at', lastMonthEndUTC.toISOString());

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
  const spainNow = utcToZonedTime(now, TIMEZONE);
  const monthStart = startOfMonth(spainNow);
  const monthStartUTC = zonedTimeToUtc(monthStart, TIMEZONE);

  const { data, error } = await client
    .from('order_items')
    .select(`
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
    `)
    .gte('order.created_at', monthStartUTC.toISOString())
    .in('order.status', ['paid', 'shipped', 'delivered']);

  if (error) throw error;

  // Agrupar por producto y sumar cantidades
  const productSales = data.reduce((acc, item) => {
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
  const spainNow = utcToZonedTime(now, TIMEZONE);
  
  const days: DailySales[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(spainNow, i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayStartUTC = zonedTimeToUtc(dayStart, TIMEZONE);
    const dayEndUTC = zonedTimeToUtc(dayEnd, TIMEZONE);

    const { data } = await client
      .from('orders')
      .select('total_amount, refunded_amount')
      .in('status', ['paid', 'shipped', 'delivered', 'return_completed', 'partially_refunded'])
      .gte('created_at', dayStartUTC.toISOString())
      .lte('created_at', dayEndUTC.toISOString());

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
