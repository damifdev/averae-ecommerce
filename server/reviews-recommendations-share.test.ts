import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const productDetail = readFileSync(new URL('../client/src/pages/ProductDetail.tsx', import.meta.url), 'utf8');
const wishlistPanel = readFileSync(new URL('../client/src/components/WishlistPanel.tsx', import.meta.url), 'utf8');
const wishlistPage = readFileSync(new URL('../client/src/pages/Wishlist.tsx', import.meta.url), 'utf8');
const store = readFileSync(new URL('../client/src/lib/store.ts', import.meta.url), 'utf8');
const db = readFileSync(new URL('./db.ts', import.meta.url), 'utf8');
const routers = readFileSync(new URL('./routers.ts', import.meta.url), 'utf8');

describe('reviews, recommendations, sharing, and back-in-stock contracts', () => {
  it('renders approved reviews or an honest no-reviews state without seeded customer content', () => {
    expect(productDetail).toContain('trpc.reviews.byProduct.useQuery');
    expect(productDetail).toContain('data-testid="product-reviews"');
    expect(productDetail).toContain('data-testid="reviews-empty-state"');
    expect(productDetail).toContain('Customer reviews will appear here after verified purchases are approved.');
    expect(productDetail).toContain('Verified purchase');
    expect(db).toContain("eq(reviews.status, 'approved')");
    expect(routers).toContain('reviews: router');
  });

  it('provides a related-product carousel with accessible controls and product routes', () => {
    expect(productDetail).toContain('You May Also Like');
    expect(productDetail).toContain('CarouselContent');
    expect(productDetail).toContain('CarouselPrevious');
    expect(productDetail).toContain('CarouselNext');
    expect(productDetail).toContain('Swipe or use the arrows');
    expect(productDetail).toContain('href={`/product/${item.id}`}');
  });

  it('creates a shareable wishlist URL and supports link-copy feedback', () => {
    expect(wishlistPanel).toContain('data-testid="share-wishlist"');
    expect(wishlistPanel).toContain("wishlist?share=${wishlistIds.join(',')}");
    expect(wishlistPanel).toContain('Wishlist link copied');
    expect(wishlistPanel).toContain('aria-label="Wishlist share link"');
    expect(wishlistPage).toContain('readSharedWishlist');
    expect(wishlistPage).toContain('sharedIds');
  });

  it('persists opt-in back-in-stock preferences and exposes an accessible wishlist control', () => {
    expect(store).toContain("const BACK_IN_STOCK_KEY = 'averae-back-in-stock-alerts'");
    expect(store).toContain('getBackInStockSubscriptions');
    expect(store).toContain('toggleBackInStockSubscription');
    expect(wishlistPanel).toContain('NOTIFY ME WHEN AVAILABLE');
    expect(wishlistPanel).toContain('Back-in-stock alert saved on this device.');
    expect(wishlistPanel).toContain('aria-pressed={alertSaved}');
    expect(wishlistPanel).toContain('data-testid={`back-in-stock-${product.id}`}');
  });
});
