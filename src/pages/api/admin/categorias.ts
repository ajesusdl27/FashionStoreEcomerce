import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

// Helper: Generate a slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper: Check if slug is unique
async function isSlugUnique(
  authClient: ReturnType<typeof createAuthenticatedClient>,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = authClient
    .from('categories')
    .select('id')
    .eq('slug', slug);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data } = await query.maybeSingle();
  return !data;
}

// Helper: Generate a unique slug, appending -2, -3... if needed
async function generateUniqueSlug(
  authClient: ReturnType<typeof createAuthenticatedClient>,
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(name);
  if (!baseSlug) throw new Error('No se puede generar un slug a partir del nombre proporcionado');

  if (await isSlugUnique(authClient, baseSlug, excludeId)) {
    return baseSlug;
  }

  let counter = 2;
  while (counter <= 100) {
    const candidate = `${baseSlug}-${counter}`;
    if (await isSlugUnique(authClient, candidate, excludeId)) {
      return candidate;
    }
    counter++;
  }

  throw new Error('No se pudo generar un slug único tras 100 intentos');
}

// CREATE category
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { name, size_type, description, icon_name, color_theme, featured, display_order } = await request.json();

    // Validate required fields
    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generate unique slug from name (server-side, ignore any client slug)
    const slug = await generateUniqueSlug(authClient, name);

    const { data, error } = await authClient
      .from('categories')
      .insert({ 
        name: name.trim(), 
        slug, 
        size_type: size_type || 'clothing',
        description: description?.trim() || null,
        icon_name: icon_name || 'tag',
        color_theme: color_theme || 'default',
        featured: featured || false,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true, category: data }), { 
      status: 201, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// UPDATE category
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id, name, size_type, description, icon_name, color_theme, featured, display_order } = await request.json();

    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID de categoría requerido' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Fetch existing category to check if name changed
    const { data: existingCategory } = await authClient
      .from('categories')
      .select('name, slug')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), { 
        status: 404, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Generate new slug only if name changed, otherwise keep existing
    const slug = name.trim() !== existingCategory.name
      ? await generateUniqueSlug(authClient, name, id)
      : existingCategory.slug;

    const { error } = await authClient
      .from('categories')
      .update({ 
        name: name.trim(), 
        slug, 
        size_type,
        description: description?.trim() || null,
        icon_name: icon_name || 'tag',
        color_theme: color_theme || 'default',
        featured: featured || false,
        display_order: display_order || 0
      })
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

// DELETE category
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Create authenticated client for RLS
    const authClient = createAuthenticatedClient(accessToken, refreshToken);

    const user = await validateToken(accessToken);
    if (!user?.user_metadata?.is_admin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { id } = await request.json();

    const { error } = await authClient
      .from('categories')
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
