import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { 
  getMonthlyRevenue, 
  getPendingOrders, 
  getBestSellingProduct, 
  getSalesLast7Days 
} from '@/lib/analytics';

/**
 * API endpoint for admin dashboard analytics
 * 
 * @route GET /api/admin/analytics
 * @query metric - Optional: 'monthly-revenue' | 'pending-orders' | 'best-selling' | 'sales-7days'
 * 
 * @returns JSON with analytics data
 */
export const GET: APIRoute = async ({ cookies, url }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  
  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const authClient = createAuthenticatedClient(accessToken, refreshToken);
  const metric = url.searchParams.get('metric');

  try {
    let data;
    
    switch (metric) {
      case 'monthly-revenue':
        data = await getMonthlyRevenue(authClient);
        break;
        
      case 'pending-orders':
        data = await getPendingOrders(authClient);
        break;
        
      case 'best-selling':
        data = await getBestSellingProduct(authClient);
        break;
        
      case 'sales-7days':
        data = await getSalesLast7Days(authClient);
        break;
        
      default:
        // Retornar todas las métricas en paralelo
        const [monthlyRevenue, pendingOrders, bestSelling, sales7Days] = await Promise.all([
          getMonthlyRevenue(authClient),
          getPendingOrders(authClient),
          getBestSellingProduct(authClient),
          getSalesLast7Days(authClient)
        ]);
        
        data = {
          monthlyRevenue,
          pendingOrders,
          bestSelling,
          sales7Days
        };
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al cargar las analíticas',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
