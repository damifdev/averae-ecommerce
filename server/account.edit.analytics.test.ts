import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const account = readFileSync(resolve(root, 'client/src/pages/Account.tsx'), 'utf8');
const analytics = readFileSync(resolve(root, 'client/src/lib/analytics.ts'), 'utf8');
const header = readFileSync(resolve(root, 'client/src/components/SiteHeader.tsx'), 'utf8');
const home = readFileSync(resolve(root, 'client/src/pages/Home.tsx'), 'utf8');
const styles = readFileSync(resolve(root, 'client/src/index.css'), 'utf8');

describe('account editing and engagement analytics contracts', () => {
  it('provides dedicated address, payment, and preference editing flows', () => {
    expect(account).toContain('Saved addresses');
    expect(account).toContain('Payment methods');
    expect(account).toContain('Preferences');
    expect(account).toContain('Save address');
    expect(account).toContain('Save payment method');
    expect(account).toContain('Style direction');
    expect(account).toContain('writeStoredJson(ACCOUNT_STORAGE_KEYS.addresses');
    expect(account).toContain('writeStoredJson(ACCOUNT_STORAGE_KEYS.payments');
    expect(account).toContain('writeStoredJson(ACCOUNT_STORAGE_KEYS.preferences');
  });

  it('protects destructive account actions and exposes primary controls', () => {
    expect(account).toContain('AlertDialog');
    expect(account).toContain('Remove {pendingRemoval?.type');
    expect(account).toContain('setPendingRemoval({ type: \'address\'');
    expect(account).toContain('setPendingRemoval({ type: \'payment\'');
    expect(account).toContain('setPrimaryAddress');
    expect(account).toContain('setPrimaryPayment');
    expect(analytics).toContain('primary?: boolean');
  });

  it('keeps mobile navigation animated and auto-closing after link selection', () => {
    expect(header).toContain('mobile-drawer-panel');
    expect(header).toContain('onNavigate={closeAll}');
    expect(styles).toContain('.mobile-drawer-panel');
    expect(styles).toContain('prefers-reduced-motion: reduce');
  });

  it('keeps analytics events non-identifying and covers mobile navigation and footer links', () => {
    expect(analytics).toContain("'mobile_nav_click'");
    expect(analytics).toContain("'footer_link_click'");
    expect(analytics).toContain('averae-analytics');
    expect(header).toContain("trackEngagement('mobile_nav_click'");
    expect(home).toContain("trackEngagement('footer_link_click'");
  });
});
