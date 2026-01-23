/**
 * API para obtener métricas de devoluciones
 * GET /api/admin/returns-metrics
 * 
 * Devuelve estadísticas agregadas del sistema de devoluciones:
 * - Totales por estado
 * - Total reembolsado
 * - Tiempo promedio de resolución
 * - Tasa de devolución
 * - Motivos más comunes
 * - Tendencia mensual
 */

import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';

export const prerender = false;

interface ReturnRecord {
  id: string;
  status: string;
  reason: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createAuthenticatedClient(accessToken, refreshToken);

    // Verificar admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'Acceso denegado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener todas las devoluciones
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('id, status, reason, refund_amount, created_at, updated_at, completed_at');

    if (returnsError) {
      throw new Error(`Error obteniendo devoluciones: ${returnsError.message}`);
    }

    const allReturns = (returns || []) as ReturnRecord[];

    // Contar por estado
    const byStatus = {
      requested: 0,
      approved: 0,
      shipped: 0,
      received: 0,
      completed: 0,
      rejected: 0,
    };

    allReturns.forEach((r: ReturnRecord) => {
      const status = r.status as keyof typeof byStatus;
      if (status in byStatus) {
        byStatus[status]++;
      }
    });

    // Total reembolsado (solo completadas)
    const totalRefunded = allReturns
      .filter((r: ReturnRecord) => r.status === 'completed' && r.refund_amount)
      .reduce((sum: number, r: ReturnRecord) => sum + (r.refund_amount || 0), 0);

    // Tiempo promedio de resolución (solo completadas)
    const completedReturns = allReturns.filter(
      (r: ReturnRecord) => r.status === 'completed' && r.completed_at && r.created_at
    );
    
    let avgResolutionDays = 0;
    if (completedReturns.length > 0) {
      const totalDays = completedReturns.reduce((sum: number, r: ReturnRecord) => {
        const created = new Date(r.created_at);
        const completed = new Date(r.completed_at!);
        const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgResolutionDays = totalDays / completedReturns.length;
    }

    // Tasa de devolución (necesitamos total de pedidos)
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      console.error('Error obteniendo conteo de pedidos:', ordersError);
    }

    const returnRate = totalOrders && totalOrders > 0 
      ? (allReturns.length / totalOrders) * 100 
      : 0;

    // Motivos más comunes
    const reasonCounts: Record<string, number> = {};
    allReturns.forEach((r: ReturnRecord) => {
      const reason = r.reason || 'No especificado';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tendencia mensual (últimos 6 meses)
    const now = new Date();
    const monthlyTrend: { month: string; count: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      
      const count = allReturns.filter((r: ReturnRecord) => {
        const createdMonth = r.created_at?.slice(0, 7);
        return createdMonth === monthStart;
      }).length;

      monthlyTrend.push({ month: monthName, count });
    }

    // Acciones pendientes (requested sin procesar)
    const pendingActions = byStatus.requested;

    const metrics = {
      totalReturns: allReturns.length,
      byStatus,
      totalRefunded,
      avgResolutionDays,
      returnRate,
      topReasons,
      monthlyTrend,
      pendingActions,
    };

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en returns-metrics API:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
