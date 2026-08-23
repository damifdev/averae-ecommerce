import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
};

type FilterAudit = {
  initialCount: string;
  brandCount: string;
  collectionCount: string;
  ratingCount: string;
  chipLabelsBeforeRemoval: string[];
  chipLabelsAfterRemoval: string[];
  finalCount: string;
  mobileFilterOpened: boolean;
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

async function runFilterAudit(port: number, mobile: boolean): Promise<FilterAudit> {
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
  const clickSelector = async (selector: string) => {
    const point = await evaluate<{ x: number; y: number } | null>(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (!point) throw new Error(`Could not find clickable selector ${selector}`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(180);
  };
  const selectFilter = async (key: string, value: string) => {
    const found = await evaluate<boolean>(`(() => {
      const select = [...document.querySelectorAll(${JSON.stringify(`[data-testid="filter-${key}"] select`)})].find(candidate => {
        const rect = candidate.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!select) return false;
      select.value = ${JSON.stringify(value)};
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    if (!found) throw new Error(`Could not find ${key} filter`);
    await sleep(180);
  };
  const snapshot = () => evaluate<{ count: string; chips: string[] }>(`(() => ({
    count: document.querySelector('[data-testid="product-count"]')?.textContent?.trim() ?? '',
    chips: [...document.querySelectorAll('[data-testid="active-filter-chips"] button')].map(button => button.textContent?.trim() ?? ''),
  }))()`);

  try {
    await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
    await command('Page.navigate', { url: `${baseUrl}/shop` });
    await sleep(1000);

    let mobileFilterOpened = false;
    if (mobile) {
      await clickSelector('[data-testid="mobile-filter-trigger"]');
      mobileFilterOpened = await evaluate<boolean>('Boolean(document.querySelector("[role=dialog][aria-label=\\"Product filters\\"]"))');
      if (!mobileFilterOpened) throw new Error('Mobile product filter drawer did not open');
    }

    const initial = await snapshot();
    await selectFilter('brand', 'Ona Atelier');
    const afterBrand = await snapshot();
    await selectFilter('collection', 'Quiet Form');
    const afterCollection = await snapshot();
    await selectFilter('rating', 'Not yet rated');
    const afterRating = await snapshot();

    if (mobile) await evaluate('document.querySelector("[aria-label=\\"Close filters\\"]")?.click()');
    await sleep(150);
    const chipLabelsBeforeRemoval = (await snapshot()).chips;
    await evaluate(`(() => {
      const chip = [...document.querySelectorAll('[data-testid="active-filter-chips"] button')].find(button => button.textContent?.includes('Ona Atelier'));
      chip?.click();
    })()`);
    await sleep(180);
    const chipLabelsAfterRemoval = (await snapshot()).chips;
    await clickSelector('[data-testid="clear-all-filters"]');
    await sleep(180);
    const final = await snapshot();

    return {
      initialCount: initial.count,
      brandCount: afterBrand.count,
      collectionCount: afterCollection.count,
      ratingCount: afterRating.count,
      chipLabelsBeforeRemoval,
      chipLabelsAfterRemoval,
      finalCount: final.count,
      mobileFilterOpened,
    };
  } finally {
    socket.close();
  }
}

describe('Shop metadata filter pointer flow', () => {
  it('applies and clears brand, collection, and truthful rating filters on desktop and mobile', async () => {
    for (const [index, mobile] of [false, true].entries()) {
      const port = 9227 + index;
      const chrome = spawn('/usr/bin/chromium', [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=/tmp/averae-shop-filters-${process.pid}-${index}`,
        'about:blank',
      ], { stdio: 'ignore' });
      try {
        await waitForDevTools(port);
        const result = await runFilterAudit(port, mobile);
        expect(result.initialCount).toBe('12 products');
        expect(result.brandCount).toBe('2 products');
        expect(result.collectionCount).toBe('2 products');
        expect(result.ratingCount).toBe('2 products');
        expect(result.chipLabelsBeforeRemoval).toEqual(expect.arrayContaining(['Ona Atelier', 'Quiet Form', 'Not yet rated']));
        expect(result.chipLabelsAfterRemoval).not.toContain('Ona Atelier');
        expect(result.chipLabelsAfterRemoval).toEqual(expect.arrayContaining(['Quiet Form', 'Not yet rated']));
        expect(result.finalCount).toBe('12 products');
        expect(result.mobileFilterOpened).toBe(mobile);
      } finally {
        chrome.kill('SIGTERM');
      }
    }
  }, 30000);
});
