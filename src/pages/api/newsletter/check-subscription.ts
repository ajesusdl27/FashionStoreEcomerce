import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createAuthenticatedClient } from '@/lib/supabase';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Check if user is authenticated
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    if (!accessToken || !refreshToken) {
      // Not authenticated, popup should show
      return new Response(JSON.stringify({ isSubscribed: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authenticatedClient = createAuthenticatedClient(accessToken, refreshToken);
    const { data: { user } } = await authenticatedClient.auth.getUser();
    
    if (!user || !user.email) {
      return new Response(JSON.stringify({ isSubscribed: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if this email is subscribed to newsletter
    const { data: subscriber } = await serviceClient
      .from('newsletter_subscribers')
      .select('is_active')
      .eq('email', user.email.toLowerCase().trim())
      .single();

    const isSubscribed = subscriber?.is_active === true;

    return new Response(JSON.stringify({ 
      isSubscribed,
      email: user.email 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking newsletter subscription:', error);
    // On error, default to not subscribed (show popup)
    return new Response(JSON.stringify({ isSubscribed: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
