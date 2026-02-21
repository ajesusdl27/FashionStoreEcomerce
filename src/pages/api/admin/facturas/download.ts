import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { getFiscalDocumentById } from '@/lib/fiscal-documents';

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

    const fiscalDocument = await getFiscalDocumentById(invoiceId);
    if (!fiscalDocument) {
      return new Response(JSON.stringify({ error: 'Documento no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (fiscalDocument.pdf_url) {
      return Response.redirect(fiscalDocument.pdf_url, 302);
    }

    const fileName = fiscalDocument.pdf_storage_path || `fiscal/${fiscalDocument.document_type}/${fiscalDocument.document_number}.pdf`;
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(fileName);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({ error: 'PDF no disponible. Regenera el documento.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await fileData.arrayBuffer();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fiscalDocument.document_number}.pdf"`,
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
