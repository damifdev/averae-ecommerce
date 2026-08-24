import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
const cartSource = readFileSync(new URL('../client/src/pages/Cart.tsx', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../client/src/components/SiteHeader.tsx', import.meta.url), 'utf8');
const storeSource = readFileSync(new URL('../client/src/lib/store.ts', import.meta.url), 'utf8');
const dialogSource = readFileSync(new URL('../client/src/components/ClearBagDialog.tsx', import.meta.url), 'utf8');

describe('Shop naming and bag clearing', () => {
  it('uses the requested discovery-led Shop heading', () => {
    expect(shopSource).toContain("'Discover Áveraẹ'");
    expect(shopSource).toContain('Fashion discovery meets shopping');
  });

  it('exposes individual removal, undo, and confirmation-backed clear actions on the cart page', () => {
    expect(cartSource).toContain('restoreCartItem');
    expect(cartSource).toContain("action: {\n        label: 'Undo'");
    expect(cartSource).toContain('data-testid="clear-bag"');
    expect(cartSource).toContain('setClearDialogOpen(true)');
    expect(cartSource).toContain('<ClearBagDialog');
    expect(cartSource).toContain("toast.success('Bag cleared'");
    expect(cartSource).toContain('data-testid={`remove-bag-item-');
  });

  it('keeps the header bag drawer synchronized with the same clear, remove, and feedback actions', () => {
    expect(headerSource).toContain('clearCart');
    expect(headerSource).toContain('removeFromCart');
    expect(headerSource).toContain('restoreCartItem');
    expect(headerSource).toContain('data-testid="clear-bag-drawer"');
    expect(headerSource).toContain('setClearBagDialogOpen(true)');
    expect(headerSource).toContain('<ClearBagDialog');
    expect(headerSource).toContain('data-testid={`remove-drawer-bag-item-');
    expect(headerSource).toContain("toast.success('Bag cleared'");
  });

  it('provides an accessible confirmation dialog for destructive clearing', () => {
    expect(dialogSource).toContain('Clear your bag?');
    expect(dialogSource).toContain('data-testid="clear-bag-cancel"');
    expect(dialogSource).toContain('data-testid="clear-bag-confirm"');
    expect(dialogSource).toContain('Keep selections');
  });

  it('clears persisted cart lines and stale latest-added preview metadata', () => {
    expect(storeSource).toContain('export function clearCart()');
    expect(storeSource).toContain('export function restoreCartItem(item: CartItem)');
    expect(storeSource).toContain("window.localStorage.removeItem(LAST_ADDED_CART_ITEM_KEY)");
    expect(storeSource).toContain('write(CART_KEY, [])');
    expect(storeSource).toContain('CART_UPDATED_EVENT');
  });
});
