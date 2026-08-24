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

async function auditInteractions(port: number) {
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/`)}`, { method: 'PUT' });
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
    await command('Page.navigate', { url: `${baseUrl}/` });
    await sleep(1100);
    await evaluate(`(() => { const skip = [...document.querySelectorAll('button')].find(button => button.textContent?.trim().toLowerCase() === 'skip intro'); skip?.click(); return Boolean(skip); })()`);
    await sleep(900);

    await evaluate(`document.querySelector('button[aria-label="Search"]')?.click()`);
    await sleep(160);
    const visualSearch = await evaluate<{ opened: boolean; hasThumbnail: boolean; hasRecent: boolean; cleared: boolean }>(`(() => ({
      opened: Boolean(document.querySelector('input[aria-label="Search products, brands, trends, or stories"]')),
      hasThumbnail: Boolean(document.querySelector('[data-testid="search-suggestions-products"] img')),
      hasRecent: false,
      cleared: false,
    }))()`);
    const searchHistory = await evaluate<{ hasRecent: boolean; cleared: boolean }>(`(() => {
      const input = document.querySelector('input[aria-label="Search products, brands, trends, or stories"]');
      const form = input?.closest('form');
      if (!input || !form) throw new Error('Search form was not rendered');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, 'linen');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      form.requestSubmit();
      return { hasRecent: false, cleared: false };
    })()`);
    await sleep(180);
    await evaluate(`document.querySelector('button[aria-label="Search"]')?.click()`);
    await sleep(160);
    const recentVisible = await evaluate<boolean>(`Boolean(document.querySelector('[data-testid="clear-search-history"]'))`);
    await evaluate(`document.querySelector('[data-testid="clear-search-history"]')?.click()`);
    await sleep(120);
    const cleared = await evaluate<boolean>(`localStorage.getItem('averae-recent-searches') === null && !document.querySelector('[data-testid="clear-search-history"]')`);

    await command('Page.navigate', { url: `${baseUrl}/trends` });
    await sleep(900);
    const autoplay = await evaluate<{ found: boolean; initialPaused: string | null; hoverPaused: string | null; resumed: string | null }>(`(() => {
      const carousel = document.querySelector('[data-testid^="trend-carousel-"]');
      if (!carousel) throw new Error('Trend carousel was not rendered');
      const initialPaused = carousel.getAttribute('data-autoplay-paused');
      carousel.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }));
      return { found: true, initialPaused, hoverPaused: null, resumed: null };
    })()`);
    await sleep(100);
    const hoverPaused = await evaluate<string | null>(`document.querySelector('[data-testid^="trend-carousel-"]')?.getAttribute('data-autoplay-paused') ?? null`);
    await evaluate(`document.querySelector('[data-testid^="trend-carousel-"]')?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))`);
    await sleep(100);
    const resumed = await evaluate<string | null>(`document.querySelector('[data-testid^="trend-carousel-"]')?.getAttribute('data-autoplay-paused') ?? null`);

    return { visualSearch, searchHistory, recentVisible, cleared, autoplay, hoverPaused, resumed };
  } finally {
    socket.close();
  }
}

describe('Search and Trends pointer interactions', () => {
  it('clears recent searches, renders visual suggestions, and pauses Trends autoplay on hover', async () => {
    const port = 9233;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-search-trends-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      const result = await auditInteractions(port);
      expect(result.visualSearch.opened).toBe(true);
      expect(result.visualSearch.hasThumbnail).toBe(true);
      expect(result.recentVisible).toBe(true);
      expect(result.cleared).toBe(true);
      expect(result.autoplay.found).toBe(true);
      expect(result.autoplay.initialPaused).toBe('false');
      expect(result.hoverPaused).toBe('true');
      expect(result.resumed).toBe('false');
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 30000);
});

void sleep;
