import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

// ============================================
// ESQUEMAS DE VALIDACIÓN
// ============================================

const StockUpdateSchema = z.object({
  variantId: z.string().uuid('ID de variante inválido'),
  stock: z.number().int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo'),
});

const BulkStockUpdateSchema = z.object({
  updates: z.array(StockUpdateSchema)
    .min(1, 'Debe incluir al menos una actualización')
    .max(200, 'No se pueden actualizar más de 200 variantes a la vez'),
});

// ============================================
// PUT - Actualización masiva de stock
// ============================================

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const body = await request.json();
    const validation = BulkStockUpdateSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return new Response(JSON.stringify({ 
        error: 'Datos de entrada inválidos', 
        details: errors 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { updates } = validation.data;
    const results: { variantId: string; success: boolean; error?: string }[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process updates sequentially to avoid race conditions
    for (const update of updates) {
      const { error } = await authClient
        .from('product_variants')
        .update({ stock: update.stock })
        .eq('id', update.variantId)
        .select('id, stock')
        .single();

      if (error) {
        results.push({ variantId: update.variantId, success: false, error: error.message });
        failCount++;
      } else {
        results.push({ variantId: update.variantId, success: true });
        successCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: failCount === 0,
      message: failCount === 0 
        ? `Stock actualizado correctamente (${successCount} variantes)`
        : `${successCount} actualizadas, ${failCount} fallidas`,
      successCount,
      failCount,
      results,
    }), { 
      status: failCount === 0 ? 200 : 207, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('Bulk stock update error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
