import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFooterVisibility } from '@/hooks/useFooterVisibility';

type BackToTopProps = {
  threshold?: number;
};

export default function BackToTop({ threshold = 320 }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const footerVisible = useFooterVisibility();
  const shouldShow = visible && !footerVisible;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const returnToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return <button
    type="button"
    data-testid="back-to-top"
    data-footer-aware="true"
    aria-label="Back to top"
    aria-hidden={!shouldShow}
    tabIndex={shouldShow ? 0 : -1}
    onClick={returnToTop}
    className={`back-to-top-button focus-ring fixed bottom-24 right-5 z-40 inline-flex h-11 w-11 items-center justify-center bg-[#382820] text-[#FFFDF8] shadow-[0_12px_28px_rgba(56,40,32,.18)] md:bottom-24 ${shouldShow ? 'back-to-top-button-visible floating-control-enter pointer-events-auto' : 'pointer-events-none'}`}
  >
    <ArrowUp size={17} strokeWidth={1.4} />
    <span className="sr-only">Back to top</span>
  </button>;
}
