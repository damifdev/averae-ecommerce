const WISHLIST_KEY = 'averae-wishlist';
const CART_KEY = 'averae-cart';

function read(key: string): number[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]') as number[]; } catch { return []; }
}
function write(key: string, value: number[]) { if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value)); }
export function getWishlist() { return read(WISHLIST_KEY); }
export function toggleWishlist(id: number) { const next = read(WISHLIST_KEY); const value = next.includes(id) ? next.filter(item => item !== id) : [...next, id]; write(WISHLIST_KEY, value); return value; }
export function addToCart(id: number) { const next = read(CART_KEY); if (!next.includes(id)) next.push(id); write(CART_KEY, next); return next; }
export function getCart() { return read(CART_KEY); }
