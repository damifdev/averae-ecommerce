import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('floating controls', () => {
  it('keeps the FAQ widget and BackToTop controls vertically separated', () => {
    const help = read('client/src/components/CheckoutHelpDrawer.tsx');
    const backToTop = read('client/src/components/BackToTop.tsx');

    expect(help).toContain('fixed bottom-5 right-5');
    expect(backToTop).toContain('md:bottom-24');
    expect(backToTop).toContain('fixed bottom-24 right-5');
  });

  it('mounts BackToTop on the homepage with a practical reveal threshold', () => {
    const home = read('client/src/pages/Home.tsx');

    expect(home).toContain("import BackToTop from '@/components/BackToTop';");
    expect(home).toContain('<BackToTop threshold={240} />');
  });
});
