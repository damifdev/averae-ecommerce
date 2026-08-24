import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { editorialEntries, editorialTaxonomy, lookCollections, products } from '../client/src/lib/brand';

const discoverySource = readFileSync(new URL('../client/src/pages/Discovery.tsx', import.meta.url), 'utf8');

describe('UX Refinement Part 5 — editorial experience', () => {
  it('exposes the complete Edit taxonomy', () => {
    expect(editorialTaxonomy).toEqual(['Trends', 'Style Guides', 'Fashion', 'Culture', 'African Fashion', 'Accessories', 'Inspiration', 'Shopping Guides']);
    expect(editorialEntries.map(entry => entry.category)).toEqual(expect.arrayContaining(editorialTaxonomy));
  });

  it('provides article-card and article-page metadata for every story', () => {
    expect(editorialEntries.length).toBeGreaterThanOrEqual(8);
    expect(editorialEntries.every(entry => entry.image && entry.title && entry.description && entry.readingTime && entry.date && entry.author)).toBe(true);
    expect(editorialEntries.every(entry => entry.content.length >= 2 && entry.relatedProductIds.length > 0 && entry.relatedArticleSlugs.length > 0)).toBe(true);
  });

  it('keeps all editorial product links tied to real catalog products', () => {
    expect(editorialEntries.every(entry => entry.relatedProductIds.every(id => products.some(product => product.id === id)))).toBe(true);
    expect(editorialEntries.every(entry => entry.lookProductIds.every(id => products.some(product => product.id === id)))).toBe(true);
    expect(lookCollections.every(look => look.productIds.every(id => products.some(product => product.id === id)))).toBe(true);
  });

  it('supports all four audience-specific looks and purchase-safe actions', () => {
    expect(lookCollections.map(look => look.audience)).toEqual(['Women', 'Men', 'Kids', 'Unisex']);
    expect(discoverySource).toContain('SHOP THIS LOOK');
    expect(discoverySource).toContain('SHOP RELATED PRODUCTS');
    expect(discoverySource).toContain('ADD TO BAG');
    expect(discoverySource).toContain('ADD ALL TO BAG');
    expect(discoverySource).toContain('availableSizes(product)');
  });

  it('uses clear editorial navigation and article CTAs', () => {
    expect(discoverySource).toContain('aria-label="Edit categories"');
    expect(discoverySource).toContain('READ ARTICLE');
    expect(discoverySource).toContain('Breadcrumb');
    expect(discoverySource).toContain('Related articles.');
    expect(discoverySource).toContain('Shop related products.');
  });
});
