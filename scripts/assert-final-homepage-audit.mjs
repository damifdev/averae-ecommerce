import fs from 'node:fs';

const assets = JSON.parse(fs.readFileSync('/tmp/averae-department-asset-validation.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('/tmp/averae-homepage-audit.json', 'utf8'));
if (!assets.allFinalSizeWebp || !assets.hashesDistinct) throw new Error('Asset finality assertions failed');
for (const viewport of audit) {
  if (Object.values(viewport.departmentImages).some(value => !value)) {
    throw new Error(`Department URL assertion failed at ${viewport.viewport}`);
  }
}
console.log(JSON.stringify({
  assets: { assetCount: assets.assetCount, allFinalSizeWebp: assets.allFinalSizeWebp, hashesDistinct: assets.hashesDistinct },
  viewports: audit.map(viewport => ({ viewport: viewport.viewport, departmentImages: viewport.departmentImages })),
}, null, 2));
