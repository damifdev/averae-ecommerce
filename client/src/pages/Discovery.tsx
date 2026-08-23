import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { Link } from 'wouter';
import { brand, editorialEntries, formatPrice, products, trendCollections, trendItems, type Product } from '@/lib/brand';

function ProductTile({ product, badge }: { product: Product; badge?: string }) {
  return <Link href={`/product/${product.id}`} className="group block" aria-label={`View ${product.name}`}>
    <div className="relative aspect-[4/5] overflow-hidden bg-[#D7C2A7]">
      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      {badge && <span className="absolute left-3 top-3 bg-[#FFFDF8] px-2 py-1 text-[9px] uppercase tracking-[.14em]">{badge}</span>}
    </div>
    <div className="mt-4 flex justify-between gap-3 text-sm">
      <span className="min-w-0 truncate">{product.name}</span>
      <span className="shrink-0">{formatPrice(product.price)}</span>
    </div>
    <p className="mt-1 text-xs text-[#866F62]">{product.brand} · {product.color}</p>
  </Link>;
}

function TrendStory({ trend }: { trend: typeof trendCollections[number] }) {
  const relatedProducts = trend.productIds.map(id => products.find(product => product.id === id)).filter(Boolean) as Product[];
  return <section id={trend.slug} className="scroll-mt-8 border-t border-[#D7C2A7] pt-8">
    <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
      <div>
        <p className="eyebrow text-[#B7654A]">{trend.label}</p>
        <h2 className="mt-4 max-w-md font-display text-5xl leading-[.98] md:text-6xl">{trend.title}</h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-[#866F62]">{trend.description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={`#${trend.slug}`} className="border-b border-[#382820] pb-2 text-[10px] uppercase tracking-[.15em]">EXPLORE TREND</a>
          <Link href={trend.shopHref} className="action-link-light bg-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.15em] text-[#FFFDF8]">SHOP THE TREND</Link>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
        {relatedProducts.slice(0, 4).map(product => <ProductTile key={`${trend.slug}-${product.id}`} product={product} />)}
      </div>
    </div>
  </section>;
}

export function Trends() {
  const trendingProducts = products.filter(product => product.stock > 0 && product.badge).slice(0, 4);
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]">
    <SiteHeader />
    <main className="container py-16 md:py-24">
      <p className="eyebrow text-[#B7654A]">Discover what’s relevant now</p>
      <h1 className="mt-4 max-w-3xl font-display text-6xl leading-none md:text-8xl">Trending now.</h1>
      <p className="mt-6 max-w-xl text-sm leading-7 text-[#866F62]">Browse the styles, products and ideas shaping the next expression of fashion. Stay for the point of view, leave with a direction.</p>

      <section className="mt-14 border-y border-[#D7C2A7] py-6" aria-labelledby="trend-destinations-heading">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><p className="eyebrow text-[#866F62]">A map of what’s moving</p><h2 id="trend-destinations-heading" className="mt-2 font-display text-3xl">Find your next direction.</h2></div>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {trendCollections.map(trend => <a key={trend.slug} href={`#${trend.slug}`} className="text-[10px] uppercase tracking-[.14em] underline-offset-4 hover:underline">{trend.label}</a>)}
          </div>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="trending-products-heading">
        <div className="flex items-end justify-between gap-6 border-b border-[#D7C2A7] pb-5">
          <div><p className="eyebrow text-[#B7654A]">Trending products</p><h2 id="trending-products-heading" className="mt-3 font-display text-4xl md:text-5xl">The pieces people are finding now.</h2></div>
          <Link href="/shop?sort=trending" className="hidden items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:flex">SHOP ALL <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{trendingProducts.map(product => <ProductTile key={product.id} product={product} badge={product.badge} />)}</div>
        <Link href="/shop?sort=trending" className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] sm:hidden">SHOP ALL <ArrowRight size={14} /></Link>
      </section>

      <div className="mt-24 space-y-24" aria-label="Trend stories">{trendCollections.map(trend => <TrendStory key={trend.slug} trend={trend} />)}</div>

      <section className="mt-24 border-t border-[#D7C2A7] pt-8" aria-labelledby="trend-ideas-heading">
        <div className="flex items-end justify-between gap-6"><div><p className="eyebrow text-[#866F62]">A little more context</p><h2 id="trend-ideas-heading" className="mt-3 font-display text-4xl">Ideas to take with you.</h2></div><Link href="/edit" className="text-[10px] uppercase tracking-[.15em]">EXPLORE THE EDIT</Link></div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">{trendItems.slice(0, 3).map(item => <article key={item.title} className="border-t border-[#D7C2A7] pt-5"><span className="text-[10px] uppercase tracking-[.16em] text-[#B7654A]">{item.label}</span><h3 className="mt-10 font-display text-3xl">{item.title}</h3><p className="mt-4 text-sm leading-7 text-[#866F62]">{item.description}</p><Link href={`/product/${item.productId}`} className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em]">Discover a piece <ArrowRight size={14} /></Link></article>)}</div>
      </section>
    </main>
    <BackToTop />
  </div>;
}

export function Edit() {
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main className="container py-16 md:py-24"><p className="eyebrow text-[#B7654A]">Stories, style and culture</p><h1 className="mt-4 max-w-3xl font-display text-6xl leading-none md:text-8xl">The {brand.name} Edit.</h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#866F62]">Fashion trends, style guides, cultural spotlights and the ideas behind the pieces worth finding.</p><div className="mt-16 grid gap-10 md:grid-cols-3">{editorialEntries.map(entry => <Link key={entry.slug} href={`/edit/${entry.slug}`} className="group"><div className="aspect-[4/3] overflow-hidden bg-[#D7C2A7]"><img src={entry.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div><span className="mt-5 block text-[10px] uppercase tracking-[.15em] text-[#B7654A]">{entry.label}</span><h2 className="mt-2 font-display text-3xl group-hover:underline">{entry.title}</h2><p className="mt-3 text-sm leading-7 text-[#866F62]">{entry.description}</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em]">READ ARTICLE <ArrowRight size={14} /></span></Link>)}</div></main><BackToTop /></div>;
}

export function EditArticle({ params }: { params: { slug: string } }) {
  const entry = editorialEntries.find(item => item.slug === params.slug) ?? editorialEntries[0];
  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main><div className="container py-16 md:py-24"><p className="eyebrow text-[#B7654A]">{entry.label}</p><h1 className="mt-4 max-w-4xl font-display text-6xl leading-none md:text-8xl">{entry.title}</h1><p className="mt-7 max-w-xl text-base leading-8 text-[#866F62]">{entry.description}</p></div><div className="aspect-[16/7] overflow-hidden bg-[#D7C2A7]"><img src={entry.image} alt="" className="h-full w-full object-cover" /></div><div className="container grid gap-12 py-16 md:grid-cols-[.7fr_1.3fr] md:py-24"><p className="eyebrow text-[#B7654A]">The story</p><div className="max-w-2xl text-base leading-9"><p>Style is a conversation between where we are and where we are going. This edit brings together pieces, proportions and perspectives that feel relevant now, while leaving room for personal expression.</p><p className="mt-7">Explore the products referenced in the story, then make the look your own.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 border-b border-[#382820] pb-2 text-[10px] uppercase tracking-[.16em]">Shop the look <ArrowRight size={15} /></Link></div></div></main><BackToTop /></div>;
}
