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
    for (const copy of ['Size Guide', 'How to measure', 'Body measurements', 'Foot length', 'CONTACT US', 'VIEW FAQs']) {
      expect(page).toContain(copy);
    }
    expect(page).toContain('Clothing size measurements in centimetres');
    expect(page).toContain('Footwear size measurements in centimetres');
    expect(page).toContain('href="/contact"');
    expect(page).toContain('href="/faq"');
  });
});
