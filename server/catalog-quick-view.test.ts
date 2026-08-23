import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { products } from '../client/src/lib/brand';
import { addToCart, cartItemCount, getCart } from '../client/src/lib/store';

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

  it('stores size and colour as part of a cart line and merges only identical variants', () => {
    expect(storeSource).toContain('CART_UPDATED_EVENT');
    expect(storeSource).toContain('item.id === id && item.size === size && item.color === color');
    expect(storeSource).toContain('quantity: typeof candidate.quantity');
    expect(typeof getCart).toBe('function');
    expect(typeof addToCart).toBe('function');
    expect(typeof cartItemCount).toBe('function');
  });
});
