import { useEffect, useState } from 'react';

/**
 * Reports whether the shared footer is currently visible in the viewport.
 * The observer is reattached when route content mounts a new footer.
 */
export function useFooterVisibility() {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const viewport = window as Window & { IntersectionObserver?: typeof IntersectionObserver };
    const observerConstructor = viewport.IntersectionObserver;
    let footer: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;
    let fallbackHandler: (() => void) | null = null;

    const updateFallbackVisibility = () => {
      if (!footer) {
        setFooterVisible(false);
        return;
      }

      const bounds = footer.getBoundingClientRect();
      setFooterVisible(bounds.top < viewport.innerHeight && bounds.bottom > 0);
    };

    const observeFooter = () => {
      const nextFooter = document.querySelector<HTMLElement>('footer');
      if (nextFooter === footer) return;

      observer?.disconnect();
      if (fallbackHandler) {
        viewport.removeEventListener('scroll', fallbackHandler);
        viewport.removeEventListener('resize', fallbackHandler);
        fallbackHandler = null;
      }

      footer = nextFooter;
      if (!footer) {
        setFooterVisible(false);
        return;
      }

      if (observerConstructor) {
        observer = new observerConstructor(
          ([entry]) => setFooterVisible(entry?.isIntersecting ?? false),
          { threshold: 0.01 },
        );
        observer.observe(footer);
        return;
      }

      const onFallbackVisibility = updateFallbackVisibility;
      fallbackHandler = onFallbackVisibility;
      onFallbackVisibility();
      viewport.addEventListener('scroll', onFallbackVisibility, { passive: true });
      viewport.addEventListener('resize', onFallbackVisibility);
    };

    observeFooter();
    const mutations = new MutationObserver(observeFooter);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      if (fallbackHandler) {
        viewport.removeEventListener('scroll', fallbackHandler);
        viewport.removeEventListener('resize', fallbackHandler);
      }
    };
  }, []);

  return footerVisible;
}
