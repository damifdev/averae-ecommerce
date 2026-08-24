import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
const cartSource = readFileSync(new URL('../client/src/pages/Cart.tsx', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../client/src/components/SiteHeader.tsx', import.meta.url), 'utf8');
const storeSource = readFileSync(new URL('../client/src/lib/store.ts', import.meta.url), 'utf8');

describe('Shop naming and bag clearing', () => {
  it('uses the requested discovery-led Shop heading', () => {
    expect(shopSource).toContain("'Discover Áveraẹ'");
    expect(shopSource).toContain('Fashion discovery meets shopping');
  });

  it('exposes individual removal and clear-all actions on the cart page', () => {
    expect(cartSource).toContain("import { CART_UPDATED_EVENT, cartItemCount, clearCart");
    expect(cartSource).toContain('data-testid="clear-bag"');
    expect(cartSource).toContain('data-testid={`remove-bag-item-');
    expect(cartSource).toContain('const clearBag = () => setItems(clearCart())');
  });

  it('keeps the header bag drawer synchronized with the same clear and remove actions', () => {
    expect(headerSource).toContain('clearCart');
    expect(headerSource).toContain('removeFromCart');
    expect(headerSource).toContain('data-testid="clear-bag-drawer"');
    expect(headerSource).toContain('data-testid={`remove-drawer-bag-item-');
  });

  it('clears persisted cart lines and stale latest-added preview metadata', () => {
    expect(storeSource).toContain('export function clearCart()');
    expect(storeSource).toContain("window.localStorage.removeItem(LAST_ADDED_CART_ITEM_KEY)");
    expect(storeSource).toContain('write(CART_KEY, [])');
    expect(storeSource).toContain('CART_UPDATED_EVENT');
  });
});
