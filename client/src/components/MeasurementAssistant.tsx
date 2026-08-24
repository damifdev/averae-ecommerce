import { Ruler, Save, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { localizedSizeConversions, type Product } from '@/lib/brand';
import { ACCOUNT_STORAGE_KEYS, type MeasurementPreferences, readStoredJson, safeEventLabel, trackEngagement, writeStoredJson } from '@/lib/analytics';

type MeasurementAssistantProps = {
  product?: Product;
  label?: string;
  className?: string;
};

const defaultMeasurements: MeasurementPreferences = { unit: 'cm', market: 'NG' };

function parseRange(value: string) {
  const numbers = value.replace(',', '.').match(/[0-9]+(?:\.[0-9]+)?/g)?.map(Number) ?? [];
  if (!numbers.length) return null;
  return { min: numbers[0], max: numbers[1] ?? numbers[0] };
}

function asCentimetres(value: number | undefined, unit: MeasurementPreferences['unit']) {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return unit === 'in' ? value * 2.54 : value;
}

function recommendSize(product: Product | undefined, preferences: MeasurementPreferences) {
  if (!product?.sizeChart) return null;
  const rows = product.sizeChart.rows;
  if (rows.length === 1) return rows[0];
  const foot = asCentimetres(preferences.footLength, preferences.unit);
  const chest = asCentimetres(preferences.chest, preferences.unit);
  const waist = asCentimetres(preferences.waist, preferences.unit);
  const hips = asCentimetres(preferences.hips, preferences.unit);
  const score = (row: typeof rows[number]) => {
    const values = row.measurements;
    const inputs: Array<[string, number | undefined]> = [
      ['Chest / bust', chest], ['Chest', chest], ['Waist', waist], ['Hips', hips], ['Foot length', foot], ['Height', chest],
    ];
    let matched = 0;
    let distance = 0;
    inputs.forEach(([key, input]) => {
      if (input === undefined || !values[key]) return;
      const range = parseRange(values[key]);
      if (!range) return;
      matched += input >= range.min && input <= range.max ? 2 : 0;
      distance += input < range.min ? range.min - input : input > range.max ? input - range.max : 0;
    });
    return { matched, distance };
  };
  const ranked = [...rows].sort((a, b) => {
    const left = score(a); const right = score(b);
    return right.matched - left.matched || left.distance - right.distance;
  });
  return ranked[0] ?? null;
}

function fieldValue(value: number | undefined) { return value === undefined ? '' : String(value); }

export default function MeasurementAssistant({ product, label = 'Find my size', className = '' }: MeasurementAssistantProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<MeasurementPreferences>(() => readStoredJson(ACCOUNT_STORAGE_KEYS.measurements, defaultMeasurements));
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const preferencesQuery = trpc.account.measurementPreferences.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const updatePreferences = trpc.account.updateMeasurementPreferences.useMutation();
  const recommendation = useMemo(() => recommendSize(product, preferences), [product, preferences]);

  useEffect(() => {
    if (!preferencesQuery.data) return;
    try {
      const parsed = JSON.parse(preferencesQuery.data) as MeasurementPreferences;
      if (parsed && (parsed.unit === 'cm' || parsed.unit === 'in') && parsed.market in localizedSizeConversions) setPreferences(current => ({ ...current, ...parsed }));
    } catch {
      // Ignore malformed legacy data and keep the local preference safely.
    }
  }, [preferencesQuery.data]);

  useEffect(() => {
    if (!open) return;
    trackEngagement('size_assistant_open', { product_id: product ? String(product.id) : 'guide', product: product ? safeEventLabel(product.name) : 'size_guide' });
  }, [open, product]);

  useEffect(() => {
    if (!recommendation || !open) return;
    trackEngagement('size_assistant_recommendation', { product_id: product ? String(product.id) : 'guide', size: safeEventLabel(recommendation.size), market: preferences.market });
  }, [open, product, recommendation, preferences.market]);

  const updateField = (key: keyof MeasurementPreferences, value: string) => {
    if (key === 'unit' || key === 'market') {
      setPreferences(current => ({ ...current, [key]: value } as MeasurementPreferences));
      return;
    }
    const numberValue = value === '' ? undefined : Math.max(0, Number(value));
    setPreferences(current => ({ ...current, [key]: Number.isFinite(numberValue) ? numberValue : undefined }));
    setSaved(false);
  };

  const saveMeasurements = () => {
    writeStoredJson(ACCOUNT_STORAGE_KEYS.measurements, preferences);
    if (user) void updatePreferences.mutateAsync({ measurementPreferences: JSON.stringify(preferences) });
    setSaved(true);
    setMessage(user ? 'Your fit preferences are saved to your account.' : 'Your fit preferences are saved on this device.');
    trackEngagement('size_assistant_save', { product_id: product ? String(product.id) : 'guide', market: preferences.market, unit: preferences.unit });
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`focus-ring inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] underline underline-offset-4 transition hover:text-[#B7654A] ${className}`}><Ruler size={14} aria-hidden="true" />{label}</button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent data-testid="measurement-assistant" className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-none border-[#D7C2A7] bg-[#FFFDF8] p-0 text-[#382820]">
        <div className="p-6 sm:p-9">
          <DialogHeader className="text-left"><p className="eyebrow text-[#B7654A]">A more considered fit</p><DialogTitle className="mt-3 font-display text-4xl font-normal">Find your size</DialogTitle><DialogDescription className="mt-4 max-w-xl text-sm leading-7 text-[#866F62]">Add the measurements you are comfortable sharing. We use them only to suggest a size from the selected product’s chart.</DialogDescription></DialogHeader>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="text-xs text-[#866F62]">Market<select aria-label="Sizing market" value={preferences.market} onChange={event => updateField('market', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]"><option value="NG">Nigeria · NG</option><option value="UK">United Kingdom · UK</option><option value="US">United States · US</option><option value="EU">European Union · EU</option></select></label>
            <label className="text-xs text-[#866F62]">Measurement unit<select aria-label="Measurement unit" value={preferences.unit} onChange={event => updateField('unit', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]"><option value="cm">Centimetres</option><option value="in">Inches</option></select></label>
            <label className="text-xs text-[#866F62]">Chest / bust<input aria-label="Chest or bust" type="number" min="0" step="0.1" value={fieldValue(preferences.chest)} onChange={event => updateField('chest', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]" placeholder={preferences.unit === 'cm' ? 'e.g. 92' : 'e.g. 36'} /></label>
            <label className="text-xs text-[#866F62]">Waist<input aria-label="Waist" type="number" min="0" step="0.1" value={fieldValue(preferences.waist)} onChange={event => updateField('waist', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]" placeholder={preferences.unit === 'cm' ? 'e.g. 74' : 'e.g. 29'} /></label>
            <label className="text-xs text-[#866F62]">Hips<input aria-label="Hips" type="number" min="0" step="0.1" value={fieldValue(preferences.hips)} onChange={event => updateField('hips', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]" placeholder={preferences.unit === 'cm' ? 'e.g. 98' : 'e.g. 39'} /></label>
            <label className="text-xs text-[#866F62]">Foot length<input aria-label="Foot length" type="number" min="0" step="0.1" value={fieldValue(preferences.footLength)} onChange={event => updateField('footLength', event.target.value)} className="focus-ring mt-2 w-full border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm text-[#382820]" placeholder={preferences.unit === 'cm' ? 'e.g. 25' : 'e.g. 9.8'} /></label>
          </div>
          {product && <div className="mt-7 border border-[#D7C2A7] bg-[#F6F0E6] p-5"><div className="flex items-start gap-3"><Sparkles size={17} className="mt-1 shrink-0 text-[#B7654A]" aria-hidden="true" /><div><p className="text-[10px] uppercase tracking-[.14em] text-[#866F62]">For {product.name}</p>{recommendation ? <><p className="mt-2 font-display text-2xl">We suggest {recommendation.size}</p><p className="mt-2 text-sm leading-6 text-[#866F62]">{product.sizeChart?.note} {recommendation.conversions?.[preferences.market] ? `Your ${localizedSizeConversions[preferences.market].label} equivalent is ${recommendation.conversions[preferences.market]}.` : ''}</p></> : <p className="mt-2 text-sm leading-6 text-[#866F62]">Add a measurement above to see a considered size suggestion from this product’s chart.</p>}</div></div></div>}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="min-h-5 text-xs text-[#B7654A]" aria-live="polite">{message}</p><button type="button" onClick={saveMeasurements} disabled={updatePreferences.isPending} className="action-link-light focus-ring pressable inline-flex items-center justify-center gap-2 bg-[#382820] px-5 py-4 text-[10px] uppercase tracking-[.15em] text-[#FFFDF8] transition hover:bg-[#B7654A] disabled:cursor-wait disabled:opacity-60">{saved ? <Save size={14} /> : <Ruler size={14} />}{updatePreferences.isPending ? 'Saving…' : saved ? 'Saved' : 'Save my measurements'}</button></div>
          {!user && <p className="mt-4 text-[10px] uppercase tracking-[.12em] text-[#866F62]">Guest preferences stay on this device. Sign in to carry them across sessions.</p>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
