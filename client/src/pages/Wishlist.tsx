import SiteHeader from '@/components/SiteHeader';
import { WishlistPageContent } from '@/components/WishlistPanel';
import { getWishlist } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function Wishlist() {
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => getWishlist());

  useEffect(() => {
    const syncWishlist = () => setWishlistIds(getWishlist());
    window.addEventListener('averae-wishlist-updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('averae-wishlist-updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, []);

  return <div>
    <SiteHeader />
    <main className="container py-12 pb-28 md:py-20">
      <div className="border-b border-[#D7C2A7] pb-8">
        <p className="eyebrow text-[#866F62]">Saved pieces</p>
        <h1 className="mt-3 font-display text-5xl">Your wishlist</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f675d]">Keep the pieces that speak to you close. Choose your options when you are ready to move them to your bag.</p>
      </div>
      <div className="mt-10">
        <WishlistPageContent wishlistIds={wishlistIds} onChangeWishlist={setWishlistIds} />
      </div>
    </main>
  </div>;
}
