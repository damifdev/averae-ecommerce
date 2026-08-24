import { ArrowRight, Check, Ruler } from 'lucide-react';
import { Link } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { brand } from '@/lib/brand';

const womenRows = [
  ['XS', '82–86', '64–68', '88–92'],
  ['S', '86–90', '68–72', '92–96'],
  ['M', '90–96', '72–78', '96–102'],
  ['L', '96–102', '78–84', '102–108'],
  ['XL', '102–108', '84–90', '108–114'],
];

const menRows = [
  ['S', '88–92', '74–78', '90–94'],
  ['M', '92–98', '78–84', '94–100'],
  ['L', '98–104', '84–90', '100–106'],
  ['XL', '104–110', '90–96', '106–112'],
  ['XXL', '110–116', '96–102', '112–118'],
];

const kidsRows = [
  ['2–3 years', '92–98', '52–54'],
  ['4–5 years', '104–110', '54–56'],
  ['6–7 years', '116–122', '56–58'],
  ['8–9 years', '128–134', '58–61'],
  ['10–11 years', '140–146', '61–64'],
  ['12–13 years', '152–158', '64–67'],
];

const shoeRows = [
  ['36', '3', '5', '23.0'],
  ['37', '4', '6', '23.7'],
  ['38', '5', '7', '24.3'],
  ['39', '6', '8', '25.0'],
  ['40', '7', '9', '25.7'],
  ['41', '8', '10', '26.3'],
  ['42', '9', '11', '27.0'],
];

const measurementSteps = [
  ['Chest / bust', 'Measure around the fullest point, keeping the tape level across your back.'],
  ['Waist', 'Measure the narrowest point of your natural waist without pulling the tape tight.'],
  ['Hips', 'Measure around the fullest point of your hips, standing naturally.'],
  ['Inseam', 'Measure from the top of the inside leg to the ankle, or use a well-fitting pair of trousers.'],
  ['Foot length', 'Stand on paper and measure from the back of your heel to the tip of your longest toe.'],
];

