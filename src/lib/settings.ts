/**
 * Settings Service - Servicio centralizado de configuración
 * 
 * Este módulo proporciona acceso unificado a todas las configuraciones
 * de la tienda, con caché en memoria para optimizar rendimiento.
 * 
 * @module settings
 */

import { supabase } from './supabase';

// ============================================
// TIPOS
// ============================================

export interface StoreSettings {
  // Información de la tienda
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  
  // Envío
  shippingCost: number;
  freeShippingThreshold: number;
  
  // Ofertas
  offersEnabled: boolean;
  flashOffersEnd: string | null;
  
  // Devoluciones
  returnWindowDays: number;
  
  // Moneda y localización
  currency: string;
  locale: string;
  
  // Impuestos
  taxRate: number;
  pricesIncludeTax: boolean;
  
  // Redes sociales
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  socialYoutube: string;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  // Branding
  storeLogo: string;
  storeFavicon: string;
  
  // Sistema
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Inventario
  lowStockThreshold: number;
}

interface SettingRow {
  key: string;
  value: string | null;
  value_bool: boolean | null;
  value_number: number | null;
}

// ============================================
// VALORES POR DEFECTO
// ============================================

const DEFAULTS: StoreSettings = {
  // Información de la tienda
  storeName: 'FashionStore',
  storeEmail: 'contacto@fashionstore.com',
  storePhone: '+34 600 000 000',
  storeAddress: 'Calle Moda, 123, 28001 Madrid',
  
  // Envío
  shippingCost: 4.99,
  freeShippingThreshold: 50,
  
  // Ofertas
  offersEnabled: false,
  flashOffersEnd: null,
  
  // Devoluciones
  returnWindowDays: 30,
  
  // Moneda y localización
  currency: 'EUR',
  locale: 'es-ES',
  
  // Impuestos
  taxRate: 21,
  pricesIncludeTax: true,
  
  // Redes sociales
  socialInstagram: '',
  socialTwitter: '',
  socialTiktok: '',
  socialYoutube: '',
  
  // SEO
  metaTitle: 'FashionStore - Streetwear Premium',
  metaDescription: 'Tu tienda de streetwear premium con las mejores marcas urbanas.',
  
  // Branding
  storeLogo: '',
  storeFavicon: '',
  
  // Sistema
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando mejoras. Volvemos pronto.',
  
  // Inventario
  lowStockThreshold: 5,
};

// ============================================
// CACHÉ
// ============================================

let settingsCache: Map<string, SettingRow> | null = null;
let cacheTimestamp: number = 0;
// Cache deshabilitado temporalmente para debug - cambiar a 60 * 1000 en producción
const CACHE_TTL_MS = 0; // Sin caché por ahora

/**
 * Invalida el caché de configuraciones.
 * Llamar después de guardar cambios en settings.
 */
export function invalidateSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Verifica si el caché es válido
 */
function isCacheValid(): boolean {
  if (!settingsCache) return false;
  return (Date.now() - cacheTimestamp) < CACHE_TTL_MS;
}

// ============================================
// FUNCIONES DE OBTENCIÓN
// ============================================

/**
 * Obtiene todas las configuraciones de la tienda.
 * Usa caché en memoria para optimizar rendimiento.
 * 
 * @returns Objeto con todas las configuraciones
 * 
 * @example
 * ```typescript
 * const settings = await getSettings();
 * console.log(settings.storeName); // "FashionStore"
 * console.log(settings.shippingCost); // 4.99
 * ```
 */
export async function getSettings(): Promise<StoreSettings> {
  // Usar caché si es válido
  if (isCacheValid() && settingsCache) {
    return mapSettingsFromCache(settingsCache);
  }
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value, value_bool, value_number');
    
    if (error) {
      console.error('Error fetching settings:', error);
      return { ...DEFAULTS };
    }
    
    if (!data || data.length === 0) {
      console.warn('No settings found in database, using defaults');
      return { ...DEFAULTS };
    }
    
    // Actualizar caché
    settingsCache = new Map(data.map((s: SettingRow) => [s.key, s]));
    cacheTimestamp = Date.now();
    
    return mapSettingsFromCache(settingsCache);
  } catch (err) {
    console.error('Exception fetching settings:', err);
    return { ...DEFAULTS };
  }
}

/**
 * Obtiene una configuración específica por clave.
 * Útil cuando solo se necesita un valor.
 * 
 * @param key - Clave de la configuración
 * @returns Valor de la configuración o undefined
 */
export async function getSetting<K extends keyof StoreSettings>(
  key: K
): Promise<StoreSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Obtiene configuración de envío.
 * Función de conveniencia para el módulo de checkout.
 * 
 * @returns Objeto con shippingCost (en centavos) y freeShippingThreshold
 */
export async function getShippingConfig(): Promise<{
  shippingCostCents: number;
  shippingCostEuros: number;
  freeShippingThreshold: number;
}> {
  const settings = await getSettings();
  return {
    shippingCostCents: Math.round(settings.shippingCost * 100),
    shippingCostEuros: settings.shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
  };
}

