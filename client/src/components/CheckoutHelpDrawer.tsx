import { useMemo, useState } from 'react';
import { ArrowRight, HelpCircle, Search, X } from 'lucide-react';
import { Link } from 'wouter';
import { trackEngagement } from '@/lib/analytics';
import { useFooterVisibility } from '@/hooks/useFooterVisibility';

export type CheckoutHelpDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSupportInteraction?: (label: string) => void;
};

type HelpQuestion = { question: string; answer: string };

const checkoutQuestions: HelpQuestion[] = [
  { question: 'How long does delivery take?', answer: 'Standard delivery is usually 3–5 working days after order processing. See Delivery Information for the latest estimates by location.' },
  { question: 'How much does delivery cost?', answer: 'Delivery fees depend on the destination and method selected. Orders above the current free-delivery threshold may qualify for free standard delivery.' },
  { question: 'Can I change or cancel my order?', answer: 'Contact us as soon as possible with your order number. We will check whether the order can still be changed or cancelled before dispatch.' },
  { question: 'What payment methods are available?', answer: 'Available payment methods are shown securely during checkout and may vary by delivery location.' },
  { question: 'How do I choose my size?', answer: 'Use the size guide on the product page and review the product description for fit notes. Contact us if you need help comparing measurements.' },
  { question: 'What is your return policy?', answer: 'Eligible items can generally be requested for return within 14 days of receipt, subject to the item being unused, in original condition and with required tags attached.' },
];

export function CheckoutHelpDrawer({ open, onClose, onSupportInteraction }: CheckoutHelpDrawerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => checkoutQuestions.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(normalizedQuery)), [normalizedQuery]);

  if (!open) return null;
  const followSupportLink = (label: string) => {
    onSupportInteraction?.(label);
    trackEngagement('support_link_select', { source: 'checkout_help_drawer', label });
    onClose();
  };

  return <div className="fixed inset-0 z-[80]" role="presentation">
    <button type="button" aria-label="Close checkout help" onClick={onClose} className="absolute inset-0 bg-[#382820]/25" />
    <aside role="dialog" aria-modal="true" aria-labelledby="checkout-help-title" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#D7C2A7] bg-[#FFFDF8] text-[#382820] shadow-2xl">
      <div className="flex items-start justify-between border-b border-[#D7C2A7] px-5 py-5 md:px-7"><div><p className="eyebrow text-[#B7654A]">Checkout support</p><h2 id="checkout-help-title" className="mt-2 font-display text-3xl">How can we help?</h2></div><button type="button" aria-label="Close checkout help" onClick={onClose} className="focus-ring rounded-full p-2 hover:bg-[#F6F0E6]"><X size={19} strokeWidth={1.3} /></button></div>
      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7"><label className="relative block"><span className="sr-only">Search checkout questions</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#866F62]" aria-hidden="true" /><input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions..." className="focus-ring w-full border border-[#D7C2A7] bg-[#F6F0E6] py-3 pl-10 pr-3 text-sm outline-none placeholder:text-[#866F62]" /></label><p className="mt-4 text-xs text-[#866F62]" aria-live="polite">{results.length} {results.length === 1 ? 'answer' : 'answers'} found</p><div className="mt-3 divide-y divide-[#D7C2A7] border-y border-[#D7C2A7]">{results.length ? results.map(item => <div key={item.question} className="py-4"><button type="button" aria-expanded={expanded === item.question} onClick={() => setExpanded(current => current === item.question ? null : item.question)} className="focus-ring flex w-full items-center justify-between gap-4 text-left text-sm font-medium"><span>{item.question}</span><span className="font-display text-xl" aria-hidden="true">{expanded === item.question ? '−' : '+'}</span></button>{expanded === item.question && <p className="pt-3 text-sm leading-6 text-[#866F62]">{item.answer}</p>}</div>) : <div className="py-6"><p className="font-display text-2xl">No matching answers</p><p className="mt-2 text-sm leading-6 text-[#866F62]">Try another search or speak with our support team.</p></div>}</div></div>
      <div className="border-t border-[#D7C2A7] bg-[#F6F0E6] px-5 py-5 md:px-7"><p className="text-xs leading-5 text-[#866F62]">Need more detail? These links open safely without clearing your checkout.</p><div className="mt-4 grid gap-3"><Link href="/delivery" target="_blank" rel="noreferrer" onClick={() => followSupportLink('delivery')} className="focus-ring flex items-center justify-between border-b border-[#D7C2A7] pb-3 text-[10px] uppercase tracking-[.13em]">Delivery Information <ArrowRight size={14} /></Link><Link href="/returns" target="_blank" rel="noreferrer" onClick={() => followSupportLink('returns')} className="focus-ring flex items-center justify-between border-b border-[#D7C2A7] pb-3 text-[10px] uppercase tracking-[.13em]">Returns &amp; Refunds <ArrowRight size={14} /></Link><Link href="/faq" target="_blank" rel="noreferrer" onClick={() => followSupportLink('faq')} className="focus-ring flex items-center justify-between border-b border-[#D7C2A7] pb-3 text-[10px] uppercase tracking-[.13em]">FAQs <ArrowRight size={14} /></Link><Link href="/contact" target="_blank" rel="noreferrer" onClick={() => followSupportLink('contact')} className="focus-ring flex items-center justify-between text-[10px] uppercase tracking-[.13em]">Contact Support <ArrowRight size={14} /></Link></div></div>
    </aside>
  </div>;
}

export function FloatingFAQHelp() {
  const [open, setOpen] = useState(false);
  const footerVisible = useFooterVisibility();
  const show = () => { setOpen(true); trackEngagement('help_widget_open', { source: 'floating_faq' }); };
  if (footerVisible && !open) return null;

  return <div className="fixed bottom-5 right-5 z-[55]">{open ? <div className="w-[min(20rem,calc(100vw-2.5rem))] border border-[#D7C2A7] bg-[#FFFDF8] p-5 text-[#382820] shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[#B7654A]">Quick help</p><h2 className="mt-1 font-display text-2xl">Questions?</h2></div><button type="button" aria-label="Close quick help" onClick={() => setOpen(false)} className="focus-ring rounded-full p-1"><X size={16} /></button></div><p className="mt-3 text-sm leading-6 text-[#866F62]">Find quick answers or browse the full FAQ.</p><div className="mt-4 flex items-center gap-4"><Link href="/faq" onClick={() => setOpen(false)} className="action-link-light bg-[#382820] px-4 py-3 text-[10px] uppercase tracking-[.14em] text-[#FFFDF8]">VIEW FAQs</Link><button type="button" onClick={() => setOpen(false)} className="text-[10px] uppercase tracking-[.14em] underline">Close</button></div></div> : <button type="button" aria-label="Open FAQ help" aria-describedby="floating-help-tooltip" data-testid="floating-help-trigger" data-footer-aware="true" onClick={show} className="floating-help-control floating-control-enter focus-ring group relative flex items-center gap-2 border border-[#382820] bg-[#FFFDF8] px-4 py-3 text-[10px] uppercase tracking-[.14em] text-[#382820] shadow-lg transition hover:bg-[#382820] hover:text-[#FFFDF8]"><HelpCircle size={16} strokeWidth={1.3} /><span>Help</span><span id="floating-help-tooltip" role="tooltip" className="floating-help-tooltip">Need Help?</span></button>}</div>;
}

export default CheckoutHelpDrawer;

// Keep FAQ assistance lightweight: the widget links to the full FAQ while checkout receives the searchable drawer.
