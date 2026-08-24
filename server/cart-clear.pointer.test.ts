import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';

async function auditCartClear(port: number) {
  const tabResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/cart`)}`, { method: 'PUT' });
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
    await command('Page.navigate', { url: `${baseUrl}/cart` });
    await sleep(700);
    await evaluate(`(() => {
      localStorage.setItem('averae-cart', JSON.stringify([{ id: 1, size: '', color: '', quantity: 1 }]));
      localStorage.setItem('averae-last-added-cart-item', JSON.stringify({ id: 1, size: '', color: '', quantity: 1 }));
      location.reload();
      return true;
    })()`);
    await sleep(800);

    const seeded = await evaluate<{ clearVisible: boolean; itemText: string; removeVisible: boolean }>(`(() => ({
      clearVisible: Boolean(document.querySelector('[data-testid="clear-bag"]')),
      itemText: document.body.textContent?.includes('Signature Linen Shirt') ? 'Signature Linen Shirt' : '',
      removeVisible: Boolean(document.querySelector('[data-testid^="remove-bag-item-"]')),
    }))()`);
    expect(seeded.clearVisible).toBe(true);
    expect(seeded.itemText).toBe('Signature Linen Shirt');
    expect(seeded.removeVisible).toBe(true);

    await evaluate(`document.querySelector('[data-testid^="remove-bag-item-"]')?.click()`);
    await sleep(180);
    const removed = await evaluate<{ undoVisible: boolean; persistedCart: string | null }>(`(() => ({
      undoVisible: Array.from(document.querySelectorAll('[data-sonner-toast] button')).some(button => button.textContent?.trim() === 'Undo'),
      persistedCart: localStorage.getItem('averae-cart'),
    }))()`);
    expect(removed.undoVisible).toBe(true);
    expect(removed.persistedCart).toBe('[]');

    await evaluate(`Array.from(document.querySelectorAll('[data-sonner-toast] button')).find(button => button.textContent?.trim() === 'Undo')?.click()`);
    await sleep(180);
    const restored = await evaluate<{ itemVisible: boolean; persistedCart: string | null }>(`(() => ({
      itemVisible: document.body.textContent?.includes('Signature Linen Shirt') ?? false,
      persistedCart: localStorage.getItem('averae-cart'),
    }))()`);
    expect(restored.itemVisible).toBe(true);
    expect(restored.persistedCart).toContain('"id":1');

    await evaluate(`document.querySelector('[data-testid="clear-bag"]')?.click()`);
    await sleep(120);
    const confirmation = await evaluate<{ dialogVisible: boolean; persistedCart: string | null }>(`(() => ({
      dialogVisible: Boolean(document.querySelector('[data-testid="clear-bag-dialog"]')),
      persistedCart: localStorage.getItem('averae-cart'),
    }))()`);
    expect(confirmation.dialogVisible).toBe(true);
    expect(confirmation.persistedCart).not.toBe('[]');

    await evaluate(`document.querySelector('[data-testid="clear-bag-confirm"]')?.click()`);
    await sleep(240);
    const cleared = await evaluate<{ emptyState: boolean; clearVisible: boolean; toastVisible: boolean; persistedCart: string | null; latestItem: string | null }>(`(() => ({
      emptyState: document.body.textContent?.includes('Your bag is waiting.') ?? false,
      clearVisible: Boolean(document.querySelector('[data-testid="clear-bag"]')),
      toastVisible: Array.from(document.querySelectorAll('[data-sonner-toast]')).some(toast => toast.textContent?.includes('Bag cleared')),
      persistedCart: localStorage.getItem('averae-cart'),
      latestItem: localStorage.getItem('averae-last-added-cart-item'),
    }))()`);
    expect(cleared.emptyState).toBe(true);
    expect(cleared.clearVisible).toBe(false);
    expect(cleared.toastVisible).toBe(true);
    expect(cleared.persistedCart).toBe('[]');
    expect(cleared.latestItem).toBeNull();
  } finally {
    socket.close();
  }
}

describe('cart clearing browser audit', () => {
  it('clears the selected bag lines and returns to the truthful empty state', async () => {
    const browserPort = Number(process.env.CHROMIUM_REMOTE_DEBUGGING_PORT ?? 9222);
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        await fetch(`http://127.0.0.1:${browserPort}/json/version`);
        break;
      } catch {
        await sleep(100);
      }
    }
    await auditCartClear(browserPort);
  }, 20000);
});
