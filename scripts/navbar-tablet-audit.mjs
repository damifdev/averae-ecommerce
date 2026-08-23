import { spawn } from 'node:child_process';

const baseUrl = 'http://127.0.0.1:3000';
const port = 9224;
const chrome = spawn('/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/averae-navbar-tablet-audit', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForDevTools() { for (let attempt = 0; attempt < 60; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) return; } catch {} await sleep(100); } throw new Error('Chromium remote debugging did not start'); }
await waitForDevTools();
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(baseUrl + '/shop')}`, { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let nextId = 1; const pending = new Map();
ws.addEventListener('message', event => { const message = JSON.parse(event.data); const resolve = pending.get(message.id); if (resolve) { pending.delete(message.id); resolve(message); } });
function command(method, params = {}) { const id = nextId++; ws.send(JSON.stringify({ id, method, params })); return new Promise(resolve => pending.set(id, resolve)); }
async function evaluate(expression) { const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text); return response.result?.result?.value; }
const selectorLiteral = selector => JSON.stringify(selector);
async function has(selector) { return evaluate(`Boolean(document.querySelector(${selectorLiteral(selector)}))`); }
async function navigate(path) { await command('Page.navigate', { url: `${baseUrl}${path}` }); await sleep(850); }
async function click(selector) { return evaluate(`(() => { const element = document.querySelector(${selectorLiteral(selector)}); if (!element) return false; element.click(); return true; })()`); }
async function clickVisibleAria(prefix) { return evaluate(`(() => { const element = [...document.querySelectorAll('button[aria-label]')].find(item => item.getAttribute('aria-label')?.startsWith(${selectorLiteral(prefix)}) && getComputedStyle(item).display !== 'none' && getComputedStyle(item).visibility !== 'hidden'); if (!element) return false; element.click(); return true; })()`); }
async function bodyHas(text) { return evaluate(`document.body.innerText.includes(${selectorLiteral(text)})`); }
async function auditDrawer(prefix, dialogLabel, closeLabel) {
  const dialogSelector = `[role="dialog"][aria-label="${dialogLabel}"]`;
  const triggerFound = await clickVisibleAria(prefix);
  await sleep(120);
  const open = await evaluate(`(() => { const panel = document.querySelector(${selectorLiteral(dialogSelector)}); return Boolean(panel && panel.className.includes('drawer-panel-open')); })()`);
  const closeFound = await click(`button[aria-label="${closeLabel}"]`);
  await sleep(45);
  const remainsDuringExit = await has(dialogSelector);
  const closedClassDuringExit = await evaluate(`(() => { const panel = document.querySelector(${selectorLiteral(dialogSelector)}); return Boolean(panel && !panel.className.includes('drawer-panel-open')); })()`);
  await sleep(360);
  const unmountedAfterExit = !(await has(dialogSelector));
  return { triggerFound, open, closeFound, remainsDuringExit, closedClassDuringExit, unmountedAfterExit };
}
async function auditTablet() {
  await command('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
  await navigate('/shop');
  const menuOpened = await click('button[aria-label="Open menu"]'); await sleep(150);
  const menuState = { triggerFound: menuOpened, open: await has('button[aria-label="Close menu"]'), closeFound: await click('button[aria-label="Close menu"]') }; await sleep(100); menuState.closed = !(await has('button[aria-label="Close menu"]'));
  await navigate('/shop');
  const searchInputSelector = 'input[aria-label="Search products, brands, trends"]';
  const searchOpened = await click('button[aria-label="Search"]'); await sleep(150);
  const searchState = { triggerFound: searchOpened, inputVisible: await has(searchInputSelector), typedValue: await evaluate(`document.querySelector(${selectorLiteral(searchInputSelector)})?.value || ''`) };
  await evaluate(`document.querySelector(${selectorLiteral(searchInputSelector)})?.focus()`); await command('Input.insertText', { text: 'linen' }); await sleep(100); searchState.typedValue = await evaluate(`document.querySelector(${selectorLiteral(searchInputSelector)})?.value || ''`); searchState.closeFound = await click('button[aria-label="Close search"]'); await sleep(100); searchState.closed = !(await bodyHas('Search Áveraẹ'));
  await navigate('/shop');
  const accountOpened = await click('button[aria-label="Account"]'); await sleep(100); const accountState = { triggerFound: accountOpened, open: await evaluate(`document.querySelector(${selectorLiteral('button[aria-label="Account"]')})?.getAttribute('aria-expanded') === 'true'`) }; await evaluate('document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))'); await sleep(100); accountState.closedAfterOutside = !(await bodyHas('Your account'));
  await navigate('/shop');
  const wishlistState = await auditDrawer('Wishlist', 'Wishlist', 'Close wishlist');
  await navigate('/shop');
  const bagState = await auditDrawer('Bag', 'Shopping bag', 'Close bag');
  return { viewport: '768x1024', menu: menuState, search: searchState, account: accountState, wishlist: wishlistState, bag: bagState };
}
async function auditDesktopTransition() {
  await command('Emulation.setDeviceMetricsOverride', { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false }); await navigate('/trends');
  const mainNavSelector = 'nav[aria-label="Main navigation"]';
  const navState = await evaluate(`(() => { const desktop = document.querySelector(${selectorLiteral(mainNavSelector)}); const mobile = document.querySelector('button[aria-label="Open menu"]'); const trends = [...(desktop?.querySelectorAll('button') || [])].find(button => button.textContent?.trim().toLowerCase() === 'trends'); return { desktopNavVisible: Boolean(desktop && getComputedStyle(desktop).display !== 'none'), mobileTriggerVisible: Boolean(mobile && getComputedStyle(mobile).display !== 'none'), trendsActive: Boolean(trends?.className.includes('nav-link-active')) }; })()`);
  const trendOpened = await evaluate(`(() => { const button = [...document.querySelectorAll(${selectorLiteral(`${mainNavSelector} button`)})].find(item => item.textContent?.trim().toLowerCase() === 'trends'); if (!button) return false; button.click(); return true; })()`); await sleep(100); const menuOpen = await evaluate(`document.body.innerText.toLowerCase().includes('trending styles')`); const trendClosed = await evaluate(`(() => { const button = [...document.querySelectorAll(${selectorLiteral(`${mainNavSelector} button`)})].find(item => item.textContent?.trim().toLowerCase() === 'trends'); if (!button) return false; button.click(); return true; })()`); await sleep(100); const menuClosed = !(await evaluate(`document.body.innerText.toLowerCase().includes('trending styles')`));
  return { viewport: '1024x800', navState, megaMenu: { triggerFound: trendOpened, open: menuOpen, closeFound: trendClosed, closed: menuClosed } };
}
await command('Page.enable');
const results = [await auditTablet(), await auditDesktopTransition()];
console.log(JSON.stringify(results, null, 2));
ws.close(); chrome.kill('SIGTERM');
