import { ArrowRight, Check, Bell } from 'lucide-react';
import { Link } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { categoryLandingPages, formatPrice, products } from '@/lib/brand';
import { getBackInStockSubscriptions, toggleBackInStockSubscription } from '@/lib/store';
import { toast } from 'sonner';
import { useState } from 'react';

type LandingSlug = keyof typeof categoryLandingPages;

export default function CategoryLanding({ slug }: { slug: LandingSlug }) {
  const landing = categoryLandingPages[slug];
  const categoryLabel = slug === 'hair' ? 'Hair' : 'Thrift Wear';
  const items = products.filter(product => product.category === categoryLabel);
  const [subscriptions, setSubscriptions] = useState(() => getBackInStockSubscriptions());
  const toggleNotify = (productId: number) => {
    const next = toggleBackInStockSubscription(productId);
    setSubscriptions(next);
    toast.success(next.includes(productId) ? 'We’ll let you know when similar pieces arrive.' : 'Notification removed.');
  };

  return <div><SiteHeader /><main>
    <section className="relative min-h-[min(72vh,680px)] overflow-hidden bg-[#382820]">
      <img src={landing.image} alt={`${landing.title} editorial`} className="absolute inset-0 h-full w-full object-cover" />
      <div className={`absolute inset-0 ${slug === 'hair' ? 'bg-gradient-to-r from-[#382820]/80 via-[#382820]/35 to-transparent' : 'bg-gradient-to-l from-[#382820]/80 via-[#382820]/35 to-transparent'}`} />
      <div className={`container relative flex min-h-[min(72vh,680px)] items-end py-16 md:items-center ${slug === 'hair' ? '' : 'justify-end'}`}>
        <div className="max-w-xl text-[#FFFDF8]"><p className="eyebrow text-[#EAD7C2]">{landing.eyebrow}</p><h1 className="mt-4 font-display text-5xl leading-[.95] md:text-7xl">{landing.title}</h1><p className="mt-6 max-w-lg text-sm leading-7 text-[#F6F0E6]/85">{landing.description}</p><Link href={`/shop?category=${slug}`} className="action-link-light mt-8 inline-flex items-center gap-3 bg-[#B7654A] px-5 py-4 text-[10px] uppercase tracking-[.16em] transition hover:bg-[#FFFDF8] hover:text-[#382820]">{landing.cta}<ArrowRight size={14} /></Link></div>
      </div>
    </section>
    <section className="container py-14 md:py-20">
      <div className="flex flex-col justify-between gap-5 border-b border-[#D7C2A7] pb-7 md:flex-row md:items-end"><div><p className="eyebrow text-[#866F62]">Shop by edit</p><h2 className="mt-3 font-display text-4xl">Find your direction</h2></div><Link href={`/shop?category=${slug}`} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] hover:text-[#B7654A]">View all {categoryLabel}<ArrowRight size={14} /></Link></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{landing.subcategories.map(subcategory => <Link key={subcategory} href={`/shop?category=${slug}&search=${encodeURIComponent(subcategory)}`} className="group border border-[#D7C2A7] bg-[#FFFDF8] p-5 transition hover:-translate-y-1 hover:border-[#B7654A]"><p className="font-display text-2xl">{subcategory}</p><span className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#866F62] group-hover:text-[#B7654A]">Explore <ArrowRight size={13} /></span></Link>)}</div>
      <div className="mt-20"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow text-[#866F62]">{slug === 'hair' ? 'Selected textures' : 'Archive finds'}</p><h2 className="mt-3 font-display text-4xl">{slug === 'hair' ? 'Texture, length, movement' : 'Singular pieces, clearly marked'}</h2></div><Link href={`/shop?category=${slug}`} className="hidden items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:inline-flex">Shop all <ArrowRight size={14} /></Link></div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{items.map(product => { const soldOut = product.stock === 0; const subscribed = subscriptions.includes(product.id); return <article key={product.id} className="group"><Link href={`/product/${product.id}`} className="block"><div className="relative aspect-[4/5] overflow-hidden bg-[#D7C2A7]"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />{product.badge && <span className="absolute left-3 top-3 bg-[#FFFDF8] px-2 py-1 text-[9px] uppercase tracking-[.14em]">{product.badge}</span>}{slug === 'thrift-wear' && <span className="absolute bottom-3 left-3 bg-[#382820] px-2 py-1 text-[9px] uppercase tracking-[.14em] text-[#FFFDF8]">{soldOut ? 'Sold out' : product.stock === 1 ? 'Only 1 available' : 'One of a kind'}</span>}</div></Link><div className="flex items-start justify-between gap-4 pt-4"><div><Link href={`/product/${product.id}`} className="text-sm hover:underline">{product.name}</Link><p className="mt-1 text-xs text-[#866F62]">{product.brand} · {product.color}</p><p className="mt-1 text-xs text-[#866F62]">{formatPrice(product.price)}</p></div>{soldOut && slug === 'thrift-wear' && <button type="button" onClick={() => toggleNotify(product.id)} className="focus-ring inline-flex shrink-0 items-center gap-2 border border-[#D7C2A7] px-3 py-2 text-[9px] uppercase tracking-[.12em] hover:border-[#B7654A] hover:text-[#B7654A]" aria-pressed={subscribed}>{subscribed ? <Check size={12} /> : <Bell size={12} />}{subscribed ? 'Notified' : 'Notify Me'}</button>}</div></article>; })}</div>
      </div>
    </section>
  </main><BackToTop /></div>;
}
