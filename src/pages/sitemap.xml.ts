import type { APIRoute } from 'astro';

const STATIC_ROUTES = [
  '/',
  '/productos',
  '/contacto',
  '/envios',
  '/privacidad',
  '/terminos',
  '/categoria/zapatillas',
  '/categoria/camisetas',
  '/promociones/newsletter-bienvenida'
];

function getBaseUrl(requestUrl: string): string {
  const fromEnv = import.meta.env.PUBLIC_SITE_URL;
  const fallback = new URL(requestUrl).origin;
  const rawBase = fromEnv || fallback;
  const normalized = rawBase.replace(/\/$/, '');

  if (normalized.startsWith('http://') && !normalized.includes('localhost')) {
    return normalized.replace('http://', 'https://');
  }

  return normalized;
}

export const GET: APIRoute = async ({ request }) => {
  const baseUrl = getBaseUrl(request.url);
  const now = new Date().toISOString();

  const urls = STATIC_ROUTES.map(
    (route) => `\n  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.7'}</priority>\n  </url>`
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
