import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('Final UX audit contracts', () => {
  it('keeps discovery destinations truthful and actionable', () => {
    const header = read('components/SiteHeader.tsx');
    const home = read('pages/Home.tsx');
    const shop = read('pages/Shop.tsx');
    expect(header).toContain("{ label: 'New Arrivals', href: '/shop?sort=new' }");
    expect(header).toContain("{ label: 'Sale', href: '/shop?sale=true' }");
    expect(header).toContain('African contemporary');
    expect(home).toContain('id="shop-the-look"');
    expect(shop).toContain("params.get('sort') === 'new' || params.get('sort') === 'newest'");
    expect(shop).toContain("params.get('sale') === 'true'");
    expect(shop).toContain("product => !saleOnly || Boolean(product.compareAt) || product.badge === 'Sale'");
  });

  it('provides contextual breadcrumbs and editorial deep-link filtering', () => {
    const discovery = read('pages/Discovery.tsx');
    expect(discovery).toContain('aria-label="Breadcrumb"');
    expect(discovery).toContain('The Edit');
    expect(discovery).toContain('requested = new URLSearchParams');
    expect(discovery).toContain('setActiveCategory(matched ?? \'All\')');
  });

  it('exposes purchase-safe quick view on discovery and search product surfaces', () => {
    const discovery = read('pages/Discovery.tsx');
    const shop = read('pages/Shop.tsx');
    const quickView = read('components/QuickView.tsx');
    const analytics = read('lib/analytics.ts');
    expect(discovery).toContain('data-testid={`discovery-quick-view-${product.id}`}');
    expect(discovery).toContain('QUICK VIEW');
    expect(discovery).toContain('<QuickView product={product}');
    expect(discovery).toContain('data-testid={`look-hotspot');
    expect(discovery).toContain('setQuickViewProduct(product)');
    expect(discovery).toContain('<QuickView product={quickViewProduct}');
    expect(discovery).toContain('addToCart(product.id, { size, color })');
    expect(shop).toContain("surface={query.trim() ? 'search_results' : 'shop'}");
    expect(shop).toContain('onQuickView={setQuickViewProduct}');
    expect(quickView).toContain('data-testid="quick-view-view-bag"');
    expect(quickView).toContain('href="/cart"');
    expect(analytics).toContain("'quick_view_open'");
    expect(analytics).toContain("'quick_view_variant_select'");
    expect(analytics).toContain("'quick_view_add_to_bag'");
  });

  it('provides useful recovery states without fabricated customer content', () => {
    const header = read('components/SiteHeader.tsx');
    const account = read('pages/Account.tsx');
    const cart = read('pages/Cart.tsx');
    expect(header).toContain('Add a piece and it will appear here.');
    expect(header).toContain('Explore trends');
    expect(account).toContain('No orders yet.');
    expect(account).toContain('When you place an order, its details and delivery updates will appear here.');
    expect(account).toContain('View full details');
    expect(cart).toContain('href="/shop?sort=new"');
  });
});
