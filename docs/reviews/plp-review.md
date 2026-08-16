# PLP (`/shop`) Review — QA · Design · Frontend · Product

> **Resolution status (2026-08-04):** findings **1–12 implemented and verified**
> (build/lint green, 682 tests passing, browser-checked). Findings **13** (real
> imagery — needs asset delivery) and **14** (feature roadmap: quick view / compare /
> results-per-page / saved filters) remain **deferred** as they aren't single code
> changes. See each item's ✅/⏳ marker below.

**Date:** 2026-08-04 · **Reviewed build:** `july-week-1` (Phase 6 PLP)
**Method:** live walkthrough at 1440px (desktop full / filtered / empty / sort-open),
DOM + computed-style audit, and code inspection. Mobile layout logic is covered by
`tests/integration/plp-flow.test.tsx`; on-device visual verification is still pending
(the browser tool can't force the <800px `matchMedia` branch).

## TL;DR

The PLP is functionally strong — URL-driven filters, live count-aware facets, sort,
pagination, empty state, and no-jump layout all work. The gaps are **conversion and
mobile-fitness**, not correctness. The three that matter most for a mobile-first,
discount-driven helmet store:

1. **Wishlist (and quick-add) are hover-only → invisible on touch.** Mobile shoppers
   can't save a helmet from the listing at all.
2. **`compareAtPrice` is never shown.** Products on offer render only the sale price —
   no strikethrough, no "% off". The data is already there; we're hiding the discount.
3. **The in-grid promo tile stretches to a full 440px card-row, ~half of it empty red.**

Everything else is a11y/SEO polish and roadmap.

---

## Priority matrix

| # | Priority | Status | Finding | Lens |
|---|---|---|---|---|
| 1 | **P1** | ✅ | Wishlist heart + quick-add are hover-only, unusable on touch | Design · FE · Product |
| 2 | **P1** | ✅ | `compareAtPrice` discount not shown on cards | Product · Design · FE |
| 3 | **P1** | ✅ | Promo tile over-tall (440px) with large empty area | Design |
| 4 | **P2** | ✅ | Result count not announced to screen readers (no live region) | QA/a11y |
| 5 | **P2** | ✅ | Product names are `<a>`, not headings (no h2/h3) | FE · Product/SEO |
| 6 | **P2** | ✅ | Card add/save controls have no visible keyboard focus ring | QA/a11y |
| 7 | **P2** | ✅ | Generic `<title>` "APEXLINE" + no meta description per page | Product/SEO · FE |
| 8 | **P2** | ✅ | Breadcrumb + promo CTA use `<a href>` → full page reload, not SPA nav | FE |
| 9 | **P3** | ✅ | Price filter is single "up to" max only — no minimum | Product |
| 10 | **P3** | ✅ | `countFor` recomputed per option per render (O(options×products)) | FE/perf |
| 11 | **P3** | ✅ | Rating exposes no accessible phrasing ("4.7 (128)") | QA/a11y |
| 12 | **P3** | ✅ | No loading/skeleton state wired for the future async fetch | FE/forward-compat |
| 13 | **P3** | ⏳ | Placeholder tiles only — no real imagery/alt text (needs assets) | Design · Product |
| 14 | **P3** | ⏳ | Feature gaps: quick view, compare, results-per-page, saved filters | Product |

✅ implemented & verified · ⏳ deferred (not a single code change).

Effort: XS < 1h · S ~½ day · M ~1–2 days.

---

## P1 — Fix first (conversion + mobile)

### 1. Hover-only wishlist & quick-add are dead on touch
**Lens:** Design / Frontend / Product · **Where:** `ProductCard.module.css`

`.heart` is `opacity: 0` until `.card:hover`, and `.quickAdd` is `translateY(101%)`
until hover. Touch devices never fire `:hover`, so on mobile:
- The **save-to-wishlist heart is never visible** → no way to wishlist from the PLP.
- The quick-add bar never appears (the always-visible `+` button still works, so add-to-cart is fine — but *save* has no fallback).

For a store where "most customers use mobile," losing wishlist on the primary browsing
surface is a real funnel leak.

**Solution:** reveal the affordances when the device can't hover.
```css
@media (hover: none) {
  .heart { opacity: 1; }          /* always tappable on touch */
  .card:hover .quickAdd,          /* keep hover reveal on desktop only */
  .quickAdd { transform: translateY(0); } /* or drop quick-add on touch, rely on + */
}
```
Verify the heart's 28px hit area meets the ~44px touch-target guidance (pad the tap area
even if the glyph stays small).

### 2. Show the `compareAtPrice` discount
**Lens:** Product / Design / Frontend · **Where:** `ProductCard.tsx` footer

Several catalog products carry `compareAtPrice` (e.g. Velocity RS Carbon ₹47,999→₹42,999,
Summit ADV Carbon ₹43,999→₹39,999, Thunder Full Carbon ₹49,999→₹45,999) but the card
renders only `formatPrice(price)`. DOM audit confirms **zero** strikethrough anywhere.
We're actively hiding a price advantage on a price-sensitive category.

