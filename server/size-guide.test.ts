import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'client/src/pages/SizeGuide.tsx'), 'utf8');
const faq = readFileSync(resolve(process.cwd(), 'client/src/pages/FAQ.tsx'), 'utf8');
const app = readFileSync(resolve(process.cwd(), 'client/src/App.tsx'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'client/src/pages/Home.tsx'), 'utf8');

describe('Size Guide support page', () => {
  it('registers the dedicated route and replaces the footer dead end', () => {
    expect(app).toContain("import SizeGuide from './pages/SizeGuide';");
    expect(app).toContain('<Route path="/size-guide" component={SizeGuide} />');
    expect(home).toContain("['Size Guide', '/size-guide']");
    expect(faq).toContain('href="/size-guide"');
  });

  it('includes measurement guidance, clothing and footwear tables, and support actions', () => {
    for (const copy of ['Size Guide', 'Find the right fit before you order.', 'How to measure', 'Women', 'Men', 'Kids', 'Shoes', 'Fit notes', 'Chest / bust', 'Waist', 'Hips', 'Inseam', 'Foot length', 'SHOP WOMEN', 'SHOP MEN', 'SHOP KIDS', 'VIEW RETURNS POLICY', 'CONTACT US', 'VIEW FAQs']) {
      expect(page).toContain(copy);
    }
    expect(page).toContain('Women clothing measurements in centimetres');
    expect(page).toContain('Men clothing measurements in centimetres');
    expect(page).toContain('Kids age, height, and waist guidance');
    expect(page).toContain('International shoe size conversions and foot length');
    expect(page).toContain('Foot length');
    expect(page).toContain('href="/shop"');
    expect(page).toContain('href="/shop?audience=women"');
    expect(page).toContain('href="/shop?audience=men"');
    expect(page).toContain('href="/shop?audience=kids"');
    expect(page).toContain('href="/returns"');
    expect(page).toContain('href="/contact"');
    expect(page).toContain('href="/faq"');
  });
});
