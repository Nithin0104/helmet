# Phase 7 — Helmet Detail PDP

**Goal:** build the full **Product Detail Page** (`/product/:id`) from the DC source
`Helmet detail PDP.dc.html`, porting the **9 PDP-specific components it composes** into the
design system, enriching the mock-data contract just enough for 1:1 fidelity, and adding three
additive, mobile-first enhancements. The PDP is the last major unbuilt storefront page —
`src/pages/ProductPage.tsx` is still a routing scaffold rendering `PageShell`.

Every new component follows the standing recipe: folder-per-component (`Component.tsx` +
`Component.module.css`), one exported `Props` interface, tokens-only CSS, config-first optional
props, co-located `Component.test.tsx` (accessible-name + `vitest-axe` + interaction/boundary),
barrel export, `ShowcasePage` demo bay, and a mirrored preview in the primitives design-pane
(`f3859a7b…`) with a `<!-- @dsCard -->` marker + `_ds_manifest.json` entry.

**Depends on:** Phases 1–4 (tokens, `cx`, `useReveal`, existing primitives/composites, cart & wishlist context).
**Source of truth:** the DC source wins for visuals/behaviour. Where it disagrees with an older
phase doc, DC wins (flagged below).

---

## Confirmed decisions (with the user)

- **Full data enrichment** — add two *optional, backward-compatible* fields, populate the 8 core helmets, derive the rest.
- **New `ProductReview` composite** — the DC PDP's review-list row; **supersedes** the phase-3 doc's "ReviewCard" note. `ReviewCard` is unchanged and stays in the Home marquee.
- **All 3 innovations** — fullscreen image lightbox, desktop sticky buy summary, recently-viewed rail.

## Reconciliation with the existing repo

- Currency is **₹ via `formatPrice`** (`src/lib/format.ts`), not the DC source's `£`.
- Images are **placeholder tiles** keyed off `product.views` labels + colour (matches the DC gallery and the phase-3 decision); the gallery is structured so real `<img loading="lazy">` swaps in later with no rewrite.
- Cart: `useCart().add({ productId, name, brand, price, color, size }, qty)` — line id de-dupes by `productId|color|size`, so the PDP must pass the selected colour + size.

---

## Scope & tier placement

| Component | Tier / folder | DC source |
| --- | --- | --- |
| `SizeGrid` | `primitives/SizeGrid` | `SizeGrid.dc.html` |
| `SpecTable` | `primitives/SpecTable` | `SpecTable.dc.html` |
| `TrustList` | `primitives/TrustList` | `TrustList.dc.html` |
| `ProductGallery` | `composite/ProductGallery` | `ProductGallery.dc.html` |
| `SwatchPicker` | `composite/SwatchPicker` | `SwatchPicker.dc.html` |
| `ReviewSummary` | `composite/ReviewSummary` | `ReviewSummary.dc.html` |
| `ProductReview` | `composite/ProductReview` | `ProductReview.dc.html` |
| `StickyBuyBar` | `composite/StickyBuyBar` | `StickyBuyBar.dc.html` |
| `SizeGuideSheet` | `composite/SizeGuideSheet` | `SizeGuideSheet.dc.html` |

---

## Porting recipe (unchanged from Phase 1/4)

`data-props` → `Props` · `renderVals()` → props/`useState`/derived consts · `{{x}}`/`sc-if`/`sc-for`
→ `{x}`/`{cond && …}`/`list.map` · inline `style` → `.module.css` class + CSS var for the dynamic
bit · `style-hover`/`style-active` → `:hover`/`:active` · `this.setState` → `useState` ·
`window.ApexCart` → `useCart()`. **Accent/hover/shadow come from `var(--accent…)`** — never
re-implement the per-accent JS `ACC = {…}` map (it only exists because the DC runtime lacked CSS
vars). Preserve animation timing/easing exactly (durations, `cubic-bezier(.2,.7,.2,1)`, delays).

---

## ⭐ Config-first & a11y — current DC surface → additions

