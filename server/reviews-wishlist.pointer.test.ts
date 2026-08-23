import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = { id?: number; result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } }; error?: { message?: string } };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';

async function waitForDevTools(port: number) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return; } catch {}
    await sleep(100);
  }
  throw new Error('Chromium remote debugging did not start');
}

async function audit(port: number, mobile: boolean) {
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/product/3`)}`, { method: 'PUT' });
  const tab = await tabResponse.json() as { webSocketDebuggerUrl: string };
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map<number, (message: CdpMessage) => void>();
  let nextId = 1;
  socket.addEventListener('message', event => { const message = JSON.parse(String(event.data)) as CdpMessage; if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); } });
  await new Promise<void>((resolve, reject) => { socket.addEventListener('open', () => resolve(), { once: true }); socket.addEventListener('error', () => reject(new Error('Could not connect to Chromium DevTools')), { once: true }); });
  const command = (method: string, params: Record<string, unknown> = {}) => new Promise<CdpMessage>(resolve => { const id = nextId++; pending.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async <T>(expression: string): Promise<T> => { const response = await command('Runtime.evaluate', { expression, returnByValue: true }); if (response.error) throw new Error(response.error.message ?? 'CDP evaluation failed'); if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text ?? 'Page evaluation failed'); return response.result?.result?.value as T; };
  try {
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
    await command('Page.navigate', { url: `${baseUrl}/product/3` });
    await sleep(900);
    const product = await evaluate<{ emptyReviews: boolean; recommendationCount: number; nextRecommendation: boolean }>(`({ emptyReviews: Boolean(document.querySelector('[data-testid="reviews-empty-state"]')), recommendationCount: document.querySelectorAll('[data-testid="recommendations"] a[href^="/product/"]').length, nextRecommendation: Boolean(document.querySelector('[aria-label="Next recommended products"]')) })`);
    await evaluate(`localStorage.setItem('averae-wishlist', '[8]'); location.href = '${baseUrl}/wishlist'`);
    await sleep(800);
    const wishlistBefore = await evaluate<{ share: boolean; notify: boolean; unavailable: boolean }>(`({ share: Boolean(document.querySelector('[data-testid="share-wishlist"]')), notify: Boolean(document.querySelector('[data-testid="back-in-stock-8"]')), unavailable: Array.from(document.querySelectorAll('[data-testid="wishlist-item-8"]')).some(item => (item.textContent || '').includes('Currently unavailable')) })`);
    await evaluate(`document.querySelector('[data-testid="share-wishlist"]')?.click()`);
    await sleep(120);
    const shared = await evaluate<{ input: string; feedback: string }>(`({ input: document.querySelector('[aria-label="Wishlist share link"]')?.value || '', feedback: document.querySelector('[data-testid="wishlist-share-feedback"]')?.textContent || '' })`);
    await evaluate(`document.querySelector('[data-testid="back-in-stock-8"]')?.click()`);
    await sleep(120);
    const notification = await evaluate<{ saved: boolean; storage: string }>(`({ saved: document.querySelector('[data-testid="back-in-stock-8"]')?.textContent?.includes('ALERT SAVED') || false, storage: localStorage.getItem('averae-back-in-stock-alerts') || '' })`);
    return { product, wishlistBefore, shared, notification };
  } finally { socket.close(); }
}

describe('Reviews, recommendations, and wishlist utilities pointer flow', () => {
  it('keeps the new discovery and saved-item actions usable at desktop and mobile widths', async () => {
    for (const [index, mobile] of [false, true].entries()) {
      const port = 9235 + index;
      const chrome = spawn('/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/averae-reviews-wishlist-${process.pid}-${index}`, 'about:blank'], { stdio: 'ignore' });
      try {
        await waitForDevTools(port);
        const result = await audit(port, mobile);
        expect(result.product.emptyReviews).toBe(true);
        expect(result.product.recommendationCount).toBeGreaterThan(0);
        expect(result.product.nextRecommendation).toBe(true);
        expect(result.wishlistBefore.share).toBe(true);
        expect(result.wishlistBefore.notify).toBe(true);
        expect(result.wishlistBefore.unavailable).toBe(true);
        expect(result.shared.input).toContain('/wishlist?share=8');
        expect(result.shared.feedback).toMatch(/Wishlist link copied|Link ready/);
        expect(result.notification.saved).toBe(true);
        expect(result.notification.storage).toContain('8');
      } finally { chrome.kill('SIGTERM'); }
    }
  }, 30000);
});

