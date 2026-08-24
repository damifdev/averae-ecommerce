import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('Returns page contracts', () => {
  it('registers the dedicated route and updates the footer destination', () => {
    const app = read('App.tsx');
    const home = read('pages/Home.tsx');
    expect(app).toContain("import Returns from './pages/Returns';");
    expect(app).toContain('<Route path="/returns" component={Returns} />');
    expect(home).toContain("['Returns', '/returns']");
  });

  it('contains policy, conditions, non-returnable items, refund, exchange, and damaged-item guidance', () => {
    const returns = read('pages/Returns.tsx');
    expect(returns).toContain('Returns &amp; Refunds');
    expect(returns).toContain("Changed your mind? Here's everything you need to know about returns and refunds.");
    expect(returns).toContain('Return conditions');
    expect(returns).toContain('Non-returnable items');
    expect(returns).toContain('The item must be unused and unworn.');
    expect(returns).toContain('Refund timing');
    expect(returns).toContain('Original payment method');
    expect(returns).toContain('Exchanges');
    expect(returns).toContain('Damaged or incorrect items');
  });

  it('provides the requested return steps, fallback support, FAQs, and contact actions', () => {
    const returns = read('pages/Returns.tsx');
    expect(returns).toContain('Log into your account.');
    expect(returns).toContain('Open My Orders.');
    expect(returns).toContain('Select the relevant order.');
    expect(returns).toContain('Select REQUEST RETURN.');
    expect(returns).toContain('Follow the instructions.');
    expect(returns).toContain('CONTACT SUPPORT');
    expect(returns).toContain('CONTACT US');
    expect(returns).toContain('VIEW FAQs');
    expect(returns).toContain('href="/contact#faqs"');
    expect((returns.match(/<details/g) || []).length).toBeGreaterThanOrEqual(3);
  });
});
