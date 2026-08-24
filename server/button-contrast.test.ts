import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const css = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const returnsPage = readFileSync(resolve(root, "client/src/pages/Returns.tsx"), "utf8");
const productPage = readFileSync(resolve(root, "client/src/pages/ProductDetail.tsx"), "utf8");

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
});
