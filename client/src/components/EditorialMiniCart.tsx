import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Link } from 'wouter';
import { formatPrice, products } from '@/lib/brand';
import { addToCart, cartItemCount, CART_UPDATED_EVENT, getCart, removeFromCart, type CartItem } from '@/lib/store';

type EditorialMiniCartProps = { open: boolean; onOpenChange: (open: boolean) => void; returnFocusRef?: React.RefObject<HTMLButtonElement | null> };
const SHIPPING_THRESHOLD = 150000;

export default function EditorialMiniCart({ open, onOpenChange, returnFocusRef }: EditorialMiniCartProps) {
  const [items, setItems] = useState<CartItem[]>(() => getCart());
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const sync = () => setItems(getCart());
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(CART_UPDATED_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    if (!open) { returnFocusRef?.current?.focus(); return; }
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onOpenChange(false); return; }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('keydown', onKeyDown); };
  }, [open, onOpenChange, returnFocusRef]);
  const lines = useMemo(() => items.map(item => ({ item, product: products.find(product => product.id === item.id) })).filter(line => line.product) as { item: CartItem; product: typeof products[number] }[], [items]);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const count = cartItemCount(items);
  const shippingRemaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / SHIPPING_THRESHOLD) * 100));
  const recommendations = products.filter(product => !lines.some(line => line.product.id === product.id)).slice(0, 3);
  const close = () => onOpenChange(false);
  const changeQuantity = (item: CartItem, delta: number) => {
    if (delta > 0) { addToCart(item.id, { size: item.size, color: item.color }); setItems(getCart()); return; }
    if (item.quantity > 1) {
      removeFromCart(item.id, item.size, item.color);
      for (let index = 1; index < item.quantity - 1; index += 1) addToCart(item.id, { size: item.size, color: item.color });
      setItems(getCart());
    } else setItems(removeFromCart(item.id, item.size, item.color));
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-[80]" role="presentation">
    <button type="button" aria-label="Close bag" onClick={close} className="absolute inset-0 bg-[#382820]/35" />
    <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="editorial-mini-cart-title" data-testid="editorial-mini-cart" className="mini-cart-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FFFDF8] text-[#382820] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#D7C2A7] px-5 py-5 md:px-7"><div><p className="eyebrow text-[#B7654A]">Your selection</p><h2 id="editorial-mini-cart-title" className="mt-1 font-display text-3xl">Mini bag <span className="font-sans text-sm text-[#866F62]">({count})</span></h2></div><button ref={closeRef} type="button" aria-label="Close bag" onClick={close} className="focus-ring rounded-full p-2 hover:bg-[#F6F0E6]"><X size={19} strokeWidth={1.3} /></button></div>
      {lines.length ? <><div className="flex-1 overflow-y-auto px-5 md:px-7"><div className="border-b border-[#D7C2A7] py-5" aria-label="Free shipping progress"><p className="text-xs leading-5">{shippingRemaining ? <>Add <strong>{formatPrice(shippingRemaining)}</strong> more for complimentary delivery.</> : <strong>Complimentary delivery unlocked.</strong>}</p><div className="mt-3 h-1.5 overflow-hidden bg-[#D7C2A7]" role="progressbar" aria-valuenow={shippingProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Free shipping progress"><span className="block h-full bg-[#B7654A] transition-[width] duration-300" style={{ width: `${shippingProgress}%` }} /></div><p className="mt-2 text-[10px] uppercase tracking-[.13em] text-[#866F62]">Free shipping over {formatPrice(SHIPPING_THRESHOLD)}</p></div><div className="divide-y divide-[#D7C2A7]">{lines.map(({ item, product }) => <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 py-5"><img src={product.image} alt={product.name} className="h-28 w-20 shrink-0 bg-[#D7C2A7] object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><Link href={`/product/${product.id}`} onClick={close} className="text-sm hover:underline">{product.name}</Link><p className="mt-1 text-xs text-[#866F62]">{item.color || product.color}{item.size ? ` · ${item.size}` : ''}</p></div><p className="shrink-0 text-sm">{formatPrice(product.price * item.quantity)}</p></div><div className="mt-5 flex items-center justify-between"><div className="inline-flex items-center border border-[#D7C2A7]"><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => changeQuantity(item, -1)} className="focus-ring p-2"><Minus size={13} /></button><span className="min-w-8 text-center text-xs">{item.quantity}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => changeQuantity(item, 1)} className="focus-ring p-2"><Plus size={13} /></button></div><button type="button" onClick={() => setItems(removeFromCart(item.id, item.size, item.color))} className="text-[10px] uppercase tracking-[.14em] text-[#866F62] underline-offset-4 hover:text-[#B7654A] hover:underline">Remove</button></div></div></div>)}</div><section className="border-t border-[#D7C2A7] py-6" aria-labelledby="mini-cart-recommendations"><p className="eyebrow text-[#B7654A]">Curated for you</p><h3 id="mini-cart-recommendations" className="mt-2 font-display text-2xl">You may also like</h3><div className="mt-4 grid grid-cols-3 gap-3">{recommendations.map(product => <Link key={product.id} href={`/product/${product.id}`} onClick={close} className="group min-w-0"><img src={product.image} alt={product.name} className="aspect-[4/5] w-full bg-[#D7C2A7] object-cover transition duration-300 group-hover:opacity-80" /><p className="mt-2 truncate text-[11px]">{product.name}</p><p className="mt-1 text-[10px] text-[#866F62]">{formatPrice(product.price)}</p></Link>)}</div></section></div><div className="border-t border-[#D7C2A7] bg-[#F6F0E6] px-5 py-5 md:px-7"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><Link href="/checkout" onClick={close} data-testid="editorial-mini-cart-checkout" className="action-link-light pressable mt-5 flex items-center justify-center gap-2 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">CHECKOUT <ArrowRight size={14} /></Link><button type="button" onClick={close} className="mt-4 block w-full text-center text-[10px] uppercase tracking-[.14em] underline underline-offset-4">CONTINUE SHOPPING</button></div></> : <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={28} strokeWidth={1.1} className="text-[#D7C2A7]" /><h3 className="mt-5 font-display text-3xl">Your bag is quiet.</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#866F62]">Add a piece from this look and it will appear here.</p><button type="button" onClick={close} className="action-link-dark mt-7 border-b border-[#382820] pb-1 text-[10px] uppercase tracking-[.14em]">CONTINUE SHOPPING</button></div>}
    </aside>
  </div>;
}
