import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { audienceCategories, productCategories, products } from '../client/src/lib/brand';

const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');

describe('Shop UX Refinement Part 2', () => {
  it('exposes the required browse hierarchy and result-count copy', () => {
    expect(shopSource).toContain('Discover Áveraẹ');
    expect(shopSource).toContain('Explore fashion, accessories and lifestyle products');
    expect(shopSource).toContain("{shown.length === 1 ? 'product' : 'products'}");
    expect(audienceCategories.map(item => item.label)).toEqual(['Women', 'Men', 'Kids', 'Unisex']);
    expect(productCategories.map(item => item.label)).toContain('Watches');
  });

  it('keeps the default toolbar compact and exposes a dedicated responsive filter panel', () => {
    expect(shopSource).toContain('Search products...');
    expect(shopSource).toContain('FILTERS');
    expect(shopSource).toContain('SORT BY:');
    expect(shopSource).toContain('data-testid="apply-filters"');
    expect(shopSource).toContain('data-testid="clear-panel-filters"');
    expect(shopSource).toContain('onClick={applyFilters}');
    expect(shopSource).toContain('Product filters');
    expect(shopSource).toContain('Human Hair');
    expect(shopSource).toContain('Vintage / Statement Pieces');
    expect(shopSource).not.toContain('hidden flex-1 items-center gap-4 md:flex');
  });

  it('contains every requested filter and sort vocabulary', () => {
    for (const label of ['Audience', 'Category', 'Size', 'Colour', 'Price', 'Brand', 'Collection', 'Availability', 'Rating', 'Trend status']) {
      expect(shopSource).toContain(label);
    }
    for (const label of ['Recommended', 'Newest', 'Trending', 'Best Selling', 'Price: Low to High', 'Price: High to Low']) {
      expect(shopSource).toContain(label);
    }
    expect(shopSource).toContain('Clear all');
    expect(shopSource).toContain('aria-pressed');
  });

  it('defines logical audience subcategories without introducing empty product contracts', () => {
    for (const label of ['Dresses', 'Tops', 'Trousers', 'Outerwear', 'Shirts', 'Sets']) {
      expect(shopSource).toContain(label);
    }
    expect(products.every(product => product.sizes.length > 0 && product.colors.length > 0)).toBe(true);
  });

  it('keeps product actions safe for variant-required and no-variant products', () => {
    expect(shopSource).toContain('requiresOptions');
    expect(shopSource).toContain('Select options');
    expect(shopSource).toContain('Quick add');
    expect(shopSource).toContain('addToCart(p.id,');
    expect(shopSource).toContain('Quick view');
    expect(shopSource).toContain('added to bag');
    expect(shopSource).toContain('compareAt');
    expect(shopSource).toContain('trendStatus');
    expect(shopSource).toContain('options.brands');
    expect(shopSource).toContain('options.collections');
    expect(shopSource).toContain("filters.rating === 'Not yet rated'");
  });

  it('provides realistic product-owned metadata without fabricated customer ratings', () => {
    expect(new Set(products.map(product => product.brand)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(products.map(product => product.collection)).size).toBeGreaterThanOrEqual(5);
    expect(products.every(product => product.brand.length > 2 && product.collection.length > 2)).toBe(true);
    expect(products.every(product => product.rating === null && product.ratingCount === 0)).toBe(true);
  });
});
