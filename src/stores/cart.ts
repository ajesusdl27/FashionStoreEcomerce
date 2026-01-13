import { atom, computed } from 'nanostores';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  size: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

// Persistent cart store
const CART_KEY = 'fashionstore_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Main cart atom
export const $cart = atom<CartItem[]>(loadCart());

// Subscribe to changes and persist
$cart.subscribe((items) => {
  saveCart(items);
});

// Computed values
export const $cartCount = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartSubtotal = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

// Actions
export function addToCart(item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) {
  const items = $cart.get();
  const existingIndex = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  if (existingIndex >= 0) {
    // Update quantity
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantity,
    };
    $cart.set(updated);
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: `${item.productId}-${item.variantId}`,
      quantity,
    };
    $cart.set([...items, newItem]);
  }
}

export function removeFromCart(itemId: string) {
  const items = $cart.get();
  $cart.set(items.filter((i) => i.id !== itemId));
}

export function updateQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }

  const items = $cart.get();
  const updated = items.map((item) =>
    item.id === itemId ? { ...item, quantity } : item
  );
  $cart.set(updated);
}

export function clearCart() {
  $cart.set([]);
}

// Get item by ID
export function getCartItem(itemId: string): CartItem | undefined {
  return $cart.get().find((i) => i.id === itemId);
}

// UI State
export const $isCartOpen = atom(false);

export function toggleCart() {
  $isCartOpen.set(!$isCartOpen.get());
}

export function openCart() {
  $isCartOpen.set(true);
}

export function closeCart() {
  $isCartOpen.set(false);
}
