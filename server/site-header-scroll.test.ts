import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
};

type HeaderScrollResult = {
  position: string;
  beforeTop: number;
  afterTop: number;
  wishlistLabel: string;
  bagLabel: string;
  mobileNavPosition: string;
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

async function auditHeader(route: string, viewportWidth: number, viewportHeight: number, port: number): Promise<HeaderScrollResult> {
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}${route}`)}`, { method: 'PUT' });
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
    await command('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
    await command('Page.navigate', { url: `${baseUrl}${route}` });
    await sleep(1000);
    if (route === '/') {
      await evaluate(`(() => { const skip = [...document.querySelectorAll('button')].find(button => button.textContent?.trim().toLowerCase() === 'skip intro'); skip?.click(); return Boolean(skip); })()`);
      await sleep(850);
    }

    const result = await evaluate<HeaderScrollResult>(`(() => {
      const header = document.querySelector('header');
      const wishlist = document.querySelector('button[aria-label^="Wishlist"]');
      const bag = document.querySelector('button[aria-label^="Bag"]');
      const mobileNav = document.querySelector('nav[aria-label="Mobile navigation"]');
      if (!header || !wishlist || !bag || !mobileNav) throw new Error('Shared header controls were not rendered');
      const spacer = document.createElement('div');
      spacer.setAttribute('data-scroll-audit-spacer', 'true');
      spacer.style.height = '1600px';
      document.body.appendChild(spacer);
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      const beforeTop = header.getBoundingClientRect().top;
      window.scrollTo(0, 420);
      const afterTop = header.getBoundingClientRect().top;
      return {
        position: getComputedStyle(header).position,
        beforeTop,
        afterTop,
        wishlistLabel: wishlist.getAttribute('aria-label') ?? '',
        bagLabel: bag.getAttribute('aria-label') ?? '',
        mobileNavPosition: getComputedStyle(mobileNav).position,
      };
    })()`);
    return result;
  } finally {
    socket.close();
  }
}

describe('shared header scroll behavior', () => {
  it('keeps wishlist and bag controls in the same non-stationary header flow on desktop and mobile routes', async () => {
    const port = 9227;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-header-scroll-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      for (const viewport of [[1280, 900], [390, 844]] as const) {
        for (const route of ['/', '/wishlist', '/cart']) {
          const result = await auditHeader(route, viewport[0], viewport[1], port);
          expect(result.position, `${route} at ${viewport[0]}px should use normal document flow`).toBe('relative');
          expect(result.afterTop, `${route} at ${viewport[0]}px should scroll the header away`).toBeLessThan(result.beforeTop - 50);
          expect(result.wishlistLabel).toMatch(/^Wishlist/);
          expect(result.bagLabel).toMatch(/^Bag/);
          expect(result.mobileNavPosition).toBe('fixed');
        }
      }
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 30000);
});
