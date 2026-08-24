import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const headerSource = readFileSync(fileURLToPath(new URL('../client/src/components/SiteHeader.tsx', import.meta.url)), 'utf8');
const brandSource = readFileSync(fileURLToPath(new URL('../client/src/lib/brand.ts', import.meta.url)), 'utf8');
const cssSource = readFileSync(fileURLToPath(new URL('../client/src/index.css', import.meta.url)), 'utf8');

const requiredLabels = [
  'Shop', 'Women', 'Men', 'Kids', 'Jewelry', 'Shoes', 'Trends', 'The Edit',
  'Shop by audience', 'Shop by category', 'Shop by discovery',
  'EXPLORE ALL TRENDS', 'EXPLORE THE EDIT', 'VIEW ALL WOMEN', 'VIEW ALL MEN', 'VIEW ALL KIDS',
  'Search products, brands, trends, or stories...', 'Recent searches', 'Sign In', 'Create Account', 'Logout',
  'Quantity ·', 'Subtotal', 'Continue shopping', 'View bag', 'Checkout',
];

describe('shared SiteHeader specification contract', () => {
  it('keeps all required desktop discovery and commerce labels', () => {
    for (const label of requiredLabels) expect(headerSource).toContain(label);
  });

  it('keeps grouped Search discovery suggestions and query-aware destinations', () => {
    expect(headerSource).toContain('>Products</p>');
    expect(headerSource).toContain('>Categories</p>');
    expect(headerSource).toContain('>Brands</p>');
    expect(headerSource).toContain('>Trending</p>');
    expect(headerSource).toContain('>The Edit</p>');
    expect(headerSource).toContain('matchingProducts');
    expect(headerSource).toContain('matchingCategories');
    expect(headerSource).toContain('matchingBrands');
    expect(headerSource).toContain('matchingTrends');
    expect(headerSource).toContain('matchingEdit');
    expect(headerSource).toContain('href={`/trends#${item.slug}`}');
    expect(headerSource).toContain('href={`/edit/${entry.slug}`}');
  });

  it('surfaces immediate recent and popular Search discovery before typing and allows history clearing', () => {
    expect(headerSource).toContain('data-testid="search-zero-query"');
    expect(headerSource).toContain('data-testid="search-recent-searches"');
    expect(headerSource).toContain('data-testid="search-popular-searches"');
    expect(headerSource).toContain('const popularSearches');
    expect(headerSource).toContain('Your latest searches will appear here');
    expect(headerSource).toContain('data-testid="clear-search-history"');
    expect(headerSource).toContain("localStorage.removeItem('averae-recent-searches')");
    expect(headerSource).toContain('Clear History');
  });

  it('keeps product suggestions visual and Trends carousels respectfully autoplaying', () => {
    const discoverySource = readFileSync(new URL('../client/src/pages/Discovery.tsx', import.meta.url), 'utf8');
    expect(headerSource).toContain('src={product.image}');
    expect(headerSource).toContain('h-10 w-8 shrink-0 object-cover');
    expect(discoverySource).toContain('setApi={setCarouselApi}');
    expect(discoverySource).toContain('window.setInterval(() => carouselApi.scrollNext(), 4500)');
    expect(discoverySource).toContain('onMouseEnter={() => setCarouselPaused(true)}');
    expect(discoverySource).toContain('onMouseLeave={() => setCarouselPaused(false)}');
    expect(discoverySource).toContain('onFocusCapture={() => setCarouselPaused(true)}');
    expect(discoverySource).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(discoverySource).toContain('window.clearInterval(intervalId)');
  });

  it('keeps keyboard and dismissal affordances in the shared shell', () => {
    expect(headerSource).toContain('aria-haspopup="true"');
    expect(headerSource).toContain('aria-expanded={openMenu === key}');
    expect(headerSource).toContain('aria-label="Search"');
    expect(headerSource).toContain('aria-label="Shopping bag"');
    expect(headerSource).toContain("event.key === 'Escape'");
    expect(headerSource).toContain('document.addEventListener(\'pointerdown\'');
    expect(headerSource).toContain('event.target === event.currentTarget');
    expect(headerSource).toContain("if (headerRef.current && !headerRef.current.contains(event.target as Node)) { setOpenMenu(null); setAccountOpen(false); }");
  });

  it('keeps mobile menu sections and bottom navigation available', () => {
    expect(headerSource).toContain('<MobileSection title="Shop"');
    expect(headerSource).toContain('<MobileSection title="Categories"');
    expect(headerSource).toContain('<MobileSection title="Discover"');
    expect(headerSource).toContain('aria-label="Mobile navigation"');
    expect(headerSource).toContain('>Home</span>');
    expect(headerSource).toContain('>Wishlist</span>');
    expect(headerSource).toContain('>Bag</span>');
    expect(brandSource).toContain("label: 'Unisex'");
    expect(brandSource).toContain("label: 'Beauty & Lifestyle'");
  });

  it('keeps the shared header in normal document flow while preserving the fixed mobile navigation', () => {
    expect(headerSource).toContain('className={`relative z-50 border-b');
    expect(headerSource).not.toContain('className={`sticky top-0 z-50 border-b');
    expect(headerSource).toContain('<nav className="fixed inset-x-0 bottom-0 z-30');
  });

  it('keeps Search and no-results discovery copy actionable', () => {
    const shopSource = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
    const discoverySource = readFileSync(new URL('../client/src/pages/Discovery.tsx', import.meta.url), 'utf8');
    expect(shopSource).toContain('No results for');
    expect(shopSource).toContain("suggestedSearches = ['linen', 'essentials', 'bags']");
    expect(shopSource).toContain('Popular categories');
    expect(shopSource).toContain('Trending products');
    expect(shopSource).toContain('New arrivals');
    expect(shopSource).toContain('EXPLORE TRENDING');
    expect(discoverySource).toContain('Trending products');
    expect(discoverySource).toContain('trendCollections.map');
    expect(discoverySource).toContain('{trend.label}');
    expect(discoverySource).toContain('{trend.description}');
    for (const label of ['Trending categories', 'Trending styles', 'Trending colours', 'Trending accessories']) expect(brandSource).toContain(`label: '${label}'`);
    expect(brandSource).toContain('label: "Editor\'s Picks"');
    expect(discoverySource).toContain('EXPLORE TREND');
    expect(discoverySource).toContain('SHOP THE TREND');
    expect(discoverySource).toContain('<Carousel');
    expect(discoverySource).toContain('trend-carousel-${trend.slug}');
    expect(discoverySource).toContain('Share2');
    expect(discoverySource).toContain('navigator.share');
    expect(discoverySource).toContain('Trend link copied.');
  });

  it('keeps preview cards rich, truthful, and keyboard-addressable', () => {
    expect(headerSource).toContain('data-testid="bag-latest-preview"');
    expect(headerSource).toContain('data-testid="wishlist-latest-preview"');
    expect(headerSource).toContain('Recently added');
    expect(headerSource).toContain('Recently saved');
    expect(headerSource).toContain('Shopping bag preview');
    expect(headerSource).toContain('Wishlist preview');
    expect(headerSource).toContain('Your bag is waiting.');
    expect(headerSource).toContain('Keep discovering.');
    expect(headerSource).toContain('href="/checkout"');
    expect(headerSource).toContain('Checkout');
    expect(headerSource).toContain('aria-haspopup="dialog"');
  });

  it('keeps the desktop menu centered and drawers smoothly animated', () => {
    expect(headerSource).toContain('className="flex-1"><Link href="/"');
    expect(headerSource).toContain('hidden flex-1 items-center justify-center gap-5 lg:flex');
    expect(headerSource).toContain("type DrawerKey = 'wishlist' | 'bag'");
    expect(headerSource).toContain('drawerCloseTimerRef');
    expect(headerSource).toContain("window.setTimeout(() => {");
    expect(headerSource).toContain("drawer === 'wishlist'");
    expect(headerSource).toContain("drawer === 'bag'");
    expect(headerSource).toContain('drawer-panel-right');
    expect(headerSource).toContain("drawerVisible ? 'drawer-panel-open' : ''");
    expect(cssSource).toContain('.drawer-backdrop');
    expect(cssSource).toContain('.drawer-panel');
    expect(cssSource).toContain('.drawer-panel-open');
    expect(cssSource).toContain('prefers-reduced-motion: reduce');
  });
});