function Table({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return <div className="mt-5 overflow-x-auto border border-[#D7C2A7] bg-[#FFFDF8]">
    <table className="w-full min-w-[560px] text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="border-b border-[#D7C2A7] text-[10px] uppercase tracking-[.12em] text-[#866F62]"><tr>{headers.map(header => <th key={header} className="px-4 py-4 font-normal">{header}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row[0]} className="border-b border-[#E6D8C8] last:border-0">{row.map((value, index) => index === 0 ? <th key={`${row[0]}-${value}`} className="px-4 py-4 font-medium">{value}</th> : <td key={`${row[0]}-${value}`} className="px-4 py-4 text-[#866F62]">{value}{headers[index]?.includes('measurement') || headers[index]?.includes('length') ? ' cm' : ''}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export default function SizeGuide() {
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main>
    <section className="border-b border-[#D7C2A7] bg-[#FFFDF8]"><div className="container py-14 md:py-20"><nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[.14em] text-[#866F62]"><Link href="/" className="transition hover:text-[#B7654A]">Home</Link><span className="mx-2">/</span><span aria-current="page">Size Guide</span></nav><div className="mt-10 max-w-2xl"><p className="eyebrow text-[#B7654A]">Fit, clearly considered</p><h1 className="mt-3 font-display text-5xl md:text-7xl">Size Guide</h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#866F62]">Find the right fit before you order.</p></div></div></section>

    <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_.32fr]"><div className="space-y-14">
      <section aria-labelledby="measure-heading"><div className="flex items-center gap-3"><Ruler size={20} className="text-[#B7654A]" aria-hidden="true" /><div><p className="eyebrow text-[#B7654A]">Before you measure</p><h2 id="measure-heading" className="mt-2 font-display text-3xl">How to measure</h2></div></div><p className="mt-5 max-w-2xl text-sm leading-7 text-[#866F62]">Use a soft tape measure and keep it close to the body without pulling tight. Measure in centimetres while wearing light clothing. For the most accurate fit, compare your measurements with the product-specific notes shown on each product page.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{measurementSteps.map(([title, copy]) => <div key={title} className="border border-[#D7C2A7] bg-[#FFFDF8] p-5"><div className="flex items-center gap-2"><Check size={14} className="text-[#B7654A]" aria-hidden="true" /><p className="text-sm font-medium">{title}</p></div><p className="mt-2 text-sm leading-6 text-[#866F62]">{copy}</p></div>)}</div></section>

      <section aria-labelledby="women-heading"><p className="eyebrow text-[#B7654A]">Women</p><h2 id="women-heading" className="mt-2 font-display text-3xl">Clothing measurements</h2><p className="mt-3 text-sm leading-6 text-[#866F62]">Use this guide for tops, dresses, trousers, outerwear, and other women’s clothing.</p><Table caption="Women clothing measurements in centimetres" headers={['Size', 'Bust / chest measurement', 'Waist measurement', 'Hips measurement']} rows={womenRows} /></section>

      <section aria-labelledby="men-heading"><p className="eyebrow text-[#B7654A]">Men</p><h2 id="men-heading" className="mt-2 font-display text-3xl">Clothing measurements</h2><p className="mt-3 text-sm leading-6 text-[#866F62]">Use this guide for shirts, T-shirts, trousers, jackets, outerwear, and other men’s clothing.</p><Table caption="Men clothing measurements in centimetres" headers={['Size', 'Chest measurement', 'Waist measurement', 'Hips measurement']} rows={menRows} /></section>

      <section aria-labelledby="kids-heading"><p className="eyebrow text-[#B7654A]">Kids</p><h2 id="kids-heading" className="mt-2 font-display text-3xl">Age and size guidance</h2><p className="mt-3 text-sm leading-6 text-[#866F62]">Children grow at different rates, so use height and waist as a guide alongside age. When between sizes, choose the larger size.</p><Table caption="Kids age, height, and waist guidance" headers={['Age', 'Height measurement', 'Waist measurement']} rows={kidsRows} /></section>

      <section aria-labelledby="shoes-heading"><p className="eyebrow text-[#B7654A]">Shoes</p><h2 id="shoes-heading" className="mt-2 font-display text-3xl">International shoe conversion</h2><p className="mt-3 text-sm leading-6 text-[#866F62]">Measure both feet at the end of the day and use the longer measurement. Conversions are a guide; the product page is the best source for a specific style.</p><Table caption="International shoe size conversions and foot length" headers={['EU size', 'UK size', 'US size', 'Foot length']} rows={shoeRows} /></section>

      <section aria-labelledby="fit-heading" className="border-t border-[#D7C2A7] pt-12"><p className="eyebrow text-[#B7654A]">Fit notes</p><h2 id="fit-heading" className="mt-2 font-display text-3xl">Every piece has its own character</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-[#866F62]">Sizing can vary between brands, fabrics, and silhouettes. Product pages show available sizes, fit descriptions, and any product-specific measurements where they are available. If a piece has a relaxed or tailored fit, use those notes alongside your body measurements.</p><div className="mt-6 border border-[#D7C2A7] bg-[#FFFDF8] p-5 text-sm leading-7 text-[#866F62]"><strong className="font-medium text-[#382820]">Still unsure?</strong> Our team can help you compare your measurements with the piece you are considering.</div></section>
    </div><aside className="space-y-4 lg:sticky lg:top-8 lg:self-start"><div className="bg-[#382820] p-6 text-[#FFFDF8]"><p className="eyebrow text-[#D7C2A7]">Find your fit</p><h2 className="mt-3 font-display text-3xl">Shop with confidence.</h2><p className="mt-3 text-sm leading-7 text-[#D7C2A7]">Explore the collection, then use the sizing notes on each product page to make your choice.</p><Link href="/shop" className="action-link-light mt-6 inline-flex items-center gap-2 bg-[#FFFDF8] px-5 py-4 text-[10px] uppercase tracking-[.15em] text-[#382820]">SHOP NOW <ArrowRight size={14} /></Link></div><Link href="/returns" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">VIEW RETURNS POLICY <ArrowRight size={14} /></Link><Link href="/faq" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">VIEW FAQs <ArrowRight size={14} /></Link><Link href="/contact" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">CONTACT US <ArrowRight size={14} /></Link></aside></section>
  </main><BackToTop /><footer className="border-t border-[#D7C2A7] py-6"><div className="container flex flex-wrap items-center justify-between gap-3 text-xs text-[#866F62]"><span>{brand.name} · Fit, clearly considered</span><Link href="/shop" className="transition hover:text-[#B7654A]">Continue shopping <ArrowRight size={13} className="ml-1 inline" /></Link></div></footer></div>;
}

