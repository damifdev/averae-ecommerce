import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, Clock3, LoaderCircle, Mail, MapPin, Phone, Send, Check } from 'lucide-react';
import { Link } from 'wouter';
import SiteHeader from '@/components/SiteHeader';
import BackToTop from '@/components/BackToTop';
import { brand } from '@/lib/brand';
import { trackEngagement } from '@/lib/analytics';

type FormValues = {
  name: string;
  email: string;
  orderNumber: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = { name: '', email: '', orderNumber: '', subject: '', message: '' };
const contactReasons = ['Order Help', 'Delivery', 'Returns', 'Product Question', 'General Enquiry', 'Partnership'];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.subject.trim().length < 2) errors.subject = 'Please add a subject.';
  if (values.message.trim().length < 10) errors.message = 'Please share a little more detail (at least 10 characters).';
  return errors;
}

const inputClass = 'mt-2 w-full border border-[#D7C2A7] bg-transparent px-4 py-3 text-sm text-[#382820] outline-none transition placeholder:text-[#866F62]/70 focus:border-[#382820]';

export default function Contact() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues(current => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }));
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    trackEngagement('contact_form_submit', { subject: values.subject.trim().slice(0, 80) });
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setValues(initialValues);
    }, 550);
  };

  return <div className="min-h-screen bg-[#F6F0E6] text-[#382820]"><SiteHeader /><main>
    <section className="border-b border-[#D7C2A7] bg-[#FFFDF8]"><div className="container py-14 md:py-20"><nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[.14em] text-[#866F62]"><Link href="/" className="hover:text-[#B7654A]">Home</Link><span className="mx-2">/</span><span aria-current="page">Contact</span></nav><div className="mt-10 max-w-2xl"><p className="eyebrow text-[#B7654A]">We are here to help</p><h1 className="mt-3 font-display text-5xl md:text-7xl">Contact Áveraẹ</h1><p className="mt-5 max-w-xl text-sm leading-7 text-[#866F62]">Have a question, need help with an order, or simply want to talk to us? We're here to help.</p></div></div></section>
    <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-[.78fr_1.22fr]">
      <aside className="space-y-10">
        <div><p className="eyebrow text-[#B7654A]">Contact information</p><h2 className="mt-3 font-display text-3xl">A considered response</h2><p className="mt-4 max-w-sm text-sm leading-7 text-[#866F62]">Our team is ready to help with orders, product questions, delivery, and thoughtful recommendations.</p></div>
        <div className="space-y-5 border-y border-[#D7C2A7] py-6 text-sm">
          <a href={`mailto:${brand.contact.email}`} className="flex items-start gap-4 transition hover:text-[#B7654A]"><Mail size={18} strokeWidth={1.3} className="mt-0.5 text-[#B7654A]" /><span><strong className="block font-normal">Email</strong><span className="mt-1 block text-xs text-[#866F62]">{brand.contact.email}</span></span></a>
          <a href={`tel:${brand.contact.phone.replace(/\s/g, '')}`} className="flex items-start gap-4 transition hover:text-[#B7654A]"><Phone size={18} strokeWidth={1.3} className="mt-0.5 text-[#B7654A]" /><span><strong className="block font-normal">Phone</strong><span className="mt-1 block text-xs text-[#866F62]">{brand.contact.phone}</span></span></a>
          <div className="flex items-start gap-4"><Clock3 size={18} strokeWidth={1.3} className="mt-0.5 text-[#B7654A]" /><span><strong className="block font-normal">Business hours</strong><span className="mt-1 block text-xs leading-5 text-[#866F62]">Monday–Friday · 9:00–17:00<br />West Africa Time</span></span></div>
          <div className="flex items-start gap-4"><MapPin size={18} strokeWidth={1.3} className="mt-0.5 text-[#B7654A]" /><span><strong className="block font-normal">Studio</strong><span className="mt-1 block text-xs leading-5 text-[#866F62]">Lagos, Nigeria<br />Visits by appointment</span></span></div>
        </div>
        <div><p className="eyebrow text-[#866F62]">Contact reasons</p><div className="mt-4 flex flex-wrap gap-2">{contactReasons.map(reason => <button key={reason} type="button" onClick={() => { setValues(current => ({ ...current, subject: reason })); setErrors(current => ({ ...current, subject: undefined })); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="border border-[#D7C2A7] px-3 py-2 text-[10px] uppercase tracking-[.12em] transition hover:border-[#B7654A] hover:text-[#B7654A]">{reason}</button>)}</div></div>
        <div className="border border-[#D7C2A7] bg-[#FFFDF8]/55 p-5"><p className="font-display text-2xl">Looking for a quick answer?</p><p className="mt-2 text-sm leading-6 text-[#866F62]">Browse our most common delivery, returns, and order questions.</p><a href="#faqs" onClick={() => trackEngagement('contact_faq_click', { source: 'contact' })} className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] underline underline-offset-4">VIEW FAQs <ArrowRight size={14} /></a></div>
        <div className="bg-[#382820] p-5 text-[#FFFDF8]"><p className="font-display text-2xl">Already placed an order?</p><p className="mt-2 text-sm leading-6 text-[#D7C2A7]">Sign in to view your order history and delivery updates.</p><Link href="/account#orders" onClick={() => trackEngagement('contact_track_order_click', { source: 'contact' })} className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#FFFDF8] underline underline-offset-4">TRACK YOUR ORDER <ArrowRight size={14} /></Link></div>
      </aside>
      <section id="contact-form" className="scroll-mt-8 bg-[#FFFDF8] p-6 md:p-9" aria-labelledby="contact-form-heading"><div className="border-b border-[#D7C2A7] pb-5"><p className="eyebrow text-[#B7654A]">Send a message</p><h2 id="contact-form-heading" className="mt-3 font-display text-3xl md:text-4xl">How can we help?</h2></div>{submitted && <div role="status" className="mt-6 flex items-start gap-3 border border-[#B7654A]/40 bg-[#F6F0E6] p-4 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-[#B7654A]" /><p>Thank you. Your message has been received. Our team will get back to you shortly.</p></div>}<form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs text-[#866F62]">Full Name<input name="name" value={values.name} onChange={update('name')} className={inputClass} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />{errors.name && <span id="contact-name-error" className="mt-2 block text-[11px] text-[#B7654A]">{errors.name}</span>}</label><label className="block text-xs text-[#866F62]">Email Address<input name="email" type="email" value={values.email} onChange={update('email')} className={inputClass} autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />{errors.email && <span id="contact-email-error" className="mt-2 block text-[11px] text-[#B7654A]">{errors.email}</span>}</label></div><label className="block text-xs text-[#866F62]">Order Number <span className="text-[#866F62]/70">(optional)</span><input name="orderNumber" value={values.orderNumber} onChange={update('orderNumber')} className={inputClass} maxLength={40} placeholder="For example, AV-240826" /></label><label className="block text-xs text-[#866F62]">Subject<input name="subject" value={values.subject} onChange={update('subject')} className={inputClass} maxLength={100} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />{errors.subject && <span id="contact-subject-error" className="mt-2 block text-[11px] text-[#B7654A]">{errors.subject}</span>}</label><label className="block text-xs text-[#866F62]">Message<textarea name="message" value={values.message} onChange={update('message')} className={`${inputClass} min-h-36 resize-y`} maxLength={1200} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} /> <span className="mt-2 block text-[10px] text-[#866F62]">{values.message.length}/1200 characters</span>{errors.message && <span id="contact-message-error" className="mt-2 block text-[11px] text-[#B7654A]">{errors.message}</span>}</label><button type="submit" disabled={submitting} aria-busy={submitting} className="action-link-light pressable inline-flex items-center gap-2 bg-[#382820] px-6 py-4 text-[10px] uppercase tracking-[.16em] text-[#FFFDF8] disabled:cursor-wait disabled:opacity-70">{submitting ? <><LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> Sending…</> : <>SEND MESSAGE <Send size={14} /></>}</button></form></section>
    </section>
    <section id="faqs" className="scroll-mt-8 border-t border-[#D7C2A7] bg-[#FFFDF8] py-14 md:py-20"><div className="container"><div className="max-w-xl"><p className="eyebrow text-[#B7654A]">Quick answers</p><h2 className="mt-3 font-display text-4xl">Frequently asked questions</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3"><details className="border border-[#D7C2A7] p-5"><summary className="cursor-pointer text-sm">When will my order arrive?</summary><p className="mt-4 text-sm leading-6 text-[#866F62]">Standard delivery takes 3–5 working days. You can view delivery updates from your account after signing in.</p></details><details className="border border-[#D7C2A7] p-5"><summary className="cursor-pointer text-sm">How do I make a return?</summary><p className="mt-4 text-sm leading-6 text-[#866F62]">Contact us with your order number and our team will guide you through the return process.</p></details><details className="border border-[#D7C2A7] p-5"><summary className="cursor-pointer text-sm">Can I ask about a product?</summary><p className="mt-4 text-sm leading-6 text-[#866F62]">Yes. Share the product name in your message and we will help with fit, materials, and availability.</p></details></div></div></section>
  </main><BackToTop /></div>;
}
