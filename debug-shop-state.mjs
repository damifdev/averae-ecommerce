import { spawn } from 'node:child_process';
const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const port = 9341;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const chrome = spawn('/usr/bin/chromium', ['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,`--user-data-dir=/tmp/averae-debug-shop-${process.pid}`,'about:blank'], {stdio:'ignore'});
try {
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break; } catch {} await sleep(100); }
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/shop`)}`, {method:'PUT'})).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl); const pending = new Map(); let id = 1;
  ws.addEventListener('message', event => { const m = JSON.parse(String(event.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, {once:true}); ws.addEventListener('error', reject, {once:true}); });
  const cmd = (method, params={}) => new Promise(resolve => { const current = id++; pending.set(current, resolve); ws.send(JSON.stringify({id: current, method, params})); });
  const evaluate = async expression => { const response = await cmd('Runtime.evaluate',{expression,returnByValue:true}); return response.result?.result?.value; };
  await cmd('Page.enable'); await cmd('Page.navigate',{url:`${baseUrl}/shop`}); await sleep(1200);
  console.log('initial', await evaluate('({url:location.href, sort:document.querySelector(\'select[aria-label="Sort products"]\')?.value, count:document.querySelector(\'[data-testid="product-count"]\')?.textContent})'));
  await evaluate(`(() => { const s=document.querySelector('select[aria-label="Sort products"]'); s.value='Price: Low to High'; s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`); await sleep(700);
  console.log('sorted', await evaluate('({url:location.href, sort:document.querySelector(\'select[aria-label="Sort products"]\')?.value, first:document.querySelector(\'article[data-testid^="product-card-"] > div:nth-child(2) a\')?.textContent?.trim()})'));
  await evaluate(`(() => { document.querySelector('[data-testid="mobile-filter-trigger"]')?.click(); return true; })()`); await sleep(150);
  for (const [key, value] of [['brand','Ona Atelier'],['collection','Quiet Form'],['rating','Not yet rated']]) await evaluate(`(() => { const s=[...document.querySelectorAll('[data-testid="filter-${key}"] select')].find(x=>x.getBoundingClientRect().width>0); s.value=${JSON.stringify(value)}; s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`), await sleep(120);
  await evaluate(`document.querySelector('[data-testid="apply-filters"]')?.click()`); await sleep(700);
  console.log('applied', await evaluate('({url:location.href,count:document.querySelector(\'[data-testid="product-count"]\')?.textContent,chips:[...document.querySelectorAll(\'[data-testid="active-filter-chips"] button\')].map(x=>x.textContent.trim())})'));
  await evaluate(`(() => { const chip=[...document.querySelectorAll('[data-testid="active-filter-chips"] button')].find(x=>x.textContent.includes('Ona Atelier')); chip?.click(); return true; })()`); await sleep(700);
  console.log('removed', await evaluate('({url:location.href,count:document.querySelector(\'[data-testid="product-count"]\')?.textContent,chips:[...document.querySelectorAll(\'[data-testid="active-filter-chips"] button\')].map(x=>x.textContent.trim())})'));
  ws.close();
} finally { chrome.kill('SIGTERM'); }
