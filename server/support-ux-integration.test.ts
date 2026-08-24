import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(resolve(root, file), 'utf8');

describe('Áveraẹ support UX integration', () => {
  it('connects Product Detail, Bag, and Checkout to sizing, delivery, and returns support', () => {
    const product = read('pages/ProductDetail.tsx');
    const bag = read('pages/Cart.tsx');
    const checkout = read('pages/Checkout.tsx');
    const supportLinks = read('components/SupportLinks.tsx');
    expect(product).toContain('sizeGuideOpen');
    expect(product).toContain('<Dialog open={sizeGuideOpen}');
    expect(product).toContain('ProductSizeChart');
    expect(supportLinks).toContain('href="/delivery"');
    expect(supportLinks).toContain('href="/returns"');
    expect(bag).toContain('<SupportLinks');
    expect(checkout).toContain('<SupportLinks');
    expect(checkout).toContain('newTab');
    expect(supportLinks).toContain('target: \'_blank\'');
    expect(supportLinks).toContain('rel: \'noreferrer\'');
  });

  it('connects confirmation and account orders to real order support destinations', () => {
    const checkout = read('pages/Checkout.tsx');
    const account = read('pages/Account.tsx');
    for (const copy of ['TRACK ORDER', 'VIEW ORDER']) {
      expect(checkout).toContain(copy);
    }
    for (const copy of ['Delivery Information', 'Contact Support']) {
      expect(read('components/SupportLinks.tsx')).toContain(copy);
    }
    expect(account).toContain('<SupportLinks');
    for (const copy of ['Delivery Information', 'Contact Support']) {
      expect(read('components/SupportLinks.tsx')).toContain(copy);
    }
    expect(checkout).toContain('href="/account#orders"');
    expect(checkout).toContain('<SupportLinks');
    expect(checkout).toContain('includeContact');
    expect(account).toContain('includeContact');
  });

  it('keeps every dedicated support page connected to its required shortcuts', () => {
    const contact = read('pages/Contact.tsx');
    const delivery = read('pages/Delivery.tsx');
    const returns = read('pages/Returns.tsx');
    const sizeGuide = read('pages/SizeGuide.tsx');
    const faq = read('pages/FAQ.tsx');
    expect(contact).toContain('href="/faq"');
    expect(contact).toContain('href="/delivery"');
    expect(contact).toContain('href="/returns"');
    expect(delivery).toContain('TRACK YOUR ORDER');
    expect(delivery).toContain('CONTACT US');
    expect(delivery).toContain('includeFaq');
    expect(delivery).toContain('includeSizeGuide');
    expect(returns).toContain('START FROM MY ORDERS');
    expect(returns).toContain('CONTACT SUPPORT');
    expect(returns).toContain('href="/faq"');
    expect(returns).toContain('includeSizeGuide');
    expect(sizeGuide).toContain('SHOP WOMEN');
    expect(sizeGuide).toContain('SHOP MEN');
    expect(sizeGuide).toContain('SHOP KIDS');
    expect(sizeGuide).toContain('href="/returns"');
    for (const shortcut of ['href="/delivery"', 'href="/returns"', 'href="/size-guide"', 'href="/contact"']) {
      expect(faq).toContain(shortcut);
    }
  });

  it('routes footer support links to dedicated pages and avoids legacy support anchors', () => {
    const home = read('pages/Home.tsx');
    const returns = read('pages/Returns.tsx');
    expect(home).toContain("['Contact', '/contact']");
    expect(home).toContain("['Delivery', '/delivery']");
    expect(home).toContain("['Returns', '/returns']");
    expect(home).toContain("['Size Guide', '/size-guide']");
    expect(home).toContain("['FAQs', '/faq']");
    expect(returns).not.toContain('contact#faqs');
  });

  it('uses consistent customer-facing support terminology in key commerce surfaces', () => {
    const source = [read('pages/ProductDetail.tsx'), read('pages/Cart.tsx'), read('pages/Checkout.tsx'), read('pages/Account.tsx')].join('\n');
    expect(source).toContain('Bag');
    expect(source).toContain('Delivery');
    expect(source).toContain('Returns');
    expect(source).toContain('Size Guide');
  });
});
