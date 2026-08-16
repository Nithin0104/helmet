# Phase 12 — Wishlist page (`/account/wishlist`)

**Depends on:** Phase 9 (account menu, `/account/wishlist` stub route), existing
`WishlistContext` (`src/wishlist/`), `ProductCard` (heart + add), PLP grid, `EmptyState`.

## Goal
Turn the `/account/wishlist` stub into a real **Wishlist page**: a grid of the products the
rider has ❤️-saved, backed by the existing `useWishlist()` store, reusing `ProductCard` and
the PLP grid. Newest-saved first, with unsave, add-to-cart (via the card's existing
behavior), an empty state, and optional clear-all.

## Why
The plumbing already exists — `WishlistContext` tracks saved **product ids**
(`has/add/remove/toggle/count/clear`, `localStorage`-backed), and the ❤️ on every
`ProductCard` toggles it. What's missing is the **destination**: a page that lists what's
saved. Because a wishlist entry is a *product* (an id), not a variant, the honest
representation is a **grid of `ProductCard`s** (Option A), not `CartLineItem` rows — it
reuses the exact tile the rest of the site saves from, and the card's add logic already does
the right thing per product type. This is assembly over existing pieces, so it's cheap.

## Distinction to preserve (two different "saved" concepts)
- **Wishlist** (`WishlistContext`, `apex_wishlist`) — ❤️ save = *browse intent*, product-level
  (id only). **This page.**
- **Cart "Saved for later"** (`CartContext.saved`, `apex_saved`) — a *specific variant*
  (color/size/qty) moved out of the bag. Stays on the Cart page.

These are **kept separate** (browse-intent vs deferred-bag-item are genuinely different).
This is a deliberate, overridable call — if we later want them unified, that's its own
change, not assumed here.

## Architecture

### Data resolution
- Page reads `useWishlist().ids` and resolves each id to a `Product` via the existing
  `src/data/*` product lookup (the same source PLP/PDP use). Order: **newest-saved first**
  (reverse insertion order — confirm whether `WishlistContext.ids` is insertion order and
  reverse for display).
- A saved id with **no matching product** (discontinued) is skipped gracefully — resolve to
  a filtered list, never render a broken tile. (Worth a small helper + test.)
- No new store. If anything, add a tiny selector/helper (`useWishlistProducts()` in
  `src/hooks/` or `src/lib/`) that returns resolved `Product[]` so the page stays dumb.

### Page — `WishlistPage` (`/account/wishlist`)
- **Count heading** — "WISHLIST · N", reusing the `SavedForLater` heading style for
  consistency with the cart's saved section.
- **Grid of `ProductCard`** — reuse the PLP grid layout; each card with `heart` (so the ❤️
  unsaves in place and the tile animates/leaves) and its default add behavior:
  - Helmets / variant products → the card routes to the **PDP** to pick color/size (existing
    `handleAdd` logic — do **not** add a blind, under-specified line).
  - Sizeless accessories/spares → added straight to cart (existing behavior) + `CartToast`.
- **Empty state** — `EmptyState`: "No saved items yet → Shop helmets" (link to `/helmets`).
  This is the default view for a new/anon-less user.
- **Clear all** (optional) — a secondary action calling `useWishlist().clear()`, with a
  confirm so it isn't a one-tap wipe. Ship it only if it reads cleanly; not load-bearing.
- Uses `PageShell` like the other account routes; wraps the grid responsively (mobile /
  tablet / wide), same breakpoints as the PLP.

### Unsave interaction
Toggling the heart on a card removes the id from `WishlistContext`; the tile leaves the grid.
Keep it immediate (no undo required for v1), but ensure the count heading and the header
wishlist badge update live (both read the same store).

## Fix carried from phase 9
Phase 9 said the header wishlist count *could* derive from `useCart().saved`. That's
**superseded**: the count is **`useWishlist().count`** (the real store the heart feeds).
Update the phase-9 `AccountMenu`/header wiring accordingly when built — one source of truth.

## Out of scope
No per-item notes, no move-between-lists UI with saved-for-later, no sharing/public
wishlists, no "notify me / back-in-stock" wiring here (that lives with Comms prefs), no
multi-wishlist collections. Add-to-cart size selection is the PDP's job, not a sheet on this
page.

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- Resolver/selector — ids → products in newest-first order; a discontinued id (no product)
  is dropped, not rendered; empty ids → empty list.
- `WishlistPage` — renders a card per saved product; count heading matches; empty state at
  zero; unsave removes the tile and decrements the count; accessible-name render +
  `vitest-axe` `toHaveNoViolations()`.
- Add behavior — a variant product's add routes to the PDP (no cart line created); a sizeless
  product's add creates a cart line + toast. (Reuse/extend existing `ProductCard` add tests
  rather than re-testing the card itself.)
- `useWishlist` already has coverage (`WishlistContext.test.tsx`) — extend only if the
  resolver adds logic.

**Browser (mobile / tablet / wide):**
- Save products from PLP/PDP → they appear on `/account/wishlist`, newest first; header
  wishlist badge and the page count agree.
- Unsave a card → it leaves the grid, count and header badge update live; unsaving the last
  one shows the empty state.
- Add a helmet from the wishlist → lands on its PDP (no blind cart line); add a sizeless
  accessory → cart badge increments, toast fires.
- Empty state renders with zero saves and links to `/helmets`; clear-all (if shipped)
  confirms then empties.
- State survives refresh (localStorage); no throw on empty/corrupted storage.
- Full keyboard pass: every heart and add button reachable/operable, focus visible; grid has
  no horizontal scroll at any width; long names wrap in the tile.
- Accent switcher (all 4 presets) recolors hearts, buttons, and the count heading with no
  stale colors.

**Forward-compat with the backend:** the page reads `useWishlist()` + the shared product
lookup; swapping localStorage ids for a server-synced wishlist (or the product lookup for an
async fetch) of the same shapes must not force a rewrite. No tile assumes product data is
present before first render without the empty/skeleton path.
