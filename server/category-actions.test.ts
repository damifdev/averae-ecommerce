import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('Hair and Thrift Wear category actions', () => {
  it('reveals Thrift Wear condition and size on hover/focus', () => {
    const source = read('client/src/pages/Shop.tsx');
    expect(source).toContain('data-testid={`thrift-card-details-${p.id}`}');
    expect(source).toContain('group-hover:opacity-100 group-focus-within:opacity-100');
    expect(source).toContain('{p.condition || \'Condition reviewed\'} · Size {p.sizes[0] || \'One size\'}');
  });

  it('exposes manageable Notify Me subscriptions in the account area', () => {
    const source = read('client/src/pages/Account.tsx');
    expect(source).toContain('My Subscriptions');
    expect(source).toContain('getBackInStockSubscriptions');
    expect(source).toContain('toggleBackInStockSubscription(productId)');
    expect(source).toContain('href="/thrift-wear"');
  });

  it('keeps the share action scoped to Hair and Thrift Wear product detail pages', () => {
    const source = read('client/src/pages/ProductDetail.tsx');
    expect(source).toContain('Share this item');
    expect(source).toContain("product.category === 'Hair' || product.category === 'Thrift Wear'");
    expect(source).toContain('navigator.share');
    expect(source).toContain('navigator.clipboard');
  });
});
