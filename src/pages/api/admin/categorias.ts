import type { APIRoute } from 'astro';
import { createAuthenticatedClient } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';

// Helper: Normalize slug for consistency
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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

    const { name, slug, size_type, description, icon_name, color_theme, featured, display_order } = await request.json();

    // Validate required fields
    if (!name?.trim()) {
      return new Response(JSON.stringify({ error: 'El nombre es obligatorio' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (!slug?.trim()) {
      return new Response(JSON.stringify({ error: 'El slug es obligatorio' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Normalize and validate slug
    const normalizedSlug = normalizeSlug(slug);

    // Check slug uniqueness
    if (!(await isSlugUnique(authClient, normalizedSlug))) {
      return new Response(JSON.stringify({ error: 'Ya existe una categoría con este slug' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { data, error } = await authClient
      .from('categories')
      .insert({ 
        name: name.trim(), 
        slug: normalizedSlug, 
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

    const { id, name, slug, size_type, description, icon_name, color_theme, featured, display_order } = await request.json();

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

    if (!slug?.trim()) {
      return new Response(JSON.stringify({ error: 'El slug es obligatorio' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Normalize and validate slug
    const normalizedSlug = normalizeSlug(slug);

    // Check slug uniqueness (excluding current category)
    if (!(await isSlugUnique(authClient, normalizedSlug, id))) {
      return new Response(JSON.stringify({ error: 'Ya existe otra categoría con este slug' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { error } = await authClient
      .from('categories')
      .update({ 
        name: name.trim(), 
        slug: normalizedSlug, 
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
