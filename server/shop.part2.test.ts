import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { audienceCategories, productCategories, products } from '../client/src/lib/brand';

const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
const globalStyles = readFileSync(new URL('../client/src/index.css', import.meta.url), 'utf8');

describe('Shop UX Refinement Part 2', () => {
  it('exposes the required browse hierarchy and result-count copy', () => {
    expect(shopSource).toContain('Discover Áveraẹ');
    expect(shopSource).toContain('Explore fashion, accessories and lifestyle products');
    expect(shopSource).toContain("{shown.length === 1 ? 'product' : 'products'}");
    expect(audienceCategories.map(item => item.label)).toEqual(['Women', 'Men', 'Kids', 'Unisex']);
    expect(productCategories.map(item => item.label)).toContain('Watches');
  });

  it('initializes the base Shop route from the reactive location without stale query state', () => {
    expect(shopSource).toContain('function parseShopLocation(location: string)');
    expect(shopSource).toContain('const locationWithSearch = useMemo(() => typeof window === \'undefined\' ? location : `${window.location.pathname}${window.location.search}`, [location, urlRevision]);');
    expect(shopSource).toContain('const params = useMemo(() => parseShopLocation(locationWithSearch), [locationWithSearch]);');
    expect(shopSource).not.toContain("window.sessionStorage.setItem('averae-last-shop-url', location)");
    expect(shopSource).toContain('getAudienceFromParams(params)');
    expect(shopSource).toContain('getCategoryFromParams(params)');
    expect(shopSource).toContain('const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(params));');
    expect(shopSource).toContain('setFilters(nextFilters);');
  });

  it('normalizes unknown or stale route values back to the neutral Shop state', () => {
    expect(shopSource).toContain("return match?.label ?? 'All';");
    expect(shopSource).toContain("const categoryAudience = !explicitAudience && isAudienceValue(params.get('category')) ? params.get('category') : null;");
    expect(shopSource).toContain("return normalizeCategory(isAudienceValue(params.get('category')) ? null : params.get('category'));");
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

  it('keeps the Shop search field borderless with a quiet shell focus state', () => {
    expect(shopSource).toContain('shop-search-shell');
    expect(shopSource).toContain('shop-search-input');
    expect(shopSource).toContain('focus:border-transparent');
    expect(shopSource).toContain('focus:outline-none');
    expect(shopSource).toContain('focus:ring-0');
    expect(shopSource).toContain('hover:border-[#382820]');
    expect(shopSource).toContain('hover:bg-[#F6F0E6]');
    expect(shopSource).toContain('transition-[background-color,border-color,box-shadow]');
    expect(globalStyles).toContain('.shop-search-input:focus-visible');
    expect(globalStyles).toContain('outline: none !important;');
    expect(globalStyles).toContain('.shop-search-shell:focus-within');
  });

  it('keeps the FILTERS control lightweight and separates the active count', () => {
    expect(shopSource).toContain('data-testid="filter-control-label">FILTERS</span>');
    expect(shopSource).toContain('data-testid="active-filter-count"');
    expect(shopSource).toContain('aria-pressed={activeFilterCount > 0}');
    expect(shopSource).toContain('filter-control-active');
    expect(shopSource).toContain('SlidersHorizontal size={13}');
    expect(shopSource).not.toContain('` (${activeFilterCount})`');
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
