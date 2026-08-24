import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { products, categoryLandingPages } from '../client/src/lib/brand';

describe('Hair and Thrift Wear content expansion', () => {
  it('ships realistic sample products across the requested Hair subcategories', () => {
    const hair = products.filter(product => product.category === 'Hair');
    expect(hair).toHaveLength(3);
    expect(hair.map(product => `${product.name} ${product.texture} ${product.length}`)).toEqual(expect.arrayContaining([
      expect.stringContaining('Human'),
      expect.stringContaining('Blend'),
      expect.stringContaining('Packet'),
    ]));
    expect(hair.every(product => product.stock > 0)).toBe(true);
  });

  it('makes Thrift Wear availability explicit, including a sold-out one-of-a-kind item', () => {
    const thrift = products.filter(product => product.category === 'Thrift Wear');
    expect(thrift).toHaveLength(3);
    expect(thrift.some(product => product.stock === 1)).toBe(true);
    expect(thrift.some(product => product.stock === 0 && product.badge === 'Currently unavailable')).toBe(true);
    expect(thrift.every(product => product.condition)).toBe(true);
  });

  it('defines dedicated editorial landing content and Notify Me hooks', () => {
    expect(categoryLandingPages.hair.image).toContain('hair-editorial');
    expect(categoryLandingPages['thrift-wear'].image).toContain('thrift-editorial');
    expect(categoryLandingPages.hair.subcategories).toEqual(['Human Hair', 'Blend Hair', 'Packet Hair']);
    expect(categoryLandingPages['thrift-wear'].subcategories).toContain('Vintage / Statement Pieces');
    const landingSource = readFileSync(new URL('../client/src/pages/CategoryLanding.tsx', import.meta.url), 'utf8');
    const detailSource = readFileSync(new URL('../client/src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
    expect(landingSource).toContain("'Notify Me'");
    expect(detailSource).toContain("product.category === 'Thrift Wear' && itemUnavailable");
    expect(detailSource).toContain('toggleBackInStockSubscription');
  });
});
