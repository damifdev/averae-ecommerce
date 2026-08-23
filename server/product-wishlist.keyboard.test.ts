import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const productDetail = readFileSync(new URL('../client/src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
const wishlistPanel = readFileSync(new URL('../client/src/components/WishlistPanel.tsx', import.meta.url), 'utf8');

describe('Product Detail and Wishlist keyboard contracts', () => {
  it('keeps Product Detail choices and gallery actions native and focusable', () => {
    expect(productDetail).toContain('role="group" aria-label="Colour options"');
    expect(productDetail).toContain('role="group" aria-label="Size options"');
    expect(productDetail).toContain('aria-label="Previous product image"');
    expect(productDetail).toContain('aria-label="Next product image"');
    expect(productDetail).toContain('role="tablist" aria-label="Product image thumbnails"');
    expect(productDetail.match(/<button type="button"/g)?.length).toBeGreaterThanOrEqual(10);
    expect(productDetail).toContain('data-testid="size-guide"');
    expect(productDetail).toContain('data-testid="buy-now"');
  });

  it('keeps post-add confirmation and Wishlist actions keyboard-reachable', () => {
    expect(productDetail).toContain('CONTINUE SHOPPING');
    expect(productDetail).toContain('VIEW BAG');
    expect(wishlistPanel).toContain('aria-label={`Remove ${product.name} from wishlist`}');
    expect(wishlistPanel).toContain('MOVE TO BAG');
    expect(wishlistPanel.match(/type="button"/g)?.length).toBeGreaterThanOrEqual(5);
    expect(wishlistPanel).toContain('disabled={!isSizeAvailable(product, size)}');
  });
});
