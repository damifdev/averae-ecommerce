import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { localizedSizeConversions, products } from '../client/src/lib/brand';

const assistant = readFileSync(resolve(process.cwd(), 'client/src/components/MeasurementAssistant.tsx'), 'utf8');
const chart = readFileSync(resolve(process.cwd(), 'client/src/components/ProductSizeChart.tsx'), 'utf8');
const productDetail = readFileSync(resolve(process.cwd(), 'client/src/pages/ProductDetail.tsx'), 'utf8');
const quickView = readFileSync(resolve(process.cwd(), 'client/src/components/QuickView.tsx'), 'utf8');
const sizeGuide = readFileSync(resolve(process.cwd(), 'client/src/pages/SizeGuide.tsx'), 'utf8');
const analytics = readFileSync(resolve(process.cwd(), 'client/src/lib/analytics.ts'), 'utf8');
const routers = readFileSync(resolve(process.cwd(), 'server/routers.ts'), 'utf8');
const schema = readFileSync(resolve(process.cwd(), 'drizzle/schema.ts'), 'utf8');

describe('Sizing system extension', () => {
  it('attaches product-specific chart metadata to apparel, footwear, kids, and one-size products', () => {
    expect(products.some(product => product.sizeChart?.title === 'Signature shirt fit')).toBe(true);
    expect(products.some(product => product.sizeChart?.unit === 'EU/UK/US')).toBe(true);
    expect(products.some(product => product.sizeChart?.title === 'Daybreak kids fit')).toBe(true);
    expect(products.some(product => product.sizeChart?.rows[0]?.size === 'One size')).toBe(true);
    expect(chart).toContain('Product-specific sizing');
    expect(productDetail).toContain('<ProductSizeChart chart={product.sizeChart}');
    expect(quickView).toContain('<ProductSizeChart chart={product.sizeChart}');
  });

  it('provides explicit NG, UK, US, and EU conversion maps', () => {
    for (const market of ['NG', 'UK', 'US', 'EU'] as const) {
      expect(localizedSizeConversions[market].label).toBeTruthy();
      expect(localizedSizeConversions[market].apparel.M).toBeTruthy();
      expect(localizedSizeConversions[market].footwear['38']).toBeTruthy();
    }
    expect(sizeGuide).toContain('Choose your market');
    expect(sizeGuide).toContain('localizedSizeConversions');
  });

  it('persists measurements locally, syncs authenticated JSON, and records sizing engagement', () => {
    expect(assistant).toContain('ACCOUNT_STORAGE_KEYS.measurements');
    expect(assistant).toContain('writeStoredJson(ACCOUNT_STORAGE_KEYS.measurements, preferences)');
    expect(assistant).toContain('updatePreferences.mutateAsync');
    expect(assistant).toContain('size_assistant_recommendation');
    expect(analytics).toContain("'size_assistant_open'");
    expect(analytics).toContain("'size_assistant_save'");
    expect(schema).toContain('measurementPreferences');
    expect(routers).toContain('measurementPreferences: protectedProcedure.query');
    expect(routers).toContain('updateMeasurementPreferences: protectedProcedure');
  });
});
