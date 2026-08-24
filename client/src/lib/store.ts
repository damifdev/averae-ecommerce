const WISHLIST_KEY = 'averae-wishlist';
const CART_KEY = 'averae-cart';
const BACK_IN_STOCK_KEY = 'averae-back-in-stock-alerts';
const LAST_ADDED_CART_ITEM_KEY = 'averae-last-added-cart-item';
export const CART_UPDATED_EVENT = 'averae-cart-updated';
export const BACK_IN_STOCK_UPDATED_EVENT = 'averae-back-in-stock-updated';

export type CartItem = {
  id: number;
  size: string;
  color: string;
  quantity: number;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T; } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  if (key === CART_KEY) window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  if (key === BACK_IN_STOCK_KEY) window.dispatchEvent(new CustomEvent(BACK_IN_STOCK_UPDATED_EVENT));
}

export function getWishlist() { return read<number[]>(WISHLIST_KEY, []); }

export function toggleWishlist(id: number) {
  const next = getWishlist();
  const value = next.includes(id) ? next.filter(item => item !== id) : [...next, id];
  write(WISHLIST_KEY, value);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('averae-wishlist-updated'));
  return value;
}

export function getCart(): CartItem[] {
  const raw = read<unknown[]>(CART_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(item => {
    if (typeof item === 'number' && Number.isFinite(item)) return [{ id: item, size: '', color: '', quantity: 1 }];
    if (!item || typeof item !== 'object' || !('id' in item)) return [];
    const candidate = item as Partial<CartItem>;
    if (typeof candidate.id !== 'number' || !Number.isFinite(candidate.id)) return [];
    return [{
      id: candidate.id,
      size: typeof candidate.size === 'string' ? candidate.size : '',
      color: typeof candidate.color === 'string' ? candidate.color : '',
      quantity: typeof candidate.quantity === 'number' && candidate.quantity > 0 ? Math.floor(candidate.quantity) : 1,
    }];
  });
}

export function getLastAddedCartItem(): CartItem | null {
  const raw = read<unknown>(LAST_ADDED_CART_ITEM_KEY, null);
  if (!raw || typeof raw !== 'object' || !('id' in raw)) return null;
  const candidate = raw as Partial<CartItem>;
  if (typeof candidate.id !== 'number' || !Number.isFinite(candidate.id)) return null;
  return {
    id: candidate.id,
    size: typeof candidate.size === 'string' ? candidate.size : '',
    color: typeof candidate.color === 'string' ? candidate.color : '',
    quantity: typeof candidate.quantity === 'number' && candidate.quantity > 0 ? Math.floor(candidate.quantity) : 1,
  };
}

export function addToCart(id: number, selection: Partial<Pick<CartItem, 'size' | 'color'>> = {}, quantity = 1) {
  const next = getCart();
  const size = selection.size ?? '';
  const color = selection.color ?? '';
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const existing = next.find(item => item.id === id && item.size === size && item.color === color);
  if (existing) existing.quantity += safeQuantity;
  else next.push({ id, size, color, quantity: safeQuantity });
  const addedItem = next.find(item => item.id === id && item.size === size && item.color === color);
  if (addedItem && typeof window !== 'undefined') window.localStorage.setItem(LAST_ADDED_CART_ITEM_KEY, JSON.stringify(addedItem));
  write(CART_KEY, next);
  return next;
}

function clearLatestAddedItemIfEmpty(next: CartItem[]) {
  if (next.length === 0 && typeof window !== 'undefined') window.localStorage.removeItem(LAST_ADDED_CART_ITEM_KEY);
}

export function removeFromCart(id: number, size = '', color = '') {
  const next = getCart().filter(item => !(item.id === id && item.size === size && item.color === color));
  clearLatestAddedItemIfEmpty(next);
  write(CART_KEY, next);
  return next;
}

export function clearCart() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(LAST_ADDED_CART_ITEM_KEY);
  write(CART_KEY, []);
  return [];
}

export function updateCartQuantity(id: number, quantity: number, size = '', color = '') {
  const safeQuantity = Math.floor(quantity);
  const next = getCart().flatMap(item => {
    if (item.id !== id || item.size !== size || item.color !== color) return [item];
    return safeQuantity > 0 ? [{ ...item, quantity: safeQuantity }] : [];
  });
  clearLatestAddedItemIfEmpty(next);
  write(CART_KEY, next);
  return next;
}

export function cartItemCount(items = getCart()) { return items.reduce((sum, item) => sum + item.quantity, 0); }

export function getBackInStockSubscriptions() {
  return read<number[]>(BACK_IN_STOCK_KEY, []).filter(id => typeof id === 'number' && Number.isFinite(id));
}

export function toggleBackInStockSubscription(productId: number) {
  const current = getBackInStockSubscriptions();
  const next = current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId];
  write(BACK_IN_STOCK_KEY, next);
  return next;
}
