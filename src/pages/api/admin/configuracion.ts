import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createAuthenticatedClient, supabase } from '@/lib/supabase';
import { validateToken } from '@/lib/auth-utils';
import { invalidateSettingsCache } from '@/lib/settings';

// ============================================
// ESQUEMAS DE VALIDACIÓN
// ============================================

/**
 * Esquema para validar cada setting individual
 */
const SettingSchema = z.object({
  key: z.string()
    .min(1, 'La clave es requerida')
    .max(100, 'La clave no puede exceder 100 caracteres')
    .regex(/^[a-z_][a-z0-9_]*$/, 'La clave debe usar snake_case (ej: store_name)'),
  value: z.string().max(5000, 'El valor no puede exceder 5000 caracteres').optional(),
  value_bool: z.boolean().optional(),
  value_number: z.number()
    .min(-999999999, 'Número demasiado pequeño')
    .max(999999999, 'Número demasiado grande')
    .optional(),
});

/**
 * Esquema para validar el body completo del PUT
 */
const UpdateSettingsSchema = z.object({
  settings: z.array(SettingSchema)
    .min(1, 'Debe incluir al menos un setting')
    .max(50, 'No se pueden actualizar más de 50 settings a la vez'),
});

// Claves de settings permitidas (whitelist)
const ALLOWED_KEYS = new Set([
  // Información de tienda
  'store_name', 'store_email', 'store_phone', 'store_address',
  // Envío
  'shipping_cost', 'free_shipping_threshold',
  // Ofertas
  'offers_enabled', 'flash_offers_end',
  // Devoluciones
  'return_window_days',
  // Moneda
  'currency', 'locale',
  // Impuestos
  'tax_rate', 'prices_include_tax',
  // Redes sociales
  'social_instagram', 'social_twitter', 'social_tiktok', 'social_youtube',
  // SEO
  'meta_title', 'meta_description',
  // Branding
  'store_logo', 'store_favicon',
  // Sistema
  'maintenance_mode', 'maintenance_message',
  // Inventario
  'low_stock_threshold',
]);

// ============================================
// GET - Obtener configuraciones
// ============================================

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

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

    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, value_bool, value_number, description')
      .order('key');

    if (error) {
      console.error('Error fetching settings:', error);
      return new Response(JSON.stringify({ error: 'Error al obtener configuraciones' }), { 
        status: 500, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ settings }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Configuration GET error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};

// ============================================
// PUT - Actualizar configuraciones
// ============================================

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

    // Parse y validar body
    const body = await request.json();
    const validation = UpdateSettingsSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return new Response(JSON.stringify({ 
        error: 'Datos de entrada inválidos', 
        details: errors 
      }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { settings } = validation.data;

    // Validar que todas las keys estén en la whitelist
    const invalidKeys = settings.filter(s => !ALLOWED_KEYS.has(s.key));
    if (invalidKeys.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Claves de configuración no permitidas',
        invalidKeys: invalidKeys.map(s => s.key)
      }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Update each setting
    for (const setting of settings) {
      // Build the update object based on what's provided
      const updateData: Record<string, any> = {
        key: setting.key,
      };

      // Handle different value types
      if (setting.value_bool !== undefined) {
        updateData.value_bool = setting.value_bool;
        // Also store as string for compatibility
        updateData.value = setting.value_bool ? 'true' : 'false';
      }
      
      if (setting.value !== undefined) {
        updateData.value = setting.value;
      }
      
      if (setting.value_number !== undefined) {
        updateData.value_number = setting.value_number;
        // Also store as string for compatibility
        updateData.value = setting.value_number.toString();
      }

      const { error } = await authClient
        .from('settings')
        .upsert(updateData, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error updating setting:', setting.key, error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // Invalidar cache de settings tras actualización exitosa
    invalidateSettingsCache();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Configuración actualizada correctamente',
      updatedKeys: settings.map(s => s.key)
    }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Configuration API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    });
  }
};
