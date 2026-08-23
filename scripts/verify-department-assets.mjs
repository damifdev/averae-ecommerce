import { createHash } from 'node:crypto';

const baseUrl = process.env.UX_TEST_BASE_URL ?? 'http://127.0.0.1:3000';
const assets = [
  ['clothing', '/manus-storage/averae-department-clothing_b3b7c47b.jpg'],
  ['shoes', '/manus-storage/averae-department-shoes-v2_a6a9e572.jpg'],
  ['bags', '/manus-storage/averae-department-bags-v2_199bf048.jpg'],
  ['jewelry', '/manus-storage/averae-department-jewelry-v2_8be58182.jpg'],
  ['accessories', '/manus-storage/averae-department-accessories-v2_af4f197a.jpg'],
  ['watches', '/manus-storage/averae-department-watches-v2_77fa47cf.jpg'],
  ['beauty-lifestyle', '/manus-storage/averae-department-beauty-lifestyle-v2_4ea1504e.jpg'],
];

const results = [];
for (const [slug, path] of assets) {
  const response = await fetch(`${baseUrl}${path}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(bytes).digest('hex');
  const signature = bytes.subarray(0, 4).toString('ascii');
  const isWebp = signature === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const result = { slug, path, status: response.status, contentType: response.headers.get('content-type') ?? '', bytes: bytes.length, signature, isWebp, hash };
  results.push(result);
  if (!response.ok || !result.isWebp || result.bytes < 300000) throw new Error(`Asset validation failed for ${slug}: ${JSON.stringify(result)}`);
}
if (new Set(results.map(result => result.hash)).size !== results.length) throw new Error('Department assets are not byte-distinct');
console.log(JSON.stringify({ assetCount: results.length, allFinalSizeWebp: true, hashesDistinct: true, results }, null, 2));
