import { Link } from 'wouter';
import { Check, ShoppingBag } from 'lucide-react';
import { availableSizes, formatPrice, isSizeAvailable, sizeInventory, type Product } from '@/lib/brand';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { safeEventLabel, trackEngagement } from '@/lib/analytics';
import MeasurementAssistant from '@/components/MeasurementAssistant';
import ProductSizeChart from '@/components/ProductSizeChart';

function colorSwatch(color: string) {
  const swatches: Record<string, string> = {
    Ivory: '#FFFDF8', Obsidian: '#382820', Sand: '#D1BCA1', Taupe: '#866F62', Black: '#161311', Cocoa: '#6B4434', Cognac: '#9A6848', Tortoise: '#6B4B35', Oat: '#D9C9B0', Amber: '#C48845',
  };
  return swatches[color] ?? '#D7C2A7';
}

type QuickViewProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToBag: (product: Product, size: string, color: string) => void;
  surface?: string;
};

export default function QuickView({ product, open, onOpenChange, onAddToBag, surface = 'catalog' }: QuickViewProps) {
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!product || !open) return;
    setSize(availableSizes(product)[0] ?? '');
    setColor(product.color || product.colors[0] || '');
    setAdded(false);
    setFeedback('');
    trackEngagement('quick_view_open', { product_id: String(product.id), product: safeEventLabel(product.name), surface: safeEventLabel(surface) });
  }, [product, open, surface]);

  if (!product) return null;

  const selectedSizeAvailable = Boolean(size) && isSizeAvailable(product, size);
  const selectColor = (option: string) => {
    setColor(option);
    trackEngagement('quick_view_variant_select', { product_id: String(product.id), variant: 'colour', value: safeEventLabel(option), surface: safeEventLabel(surface) });
  };
  const selectSize = (option: string) => {
    if (!isSizeAvailable(product, option)) return;
    setSize(option);
    trackEngagement('quick_view_variant_select', { product_id: String(product.id), variant: 'size', value: safeEventLabel(option), surface: safeEventLabel(surface) });
  };
  const addSelection = () => {
    if (!selectedSizeAvailable) {
      setAdded(false);
      setFeedback('Please choose an available size before adding this piece to your bag.');
      return;
    }
    onAddToBag(product, size, color);
    setAdded(true);
    setFeedback(`${product.name} · ${color} · ${size} added to your bag.`);
    trackEngagement('quick_view_add_to_bag', { product_id: String(product.id), product: safeEventLabel(product.name), size: safeEventLabel(size), colour: safeEventLabel(color), surface: safeEventLabel(surface) });
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent data-testid="quick-view-dialog" className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-none border-[#D7C2A7] bg-[#FFFDF8] p-0 text-[#382820] sm:max-w-3xl">
      <div className="grid md:grid-cols-[.9fr_1.1fr]">
        <div className="aspect-[4/5] min-h-64 bg-[#D7C2A7] md:aspect-auto md:min-h-[540px]"><img src={product.image} alt={product.name} className="h-full w-full object-cover" /></div>
        <div className="p-6 sm:p-9">
          <DialogHeader className="text-left"><p className="eyebrow text-[#866F62]">{product.brand} · {product.collection}</p><DialogTitle className="mt-3 font-display text-3xl font-normal leading-tight sm:text-4xl">{product.name}</DialogTitle><DialogDescription className="mt-4 text-sm leading-6 text-[#6f675d]">{product.description}</DialogDescription></DialogHeader>
          <div className="mt-6 flex items-baseline justify-between gap-4 border-y border-[#D7C2A7] py-5"><p className="text-lg">{formatPrice(product.price)}</p>{product.compareAt && <p className="text-xs text-[#866F62] line-through">{formatPrice(product.compareAt)}</p>}</div>
          <div className="mt-6"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.15em]">Colour <span className="text-[#866F62]">· {color}</span></p><span className="text-[10px] uppercase tracking-[.12em] text-[#866F62]">{product.colors.length} options</span></div><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Colour options">{product.colors.map(option => <button key={option} type="button" aria-pressed={color === option} aria-label={`Select ${option}`} onClick={() => selectColor(option)} className={`focus-ring inline-flex items-center gap-2 border px-3 py-2 text-xs ${color === option ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7]'}`}><span className="h-3 w-3 rounded-full border border-[#382820]/20" style={{ backgroundColor: colorSwatch(option) }} />{option}</button>)}</div></div>
          <div className="mt-6"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.15em]">Size <span className="text-[#866F62]">· {size || 'Unavailable'}</span></p><span className="text-[10px] uppercase tracking-[.12em] text-[#866F62]">{availableSizes(product).length} of {product.sizes.length} available</span></div><div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Size options">{product.sizes.map(option => { const available = isSizeAvailable(product, option); const quantity = sizeInventory(product, option); return <button key={option} type="button" aria-pressed={size === option} aria-disabled={!available} disabled={!available} aria-label={available ? `Select size ${option}, ${quantity} available` : `Size ${option}, out of stock`} onClick={() => selectSize(option)} className={`focus-ring border py-3 text-xs transition ${size === option ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : available ? 'border-[#D7C2A7]' : 'cursor-not-allowed border-[#D7C2A7] text-[#866F62]/55 line-through opacity-60'}`}>{option}{!available && <span className="sr-only">, out of stock</span>}</button>; })}</div></div>
          {product.sizeChart && <ProductSizeChart chart={product.sizeChart} compact />}
          <div className="mt-5"><MeasurementAssistant product={product} label="Find my size" /></div>
          <div className="mt-7"><button data-testid="quick-view-add" type="button" onClick={addSelection} disabled={!selectedSizeAvailable} className="action-link-light pressable flex w-full items-center justify-center gap-3 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8] hover:bg-[#B7654A] disabled:cursor-not-allowed disabled:opacity-45">{added ? <><Check size={15} /> Added to bag</> : <><ShoppingBag size={15} /> {selectedSizeAvailable ? 'Add selected piece to bag' : 'Select an available size'}</>}</button><p data-testid="quick-view-size-status" className="mt-3 min-h-5 text-center text-xs text-[#B7654A]" aria-live="polite">{feedback}</p>{added && <Link data-testid="quick-view-view-bag" href="/cart" onClick={() => onOpenChange(false)} className="quick-view-view-bag action-link-dark focus-ring mt-3 block border border-[#382820] py-3 text-center text-[10px] uppercase tracking-[.16em] transition-colors duration-200 hover:bg-[#382820] hover:text-[#FFFDF8]">VIEW BAG</Link>}</div>
          <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)} className="mt-4 block border-b border-[#382820] pb-2 text-center text-[10px] uppercase tracking-[.15em]">View full details</Link>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}

