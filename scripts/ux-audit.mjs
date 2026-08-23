import { spawn } from 'node:child_process';

const baseUrl = 'http://127.0.0.1:3000';
const chrome = spawn('/usr/bin/chromium', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--remote-debugging-port=9222',
  '--user-data-dir=/tmp/averae-ux-audit',
  'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDevTools() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9222/json/version');
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error('Chromium remote debugging did not start');
}

await waitForDevTools();
const tabResponse = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' });
const tab = await tabResponse.json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  const resolve = pending.get(message.id);
  if (resolve) {
    pending.delete(message.id);
    resolve(message);
  }
});

function command(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise(resolve => pending.set(id, resolve));
}

async function evaluate(expression) {
  const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.error) throw new Error(response.error.message);
  if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
  return response.result?.result?.value;
}

async function navigate(path) {
  await command('Page.navigate', { url: `${baseUrl}${path}` });
  await sleep(900);
}

async function clickAndRead(href) {
  const clickResult = await evaluate(`(() => {
    const link = [...document.querySelectorAll('a')].find(candidate => candidate.getAttribute('href') === ${JSON.stringify(href)});
    if (!link) return { found: false };
    link.click();
    return { found: true };
  })()`);
  await sleep(500);
  const state = await evaluate(`({ href: location.pathname + location.search, heading: document.querySelector('h1')?.textContent?.trim() || '', body: document.body.innerText })`);
  return { ...clickResult, ...state };
}

async function auditViewport(width, height) {
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  const expectedDepartmentImages = {
    clothing: '/manus-storage/averae-department-clothing_b3b7c47b.jpg',
    shoes: '/manus-storage/averae-department-shoes-v2_a6a9e572.jpg',
    bags: '/manus-storage/averae-department-bags-v2_199bf048.jpg',
    jewelry: '/manus-storage/averae-department-jewelry-v2_8be58182.jpg',
    accessories: '/manus-storage/averae-department-accessories-v2_af4f197a.jpg',
    watches: '/manus-storage/averae-department-watches-v2_77fa47cf.jpg',
    'beauty-lifestyle': '/manus-storage/averae-department-beauty-lifestyle-v2_4ea1504e.jpg',
  };
  await navigate('/');
  const departmentImages = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('img[alt$=" category"]')];
    return Object.fromEntries(Object.entries(${JSON.stringify(expectedDepartmentImages)}).map(([slug, src]) => [slug, cards.some(card => card.getAttribute('src') === src)]));
  })()`);
  const categories = ['clothing', 'shoes', 'bags', 'jewelry', 'accessories', 'watches', 'beauty-lifestyle'];
  const categoryResults = {};
  for (const slug of categories) {
    await navigate('/');
    categoryResults[slug] = await clickAndRead(`/shop?category=${slug}`);
  }

  const audiences = ['women', 'men', 'kids', 'unisex'];
  const audienceResults = {};
  for (const slug of audiences) {
    await navigate('/');
    audienceResults[slug] = await clickAndRead(`/shop?audience=${slug}`);
  }

  await navigate('/');
  const editLanding = await clickAndRead('/edit');
  await navigate('/edit');
  const articleResult = await evaluate(`(() => {
    const link = document.querySelector('a[href^="/edit/"]');
    if (!link) return { found: false };
    link.click();
    return { found: true };
  })()`);
  await sleep(500);
  const articleState = await evaluate(`(() => { const body = document.body.innerText.toLowerCase(); return { href: location.pathname, hasStory: body.includes('the story'), hasShopTheLook: body.includes('shop the look') }; })()`);

  await navigate('/');
  const searchOpen = await evaluate(`(() => {
    const link = document.querySelector('a[aria-label="Search"]');
    if (!link) return { found: false };
    link.click();
    return { found: true };
  })()`);
  await sleep(500);
  const searchInput = await evaluate(`document.querySelector('input[placeholder*="Search"]') ? true : false`);
  if (searchInput) {
    await evaluate(`document.querySelector('input[placeholder*="Search"]').focus()`);
    await command('Input.insertText', { text: 'trend' });
    await sleep(300);
  }
  const searchState = await evaluate(`({ value: document.querySelector('input[placeholder*="Search"]')?.value || '', hasDiscoveryHint: document.body.innerText.includes('Discovery result found in Trending Now or The Edit') })`);

  async function typeProductSearch(term) {
    await navigate('/shop');
    await evaluate(`document.querySelector('input[placeholder*="Search"]')?.focus()`);
    await command('Input.insertText', { text: term });
    await sleep(300);
    return evaluate(`({ value: document.querySelector('input[placeholder*="Search"]')?.value || '', productCardCount: document.querySelectorAll('article.group').length })`);
  }
  const matchingSearch = await typeProductSearch('linen');
  const emptySearch = await typeProductSearch('zzzz');

  return { viewport: `${width}x${height}`, departmentImages, categoryResults, audienceResults, editLanding, articleResult: { ...articleResult, ...articleState }, search: { ...searchOpen, inputFound: searchInput, ...searchState }, searchFiltering: { matchingSearch, emptySearch } };
}

await command('Page.enable');
const results = [await auditViewport(1280, 900), await auditViewport(390, 844)];
console.log(JSON.stringify(results, null, 2));
ws.close();
chrome.kill('SIGTERM');
