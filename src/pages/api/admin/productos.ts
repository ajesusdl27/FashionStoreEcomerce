import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

// CREATE product
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verify admin auth
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { product, variants, images } = await request.json();

    // Create product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (productError) {
      return new Response(JSON.stringify({ error: productError.message }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create variants
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v: { size: string; stock: number }) => ({
        product_id: newProduct.id,
        size: v.size,
        stock: v.stock,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsData);

      if (variantsError) {
        console.error('Error creating variants:', variantsError);
      }
    }

    // Create images
    if (images && images.length > 0) {
      const imagesData = images.map((url: string, index: number) => ({
        product_id: newProduct.id,
        image_url: url,
        order: index,
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imagesData);

      if (imagesError) {
        console.error('Error creating images:', imagesError);
      }
    }

    return new Response(JSON.stringify({ success: true, product: newProduct }), { 
      status: 201, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// UPDATE product
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id, product, variants, images } = await request.json();

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (productError) {
      return new Response(JSON.stringify({ error: productError.message }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update variants - delete all and recreate
    await supabase.from('product_variants').delete().eq('product_id', id);
    
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v: { size: string; stock: number }) => ({
        product_id: id,
        size: v.size,
        stock: v.stock,
      }));

      await supabase.from('product_variants').insert(variantsData);
    }

    // Update images - delete all and recreate
    await supabase.from('product_images').delete().eq('product_id', id);
    
    if (images && images.length > 0) {
      const imagesData = images.map((url: string, index: number) => ({
        product_id: id,
        image_url: url,
        order: index,
      }));

      await supabase.from('product_images').insert(imagesData);
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// DELETE product
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id } = await request.json();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
