import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

// Helper function to validate slug uniqueness
async function isSlugUnique(
  authClient: ReturnType<typeof createAuthenticatedClient>,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = authClient
    .from('products')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data } = await query.maybeSingle();
  return !data;
}

// Helper function to validate offer price
function validateOfferPrice(product: { is_offer?: boolean; offer_price?: number; price: number }): string | null {
  if (product.is_offer && product.offer_price != null) {
    if (product.offer_price >= product.price) {
      return 'El precio de oferta debe ser menor que el precio base';
    }
    if (product.offer_price < 0) {
      return 'El precio de oferta no puede ser negativo';
    }
  }
  return null;
}

// CREATE product
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get auth tokens from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { product, variants, images } = await request.json();

    // Validate unique slug
    const slugUnique = await isSlugUnique(authClient, product.slug);
    if (!slugUnique) {
      return new Response(JSON.stringify({ error: 'Ya existe un producto con este slug. Por favor, elige un slug diferente.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Validate offer price
    const offerPriceError = validateOfferPrice(product);
    if (offerPriceError) {
      return new Response(JSON.stringify({ error: offerPriceError }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create product with authenticated client
    const { data: newProduct, error: productError } = await authClient
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

      const { error: variantsError } = await authClient
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

      const { error: imagesError } = await authClient
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
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id, product, variants, images } = await request.json();

    // Validate unique slug (excluding current product)
    const slugUnique = await isSlugUnique(authClient, product.slug, id);
    if (!slugUnique) {
      return new Response(JSON.stringify({ error: 'Ya existe otro producto con este slug. Por favor, elige un slug diferente.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Validate offer price
    const offerPriceError = validateOfferPrice(product);
    if (offerPriceError) {
      return new Response(JSON.stringify({ error: offerPriceError }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update product
    const { error: productError } = await authClient
      .from('products')
      .update(product)
      .eq('id', id);

    if (productError) {
      return new Response(JSON.stringify({ error: productError.message }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update variants using UPSERT to preserve IDs (important for order_items references)
    if (variants && variants.length > 0) {
      // Get existing variants to map size -> id
      const { data: existingVariants } = await authClient
        .from('product_variants')
        .select('id, size')
        .eq('product_id', id);
      
      const sizeToIdMap: Record<string, string> = {};
      existingVariants?.forEach(v => {
        sizeToIdMap[v.size] = v.id;
      });

      // Upsert variants
      for (const variant of variants as { size: string; stock: number }[]) {
        const existingId = sizeToIdMap[variant.size];
        
        if (existingId) {
          // Update existing variant
          await authClient
            .from('product_variants')
            .update({ stock: variant.stock })
            .eq('id', existingId);
        } else {
          // Insert new variant
          await authClient
            .from('product_variants')
            .insert({
              product_id: id,
              size: variant.size,
              stock: variant.stock,
            });
        }
      }

      // Delete variants that no longer exist
      const newSizes = variants.map((v: { size: string }) => v.size);
      const sizesToDelete = Object.keys(sizeToIdMap).filter(size => !newSizes.includes(size));
      
      if (sizesToDelete.length > 0) {
        await authClient
          .from('product_variants')
          .delete()
          .eq('product_id', id)
          .in('size', sizesToDelete);
      }
    } else {
      // If no variants provided, delete all
      await authClient.from('product_variants').delete().eq('product_id', id);
    }

    // Update images - delete all and recreate (images don't have references)
    await authClient.from('product_images').delete().eq('product_id', id);
    
    if (images && images.length > 0) {
      const imagesData = images.map((url: string, index: number) => ({
        product_id: id,
        image_url: url,
        order: index,
      }));

      await authClient.from('product_images').insert(imagesData);
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

// DELETE product (soft delete)
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id } = await request.json();

    // Soft delete: set deleted_at timestamp instead of hard delete
    const { error } = await authClient
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
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
