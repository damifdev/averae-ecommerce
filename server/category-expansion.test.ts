import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { productCategories, categoryFilterOptions, trendCollections } from '../client/src/lib/brand';

describe('Hair and Thrift Wear category expansion', () => {
  it('defines both categories with the requested subcategories and facets', () => {
    const hair = productCategories.find(category => category.slug === 'hair');
    const thrift = productCategories.find(category => category.slug === 'thrift-wear');
    expect(hair?.subcategories).toEqual(['Human Hair', 'Blend Hair', 'Packet Hair']);
    expect(hair?.filters).toEqual(['length', 'texture', 'colour', 'style', 'price', 'availability']);
    expect(thrift?.subcategories).toEqual(['Thrift Women', 'Thrift Men', 'Thrift Kids', 'Vintage / Statement Pieces']);
    expect(thrift?.filters).toEqual(['size', 'colour', 'condition', 'price', 'availability']);
    expect(categoryFilterOptions.condition).toContain('Excellent');
  });

  it('keeps the new discovery routes in shared navigation and search suggestions', () => {
    const header = readFileSync(new URL('../client/src/components/SiteHeader.tsx', import.meta.url), 'utf8');
    const home = readFileSync(new URL('../client/src/pages/Home.tsx', import.meta.url), 'utf8');
    expect(header).toContain("/shop?category=hair");
    expect(header).toContain("/shop?category=thrift-wear");
    expect(header).toContain("label: 'Human hair'");
    expect(header).toContain("label: 'Thrift wear'");
    expect(home).toContain("['Hair', '/shop?category=hair']");
    expect(home).toContain("['Thrift Wear', '/shop?category=thrift-wear']");
  });

  it('adds Hair and Thrift Wear to trend discovery without inventing products', () => {
    expect(trendCollections.find(collection => collection.slug === 'hair-edit')?.shopHref).toBe('/shop?category=hair');
    expect(trendCollections.find(collection => collection.slug === 'thrift-wear')?.shopHref).toBe('/shop?category=thrift-wear');
    expect(trendCollections.find(collection => collection.slug === 'hair-edit')?.productIds).toEqual([]);
    expect(trendCollections.find(collection => collection.slug === 'thrift-wear')?.productIds).toEqual([]);
  });
});
