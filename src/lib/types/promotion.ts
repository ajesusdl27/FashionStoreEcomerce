/**
 * Shared Promotion Types & Helpers
 * Single source of truth for promotion styling across admin and client views.
 * 
 * ALL components that render promotions must import from here to ensure
 * visual consistency between what the admin configures and what the client sees.
 */

// ─── Style Config ────────────────────────────────────────────────────────────

export type TextColor = 'white' | 'black' | 'gold' | 'red' | 'gray';
export type TextAlign = 'left' | 'center' | 'right';
export type OverlayPosition = 'left' | 'center' | 'right' | 'full';

export interface PromotionStyleConfig {
  text_color: TextColor;
  text_align: TextAlign;
  overlay_enabled: boolean;
  overlay_position: OverlayPosition;
  /** 0–100 percentage */
  overlay_opacity: number;
}

export const DEFAULT_STYLE_CONFIG: PromotionStyleConfig = {
  text_color: 'white',
  text_align: 'left',
  overlay_enabled: true,
  overlay_position: 'left',
  overlay_opacity: 60,
};

/** Safely merge a potentially incomplete DB `style_config` with defaults */
export function resolveStyleConfig(raw?: Partial<PromotionStyleConfig> | Record<string, any> | null): PromotionStyleConfig {
  if (!raw) return { ...DEFAULT_STYLE_CONFIG };
  return {
    text_color: (['white', 'black', 'gold', 'red', 'gray'].includes(raw.text_color as string)
      ? raw.text_color
      : DEFAULT_STYLE_CONFIG.text_color) as TextColor,
    text_align: (['left', 'center', 'right'].includes(raw.text_align as string)
      ? raw.text_align
      : DEFAULT_STYLE_CONFIG.text_align) as TextAlign,
    overlay_enabled: typeof raw.overlay_enabled === 'boolean'
      ? raw.overlay_enabled
      : DEFAULT_STYLE_CONFIG.overlay_enabled,
    overlay_position: (['left', 'center', 'right', 'full'].includes(raw.overlay_position as string)
      ? raw.overlay_position
      : DEFAULT_STYLE_CONFIG.overlay_position) as OverlayPosition,
    overlay_opacity: typeof raw.overlay_opacity === 'number'
      ? Math.max(0, Math.min(100, raw.overlay_opacity))
      : DEFAULT_STYLE_CONFIG.overlay_opacity,
  };
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface PromotionCoupon {
  code: string;
  discount_type?: string;
  discount_value?: number;
}

/**
 * Supabase joins can return a single object OR an array depending on
 * the relation type and query. This normalises both shapes.
 */
export function normalizeCoupon(couponData: any): PromotionCoupon | null {
  if (!couponData) return null;
  if (Array.isArray(couponData)) {
    return couponData.length > 0 && couponData[0]?.code ? couponData[0] : null;
  }
  if (typeof couponData === 'object' && 'code' in couponData) {
    return couponData as PromotionCoupon;
  }
  return null;
}

// ─── Full Promotion Type ─────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  mobile_image_url?: string;
  cta_text?: string;
  cta_link?: string;
  locations: string[];
  priority: number;
  style_config: PromotionStyleConfig;
  start_date?: string;
  end_date?: string;
  coupon_id?: string;
  coupons?: any; // raw from Supabase, use normalizeCoupon() to consume
  is_active?: boolean;
}

// ─── Text Color Helper ───────────────────────────────────────────────────────

/** Returns a Tailwind text color class */
export function getTextColorClass(color?: TextColor | string): string {
  switch (color) {
    case 'black': return 'text-black';
    case 'gold':  return 'text-amber-400';
    case 'red':   return 'text-red-500';
    case 'gray':  return 'text-gray-300';
    case 'white':
    default:      return 'text-white';
  }
}

/** Returns a Tailwind text-align + flex items class */
export function getTextAlignClass(align?: TextAlign | string): string {
  switch (align) {
    case 'center': return 'text-center items-center';
    case 'right':  return 'text-right items-end';
    case 'left':
    default:       return 'text-left items-start';
  }
}

// ─── Content Position Helper ─────────────────────────────────────────────────

/**
 * Maps the admin-configured `overlay_position` to horizontal placement of the
 * text-block container.  This controls WHERE on screen the content sits;
 * `getTextAlignClass` then controls text alignment INSIDE that container.
 */
