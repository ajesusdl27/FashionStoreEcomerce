import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

/**
 * GET /api/admin/facturas/download?id=invoiceId
 * Descarga PDF de una factura (redirect a URL publica o proxy desde Storage)
 */
export const GET: APIRoute = async ({ request, cookies, url }) => {
  try {
    // Auth admin
    let accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!accessToken) {
      accessToken = cookies.get('sb-access-token')?.value || undefined;
    }
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const invoiceId = url.searchParams.get('id');
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Falta id de factura' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch factura
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number, pdf_url')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return new Response(JSON.stringify({ error: 'Factura no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Si tiene pdf_url, redirigir
    if (invoice.pdf_url) {
      return Response.redirect(invoice.pdf_url, 302);
    }

    // Intentar descargar directamente de Storage
    const fileName = `invoices/${invoice.invoice_number}.pdf`;
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(fileName);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: 'PDF no disponible. Regenera la factura.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await fileData.arrayBuffer();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN FACTURAS DOWNLOAD] error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
