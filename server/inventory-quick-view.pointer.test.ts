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

async function runInventoryAudit(port: number) {
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
  const clickAtSelector = async (selector: string) => {
    const point = await evaluate<{ x: number; y: number } | null>(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (!point) throw new Error(`Could not find ${selector}`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(220);
  };

  try {
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(1000);
    await clickAtSelector('[data-testid="product-card-3"] button[aria-label^="Quick view"]');

    const initial = await evaluate<{ dialog: boolean; disabledSize: boolean; disabledLabel: string; selectedSize: string; addDisabled: boolean }>(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      const unavailable = [...(dialog?.querySelectorAll('[aria-label^="Size M"]') ?? [])][0];
      return {
        dialog: Boolean(dialog),
        disabledSize: Boolean(unavailable && unavailable.hasAttribute('disabled') && unavailable.getAttribute('aria-disabled') === 'true'),
        disabledLabel: unavailable?.getAttribute('aria-label') ?? '',
        selectedSize: dialog?.querySelector('[aria-label="Size options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '',
        addDisabled: Boolean(dialog?.querySelector('[data-testid="quick-view-add"]')?.hasAttribute('disabled')),
      };
    })()`);

    await evaluate(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      const available = [...(dialog?.querySelectorAll('[aria-label^="Select size"]') ?? [])].find(button => button.textContent?.trim() === 'L');
      available?.click();
    })()`);
    await sleep(120);
    const selected = await evaluate<{ size: string; addDisabled: boolean }>(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      return {
        size: dialog?.querySelector('[aria-label="Size options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '',
        addDisabled: Boolean(dialog?.querySelector('[data-testid="quick-view-add"]')?.hasAttribute('disabled')),
      };
    })()`);

    await evaluate('document.querySelector("[data-testid=\\"quick-view-add\\"]")?.click()');
    await sleep(150);
    const bag = await evaluate<{ label: string; stored: string | null }>(`(() => ({
      label: document.querySelector('[data-testid="quick-view-add"]')?.textContent?.trim() ?? '',
      stored: localStorage.getItem('averae-cart'),
    }))()`);
    return { ...initial, ...selected, bagLabel: bag.label, stored: bag.stored };
  } finally {
    socket.close();
  }
}

describe('Inventory-aware Quick View pointer flow', () => {
  it('disables an out-of-stock size and adds only the selected available size', async () => {
    const port = 9228;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-inventory-quick-view-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      const result = await runInventoryAudit(port);
      expect(result.dialog).toBe(true);
      expect(result.disabledSize).toBe(true);
      expect(result.disabledLabel).toContain('out of stock');
      expect(result.selectedSize).toBe('XS');
      expect(result.addDisabled).toBe(false);
      expect(result.size).toBe('L');
      expect(result.bagLabel).toContain('Added to bag');
      expect(result.stored).toContain('"size":"L"');
      expect(result.stored).not.toContain('"size":"M"');
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 20000);
});
