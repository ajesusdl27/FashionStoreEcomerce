import type { APIRoute } from 'astro';

const AI_BOTS_DISALLOW = [
  'Amazonbot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'ClaudeBot',
  'Google-Extended',
  'GPTBot',
  'meta-externalagent'
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

  const lines = [
    'User-agent: *',
    'Allow: /',
    ...AI_BOTS_DISALLOW.flatMap((bot) => [``, `User-agent: ${bot}`, 'Disallow: /']),
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ];

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
