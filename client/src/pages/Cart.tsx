import { Link } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { ArrowRight, Minus, Plus, X } from 'lucide-react';
import { formatPrice, products } from '@/lib/brand';
import { CART_UPDATED_EVENT, cartItemCount, clearCart, getCart, removeFromCart, updateCartQuantity, type CartItem } from '@/lib/store';
import { useEffect, useMemo, useState } from 'react';

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(() => getCart());

  useEffect(() => {
    const sync = () => setItems(getCart());
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const lines = useMemo(() => items.map(item => ({ item, product: products.find(product => product.id === item.id) })).filter(line => line.product) as { item: CartItem; product: typeof products[number] }[], [items]);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const itemCount = cartItemCount(items);
  const updateQuantity = (item: CartItem, quantity: number) => {
    updateCartQuantity(item.id, quantity, item.size, item.color);
    setItems(getCart());
  };
  const removeLine = (item: CartItem) => {
    removeFromCart(item.id, item.size, item.color);
    setItems(getCart());
  };
  const clearBag = () => setItems(clearCart());

  return <div><SiteHeader /><main className="container py-12 md:py-20">
    <div className="flex flex-col justify-between gap-4 border-b border-[#D7C2A7] pb-8 md:flex-row md:items-end"><div><p className="eyebrow text-[#866F62]">Your considered selection</p><h1 className="mt-3 font-display text-5xl">Shopping bag</h1></div><div className="flex items-center justify-between gap-5 md:flex-col md:items-end md:gap-2"><p className="text-xs text-[#866F62]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>{lines.length > 0 && <button type="button" data-testid="clear-bag" onClick={clearBag} className="pressable text-[10px] uppercase tracking-[.14em] text-[#866F62] underline-offset-4 transition hover:text-[#B7654A] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]">Clear bag</button>}</div></div>
    {!lines.length ? <div className="py-24 text-center"><p className="eyebrow text-[#B7654A]">Nothing here yet</p><h2 className="mt-3 font-display text-4xl">Your bag is waiting.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#866F62]">Explore the edit and save the pieces that feel like you.</p><Link href="/shop" className="action-link-light pressable mt-8 inline-flex bg-[#382820] px-7 py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">Continue shopping</Link></div> : <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_.8fr]"><div>
      <div className="divide-y divide-[#D7C2A7] border-y border-[#D7C2A7]">{lines.map(({ item, product }) => <article key={`${item.id}-${item.size}-${item.color}`} className="py-6"><div className="flex gap-5"><img src={product.image} alt={product.name} className="h-36 w-28 object-cover" /><div className="flex min-w-0 flex-1 flex-col justify-between gap-5"><div className="flex justify-between gap-4"><div className="min-w-0"><Link href={`/product/${product.id}`} className="text-sm hover:underline">{product.name}</Link><p className="mt-2 text-xs text-[#866F62]">{product.brand} · {product.collection}</p><p className="mt-1 text-xs text-[#866F62]">{item.color || product.color}{item.size ? ` · ${item.size}` : ''}</p></div><p className="shrink-0 text-sm">{formatPrice(product.price * item.quantity)}</p></div><div className="flex items-center justify-between gap-4"><div className="flex items-center border border-[#D7C2A7]"><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(item, item.quantity - 1)} className="pressable px-3 py-2"><Minus size={13} /></button><span className="w-8 text-center text-xs" aria-label={`${item.quantity} in bag`}>{item.quantity}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => updateQuantity(item, item.quantity + 1)} className="pressable px-3 py-2"><Plus size={13} /></button></div><button type="button" data-testid={`remove-bag-item-${item.id}-${item.size || 'default'}-${item.color || 'default'}`} onClick={() => removeLine(item)} className="pressable inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#866F62]"><X size={15} /> Remove</button></div></div></div></article>)}</div>
      <div className="mt-14"><p className="eyebrow text-[#866F62]">You may also like</p><div className="mt-5 grid grid-cols-3 gap-4">{products.filter(product => !lines.some(line => line.product.id === product.id)).slice(0, 3).map(product => <Link key={product.id} href={`/product/${product.id}`}><img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" /><p className="mt-2 text-xs">{product.name}</p></Link>)}</div></div>
    </div><aside className="motion-surface h-fit bg-[#D7C2A7] p-7 md:p-9"><h2 className="font-display text-3xl">Summary</h2><div className="mt-7 space-y-4 border-b border-[#cfc4b6] pb-6 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Delivery</span><span>Complimentary</span></div></div><div className="flex justify-between py-6 text-base"><span>Total</span><span>{formatPrice(subtotal)}</span></div><Link href="/checkout" className="action-link-light pressable flex items-center justify-center gap-3 bg-[#382820] py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">Proceed to checkout <ArrowRight size={15} /></Link><p className="mt-5 text-center text-xs leading-5 text-[#6f675d]">Complimentary delivery on orders over ₦150,000</p></aside></div>}
  </main><BackToTop /></div>;
}