export function getContentPositionClasses(position?: OverlayPosition | string): string {
  switch (position) {
    case 'center': return 'items-center';
    case 'right':  return 'items-end';
    case 'full':   return 'items-center';
    case 'left':
    default:       return 'items-start';
  }
}

// ─── Overlay Classes (the ONE source of truth) ──────────────────────────────

/**
 * Map overlay_opacity (0-100) to the closest Tailwind opacity class.
 * Tailwind supports: 0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100
 */
function toTailwindOpacity(pct: number): number {
  const stops = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
  return stops.reduce((prev, curr) =>
    Math.abs(curr - pct) < Math.abs(prev - pct) ? curr : prev
  );
}

/** Whether the text color needs a dark overlay behind it for readability */
export function needsDarkOverlay(color?: TextColor | string): boolean {
  return !color || color === 'white' || color === 'gold' || color === 'gray';
}

type OverlayVariant = 'hero' | 'banner-full' | 'banner-compact' | 'announcement' | 'preview';

/**
 * Returns the Tailwind classes for the overlay/gradient that sits between the
 * background image and the text, ensuring readability.
 *
 * Uses the admin-configured `style_config` values so what the admin sees in
 * the wizard preview matches what the customer sees on the storefront.
 */
export function getOverlayClasses(config: PromotionStyleConfig, variant: OverlayVariant): string {
  if (!config.overlay_enabled) return '';

  const dark = needsDarkOverlay(config.text_color);
  const opacity = toTailwindOpacity(config.overlay_opacity);
  const fadeOpacity = toTailwindOpacity(Math.round(config.overlay_opacity * 0.5));

  // Base colour tokens
  const solidBg = dark ? `bg-black/${opacity}` : `bg-white/${opacity}`;

  // Direction based on overlay_position
  switch (config.overlay_position) {
    case 'full':
      return solidBg;

    case 'center': {
      // Radial-like: full coverage with lighter edges
      if (variant === 'hero') {
        return `bg-gradient-to-t ${dark ? `from-black/${opacity}` : `from-white/${opacity}`} ${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} to-transparent sm:bg-gradient-to-b sm:${dark ? `from-black/${fadeOpacity}` : `from-white/${fadeOpacity}`} sm:via-transparent sm:${dark ? `to-black/${fadeOpacity}` : `to-white/${fadeOpacity}`}`;
      }
      return `bg-gradient-to-b ${dark ? `from-black/${fadeOpacity}` : `from-white/${fadeOpacity}`} ${dark ? `via-black/${opacity}` : `via-white/${opacity}`} ${dark ? `to-black/${fadeOpacity}` : `to-white/${fadeOpacity}`}`;
    }

    case 'right':
      if (variant === 'hero') {
        return `bg-gradient-to-t ${dark ? `from-black/${opacity}` : `from-white/${opacity}`} ${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} to-transparent sm:bg-gradient-to-l sm:${dark ? `from-black/${opacity}` : `from-white/${opacity}`} sm:${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} sm:to-transparent`;
      }
      return `bg-gradient-to-l ${dark ? `from-black/${opacity}` : `from-white/${opacity}`} ${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} to-transparent`;

    case 'left':
    default:
      if (variant === 'hero') {
        // Mobile: bottom-to-top gradient for vertical readability
        // Desktop: left-to-right matching the text position
        return `bg-gradient-to-t ${dark ? `from-black/${opacity}` : `from-white/${opacity}`} ${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} to-transparent sm:bg-gradient-to-r sm:${dark ? `from-black/${opacity}` : `from-white/${opacity}`} sm:${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} sm:to-transparent`;
      }
      return `bg-gradient-to-r ${dark ? `from-black/${opacity}` : `from-white/${opacity}`} ${dark ? `via-black/${fadeOpacity}` : `via-white/${fadeOpacity}`} to-transparent`;
  }
}

// ─── Announcement Bar Background ────────────────────────────────────────────

/**
 * The announcement bar doesn't have a background image, so we apply a solid
 * background colour that contrasts with the configured text colour.
 */
export function getAnnouncementBgClass(config: PromotionStyleConfig): string {
  if (needsDarkOverlay(config.text_color)) {
    // Dark background for light text
    return 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900';
  }
  // Light background for dark text
  return 'bg-gradient-to-r from-zinc-100 via-white to-zinc-100';
}
