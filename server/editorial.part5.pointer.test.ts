import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type CdpMessage = { id?: number; result?: { result?: { value?: unknown }; exceptionDetails?: { text?: string } }; error?: { message?: string } };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';

async function waitForDevTools(port: number) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return; } catch { /* Chromium is starting. */ }
    await sleep(100);
  }
  throw new Error('Chromium remote debugging did not start');
}

async function auditEdit(port: number) {
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/edit`)}`, { method: 'PUT' })).json() as { webSocketDebuggerUrl: string };
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map<number, (message: CdpMessage) => void>();
  let nextId = 1;
  socket.addEventListener('message', event => { const message = JSON.parse(String(event.data)) as CdpMessage; if (message.id) pending.get(message.id)?.(message); if (message.id) pending.delete(message.id); });
  await new Promise<void>((resolve, reject) => { socket.addEventListener('open', () => resolve(), { once: true }); socket.addEventListener('error', () => reject(new Error('Could not connect to Chromium DevTools')), { once: true }); });
  const command = (method: string, params: Record<string, unknown> = {}) => new Promise<CdpMessage>(resolve => { const id = nextId++; pending.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async <T,>(expression: string) => { const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.error || response.result?.exceptionDetails) throw new Error(`${response.error?.message ?? response.result?.exceptionDetails?.text ?? 'Evaluation failed'} :: ${expression.slice(0, 180)}`); return response.result?.result?.value as T; };
  try {
    await command('Page.enable');
    await command('Page.navigate', { url: `${baseUrl}/edit` });
    await sleep(900);
    const initial = await evaluate<{ cards: number; hasTaxonomy: boolean; hasMetadata: boolean }>(`(() => ({ cards: document.querySelectorAll('a[aria-label^="Read "]').length, hasTaxonomy: Boolean(document.querySelector('[aria-label="Edit categories"]')), hasMetadata: document.body.innerText.toLowerCase().includes('min read') && document.body.innerText.includes('2026') }))()`);
    await evaluate(`(() => { const button = [...document.querySelectorAll('[aria-label="Edit categories"] button')].find(item => item.textContent?.trim() === 'African Fashion'); button?.click(); })()`);
    await sleep(120);
    const filtered = await evaluate<{ visible: number; categoryVisible: boolean }>(`(() => ({ visible: [...document.querySelectorAll('a[aria-label^="Read "]')].filter(item => item.offsetParent !== null).length, categoryVisible: Boolean([...document.querySelectorAll('[aria-label="Edit categories"] button')].find(item => item.textContent?.trim() === 'African Fashion' && item.getAttribute('aria-pressed') === 'true')) }))()`);
    await evaluate(`document.querySelector('a[aria-label^="Read "]')?.click()`);
    await sleep(500);
    const article = await evaluate<{ breadcrumb: boolean; related: boolean; look: boolean; addAll: boolean }>(`(() => ({ breadcrumb: Boolean(document.querySelector('[aria-label="Breadcrumb"]')), related: document.body.innerText.includes('Shop related products.'), look: document.body.innerText.includes('THIS LOOK'), addAll: document.body.innerText.includes('ADD ALL TO BAG') }))()`);
    return { initial, filtered, article };
  } finally { socket.close(); }
}

describe('Áveraẹ Edit Part 5 pointer interactions', () => {
  it('filters editorial stories and exposes article shopping journeys', async () => {
    const port = 9236;
    const chrome = spawn('/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/averae-editorial-audit-${process.pid}`, 'about:blank'], { stdio: 'ignore' });
    try {
      await waitForDevTools(port);
      const result = await auditEdit(port);
      expect(result.initial.cards).toBeGreaterThanOrEqual(8);
      expect(result.initial.hasTaxonomy).toBe(true);
      expect(result.initial.hasMetadata).toBe(true);
      expect(result.filtered.visible).toBe(1);
      expect(result.filtered.categoryVisible).toBe(true);
      expect(result.article.breadcrumb).toBe(true);
      expect(result.article.related).toBe(true);
      expect(result.article.look).toBe(true);
      expect(result.article.addAll).toBe(true);
    } finally { chrome.kill('SIGTERM'); }
  }, 30000);
});