/**
 * Obtiene información de contacto de la tienda.
 * Función de conveniencia para páginas públicas.
 */
export async function getContactInfo(): Promise<{
  name: string;
  email: string;
  phone: string;
  address: string;
}> {
  const settings = await getSettings();
  return {
    name: settings.storeName,
    email: settings.storeEmail,
    phone: settings.storePhone,
    address: settings.storeAddress,
  };
}

/**
 * Obtiene URLs de redes sociales.
 */
export async function getSocialLinks(): Promise<{
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
}> {
  const settings = await getSettings();
  return {
    instagram: settings.socialInstagram,
    twitter: settings.socialTwitter,
    tiktok: settings.socialTiktok,
    youtube: settings.socialYoutube,
  };
}

// ============================================
// MAPEO DE DATOS
// ============================================

/**
 * Mapea los datos raw de la BD a la interfaz StoreSettings
 */
function mapSettingsFromCache(cache: Map<string, SettingRow>): StoreSettings {
  return {
    // Información de la tienda
    storeName: getTextValue(cache, 'store_name', DEFAULTS.storeName),
    storeEmail: getTextValue(cache, 'store_email', DEFAULTS.storeEmail),
    storePhone: getTextValue(cache, 'store_phone', DEFAULTS.storePhone),
    storeAddress: getTextValue(cache, 'store_address', DEFAULTS.storeAddress),
    
    // Envío
    shippingCost: getNumberValue(cache, 'shipping_cost', DEFAULTS.shippingCost),
    freeShippingThreshold: getNumberValue(cache, 'free_shipping_threshold', DEFAULTS.freeShippingThreshold),
    
    // Ofertas
    offersEnabled: getBoolValue(cache, 'offers_enabled', DEFAULTS.offersEnabled),
    flashOffersEnd: getTextValue(cache, 'flash_offers_end', null),
    
    // Devoluciones
    returnWindowDays: getNumberValue(cache, 'return_window_days', DEFAULTS.returnWindowDays),
    
    // Moneda y localización
    currency: getTextValue(cache, 'currency', DEFAULTS.currency),
    locale: getTextValue(cache, 'locale', DEFAULTS.locale),
    
    // Impuestos
    taxRate: getNumberValue(cache, 'tax_rate', DEFAULTS.taxRate),
    pricesIncludeTax: getBoolValue(cache, 'prices_include_tax', DEFAULTS.pricesIncludeTax),
    
    // Redes sociales
    socialInstagram: getTextValue(cache, 'social_instagram', ''),
    socialTwitter: getTextValue(cache, 'social_twitter', ''),
    socialTiktok: getTextValue(cache, 'social_tiktok', ''),
    socialYoutube: getTextValue(cache, 'social_youtube', ''),
    
    // SEO
    metaTitle: getTextValue(cache, 'meta_title', DEFAULTS.metaTitle),
    metaDescription: getTextValue(cache, 'meta_description', DEFAULTS.metaDescription),
    
    // Branding
    storeLogo: getTextValue(cache, 'store_logo', ''),
    storeFavicon: getTextValue(cache, 'store_favicon', ''),
    
    // Sistema
    maintenanceMode: getBoolValue(cache, 'maintenance_mode', DEFAULTS.maintenanceMode),
    maintenanceMessage: getTextValue(cache, 'maintenance_message', DEFAULTS.maintenanceMessage),
    
    // Inventario
    lowStockThreshold: getNumberValue(cache, 'low_stock_threshold', DEFAULTS.lowStockThreshold),
  };
}

// ============================================
// HELPERS DE EXTRACCIÓN
// ============================================

function getTextValue(
  cache: Map<string, SettingRow>, 
  key: string, 
  defaultValue: string | null
): string {
  const setting = cache.get(key);
  if (!setting) return defaultValue ?? '';
  return setting.value ?? defaultValue ?? '';
}

function getNumberValue(
  cache: Map<string, SettingRow>, 
  key: string, 
  defaultValue: number
): number {
  const setting = cache.get(key);
  if (!setting) return defaultValue;
  
  // Priorizar value_number, luego intentar parsear value
  if (setting.value_number !== null && setting.value_number !== undefined) {
    return setting.value_number;
  }
  
  if (setting.value !== null && setting.value !== undefined) {
    const parsed = parseFloat(setting.value);
    if (!isNaN(parsed)) return parsed;
  }
  
  return defaultValue;
}

function getBoolValue(
  cache: Map<string, SettingRow>, 
  key: string, 
  defaultValue: boolean
): boolean {
  const setting = cache.get(key);
  if (!setting) return defaultValue;
  
  // Priorizar value_bool, luego interpretar value como string
  if (setting.value_bool !== null && setting.value_bool !== undefined) {
    return setting.value_bool;
  }
  
  if (setting.value !== null && setting.value !== undefined) {
    return setting.value.toLowerCase() === 'true';
  }
  
  return defaultValue;
}

// ============================================
// EXPORTAR DEFAULTS PARA REFERENCIA
// ============================================

export const DEFAULT_SETTINGS = { ...DEFAULTS } as const;
