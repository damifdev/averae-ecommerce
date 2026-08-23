import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = {
  id?: number;
  result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  error?: { message?: string };
};

type PointerResult = {
  before: string;
  after: string;
  label: string;
  cardHovered: boolean;
  hitTarget: string;
  hoverCapable: boolean;
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

async function pointerAudit(sectionTitle: string, port: number): Promise<PointerResult> {
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
    await sleep(1200);
    await evaluate(`(() => {
      const skip = [...document.querySelectorAll('button')].find(button => button.textContent?.trim().toLowerCase() === 'skip intro');
      skip?.click();
      return Boolean(skip);
    })()`);
    await sleep(1000);

    const target = await evaluate<{ x: number; y: number; before: string } | null>(`(() => {
      const heading = [...document.querySelectorAll('h2')].find(element => element.textContent?.trim().toLowerCase() === ${JSON.stringify(sectionTitle.toLowerCase())});
      const card = heading?.closest('section')?.querySelector('article.group');
      const image = card?.querySelector('img');
      const overlay = card?.querySelector('a.absolute.bottom-3');
      if (!image || !overlay) return null;
      image.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      const rect = image.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, before: getComputedStyle(overlay).opacity };
    })()`);
    if (!target) throw new Error(`Could not find the ${sectionTitle} product-card hover target`);
    await sleep(250);

    await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: target.x, y: target.y, button: 'none' });
    await sleep(150);
    const after = await evaluate<{ opacity: string; label: string; cardHovered: boolean; hitTarget: string }>(`(() => {
      const heading = [...document.querySelectorAll('h2')].find(element => element.textContent?.trim().toLowerCase() === ${JSON.stringify(sectionTitle.toLowerCase())});
      const card = heading?.closest('section')?.querySelector('article.group');
      const overlay = card?.querySelector('a.absolute.bottom-3');
      const hit = document.elementFromPoint(${target.x}, ${target.y});
      return { opacity: overlay ? getComputedStyle(overlay).opacity : '', label: overlay?.textContent?.trim() ?? '', cardHovered: Boolean(card?.matches(':hover')), hitTarget: hit ? hit.tagName.toLowerCase() + '.' + hit.className : '', hoverCapable: window.matchMedia('(hover: hover)').matches };
    })()`);
    return { before: target.before, after: after.opacity, label: after.label, cardHovered: after.cardHovered, hitTarget: after.hitTarget, hoverCapable: after.hoverCapable };
  } finally {
    socket.close();
  }
}

describe('homepage product-image pointer overlays', () => {
  it('reveals VIEW PRODUCT on pointer hover in both requested sections', async () => {
    const port = 9223;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-pointer-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      const newArrivals = await pointerAudit('New arrivals', port);
      const editorsPicks = await pointerAudit('The Editor’s Picks', port);

      expect(newArrivals).toMatchObject({ label: 'View product', cardHovered: true });
      expect(editorsPicks).toMatchObject({ label: 'View product', cardHovered: true });
      expect(newArrivals.before).toBe(newArrivals.hoverCapable ? '0' : '1');
      expect(editorsPicks.before).toBe(editorsPicks.hoverCapable ? '0' : '1');
      expect(Number(newArrivals.after)).toBeGreaterThan(0.95);
      expect(Number(editorsPicks.after)).toBeGreaterThan(0.95);
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 20000);
});

async function heroTabletAudit(viewportWidth: number, viewportHeight: number, port: number) {
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
    await command('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
    await command('Page.navigate', { url: `${baseUrl}/` });
    await sleep(1200);
    await evaluate(`(() => { const skip = [...document.querySelectorAll('button')].find(button => button.textContent?.trim().toLowerCase() === 'skip intro'); skip?.click(); return Boolean(skip); })()`);
    await sleep(1000);
    return await evaluate<{ complete: boolean; naturalWidth: number; objectPosition: string; width: number; height: number }>(`(() => {
      const image = document.querySelector('img[alt^="A diverse group styled"]');
      const rect = image?.getBoundingClientRect();
      const style = image ? getComputedStyle(image) : null;
      return { complete: Boolean(image?.complete), naturalWidth: image?.naturalWidth ?? 0, objectPosition: style?.objectPosition ?? '', width: rect?.width ?? 0, height: rect?.height ?? 0 };
    })()`);
  } finally {
    socket.close();
  }
}

describe('homepage hero tablet framing', () => {
  it('keeps the loaded hero image top-aligned and fully framed at tablet widths', async () => {
    const port = 9224;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-tablet-audit-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });

    try {
      await waitForDevTools(port);
      for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 900 }]) {
        const hero = await heroTabletAudit(viewport.width, viewport.height, port);
        expect(hero.complete).toBe(true);
        expect(hero.naturalWidth).toBeGreaterThan(0);
        expect(hero.objectPosition).toBe('50% 0%');
        expect(hero.width).toBeGreaterThanOrEqual(viewport.width - 24);
        expect(hero.height).toBeGreaterThanOrEqual(650);
      }
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 30000);
});

async function shopTouchActionAudit(port: number) {
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
    await sleep(900);
    return await evaluate<{ label: string; opacity: string; color: string; background: string; width: number; height: number }>(`(() => {
      const action = document.querySelector('article.group .product-card-overlay button, article.group .product-card-overlay a');
      const style = action ? getComputedStyle(action) : null;
      const rect = action?.getBoundingClientRect();
      return { label: action?.textContent?.trim() ?? '', opacity: style?.opacity ?? '', color: style?.color ?? '', background: style?.backgroundColor ?? '', width: rect?.width ?? 0, height: rect?.height ?? 0 };
    })()`);
  } finally {
    socket.close();
  }
}

describe('Shop touch product actions', () => {
  it('keeps QUICK ADD or SELECT OPTIONS readable without hover on mobile', async () => {
    const port = 9225;
    const chrome = spawn('/usr/bin/chromium', [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=/tmp/averae-shop-touch-${process.pid}`,
      'about:blank',
    ], { stdio: 'ignore' });
    try {
      await waitForDevTools(port);
      const action = await shopTouchActionAudit(port);
      expect(['Quick view', 'Quick add', 'Select options']).toContain(action.label);
      expect(Number(action.opacity)).toBeGreaterThan(0.95);
      expect(action.color).not.toBe(action.background);
      expect(action.width).toBeGreaterThan(100);
      expect(action.height).toBeGreaterThan(20);
    } finally {
      chrome.kill('SIGTERM');
    }
  }, 20000);
});
