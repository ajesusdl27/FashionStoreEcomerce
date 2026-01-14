import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { stripe } from '@/lib/stripe';

// GET - List all coupons
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const { data, error } = await authClient
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ coupons: data }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// POST - Create new coupon (syncs with Stripe)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const { 
      code, 
      discount_type, 
      discount_value, 
      min_purchase_amount, 
      max_discount_amount,
      start_date, 
      end_date, 
      max_uses,
      max_uses_per_customer
    } = await request.json();

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create coupon in Stripe first
    let stripeCoupon;
    try {
      const stripeCouponParams: any = {
        name: code.toUpperCase(),
        duration: 'once',
      };

      if (discount_type === 'percentage') {
        stripeCouponParams.percent_off = parseFloat(discount_value);
      } else {
        stripeCouponParams.amount_off = Math.round(parseFloat(discount_value) * 100); // Convert to cents
        stripeCouponParams.currency = 'eur';
      }

      stripeCoupon = await stripe.coupons.create(stripeCouponParams);
    } catch (stripeError: any) {
      console.error('Stripe coupon creation error:', stripeError);
      return new Response(JSON.stringify({ error: `Error al crear cupón en Stripe: ${stripeError.message}` }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create coupon in Supabase
    const { data, error } = await authClient
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        stripe_coupon_id: stripeCoupon.id,
        discount_type,
        discount_value: parseFloat(discount_value),
        min_purchase_amount: min_purchase_amount ? parseFloat(min_purchase_amount) : 0,
        max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        max_uses: max_uses ? parseInt(max_uses) : null,
        max_uses_per_customer: max_uses_per_customer ? parseInt(max_uses_per_customer) : 1,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      // If Supabase fails, try to delete Stripe coupon to keep sync
      try {
        await stripe.coupons.del(stripeCoupon.id);
      } catch (e) {
        console.error('Failed to cleanup Stripe coupon:', e);
      }
      
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true, coupon: data }), { 
      status: 201, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Coupon creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// PUT - Update coupon (toggle active status)
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { id, is_active } = await request.json();

    const { error } = await authClient
      .from('coupons')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// DELETE - Delete coupon (also deletes from Stripe)
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const authClient = createAuthenticatedClient(accessToken, refreshToken);
    const { id } = await request.json();

    // Get coupon to find Stripe ID
    const { data: coupon } = await authClient
      .from('coupons')
      .select('stripe_coupon_id')
      .eq('id', id)
      .single();

    if (coupon?.stripe_coupon_id) {
      try {
        await stripe.coupons.del(coupon.stripe_coupon_id);
      } catch (stripeError) {
        console.error('Failed to delete Stripe coupon:', stripeError);
        // Continue with Supabase deletion even if Stripe fails
      }
    }

    const { error } = await authClient
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
