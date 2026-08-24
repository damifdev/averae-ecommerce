import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('Delivery page contracts', () => {
  it('registers the dedicated route and updates the footer destination', () => {
    const app = read('App.tsx');
    const home = read('pages/Home.tsx');
    expect(app).toContain("import Delivery from './pages/Delivery';");
    expect(app).toContain('<Route path="/delivery" component={Delivery} />');
    expect(home).toContain("['Delivery', '/delivery']");
  });

  it('contains delivery options, timing, cost, processing, tracking, and served-area guidance', () => {
    const delivery = read('pages/Delivery.tsx');
    expect(delivery).toContain('Delivery Information');
    expect(delivery).toContain('Everything you need to know about getting your Áveraẹ order to you.');
    expect(delivery).toContain('Standard Delivery');
    expect(delivery).toContain('Express Delivery');
    expect(delivery).toContain('Same-Day Delivery');
    expect(delivery).toContain('Store Pickup');
    expect(delivery).toContain('Order processing');
    expect(delivery).toContain('Free delivery');
    expect(delivery).toContain('Tracking');
    expect(delivery).toContain('Delivery areas');
    expect(delivery).toContain('Public holidays');
  });

  it('provides working recovery and support pathways with scan-friendly accordions', () => {
    const delivery = read('pages/Delivery.tsx');
    expect(delivery).toContain('TRACK YOUR ORDER');
    expect(delivery).toContain('href="/account#orders"');
    expect(delivery).toContain('CONTACT US');
    expect(delivery).toContain('href="/contact"');
    expect(delivery).toContain('I entered the wrong delivery information');
    expect((delivery.match(/<details/g) || []).length).toBeGreaterThanOrEqual(3);
  });
});