**Solution:** in the footer price block, when `compareAtPrice > price`, render the struck
original beside the sale price and (optionally) a `% off` badge:
```
₹42,999  ~~₹47,999~~   -10%
```
Use `--text-dim` + `line-through` for the original and `--danger`/`--accent` for the
badge — all tokens already exist. This is presentational-only in `ProductCard`; add a
render test for the struck price.

### 3. Promo tile is a giant empty red block
**Lens:** Design · **Where:** `ResultsGrid.tsx` (`PromoTile`, `styles.promo`)

Measured: the promo stretches to the **440px** card-row height (grid stretch), but its
content — kicker + headline + CTA — needs ~200px, leaving ~240px of empty red. It reads
as a rendering bug, not a designed banner.

**Solution (pick one):**
- **Center + enrich (preferred):** vertically center the content and add a subtle helmet
  silhouette / accent graphic so the 2×1 cell feels intentional. Keeps DC intent.
- **Constrain:** `align-self: start` on `.promo` so it takes only its natural height
  (leaves a clean gap below rather than stretched emptiness), or cap the promo height.
- **Reposition:** render the promo as a full-width band between grid rows instead of an
  in-grid cell — removes the stretch problem entirely and is more eye-catching.

---

## P2 — a11y & SEO correctness

### 4. Result count isn't announced (no live region)
`Showing 1–9 of 24 helmets` updates visually on every filter/sort, but the DOM has **no
`aria-live`** — screen-reader users get no feedback that results changed. Add
`aria-live="polite"` to the count element (`AppliedFilterBar` count or a wrapper in
`AppliedChips.tsx`). XS effort, meaningful for accessibility.

### 5. Product names are links, not headings
The page has a single `h1` ("Helmets") and **no h2/h3** — every product name is a bare
`<a>`. That hurts SEO (no product-title signal) and screen-reader heading navigation.
Wrap each card name in an `h2`/`h3` (`<h3><a …>{name}</a></h3>`), styled to look identical.

### 6. Invisible focus on card controls
Computed style on the card `+` button shows `outline-style: none` and there's no
`:focus-visible` fallback. Keyboard users can't see where they are among the cards. Add a
`:focus-visible` ring (accent outline or box-shadow) to `.add`, `.heart`, and `.quickAdd`
in `ProductCard.module.css` — the design system already uses this pattern on chips.

### 7. Generic page title + no meta description
`document.title` stays `"APEXLINE"` on `/shop`, and there's no `meta[name=description]`.
Set a per-page title (`"Helmets | APEXLINE"`) and description — via a small effect or a
head manager. Improves SEO and browser-tab/bookmark clarity. Applies to all pages, not
just PLP.

### 8. Breadcrumb & promo CTA cause full page reloads
`Breadcrumbs` and `PromoTile` render `<a href>`, so clicking "Home" or "Book a fitting"
does a full document reload instead of client-side navigation, dropping SPA state and
flashing the page. Give both a router-`Link` option (or an `as`/`onNavigate` prop) and use
it here. Shared-component change — keep the plain-anchor default for non-router uses.

---

## P3 — Polish & roadmap

- **9. Price filter is max-only.** Single "up to ₹X" thumb; shoppers can't set a floor.
  Consider the dual-thumb `RangeSlider` (`value: [min, max]`) the primitive already supports.
- **10. `countFor` cost.** Recomputed inline for every option on every render
  (~30 options × 24 products = ~720 passes/render, and again per keystroke). Fine now;
  memoize a per-facet count map before a larger catalog / real API.
- **11. Rating a11y phrasing.** "4.7 (128)" reads without context; expose an
  `aria-label`/visually-hidden "Rated 4.7 out of 5, 128 reviews".
- **12. No loading state.** The grid assumes synchronous data; when `PRODUCTS` becomes an
  async fetch, wire the existing `Skeleton` for a loading grid (forward-compat the plan calls out).
- **13. Placeholder imagery.** All tiles are CSS dashed placeholders — real images + `alt`
  are needed before genuine visual/UX and SEO evaluation (known phase limitation).
- **14. Feature gaps (roadmap):** quick view / add from grid without PDP for variant
  products, compare, results-per-page control, "clear one facet group", shareable/saved
  filter sets, and a visible active-sort affordance beyond the trigger text.

---

## What's working well (keep)

- URL-as-state: filters/sort/page are shareable, deep-linkable, back-button correct, and
  degrade gracefully on a corrupt query.
- **Live count-aware facet counts** (other facets applied, own group ignored) — genuinely
  good UX; verified Brand→Type counts update correctly.
- Sticky sidebar reused verbatim in the mobile sheet; density toggle; numbered pager.
- Empty state is clear with a working "Clear all filters" CTA.
- No layout jump: `scrollbar-gutter: stable` + reserved applied-filter-bar height (48px)
  eliminate the earlier horizontal and vertical shifts.

## Suggested sequencing

1. **Ship P1 together** (heart-on-touch, discount price, promo height) — one small PR,
   biggest conversion + mobile impact.
2. **P2 as an a11y/SEO pass** (live region, headings, focus rings, title/meta, SPA links).
3. **P3** into the backlog; revisit price-range and `countFor` memoization when the real
   product API and full catalog land.
