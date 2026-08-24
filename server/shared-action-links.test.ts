import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const productDetail = readFileSync(new URL('../client/src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
const siteHeader = readFileSync(new URL('../client/src/components/SiteHeader.tsx', import.meta.url), 'utf8');
const cart = readFileSync(new URL('../client/src/pages/Cart.tsx', import.meta.url), 'utf8');
const checkout = readFileSync(new URL('../client/src/pages/Checkout.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../client/src/pages/Home.tsx', import.meta.url), 'utf8');
const quickView = readFileSync(new URL('../client/src/components/QuickView.tsx', import.meta.url), 'utf8');
const wishlistPanel = readFileSync(new URL('../client/src/components/WishlistPanel.tsx', import.meta.url), 'utf8');
const shop = readFileSync(new URL('../client/src/pages/Shop.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../client/src/index.css', import.meta.url), 'utf8');

describe('shared filled action-link contrast', () => {
  it('keeps the Product Detail confirmation actions explicitly labelled and readable', () => {
    expect(productDetail).toContain('className="action-link-dark border border-[#382820]');
    expect(productDetail).toContain('className="action-link-light bg-[#382820]');
    expect(productDetail).toContain('>CONTINUE SHOPPING</Link>');
    expect(productDetail).toContain('>VIEW BAG</Link>');
  });

  it('keeps the persistent bag drawer action readable on every storefront route', () => {
    expect(siteHeader).toContain('className="action-link-light bg-[#382820]');
    expect(siteHeader).toContain('>View bag</Link>');
  });

  it('covers every filled cocoa action surface with the shared readable class', () => {
    expect(cart).toContain('action-link-light pressable bg-[#382820]');
    expect(cart).toContain('action-link-light pressable flex items-center justify-center gap-3 bg-[#382820]');
    expect(checkout).toContain('action-link-light bg-[#382820]');
    expect(home).toContain('action-link-light focus-ring product-card-overlay');
    expect(quickView).toContain('action-link-light pressable flex w-full items-center');
    expect(wishlistPanel).toContain('action-link-light pressable mt-5 flex w-full');
    expect(shop).toContain('action-link-light product-card-action');
    expect(shop).toContain('action-link-light bg-[#382820] py-3');
  });

  it('defines explicit cocoa and ivory label colors that win over inherited anchor color', () => {
    expect(styles).toContain('.action-link-light');
    expect(styles).toContain('color: #FFFDF8 !important;');
    expect(styles).toContain('.action-link-dark');
    expect(styles).toContain('color: #382820 !important;');
  });
});
