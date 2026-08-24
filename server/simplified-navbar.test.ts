import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const headerSource = readFileSync(resolve(process.cwd(), 'client/src/components/SiteHeader.tsx'), 'utf8');

function hasRoute(route: string) {
  return headerSource.includes(route);
}

describe('simplified navbar specification', () => {
  it('limits the desktop primary navigation to Shop, Trends, and The Edit', () => {
    expect(headerSource).toContain("const primaryMenuKeys: MenuKey[] = ['shop', 'trends', 'edit'];");
    expect(headerSource).toContain('aria-label="Main navigation"');
    expect(headerSource).toContain('menuLabels[key]');
  });

  it('keeps the full marketplace taxonomy reachable from the Shop menu', () => {
    for (const label of ['Shop by audience', 'Shop by category', 'Shop by discovery', 'Human Hair', 'Blend Hair', 'Packet Hair', 'Vintage / Statement Pieces']) {
      expect(headerSource).toContain(label);
    }
    expect(headerSource).toContain('const audienceLinks = audienceCategories.map');
    expect(headerSource).toContain('const categoryLinks = productCategories.map');
    expect(headerSource).toContain("item.slug === 'hair' || item.slug === 'thrift-wear' ? `/${item.slug}` : `/shop?category=${item.slug}`");
    for (const route of ['/hair', '/thrift-wear', '/shop?category=hair', '/shop?category=thrift-wear', '/shop?sort=new', '/shop?sort=popular', '/shop?sale=true']) {
      expect(hasRoute(route)).toBe(true);
    }
  });

  it('keeps discovery destinations in the Shop menu and dedicated primary menus', () => {
    for (const route of ['/shop?sort=new', '/trends', '/shop?sort=popular', '/trends#editors-picks', '/shop?sale=true', '/edit']) {
      expect(hasRoute(route)).toBe(true);
    }
    expect(headerSource).toContain('<MobileSection title="Trends" links={menuLinks.trends}');
    expect(headerSource).toContain('<MobileSection title="The Edit" links={menuLinks.edit}');
  });

  it('renders a deliberate mobile menu with Shop, Trends, and The Edit sections', () => {
    expect(headerSource).toContain('<MobileSection title="Shop"');
    expect(headerSource).toContain('...audienceLinks, ...categoryLinks, ...hairSubcategoryLinks, ...thriftSubcategoryLinks, ...shopDiscoveryLinks');
    expect(headerSource).toContain('aria-label="Open menu"');
    expect(headerSource).toContain('aria-label="Close menu"');
  });

  it('supports Escape and outside-click dismissal for open navigation surfaces', () => {
    expect(headerSource).toMatch(/event\.key\s*===\s*['"]Escape['"]/);
    expect(headerSource).toMatch(/document\.addEventListener\(['"]pointerdown['"]/);
    expect(headerSource).toContain('setOpenMenu(null)');
  });
});

