import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
};

type NavigationAudit = {
  initialBackToTop: { hidden: string | null; tabIndex: number; opacity: string; visibility: string };
  scrolledBackToTop: { hidden: string | null; tabIndex: number; opacity: string; visibility: string };
  returnedToTop: { hidden: string | null; tabIndex: number; scrollY: number };
  wishlistBadge: string;
  bagBadge: string;
  wishlistDrawer: { label: string; transition: string; open: boolean };
  bagDrawer: { label: string; transition: string; open: boolean };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';

async function waitForDevTools(port: number) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chromium is still starting.
    }
    await sleep(100);
  }
  throw new Error('Chromium remote debugging did not start');
}

async function auditNavigation(port: number, mobile: boolean): Promise<NavigationAudit> {
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/shop`)}`, { method: 'PUT' });
  const tab = await tabResponse.json() as { webSocketDebuggerUrl: string };
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map<number, (message: CdpMessage) => void>();
  let nextId = 1;

  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data)) as CdpMessage;
    if (message.id) pending.get(message.id)?.(message);
    if (message.id) pending.delete(message.id);
  });
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true });
    socket.addEventListener('error', () => reject(new Error('Could not connect to Chromium DevTools')), { once: true });
  });

  const command = (method: string, params: Record<string, unknown> = {}) => new Promise<CdpMessage>(resolve => {
    const id = nextId++;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async <T>(expression: string): Promise<T> => {
    const response = await command('Runtime.evaluate', { expression, returnByValue: true });
    if (response.error) throw new Error(response.error.message ?? 'CDP evaluation failed');
    if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text ?? 'Page evaluation failed');
    return response.result?.result?.value as T;
  };

  try {
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile: false });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(900);
    await evaluate(`(() => {
      localStorage.setItem('averae-wishlist', '[1,2]');
      localStorage.setItem('averae-cart', JSON.stringify([{ id: 1, size: 'M', color: 'Black', quantity: 2 }]));
      location.reload();
      return true;
    })()`);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await evaluate<boolean>(`Boolean(document.querySelector('[data-testid="back-to-top"]'))`)) break;
      await sleep(100);
    }

    const initialBackToTop = await evaluate<NavigationAudit['initialBackToTop']>(`(() => {
      const button = document.querySelector('[data-testid="back-to-top"]');
      if (!button) throw new Error('Back-to-top control was not rendered');
      const style = getComputedStyle(button);
      return { hidden: button.getAttribute('aria-hidden'), tabIndex: button.tabIndex, opacity: style.opacity, visibility: style.visibility };
    })()`);

    await evaluate(`(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '1600px';
      spacer.setAttribute('data-navigation-audit-spacer', 'true');
      document.body.appendChild(spacer);
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 700);
      return true;
    })()`);
    await sleep(120);
    const scrolledBackToTop = await evaluate<NavigationAudit['scrolledBackToTop']>(`(() => {
      const button = document.querySelector('[data-testid="back-to-top"]');
      if (!button) throw new Error('Back-to-top control disappeared after scrolling');
      const style = getComputedStyle(button);
      return { hidden: button.getAttribute('aria-hidden'), tabIndex: button.tabIndex, opacity: style.opacity, visibility: style.visibility };
    })()`);

    await evaluate(`document.querySelector('[data-testid="back-to-top"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
    await sleep(600);
    const returnedToTop = await evaluate<NavigationAudit['returnedToTop']>(`(() => {
      const button = document.querySelector('[data-testid="back-to-top"]');
      if (!button) throw new Error('Back-to-top control disappeared after returning to top');
      return { hidden: button.getAttribute('aria-hidden'), tabIndex: button.tabIndex, scrollY: window.scrollY };
    })()`);

    const badges = await evaluate<{ wishlist: string; bag: string }>(`({ wishlist: document.querySelector('[data-testid="wishlist-count-badge"]')?.textContent?.trim() ?? '', bag: document.querySelector('[data-testid="bag-count-badge"]')?.textContent?.trim() ?? '' })`);
    await evaluate(`document.querySelector('button[aria-label^="Wishlist"]')?.click()`);
    await sleep(70);
    const wishlistDrawer = await evaluate<NavigationAudit['wishlistDrawer']>(`(() => {
      const panel = document.querySelector('[role="dialog"][aria-label="Wishlist"]');
      if (!panel) throw new Error('Wishlist drawer did not open');
      const style = getComputedStyle(panel);
      return { label: panel.getAttribute('aria-label') ?? '', transition: style.transition, open: panel.classList.contains('drawer-panel-open') };
    })()`);
    await evaluate(`document.querySelector('[aria-label="Close wishlist"]')?.click()`);
    await sleep(500);

    await evaluate(`document.querySelector('button[aria-label^="Bag"]')?.click()`);
    await sleep(70);
    const bagDrawer = await evaluate<NavigationAudit['bagDrawer']>(`(() => {
      const panel = document.querySelector('[role="dialog"][aria-label="Shopping bag"]');
      if (!panel) throw new Error('Bag drawer did not open');
      const style = getComputedStyle(panel);
      return { label: panel.getAttribute('aria-label') ?? '', transition: style.transition, open: panel.classList.contains('drawer-panel-open') };
    })()`);

    return { initialBackToTop, scrolledBackToTop, returnedToTop, wishlistBadge: badges.wishlist, bagBadge: badges.bag, wishlistDrawer, bagDrawer };
  } finally {
    socket.close();
  }
}

describe('catalog navigation pointer flow', () => {
  it('reveals back-to-top, updates live badges, and animates wishlist and bag drawers on desktop and mobile', async () => {
    const port = 9237;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-catalog-navigation-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      for (const mobile of [false, true]) {
        const result = await auditNavigation(port, mobile);
        expect(result.initialBackToTop.hidden).toBe('true');
        expect(result.initialBackToTop.tabIndex).toBe(-1);
        expect(result.scrolledBackToTop.hidden).toBe('false');
        expect(result.scrolledBackToTop.tabIndex).toBe(0);
        expect(result.scrolledBackToTop.visibility).toBe('visible');
        expect(result.returnedToTop.scrollY).toBeLessThan(12);
        expect(result.returnedToTop.hidden).toBe('true');
        expect(result.wishlistBadge).toBe('2');
        expect(result.bagBadge).toBe('2');
        expect(result.wishlistDrawer.label).toBe('Wishlist');
        expect(result.wishlistDrawer.transition).toContain('0.38s');
        expect(result.wishlistDrawer.open).toBe(true);
        expect(result.bagDrawer.label).toBe('Shopping bag');
        expect(result.bagDrawer.transition).toContain('0.38s');
        expect(result.bagDrawer.open).toBe(true);
      }
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 30000);
});
