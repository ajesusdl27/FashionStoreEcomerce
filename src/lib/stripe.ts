import Stripe from 'stripe';
import { getShippingConfig as getSettingsShippingConfig } from './settings';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
});

// ============================================
// CONSTANTES DEL SISTEMA
// ============================================

export const STOCK_RESERVATION_MINUTES = 30; // Minimum required by Stripe

// ============================================
// CONFIGURACIÓN DINÁMICA DE ENVÍO
// ============================================

/**
 * Obtiene la configuración de envío desde la BD.
 * Los valores se leen de la tabla settings y tienen caché de 1 minuto.
 * 
 * @returns Configuración de envío con costos en centavos y euros
 * 
 * @example
 * ```typescript
 * const { shippingCostCents, freeShippingThreshold } = await getShippingConfig();
 * // shippingCostCents = 499 (4.99€)
 * // freeShippingThreshold = 50 (envío gratis desde 50€)
 * ```
 */
export async function getShippingConfig(): Promise<{
  shippingCostCents: number;
  shippingCostEuros: number;
  freeShippingThreshold: number;
}> {
  return getSettingsShippingConfig();
}

// ============================================
// CONSTANTES LEGACY (DEPRECADAS)
// ============================================

/**
 * @deprecated Usar getShippingConfig() en su lugar
 * Mantenido temporalmente para compatibilidad con código existente
 */
export const FREE_SHIPPING_THRESHOLD = 50;

/**
 * @deprecated Usar getShippingConfig() en su lugar
 * Mantenido temporalmente para compatibilidad con código existente
 */
export const SHIPPING_COST = 499; // In cents for Stripe
