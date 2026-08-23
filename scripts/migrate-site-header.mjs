import fs from 'node:fs';

const pages = ['Shop.tsx', 'ProductDetail.tsx', 'Cart.tsx', 'Account.tsx'];
for (const file of pages) {
  const path = `client/src/pages/${file}`;
  let source = fs.readFileSync(path, 'utf8');
  if (!source.includes("@/components/SiteHeader")) {
    source = source.replace(/(import[^\n]+;\n)/, `$1import SiteHeader from '@/components/SiteHeader';\n`);
  }
  source = source.replace(/<header[\s\S]*?<\/header>/, '<SiteHeader />');
  fs.writeFileSync(path, source);
}

const discoveryPath = 'client/src/pages/Discovery.tsx';
let discovery = fs.readFileSync(discoveryPath, 'utf8');
if (!discovery.includes("@/components/SiteHeader")) {
  discovery = discovery.replace(/(import[^\n]+;\n)/, `$1import SiteHeader from '@/components/SiteHeader';\n`);
}
discovery = discovery.replace(/<header[\s\S]*?<\/header>/, '<SiteHeader />');
fs.writeFileSync(discoveryPath, discovery);
