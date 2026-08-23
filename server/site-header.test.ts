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
  'Search products, brands, trends...', 'Recent searches', 'Sign In', 'Create Account', 'Logout',
  'Quantity ·', 'Subtotal', 'Continue shopping', 'View bag', 'Checkout',
];

describe('shared SiteHeader specification contract', () => {
  it('keeps all required desktop discovery and commerce labels', () => {
    for (const label of requiredLabels) expect(headerSource).toContain(label);
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
