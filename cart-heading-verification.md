# Shop heading and bag clearing verification

## Desktop

- `/shop` renders the default heading as **DISCOVER ÁVERAẸ** and retains the approved Cream/Cocoa/Terracotta editorial treatment.
- `/cart` keeps the Shopping bag empty state centered and uncluttered when no selections exist; the Clear bag action is conditional and therefore does not appear in the empty state.

## Mobile

- `/shop` wraps the **DISCOVER ÁVERAẸ** heading cleanly across two lines without horizontal overflow.
- `/cart` preserves the empty-state hierarchy, responsive header, and fixed mobile navigation. Clear bag remains conditional on having one or more selections.

## Automated validation

- Focused Vitest contracts: 14 tests passed across 3 files.
- Full regression suite: 21 files and 59 tests passed.
- TypeScript validation and production build passed.
