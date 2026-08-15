import { describe, expect, it } from 'vitest';
import { brand, formatPrice, products } from '../client/src/lib/brand';

describe('AVERAE catalog foundation', () => {
  it('uses the configured Nigerian currency formatter', () => {
    expect(formatPrice(68000)).toBe('₦68,000');
    expect(brand.country).toBe('Nigeria');
  });

  it('has sellable catalog items with variant options', () => {
    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(products.every(product => product.sizes.length > 0 && product.colors.length > 0)).toBe(true);
  });
});
