import { Link } from 'wouter';
import { Check, ShoppingBag } from 'lucide-react';
import { formatPrice, type Product } from '@/lib/brand';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

function colorSwatch(color: string) {
  const swatches: Record<string, string> = {
    Ivory: '#FFFDF8',
    Obsidian: '#382820',
    Sand: '#D1BCA1',
    Taupe: '#866F62',
    Black: '#161311',
    Cocoa: '#6B4434',
    Cognac: '#9A6848',
    Tortoise: '#6B4B35',
    Oat: '#D9C9B0',
    Amber: '#C48845',
  };
  return swatches[color] ?? '#D7C2A7';
}

type QuickViewProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToBag: (product: Product, size: string, color: string) => void;
};

export default function QuickView({ product, open, onOpenChange, onAddToBag }: QuickViewProps) {
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes[0] ?? 'One size');
    setColor(product.color || product.colors[0] || '');
    setAdded(false);
  }, [product, open]);

  if (!product) return null;

  const addSelection = () => {
    onAddToBag(product, size, color);
    setAdded(true);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent data-testid="quick-view-dialog" className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-none border-[#D7C2A7] bg-[#FFFDF8] p-0 text-[#382820] sm:max-w-3xl">
      <div className="grid md:grid-cols-[.9fr_1.1fr]">
        <div className="aspect-[4/5] min-h-64 bg-[#D7C2A7] md:aspect-auto md:min-h-[540px]">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-9">
          <DialogHeader className="text-left">
            <p className="eyebrow text-[#866F62]">{product.brand} · {product.collection}</p>
            <DialogTitle className="mt-3 font-display text-3xl font-normal leading-tight sm:text-4xl">{product.name}</DialogTitle>
            <DialogDescription className="mt-4 text-sm leading-6 text-[#6f675d]">{product.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex items-baseline justify-between gap-4 border-y border-[#D7C2A7] py-5">
            <p className="text-lg">{formatPrice(product.price)}</p>
            {product.compareAt && <p className="text-xs text-[#866F62] line-through">{formatPrice(product.compareAt)}</p>}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[.15em]">Colour <span className="text-[#866F62]">· {color}</span></p>
              <span className="text-[10px] uppercase tracking-[.12em] text-[#866F62]">{product.colors.length} options</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Colour options">
              {product.colors.map(option => <button key={option} type="button" aria-pressed={color === option} aria-label={`Select ${option}`} onClick={() => setColor(option)} className={`focus-ring inline-flex items-center gap-2 border px-3 py-2 text-xs ${color === option ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7]'}`}><span className="h-3 w-3 rounded-full border border-[#382820]/20" style={{ backgroundColor: colorSwatch(option) }} />{option}</button>)}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[.15em]">Size <span className="text-[#866F62]">· {size}</span></p>
              <button type="button" className="text-[10px] uppercase tracking-[.12em] underline underline-offset-4">Size guide</button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Size options">
              {product.sizes.map(option => <button key={option} type="button" aria-pressed={size === option} onClick={() => setSize(option)} className={`focus-ring border py-3 text-xs ${size === option ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7]'}`}>{option}</button>)}
            </div>
          </div>
          <div className="mt-7">
            <button data-testid="quick-view-add" type="button" onClick={addSelection} className="pressable flex w-full items-center justify-center gap-3 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8] hover:bg-[#B7654A]">{added ? <><Check size={15} /> Added to bag</> : <><ShoppingBag size={15} /> Add selected piece to bag</>}</button>
            <p className="mt-3 min-h-5 text-center text-xs text-[#B7654A]" aria-live="polite">{added ? `${product.name} · ${color} · ${size} added to your bag.` : ''}</p>
          </div>
          <Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)} className="mt-4 block border-b border-[#382820] pb-2 text-center text-[10px] uppercase tracking-[.15em]">View full details</Link>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
