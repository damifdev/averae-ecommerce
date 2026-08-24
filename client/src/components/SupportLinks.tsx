import { Link } from 'wouter';

type SupportLinksProps = {
  className?: string;
  includeContact?: boolean;
  includeFaq?: boolean;
  includeSizeGuide?: boolean;
  label?: string;
  newTab?: boolean;
};

const linkClass = 'text-[10px] uppercase tracking-[.13em] underline underline-offset-4 transition hover:text-[#B7654A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#382820]';

export default function SupportLinks({ className = '', includeContact = false, includeFaq = false, includeSizeGuide = false, label = 'Need help?', newTab = false }: SupportLinksProps) {
  const externalProps = newTab ? { target: '_blank', rel: 'noreferrer' } : {};
  return <nav aria-label="Customer support" className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${className}`}>
    <span className="text-[10px] uppercase tracking-[.13em] text-[#866F62]">{label}</span>
    <Link href="/delivery" className={linkClass} {...externalProps}>Delivery Information</Link>
    <Link href="/returns" className={linkClass} {...externalProps}>Returns &amp; Refunds</Link>
    {includeSizeGuide && <Link href="/size-guide" className={linkClass} {...externalProps}>Size Guide</Link>}
    {includeFaq && <Link href="/faq" className={linkClass} {...externalProps}>FAQs</Link>}
    {includeContact && <Link href="/contact" className={linkClass} {...externalProps}>Contact Support</Link>}
  </nav>;
}

export { linkClass as supportLinkClass };

export type { SupportLinksProps };

// Keep this component intentionally text-led: support links should remain discoverable without competing with checkout actions.
