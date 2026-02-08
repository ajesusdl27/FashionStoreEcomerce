// Supabase Edge Function: Daily Low Stock Alert
// Cron schedule: Every day at 7:00 UTC (8:00 AM Madrid/Spain time)
//
// To deploy: supabase functions deploy daily-low-stock-alert
// To test manually: supabase functions invoke daily-low-stock-alert
//
// Required env vars (set in Supabase Dashboard > Edge Functions > Secrets):
//   - SUPABASE_URL (auto-set by Supabase)
//   - SUPABASE_SERVICE_ROLE_KEY (auto-set by Supabase)
//   - RESEND_API_KEY
//   - RESEND_FROM_EMAIL (optional, defaults to 'FashionStore <onboarding@resend.dev>')

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LowStockVariant {
  product_name: string
  size: string
  stock: number
  product_slug: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📊 [LOW-STOCK-CRON] Starting daily low stock check...')

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'FashionStore <onboarding@resend.dev>'

    if (!resendApiKey) {
      console.error('📊 [LOW-STOCK-CRON] ❌ RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get the low_stock_threshold from settings
    const { data: thresholdSetting, error: thresholdError } = await supabase
      .from('settings')
      .select('value_number')
      .eq('key', 'low_stock_threshold')
      .single()

    if (thresholdError) {
      console.error('📊 [LOW-STOCK-CRON] Error fetching threshold:', thresholdError)
      return new Response(
        JSON.stringify({ error: 'Could not fetch low_stock_threshold setting' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const threshold = thresholdSetting?.value_number ?? 5
    console.log(`📊 [LOW-STOCK-CRON] Threshold: ${threshold} units`)

    // 2. Get the admin email from settings (store_email)
    const { data: emailSetting, error: emailError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'store_email')
      .single()

    if (emailError || !emailSetting?.value) {
      console.error('📊 [LOW-STOCK-CRON] ❌ Admin email (store_email) not configured:', emailError)
      return new Response(
        JSON.stringify({ error: 'Admin email (store_email) not configured in settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminEmail = emailSetting.value
    console.log(`📊 [LOW-STOCK-CRON] Admin email: ${adminEmail}`)

    // 3. Get store name for email template
    const { data: storeNameSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'store_name')
      .single()

    const storeName = storeNameSetting?.value || 'FashionStore'

    // 4. Get site URL
    const { data: siteUrlSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'site_url')
      .single()

    const siteUrl = siteUrlSetting?.value || 'http://fashionstoreajesusdl.victoriafp.online'

    // 5. Query variants with stock <= threshold (only active products)
    const { data: lowStockItems, error: queryError } = await supabase
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
      .order('stock', { ascending: true })

    if (queryError) {
      console.error('📊 [LOW-STOCK-CRON] Error querying low stock items:', queryError)
      return new Response(
        JSON.stringify({ error: 'Error querying inventory' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format results
    const items: LowStockVariant[] = (lowStockItems || []).map((item: any) => ({
      product_name: item.products?.name || 'Producto desconocido',
      size: item.size || '-',
      stock: item.stock,
      product_slug: item.products?.slug || '',
    }))

    console.log(`📊 [LOW-STOCK-CRON] Found ${items.length} variants with low stock`)

    // 6. If no low stock items, skip email
    if (items.length === 0) {
      console.log('📊 [LOW-STOCK-CRON] ✅ No low stock items found. No email needed.')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No low stock items found',
          items_count: 0,
          threshold 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Build the email HTML
    const outOfStock = items.filter(i => i.stock === 0)
    const lowStock = items.filter(i => i.stock > 0)

    const dateStr = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    function stockBadge(stock: number): string {
      if (stock === 0) {
        return `<span style="background-color: #fee2e2; color: #dc2626; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: bold;">SIN STOCK</span>`
      }
      return `<span style="background-color: #fef3c7; color: #d97706; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: bold;">${stock} uds</span>`
    }

    function buildItemRows(variants: LowStockVariant[]): string {
      return variants.map(item => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
            <strong>${item.product_name}</strong>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.size}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right;">${stockBadge(item.stock)}</td>
        </tr>
      `).join('')
    }

    const summaryCards = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td width="48%" style="background-color: #fee2e2; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #dc2626;">${outOfStock.length}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #991b1b; text-transform: uppercase;">Sin Stock</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background-color: #fef3c7; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #d97706;">${lowStock.length}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #92400e; text-transform: uppercase;">Stock Bajo (≤${threshold})</p>
          </td>
        </tr>
      </table>`

    let tablesHtml = ''

    if (outOfStock.length > 0) {
      tablesHtml += `
        <h3 style="margin: 25px 0 12px; font-size: 15px; color: #dc2626;">🔴 Sin Stock (${outOfStock.length})</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fee2e2; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
          <tr style="background-color: #fef2f2;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #991b1b; text-transform: uppercase;">Producto</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #991b1b; text-transform: uppercase;">Talla</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #991b1b; text-transform: uppercase;">Stock</th>
          </tr>
          ${buildItemRows(outOfStock)}
        </table>`
    }

    if (lowStock.length > 0) {
      tablesHtml += `
        <h3 style="margin: 25px 0 12px; font-size: 15px; color: #d97706;">🟡 Stock Bajo (${lowStock.length})</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fef3c7; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
          <tr style="background-color: #fffbeb;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #92400e; text-transform: uppercase;">Producto</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #92400e; text-transform: uppercase;">Talla</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #92400e; text-transform: uppercase;">Stock</th>
          </tr>
          ${buildItemRows(lowStock)}
        </table>`
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #CCFF00; font-size: 22px; font-weight: bold; letter-spacing: 2px;">${storeName}</h1>
                    <p style="margin: 4px 0 0; color: #8892b0; font-size: 12px; letter-spacing: 1px;">PANEL DE ADMINISTRACIÓN</p>
                  </td>
                  <td style="text-align: right;">
                    <span style="background-color: rgba(204,255,0,0.15); color: #CCFF00; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">ADMIN</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Alert Banner -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                <span style="font-size: 36px;">📊</span>
                <h2 style="margin: 10px 0 5px; color: #ffffff; font-size: 20px;">Reporte Diario de Stock</h2>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 13px;">${dateStr}</p>
              </div>

              <!-- Summary -->
              ${summaryCards}

              <!-- Info -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;">
                  <strong>Umbral configurado:</strong> ${threshold} unidades · 
                  Total variantes afectadas: <strong>${items.length}</strong>
                </p>
              </div>

              <!-- Tables -->
              ${tablesHtml}

              <!-- CTA -->
              <div style="text-align: center; margin-top: 25px;">
                <a href="${siteUrl}/admin/inventario" 
                   style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #CCFF00; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                  Gestionar Inventario →
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px; color: #666; font-size: 13px;">
                Este es un email automático del sistema de notificaciones.
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} ${storeName} — <a href="${siteUrl}/admin" style="color: #16213e; text-decoration: none;">Ir al Panel Admin</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

    // 8. Send email via Resend
    const subjectParts: string[] = []
    if (outOfStock.length > 0) subjectParts.push(`${outOfStock.length} sin stock`)
    if (lowStock.length > 0) subjectParts.push(`${lowStock.length} stock bajo`)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [adminEmail],
        subject: `[Admin] 📊 Alerta de Inventario — ${subjectParts.join(', ')} (${items.length} variantes)`,
        html,
      }),
    })

    const resendData = await response.json()

    if (!response.ok) {
      console.error('📊 [LOW-STOCK-CRON] ❌ Resend API error:', resendData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 [LOW-STOCK-CRON] ✅ Low stock alert sent to ${adminEmail}. Resend ID: ${resendData.id}`)
    console.log(`📊 [LOW-STOCK-CRON] Summary: ${outOfStock.length} out of stock, ${lowStock.length} low stock`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Low stock alert sent to ${adminEmail}`,
        items_count: items.length,
        out_of_stock: outOfStock.length,
        low_stock: lowStock.length,
        threshold,
        resend_id: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('📊 [LOW-STOCK-CRON] ❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
