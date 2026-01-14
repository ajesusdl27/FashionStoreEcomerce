import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code, cartTotal, customerEmail } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Código requerido' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Use RPC function to validate coupon with all business rules
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: code,
      p_cart_total: cartTotal || 0,
      p_customer_email: customerEmail || null
    });

    if (error) {
      console.error('Coupon validation error:', error);
      return new Response(JSON.stringify({ error: 'Error al validar el cupón' }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // RPC returns an array with one row
    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.is_valid) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: result?.error_message || 'Código no válido' 
      }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      valid: true,
      coupon: {
        id: result.coupon_id,
        stripeCouponId: result.stripe_coupon_id,
        discountType: result.discount_type,
        discountValue: result.discount_value,
        maxDiscountAmount: result.max_discount_amount,
        calculatedDiscount: result.calculated_discount
      }
    }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return new Response(JSON.stringify({ error: 'Error al validar el cupón' }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
