# Inventory-aware Quick View Verification

## Automated verification

- `pnpm check` passes with no TypeScript errors.
- `pnpm test` passes: 9 test files and 28 tests.
- The dedicated mobile Chromium audit confirms that Column Dress size M is disabled with an accessible “out of stock” label, while available size L can be selected and is the only size persisted to the bag.
- Catalog unit coverage confirms every product’s per-size inventory keys match its size list and the inventory quantities sum to the product-level stock total.

## Visual verification

- Desktop Shop at 1280 × 900 preserves the approved Áveraẹ cream, cocoa, and terracotta editorial layout, complete metadata filters, and readable product-card framing.
- Mobile Shop at 390 × 844 preserves the compact filter/sort controls, touch-friendly layout, bottom navigation, and accessible Quick View entry path.
- No palette, typography, imagery, or overall visual-direction changes were introduced.
