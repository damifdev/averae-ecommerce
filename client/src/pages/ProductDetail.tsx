import { Link, useLocation, useRoute } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ZoomIn,
} from 'lucide-react';
import {
  availableSizes,
  formatPrice,
  isSizeAvailable,
  products,
  sizeInventory,
} from '@/lib/brand';
import { addToCart, getWishlist, toggleWishlist } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useRef, useState } from 'react';

const detailSections = {
  Delivery: 'Complimentary delivery on orders over ₦150,000. Orders are prepared within 1–2 business days and delivered with tracking.',
  Returns: 'Return unworn pieces within 14 days of delivery. Items must be in their original condition with all tags attached.',
  'Product details': 'Designed for an easy, considered fit with softly structured proportions. Please refer to the size guide for measurements.',
  'Materials & care': 'Made in small considered runs with materials chosen for softness, longevity and ease. Follow the garment label and air-dry where possible.',
} as const;

type DetailSection = keyof typeof detailSections;

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const product = products.find(item => item.id === Number(params?.id)) || products[0];
  const [, navigate] = useLocation();
  const available = availableSizes(product);
  const requiresSize = product.sizes.length > 1;
  const [size, setSize] = useState(() => requiresSize ? '' : available[0] ?? product.sizes[0] ?? '');
  const [color, setColor] = useState(product.color || product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<DetailSection | null>('Delivery');
  const [liked, setLiked] = useState(() => getWishlist().includes(product.id));
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const gallery = [
    { src: product.image, alt: product.name },
    { src: product.secondaryImage, alt: `${product.name} detail` },
  ];
  const selectedInventory = size ? sizeInventory(product, size) : 0;
  const itemUnavailable = available.length === 0 || product.stock <= 0;

  useEffect(() => {
    setSize(requiresSize ? '' : available[0] ?? product.sizes[0] ?? '');
    setColor(product.color || product.colors[0] || '');
    setQuantity(1);
    setTab('Delivery');
    setError('');
    setConfirmation(false);
    setActiveImage(0);
    setLiked(getWishlist().includes(product.id));
  }, [product.id]);

  useEffect(() => {
    const syncWishlist = () => setLiked(getWishlist().includes(product.id));
    window.addEventListener('averae-wishlist-updated', syncWishlist);
    return () => window.removeEventListener('averae-wishlist-updated', syncWishlist);
  }, [product.id]);

  const selectSize = (option: string) => {
    if (!isSizeAvailable(product, option)) return;
    setSize(option);
    setQuantity(current => Math.min(current, sizeInventory(product, option)));
    setError('');
    setConfirmation(false);
  };

  const validateSelection = () => {
    if (requiresSize && (!size || !isSizeAvailable(product, size))) {
      setError('Please select a size.');
      setConfirmation(false);
      return false;
    }
    if (itemUnavailable || !isSizeAvailable(product, size)) {
      setError('This item is currently unavailable.');
      setConfirmation(false);
      return false;
    }
    return true;
  };

  const addSelection = (destination?: '/checkout') => {
    if (!validateSelection()) return;
    addToCart(product.id, { size, color }, quantity);
    setError('');
    setConfirmation(true);
    if (destination) navigate(destination);
  };

  const changeImage = (direction: 1 | -1) => {
    setActiveImage(current => (current + direction + gallery.length) % gallery.length);
  };

  const toggleSaved = () => {
    const next = toggleWishlist(product.id);
    setLiked(next.includes(product.id));
  };

  return <div>
    <SiteHeader />
    <main className="container py-8 md:py-14">
      <Link href="/shop" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#866F62]">
        <ArrowLeft size={14} /> Back to shop
      </Link>
      <div className="grid gap-10 md:grid-cols-[1.15fr_.85fr] md:gap-16">
        <section aria-label={`${product.name} images`}>
          <div
            className="motion-surface relative aspect-[4/3] overflow-hidden bg-[#D7C2A7]"
            onTouchStart={event => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={event => {
              if (touchStartX.current === null) return;
              const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
              if (Math.abs(distance) > 40) changeImage(distance < 0 ? 1 : -1);
              touchStartX.current = null;
            }}
          >
            <img src={gallery[activeImage].src} alt={gallery[activeImage].alt} className="h-full w-full object-cover" />
            <button type="button" aria-label="Open enlarged product image" onClick={() => setZoomOpen(true)} className="focus-ring absolute bottom-4 right-4 flex items-center gap-2 bg-[#FFFDF8]/90 px-3 py-2 text-[10px] uppercase tracking-[.14em]">
              <ZoomIn size={14} /> Zoom
            </button>
            <button type="button" aria-label="Previous product image" onClick={() => changeImage(-1)} className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#FFFDF8]/90 p-2 md:hidden"><ChevronLeft size={16} /></button>
            <button type="button" aria-label="Next product image" onClick={() => changeImage(1)} className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#FFFDF8]/90 p-2 md:hidden"><ChevronRight size={16} /></button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3" role="tablist" aria-label="Product image thumbnails">
            {gallery.map((image, index) => <button key={image.src} type="button" role="tab" aria-selected={activeImage === index} aria-label={`View image ${index + 1} of ${gallery.length}`} onClick={() => setActiveImage(index)} className={`motion-surface overflow-hidden border-2 bg-[#D7C2A7] ${activeImage === index ? 'border-[#382820]' : 'border-transparent'}`}>
              <img src={image.src} alt="" className="aspect-[4/5] h-full w-full object-cover" />
            </button>)}
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-[#866F62] md:hidden">Swipe to explore images</p>
        </section>

        <section className="md:pt-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow text-[#866F62]">{product.brand} · {product.collection}</p>
              <h1 className="mt-3 font-display text-5xl leading-tight">{product.name}</h1>
            </div>
            <button type="button" data-testid="wishlist-save" onClick={toggleSaved} aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={liked} className="pressable focus-ring rounded-full border border-[#D7C2A7] p-3">
              <Heart size={18} fill={liked ? '#B7654A' : 'none'} strokeWidth={1.2} />
            </button>
          </div>
          <p className="mt-5 text-xl">{formatPrice(product.price)}</p>
          {product.compareAt && <p className="mt-1 text-sm text-[#866F62] line-through">{formatPrice(product.compareAt)}</p>}
          <p className="mt-3 text-xs uppercase tracking-[.13em] text-[#B7654A]">{product.rating === null ? 'Not yet rated' : `${product.rating.toFixed(1)} · ${product.ratingCount} ratings`}</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#6f675d]">{product.description} Made in small considered runs with materials chosen for softness, longevity and ease.</p>

          <div className="mt-9 border-t border-[#D7C2A7] pt-6">
            <div className="flex justify-between text-[10px] uppercase tracking-[.15em]"><span>Colour</span><span className="text-[#866F62]">{color}</span></div>
            <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Colour options">
              {product.colors.map(option => <button key={option} type="button" aria-pressed={color === option} onClick={() => { setColor(option); setError(''); setConfirmation(false); }} className={`focus-ring h-9 rounded-full border-2 px-3 text-xs ${color === option ? 'border-[#382820]' : 'border-transparent'}`} aria-label={`Select ${option}`}>{option}</button>)}
            </div>
          </div>

          <div className="mt-7 border-t border-[#D7C2A7] pt-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[.15em]">
              <span>Size</span>
              <button type="button" data-testid="size-guide" onClick={() => setSizeGuideOpen(true)} className="focus-ring underline underline-offset-4">Size guide</button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2" role="group" aria-label="Size options">
              {product.sizes.map(option => {
                const availableCount = sizeInventory(product, option);
                const unavailable = availableCount <= 0;
                return <button key={option} type="button" aria-pressed={size === option} aria-label={`${option}${unavailable ? ', out of stock' : `, ${availableCount} available`}`} disabled={unavailable} onClick={() => selectSize(option)} className={`pressable border py-3 text-xs disabled:cursor-not-allowed disabled:border-[#D7C2A7]/60 disabled:bg-[#D7C2A7]/20 disabled:text-[#866F62]/60 ${size === option ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7]'}`}>{option}</button>;
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[.12em] text-[#866F62]">
              <span>{size ? `${selectedInventory} available` : requiresSize ? 'Select a size to check availability' : 'Available now'}</span>
              {itemUnavailable && <span className="text-[#B7654A]">Currently unavailable</span>}
            </div>
            {error === 'Please select a size.' && <p role="alert" data-testid="size-error" className="mt-3 text-xs text-[#B7654A]">Please select a size.</p>}
          </div>

          <div className="mt-7 flex gap-3">
            <div className="flex items-center border border-[#D7C2A7]" aria-label="Quantity selector">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(current => Math.max(1, current - 1))} className="pressable px-3 disabled:opacity-40"><Minus size={14} /></button>
              <span className="w-7 text-center text-sm" aria-label={`${quantity} in bag`}>{quantity}</span>
              <button type="button" aria-label="Increase quantity" disabled={Boolean(selectedInventory) && quantity >= selectedInventory} onClick={() => setQuantity(current => selectedInventory ? Math.min(selectedInventory, current + 1) : current + 1)} className="pressable px-3 disabled:opacity-40"><Plus size={14} /></button>
            </div>
            <button type="button" data-testid="add-to-bag" onClick={() => addSelection()} disabled={itemUnavailable} className="pressable flex-1 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8] transition hover:bg-[#B7654A] disabled:cursor-not-allowed disabled:opacity-50">ADD TO BAG</button>
          </div>
          <button type="button" data-testid="buy-now" onClick={() => addSelection('/checkout')} disabled={itemUnavailable} className="pressable mt-3 w-full border border-[#382820] py-4 text-[10px] uppercase tracking-[.16em] disabled:cursor-not-allowed disabled:opacity-50">BUY NOW</button>

          {confirmation && <div role="status" data-testid="add-to-bag-confirmation" className="mt-5 border border-[#B7654A] bg-[#B7654A]/10 p-4">
            <p className="text-sm">Added to your bag</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/shop" className="border border-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em]">CONTINUE SHOPPING</Link>
              <Link href="/cart" className="bg-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em] text-[#FFFDF8]">VIEW BAG</Link>
            </div>
          </div>}

          <div className="mt-9 divide-y divide-[#D7C2A7] border-y border-[#D7C2A7]">
            {(Object.keys(detailSections) as DetailSection[]).map(title => <div key={title}>
              <button type="button" aria-expanded={tab === title} onClick={() => setTab(current => current === title ? null : title)} className="flex w-full items-center justify-between py-5 text-left text-sm"><span>{title}</span><ChevronDown size={16} className={tab === title ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              {tab === title && <div className="pb-5 pr-6 text-sm leading-6 text-[#6f675d]">{detailSections[title]}</div>}
            </div>)}
          </div>
        </section>
      </div>
    </main>

    <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
      <DialogContent className="max-w-4xl border-[#D7C2A7] bg-[#FFFDF8] p-2 sm:p-4">
        <DialogTitle className="sr-only">Enlarged {product.name} image</DialogTitle>
        <DialogDescription className="sr-only">A larger view of the selected product image.</DialogDescription>
        <img src={gallery[activeImage].src} alt={gallery[activeImage].alt} className="max-h-[80vh] w-full object-contain" />
      </DialogContent>
    </Dialog>

    <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
      <DialogContent className="max-w-xl border-[#D7C2A7] bg-[#FFFDF8]">
        <DialogTitle className="font-display text-3xl">Size guide</DialogTitle>
        <DialogDescription className="text-[#6f675d]">Use your usual size as a starting point. If you prefer a more relaxed fit, choose the next size up.</DialogDescription>
        <div className="mt-3 overflow-x-auto border-y border-[#D7C2A7]">
          <div className="grid min-w-[420px] grid-cols-4 text-xs">
            <div className="border-b border-[#D7C2A7] py-3 font-medium">Size</div><div className="border-b border-[#D7C2A7] py-3">Bust / chest</div><div className="border-b border-[#D7C2A7] py-3">Waist</div><div className="border-b border-[#D7C2A7] py-3">Hip</div>
            {['XS', 'S', 'M', 'L', 'XL'].map((label, index) => <div key={label} className="contents"><div className="border-b border-[#D7C2A7]/70 py-3">{label}</div><div className="border-b border-[#D7C2A7]/70 py-3">{[82, 87, 92, 97, 102][index]} cm</div><div className="border-b border-[#D7C2A7]/70 py-3">{[64, 69, 74, 79, 84][index]} cm</div><div className="border-b border-[#D7C2A7]/70 py-3">{[90, 95, 100, 105, 110][index]} cm</div></div>)}
          </div>
        </div>
        <p className="text-xs leading-5 text-[#866F62]">For shoes and children’s pieces, use the size listed on the product page and contact us if you need help choosing.</p>
      </DialogContent>
    </Dialog>
  </div>;
}
