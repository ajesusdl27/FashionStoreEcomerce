import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/lib/supabase";
import { validateToken } from "@/lib/auth-utils";
import { sendLowStockAlert } from "@/lib/email";

export const prerender = false;

/**
 * POST /api/admin/check-low-stock
 * 
 * Manually triggers a low stock check and sends an alert email to the admin.
 * Can also be used as an external cron endpoint (with API key auth).
 * 
 * Auth: Requires admin session (cookie or Bearer token) OR x-cron-secret header
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check for cron secret (for external cron services like GitHub Actions, Vercel Cron, etc.)
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = import.meta.env.CRON_SECRET;
    
    let isAuthorized = false;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      isAuthorized = true;
    } else {
      // Fallback to admin auth (cookie or Bearer token)
      let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!accessToken) {
        accessToken = cookies.get("sb-access-token")?.value;
      }

      if (accessToken) {
        const user = await validateToken(accessToken);
        if (user) {
          // Verify admin role
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profile?.role === 'admin') {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Get threshold from settings
    const { data: thresholdSetting } = await supabaseAdmin
      .from('settings')
      .select('value_number')
      .eq('key', 'low_stock_threshold')
      .single();

    const threshold = thresholdSetting?.value_number ?? 5;

    // 2. Query variants with stock <= threshold (only active products)
    const { data: lowStockItems, error: queryError } = await supabaseAdmin
      .from('product_variants')
      .select(`
        stock,
        size,
        products!inner (
          name,
          slug,
          deleted_at
        )
      `)
      .lte('stock', threshold)
      .is('products.deleted_at', null)
      .order('stock', { ascending: true });

    if (queryError) {
      console.error('[CHECK-LOW-STOCK] Error querying inventory:', queryError);
      return new Response(
        JSON.stringify({ error: "Error al consultar inventario" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const items = (lowStockItems || []).map((item: any) => ({
      productName: item.products?.name || 'Producto desconocido',
      size: item.size || '-',
      stock: item.stock,
      productSlug: item.products?.slug || '',
    }));

    // 3. If no items with low stock, return success without sending email
    if (items.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No hay productos con stock bajo",
          items_count: 0,
          threshold,
          email_sent: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Send the alert email
    const result = await sendLowStockAlert({
      items,
      threshold,
      checkDate: new Date(),
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          items_count: items.length,
          threshold,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Alerta de stock bajo enviada (${items.length} variantes)`,
        items_count: items.length,
        out_of_stock: items.filter((i: any) => i.stock === 0).length,
        low_stock: items.filter((i: any) => i.stock > 0).length,
        threshold,
        email_sent: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[CHECK-LOW-STOCK] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
