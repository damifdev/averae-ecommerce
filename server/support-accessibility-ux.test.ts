import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe('support accessibility UX contracts', () => {
  it('exposes the Account Help & Support group and correct saved-address anchor', () => {
    const header = read('client/src/components/SiteHeader.tsx');
    expect(header).toContain('Help &amp; Support');
    expect(header).toContain('href="/contact"');
    expect(header).toContain('href="/faq"');
    expect(header).toContain('href="/account#saved-addresses"');
  });

  it('keeps all five support destinations in the mobile Help & Support section', () => {
    const header = read('client/src/components/SiteHeader.tsx');
    expect(header).toContain('Help &amp; Support');
    expect(header).toContain("{ label: 'Delivery', href: '/delivery' }");
    expect(header).toContain("{ label: 'Returns', href: '/returns' }");
    expect(header).toContain("{ label: 'Size Guide', href: '/size-guide' }");
  });

  it('provides contextual support links across commerce and support pages', () => {
    const files = [
      'client/src/pages/Cart.tsx',
      'client/src/pages/ProductDetail.tsx',
      'client/src/pages/Checkout.tsx',
      'client/src/pages/FAQ.tsx',
      'client/src/pages/Contact.tsx',
      'client/src/pages/Delivery.tsx',
      'client/src/pages/Returns.tsx',
      'client/src/pages/SizeGuide.tsx',
      'client/src/pages/Account.tsx',
    ].map(read).join('\n');
    for (const route of ['/delivery', '/returns', '/size-guide', '/faq', '/contact']) {
      expect(files).toContain(route);
    }
  });

  it('includes direct tracking actions in account order details', () => {
    const account = read('client/src/pages/Account.tsx');
    expect(account).toContain('TRACK ORDER');
    expect(account).toContain('Order support');
  });
});

void describe;
