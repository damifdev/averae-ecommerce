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

async function auditProductAndWishlist(port: number) {
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
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await command('Page.navigate', { url: `${baseUrl}/product/3` });
    await sleep(900);
    await evaluate(`localStorage.removeItem('averae-wishlist'); localStorage.removeItem('averae-cart'); location.reload()`);
    await sleep(900);
    const initial = await evaluate<{ disabled: boolean; aria: string }>(`(() => { const button = [...document.querySelectorAll('[aria-label^="M,"]')][0]; return { disabled: Boolean(button?.disabled), aria: button?.getAttribute('aria-label') ?? '' }; })()`);
    const keyboardControls = await evaluate<boolean>(`(() => { const selectors = ['[aria-label="Select Black"]', '[aria-label="Previous product image"]', '[aria-label="Next product image"]', '[role="tab"]']; return selectors.every(selector => { const element = document.querySelector(selector); if (!element || (element instanceof HTMLButtonElement && element.disabled)) return false; element.focus(); return document.activeElement === element; }); })()`);
    await evaluate(`document.querySelector('[data-testid="add-to-bag"]')?.click()`);
    await sleep(100);
    const validation = await evaluate<boolean>(`Boolean(document.querySelector('[data-testid="size-error"]')?.textContent?.includes('Please select a size.'))`);
    const keyboardFocusable = await evaluate<boolean>(`(() => { const button = document.querySelector('[data-testid="size-guide"]'); if (!button) return false; button.focus(); return document.activeElement === button && button.tagName === 'BUTTON'; })()`);
    await evaluate(`document.querySelector('[data-testid="size-guide"]')?.click()`);
    await sleep(100);
    const guide = await evaluate<boolean>(`Boolean(document.querySelector('[role="dialog"]')?.textContent?.includes('Size guide'))`);
    await evaluate(`document.querySelector('[data-slot="dialog-close"]')?.click()`);
    await sleep(180);
    await evaluate(`document.querySelector('[aria-label^="S,"]')?.click()`);
    await sleep(120);
    await evaluate(`document.querySelector('[data-testid="buy-now"]')?.click()`);
    await sleep(260);
    const buyNow = await evaluate<boolean>(`location.pathname === '/checkout'`);
    await evaluate(`location.href = '${baseUrl}/product/3'`);
    await sleep(700);
    await evaluate(`document.querySelector('[aria-label^="S,"]')?.click()`);
    await sleep(120);
    const beforeSwipe = await evaluate<string>(`document.querySelector('main section img')?.getAttribute('alt') ?? ''`);
    await evaluate(`(() => { const surface = document.querySelector('main section .motion-surface'); if (!surface) return false; const start = new Event('touchstart', { bubbles: true }); Object.defineProperty(start, 'changedTouches', { value: [{ clientX: 300 }] }); surface.dispatchEvent(start); const end = new Event('touchend', { bubbles: true }); Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 80 }] }); surface.dispatchEvent(end); return true; })()`);
    await sleep(180);
    const swipe = await evaluate<boolean>(`(document.querySelector('main section img')?.getAttribute('alt') ?? '') !== ${JSON.stringify(beforeSwipe)}`);
    await evaluate(`document.querySelector('[data-testid="add-to-bag"]')?.click()`);
    await sleep(180);
    const added = await evaluate<{ confirmation: boolean; stored: string | null; continueShopping: boolean; viewBag: boolean }>(`({ confirmation: Boolean(document.querySelector('[data-testid="add-to-bag-confirmation"]')), stored: localStorage.getItem('averae-cart'), continueShopping: Array.from(document.querySelectorAll('a')).some(link => (link.textContent || '').includes('CONTINUE SHOPPING')), viewBag: Array.from(document.querySelectorAll('a')).some(link => (link.textContent || '').includes('VIEW BAG')) })`);
    await evaluate(`document.querySelector('[data-testid="wishlist-save"]')?.click();`);
    await sleep(100);
    await evaluate(`location.href = '${baseUrl}/wishlist'`);
    await sleep(800);
    const wishlist = await evaluate<{ title: string; moveButton: boolean; keyboardActions: boolean }>(`(() => { const move = Array.from(document.querySelectorAll('button')).find(button => (button.textContent || '').includes('MOVE TO BAG')); const remove = document.querySelector('button[aria-label^="Remove "]'); const focusMove = move ? (move.focus(), document.activeElement === move) : false; const focusRemove = remove ? (remove.focus(), document.activeElement === remove) : false; return { title: document.querySelector('h1')?.textContent?.trim() ?? '', moveButton: Boolean(move), keyboardActions: focusMove && focusRemove }; })()`);
    return { initial, validation, keyboardControls, keyboardFocusable, guide, buyNow, swipe, added, wishlist };
  } finally { socket.close(); }
}

describe('Product Detail and Wishlist pointer flow', () => {
  it('validates required size, opens the size guide, saves a product, and exposes wishlist actions on mobile', async () => {
    const port = 9230;
    const chrome = spawn('/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/averae-product-wishlist-audit-${process.pid}`, 'about:blank'], { stdio: 'ignore' });
    try {
      await waitForDevTools(port);
      const result = await auditProductAndWishlist(port);
      expect(result.initial.disabled).toBe(true);
      expect(result.initial.aria).toContain('out of stock');
      expect(result.validation).toBe(true);
      expect(result.keyboardControls).toBe(true);
      expect(result.keyboardFocusable).toBe(true);
      expect(result.guide).toBe(true);
      expect(result.buyNow).toBe(true);
      expect(result.swipe).toBe(true);
      expect(result.added.confirmation).toBe(true);
      expect(result.added.continueShopping).toBe(true);
      expect(result.added.viewBag).toBe(true);
      expect(result.added.stored).toContain('"size":"S"');
      expect(result.wishlist.title).toBe('Your wishlist');
      expect(result.wishlist.moveButton).toBe(true);
      expect(result.wishlist.keyboardActions).toBe(true);
    } finally { chrome.kill('SIGTERM'); }
  }, 20000);
});
