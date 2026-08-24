# Header Preview Layering Verification

The shared desktop header was visually checked at 1280 × 900 on `/shop`. The wishlist and bag controls remain aligned in the approved navigation row, with no visible rich-preview card or tooltip at rest. The mobile header was checked at 390 × 844; desktop-only preview triggers remain hidden, while the compact header and fixed mobile navigation remain intact.

The real Chromium regression opened the wishlist preview, confirmed exactly one preview card was mounted, and verified the wishlist icon tooltip opacity was `0`. It then opened the bag preview and confirmed the wishlist preview was removed, exactly one bag preview remained, and the bag icon tooltip opacity was `0`. This validates both mutual exclusion and suppression of the underlying tooltip that caused the reported overlap.
