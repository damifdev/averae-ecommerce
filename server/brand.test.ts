import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { audienceCategories, brand, editorialEntries, featuredLook, formatPrice, heroContent, productCategories, products, trendItems } from '../client/src/lib/brand';

describe('AVERAE catalog foundation', () => {
  it('uses the configured Nigerian currency formatter', () => {
    expect(formatPrice(68000)).toBe('₦68,000');
    expect(brand.country).toBe('Nigeria');
  });

  it('has sellable catalog items with variant options', () => {
    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(products.every(product => product.sizes.length > 0 && product.colors.length > 0)).toBe(true);
  });

  it('defines separate audience and product-category pathways with linked Shop the Look products', () => {
    expect(audienceCategories.map(category => category.label)).toEqual(['Women', 'Men', 'Kids', 'Unisex']);
    expect(audienceCategories.map(category => category.slug)).toEqual(['women', 'men', 'kids', 'unisex']);
    expect(productCategories.map(category => category.label)).toEqual([
      'Clothing', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'Watches', 'Beauty & Lifestyle',
    ]);
    expect(productCategories.map(category => category.slug)).toEqual([
      'clothing', 'shoes', 'bags', 'jewelry', 'accessories', 'watches', 'beauty-lifestyle',
    ]);
    expect(featuredLook.productIds.every(id => products.some(product => product.id === id))).toBe(true);
  });

  it('exposes distinct homepage discovery journeys and actionable trend/editorial links', () => {
    expect(heroContent.primaryCta).toBe('SHOP NOW');
    expect(heroContent.secondaryCta).toBe('EXPLORE TRENDS');
    expect(trendItems).toHaveLength(4);
    expect(trendItems.every(item => ['Trending', 'New', "Editor's Pick", 'Popular'].includes(item.label))).toBe(true);
    expect(trendItems.every(item => products.some(product => product.id === item.productId))).toBe(true);
    expect(editorialEntries.every(entry => entry.slug.length > 0)).toBe(true);
  });

  it('keeps every marketplace department browseable in the demo catalog', () => {
    const departmentLabels = productCategories.map(category => category.label);
    expect(departmentLabels.every(label => products.some(product => product.category === label || (label === 'Clothing' && product.category === 'Ready to Wear')))).toBe(true);
    expect(products.some(product => product.audiences.includes('Kids'))).toBe(true);
  });

  it('keeps homepage hero and product hover affordances readable', () => {
    const homeSource = readFileSync(new URL('../client/src/pages/Home.tsx', import.meta.url), 'utf8');
    expect(homeSource).toContain('object-cover object-top');
    expect(homeSource).toContain('hover:bg-[#382820] hover:text-[#FFFDF8]');
    expect(homeSource).toContain('>View product</Link>');
  });
});
