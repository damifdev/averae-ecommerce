import SiteHeader from '@/components/SiteHeader';
import { WishlistPageContent } from '@/components/WishlistPanel';
import { getWishlist } from '@/lib/store';
import { products } from '@/lib/brand';
import { useEffect, useState } from 'react';

function readSharedWishlist(): number[] | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('share');
  if (!value) return null;
  return value.split(',').map(Number).filter(id => Number.isInteger(id) && products.some(product => product.id === id));
}

export default function Wishlist() {
  const [sharedIds] = useState<number[] | null>(() => readSharedWishlist());
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => sharedIds ?? getWishlist());

  useEffect(() => {
    if (sharedIds) return;
    const syncWishlist = () => setWishlistIds(getWishlist());
    window.addEventListener('averae-wishlist-updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('averae-wishlist-updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, [sharedIds]);

  return <div>
    <SiteHeader />
    <main className="container py-12 pb-28 md:py-20">
      <div className="border-b border-[#D7C2A7] pb-8">
        <p className="eyebrow text-[#866F62]">{sharedIds ? 'Shared wishlist' : 'Saved pieces'}</p>
        <h1 className="mt-3 font-display text-5xl">{sharedIds ? 'A considered selection' : 'Your wishlist'}</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f675d]">{sharedIds ? 'Explore pieces someone has saved from the Áveraẹ collection.' : 'Keep the pieces that speak to you close. Choose your options when you are ready to move them to your bag.'}</p>
      </div>
      <div className="mt-10">
        <WishlistPageContent wishlistIds={wishlistIds} onChangeWishlist={setWishlistIds} shared={Boolean(sharedIds)} />
      </div>
    </main>
  </div>;
}
