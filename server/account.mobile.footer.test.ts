import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('UX Refinement Part 7 contracts', () => {
  it('provides a focused account dashboard with requested sections and order states', () => {
    const source = read('pages/Account.tsx');
    for (const label of ['Overview', 'Orders', 'Wishlist', 'Saved Addresses', 'Payment Methods', 'Profile', 'Preferences', 'Logout']) expect(source).toContain(label);
    for (const status of ['Processing', 'Delivered']) expect(source).toContain(status);
    expect(source).toContain('Your orders');
    expect(source).toContain('View full details');
  });

  it('keeps mobile navigation touch-friendly and exposes requested discovery destinations', () => {
    const source = read('components/SiteHeader.tsx');
    for (const label of ['Home', 'Shop', 'Trends', 'Wishlist', 'Bag', 'The Áveraẹ Edit', 'New Arrivals', 'Sale']) expect(source).toContain(label);
    expect(source).toContain('lg:hidden');
    expect(source).toContain('aria-label="Mobile navigation"');
  });

  it('organizes the footer into useful link groups and social destinations', () => {
    const source = read('pages/Home.tsx');
    for (const group of ['Shop', 'Categories', 'Discover', 'Help', 'Account']) expect(source).toContain(`title: '${group}'`);
    expect(source).toContain('>Social</p>');
    for (const link of ['Women', 'Men', 'Kids', 'Unisex', 'New Arrivals', 'Trending', 'Clothing', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'The Áveraẹ Edit', 'Trends', 'Shop the Look', 'Contact', 'Delivery', 'Returns', 'Size Guide', 'FAQs', 'My Account', 'Orders', 'Wishlist']) expect(source).toContain(link);
    for (const network of ['instagram.com', 'pinterest.com', 'whatsapp.com']) expect(source).toContain(network);
  });
});
