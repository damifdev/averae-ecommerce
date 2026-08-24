import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'client/src/pages/FAQ.tsx'), 'utf8');
const app = readFileSync(resolve(process.cwd(), 'client/src/App.tsx'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'client/src/pages/Home.tsx'), 'utf8');

describe('FAQ page', () => {
  it('registers the dedicated FAQ route and footer destination', () => {
    expect(app).toContain('import FAQ from \'./pages/FAQ\';');
    expect(app).toContain('<Route path="/faq" component={FAQ} />');
    expect(home).toContain("['FAQs', '/faq']");
  });

  it('includes the requested title, intro, search field, and all FAQ categories', () => {
    expect(page).toContain('Frequently Asked Questions');
    expect(page).toContain('Quick answers to the questions our customers ask most.');
    expect(page).toContain('Search questions...');
    for (const category of ['Orders', 'Payment', 'Delivery', 'Returns & Refunds', 'Products & Sizing', 'Account']) {
      expect(page).toContain(`title: '${category}'`);
    }
  });

  it('uses expandable details and provides no-results recovery plus support shortcuts', () => {
    expect(page).toContain('<details');
    expect(page).toContain("Can&apos;t find what you&apos;re looking for?");
    expect(page).toContain('href="/contact"');
    expect(page).toContain('href="/delivery"');
    expect(page).toContain('href="/returns"');
    expect(page).toContain('SIZE GUIDE');
  });
});
