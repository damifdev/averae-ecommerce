import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
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

async function auditPreviews(port: number) {
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
    await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(900);

    await evaluate(`document.querySelector('[aria-label^="Wishlist"]')?.parentElement?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }))`);
    await sleep(120);
    const wishlistState = await evaluate<{ previews: number; wishlistPreview: boolean; wishlistTooltipOpacity: string }>(`(() => {
      const wishlist = document.querySelector('[data-testid="wishlist-latest-preview"]');
      const tooltip = document.querySelector('[aria-label^="Wishlist"] .icon-tooltip');
      return { previews: document.querySelectorAll('[data-testid$="-latest-preview"]').length, wishlistPreview: Boolean(wishlist), wishlistTooltipOpacity: tooltip ? getComputedStyle(tooltip).opacity : 'missing' };
    })()`);

    await evaluate(`document.querySelector('[aria-label^="Bag"]')?.parentElement?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }))`);
        await sleep(240);

    const bagState = await evaluate<{ previews: number; wishlistPreview: boolean; bagPreview: boolean; bagTooltipOpacity: string }>(`(() => {
      const bag = document.querySelector('[data-testid="bag-latest-preview"]');
      const wishlist = document.querySelector('[data-testid="wishlist-latest-preview"]');
      const tooltip = document.querySelector('[aria-label^="Bag"] .icon-tooltip');
      return { previews: document.querySelectorAll('[data-testid$="-latest-preview"]').length, wishlistPreview: Boolean(wishlist), bagPreview: Boolean(bag), bagTooltipOpacity: tooltip ? getComputedStyle(tooltip).opacity : 'missing' };
    })()`);

    await command('Emulation.setDeviceMetricsOverride', { width: 660, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(80);
    const narrowState = await evaluate<{ left: number; right: number; width: number; viewport: number }>(`(() => {
      const preview = document.querySelector('[data-testid="bag-latest-preview"]');
      const rect = preview?.getBoundingClientRect();
      return { left: rect?.left ?? -1, right: rect?.right ?? -1, width: rect?.width ?? 0, viewport: window.innerWidth };
    })()`);

    return { wishlistState, bagState, narrowState };
  } finally {
    socket.close();
  }
}

describe('header preview layering', () => {
  it('keeps wishlist and bag previews mutually exclusive and hides their tooltips while open', async () => {
    const port = 9234;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-header-preview-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      const result = await auditPreviews(port);
      expect(result.wishlistState.previews).toBe(1);
      expect(result.wishlistState.wishlistPreview).toBe(true);
      expect(result.wishlistState.wishlistTooltipOpacity).toBe('0');
      expect(result.bagState.previews).toBe(1);
      expect(result.bagState.wishlistPreview).toBe(false);
      expect(result.bagState.bagPreview).toBe(true);
      expect(result.bagState.bagTooltipOpacity).toBe('0');
      expect(result.narrowState.left).toBeGreaterThanOrEqual(0);
      expect(result.narrowState.right).toBeLessThanOrEqual(result.narrowState.viewport);
      expect(result.narrowState.width).toBeLessThanOrEqual(result.narrowState.viewport - 32);
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 30000);
});
