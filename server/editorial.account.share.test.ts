import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const discoverySource = readFileSync(new URL('../client/src/pages/Discovery.tsx', import.meta.url), 'utf8');
const accountSource = readFileSync(new URL('../client/src/pages/Account.tsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../client/src/index.css', import.meta.url), 'utf8');

describe('editorial account and sharing enhancements', () => {
  it('renders a persisted Saved Articles account section with an empty state', () => {
    expect(accountSource).toContain('Saved Articles');
    expect(accountSource).toContain('getSavedArticles()');
    expect(accountSource).toContain('SAVED_ARTICLES_UPDATED_EVENT');
    expect(accountSource).toContain('Save stories from The Áveraẹ Edit');
    expect(accountSource).toContain('READ THE EDIT');
  });

  it('renders product-aware accessible hotspot hover cards with quick actions', () => {
    expect(discoverySource).toContain('HoverCard');
    expect(discoverySource).toContain('HoverCardTrigger');
    expect(discoverySource).toContain('HoverCardContent');
    expect(discoverySource).toContain('hotspotProduct?.name');
    expect(discoverySource).toContain('formatPrice(hotspotProduct.price)');
    expect(discoverySource).toContain('data-testid={`look-hotspot-card-');
    expect(discoverySource).toContain('data-testid={`look-hotspot-add-');
    expect(discoverySource).toContain('ADD TO CART');
    expect(discoverySource).toContain('data-testid={`look-hotspot-save-');
    expect(discoverySource).toContain('SAVE PRODUCT');
    expect(discoverySource).toContain('toggleWishlist');
  });

  it('provides an article skeleton before content and sharing controls render', () => {
    expect(discoverySource).toContain('function ArticleSkeleton()');
    expect(discoverySource).toContain('data-testid="article-skeleton"');
    expect(discoverySource).toContain('aria-busy="true"');
    expect(discoverySource).toContain('setIsLoading(false)');
    expect(discoverySource).toContain('if (isLoading) return <ArticleSkeleton />');
    expect(cssSource).toContain('.skeleton-block');
    expect(cssSource).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(cssSource).toContain('skeleton-shimmer');
  });

  it('exposes dedicated social sharing controls', () => {
    expect(discoverySource).toContain('data-testid="share-whatsapp"');
    expect(discoverySource).toContain('data-testid="share-pinterest"');
    expect(discoverySource).toContain('data-testid="share-instagram"');
    expect(discoverySource).toContain('https://wa.me/');
    expect(discoverySource).toContain('pinterest.com/pin/create/button');
    expect(discoverySource).toContain('Article link copied for Instagram.');
  });

  it('keeps editorial filled and outlined action labels contrast-safe', () => {
    expect(discoverySource).toContain('className="action-link-dark inline-flex');
    expect(discoverySource).toContain('className="action-link-light mt-6 inline-flex');
    expect(cssSource).toContain('.action-link-light');
    expect(cssSource).toContain('color: #FFFDF8 !important;');
    expect(cssSource).toContain('.action-link-dark');
    expect(cssSource).toContain('color: #382820 !important;');
  });
});
