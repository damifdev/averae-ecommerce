import { Bell, Check, Heart, Share2, ShoppingBag, X } from 'lucide-react';
import { availableSizes, formatPrice, isSizeAvailable, products as catalogProducts, sizeInventory, type Product } from '@/lib/brand';
import { addToCart, BACK_IN_STOCK_UPDATED_EVENT, getBackInStockSubscriptions, toggleBackInStockSubscription, toggleWishlist } from '@/lib/store';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';

export type WishlistSelection = { size: string; color: string };

type WishlistContentProps = {
  products: Product[];
  wishlistIds: number[];
  onChangeWishlist: (ids: number[]) => void;
  onClose?: () => void;
  page?: boolean;
  shared?: boolean;
};

function initialSelection(product: Product): WishlistSelection {
  return {
    size: availableSizes(product)[0] ?? product.sizes[0] ?? '',
    color: product.color || product.colors[0] || '',
  };
}

export function WishlistContent({ products, wishlistIds, onChangeWishlist, onClose, page = false, shared = false }: WishlistContentProps) {
  const [selections, setSelections] = useState<Record<number, WishlistSelection>>(() => Object.fromEntries(products.map(product => [product.id, initialSelection(product)])));
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [alertIds, setAlertIds] = useState<number[]>(() => getBackInStockSubscriptions());
  const [shareLink, setShareLink] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    setSelections(current => {
      const next = { ...current };
      products.forEach(product => { next[product.id] ??= initialSelection(product); });
      return next;
    });
  }, [products]);

  useEffect(() => {
    const syncWishlist = () => onChangeWishlist(JSON.parse(localStorage.getItem('averae-wishlist') || '[]') as number[]);
    const syncAlerts = () => setAlertIds(getBackInStockSubscriptions());
    window.addEventListener('averae-wishlist-updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    window.addEventListener(BACK_IN_STOCK_UPDATED_EVENT, syncAlerts);
    return () => {
      window.removeEventListener('averae-wishlist-updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener(BACK_IN_STOCK_UPDATED_EVENT, syncAlerts);
    };
  }, [onChangeWishlist]);

  const remove = (id: number) => {
    const next = toggleWishlist(id);
    onChangeWishlist(next);
  };

  const updateSelection = (product: Product, next: Partial<WishlistSelection>) => {
    setSelections(current => ({ ...current, [product.id]: { ...initialSelection(product), ...current[product.id], ...next } }));
    setFeedback(current => ({ ...current, [product.id]: '' }));
  };

  const toggleAlert = (product: Product) => {
    const next = toggleBackInStockSubscription(product.id);
    setAlertIds(next);
    setFeedback(current => ({ ...current, [product.id]: next.includes(product.id) ? 'Back-in-stock alert saved on this device' : 'Back-in-stock alert removed' }));
  };

  const moveToBag = (product: Product) => {
    const selection = selections[product.id] ?? initialSelection(product);
    if (availableSizes(product).length === 0 || product.stock <= 0 || !isSizeAvailable(product, selection.size)) {
      setFeedback(current => ({ ...current, [product.id]: 'Currently unavailable' }));
      return;
    }
    addToCart(product.id, selection);
    remove(product.id);
    setFeedback(current => ({ ...current, [product.id]: 'Moved to bag' }));
  };

  const shareWishlist = async () => {
    if (!wishlistIds.length || typeof window === 'undefined') return;
    const link = `${window.location.origin}/wishlist?share=${wishlistIds.join(',')}`;
    setShareLink(link);
    setShareFeedback('');
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('Wishlist link copied');
    } catch {
      setShareFeedback('Link ready — copy it from the field below');
    }
  };

  if (!products.length) {
    return <div className={`${page ? 'py-20' : 'py-12'} text-center`} data-testid="wishlist-empty-state">
      <Heart className="mx-auto text-[#D7C2A7]" size={36} strokeWidth={1} />
      <p className="mt-5 font-display text-3xl">{shared ? 'This wishlist is empty.' : 'Keep discovering.'}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#866F62]">{shared ? 'The shared link has no saved pieces available in this catalogue.' : 'Save pieces you love and return to them when you are ready.'}</p>
      <div className="mx-auto mt-7 grid max-w-sm gap-3 sm:grid-cols-2">
        <Link href="/shop?sort=new" onClick={onClose} className="border border-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em]">EXPLORE NEW ARRIVALS</Link>
        <Link href="/trends" onClick={onClose} className="border border-[#B7654A] py-3 text-center text-[10px] uppercase tracking-[.14em] text-[#B7654A]">EXPLORE TRENDS</Link>
      </div>
    </div>;
  }

  return <>
    {page && <div className="mb-8 border border-[#D7C2A7] bg-[#FFFDF8] p-5" data-testid="wishlist-share-panel">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><p className="text-sm">Share your saved pieces</p><p className="mt-1 text-xs leading-5 text-[#866F62]">Create a link that opens this wishlist for friends and family.</p></div>
        <button type="button" data-testid="share-wishlist" onClick={shareWishlist} className="pressable focus-ring inline-flex items-center justify-center gap-2 border border-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.14em]"><Share2 size={14} /> SHARE WISHLIST</button>
      </div>
      {shareLink && <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input aria-label="Wishlist share link" readOnly value={shareLink} onFocus={event => event.currentTarget.select()} className="min-w-0 flex-1 border border-[#D7C2A7] bg-[#F6F0E6] px-3 py-2 text-xs text-[#382820]" /><button type="button" className="focus-ring border border-[#D7C2A7] px-3 py-2 text-[10px] uppercase tracking-[.12em]" onClick={() => navigator.clipboard?.writeText(shareLink).then(() => setShareFeedback('Wishlist link copied'))}><Check size={13} className="mr-1 inline" /> COPY</button></div>}
      {shareFeedback && <p role="status" data-testid="wishlist-share-feedback" className="mt-3 text-xs text-[#B7654A]">{shareFeedback}</p>}
    </div>}
    <div className={page ? 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-6'} data-testid="wishlist-items">
      {products.map(product => {
        const selection = selections[product.id] ?? initialSelection(product);
        const available = availableSizes(product);
        const unavailable = available.length === 0 || product.stock <= 0;
        const availabilityLabel = unavailable ? 'Currently unavailable' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock';
        const alertSaved = alertIds.includes(product.id);
        return <article key={product.id} data-testid={`wishlist-item-${product.id}`} className={page ? 'group' : 'border-b border-[#D7C2A7] pb-6'}>
          <div className={page ? 'relative' : 'flex gap-4'}>
            <img src={product.image} alt={product.name} className={page ? 'aspect-[4/5] w-full object-cover' : 'h-28 w-24 shrink-0 object-cover'} />
            <div className={page ? 'pt-4' : 'min-w-0 flex-1'}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/product/${product.id}`} onClick={onClose} className="text-sm hover:underline">{product.name}</Link>
                  <p className="mt-1 text-xs text-[#866F62]">{product.brand} · {product.collection}</p>
                </div>
                <button type="button" aria-label={`Remove ${product.name} from wishlist`} onClick={() => remove(product.id)} className="focus-ring shrink-0 p-1 text-[#866F62] hover:text-[#B7654A]"><X size={15} /></button>
              </div>
              <p className="mt-3 text-sm">{formatPrice(product.price)}</p>
              {product.compareAt && <p className="mt-1 text-xs text-[#866F62] line-through">{formatPrice(product.compareAt)}</p>}
              {product.compareAt && product.compareAt > product.price && <p data-testid="wishlist-price-change" className="mt-2 text-[10px] uppercase tracking-[.12em] text-[#B7654A]">Price reduced</p>}
              <p className={`mt-2 text-[10px] uppercase tracking-[.12em] ${unavailable ? 'text-[#B7654A]' : 'text-[#866F62]'}`}>{availabilityLabel}</p>
              {unavailable && <div className="mt-4">
                <button type="button" data-testid={`back-in-stock-${product.id}`} aria-pressed={alertSaved} onClick={() => toggleAlert(product)} className={`pressable focus-ring flex w-full items-center justify-center gap-2 border py-3 text-[10px] uppercase tracking-[.13em] ${alertSaved ? 'border-[#B7654A] text-[#B7654A]' : 'border-[#382820] text-[#382820]'}`}><Bell size={14} /> {alertSaved ? 'ALERT SAVED' : 'NOTIFY ME WHEN AVAILABLE'}</button>
                <p className="mt-2 text-[10px] leading-4 text-[#866F62]">{alertSaved ? 'Back-in-stock alert saved on this device.' : 'Save an alert preference for this piece.'}</p>
              </div>}
              {!unavailable && <>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[.13em] text-[#866F62]">Colour <span className="text-[#382820]">{selection.color}</span></p>
                  {product.colors.length > 1 && <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`${product.name} colour options`}>{product.colors.map(color => <button key={color} type="button" aria-pressed={selection.color === color} onClick={() => updateSelection(product, { color })} className={`focus-ring rounded-full border px-2.5 py-1 text-[10px] ${selection.color === color ? 'border-[#382820]' : 'border-[#D7C2A7]'}`}>{color}</button>)}</div>}
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[.13em] text-[#866F62]">Size</p>
                  <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`${product.name} size options`}>{product.sizes.map(size => <button key={size} type="button" disabled={!isSizeAvailable(product, size)} aria-pressed={selection.size === size} aria-label={`${size}${isSizeAvailable(product, size) ? `, ${sizeInventory(product, size)} available` : ', out of stock'}`} onClick={() => updateSelection(product, { size })} className={`focus-ring border px-2.5 py-1 text-[10px] disabled:cursor-not-allowed disabled:border-[#D7C2A7]/60 disabled:bg-[#D7C2A7]/20 disabled:text-[#866F62]/60 ${selection.size === size ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7]'}`}>{size}</button>)}</div>
                </div>
              </>}
              {feedback[product.id] && <p role="status" className="mt-3 text-xs text-[#B7654A]">{feedback[product.id]}</p>}
              <button type="button" disabled={unavailable} onClick={() => moveToBag(product)} className="pressable mt-5 flex w-full items-center justify-center gap-2 bg-[#382820] py-3 text-[10px] uppercase tracking-[.14em] text-[#FFFDF8] disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={14} /> {unavailable ? 'Currently unavailable' : 'MOVE TO BAG'}</button>
            </div>
          </div>
        </article>;
      })}
    </div>
  </>;
}

export default function WishlistPanel({ products, wishlistIds, onChangeWishlist, onClose, visible }: WishlistContentProps & { visible: boolean }) {
  const wishlistProducts = useMemo(() => wishlistIds.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[], [products, wishlistIds]);
  return <div className={`drawer-backdrop z-[65] ${visible ? 'drawer-backdrop-open' : ''}`} role="presentation" onClick={onClose}>
    <aside role="dialog" aria-modal="true" aria-label="Wishlist" onClick={event => event.stopPropagation()} className={`drawer-panel drawer-panel-right flex h-full w-full max-w-md flex-col bg-[#FFFDF8] p-6 shadow-2xl sm:p-8 ${visible ? 'drawer-panel-open' : ''}`}>
      <div className="flex items-center justify-between border-b border-[#D7C2A7] pb-5">
        <div><p className="eyebrow text-[#866F62]">Saved pieces</p><h2 className="mt-2 font-display text-3xl">{wishlistProducts.length ? `${wishlistProducts.length} saved` : 'Your wishlist is empty'}</h2></div>
        <button type="button" aria-label="Close wishlist" onClick={onClose} className="focus-ring"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto py-5"><WishlistContent products={wishlistProducts} wishlistIds={wishlistIds} onChangeWishlist={onChangeWishlist} onClose={onClose} /></div>
      <div className="border-t border-[#D7C2A7] pt-5"><Link href="/shop" onClick={onClose} className="block border border-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em]">CONTINUE SHOPPING</Link>{wishlistProducts.length > 0 && <Link href="/wishlist" onClick={onClose} className="mt-3 block border border-[#B7654A] py-3 text-center text-[10px] uppercase tracking-[.14em] text-[#B7654A]">VIEW WISHLIST</Link>}</div>
    </aside>
  </div>;
}

export function WishlistPageContent({ wishlistIds, onChangeWishlist, shared = false }: { wishlistIds: number[]; onChangeWishlist: (ids: number[]) => void; shared?: boolean }) {
  const wishlistProducts = useMemo(() => wishlistIds.map(id => catalogProducts.find(product => product.id === id)).filter(Boolean) as Product[], [wishlistIds]);
  return <WishlistContent products={wishlistProducts} wishlistIds={wishlistIds} onChangeWishlist={onChangeWishlist} page shared={shared} />;
}
