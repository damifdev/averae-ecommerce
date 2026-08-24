import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'client/src');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('Contact page contracts', () => {
  it('registers the dedicated contact route and footer destination', () => {
    const app = read('App.tsx');
    const home = read('pages/Home.tsx');
    expect(app).toContain("import Contact from './pages/Contact';");
    expect(app).toContain('<Route path="/contact" component={Contact} />');
    expect(home).toContain("['Contact', '/contact']");
  });

  it('contains the requested contact content and support pathways', () => {
    const contact = read('pages/Contact.tsx');
    expect(contact).toContain('Contact Áveraẹ');
    expect(contact).toContain("Have a question, need help with an order, or simply want to talk to us? We're here to help.");
    expect(contact).toContain('Order Help');
    expect(contact).toContain('VIEW FAQs');
    expect(contact).toContain('TRACK YOUR ORDER');
    expect(contact).toContain('href="/account#orders"');
    expect(contact).toContain('id="faqs"');
  });

  it('validates fields and provides explicit success feedback', () => {
    const contact = read('pages/Contact.tsx');
    expect(contact).toContain('Please enter your full name.');
    expect(contact).toContain('Please enter a valid email address.');
    expect(contact).toContain('Please add a subject.');
    expect(contact).toContain('at least 10 characters');
    expect(contact).toContain('maxLength={1200}');
    expect(contact).toContain('Thank you. Your message has been received. Our team will get back to you shortly.');
    expect(contact).toContain("trackEngagement('contact_form_submit'");
  });
});
