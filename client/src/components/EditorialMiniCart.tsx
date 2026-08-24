import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Link } from 'wouter';
import { formatPrice, products } from '@/lib/brand';
import { cartItemCount, CART_UPDATED_EVENT, getCart, removeFromCart, type CartItem } from '@/lib/store';

type EditorialMiniCartProps = { open: boolean; onOpenChange: (open: boolean) => void };

export default function EditorialMiniCart({ open, onOpenChange }: EditorialMiniCartProps) {
  const [items, setItems] = useState<CartItem[]>(() => getCart());
  useEffect(() => {
    const sync = () => setItems(getCart());
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(CART_UPDATED_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onOpenChange(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);
  const lines = useMemo(() => items.map(item => ({ item, product: products.find(product => product.id === item.id) })).filter(line => line.product) as { item: CartItem; product: typeof products[number] }[], [items]);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const count = cartItemCount(items);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80]" role="presentation">
    <button type="button" aria-label="Close mini cart" onClick={() => onOpenChange(false)} className="absolute inset-0 bg-[#382820]/35" />
    <aside role="dialog" aria-modal="true" aria-labelledby="editorial-mini-cart-title" data-testid="editorial-mini-cart" className="mini-cart-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FFFDF8] text-[#382820] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#D7C2A7] px-5 py-5 md:px-7"><div><p className="eyebrow text-[#B7654A]">Your selection</p><h2 id="editorial-mini-cart-title" className="mt-1 font-display text-3xl">Mini cart <span className="font-sans text-sm text-[#866F62]">({count})</span></h2></div><button type="button" aria-label="Close mini cart" onClick={() => onOpenChange(false)} className="focus-ring rounded-full p-2 hover:bg-[#F6F0E6]"><X size={19} strokeWidth={1.3} /></button></div>
      {lines.length ? <><div className="flex-1 overflow-y-auto px-5 md:px-7"><div className="divide-y divide-[#D7C2A7]">{lines.map(({ item, product }) => <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 py-5"><img src={product.image} alt={product.name} className="h-28 w-22 shrink-0 object-cover bg-[#D7C2A7]" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><Link href={`/product/${product.id}`} onClick={() => onOpenChange(false)} className="text-sm hover:underline">{product.name}</Link><p className="mt-1 text-xs text-[#866F62]">{item.color || product.color}{item.size ? ` · ${item.size}` : ''}</p></div><p className="shrink-0 text-sm">{formatPrice(product.price * item.quantity)}</p></div><div className="mt-5 flex items-center justify-between"><div className="inline-flex items-center border border-[#D7C2A7]"><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => { const next = Math.max(0, item.quantity - 1); setItems(next ? getCart().map(current => current.id === item.id && current.size === item.size && current.color === item.color ? { ...current, quantity: next } : current) : removeFromCart(item.id, item.size, item.color)); }} className="p-2 focus-ring"><Minus size={13} /></button><span className="min-w-8 text-center text-xs">{item.quantity}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => { const next = getCart().map(current => current.id === item.id && current.size === item.size && current.color === item.color ? { ...current, quantity: current.quantity + 1 } : current); window.localStorage.setItem('averae-cart', JSON.stringify(next)); window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT)); setItems(next); }} className="p-2 focus-ring"><Plus size={13} /></button></div><button type="button" onClick={() => setItems(removeFromCart(item.id, item.size, item.color))} className="text-[10px] uppercase tracking-[.14em] text-[#866F62] underline-offset-4 hover:text-[#B7654A] hover:underline">Remove</button></div></div></div>)}</div></div><div className="border-t border-[#D7C2A7] bg-[#F6F0E6] px-5 py-5 md:px-7"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><Link href="/checkout" onClick={() => onOpenChange(false)} data-testid="editorial-mini-cart-checkout" className="action-link-light pressable mt-5 flex items-center justify-center gap-2 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">CHECKOUT <ArrowRight size={14} /></Link><button type="button" onClick={() => onOpenChange(false)} className="mt-4 block w-full text-center text-[10px] uppercase tracking-[.14em] underline underline-offset-4">CONTINUE SHOPPING</button></div></> : <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={28} strokeWidth={1.1} className="text-[#D7C2A7]" /><h3 className="mt-5 font-display text-3xl">Your bag is quiet.</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#866F62]">Add a piece from this look and it will appear here.</p><button type="button" onClick={() => onOpenChange(false)} className="action-link-dark mt-7 border-b border-[#382820] pb-1 text-[10px] uppercase tracking-[.14em]">CONTINUE SHOPPING</button></div>}
    </aside>
  </div>;
}
