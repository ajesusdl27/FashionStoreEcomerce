import { atom } from 'nanostores';

// ============================================
// NEWSLETTER POPUP STORE
// FashionStore - Tracking and state management
// ============================================

const POPUP_SHOWN_KEY = 'fashionstore_newsletter_popup_shown';
const POPUP_DISMISSED_KEY = 'fashionstore_newsletter_popup_dismissed';
const POPUP_SUBSCRIBED_COOKIE = 'newsletter_subscribed';

// Pages where popup should NEVER show
const EXCLUDED_PATHS = [
  '/checkout',
  '/carrito',
  '/cuenta',
  '/admin',
  '/promociones/newsletter-bienvenida',
];

// Pages where popup should show with extended delay (30s instead of 8s)
const PRODUCT_PATHS = ['/productos/'];

export interface PopupState {
  isVisible: boolean;
  hasShown: boolean;
  isSubscribed: boolean;
  isDismissed: boolean;
  couponCode: string | null;
}

// Initialize state from storage
function loadInitialState(): PopupState {
  if (typeof window === 'undefined') {
    return {
      isVisible: false,
      hasShown: false,
      isSubscribed: false,
      isDismissed: false,
      couponCode: null,
    };
  }

  const hasShown = localStorage.getItem(POPUP_SHOWN_KEY) === 'true';
  const dismissedUntil = localStorage.getItem(POPUP_DISMISSED_KEY);
  const isDismissed = dismissedUntil !== null && Date.now() < parseInt(dismissedUntil, 10);
  const isSubscribed = document.cookie.includes(`${POPUP_SUBSCRIBED_COOKIE}=true`);

  return {
    isVisible: false,
    hasShown,
    isSubscribed,
    isDismissed,
    couponCode: null,
  };
}

/**
 * Check if authenticated user is already subscribed to newsletter
 */
export async function checkAuthenticatedUserSubscription(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/newsletter/check-subscription');
    if (!response.ok) return false;
    
    const data = await response.json();
    if (data.isSubscribed) {
      // Mark as subscribed to prevent popup
      markSubscribed();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking newsletter subscription:', error);
    return false;
  }
}

// Main popup state atom
export const $popupState = atom<PopupState>(loadInitialState());

/**
 * Check if current path should show the popup
 */
export function isPathExcluded(pathname: string): boolean {
  return EXCLUDED_PATHS.some(
    (excluded) => pathname === excluded || pathname.startsWith(`${excluded}/`)
  );
}

/**
 * Check if current path is a product page (for extended delay)
 */
export function isProductPage(pathname: string): boolean {
  return PRODUCT_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Get the delay in ms before showing popup based on current page
 */
export function getPopupDelay(pathname: string): number {
  // Product pages: 15 seconds or scroll trigger
  if (isProductPage(pathname)) {
    return 15000;
  }
  // Default: 8 seconds
  return 8000;
}

/**
 * Determine if popup should be shown
 */
export function shouldShowPopup(pathname: string): boolean {
  const state = $popupState.get();
  
  // Don't show if already visible
  if (state.isVisible) return false;
  
  // Don't show if already subscribed
  if (state.isSubscribed) return false;
  
  // Don't show if dismissed (within cooldown period)
  if (state.isDismissed) return false;
  
  // Don't show if already shown in this session
  if (state.hasShown) return false;
  
  // Don't show on excluded pages
  if (isPathExcluded(pathname)) return false;
  
  return true;
}

/**
 * Show the popup
 */
export function showPopup(): void {
  if (typeof window === 'undefined') return;
  
  $popupState.set({
    ...$popupState.get(),
    isVisible: true,
    hasShown: true,
  });
  
  localStorage.setItem(POPUP_SHOWN_KEY, 'true');
}

/**
 * Hide the popup (for animation purposes)
 */
export function hidePopup(): void {
  $popupState.set({
    ...$popupState.get(),
    isVisible: false,
  });
}

/**
 * Mark as subscribed (closes popup permanently)
 */
export function markSubscribed(couponCode?: string): void {
  if (typeof window === 'undefined') return;
  
  // Set cookie for 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  document.cookie = `${POPUP_SUBSCRIBED_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  
  $popupState.set({
    ...$popupState.get(),
    isVisible: false,
    isSubscribed: true,
    couponCode: couponCode || 'BIENVENIDA10',
  });
}

/**
 * Dismiss popup (hides for specified days)
 */
export function dismissPopup(days: number = 7): void {
  if (typeof window === 'undefined') return;
  
  const dismissUntil = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(POPUP_DISMISSED_KEY, dismissUntil.toString());
  
  $popupState.set({
    ...$popupState.get(),
    isVisible: false,
    isDismissed: true,
  });
}

/**
 * Reset popup state (for testing)
 */
export function resetPopupState(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(POPUP_SHOWN_KEY);
  localStorage.removeItem(POPUP_DISMISSED_KEY);
  
  // Remove cookie
  document.cookie = `${POPUP_SUBSCRIBED_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  $popupState.set({
    isVisible: false,
    hasShown: false,
    isSubscribed: false,
    isDismissed: false,
    couponCode: null,
  });
}
