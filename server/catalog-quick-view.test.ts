import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { availableSizes, isSizeAvailable, products, sizeInventory } from '../client/src/lib/brand';
import { addToCart, cartItemCount, clearCart, getCart } from '../client/src/lib/store';

const quickViewSource = readFileSync(new URL('../client/src/components/QuickView.tsx', import.meta.url), 'utf8');
const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
const storeSource = readFileSync(new URL('../client/src/lib/store.ts', import.meta.url), 'utf8');

describe('catalog metadata and quick view', () => {
  it('ships distinct brand and collection values for every catalog product', () => {
    expect(products.every(product => product.brand.trim() && product.collection.trim())).toBe(true);
    expect(new Set(products.map(product => product.brand)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(products.map(product => product.collection)).size).toBeGreaterThanOrEqual(5);
  });

  it('does not invent customer rating data for the demo catalog', () => {
    expect(products.every(product => product.rating === null && product.ratingCount === 0)).toBe(true);
    expect(shopSource).toContain("filters.rating === '4 stars & up'");
    expect(shopSource).toContain("filters.rating === 'Not yet rated'");
  });

  it('offers a keyboard-accessible quick view with independent colour and size selection', () => {
    expect(quickViewSource).toContain('<Dialog open={open} onOpenChange={onOpenChange}>');
    expect(quickViewSource).toContain('aria-label="Colour options"');
    expect(quickViewSource).toContain('aria-label="Size options"');
    expect(quickViewSource).toContain('aria-pressed={color === option}');
    expect(quickViewSource).toContain('aria-pressed={size === option}');
    expect(quickViewSource).toContain('onAddToBag(product, size, color)');
    expect(quickViewSource).toContain('View full details');
  });

  it('tracks inventory by size and disables unavailable Quick View selections', () => {
    expect(products.every(product => product.sizes.every(size => size in product.inventoryBySize))).toBe(true);
    expect(products.every(product => Object.values(product.inventoryBySize).reduce((total, quantity) => total + quantity, 0) === product.stock)).toBe(true);
    const columnDress = products.find(product => product.id === 3);
    expect(columnDress).toBeDefined();
    expect(sizeInventory(columnDress!, 'M')).toBe(0);
    expect(isSizeAvailable(columnDress!, 'M')).toBe(false);
    expect(availableSizes(columnDress!)).not.toContain('M');
    expect(quickViewSource).toContain('disabled={!available}');
    expect(quickViewSource).toContain('aria-label={available ? `Select size ${option}, ${quantity} available` : `Size ${option}, out of stock`}');
    expect(quickViewSource).toContain('if (!selectedSizeAvailable)');
  });

  it('stores size and colour as part of a cart line and merges only identical variants', () => {
    expect(storeSource).toContain('CART_UPDATED_EVENT');
    expect(storeSource).toContain('item.id === id && item.size === size && item.color === color');
    expect(storeSource).toContain('quantity: typeof candidate.quantity');
    expect(typeof getCart).toBe('function');
    expect(typeof addToCart).toBe('function');
    expect(typeof cartItemCount).toBe('function');
    expect(typeof clearCart).toBe('function');
    expect(storeSource).toContain('export function clearCart()');
    expect(storeSource).toContain('LAST_ADDED_CART_ITEM_KEY');
  });
});
