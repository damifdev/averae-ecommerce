import { Link, useLocation } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import QuickView from '@/components/QuickView';
import { ArrowRight, Filter, Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import BackToTop from '@/components/BackToTop';
import { audienceCategories, categoryFilterOptions, categorySubcategories, productCategories, products, formatPrice, type Product } from '@/lib/brand';
import { useEffect, useMemo, useState } from 'react';
import { addToCart, getWishlist, toggleWishlist } from '@/lib/store';

function normalizeAudience(value: string | null) {
  if (!value || value.toLowerCase() === 'all') return 'All';
  const match = audienceCategories.find(item => item.slug === value.toLowerCase() || item.label.toLowerCase() === value.toLowerCase());
  return match?.label ?? value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeCategory(value: string | null) {
  if (!value || value.toLowerCase() === 'all') return 'All';
  const match = productCategories.find(item => item.slug === value.toLowerCase() || item.label.toLowerCase() === value.toLowerCase());
  return match?.label ?? value.replace(/-/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}

const sortOptions = ['Recommended', 'Newest', 'Trending', 'Best Selling', 'Price: Low to High', 'Price: High to Low'] as const;
const filterDefaults = { size: 'All sizes', subcategory: 'All subcategories', length: 'All lengths', texture: 'All textures', style: 'All styles', colour: 'All colours', condition: 'All conditions', price: 'All prices', brand: 'All brands', collection: 'All collections', availability: 'All availability', rating: 'All ratings', trend: 'All trend status' };
type FilterState = typeof filterDefaults;
type FilterKey = keyof FilterState;
const ratingOptions = ['4 stars & up', 'Not yet rated'];
const selectStyles = 'mt-2 w-full border-b border-[#D7C2A7] bg-transparent pb-2 text-xs outline-none focus:border-[#382820]';
const audienceSubcategories: Record<string, { label: string; category: string }[]> = {
  Women: ['Clothing', 'Dresses', 'Tops', 'Trousers', 'Outerwear', 'Shoes', 'Bags', 'Jewelry', 'Accessories'].map(label => ({ label, category: ['Dresses', 'Tops', 'Trousers', 'Outerwear'].includes(label) ? 'clothing' : label.toLowerCase() })),
  Men: ['Clothing', 'Shirts', 'Trousers', 'Outerwear', 'Shoes', 'Bags', 'Watches', 'Accessories'].map(label => ({ label, category: ['Shirts', 'Trousers', 'Outerwear'].includes(label) ? 'clothing' : label.toLowerCase() })),
  Kids: ['Clothing', 'Sets', 'Shoes', 'Accessories'].map(label => ({ label, category: ['Sets'].includes(label) ? 'clothing' : label.toLowerCase() })),
  Unisex: ['Clothing', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'Watches'].map(label => ({ label, category: label.toLowerCase() })),
};

function trendStatus(product: Product) {
  if (product.badge === 'New') return 'New';
  if (product.badge === 'Best Seller') return 'Popular';
  if (product.badge === 'Limited') return "Editor's Pick";
  return 'Trending';
}

function NoResultsDiscovery({ query, onClear }: { query: string; onClear: () => void }) {
  const popularCategories = productCategories.filter(category => ['hair', 'thrift-wear', 'clothing', 'shoes'].includes(category.slug));
  const trendingProducts = products.filter(product => product.stock > 0 && product.badge).slice(0, 3);
  const newArrivals = products.filter(product => product.badge === 'New' && product.stock > 0).slice(0, 3);
  const fallbackArrivals = newArrivals.length ? newArrivals : products.filter(product => product.stock > 0).slice(-3);
  const suggestedSearches = ['human hair', 'thrift wear', 'linen', 'essentials', 'bags'];
  return <div data-testid="no-results-discovery" className="py-16 md:py-24">
    <div className="max-w-2xl">
      <p className="eyebrow text-[#B7654A]">Keep exploring</p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">{query.trim() ? `No results for “${query.trim()}”` : 'No products match these filters.'}</h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#866F62]">Try a different search or follow one of the paths below. There is always another direction to find.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        {suggestedSearches.map(term => <Link key={term} href={`/shop?search=${term}`} className="border border-[#D7C2A7] px-3 py-2 text-[10px] uppercase tracking-[.14em] hover:border-[#B7654A] hover:text-[#B7654A]">{term}</Link>)}
        <button type="button" onClick={onClear} className="border-b border-[#382820] px-1 py-2 text-[10px] uppercase tracking-[.14em]">Clear all</button>
      </div>
    </div>
    <div className="mt-16 grid gap-10 border-t border-[#D7C2A7] pt-8 md:grid-cols-3">
      <div><p className="eyebrow text-[#866F62]">Popular categories</p><div className="mt-4 space-y-3">{popularCategories.map(category => <Link key={category.slug} href={`/shop?category=${category.slug}`} className="flex items-center justify-between border-b border-[#D7C2A7] pb-3 text-sm hover:text-[#B7654A]"><span>{category.label}</span><ArrowRight size={14} /></Link>)}</div></div>
      <div><p className="eyebrow text-[#866F62]">Trending products</p><div className="mt-4 space-y-4">{trendingProducts.map(product => <Link key={product.id} href={`/product/${product.id}`} className="flex items-center gap-3 group"><img src={product.image} alt="" className="h-16 w-12 object-cover bg-[#D7C2A7]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm group-hover:underline">{product.name}</span><span className="mt-1 block text-xs text-[#866F62]">{formatPrice(product.price)}</span></span><ArrowRight size={14} /></Link>)}</div></div>
      <div><p className="eyebrow text-[#866F62]">New arrivals</p><div className="mt-4 space-y-4">{fallbackArrivals.map(product => <Link key={product.id} href={`/product/${product.id}`} className="flex items-center gap-3 group"><img src={product.image} alt="" className="h-16 w-12 object-cover bg-[#D7C2A7]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm group-hover:underline">{product.name}</span><span className="mt-1 block text-xs text-[#866F62]">{formatPrice(product.price)}</span></span><ArrowRight size={14} /></Link>)}</div></div>
    </div>
    <Link href="/trends" className="action-link-light mt-12 inline-flex items-center gap-3 bg-[#382820] px-5 py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8]">EXPLORE TRENDING <ArrowRight size={14} /></Link>
  </div>;
}

function Card({ p, onQuickView }: { p: Product; onQuickView: (product: Product) => void }) {
  const [liked, setLiked] = useState(() => getWishlist().includes(p.id));
  const [added, setAdded] = useState(false);
  const requiresOptions = p.sizes.length > 1 || p.colors.length > 1;
  const quickAdd = () => {
    addToCart(p.id, { size: p.sizes[0] ?? 'One size', color: p.colors[0] ?? p.color });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };
  const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  return <article className="group" data-testid={`product-card-${p.id}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D7C2A7]">
      <Link href={`/product/${p.id}`} aria-label={`View ${p.name}`} className="block h-full w-full"><img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></Link>
      <button type="button" onClick={() => { setLiked(!liked); toggleWishlist(p.id); }} className="pressable focus-ring absolute right-3 top-3 rounded-full bg-[#FFFDF8]/90 p-2" aria-label={liked ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}><Heart size={15} fill={liked ? '#B7654A' : 'none'} strokeWidth={1.3} /></button>
      {p.badge && <span className="absolute left-3 top-3 bg-[#FFFDF8] px-2 py-1 text-[9px] uppercase tracking-[.14em]">{p.badge}</span>}
      {p.category === 'Thrift Wear' && <span className="absolute left-3 top-10 bg-[#382820] px-2 py-1 text-[9px] uppercase tracking-[.14em] text-[#FFFDF8]">{p.stock === 0 ? 'Sold out' : p.stock === 1 ? 'Only 1 available' : 'One of a kind'}</span>}
      {discount > 0 && <span className="absolute left-3 top-10 bg-[#B7654A] px-2 py-1 text-[9px] uppercase tracking-[.14em] text-[#FFFDF8]">-{discount}%</span>}
      {p.category === 'Thrift Wear' && <div className="pointer-events-none absolute inset-x-3 bottom-[8.1rem] border border-[#FFFDF8]/70 bg-[#382820]/95 p-3 text-[#FFFDF8] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100" data-testid={`thrift-card-details-${p.id}`}><p className="text-[9px] uppercase tracking-[.14em] text-[#D7C2A7]">Archive details</p><p className="mt-2 text-xs">{p.condition || 'Condition reviewed'} · Size {p.sizes[0] || 'One size'}</p></div>}
      <div className="product-card-overlay absolute inset-x-3 bottom-3 grid gap-2">
        <button type="button" aria-label={`Quick view ${p.name}`} aria-haspopup="dialog" onClick={() => onQuickView(p)} className="product-card-action product-card-action-light pressable block w-full border border-[#D7C2A7] bg-[#FFFDF8] py-3 text-center text-[10px] uppercase tracking-[.15em] text-[#382820]">Quick view</button>
        {requiresOptions ? <Link href={`/product/${p.id}`} className="action-link-light product-card-action pressable block bg-[#382820] py-3 text-center text-[10px] uppercase tracking-[.15em] text-[#FFFDF8]">Select options</Link> : <button type="button" onClick={quickAdd} className="action-link-light product-card-action pressable block w-full bg-[#382820] py-3 text-center text-[10px] uppercase tracking-[.15em] text-[#FFFDF8]">{added ? 'Added to bag' : 'Quick add'}</button>}
        <span className="sr-only" aria-live="polite">{added ? `${p.name} added to bag` : ''}</span>
      </div>
    </div>
    <div className="flex justify-between gap-3 pt-4"><div className="min-w-0"><Link href={`/product/${p.id}`} className="text-sm hover:underline">{p.name}</Link><p className="mt-1 text-xs text-[#866F62]">{p.brand} · {p.category}</p><p className="mt-1 text-xs text-[#866F62]">{p.collection} · {p.color}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#B7654A]">{p.rating === null ? 'No ratings yet' : `${p.rating.toFixed(1)} · ${p.ratingCount} ratings`}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#B7654A]">{trendStatus(p)}</p></div><div className="text-right text-sm"><p>{formatPrice(p.price)}</p>{p.compareAt && <p className="mt-1 text-xs text-[#866F62] line-through">{formatPrice(p.compareAt)}</p>}</div></div>
  </article>;
}

export default function Shop() {
  const [location] = useLocation();
  const searchString = typeof window === 'undefined' ? '' : window.location.search;
  const params = useMemo(() => new URLSearchParams(searchString), [location, searchString]);
  const [category, setCategory] = useState(normalizeCategory(params.get('category')));
  const [audience, setAudience] = useState(normalizeAudience(params.get('audience')));
  const [saleOnly, setSaleOnly] = useState(params.get('sale') === 'true');
  const [sort, setSort] = useState<typeof sortOptions[number]>(params.get('sort') === 'new' || params.get('sort') === 'newest' ? 'Newest' : params.get('sort') === 'popular' ? 'Best Selling' : params.get('sort') === 'trending' ? 'Trending' : 'Recommended');
  const [query, setQuery] = useState(params.get('search') ?? params.get('q') ?? '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => ({ ...filterDefaults }));
  const [draftFilters, setDraftFilters] = useState<FilterState>(() => ({ ...filterDefaults }));
  const [draftAudience, setDraftAudience] = useState('All');
  const [draftCategory, setDraftCategory] = useState('All');
  useEffect(() => {
    setCategory(normalizeCategory(params.get('category')));
    setAudience(normalizeAudience(params.get('audience')));
    setSaleOnly(params.get('sale') === 'true');
    setSort(params.get('sort') === 'new' || params.get('sort') === 'newest' ? 'Newest' : params.get('sort') === 'popular' ? 'Best Selling' : params.get('sort') === 'trending' ? 'Trending' : 'Recommended');
    setQuery(params.get('search') ?? params.get('q') ?? '');
    if (typeof window !== 'undefined') window.sessionStorage.setItem('averae-last-shop-url', `${window.location.pathname}${window.location.search}`);
  }, [params]);

  const options = useMemo(() => ({
    sizes: Array.from(new Set(products.flatMap(product => product.sizes))).sort(),
    colours: Array.from(new Set(products.flatMap(product => product.colors))).sort(),
    brands: Array.from(new Set(products.map(product => product.brand))).sort(),
    collections: Array.from(new Set(products.map(product => product.collection))).sort(),
  }), []);

  const shown = useMemo(() => {
    const normalizedCategory = category.toLowerCase() === 'clothing' ? 'ready to wear' : category.toLowerCase();
    let list = category === 'All' ? [...products] : products.filter(product => product.category.toLowerCase() === normalizedCategory || product.collection.toLowerCase() === normalizedCategory);
    list = list.filter(product => audience === 'All' || product.audiences.includes(audience as 'Women' | 'Men' | 'Kids' | 'Unisex'));
    list = list.filter(product => !saleOnly || Boolean(product.compareAt) || product.badge === 'Sale');
    list = list.filter(product => !query.trim() || `${product.name} ${product.brand} ${product.category} ${product.collection} ${product.color} ${product.badge ?? ''}`.toLowerCase().includes(query.toLowerCase()));
    if (filters.size !== 'All sizes') list = list.filter(product => product.sizes.includes(filters.size));
    if (filters.subcategory !== 'All subcategories') {
      const subcategory = filters.subcategory.toLowerCase();
      list = list.filter(product => product.category === 'Hair'
        ? product.name.toLowerCase().includes(subcategory.replace(' hair', ''))
        : filters.subcategory === 'Thrift Women'
          ? product.audiences.includes('Women')
          : filters.subcategory === 'Thrift Men'
            ? product.audiences.includes('Men')
            : filters.subcategory === 'Thrift Kids'
              ? product.audiences.includes('Kids')
              : product.category === 'Thrift Wear');
    }
    if (filters.length !== 'All lengths') list = list.filter(product => product.length === filters.length);
    if (filters.texture !== 'All textures') list = list.filter(product => product.texture === filters.texture);
    if (filters.style !== 'All styles') list = list.filter(product => product.style === filters.style);
    if (filters.condition !== 'All conditions') list = list.filter(product => product.condition === filters.condition);
    if (filters.colour !== 'All colours') list = list.filter(product => product.colors.includes(filters.colour));
    if (filters.price !== 'All prices') list = list.filter(product => filters.price === 'Under ₦75,000' ? product.price < 75000 : filters.price === '₦75,000–₦125,000' ? product.price >= 75000 && product.price <= 125000 : product.price > 125000);
    if (filters.brand !== 'All brands') list = list.filter(product => product.brand === filters.brand);
    if (filters.collection !== 'All collections') list = list.filter(product => product.collection === filters.collection);
    if (filters.availability !== 'All availability') list = list.filter(product => filters.availability === 'In stock' ? product.stock > 0 : filters.availability === 'Low stock' ? product.stock > 0 && product.stock <= 5 : product.stock === 0);
    if (filters.rating === '4 stars & up') list = list.filter(product => product.rating !== null && product.rating >= 4);
    if (filters.rating === 'Not yet rated') list = list.filter(product => product.rating === null);
    if (filters.trend !== 'All trend status') list = list.filter(product => trendStatus(product) === filters.trend);
    if (sort === 'Newest') list.sort((a, b) => b.id - a.id);
    if (sort === 'Trending') list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    if (sort === 'Best Selling') list.sort((a, b) => (b.badge === 'Best Seller' ? 2 : b.badge ? 1 : 0) - (a.badge === 'Best Seller' ? 2 : a.badge ? 1 : 0));
    if (sort === 'Price: Low to High') list.sort((a, b) => a.price - b.price);
    if (sort === 'Price: High to Low') list.sort((a, b) => b.price - a.price);
    return list;
  }, [audience, category, filters, query, saleOnly, sort]);

  const activeChips = [
    ...(audience !== 'All' ? [{ key: 'audience', label: audience }] : []),
    ...(category !== 'All' ? [{ key: 'category', label: category }] : []),
    ...Object.entries(filters).filter(([, value]) => !value.startsWith('All ')).map(([key, value]) => ({ key, label: value })),
    ...(saleOnly ? [{ key: 'sale', label: 'Sale' }] : []),
    ...(query ? [{ key: 'query', label: `“${query}”` }] : []),
  ];
  const activeFilterCount = [audience !== 'All', category !== 'All', saleOnly, ...Object.values(filters).map(value => !value.startsWith('All '))].filter(Boolean).length;
  const resetAppliedFilters = () => { setCategory('All'); setAudience('All'); setSaleOnly(false); setFilters({ ...filterDefaults }); };
  const clearAll = () => { resetAppliedFilters(); setDraftCategory('All'); setDraftAudience('All'); setDraftFilters({ ...filterDefaults }); setQuery(''); setSort('Recommended'); };
  const clearPanelFilters = () => { resetAppliedFilters(); setDraftCategory('All'); setDraftAudience('All'); setDraftFilters({ ...filterDefaults }); };
  const openFilters = () => { setDraftCategory(category); setDraftAudience(audience); setDraftFilters({ ...filters }); setFilterOpen(true); };
  const applyFilters = () => { setCategory(draftCategory); setAudience(draftAudience); setFilters({ ...draftFilters }); setFilterOpen(false); };
  const removeChip = (key: string) => { if (key === 'audience') setAudience('All'); else if (key === 'category') setCategory('All'); else if (key === 'sale') setSaleOnly(false); else if (key === 'query') setQuery(''); else if (key in filterDefaults) setFilters(current => ({ ...current, [key]: filterDefaults[key as FilterKey] })); };
  const setDraftFilter = (key: FilterKey, value: string) => setDraftFilters(current => ({ ...current, [key]: value }));
  const filterSelect = (key: FilterKey, label: string, values: string[]) => <label data-testid={`filter-${key}`} className="block text-[10px] uppercase tracking-[.14em] text-[#866F62]">{label}<select value={draftFilters[key]} onChange={event => setDraftFilter(key, event.target.value)} className={selectStyles}><option>{filterDefaults[key]}</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>;
  const selectedCategory = productCategories.find(item => item.label === category);
  const draftSelectedCategory = productCategories.find(item => item.label === draftCategory);
  const isHair = selectedCategory?.slug === 'hair';
  const isThrift = selectedCategory?.slug === 'thrift-wear';
  const isDraftHair = draftSelectedCategory?.slug === 'hair';
  const isDraftThrift = draftSelectedCategory?.slug === 'thrift-wear';

  return <div><SiteHeader /><main className="container py-12 md:py-16">
    <div className="flex flex-col justify-between gap-6 border-b border-[#D7C2A7] pb-8 md:flex-row md:items-end"><div><p className="eyebrow text-[#866F62]">Fashion discovery meets shopping</p><h1 className="mt-3 font-display text-5xl uppercase">{audience !== 'All' ? audience : category !== 'All' ? category : 'Discover Áveraẹ'}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#6f675d]">Explore fashion, accessories and lifestyle products curated for every expression.</p></div><p data-testid="product-count" className="text-xs text-[#866F62]">{shown.length} {shown.length === 1 ? 'product' : 'products'}</p></div>
    <div className="overflow-x-auto border-b border-[#D7C2A7] py-5"><div className="flex min-w-max gap-5 text-[10px] uppercase tracking-[.15em]"><button type="button" aria-pressed={category === 'All' && audience === 'All'} onClick={() => { setCategory('All'); setAudience('All'); }} className={category === 'All' && audience === 'All' ? 'border-b border-[#382820] pb-1 font-medium' : 'pb-1'}>All</button>{audienceCategories.map(item => <button type="button" key={item.slug} aria-pressed={audience === item.label} onClick={() => { setAudience(item.label); setCategory('All'); }} className={audience === item.label ? 'border-b border-[#382820] pb-1 font-medium' : 'pb-1'}>{item.label}</button>)}{productCategories.map(item => <button type="button" key={item.slug} aria-pressed={category === item.label} onClick={() => { setCategory(item.label); setAudience('All'); }} className={category === item.label ? 'border-b border-[#382820] pb-1 font-medium' : 'pb-1'}>{item.label}</button>)}</div></div>
    {audience !== 'All' && <div className="border-b border-[#D7C2A7] py-5"><div className="flex items-center gap-3 overflow-x-auto"><span className="eyebrow shrink-0 text-[#866F62]">{audience} edit</span>{(audienceSubcategories[audience] ?? []).map(subcategory => <Link key={subcategory.label} href={`/shop?audience=${audience.toLowerCase()}&category=${subcategory.category}`} className="shrink-0 border-b border-transparent pb-1 text-[10px] uppercase tracking-[.13em] hover:border-[#382820]">{subcategory.label}</Link>)}</div></div>}
    {selectedCategory?.subcategories && <div className="border-b border-[#D7C2A7] py-5"><div className="flex items-center gap-3 overflow-x-auto"><span className="eyebrow shrink-0 text-[#866F62]">{selectedCategory.label} edit</span>{categorySubcategories[selectedCategory.slug]?.map(subcategory => <Link key={subcategory} href={`/shop?category=${selectedCategory.slug}&search=${encodeURIComponent(subcategory.replace('Thrift ', ''))}`} className="shrink-0 border-b border-transparent pb-1 text-[10px] uppercase tracking-[.13em] hover:border-[#382820]">{subcategory}</Link>)}</div></div>}
    {isThrift && <div className="border-b border-[#D7C2A7] bg-[#F6F0E6] py-4 text-xs leading-6 text-[#6f675d]">Thrift Wear pieces may be one-of-a-kind or limited quantity. Availability is shown clearly on each product and may change quickly.</div>}
    <div className="flex items-center gap-3 border-b border-[#D7C2A7] py-5"><label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#D7C2A7] pb-1 text-[10px] uppercase tracking-[.15em]"><Search size={14} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products..." className="w-full bg-transparent text-xs outline-none placeholder:text-[#866F62]" aria-label="Search products" /></label><button data-testid="mobile-filter-trigger" type="button" className="pressable inline-flex shrink-0 items-center gap-2 border border-[#D7C2A7] px-3 py-3 text-[10px] uppercase tracking-[.15em] hover:border-[#382820]" onClick={openFilters}><SlidersHorizontal size={15} aria-hidden="true" /> FILTERS{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</button><label className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-[.15em]"><span className="hidden sm:inline">SORT BY:</span><select value={sort} onChange={event => setSort(event.target.value as typeof sortOptions[number])} className="max-w-[8.5rem] bg-transparent text-[10px] outline-none" aria-label="Sort products">{sortOptions.map(option => <option key={option}>{option}</option>)}</select></label></div>
    {activeChips.length > 0 && <div data-testid="active-filter-chips" className="flex flex-wrap items-center gap-2 border-b border-[#D7C2A7] py-4"><span className="eyebrow mr-2 text-[#866F62]">Applied</span>{activeChips.map(chip => <button type="button" key={chip.key} onClick={() => removeChip(chip.key)} className="inline-flex items-center gap-2 border border-[#B7654A] px-3 py-2 text-[10px] uppercase tracking-[.12em] text-[#382820]">{chip.label}<X size={12} /></button>)}<button data-testid="clear-all-filters" type="button" onClick={clearAll} className="ml-auto text-[10px] uppercase tracking-[.14em] underline underline-offset-4">CLEAR ALL</button></div>}
    {filterOpen && <div className="fixed inset-0 z-[80] bg-[#382820]/45 p-0 md:p-8" onClick={event => { if (event.target === event.currentTarget) setFilterOpen(false); }}><aside className="filter-panel ml-auto flex h-full w-full flex-col bg-[#FFFDF8] p-6 shadow-2xl md:h-auto md:max-h-[calc(100vh-4rem)] md:max-w-2xl" role="dialog" aria-modal="true" aria-label="Product filters"><div className="flex items-center justify-between border-b border-[#D7C2A7] pb-5"><div><p className="eyebrow text-[#866F62]">Refine the edit</p><h2 className="mt-2 font-display text-3xl">FILTERS</h2><p className="mt-2 text-xs text-[#866F62]">Choose what matters, then apply your edit.</p></div><button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)} className="focus-ring"><X size={20} /></button></div><div className="grid flex-1 gap-x-6 gap-y-6 overflow-y-auto py-6 sm:grid-cols-2"><label className="block text-[10px] uppercase tracking-[.14em] text-[#866F62]">Audience<select value={draftAudience} onChange={event => { setDraftAudience(event.target.value); setDraftCategory('All'); setDraftFilters(current => ({ ...current, subcategory: 'All subcategories' })); }} className={selectStyles}><option>All</option>{audienceCategories.map(item => <option key={item.slug}>{item.label}</option>)}</select></label><label className="block text-[10px] uppercase tracking-[.14em] text-[#866F62]">Category<select value={draftCategory} onChange={event => { setDraftCategory(event.target.value); setDraftAudience('All'); setDraftFilters(current => ({ ...current, subcategory: 'All subcategories', length: 'All lengths', texture: 'All textures', style: 'All styles', condition: 'All conditions' })); }} className={selectStyles}><option>All</option>{productCategories.map(item => <option key={item.slug}>{item.label}</option>)}</select></label>{(isDraftHair || isDraftThrift) && filterSelect('subcategory', isDraftHair ? 'Hair' : 'Thrift Wear', isDraftHair ? ['Human Hair', 'Blend Hair', 'Packet Hair'] : ['Thrift Women', 'Thrift Men', 'Thrift Kids', 'Vintage / Statement Pieces'])}{filterSelect('size', 'Size', options.sizes)}{isDraftHair && <>{filterSelect('length', 'Length', [...categoryFilterOptions.length])}{filterSelect('texture', 'Texture', [...categoryFilterOptions.texture])}{filterSelect('style', 'Style', [...categoryFilterOptions.style])}</>}{filterSelect('colour', 'Colour', options.colours)}{isDraftThrift && filterSelect('condition', 'Condition', [...categoryFilterOptions.condition])}{filterSelect('price', 'Price', ['Under ₦75,000', '₦75,000–₦125,000', 'Over ₦125,000'])}{filterSelect('brand', 'Brand', options.brands)}{filterSelect('collection', 'Collection', options.collections)}{filterSelect('availability', 'Availability', ['In stock', 'Low stock', 'Out of stock'])}{filterSelect('rating', 'Rating', ratingOptions)}{filterSelect('trend', 'Trend status', ['Trending', 'New', 'Popular', "Editor's Pick"])}</div><div className="grid grid-cols-2 gap-3 border-t border-[#D7C2A7] pt-5"><button data-testid="clear-panel-filters" type="button" onClick={clearPanelFilters} className="border border-[#382820] py-3 text-[10px] uppercase tracking-[.14em]">CLEAR ALL</button><button data-testid="apply-filters" type="button" onClick={applyFilters} className="action-link-light bg-[#382820] py-3 text-[10px] uppercase tracking-[.14em] text-[#FFFDF8]">APPLY FILTERS</button></div></aside></div>}
    {shown.length === 0 ? <NoResultsDiscovery query={query} onClear={clearAll} /> : <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{shown.map(product => <Card key={product.id} p={product} onQuickView={setQuickViewProduct} />)}</div>}
  </main><BackToTop /><QuickView product={quickViewProduct} open={quickViewProduct !== null} surface={query.trim() ? 'search_results' : 'shop'} onOpenChange={open => { if (!open) setQuickViewProduct(null); }} onAddToBag={(product, size, color) => addToCart(product.id, { size, color })} /></div>;
}
