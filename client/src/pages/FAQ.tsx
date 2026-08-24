import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Search, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { trackEngagement } from '@/lib/analytics';

type FAQItem = { question: string; answer: string };
type FAQGroup = { title: string; items: FAQItem[] };
type Helpfulness = 'up' | 'down';

const faqGroups: FAQGroup[] = [
  { title: 'Orders', items: [
    { question: 'How do I place an order?', answer: 'Browse the shop, select a product and any required options, then choose Add to Bag. When you are ready, open your Bag and select Checkout to complete your order.' },
    { question: 'Can I change or cancel my order?', answer: 'Contact us as soon as possible with your order number. We will check whether the order can still be changed or cancelled before dispatch.' },
    { question: 'How can I view my order?', answer: 'Sign in and open My Account, then choose Orders to view your order details, delivery information and available return actions.' },
    { question: 'Can I reorder an item?', answer: 'Open a previous order from My Account and select the product you would like to purchase again. Availability and pricing may have changed.' },
  ] },
  { title: 'Payment', items: [
    { question: 'What payment methods are available?', answer: 'Available payment methods are shown securely during checkout and may vary by delivery location.' },
    { question: 'Is my payment secure?', answer: 'Payments are handled through secure checkout infrastructure. Áveraẹ does not store full card details in your account.' },
    { question: 'What happens if payment fails?', answer: 'Your order is not confirmed until payment succeeds. Check your payment details or try another available method, then contact us if the issue continues.' },
  ] },
  { title: 'Delivery', items: [
    { question: 'How long does delivery take?', answer: 'Standard delivery is usually 3–5 working days after order processing. See Delivery Information for the latest estimates by location.' },
    { question: 'How much does delivery cost?', answer: 'Delivery fees depend on the destination and method selected. Orders above the current free-delivery threshold may qualify for free standard delivery.' },
    { question: 'Do you deliver to my location?', answer: 'We currently serve selected locations in Nigeria. Enter your delivery details at checkout or contact us if you need help confirming your area.' },
    { question: 'How do I track my order?', answer: 'Tracking information is shared when your order is dispatched. You can also sign in to My Account to view available delivery updates.' },
  ] },
  { title: 'Returns & Refunds', items: [
    { question: 'What is your return policy?', answer: 'Eligible items can generally be requested for return within 14 days of receipt, subject to the item being unused, in original condition and with required tags attached.' },
    { question: 'How do I return an item?', answer: 'Sign in, open My Orders, select the relevant order and choose Request Return. If automated returns are not available for your order, contact support.' },
    { question: 'How long do refunds take?', answer: 'Refunds are initiated after an approved return is received and checked. Your bank or payment provider may need additional processing time.' },
    { question: 'Can I exchange an item?', answer: 'Exchange availability depends on the product and replacement stock. Contact us with your order number so the team can guide you.' },
  ] },
  { title: 'Products & Sizing', items: [
    { question: 'How do I choose my size?', answer: 'Use the size guide on the product page and review the product description for fit notes. Contact us if you need help comparing measurements.' },
    { question: 'Is a product available in another size?', answer: 'Available sizes are shown on the product page. Unavailable options are clearly marked; contact us if you would like help finding a similar piece.' },
    { question: 'How do I care for my items?', answer: 'Care instructions are listed in the Product Details section where available. Follow the garment label first and contact us if care guidance is missing.' },
  ] },
  { title: 'Account', items: [
    { question: 'How do I create an account?', answer: 'Select Sign in / Create account in the header or on the Account page, then follow the secure sign-in flow.' },
    { question: 'I forgot my password. What do I do?', answer: 'Use the account sign-in recovery option. If you still cannot access your account, contact support and we will help.' },
    { question: 'How do I update my information?', answer: 'Sign in and open My Account. You can manage saved addresses, payment references and preferences from the account dashboard.' },
  ] },
];

