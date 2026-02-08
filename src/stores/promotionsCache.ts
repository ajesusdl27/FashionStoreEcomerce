/**
 * Shared promotions cache to avoid multiple Supabase queries per page load.
 * 
 * Both AnnouncementBar and PromotionBanner fetch ALL active promotions.
 * This store ensures only ONE query is made and results are shared.
 * Cache TTL: 2 minutes.
 */
import { atom } from 'nanostores';
import { supabase } from '@/lib/supabase';
import type { Promotion } from '@/lib/types/promotion';

// Re-export Promotion so consumers only need one import
export type { Promotion };

interface PromotionsCacheState {
  promotions: Promotion[];
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export const $promotionsCache = atom<PromotionsCacheState>({
  promotions: [],
  fetchedAt: null,
  loading: false,
  error: null,
});

let fetchPromise: Promise<Promotion[]> | null = null;

/**
 * Get active promotions from cache or fetch if stale/empty.
 * Multiple simultaneous calls share the same fetch promise (dedup).
 */
export async function getActivePromotions(): Promise<Promotion[]> {
  const state = $promotionsCache.get();

  // Return cached data if still fresh
  if (state.fetchedAt && Date.now() - state.fetchedAt < CACHE_TTL_MS && state.promotions.length > 0) {
    return state.promotions;
  }

  // If already fetching, wait for the same promise
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start a new fetch
  fetchPromise = (async () => {
    $promotionsCache.set({ ...state, loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('id, title, description, image_url, mobile_image_url, cta_text, cta_link, locations, priority, style_config, start_date, end_date, coupons(code, discount_type, discount_value)')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) {
        $promotionsCache.set({ promotions: [], fetchedAt: null, loading: false, error: error.message });
        return [];
      }

      const promotions = (data || []) as Promotion[];
      $promotionsCache.set({
        promotions,
        fetchedAt: Date.now(),
        loading: false,
        error: null,
      });

      return promotions;
    } catch (e: any) {
      $promotionsCache.set({ promotions: [], fetchedAt: null, loading: false, error: e.message });
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Get promotions for a specific zone, from cache.
 */
export async function getPromotionsForZone(zone: string): Promise<Promotion[]> {
  const allPromos = await getActivePromotions();
  return allPromos.filter(p =>
    Array.isArray(p.locations) && p.locations.includes(zone)
  );
}

/**
 * Invalidate the cache (e.g., after admin makes changes).
 */
export function invalidatePromotionsCache(): void {
  $promotionsCache.set({
    promotions: [],
    fetchedAt: null,
    loading: false,
    error: null,
  });
}
