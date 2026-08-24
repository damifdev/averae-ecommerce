import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { startLogin } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';
import { ChevronDown, ChevronRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { audienceCategories, brand, editorialEntries, formatPrice, productCategories, products, trendCollections } from '@/lib/brand';
import ClearBagDialog from '@/components/ClearBagDialog';
import { cartItemCount, CART_UPDATED_EVENT, clearCart, getCart, getLastAddedCartItem, getWishlist, removeFromCart, restoreCartItem, type CartItem } from '@/lib/store';
import WishlistPanel from '@/components/WishlistPanel';
import { trackEngagement, safeEventLabel } from '@/lib/analytics';

type MenuKey = 'shop' | 'women' | 'men' | 'kids' | 'jewelry' | 'shoes' | 'trends' | 'edit';
type DrawerKey = 'wishlist' | 'bag';
const menuLabels: Record<MenuKey, string> = { shop: 'Shop', women: 'Women', men: 'Men', kids: 'Kids', jewelry: 'Jewelry', shoes: 'Shoes', trends: 'Trends', edit: 'The Edit' };

const audienceLinks = audienceCategories.map(item => ({ label: item.label, href: `/shop?audience=${item.slug}` }));
const categoryLinks = productCategories.map(item => ({ label: item.label, href: `/shop?category=${item.slug}` }));
const discoveryLinks = [
  { label: 'New Arrivals', href: '/shop?sort=new' },
  { label: 'Trending Now', href: '/trends' },
  { label: 'Best Sellers', href: '/shop?sort=popular' },
  { label: 'The Áveraẹ Edit', href: '/edit' },
  { label: "Editor's Picks", href: '/edit' },
  { label: 'Sale', href: '/shop?sale=true' },
];
const popularSearches = ['Linen', 'Everyday essentials', 'African contemporary', 'New arrivals', 'Statement bags'];

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return <Link href={href} onClick={onClick} className="group/menu flex items-center justify-between border-b border-[#D7C2A7]/70 py-2 text-sm transition hover:pl-1 hover:text-[#B7654A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]">{children}<ChevronRight size={13} className="opacity-0 transition group-hover/menu:opacity-100" /></Link>;
}

function MenuColumn({ title, links, onClick }: { title: string; links: { label: string; href: string }[]; onClick?: () => void }) {
  return <div><p className="eyebrow text-[#866F62]">{title}</p><div className="mt-4 space-y-1">{links.map(link => <MenuLink key={link.label} href={link.href} onClick={onClick}>{link.label}</MenuLink>)}</div></div>;
}

function MobileSection({ title, links, onNavigate }: { title: string; links: { label: string; href: string }[]; onNavigate: () => void }) {
  return <details open className="border-b border-[#D7C2A7] py-4"><summary className="cursor-pointer list-none text-[10px] uppercase tracking-[.16em] text-[#866F62]">{title}</summary><div className="mt-3 space-y-1">{links.map(link => <MenuLink key={link.label} href={link.href} onClick={() => { trackEngagement('mobile_nav_click', { group: safeEventLabel(title), label: safeEventLabel(link.label) }); onNavigate(); }}>{link.label}</MenuLink>)}</div></details>;
}

