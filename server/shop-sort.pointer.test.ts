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

async function runSortAudit(port: number, mobile: boolean) {
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
    await command('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(1000);

    const initial = await evaluate<{ value: string; firstProduct: string }>(`(() => ({
      value: document.querySelector('select[aria-label="Sort products"]')?.value ?? '',
      firstProduct: document.querySelector('article[data-testid^="product-card-"] > div:nth-child(2) a')?.textContent?.trim() ?? '',
    }))()`);
    const changed = await evaluate<boolean>(`(() => {
      const select = document.querySelector('select[aria-label="Sort products"]');
      if (!select) return false;
      select.value = 'Price: Low to High';
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    if (!changed) throw new Error('Sort By select was not found');
    await sleep(220);
    const sorted = await evaluate<{ value: string; firstProduct: string }>(`(() => ({
      value: document.querySelector('select[aria-label="Sort products"]')?.value ?? '',
      firstProduct: document.querySelector('article[data-testid^="product-card-"] > div:nth-child(2) a')?.textContent?.trim() ?? '',
    }))()`);
    await command('Page.navigate', { url: `${baseUrl}/shop?audience=women` });
    await sleep(700);
    const women = await evaluate<{ heading: string; count: string }>(`(() => ({
      heading: document.querySelector('h1')?.textContent?.trim() ?? '',
      count: document.querySelector('[data-testid="product-count"]')?.textContent?.trim() ?? '',
    }))()`);
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(700);
    const baseAfterReload = await evaluate<{ heading: string; count: string; audiencePressed: string }>(`(() => ({
      heading: document.querySelector('h1')?.textContent?.trim() ?? '',
      count: document.querySelector('[data-testid="product-count"]')?.textContent?.trim() ?? '',
      audiencePressed: [...document.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Women')?.getAttribute('aria-pressed') ?? '',
    }))()`);
    return { initial, sorted, women, baseAfterReload };
  } finally {
    socket.close();
  }
}

describe('Shop sort pointer flow', () => {
  it('updates selected Sort By state and product ordering on desktop and mobile', async () => {
    for (const [index, mobile] of [false, true].entries()) {
      const port = 9233 + index;
      const chrome = spawn('/usr/bin/chromium', [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=/tmp/averae-shop-sort-${process.pid}-${index}`,
        'about:blank',
      ], { stdio: 'ignore' });
      try {
        await waitForDevTools(port);
        const result = await runSortAudit(port, mobile);
        expect(result.initial.value).toBe('Recommended');
        expect(result.initial.firstProduct).toBe('Signature Linen Shirt');
        expect(result.sorted.value).toBe('Price: Low to High');
        expect(result.sorted.firstProduct).toBe('Oshogbo Coily Packet Hair');
        expect(result.women.heading).toBe('Women');
        expect(result.women.count).toBe('17 products');
        expect(result.baseAfterReload.heading).toBe('Discover Áveraẹ');
        expect(result.baseAfterReload.count).toBe('18 products');
        expect(result.baseAfterReload.audiencePressed).toBe('false');
      } finally {
        chrome.kill('SIGTERM');
      }
    }
  }, 30000);
});
