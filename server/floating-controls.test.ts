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

  it('clarifies the floating help control with an accessible Need Help tooltip', () => {
    const help = read('client/src/components/CheckoutHelpDrawer.tsx');

    expect(help).toContain('aria-describedby="floating-help-tooltip"');
    expect(help).toContain('id="floating-help-tooltip" role="tooltip"');
    expect(help).toContain('Need Help?');
    expect(help).toContain('floating-help-control');
  });

  it('hides both floating controls while the footer is in view', () => {
    const help = read('client/src/components/CheckoutHelpDrawer.tsx');
    const backToTop = read('client/src/components/BackToTop.tsx');
    const footerVisibility = read('client/src/hooks/useFooterVisibility.ts');

    expect(help).toContain("import { useFooterVisibility } from '@/hooks/useFooterVisibility';");
    expect(help).toContain('if (footerVisible && !open) return null;');
    expect(backToTop).toContain("import { useFooterVisibility } from '@/hooks/useFooterVisibility';");
    expect(backToTop).toContain('const shouldShow = visible && !footerVisible;');
    expect(footerVisibility).toContain("document.querySelector<HTMLElement>('footer')");
    expect(footerVisibility).toContain('IntersectionObserver');
  });

  it('uses a subtle entrance animation and disables it for reduced motion', () => {
    const css = read('client/src/index.css');
    const help = read('client/src/components/CheckoutHelpDrawer.tsx');
    const backToTop = read('client/src/components/BackToTop.tsx');

    expect(css).toContain('@keyframes floatingControlEnter');
    expect(css).toContain('.floating-control-enter');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(help).toContain('floating-control-enter');
    expect(backToTop).toContain('floating-control-enter');
  });
});