**SizeGrid** (primitive) — DC: `label`, `items:{label,stock}[]`, `value`, `columns` (int/`auto`),
`helper`, `showGuide`, `guideLabel`, `onGuide`, internal `v`.
- Add: controlled `value`+`onChange` / uncontrolled `defaultValue`; `items` accept `stock?: number`
  **or** `available?: boolean` (repo shape) — derive in-stock/low-stock/sold-out from either; `className`.
- A11y: `role="radiogroup"` + `aria-label`; options are `<button role="radio" aria-checked>`, sold-out
  `aria-disabled` and unselectable; ←/→/↑/↓ roving focus skipping sold-out; guide trigger a real `<button>`.

**SpecTable** (primitive) — DC: `items:{label,value}[]` (or `[label,value][]`), `zebra`.
- Add: `className`. A11y: semantic `<dl>`/`<div><dt><dd>` rows; zebra is presentational only.

**TrustList** (primitive) — DC: `layout` (stack/row), `items:{icon,title,sub}[]`.
- Add: `className`. A11y: `<ul>`/`<li>`, icon glyph `aria-hidden`.

**ProductGallery** (composite) — DC: `views: string[]|string`, `pattern`, `tag`, `badge`, `safety`,
touch-swipe + arrows + dots/thumbs, internal `i`.
- Add: controlled `value`+`onChange` / uncontrolled; **`lightbox=false`** (tap main frame → fullscreen
  zoom via existing **Modal** + **HoverZoom**); `className`. Keep the 800px dots→thumbs swap and
  `.45s cubic-bezier(.2,.7,.2,1)` track transition.
- A11y: prev/next/dot/thumb `<button>`s with `aria-label`; ←/→ arrow keys; counter `aria-live="polite"`.

**SwatchPicker** (composite) — DC: `label`, `items:{name,hex}[]`, `value`, `onChange`, `size`.
- Compose the existing **ColorSwatch** primitive for the swatch row; add the DC mono label header
  ("COLOUR — Matte Black" = label + selected name). Controlled/uncontrolled; `className`.

**ReviewSummary** (composite) — DC: `score`, `count`, `distribution:{n,count}[]`, animated bars.
- Add: `className`; bars animate on mount, **honour `prefers-reduced-motion`**. A11y: the histogram
  gets `role="img"` + descriptive `aria-label`; use **ProgressBar** where it doesn't fight the visual.

**ProductReview** (composite) — DC: `author`, `date`, `rating`, `title`, `body`, `verified`, `meta`,
`avatarColor`.
- Add: `className`. A11y: `<article>`; star row `role="img" aria-label="4 out of 5"`.

**StickyBuyBar** (composite) — DC: `price`, `meta`, `label`, `phase` (idle/loading/done), `visible`,
`desktop`, `onAdd`; fixed bottom, slide/fade on `visible`.
- Add: `className`. A11y: `aria-hidden` + `pointer-events:none` when hidden (no phantom tab stop).
  `desktop` enables the innovation (sticky CTA on desktop too, same IntersectionObserver source).