function questionId(group: string, question: string) {
  return `faq-${group}-${question}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function copyQuestionLink(id: string) {
  const url = `${window.location.origin}/faq#${id}`;
  try { await navigator.clipboard.writeText(url); } catch { window.prompt('Copy this FAQ link', url); }
}

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Helpfulness>>({});
  const [improvementNotes, setImprovementNotes] = useState<Record<string, string>>({});
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = useMemo(() => faqGroups.map(group => ({ ...group, items: group.items.filter(item => `${item.question} ${item.answer} ${group.title}`.toLowerCase().includes(normalizedQuery)) })).filter(group => group.items.length > 0), [normalizedQuery]);
  const resultCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    setOpenIds([id]);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }, []);

  const shareQuestion = async (id: string) => {
    await copyQuestionLink(id);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(current => current === id ? null : current), 1800);
    trackEngagement('faq_question_share', { question_id: id });
  };

  const chooseFeedback = (id: string, value: Helpfulness) => {
    setFeedback(current => ({ ...current, [id]: value }));
    trackEngagement('faq_helpfulness', { question_id: id, value });
    toast.success('Thank you for your feedback', { duration: 2200 });
  };

  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main>
    <section className="border-b border-[#D7C2A7] bg-[#FFFDF8]"><div className="container py-14 md:py-20"><nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[.14em] text-[#866F62]"><Link href="/" className="transition hover:text-[#B7654A]">Home</Link><span className="mx-2">/</span><span aria-current="page">FAQs</span></nav><div className="mt-10 max-w-2xl"><p className="eyebrow text-[#B7654A]">Help, clearly considered</p><h1 className="mt-3 font-display text-5xl md:text-7xl">Frequently Asked Questions</h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#866F62]">Quick answers to the questions our customers ask most.</p></div><label className="relative mt-10 block max-w-2xl"><span className="sr-only">Search questions...</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#866F62]" aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} onFocus={() => trackEngagement('faq_search_focus', { source: 'faq' })} placeholder="Search questions..." className="focus-ring w-full border border-[#D7C2A7] bg-[#F6F0E6] py-4 pl-12 pr-4 text-sm outline-none placeholder:text-[#866F62]" type="search" /></label>{query && <p className="mt-3 text-xs text-[#866F62]" aria-live="polite">{resultCount} {resultCount === 1 ? 'answer' : 'answers'} found</p>}</div></section>
    <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_.32fr]"><div className="space-y-10">{filteredGroups.length > 0 ? filteredGroups.map(group => <section key={group.title} aria-labelledby={`faq-${group.title.replaceAll(' ', '-').toLowerCase()}`}><div className="flex items-end justify-between border-b border-[#D7C2A7] pb-4"><div><p className="eyebrow text-[#B7654A]">Customer questions</p><h2 id={`faq-${group.title.replaceAll(' ', '-').toLowerCase()}`} className="mt-2 font-display text-3xl">{group.title}</h2></div><span className="text-xs text-[#866F62]">{group.items.length}</span></div><div className="mt-3 divide-y divide-[#D7C2A7] border-b border-[#D7C2A7]">{group.items.map(item => { const id = questionId(group.title, item.question); const selected = feedback[id]; return <details key={item.question} id={id} open={openIds.includes(id)} className="group scroll-mt-8 py-5"><summary onClick={() => setOpenIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])} className="focus-ring flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-medium [&::-webkit-details-marker]:hidden"><span>{item.question}</span><span className="font-display text-2xl font-normal leading-none transition group-open:rotate-45" aria-hidden="true">+</span></summary><div className="max-w-2xl pr-2 pt-4"><p className="text-sm leading-7 text-[#866F62]">{item.answer}</p>{selected === 'down' && <div className="mt-5 max-w-xl border-l-2 border-[#B7654A] pl-4"><label htmlFor={`${id}-improvement`} className="text-xs font-medium text-[#382820]">How can we improve this answer? <span className="font-normal text-[#866F62]">Optional</span></label><textarea id={`${id}-improvement`} value={improvementNotes[id] ?? ''} onChange={event => setImprovementNotes(current => ({ ...current, [id]: event.target.value }))} maxLength={240} rows={3} placeholder="Tell us what was missing or unclear..." className="focus-ring mt-2 w-full resize-y border border-[#D7C2A7] bg-[#FFFDF8] px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#866F62]" /><p className="mt-1 text-right text-[10px] text-[#866F62]">{(improvementNotes[id] ?? '').length}/240</p></div>}<div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#E6D8C8] pt-4"><span className="text-[10px] uppercase tracking-[.12em] text-[#866F62]">Was this helpful?</span><button type="button" aria-label={`Yes, ${item.question} was helpful`} aria-pressed={selected === 'up'} onClick={() => chooseFeedback(id, 'up')} className={`focus-ring inline-flex items-center gap-1 border px-3 py-2 text-xs transition ${selected === 'up' ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7] hover:border-[#B7654A] hover:text-[#B7654A]'}`}><ThumbsUp size={13} aria-hidden="true" /> Yes</button><button type="button" aria-label={`No, ${item.question} was not helpful`} aria-pressed={selected === 'down'} onClick={() => chooseFeedback(id, 'down')} className={`focus-ring inline-flex items-center gap-1 border px-3 py-2 text-xs transition ${selected === 'down' ? 'border-[#382820] bg-[#382820] text-[#FFFDF8]' : 'border-[#D7C2A7] hover:border-[#B7654A] hover:text-[#B7654A]'}`}><ThumbsDown size={13} aria-hidden="true" /> No</button><button type="button" onClick={() => shareQuestion(id)} className="focus-ring ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-[#866F62] transition hover:text-[#B7654A]" aria-label={`Copy link to ${item.question}`}>{copiedId === id ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}{copiedId === id ? 'LINK COPIED' : 'SHARE ANSWER'}</button></div></div></details>; })}</div></section>) : <div className="border border-[#D7C2A7] bg-[#FFFDF8] p-7 md:p-10"><p className="eyebrow text-[#B7654A]">No matching questions</p><h2 className="mt-3 font-display text-3xl">Can&apos;t find what you&apos;re looking for?</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[#866F62]">Try another search, or contact our team and we&apos;ll help you find the right answer.</p><Link href="/contact" className="action-link-light mt-6 inline-flex items-center gap-2 bg-[#382820] px-5 py-4 text-[10px] uppercase tracking-[.15em] text-[#FFFDF8]">CONTACT US <ArrowRight size={14} /></Link></div>}</div>
      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start"><p className="eyebrow text-[#866F62]">Useful shortcuts</p><Link href="/delivery" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">DELIVERY INFORMATION <ArrowRight size={14} /></Link><Link href="/returns" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">RETURNS POLICY <ArrowRight size={14} /></Link><Link href="/size-guide" className="focus-ring flex items-center justify-between border border-[#D7C2A7] bg-[#FFFDF8]/60 p-4 text-[10px] uppercase tracking-[.13em] transition hover:border-[#B7654A] hover:text-[#B7654A]">SIZE GUIDE <ArrowRight size={14} /></Link><div className="mt-7 bg-[#382820] p-5 text-[#FFFDF8]"><p className="font-display text-2xl">Still need help?</p><p className="mt-2 text-sm leading-6 text-[#D7C2A7]">Our team is happy to help with orders, delivery, returns or product questions.</p><Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#FFFDF8] underline underline-offset-4">CONTACT US <ArrowRight size={14} /></Link></div></aside>
    </section>
  </main><BackToTop /></div>;
}
