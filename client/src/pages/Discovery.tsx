import { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, Heart, Instagram, MessageCircle, Pin, Share2, ShoppingBag } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import BackToTop from '@/components/BackToTop';
import { Link } from 'wouter';
import { addToCart, getSavedArticles, getWishlist, SAVED_ARTICLES_UPDATED_EVENT, toggleSavedArticle, toggleWishlist } from '@/lib/store';
import { availableSizes } from '@/lib/brand';
import { brand, editorialEntries, editorialTaxonomy, formatPrice, lookCollections, products, trendCollections, trendItems, type EditorialEntry, type Product } from '@/lib/brand';

function scrollToAnchor(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

async function shareEditorial(entry: EditorialEntry) {
  const url = window.location.href;
  if (typeof navigator.share === 'function') {
    await navigator.share({ title: entry.title, text: entry.description, url });
    return 'Editorial shared.';
  }
  await navigator.clipboard.writeText(url);
  return 'Article link copied.';
}

async function shareEditorialTo(platform: 'whatsapp' | 'pinterest' | 'instagram', entry: EditorialEntry) {
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${entry.title} · ${entry.description}`);
  if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank', 'noopener,noreferrer');
    return 'WhatsApp share opened.';
  }
  if (platform === 'pinterest') {
    window.open(`https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`, '_blank', 'noopener,noreferrer');
    return 'Pinterest share opened.';
  }
  await navigator.clipboard.writeText(url);
  return 'Article link copied for Instagram.';
}

function ProductTile({ product, badge }: { product: Product; badge?: string }) {
  return <Link href={`/product/${product.id}`} className="group block" aria-label={`View ${product.name}`}>
    <div className="relative aspect-[4/5] overflow-hidden bg-[#D7C2A7]">
      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      {badge && <span className="absolute left-3 top-3 bg-[#FFFDF8] px-2 py-1 text-[9px] uppercase tracking-[.14em]">{badge}</span>}
    </div>
    <div className="mt-4 flex justify-between gap-3 text-sm"><span className="min-w-0 truncate">{product.name}</span><span className="shrink-0">{formatPrice(product.price)}</span></div>
    <p className="mt-1 text-xs text-[#866F62]">{product.brand} · {product.color}</p>
  </Link>;
}

function ArticleCard({ entry }: { entry: EditorialEntry }) {
  return <Link href={`/edit/${entry.slug}`} className="group block" aria-label={`Read ${entry.title}`}>
    <div className="aspect-[4/3] overflow-hidden bg-[#D7C2A7]"><img src={entry.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[.15em] text-[#B7654A]"><span>{entry.category}</span><span className="text-[#D7C2A7]" aria-hidden="true">•</span><span>{entry.readingTime}</span><span className="text-[#D7C2A7]" aria-hidden="true">•</span><time>{entry.date}</time></div>
    <h2 className="mt-3 font-display text-3xl leading-tight group-hover:underline">{entry.title}</h2>
    <p className="mt-3 text-sm leading-7 text-[#866F62]">{entry.description}</p>
    <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em]">READ ARTICLE <ArrowRight size={14} /></span>
  </Link>;
}

function ShopTheLook({ productIds, image, title, description, audience, hotspots }: { productIds: readonly number[]; image: string; title: string; description: string; audience: 'Women' | 'Men' | 'Kids' | 'Unisex'; hotspots: readonly { productId: number; x: number; y: number; label: string }[] }) {
  const [status, setStatus] = useState('');
  const [savedProductIds, setSavedProductIds] = useState<number[]>(() => productIds.filter(id => getWishlist().includes(id)));
  const lookProducts = productIds.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[];
  useEffect(() => {
    const syncWishlist = () => setSavedProductIds(productIds.filter(id => getWishlist().includes(id)));
    window.addEventListener('averae-wishlist-updated', syncWishlist);
    return () => window.removeEventListener('averae-wishlist-updated', syncWishlist);
  }, [productIds]);
  const addProduct = (product: Product) => {
    const size = availableSizes(product)[0];
    if (!size) { setStatus(`${product.name} is currently unavailable.`); return; }
    addToCart(product.id, { size, color: product.color });
    setStatus(`${product.name} added to your bag.`);
  };
  const addAll = () => {
    const available = lookProducts.filter(product => availableSizes(product).length > 0);
    available.forEach(product => addToCart(product.id, { size: availableSizes(product)[0], color: product.color }));
    setStatus(available.length === lookProducts.length ? 'The full look was added to your bag.' : `${available.length} available look pieces were added to your bag.`);
  };
  const saveProduct = (product: Product) => {
    const next = toggleWishlist(product.id);
    setSavedProductIds(next.filter(id => productIds.includes(id)));
    setStatus(next.includes(product.id) ? `${product.name} saved.` : `${product.name} removed from saved products.`);
  };
  return <section className="border-y border-[#D7C2A7] py-10" aria-labelledby={`look-${audience.toLowerCase()}-heading`}>
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#D7C2A7]"><img src={image} alt={`${audience} editorial look`} className="h-full w-full object-cover" /><span className="absolute left-4 top-4 bg-[#FFFDF8] px-3 py-2 text-[10px] uppercase tracking-[.16em]">THIS LOOK · {audience}</span>{hotspots.map(hotspot => { const hotspotProduct = products.find(product => product.id === hotspot.productId); return <HoverCard key={hotspot.productId} openDelay={120} closeDelay={80}><HoverCardTrigger asChild><button type="button" data-testid={`look-hotspot-${audience.toLowerCase()}-${hotspot.productId}`} aria-label={`Shop ${hotspotProduct?.name ?? hotspot.label}`} onClick={() => scrollToAnchor(`look-product-${audience.toLowerCase()}-${hotspot.productId}`)} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FFFDF8] bg-[#382820] p-2 text-[#FFFDF8] shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFDF8]" style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}><span className="block h-2 w-2 rounded-full bg-[#D7C2A7]" /></button></HoverCardTrigger><HoverCardContent data-testid={`look-hotspot-card-${audience.toLowerCase()}-${hotspot.productId}`} className="w-60 border-[#D7C2A7] bg-[#FFFDF8] p-3 text-[#382820]"><p className="text-[10px] uppercase tracking-[.14em] text-[#B7654A]">{audience} look</p><p className="mt-2 text-sm font-medium">{hotspotProduct?.name ?? hotspot.label}</p>{hotspotProduct && <p className="mt-1 text-xs text-[#866F62]">{formatPrice(hotspotProduct.price)}</p>}{hotspotProduct && <div className="mt-3 grid gap-2"><button type="button" data-testid={`look-hotspot-add-${audience.toLowerCase()}-${hotspot.productId}`} onClick={() => addProduct(hotspotProduct)} disabled={availableSizes(hotspotProduct).length === 0} className="action-link-light pressable inline-flex items-center justify-center gap-2 bg-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em] text-[#FFFDF8] disabled:cursor-not-allowed disabled:opacity-45"><ShoppingBag size={13} /> ADD TO CART</button><button type="button" data-testid={`look-hotspot-save-${audience.toLowerCase()}-${hotspot.productId}`} onClick={() => saveProduct(hotspotProduct)} aria-pressed={savedProductIds.includes(hotspotProduct.id)} className="action-link-dark pressable inline-flex items-center justify-center gap-2 border border-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em]"><Heart size={13} fill={savedProductIds.includes(hotspotProduct.id) ? 'currentColor' : 'none'} /> {savedProductIds.includes(hotspotProduct.id) ? 'SAVED PRODUCT' : 'SAVE PRODUCT'}</button></div>}</HoverCardContent></HoverCard>; })}</div>
      <div>
        <p className="eyebrow text-[#B7654A]">Shop the look</p><h2 id={`look-${audience.toLowerCase()}-heading`} className="mt-3 font-display text-4xl md:text-5xl">{title}</h2><p className="mt-4 max-w-md text-sm leading-7 text-[#866F62]">{description}</p>
        <div className="mt-7 divide-y divide-[#D7C2A7] border-y border-[#D7C2A7]">{lookProducts.map(product => <div key={product.id} id={`look-product-${audience.toLowerCase()}-${product.id}`} className="flex scroll-mt-8 items-center justify-between gap-4 py-4"><div className="min-w-0"><Link href={`/product/${product.id}`} className="text-sm underline-offset-4 hover:underline">{product.name}</Link><p className="mt-1 text-xs text-[#866F62]">{formatPrice(product.price)} · {product.color}</p></div><button type="button" onClick={() => addProduct(product)} disabled={availableSizes(product).length === 0} className="action-link-dark inline-flex shrink-0 items-center gap-2 border border-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em] disabled:cursor-not-allowed disabled:opacity-45"><ShoppingBag size={13} /> ADD TO BAG</button></div>)}</div>
        <button type="button" onClick={addAll} className="action-link-light mt-6 inline-flex items-center gap-2 bg-[#382820] px-5 py-3 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]"><ShoppingBag size={14} /> ADD ALL TO BAG</button>
        <p className="mt-3 min-h-5 text-xs text-[#866F62]" aria-live="polite">{status}</p>
      </div>
    </div>
  </section>;
}

function TrendStory({ trend }: { trend: typeof trendCollections[number] }) {
  const [shareMessage, setShareMessage] = useState('');
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const relatedProducts = trend.productIds.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[];
  useEffect(() => { const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); const syncReducedMotion = () => setPrefersReducedMotion(mediaQuery.matches); syncReducedMotion(); mediaQuery.addEventListener?.('change', syncReducedMotion); return () => mediaQuery.removeEventListener?.('change', syncReducedMotion); }, []);
  useEffect(() => { if (!carouselApi || relatedProducts.length < 2 || carouselPaused || prefersReducedMotion) return; const intervalId = window.setInterval(() => carouselApi.scrollNext(), 4500); return () => window.clearInterval(intervalId); }, [carouselApi, carouselPaused, prefersReducedMotion, relatedProducts.length]);
  const shareTrend = async () => { const url = new URL(`/trends#${trend.slug}`, window.location.origin).toString(); try { if (typeof navigator.share === 'function') { await navigator.share({ title: `${trend.title} · Áveraẹ`, text: trend.description, url }); setShareMessage('Share sheet opened.'); } else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setShareMessage('Trend link copied.'); } else setShareMessage('Copy this trend link from your browser.'); } catch { setShareMessage('Share cancelled.'); } };
  return <section id={trend.slug} className="scroll-mt-8 border-t border-[#D7C2A7] pt-8" data-testid={`trend-section-${trend.slug}`}><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="eyebrow text-[#B7654A]">{trend.label}</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[.98] md:text-6xl">{trend.title}</h2><p className="mt-5 max-w-md text-sm leading-7 text-[#866F62]">{trend.description}</p><div className="mt-7 flex flex-wrap gap-3"><a href={`#${trend.slug}`} className="border-b border-[#382820] pb-2 text-[10px] uppercase tracking-[.15em]">EXPLORE TREND</a><Link href={trend.shopHref} className="action-link-light bg-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.15em] text-[#FFFDF8]">SHOP THE TREND</Link><button type="button" onClick={shareTrend} aria-label={`Share ${trend.title}`} className="inline-flex items-center gap-2 border border-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.15em] transition hover:bg-[#382820] hover:text-[#FFFDF8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]"><Share2 size={14} strokeWidth={1.4} /> SHARE</button></div><p className="min-h-5 mt-3 text-xs text-[#866F62]" aria-live="polite">{shareMessage}</p></div><Carousel opts={{ align: 'start', loop: relatedProducts.length > 1 }} setApi={setCarouselApi} className="w-full" aria-label={`${trend.title} related products`} data-testid={`trend-carousel-${trend.slug}`} data-autoplay-paused={carouselPaused || prefersReducedMotion ? 'true' : 'false'} onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onFocusCapture={() => setCarouselPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselPaused(false); }}><CarouselContent className="-ml-4">{relatedProducts.slice(0, 4).map(product => <CarouselItem key={`${trend.slug}-${product.id}`} className="basis-[82%] sm:basis-1/2 xl:basis-1/3"><ProductTile product={product} /></CarouselItem>)}</CarouselContent><CarouselPrevious className="left-3 border-[#382820] bg-[#FFFDF8]/90 text-[#382820] hover:bg-[#FFFDF8]" /><CarouselNext className="right-3 border-[#382820] bg-[#FFFDF8]/90 text-[#382820] hover:bg-[#FFFDF8]" /></Carousel></div></section>;
}

export function Trends() {
  const trendingProducts = products.filter(product => product.stock > 0 && product.badge).slice(0, 4);
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main className="container py-16 md:py-24"><p className="eyebrow text-[#B7654A]">Discover what’s relevant now</p><h1 className="mt-4 max-w-3xl font-display text-6xl leading-none md:text-8xl">Trending now.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#866F62]">Browse the styles, products and ideas shaping the next expression of fashion. Stay for the point of view, leave with a direction.</p><section className="mt-14 border-y border-[#D7C2A7] py-6" aria-labelledby="trend-destinations-heading"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow text-[#866F62]">A map of what’s moving</p><h2 id="trend-destinations-heading" className="mt-2 font-display text-3xl">Find your next direction.</h2></div><div className="flex flex-wrap gap-x-5 gap-y-3">{trendCollections.map(trend => <a key={trend.slug} href={`#${trend.slug}`} className="text-[10px] uppercase tracking-[.14em] underline-offset-4 hover:underline">{trend.label}</a>)}</div></div></section><section className="mt-16" aria-labelledby="trending-products-heading"><div className="flex items-end justify-between gap-6 border-b border-[#D7C2A7] pb-5"><div><p className="eyebrow text-[#B7654A]">Trending products</p><h2 id="trending-products-heading" className="mt-3 font-display text-4xl md:text-5xl">The pieces people are finding now.</h2></div><Link href="/shop?sort=trending" className="hidden items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:flex">SHOP ALL <ArrowRight size={14} /></Link></div><div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{trendingProducts.map(product => <ProductTile key={product.id} product={product} badge={product.badge} />)}</div><Link href="/shop?sort=trending" className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:hidden">SHOP ALL <ArrowRight size={14} /></Link></section><div className="mt-24 space-y-24" aria-label="Trend stories">{trendCollections.map(trend => <TrendStory key={trend.slug} trend={trend} />)}</div><section className="mt-24 border-t border-[#D7C2A7] pt-8" aria-labelledby="trend-ideas-heading"><div className="flex items-end justify-between gap-6"><div><p className="eyebrow text-[#866F62]">A little more context</p><h2 id="trend-ideas-heading" className="mt-3 font-display text-4xl">Ideas to take with you.</h2></div><Link href="/edit" className="text-[10px] uppercase tracking-[.15em]">EXPLORE THE EDIT</Link></div><div className="mt-8 grid gap-8 md:grid-cols-3">{trendItems.slice(0, 3).map(item => <article key={item.title} className="border-t border-[#D7C2A7] pt-5"><span className="text-[10px] uppercase tracking-[.16em] text-[#B7654A]">{item.label}</span><h3 className="mt-10 font-display text-3xl">{item.title}</h3><p className="mt-4 text-sm leading-7 text-[#866F62]">{item.description}</p><Link href={`/product/${item.productId}`} className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em]">Discover a piece <ArrowRight size={14} /></Link></article>)}</div></section></main><BackToTop /></div>;
}

export function Edit() {
  const [activeCategory, setActiveCategory] = useState<typeof editorialTaxonomy[number] | 'All'>('All');
  const filteredEntries = activeCategory === 'All' ? editorialEntries : editorialEntries.filter(entry => entry.category === activeCategory);
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main className="container py-16 md:py-24"><p className="eyebrow text-[#B7654A]">Stories, style and culture</p><h1 className="mt-4 max-w-3xl font-display text-6xl leading-none md:text-8xl">The {brand.name} Edit.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#866F62]">A digital fashion magazine for trends, style guides, culture and the ideas behind the pieces worth finding.</p><nav className="mt-12 overflow-x-auto border-y border-[#D7C2A7] py-5" aria-label="Edit categories"><div className="flex min-w-max gap-5">{(['All', ...editorialTaxonomy] as const).map(category => <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className={`text-[10px] uppercase tracking-[.14em] underline-offset-4 transition hover:underline ${activeCategory === category ? 'text-[#B7654A]' : 'text-[#866F62]'}`}>{category}</button>)}</div></nav><section className="mt-14" aria-labelledby="edit-stories-heading"><div className="flex items-end justify-between gap-5 border-b border-[#D7C2A7] pb-5"><div><p className="eyebrow text-[#B7654A]">The latest stories</p><h2 id="edit-stories-heading" className="mt-3 font-display text-4xl md:text-5xl">Read, save, come back to.</h2></div><span className="text-xs text-[#866F62]">{filteredEntries.length} stories</span></div><div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3">{filteredEntries.map(entry => <ArticleCard key={entry.slug} entry={entry} />)}</div></section><section className="mt-24" aria-labelledby="edit-look-heading"><div className="mb-8 flex items-end justify-between gap-5 border-b border-[#D7C2A7] pb-5"><div><p className="eyebrow text-[#B7654A]">Content → inspiration → purchase</p><h2 id="edit-look-heading" className="mt-3 font-display text-4xl md:text-5xl">This look, made yours.</h2></div><p className="max-w-sm text-right text-sm leading-6 text-[#866F62]">Choose a point of view, identify each piece, then add one or the whole look to your bag.</p></div><div className="space-y-12">{lookCollections.map(look => <ShopTheLook key={look.slug} productIds={look.productIds} image={look.image} title={look.title} description={look.description} audience={look.audience} hotspots={look.hotspots} />)}</div></section></main><BackToTop /></div>;
}

function ArticleSkeleton() {
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]" data-testid="article-skeleton" aria-busy="true" aria-label="Loading article"><SiteHeader /><main><div className="container py-10 md:py-16"><div className="skeleton-block h-3 w-56" /><div className="mt-12 max-w-4xl"><div className="skeleton-block h-3 w-20" /><div className="skeleton-block mt-5 h-24 w-full max-w-3xl md:h-36" /><div className="skeleton-block mt-7 h-5 w-full max-w-2xl" /><div className="skeleton-block mt-3 h-5 w-3/4 max-w-xl" /><div className="mt-8 flex flex-wrap gap-3"><div className="skeleton-block h-11 w-32" /><div className="skeleton-block h-11 w-20" /><div className="skeleton-block h-11 w-28" /><div className="skeleton-block h-11 w-28" /></div></div></div><div className="skeleton-block aspect-[16/7] w-full" /><div className="container grid gap-12 py-16 md:grid-cols-[.7fr_1.3fr] md:py-24"><div className="skeleton-block h-24 w-full max-w-xs" /><div className="space-y-5"><div className="skeleton-block h-5 w-full" /><div className="skeleton-block h-5 w-full" /><div className="skeleton-block h-5 w-5/6" /><div className="skeleton-block h-12 w-44" /></div></div></main></div>;
}

export function EditArticle({ params }: { params: { slug: string } }) {
  const entry = editorialEntries.find(item => item.slug === params.slug) ?? editorialEntries[0];
  const relatedProducts = entry.relatedProductIds.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[];
  const relatedArticles = entry.relatedArticleSlugs.map(slug => editorialEntries.find(article => article.slug === slug)).filter(Boolean) as EditorialEntry[];
  const [saved, setSaved] = useState(() => getSavedArticles().includes(entry.slug));
  const [shareStatus, setShareStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => setIsLoading(false), reduced ? 60 : 180);
    return () => window.clearTimeout(timeout);
  }, [entry.slug]);
  useEffect(() => {
    const syncSaved = () => setSaved(getSavedArticles().includes(entry.slug));
    window.addEventListener(SAVED_ARTICLES_UPDATED_EVENT, syncSaved);
    return () => window.removeEventListener(SAVED_ARTICLES_UPDATED_EVENT, syncSaved);
  }, [entry.slug]);
  const toggleSave = () => { const next = toggleSavedArticle(entry.slug); setSaved(next.includes(entry.slug)); };
  const handleShare = async () => { try { setShareStatus(await shareEditorial(entry)); } catch { setShareStatus('Share cancelled.'); } };
  const handlePlatformShare = async (platform: 'whatsapp' | 'pinterest' | 'instagram') => { try { setShareStatus(await shareEditorialTo(platform, entry)); } catch { setShareStatus('Sharing was unavailable.'); } };
  if (isLoading) return <ArticleSkeleton />;
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main><div className="container py-10 md:py-16"><nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[.14em] text-[#866F62]"><Link href="/edit" className="hover:underline">The Edit</Link><span className="mx-3" aria-hidden="true">/</span><span>{entry.category}</span><span className="mx-3" aria-hidden="true">/</span><span aria-current="page">{entry.title}</span></nav><div className="mt-12 max-w-4xl"><p className="eyebrow text-[#B7654A]">{entry.category}</p><h1 className="mt-4 font-display text-6xl leading-none md:text-8xl">{entry.title}</h1><p className="mt-7 max-w-2xl text-base leading-8 text-[#866F62]">{entry.description}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[.14em] text-[#866F62]"><span>Words by {entry.author}</span><span aria-hidden="true">·</span><time>{entry.date}</time><span aria-hidden="true">·</span><span>{entry.readingTime}</span></div><div className="mt-8 flex flex-wrap items-center gap-3"><button type="button" data-testid="save-article" aria-pressed={saved} onClick={toggleSave} className="action-link-dark inline-flex items-center gap-2 border border-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.14em]"><Bookmark size={14} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'SAVED ARTICLE' : 'SAVE ARTICLE'}</button><button type="button" data-testid="share-article" onClick={handleShare} className="inline-flex items-center gap-2 border-b border-[#382820] pb-2 text-[10px] uppercase tracking-[.14em]"><Share2 size={14} /> SHARE</button><div className="flex flex-wrap gap-2" aria-label="Share this article"><button type="button" data-testid="share-whatsapp" onClick={() => handlePlatformShare('whatsapp')} aria-label="Share on WhatsApp" className="inline-flex items-center gap-2 border border-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em] transition hover:bg-[#382820] hover:text-[#FFFDF8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]"><MessageCircle size={13} /> WhatsApp</button><button type="button" data-testid="share-pinterest" onClick={() => handlePlatformShare('pinterest')} aria-label="Share on Pinterest" className="inline-flex items-center gap-2 border border-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em] transition hover:bg-[#382820] hover:text-[#FFFDF8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]"><Pin size={13} /> Pinterest</button><button type="button" data-testid="share-instagram" onClick={() => handlePlatformShare('instagram')} aria-label="Copy article link for Instagram" className="inline-flex items-center gap-2 border border-[#382820] px-3 py-2 text-[10px] uppercase tracking-[.12em] transition hover:bg-[#382820] hover:text-[#FFFDF8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]"><Instagram size={13} /> Instagram</button></div><span className="sr-only" aria-live="polite">{shareStatus}</span></div></div></div><div className="aspect-[16/7] overflow-hidden bg-[#D7C2A7]"><img src={entry.image} alt={`${entry.title} editorial feature`} className="h-full w-full object-cover" /></div><div className="container grid gap-12 py-16 md:grid-cols-[.7fr_1.3fr] md:py-24"><aside><p className="eyebrow text-[#B7654A]">The story</p><p className="mt-4 text-sm leading-7 text-[#866F62]">An edit by {entry.author}<br />{entry.date}<br />{entry.readingTime}</p></aside><article className="max-w-2xl text-base leading-9">{entry.content.map((paragraph, index) => <p key={paragraph} className={index ? 'mt-7' : ''}>{paragraph}</p>)}<div className="mt-10 flex flex-wrap gap-4"><Link href="#this-look" onClick={(event) => { event.preventDefault(); scrollToAnchor('this-look'); }} className="action-link-light inline-flex items-center gap-2 bg-[#382820] px-5 py-3 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">SHOP THIS LOOK <ArrowRight size={14} /></Link><Link href="#related-products" className="inline-flex items-center gap-2 border-b border-[#382820] pb-2 text-[10px] uppercase tracking-[.16em]">SHOP RELATED PRODUCTS <ArrowRight size={14} /></Link></div></article></div><section id="related-products" className="container border-t border-[#D7C2A7] py-16 md:py-24" aria-labelledby="related-products-heading"><div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-[#B7654A]">From the story</p><h2 id="related-products-heading" className="mt-3 font-display text-4xl">Shop related products.</h2></div><Link href="/shop" className="text-[10px] uppercase tracking-[.15em]">VIEW SHOP</Link></div><div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map(product => <ProductTile key={product.id} product={product} />)}</div></section><section id="this-look" className="container py-8 md:py-12"><ShopTheLook productIds={entry.lookProductIds} image={entry.image} title={`Make ${entry.title.toLowerCase()} yours.`} description="Identify the pieces used in this story, then add one or the full look to your bag." audience={entry.audience} hotspots={entry.hotspots} /></section><section className="container border-t border-[#D7C2A7] py-16 md:py-24" aria-labelledby="related-articles-heading"><div><p className="eyebrow text-[#B7654A]">Keep reading</p><h2 id="related-articles-heading" className="mt-3 font-display text-4xl">Related articles.</h2></div><div className="mt-8 grid gap-10 md:grid-cols-2">{relatedArticles.map(article => <ArticleCard key={article.slug} entry={article} />)}</div></section></main><BackToTop /></div>;
}
