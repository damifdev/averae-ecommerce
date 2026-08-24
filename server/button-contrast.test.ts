import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const css = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const returnsPage = readFileSync(resolve(root, "client/src/pages/Returns.tsx"), "utf8");
const productPage = readFileSync(resolve(root, "client/src/pages/ProductDetail.tsx"), "utf8");
const contactPage = readFileSync(resolve(root, "client/src/pages/Contact.tsx"), "utf8");
const accountPage = readFileSync(resolve(root, "client/src/pages/Account.tsx"), "utf8");
const quickView = readFileSync(resolve(root, "client/src/components/QuickView.tsx"), "utf8");

describe("filled action contrast", () => {
  it("guards cocoa-filled anchors and buttons with an ivory label", () => {
    expect(css).toContain('a[class~="bg-[#382820]"]:not([class~="hover:text-[#382820]"])');
    expect(css).toContain('button[class~="bg-[#382820]"]:not([class~="hover:text-[#382820]"])');
    expect(css).toContain("color: #FFFDF8 !important;");
  });

  it("covers the reported Returns CTAs and existing product actions", () => {
    expect(returnsPage).toContain('bg-[#382820]');
    expect(returnsPage).toContain('text-[#FFFDF8]');
    expect(productPage).toContain('action-link-light');
  });

  it("keeps intentional ivory-hover action styles available", () => {
    expect(css).toContain('[class~="hover:text-[#382820]"]');
  });

  it("provides one visible keyboard focus treatment across interactive controls", () => {
    expect(css).toContain(':where(button, a, input, select, textarea, summary):focus-visible');
    expect(css).toContain('outline: 2px solid #B7654A;');
    expect(css).toContain('outline-offset: 3px;');
  });

  it("shows submission loading feedback on contact and return forms", () => {
    expect(contactPage).toContain('const [submitting, setSubmitting] = useState(false);');
    expect(contactPage).toContain('aria-busy={submitting}');
    expect(contactPage).toContain('Sending…');
    expect(accountPage).toContain('const [returnSubmitting, setReturnSubmitting] = useState(false);');
    expect(accountPage).toContain('aria-busy={returnSubmitting}');
    expect(accountPage).toContain('SUBMIT RETURN REQUEST');
  });

  it("gives View Bag a smooth hover transition and focus affordance", () => {
    expect(quickView).toContain('quick-view-view-bag');
    expect(quickView).toContain('transition-colors duration-200');
    expect(quickView).toContain('hover:bg-[#382820] hover:text-[#FFFDF8]');
    expect(quickView).toContain('focus-ring');
  });
});
