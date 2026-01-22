import type { APIRoute } from 'astro';

/**
 * Endpoint de test simple para verificar que los POST requests funcionan
 * Usar para diagnosticar problemas 403 Forbidden
 */
export const GET: APIRoute = async () => {
  console.log('🧪 [TEST] GET request received - working!');
  
  return new Response(
    JSON.stringify({ 
      status: 'ok',
      message: 'GET endpoint is working',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Test-Header': 'success'
      }
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  console.log('🧪 [TEST] POST request received - working!');
  console.log('🧪 [TEST] Headers:', Object.fromEntries(request.headers.entries()));
  
  let body;
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.text();
    }
    
    console.log('🧪 [TEST] Body:', body);
  } catch (err) {
    console.error('🧪 [TEST] Error reading body:', err);
    body = { error: 'Could not parse body' };
  }
  
  return new Response(
    JSON.stringify({ 
      status: 'ok',
      message: 'POST endpoint is working',
      receivedBody: body,
      timestamp: new Date().toISOString(),
      headers: {
        contentType: request.headers.get('content-type'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Test-Header': 'success'
      }
    }
  );
};

export const OPTIONS: APIRoute = async () => {
  console.log('🧪 [TEST] OPTIONS request received (CORS preflight)');
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};