export default function SiteHeader() {
  const [location, navigate] = useLocation();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [drawer, setDrawer] = useState<DrawerKey | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerCloseTimerRef = useRef<number | null>(null);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart());
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => getWishlist());
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(() => getLastAddedCartItem());
  const [clearBagDialogOpen, setClearBagDialogOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState<'wishlist' | 'bag' | null>(null);
  const [bagPreviewOpen, setBagPreviewOpen] = useState(false);
  const [wishlistPreviewOpen, setWishlistPreviewOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previousCountsRef = useRef({ wishlist: wishlistIds.length, bag: cartItemCount(cartItems) });
  const badgePulseTimerRef = useRef<number | null>(null);
  const previewTransitionTimerRef = useRef<number | null>(null);

  const clearPreviewTransitionTimer = () => {
    if (previewTransitionTimerRef.current !== null) window.clearTimeout(previewTransitionTimerRef.current);
    previewTransitionTimerRef.current = null;
  };
  const reducedPreviewMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const closePreview = () => {
    clearPreviewTransitionTimer();
    setPreviewVisible(false);
    if (reducedPreviewMotion()) {
      setBagPreviewOpen(false);
      setWishlistPreviewOpen(false);
      return;
    }
    previewTransitionTimerRef.current = window.setTimeout(() => {
      setBagPreviewOpen(false);
      setWishlistPreviewOpen(false);
      previewTransitionTimerRef.current = null;
    }, 180);
  };
  const openPreview = (key: 'wishlist' | 'bag') => {
    clearPreviewTransitionTimer();
    const alreadyOpen = key === 'wishlist' ? wishlistPreviewOpen : bagPreviewOpen;
    if (alreadyOpen) {
      setPreviewVisible(true);
      return;
    }
    const hasOpenPreview = wishlistPreviewOpen || bagPreviewOpen;
    setPreviewVisible(false);
    const switchPreview = () => {
      setWishlistPreviewOpen(key === 'wishlist');
      setBagPreviewOpen(key === 'bag');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setPreviewVisible(true));
      });
    };
    if (hasOpenPreview && !reducedPreviewMotion()) {
      previewTransitionTimerRef.current = window.setTimeout(() => {
        switchPreview();
        previewTransitionTimerRef.current = null;
      }, 140);
    } else {
      switchPreview();
    }
  };

  const showDrawer = (key: DrawerKey) => {
    if (drawerCloseTimerRef.current !== null) window.clearTimeout(drawerCloseTimerRef.current);
    closePreview();
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setDrawer(key);
    setDrawerVisible(false);
    window.requestAnimationFrame(() => setDrawerVisible(true));
  };
  const hideDrawer = () => {
    setDrawerVisible(false);
    if (drawerCloseTimerRef.current !== null) window.clearTimeout(drawerCloseTimerRef.current);
    drawerCloseTimerRef.current = window.setTimeout(() => {
      setDrawer(null);
      drawerCloseTimerRef.current = null;
    }, 420);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpenMenu(null); setMobileOpen(false); setSearchOpen(false); setAccountOpen(false); closePreview(); hideDrawer(); } };
    const syncStore = () => { const nextCart = getCart(); const nextWishlist = getWishlist(); setCartItems(nextCart); setWishlistIds(nextWishlist); setLastAddedItem(getLastAddedCartItem()); };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) { setOpenMenu(null); setAccountOpen(false); closePreview(); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('storage', syncStore); window.addEventListener(CART_UPDATED_EVENT, syncStore); window.addEventListener('averae-wishlist-updated', syncStore);
    document.addEventListener('pointerdown', onPointerDown);
    try { setRecentSearches(JSON.parse(localStorage.getItem('averae-recent-searches') || '[]')); } catch {}
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('storage', syncStore); window.removeEventListener(CART_UPDATED_EVENT, syncStore); window.removeEventListener('averae-wishlist-updated', syncStore); document.removeEventListener('pointerdown', onPointerDown); };
  }, []);

  useEffect(() => { setOpenMenu(null); setMobileOpen(false); setAccountOpen(false); clearPreviewTransitionTimer(); setPreviewVisible(false); setBagPreviewOpen(false); setWishlistPreviewOpen(false); hideDrawer(); }, [location]);
  useEffect(() => () => { if (drawerCloseTimerRef.current !== null) window.clearTimeout(drawerCloseTimerRef.current); if (badgePulseTimerRef.current !== null) window.clearTimeout(badgePulseTimerRef.current); clearPreviewTransitionTimer(); }, []);

  const cartLines = useMemo(() => cartItems.map(item => ({ item, product: products.find(product => product.id === item.id) })).filter(line => line.product) as { item: CartItem; product: typeof products[number] }[], [cartItems]);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0); const cartCount = cartItemCount(cartItems);
  const removeBagLine = (item: CartItem) => {
    setCartItems(removeFromCart(item.id, item.size, item.color));
    toast.success('Removed from your bag', {
      id: `removed-drawer-bag-${item.id}-${item.size || 'default'}-${item.color || 'default'}-${Date.now()}`,
      duration: 5000,
      position: 'bottom-center',
      action: {
        label: 'Undo',
        onClick: () => {
          setCartItems(restoreCartItem(item));
          toast.success('Item restored to your bag', { duration: 2500, position: 'bottom-center' });
        },
      },
    });
  };
  const clearBag = () => {
    setCartItems(clearCart());
    setClearBagDialogOpen(false);
    toast.success('Bag cleared', { description: 'All selections have been removed.', duration: 3500, position: 'bottom-center' });
  };
  const latestAddedProduct = useMemo(() => lastAddedItem ? products.find(product => product.id === lastAddedItem.id) : undefined, [lastAddedItem]);
  const latestWishlistProduct = useMemo(() => [...wishlistIds].reverse().map(id => products.find(product => product.id === id)).find(Boolean), [wishlistIds]);
  useEffect(() => {
    const nextCounts = { wishlist: wishlistIds.length, bag: cartCount };
    const previousCounts = previousCountsRef.current;
    const increased = nextCounts.wishlist > previousCounts.wishlist ? 'wishlist' : nextCounts.bag > previousCounts.bag ? 'bag' : null;
    if (increased) {
      setBadgePulse(increased);
      if (badgePulseTimerRef.current !== null) window.clearTimeout(badgePulseTimerRef.current);
      badgePulseTimerRef.current = window.setTimeout(() => { setBadgePulse(null); badgePulseTimerRef.current = null; }, 560);
    }
    previousCountsRef.current = nextCounts;
  }, [wishlistIds.length, cartCount]);
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    const categorySuggestions = [
      { label: 'Linen clothing', href: '/shop?search=linen', keywords: 'linen clothing ready to wear' },
      ...audienceCategories.map(item => ({ label: item.label, href: `/shop?audience=${item.slug}`, keywords: `${item.label} fashion ${item.description}` })),
      ...productCategories.map(item => ({ label: item.label, href: `/shop?category=${item.slug}`, keywords: `${item.label} ${item.description}` })),
    ];
    const matchingProducts = (term ? products.filter(product => `${product.name} ${product.brand} ${product.category} ${product.collection} ${product.color} ${product.badge ?? ''}`.toLowerCase().includes(term)) : products).slice(0, 3);
    const matchingCategories = categorySuggestions.filter(item => !term || item.keywords.toLowerCase().includes(term)).slice(0, 4);
    const matchingBrands = Array.from(new Set(products.map(product => product.brand))).map(label => ({ label, href: `/shop?search=${encodeURIComponent(label)}` })).filter(item => !term || item.label.toLowerCase().includes(term)).slice(0, 4);
    const matchingTrends = trendCollections.filter(item => !term || `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(term)).slice(0, 3);
    const matchingEdit = editorialEntries.filter(entry => !term || `${entry.title} ${entry.description}`.toLowerCase().includes(term)).slice(0, 2);
    return { matchingProducts, matchingCategories, matchingBrands, matchingTrends, matchingEdit };
  }, [query]);
  const isActive = (key: MenuKey) => {
    if (key === 'trends') return location.startsWith('/trends');
    if (key === 'edit') return location.startsWith('/edit');
    if (key === 'shop') return location === '/shop' || location.startsWith('/shop?');
    return location.includes(`audience=${key}`) || location.includes(`category=${key}`);
  };
  const closeAll = () => { setOpenMenu(null); setMobileOpen(false); setAccountOpen(false); hideDrawer(); };
  const clearRecentSearches = () => { setRecentSearches([]); localStorage.removeItem('averae-recent-searches'); };
  const submitSearch = (value = query) => { const term = value.trim(); if (!term) return; const next = [term, ...recentSearches.filter(item => item.toLowerCase() !== term.toLowerCase())].slice(0, 5); setRecentSearches(next); localStorage.setItem('averae-recent-searches', JSON.stringify(next)); setSearchOpen(false); navigate(`/shop?search=${encodeURIComponent(term)}`); };

  const menuLinks: Record<MenuKey, { label: string; href: string }[]> = {
    shop: [...audienceLinks, ...categoryLinks, ...discoveryLinks],
    women: [{ label: 'Clothing', href: '/shop?audience=women&category=clothing' }, { label: 'Dresses', href: '/shop?audience=women&search=dresses' }, { label: 'Tops', href: '/shop?audience=women&search=tops' }, { label: 'Trousers', href: '/shop?audience=women&search=trousers' }, { label: 'Outerwear', href: '/shop?audience=women&search=outerwear' }, { label: 'Shoes', href: '/shop?audience=women&category=shoes' }, { label: 'Bags', href: '/shop?audience=women&category=bags' }, { label: 'Jewelry', href: '/shop?audience=women&category=jewelry' }, { label: 'Accessories', href: '/shop?audience=women&category=accessories' }, { label: 'New Arrivals', href: '/shop?audience=women&sort=new' }, { label: 'Trending in Women', href: '/trends?audience=women' }, { label: 'VIEW ALL WOMEN', href: '/shop?audience=women' }],
    men: [{ label: 'Clothing', href: '/shop?audience=men&category=clothing' }, { label: 'Shirts', href: '/shop?audience=men&search=shirts' }, { label: 'Trousers', href: '/shop?audience=men&search=trousers' }, { label: 'Outerwear', href: '/shop?audience=men&search=outerwear' }, { label: 'Traditional / Contemporary African Wear', href: '/shop?audience=men&category=african-fashion' }, { label: 'Shoes', href: '/shop?audience=men&category=shoes' }, { label: 'Watches', href: '/shop?audience=men&category=watches' }, { label: 'Bags', href: '/shop?audience=men&category=bags' }, { label: 'Accessories', href: '/shop?audience=men&category=accessories' }, { label: 'New Arrivals', href: '/shop?audience=men&sort=new' }, { label: 'Trending in Men', href: '/trends?audience=men' }, { label: 'VIEW ALL MEN', href: '/shop?audience=men' }],
    kids: [{ label: 'Girls', href: '/shop?audience=kids&search=girls' }, { label: 'Boys', href: '/shop?audience=kids&search=boys' }, { label: 'Baby', href: '/shop?audience=kids&search=baby' }, { label: 'Clothing', href: '/shop?audience=kids&category=clothing' }, { label: 'Shoes', href: '/shop?audience=kids&category=shoes' }, { label: 'Accessories', href: '/shop?audience=kids&category=accessories' }, { label: 'New Arrivals', href: '/shop?audience=kids&sort=new' }, { label: 'Trending in Kids', href: '/trends?audience=kids' }, { label: 'VIEW ALL KIDS', href: '/shop?audience=kids' }],
    jewelry: [{ label: 'Necklaces', href: '/shop?category=jewelry&search=necklaces' }, { label: 'Bracelets', href: '/shop?category=jewelry&search=bracelets' }, { label: 'Rings', href: '/shop?category=jewelry&search=rings' }, { label: 'Earrings', href: '/shop?category=jewelry&search=earrings' }, { label: 'Watches', href: '/shop?category=watches' }, { label: 'New Jewelry', href: '/shop?category=jewelry&sort=new' }, { label: 'Trending Jewelry', href: '/trends?category=jewelry' }, { label: "Editor's Picks", href: '/edit' }],
    shoes: [{ label: 'Sneakers', href: '/shop?category=shoes&search=sneakers' }, { label: 'Heels', href: '/shop?category=shoes&search=heels' }, { label: 'Sandals', href: '/shop?category=shoes&search=sandals' }, { label: 'Boots', href: '/shop?category=shoes&search=boots' }, { label: 'Flats', href: '/shop?category=shoes&search=flats' }, { label: 'Loafers', href: '/shop?category=shoes&search=loafers' }, { label: 'New Arrivals', href: '/shop?category=shoes&sort=new' }, { label: 'Trending Shoes', href: '/trends?category=shoes' }, { label: 'Best Sellers', href: '/shop?category=shoes&sort=popular' }],
    trends: [{ label: 'Trending Now', href: '/trends' }, { label: 'Trending Products', href: '/trends#trending-products' }, { label: 'Trending Styles', href: '/trends#soft-structure' }, { label: 'Trending Colours', href: '/trends#quiet-neutrals' }, { label: 'Trending Accessories', href: '/trends#objects-of-ease' }, { label: 'African Fashion', href: '/trends#african-contemporary' }, { label: "Editor's Picks", href: '/trends#editors-picks' }, { label: 'EXPLORE ALL TRENDS', href: '/trends' }],
    edit: [{ label: 'Latest Stories', href: '/edit' }, { label: 'Style Guides', href: '/edit?category=style-guides' }, { label: 'Fashion Trends', href: '/edit?category=trends' }, { label: 'African Fashion', href: '/edit?category=african-fashion' }, { label: 'Culture', href: '/edit?category=culture' }, { label: 'Shopping Guides', href: '/edit?category=shopping-guides' }, { label: 'Inspiration', href: '/edit?category=inspiration' }, { label: 'EXPLORE THE EDIT', href: '/edit' }],
  };

  const renderMegaMenu = (key: MenuKey) => {
    if (key === 'shop') return <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr_220px]"><MenuColumn title="Shop by audience" links={audienceLinks} onClick={closeAll} /><MenuColumn title="Shop by category" links={categoryLinks} onClick={closeAll} /><MenuColumn title="Shop by discovery" links={discoveryLinks} onClick={closeAll} /><Link href="/edit" onClick={closeAll} className="group relative min-h-48 overflow-hidden bg-[#D7C2A7]"><img src={editorialEntries[0]?.image} alt="Featured editorial" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-[#382820]/45" /><div className="absolute inset-x-4 bottom-4 text-[#FFFDF8]"><p className="eyebrow">Featured</p><p className="mt-2 font-display text-2xl">The Edit</p><span className="mt-3 inline-flex text-[9px] uppercase tracking-[.15em]">Explore story <ChevronRight size={13} /></span></div></Link></div>;
    return <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr_220px]"><MenuColumn title={menuLabels[key]} links={menuLinks[key].slice(0, Math.ceil(menuLinks[key].length / 2))} onClick={closeAll} /><MenuColumn title="Discover" links={menuLinks[key].slice(Math.ceil(menuLinks[key].length / 2))} onClick={closeAll} /><div className="hidden lg:block lg:col-span-2"><Link href={key === 'trends' ? '/trends' : key === 'edit' ? '/edit' : `/shop?${key === 'jewelry' || key === 'shoes' ? `category=${key}` : `audience=${key}`}`} onClick={closeAll} className="group relative block h-full min-h-48 overflow-hidden bg-[#D7C2A7]"><img src={key === 'edit' ? editorialEntries[0]?.image : products.find(product => product.category.toLowerCase() === key)?.image || productCategories.find(category => category.slug === key)?.image} alt={`${menuLabels[key]} selection`} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#382820]/65 to-transparent" /><div className="absolute inset-x-6 bottom-5 text-[#FFFDF8]"><p className="eyebrow">Áveraẹ selection</p><p className="mt-2 font-display text-3xl">Explore {menuLabels[key]}</p><span className="mt-3 inline-flex text-[9px] uppercase tracking-[.15em]">View all <ChevronRight size={13} /></span></div></Link></div></div>;
  };

  const mobileNavClass = (href: string) => `flex flex-col items-center gap-1 py-1 text-[9px] uppercase tracking-[.12em] ${href === '/' ? location === '/' : location.startsWith(href) ? 'font-medium underline decoration-[1px] underline-offset-4' : ''}`;

  return <>
    <div className="bg-[#382820] px-5 py-2 text-center text-[10px] tracking-[.16em] text-[#FFFDF8]">{brand.announcement}</div>
    <header ref={headerRef} className={`relative z-50 border-b border-[#D7C2A7] bg-[#FFFDF8]/95 backdrop-blur transition-[box-shadow] duration-200 ${scrolled ? 'shadow-[0_8px_24px_rgba(56,40,32,.08)]' : ''}`}>
      <div className={`container flex items-center justify-between gap-4 transition-[height] duration-200 ${scrolled ? 'h-16' : 'h-20'}`}>
        <button type="button" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }} className="icon-action focus-ring lg:hidden"><Menu size={19} strokeWidth={1.3} /></button>
        <div className="flex-1"><Link href="/" aria-label="Áveraẹ home" className="font-display text-2xl tracking-[.16em]">{brand.name}</Link></div>
        <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex" aria-label="Main navigation">{(Object.keys(menuLabels) as MenuKey[]).map(key => <div key={key} className="relative"><button type="button" aria-expanded={openMenu === key} aria-haspopup="true" onClick={() => { setOpenMenu(openMenu === key ? null : key); setAccountOpen(false); }} className={`nav-link flex items-center gap-1 text-[10px] uppercase tracking-[.16em] ${isActive(key) ? 'nav-link-active font-medium' : ''}`}>{menuLabels[key]}{key !== 'shop' && <ChevronDown size={11} className="opacity-50" />}</button></div>)}</nav>
        <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
          <button type="button" aria-label="Search" onClick={() => { setSearchOpen(true); setMobileOpen(false); setAccountOpen(false); }} className="icon-action focus-ring group relative"><Search size={17} strokeWidth={1.3} /><span className="icon-tooltip">Search</span></button>
          <div className="relative hidden sm:block"><button type="button" aria-label="Account" aria-expanded={accountOpen} onClick={() => { setAccountOpen(!accountOpen); setOpenMenu(null); hideDrawer(); }} className="icon-action focus-ring group relative"><UserRound size={17} strokeWidth={1.3} /><span className="icon-tooltip">Account</span></button>{accountOpen && <div className="absolute right-0 top-10 z-50 w-48 border border-[#D7C2A7] bg-[#FFFDF8] p-4 shadow-lg"><p className="eyebrow text-[#866F62]">{user ? `Hello, ${user.name || 'there'}` : 'Your account'}</p><div className="mt-3 space-y-1"><MenuLink href="/account" onClick={() => setAccountOpen(false)}>My Account</MenuLink>{user ? <><MenuLink href="/account#orders" onClick={() => setAccountOpen(false)}>Orders</MenuLink><MenuLink href="/wishlist" onClick={() => setAccountOpen(false)}>Wishlist</MenuLink><MenuLink href="/account#addresses" onClick={() => setAccountOpen(false)}>Addresses</MenuLink><button type="button" onClick={() => { setAccountOpen(false); void logout(); }} className="flex w-full border-b border-[#D7C2A7]/70 py-2 text-left text-sm hover:text-[#B7654A]">Logout</button></> : <><button type="button" onClick={() => { setAccountOpen(false); startLogin(); }} className="flex w-full border-b border-[#D7C2A7]/70 py-2 text-left text-sm hover:text-[#B7654A]">Sign In</button><button type="button" onClick={() => { setAccountOpen(false); startLogin(); }} className="flex w-full border-b border-[#D7C2A7]/70 py-2 text-left text-sm hover:text-[#B7654A]">Create Account</button></>}</div></div>}</div>
          <div className="relative hidden sm:block" onMouseEnter={() => openPreview('wishlist')} onMouseLeave={closePreview}><button type="button" aria-label={`Wishlist${wishlistIds.length ? `, ${wishlistIds.length} saved` : ''}`} aria-haspopup="dialog" aria-expanded={wishlistPreviewOpen} aria-controls={wishlistPreviewOpen ? 'wishlist-latest-preview' : undefined} aria-describedby={wishlistPreviewOpen ? 'wishlist-latest-preview' : undefined} onFocus={() => openPreview('wishlist')} onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) closePreview(); }} onClick={() => showDrawer('wishlist')} className={`icon-action focus-ring group relative ${wishlistPreviewOpen ? 'preview-open' : ''}`}><Heart size={17} strokeWidth={1.3} /><span className="icon-tooltip">Wishlist</span>{wishlistIds.length > 0 && <span data-testid="wishlist-count-badge" aria-hidden="true" className={`header-count-badge absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B7654A] px-1 text-[8px] text-[#FFFDF8] ${badgePulse === 'wishlist' ? 'header-count-badge-bounce' : ''}`}>{wishlistIds.length}</span>}</button>{wishlistPreviewOpen && <div id="wishlist-latest-preview" data-testid="wishlist-latest-preview" role="dialog" aria-label="Wishlist preview" className={`wishlist-latest-preview preview-card ${previewVisible ? 'preview-card-visible' : 'preview-card-hidden'} absolute right-0 top-[calc(100%+14px)] z-[60] flex w-[min(16rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] gap-3 border border-[#D7C2A7] bg-[#FFFDF8] p-3 text-left shadow-[0_14px_30px_rgba(56,40,32,.14)]`}>{latestWishlistProduct ? <><img src={latestWishlistProduct.image} alt={`${latestWishlistProduct.name} thumbnail`} className="h-16 w-12 object-cover" /><div className="min-w-0"><p className="eyebrow text-[#866F62]">Recently saved</p><p className="mt-1 truncate text-sm">{latestWishlistProduct.name}</p><p className="mt-1 text-xs text-[#866F62]">{latestWishlistProduct.brand} · {latestWishlistProduct.collection}</p><p className="mt-2 text-sm">{formatPrice(latestWishlistProduct.price)}</p></div></> : <div className="py-2"><Heart className="text-[#D7C2A7]" size={22} strokeWidth={1} /><p className="mt-3 font-display text-xl">Keep discovering.</p><p className="mt-1 text-xs leading-5 text-[#866F62]">Save a piece you love and it will appear here.</p></div>}</div>}</div>
          <div className="relative" onMouseEnter={() => openPreview('bag')} onMouseLeave={closePreview}><button type="button" aria-label={`Bag${cartCount ? `, ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}`} aria-haspopup="dialog" aria-expanded={bagPreviewOpen} aria-controls={bagPreviewOpen ? 'bag-latest-preview' : undefined} aria-describedby={bagPreviewOpen ? 'bag-latest-preview' : undefined} onFocus={() => openPreview('bag')} onBlur={event => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) closePreview(); }} onClick={() => { showDrawer('bag'); setOpenMenu(null); }} className={`icon-action focus-ring group relative ${bagPreviewOpen ? 'preview-open' : ''}`}><ShoppingBag size={17} strokeWidth={1.3} /><span className="icon-tooltip">Bag</span>{cartCount > 0 && <span data-testid="bag-count-badge" aria-hidden="true" className={`header-count-badge absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B7654A] px-1 text-[8px] text-[#FFFDF8] ${badgePulse === 'bag' ? 'header-count-badge-bounce' : ''}`}>{cartCount}</span>}</button>{bagPreviewOpen && <div id="bag-latest-preview" data-testid="bag-latest-preview" role="dialog" aria-label="Shopping bag preview" className={`bag-latest-preview preview-card ${previewVisible ? 'preview-card-visible' : 'preview-card-hidden'} absolute right-0 top-[calc(100%+14px)] z-[60] flex w-[min(16rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] gap-3 border border-[#D7C2A7] bg-[#FFFDF8] p-3 text-left shadow-[0_14px_30px_rgba(56,40,32,.14)]`}>{latestAddedProduct && lastAddedItem ? <><img src={latestAddedProduct.image} alt={`${latestAddedProduct.name} thumbnail`} className="h-16 w-12 object-cover" /><div className="min-w-0 flex-1"><p className="eyebrow text-[#866F62]">Recently added</p><p className="mt-1 truncate text-sm">{latestAddedProduct.name}</p><p className="mt-1 text-xs text-[#866F62]">{lastAddedItem.color || latestAddedProduct.color}{lastAddedItem.size ? ` · ${lastAddedItem.size}` : ''} · Qty {lastAddedItem.quantity}</p><p className="mt-2 text-sm">{formatPrice(latestAddedProduct.price * lastAddedItem.quantity)}</p><Link href="/checkout" onClick={() => setBagPreviewOpen(false)} className="action-link-light mt-3 block bg-[#382820] py-2 text-center text-[9px] uppercase tracking-[.14em]">Checkout</Link></div></> : <div className="py-2"><ShoppingBag className="text-[#D7C2A7]" size={22} strokeWidth={1} /><p className="mt-3 font-display text-xl">Your bag is waiting.</p><p className="mt-1 text-xs leading-5 text-[#866F62]">Add a piece and it will appear here.</p></div>}</div>}</div>
        </div>
      </div>
      {openMenu && <div className="site-nav-panel absolute left-0 right-0 top-full hidden border-b border-[#D7C2A7] bg-[#FFFDF8] shadow-[0_16px_30px_rgba(56,40,32,.08)] lg:block"><div className="container py-8">{renderMegaMenu(openMenu)}</div></div>}
    </header>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-[#FFFDF8] pt-24 lg:hidden"><div className="mobile-drawer-panel container h-full overflow-y-auto pb-28"><div className="flex items-center justify-between border-b border-[#D7C2A7] pb-4"><p className="eyebrow text-[#866F62]">Menu</p><button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="focus-ring"><X size={18} /></button></div><MobileSection title="Shop" links={audienceLinks} onNavigate={closeAll} /><MobileSection title="Categories" links={categoryLinks} onNavigate={closeAll} /><MobileSection title="Discover" links={[...discoveryLinks, { label: 'African Fashion', href: '/trends#african-contemporary' }]} onNavigate={closeAll} /><div className="mt-6 grid grid-cols-2 gap-3"><Link href="/account" onClick={() => { trackEngagement('mobile_nav_click', { group: 'utility', label: 'account' }); closeAll(); }} className="border border-[#D7C2A7] p-4 text-[10px] uppercase tracking-[.14em]">Account</Link><Link href="/wishlist" onClick={() => { trackEngagement('mobile_nav_click', { group: 'utility', label: 'wishlist' }); closeAll(); }} className="border border-[#D7C2A7] p-4 text-[10px] uppercase tracking-[.14em]">Wishlist</Link></div></div></div>}
    {searchOpen && <div className="fixed inset-0 z-[70] bg-[#FFFDF8]/98 px-5 py-6 backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}><div className="container"><div className="flex items-center justify-between border-b border-[#D7C2A7] pb-5"><p className="font-display text-3xl">Search Áveraẹ</p><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="focus-ring"><X size={20} /></button></div><form onSubmit={event => { event.preventDefault(); submitSearch(); }} className="mt-8 flex items-center gap-3 border-b border-[#382820] pb-4"><Search size={19} strokeWidth={1.2} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, brands, trends, or stories..." className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-[#866F62]/70" aria-label="Search products, brands, trends, or stories" /></form>{!query.trim() && <div data-testid="search-zero-query" className="mt-8 grid gap-8 border-y border-[#D7C2A7] py-6 md:grid-cols-2"><div data-testid="search-recent-searches"><div className="flex items-center justify-between gap-4"><p className="eyebrow text-[#866F62]">Recent searches</p>{recentSearches.length > 0 && <button type="button" data-testid="clear-search-history" onClick={clearRecentSearches} className="text-[9px] uppercase tracking-[.14em] text-[#866F62] underline-offset-4 transition hover:text-[#B7654A] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]">Clear History</button>}</div>{recentSearches.length ? <div className="mt-3 flex flex-wrap gap-2">{recentSearches.map(term => <button key={term} type="button" onClick={() => { setQuery(term); submitSearch(term); }} className="border border-[#D7C2A7] px-3 py-2 text-xs transition hover:border-[#B7654A] hover:text-[#B7654A]">{term}</button>)}</div> : <p className="mt-3 max-w-xs text-sm leading-6 text-[#866F62]">Your latest searches will appear here for an easier return.</p>}</div><div data-testid="search-popular-searches"><p className="eyebrow text-[#866F62]">Popular searches</p><div className="mt-3 flex flex-wrap gap-2">{popularSearches.map(term => <button key={term} type="button" onClick={() => { setQuery(term); submitSearch(term); }} className="border border-[#D7C2A7] px-3 py-2 text-xs transition hover:border-[#B7654A] hover:text-[#B7654A]">{term}</button>)}</div></div></div>}<div className="mt-8 grid gap-8 md:grid-cols-5"><div data-testid="search-suggestions-products"><p className="eyebrow text-[#866F62]">Products</p><div className="mt-3 space-y-2">{suggestions.matchingProducts.map(product => <MenuLink key={product.id} href={`/product/${product.id}`} onClick={() => setSearchOpen(false)}><span className="flex min-w-0 items-center gap-3"><img src={product.image} alt="" className="h-10 w-8 shrink-0 object-cover" /><span className="truncate">{product.name}</span></span></MenuLink>)}{query && !suggestions.matchingProducts.length && <p className="text-sm text-[#866F62]">No product matches yet.</p>}</div></div><div data-testid="search-suggestions-categories"><p className="eyebrow text-[#866F62]">Categories</p><div className="mt-3 space-y-2">{suggestions.matchingCategories.map(item => <MenuLink key={item.href} href={item.href} onClick={() => setSearchOpen(false)}>{item.label}</MenuLink>)}{query && !suggestions.matchingCategories.length && <p className="text-sm text-[#866F62]">No category matches yet.</p>}</div></div><div data-testid="search-suggestions-brands"><p className="eyebrow text-[#866F62]">Brands</p><div className="mt-3 space-y-2">{suggestions.matchingBrands.map(item => <MenuLink key={item.label} href={item.href} onClick={() => setSearchOpen(false)}>{item.label}</MenuLink>)}{query && !suggestions.matchingBrands.length && <p className="text-sm text-[#866F62]">No brand matches yet.</p>}</div></div><div data-testid="search-suggestions-trending"><p className="eyebrow text-[#866F62]">Trending</p><div className="mt-3 space-y-2">{suggestions.matchingTrends.map(item => <MenuLink key={item.slug} href={`/trends#${item.slug}`} onClick={() => setSearchOpen(false)}>{query ? `${item.title} is trending` : item.title}</MenuLink>)}{query && !suggestions.matchingTrends.length && <p className="text-sm text-[#866F62]">No trend matches yet.</p>}</div></div><div data-testid="search-suggestions-edit"><p className="eyebrow text-[#866F62]">The Edit</p><div className="mt-3 space-y-2">{suggestions.matchingEdit.map(entry => <MenuLink key={entry.slug} href={`/edit/${entry.slug}`} onClick={() => setSearchOpen(false)}>{entry.title}</MenuLink>)}{!suggestions.matchingEdit.length && <MenuLink href="/edit" onClick={() => setSearchOpen(false)}>Explore The Edit</MenuLink>}</div></div></div>{recentSearches.length > 0 && <div className="mt-10 border-t border-[#D7C2A7] pt-5"><p className="eyebrow text-[#866F62]">Recent searches</p><div className="mt-3 flex flex-wrap gap-2">{recentSearches.map(term => <button key={term} type="button" onClick={() => { setQuery(term); submitSearch(term); }} className="border border-[#D7C2A7] px-3 py-2 text-xs transition hover:border-[#B7654A] hover:text-[#B7654A]">{term}</button>)}</div></div>}</div></div>}
    {drawer === 'wishlist' && <WishlistPanel products={products} wishlistIds={wishlistIds} onChangeWishlist={setWishlistIds} onClose={hideDrawer} visible={drawerVisible} />}
    {drawer === 'bag' && <div className={`drawer-backdrop z-[65] ${drawerVisible ? 'drawer-backdrop-open' : ''}`} role="presentation" onClick={() => hideDrawer()}><aside role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={event => event.stopPropagation()} className={`drawer-panel drawer-panel-right flex h-full w-full max-w-md flex-col bg-[#FFFDF8] p-6 shadow-2xl sm:p-8 ${drawerVisible ? 'drawer-panel-open' : ''}`}><div className="flex items-start justify-between gap-4 border-b border-[#D7C2A7] pb-5"><div><p className="eyebrow text-[#866F62]">Your bag</p><h2 className="mt-2 font-display text-3xl">{cartLines.length ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Your bag is empty'}</h2></div><div className="flex items-center gap-4">{cartLines.length > 0 && <button type="button" data-testid="clear-bag-drawer" onClick={() => setClearBagDialogOpen(true)} className="pressable text-[9px] uppercase tracking-[.14em] text-[#866F62] underline-offset-4 transition hover:text-[#B7654A] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]">Clear bag</button>}<button type="button" aria-label="Close bag" onClick={() => hideDrawer()} className="focus-ring"><X size={20} /></button></div></div><div className="flex-1 overflow-y-auto py-5">{cartLines.length ? cartLines.map(({ item, product }) => <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 border-b border-[#D7C2A7] py-4"><img src={product.image} alt={product.name} className="h-24 w-20 object-cover" /><div className="min-w-0 flex-1"><Link href={`/product/${product.id}`} onClick={() => hideDrawer()} className="text-sm hover:underline">{product.name}</Link><p className="mt-2 text-xs text-[#866F62]">{item.color || product.color}{item.size ? ` · ${item.size}` : ''}</p><p className="mt-2 text-xs text-[#866F62]">Quantity · {item.quantity}</p><p className="mt-3 text-sm">{formatPrice(product.price * item.quantity)}</p><button type="button" data-testid={`remove-drawer-bag-item-${item.id}-${item.size || 'default'}-${item.color || 'default'}`} onClick={() => removeBagLine(item)} className="pressable mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#866F62] transition hover:text-[#B7654A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]"><X size={13} /> Remove</button></div></div>) : <div className="py-12 text-center"><ShoppingBag className="mx-auto text-[#D7C2A7]" size={32} strokeWidth={1} /><p className="mt-5 font-display text-2xl">Nothing here yet.</p><p className="mt-2 text-sm text-[#866F62]">Continue exploring to find your next piece.</p></div>}</div><div className="border-t border-[#D7C2A7] pt-5"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Link href="/shop" onClick={() => hideDrawer()} className="border border-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em]">Continue shopping</Link><Link href="/cart" onClick={() => hideDrawer()} className="action-link-light bg-[#382820] py-3 text-center text-[10px] uppercase tracking-[.14em]">View bag</Link></div><Link href="/checkout" onClick={() => hideDrawer()} className="mt-3 block border border-[#B7654A] py-3 text-center text-[10px] uppercase tracking-[.14em] text-[#B7654A]">Checkout</Link></div></aside></div>}
    <ClearBagDialog open={clearBagDialogOpen} onOpenChange={setClearBagDialogOpen} onConfirm={clearBag} />
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#D7C2A7] bg-[#FFFDF8]/95 py-2 backdrop-blur lg:hidden" aria-label="Mobile navigation"><Link href="/" aria-current={location === '/' ? 'page' : undefined} onClick={() => trackEngagement('mobile_nav_click', { group: 'bottom_nav', label: 'home' })} className={mobileNavClass('/')}><span>Home</span></Link><Link href="/shop" aria-current={location.startsWith('/shop') ? 'page' : undefined} onClick={() => trackEngagement('mobile_nav_click', { group: 'bottom_nav', label: 'shop' })} className={mobileNavClass('/shop')}><span>Shop</span></Link><Link href="/trends" aria-current={location.startsWith('/trends') ? 'page' : undefined} onClick={() => trackEngagement('mobile_nav_click', { group: 'bottom_nav', label: 'trends' })} className={mobileNavClass('/trends')}><span>Trends</span></Link><button type="button" aria-current={location.startsWith('/account') ? 'page' : undefined} onClick={() => { trackEngagement('mobile_nav_click', { group: 'bottom_nav', label: 'wishlist' }); showDrawer('wishlist'); }} className={`relative ${mobileNavClass('/account')}`}><span>Wishlist</span>{wishlistIds.length > 0 && <span className="absolute right-5 top-0 flex h-3 min-w-3 items-center justify-center rounded-full bg-[#B7654A] px-0.5 text-[7px] text-[#FFFDF8]">{wishlistIds.length}</span>}</button><button type="button" onClick={() => { trackEngagement('mobile_nav_click', { group: 'bottom_nav', label: 'bag' }); showDrawer('bag'); }} className={`relative ${mobileNavClass('/cart')}`}><span>Bag</span>{cartCount > 0 && <span className="absolute right-5 top-0 flex h-3 min-w-3 items-center justify-center rounded-full bg-[#B7654A] px-0.5 text-[7px] text-[#FFFDF8]">{cartCount}</span>}</button></nav>
  </>;
}