**SizeGuideSheet** (composite) — DC: `open`, `onClose`, `title`, `note`, `tip`, `columns`, `rows`,
`highlight`; bottom-sheet (mobile) / centered dialog (desktop).
- Build on the **BottomSheet**/**Modal** pattern + `useFocusTrap`; `role="dialog" aria-modal`, Esc
  closes and returns focus to the trigger; `className`.

> Don't gold-plate — add the props above (controlled state, data-driven items, handlers, `className`,
> the three agreed innovations), not speculative ones.

---

## Data changes (backward-compatible)

**`src/data/types.ts`** — two optional additions:
- `SizeOption.stock?: number` — enables "Only N left" / "Sold out"; `available` stays the fallback.
- `Product.highlightStats?: { value: string; label: string }[]` — drives the "WHY THIS LID" band; falls
  back to rendering `highlights: string[]` as plain feature cards.

**`src/data/products.ts`** — populate `stock` (tweak `sizeSet` to accept per-size counts) and
`highlightStats` for the **8 `CORE_HELMETS`**. The 16 factory helmets keep the graceful fallback; the
sold-out SKU stays fully out of stock for edge coverage.

**`src/data/pdp.ts`** (new — site-wide PDP content): `TRUST_BADGES`, `SIZE_GUIDE` (`{columns, rows}`),
`SIZE_HELPER`, `PRICE_NOTE`, `PDP_TABS`.

**Derived at render (no new fields), memoized, `src/lib/pdp.ts`:**
- `getRatingDistribution(product)` — bucket `reviews[]`; when `reviewCount` exceeds the sample, scale
  deterministically from `rating` so bars read realistically.
- `getRelatedProducts(product, PRODUCTS, n=6)` — same `category`, fill by `brand`/`rating`, exclude self.
- Display SKU derived from `product.id`.

**`tests/contracts/data.contract.test.ts`** — extend to assert the new optional fields' shape where present.

---

## Hooks (`src/hooks/`, co-located tests)

- **`useRecentlyViewed(product?)`** — records the current product id in `localStorage`
  (`apex_recently_viewed`, capped ~8, most-recent-first, current excluded) and returns the id list.
- **`useOffscreen(ref)`** — IntersectionObserver returning whether the target has scrolled above the
  viewport (drives `StickyBuyBar.visible`); mirrors the DC `watchCta` logic. Reuse `useReveal`'s
  observer style; respects unmount cleanup.

---

## Page assembly — `src/pages/ProductPage/`

Convert the flat scaffold to a folder (mirrors `ShopPage/`): `ProductPage.tsx` +
`ProductPage.module.css` + `index.ts` barrel + `sections/`. `App.tsx` import stays
`./pages/ProductPage` (barrel resolves it); delete the old flat file. **Keep** the
`useParams → getProduct(id) → <Navigate to="/" replace/>` guard. Body only — header/footer/glow
come from `SiteLayout`.

`ProductPage.tsx` (container): `useDocumentTitle(name, tagline)`; owns
`colorIndex/sizeIndex/qty/tabIndex/guideOpen/cartPhase/toastVisible`; memoizes
`distribution`/`related`/`recentlyViewed`; wires add-to-cart (idle→loading→done→`CartToast`,
`useCart().add`); `useOffscreen` on the buy CTA drives `StickyBuyBar`; `useRecentlyViewed` records the product.

`sections/` (fed the resolved `product` + config, each conditional on data presence):
- `BuyPanel` — brand/SKU, `<h1>`, rating→reviews link, price + `compareAtPrice`, stock line,
  `SwatchPicker`, `SizeGrid`, `QtyStepper` + add-to-cart CTA, `SaveButton`, `TrustList`.
- `HighlightsBand` — `highlightStats` (or fallback `highlights`).
- `DetailTabs` — `Tabs` → Description / `SpecTable` / (`ReviewSummary` + `ProductReview` list,
  `EmptyState` when no reviews).
- `FaqSection` — `Accordion` (hidden when no `faqs`).
- `RelatedRail` — `ProductRail layout="grid"` from `getRelatedProducts`.
- `RecentlyViewedRail` — `ProductRail` from `useRecentlyViewed` (hidden when empty). *(innovation)*
- Overlays: `SizeGuideSheet`, `CartToast`, `StickyBuyBar` (mobile + `desktop`). *(sticky-desktop = innovation)*
- Gallery: `ProductGallery lightbox`. *(lightbox = innovation)*

**Graceful degradation:** every section renders only when its data exists (no colours → no swatch;
no specs → tab hidden; no reviews → EmptyState), so the same page serves a fully-detailed core helmet,
a bare factory helmet, and a future async fetch of the same shape.

**Responsive (mobile-first):** single column, bleed gallery + bottom sticky bar `< 900px`; 2-col grid
with sticky gallery `≥ 900px`; gallery dots→thumbnails at 800px; SpecTable/ReviewSummary stack `< 640px`.
No horizontal scroll at any width.

**Performance:** transform-based gallery track (GPU), passive IntersectionObserver, `useMemo` for
derived data, portal overlays mount only when open, `prefers-reduced-motion` honoured. Optionally
`React.lazy` the PDP route (Suspense fallback = existing `Skeleton`).

---

## Design-pane sync (`f3859a7b…`)

Mirror each of the 9 components as a standalone self-contained preview HTML (kebab-case:
`size-grid.html`, `spec-table.html`, `trust-list.html`, `product-gallery.html`, `swatch-picker.html`,
`review-summary.html`, `product-review.html`, `sticky-buy-bar.html`, `size-guide-sheet.html`) with the
`data-accent` token block + `@dsCard` marker, and add nine `cards[]` entries to `_ds_manifest.json`.
Groups: SizeGrid/SpecTable/TrustList → *Data display*; ProductGallery → *Media*; SwatchPicker → *Inputs*;
ReviewSummary/ProductReview → *Sections*; StickyBuyBar/SizeGuideSheet → *Overlays*. Ordering:
`list_files`/`get_file` → `finalize_plan` (writes = the nine `*.html` + `_ds_manifest.json`, deletes `[]`)
→ `write_files`.

---

## ShowcasePage

Add live demo bays with the accent switcher: a new **PDP** section (or extend existing groups) with
`SizeGrid` (in-stock/low/sold-out), `SpecTable`, `TrustList` (stack + row), `ProductGallery`
(with lightbox), `SwatchPicker`, `ReviewSummary`, `ProductReview` (verified + plain), `StickyBuyBar`
(all phases), and a `SizeGuideSheet` open toggle. Update `NAV_SECTIONS`.

---

## Tests (co-located, blocker if missing)

Follow `QtyStepper.test.tsx` / `Modal.test.tsx`. Every component: accessible-name render +
`toHaveNoViolations()`. Interactive ones additionally:
- **SizeGrid** — controlled + uncontrolled; sold-out not selectable + `aria-disabled`; low-stock note; keyboard roving.
- **SwatchPicker** — controlled + uncontrolled selection; selected name in the label.
- **ProductGallery** — prev/next bounds, dot/thumb select, arrow keys, swipe, lightbox open/close.
- **ReviewSummary** — bars from distribution; reduced-motion path. **ProductReview** — verified/meta render.
- **SpecTable** — rows, zebra, `[label,value][]` + `{label,value}` inputs, empty. **TrustList** — items, layouts.
- **StickyBuyBar** — phases (idle/loading/done), hidden a11y (`aria-hidden`/no tab stop). **SizeGuideSheet**
  — open/Esc/highlight/focus-return.
- **`tests/integration/pdp-flow.test.tsx`** — render `/product/:id`, pick colour+size, qty 2, add → cart
  count +2 + toast; sold-out size disabled; unknown id → redirect; empty-reviews → EmptyState; refresh
  persists cart + recently-viewed.
- Extend `tests/contracts/data.contract.test.ts`. Build off `tests/fixtures/products.ts` / inline `Product`.

Coverage stays above `vite.config.ts` thresholds.

---

## Verify

- `npm run build` + `npm run lint` + `npm test` + `npm run coverage` all green.
- `/run` the app, drive `/product/velocity-rs-carbon` at **mobile / tablet / wide**:
  - Pick colour + size + qty → add: badge +qty, `CartToast` fires, `StickyBuyBar` shows when CTA off-screen.
  - Sold-out size disabled (not just greyed); low-stock urgency shows; another size clears it.
  - Tabs switch Description/Specs/Reviews; empty-reviews product → EmptyState; FAQ accordion; related +
    recently-viewed rails populate.
  - Size-guide sheet opens (bottom-sheet mobile / dialog desktop), Esc closes + returns focus; gallery
    swipe/arrows/thumbs; lightbox opens & zooms.
  - **Accent switch all 4 presets** recolours every PDP element, no stale colour.
  - Full keyboard pass (Tab order, visible focus, Esc on sheet/lightbox); refresh persists cart +
    recently-viewed; back button after add-to-cart behaves; rapid double-click doesn't double-submit.
- No horizontal scroll / clipped content at any width; 800px header swap unaffected.
- `/showcase`: all 9 render, every variant matches its DC preview, accent switcher recolours all.
- Design-pane: 9 new cards appear in `f3859a7b` under the right groups and match the library.
- Cross-phase: `npm test` confirms no regression to Home/Shop/primitives/contexts.

## Done = definition

`/product/:id` renders the full DC PDP on real data, all 9 components live in the library + design-pane
with tests, the three innovations work, and every Verify check passes in a real browser.
