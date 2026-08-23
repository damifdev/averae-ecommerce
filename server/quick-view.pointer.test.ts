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

async function runQuickViewAudit(port: number) {
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
    await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(1200);

    const trigger = await evaluate<{ x: number; y: number } | null>(`(() => {
      const button = document.querySelector('article.group button[aria-label^="Quick view"]');
      if (!button) return null;
      button.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      const rect = button.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (!trigger) throw new Error('Could not find the first Shop Quick View trigger');

    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: trigger.x, y: trigger.y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: trigger.x, y: trigger.y, button: 'left', clickCount: 1 });
    await sleep(250);

    const opened = await evaluate<{ dialog: boolean; title: string; selectedColor: string; selectedSize: string }>(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      const color = dialog?.querySelector('[aria-label="Colour options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '';
      const size = dialog?.querySelector('[aria-label="Size options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '';
      return { dialog: Boolean(dialog), title: dialog?.querySelector('h2')?.textContent?.trim() ?? '', selectedColor: color, selectedSize: size };
    })()`);
    if (!opened.dialog) throw new Error('Quick View did not open');

    await evaluate(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      const color = dialog?.querySelector('[aria-label="Colour options"] button:last-child');
      const size = dialog?.querySelector('[aria-label="Size options"] button:last-child');
      color?.click();
      size?.click();
    })()`);
    await sleep(100);

    const selected = await evaluate<{ color: string; size: string }>(`(() => {
      const dialog = document.querySelector('[data-testid="quick-view-dialog"]');
      return {
        color: dialog?.querySelector('[aria-label="Colour options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '',
        size: dialog?.querySelector('[aria-label="Size options"] button[aria-pressed="true"]')?.textContent?.trim() ?? '',
      };
    })()`);
    if (!selected.color || !selected.size) throw new Error('Quick View did not retain selected colour and size');

    await evaluate(`document.querySelector('[data-testid="quick-view-add"]')?.click()`);
    await sleep(150);
    const bag = await evaluate<{ label: string; stored: string | null }>(`(() => ({
      label: document.querySelector('[data-testid="quick-view-add"]')?.textContent?.trim() ?? '',
      stored: localStorage.getItem('averae-cart'),
    }))()`);
    return { ...opened, ...selected, bagLabel: bag.label, stored: bag.stored };
  } finally {
    socket.close();
  }
}

describe('Shop Quick View pointer flow', () => {
  it('opens on mobile, changes both variant controls, and adds the selected line to the bag', async () => {
    const port = 9226;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-quick-view-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      const result = await runQuickViewAudit(port);
      expect(result.title).toBeTruthy();
      expect(result.color).toBeTruthy();
      expect(result.size).toBeTruthy();
      expect(result.bagLabel).toContain('Added to bag');
      expect(result.stored).toContain(`"color":"${result.color}"`);
      expect(result.stored).toContain(`"size":"${result.size}"`);
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 20000);
});
