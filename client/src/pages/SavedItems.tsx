import { useEffect, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { WishlistPageContent } from '@/components/WishlistPanel';
import { getWishlist } from '@/lib/store';

function SavedItems() {
  const [savedIds, setSavedIds] = useState<number[]>(() => getWishlist());

  useEffect(() => {
    const sync = () => setSavedIds(getWishlist());
    window.addEventListener('averae-wishlist-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('averae-wishlist-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return <div>
    <SiteHeader />
    <main className="container py-12 pb-28 md:py-20">
      <div className="flex flex-col justify-between gap-5 border-b border-[#D7C2A7] pb-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-[#866F62]">Saved for later</p>
          <h1 className="mt-3 font-display text-5xl">Saved Items</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f675d]">Keep considered pieces close and move them back to your bag whenever you are ready.</p>
        </div>
        <p className="text-xs text-[#866F62]">{savedIds.length} {savedIds.length === 1 ? 'item' : 'items'}</p>
      </div>
      <div className="mt-10">
        <WishlistPageContent wishlistIds={savedIds} onChangeWishlist={setSavedIds} />
      </div>
    </main>
    <BackToTop />
  </div>;
}

export default SavedItems;
