import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { availableSizes, products } from '../client/src/lib/brand';

const productDetail = readFileSync(new URL('../client/src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
const wishlistPanel = readFileSync(new URL('../client/src/components/WishlistPanel.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../client/src/App.tsx', import.meta.url), 'utf8');

 describe('Product Detail and Wishlist Part 3 contracts', () => {
  it('keeps inventory-derived available sizes truthful', () => {
    const columnDress = products.find(product => product.id === 3);
    expect(columnDress).toBeDefined();
    expect(availableSizes(columnDress!)).toEqual(['XS', 'S', 'L']);
    expect(productDetail).toContain("Please select a size.");
    expect(productDetail).toContain('disabled={unavailable}');
    expect(productDetail).toContain('Currently unavailable');
  });

  it('exposes the requested purchase hierarchy and supporting flows', () => {
    for (const copy of ['ADD TO BAG', 'BUY NOW', 'Added to your bag', 'CONTINUE SHOPPING', 'VIEW BAG', 'Size guide', 'Delivery', 'Returns', 'Materials & care']) {
      expect(productDetail).toContain(copy);
    }
    expect(productDetail).toContain('Open enlarged product image');
    expect(productDetail).toContain('Swipe to explore images');
    expect(productDetail).toContain('Please select a size.');
    expect(productDetail).toContain('data-testid="buy-now"');
    expect(productDetail).toContain('onTouchEnd');
    expect(productDetail).toContain('CONTINUE SHOPPING');
    expect(productDetail).toContain('VIEW BAG');
  });

  it('provides a dedicated wishlist page with saved-product, price-state, and empty-state journeys', () => {
    expect(app).toContain('path="/wishlist" component={Wishlist}');
    for (const copy of ['MOVE TO BAG', 'Currently unavailable', 'EXPLORE NEW ARRIVALS', 'EXPLORE TRENDS', 'aria-label={`Remove ${product.name} from wishlist`}']) {
      expect(wishlistPanel).toContain(copy);
    }
    expect(wishlistPanel).toContain('disabled={!isSizeAvailable(product, size)}');
    expect(wishlistPanel).toContain('addToCart(product.id, selection)');
    expect(wishlistPanel).toContain("toggleWishlist(id)");
    expect(wishlistPanel).toContain('data-testid="wishlist-price-change"');
    expect(wishlistPanel).toContain('Price reduced');
    expect(wishlistPanel).toContain('type="button"');
  });
});
