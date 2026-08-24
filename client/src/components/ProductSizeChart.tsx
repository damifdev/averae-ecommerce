import { useState } from 'react';
import { localizedSizeConversions, type ProductSizeChart as ProductSizeChartData, type SizeMarket } from '@/lib/brand';

type ProductSizeChartProps = { chart: ProductSizeChartData; compact?: boolean };

export default function ProductSizeChart({ chart, compact = false }: ProductSizeChartProps) {
  const [market, setMarket] = useState<SizeMarket>('NG');
  const isFootwear = chart.unit === 'EU/UK/US';
  return <section className={compact ? 'mt-6 border-t border-[#D7C2A7] pt-5' : 'border border-[#D7C2A7] bg-[#FFFDF8] p-5 sm:p-6'} aria-labelledby="product-size-chart-heading">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="eyebrow text-[#B7654A]">Product-specific sizing</p><h2 id="product-size-chart-heading" className="mt-2 font-display text-2xl">{chart.title}</h2></div><label className="text-[10px] uppercase tracking-[.12em] text-[#866F62]">Market<select aria-label="Product size chart market" value={market} onChange={event => setMarket(event.target.value as SizeMarket)} className="focus-ring ml-2 border border-[#D7C2A7] bg-[#FFFDF8] px-2 py-2 text-[10px] text-[#382820]"><option value="NG">NG · Nigeria</option><option value="UK">UK · United Kingdom</option><option value="US">US · United States</option><option value="EU">EU · Europe</option></select></label></div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><caption className="sr-only">{chart.title} in {chart.unit}</caption><thead className="border-b border-[#D7C2A7] text-[10px] uppercase tracking-[.11em] text-[#866F62]"><tr>{chart.columns.map(column => <th key={column} className="px-3 py-3 font-normal">{column}</th>)}<th className="px-3 py-3 font-normal">{localizedSizeConversions[market].label} equivalent</th></tr></thead><tbody>{chart.rows.map(row => <tr key={row.size} className="border-b border-[#E6D8C8] last:border-0"><th className="px-3 py-3 font-medium">{row.size}</th>{chart.columns.slice(1).map(column => <td key={`${row.size}-${column}`} className="px-3 py-3 text-[#866F62]">{row.measurements[column] ?? '—'}{chart.unit === 'cm' && row.measurements[column] && column !== 'Fit' ? ' cm' : ''}</td>)}<td className="px-3 py-3 font-medium text-[#B7654A]">{row.conversions?.[market] ?? (isFootwear ? localizedSizeConversions[market].footwear[row.size] : localizedSizeConversions[market].apparel[row.size]) ?? row.size}</td></tr>)}</tbody></table></div>
    <p className="mt-4 text-xs leading-6 text-[#866F62]">{chart.note} {chart.unit === 'cm' ? 'All garment measurements are in centimetres.' : 'Foot length is shown in centimetres.'}</p>
  </section>;
}
