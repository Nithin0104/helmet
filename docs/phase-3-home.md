# Phase 3 — HomePage

**Goal:** port the DC **Helmet Showroom Home** design into the real `HomePage`, assembled from
existing composites/primitives + `src/data/*`. The page stays thin (layout + data); section
visuals/motion come from the DC source, not memory.

**DC source:** DesignSync project `6fb6200b-d6d0-40a7-8520-588a73e78751` →
`Helmet Showroom Home.dc.html` (pulled via the design MCP). When this doc and the live DC source
disagree on visuals/behavior, the DC source wins — flag it here, don't silently pick.

**Depends on:** Phase 2 composites (SiteHeader/SiteFooter/BrandStrip/ProductCard/ReviewCard ✅),
Phase 1 primitives (StatCard/CountUp/Marquee/Tabs ✅), routing scaffold ✅, and the
**Data prerequisites** below.

---

## 1. Data prerequisites (do first)

### 1a. Accessories catalog (decision: add accessories data)
The DC home has a full **Accessories** rail (gloves, intercoms, jackets, visors) and category cards
for Spares/Accessories/Care. Our catalog is helmets-only, and the helmet catalog now carries a
uniform full-detail contract (colors/sizes/specs/faqs/reviews) that does **not** fit accessories.

Plan: keep accessories in a **separate module** so they feed the home rails (and a future
accessories PLP) without polluting the helmet PLP/PDP or the helmet uniform-catalog contract.

- New `src/data/accessories.ts` exporting `ACCESSORIES: Product[]` — Product-shaped but only the
  fields a `ProductCard` needs: `id`, `name`, `brand`, `category`, `price`, `rating`, `reviewCount`,
  `badge?`, `tagline?`. Helmet-only optional fields (`colors`/`sizes`/`views`/`specs`) are omitted.
- 6–8 items across real brands and accessory categories: **Gloves, Comms, Jacket, Visor, Riding
  Jeans, Care** (mirrors the DC list: Pro Race Gloves, Comlink Intercom, Tour Textile Jacket,
  Iridium Visor, Kevlar Riding Jeans, Anti-Fog Kit, …). Prices in ₹ integers, brands from the real
  set (`MT Helmets`, `SMK`, `Axor`, `Vega`, `Steelbird`, `Studds`, `Royal Enfield`).
- New `tests/contracts/accessories.contract.test.ts` — asserts the ProductCard-required fields are
  present and well-typed (lighter than the helmet contract; no colors/sizes/specs requirement).
- **Ripple flagged, deferred:** a full accessories **PLP/PDP** (filters, detail page, rich fields)
  is out of scope for the home page. Home only renders accessories through `ProductCard`. Category
  cards for Spares/Accessories/Care link to `/shop` (helmets PLP) for now; wiring a real accessories
  listing is a later step.

### 1b. Rail curation helpers
The DC toggles each rail between **Bestsellers** and **New Arrivals**. Derive these as data, not in
the component:
- `getBestsellers(list)` — items with a bestseller-ish badge or top-N by `reviewCount`/`rating`.
- `getNewArrivals(list)` — items with badge `New` (or a `isNew`/curation flag if badge coverage is
  too thin). If deriving from current badges is too sparse, add a lightweight `featured?: 'best' |
  'new'` curation field to the affected products rather than hardcoding lists in the page.
- Helpers live next to the data (`products.ts` / `accessories.ts`), returning plain arrays.

### 1c. Home content module
Home copy is content → new `src/data/home.ts` (the CMS/API seam). Holds:
- **hero**: eyebrow/badge (`LIMITED · SUMMER SALE`), headline (`Up to 30% off select lids`),
  subcopy, CTA labels/hrefs.
- **stats**: `[{ value: '200+', label: 'Helmets' }, { value: '10+', label: 'Brands' },
  { value: '4.9★', label: 'Rated' }]`.
- **categories**: `[{ kicker: 'CAT 01', title: 'Helmets', caption: 'Full-face · modular · open',
  href }, …]` (Helmets/Spares/Accessories/Care).
- **whyUs**: 4 × `{ icon, title, body }`.
- **showroom**: heading, copy, address, hours, CTA labels. **Localized:** `UNIT 4, RIVERSIDE WORKS ·
  BENGALURU` + Indian hours — **not** the DC's `LONDON` (reuse `FOOTER_ADDRESS` from `navigation.ts`).
- **compare**: eyebrow/heading/copy/link label.

### 1d. Localization (DC → project)
- **£ → ₹**: all rail/card prices format through `lib/format.ts#formatPrice`; store integer rupees in
  data. No `£` strings.
- **London → Bengaluru** in the showroom block.
- **Fictional brands → real brands** in every rail (feed from `PRODUCTS`/`ACCESSORIES`, not DC's
  APEX/STRATA/NORDVIK literals).

---

## 2. Page structure (top → bottom)

| # | Section | Built from | Data | Motion |
| --- | --- | --- | --- | --- |
| 1 | SiteHeader | ✅ composite (`activePage="Helmets"`) | `navigation.ts` | sticky |
| 2 | Ambient glow | page-local div, accent radial | — | `glow` 6s |
| 3 | Hero / offer banner | new `HomeHero` section | `home.hero` | `fadeUp`, `shimmer` |
| 4 | Stats bar | `CountUp` primitive in a bordered 3-col bar | `home.stats` | count on reveal |
| 5 | BrandStrip | ✅ composite | `navigation.BRANDS` | marquee |
| 6 | "Shop the range" | new `CategoryCard` × grid | `home.categories` | `reveal`, hover lift |
| 7 | Helmets rail | new `ProductRail` (tabs + drag scroll) | `PRODUCTS` best/new | `reveal`, `tabSwap` |
| 8 | Accessories rail | `ProductRail` (reused) | `ACCESSORIES` best/new | `reveal`, `tabSwap` |
| 9 | Why APEXLINE | new `WhyUs` section (4 cards) | `home.whyUs` | `reveal`, hover |
| 10 | Compare band | new `CompareBand` section | `home.compare` | `reveal` |
| 11 | Offline store | new `ShowroomCta` section | `home.showroom` | `reveal`, `shimmer` |
| 12 | Reviews marquee | `Marquee` primitive + `ReviewCard` | curated reviews | marquee, pause-on-hover |
| 13 | SiteFooter | ✅ composite | `navigation.FOOTER_*` | — |

Sections 6–12 carry the `reveal` scroll-in (our `useReveal` hook). Header/hero render immediately.

---

## 3. New components & hooks

**Reusable composites** (`src/components/composite/`, one folder each, barrel-exported):
- **ProductRail** — labeled section: heading + `SEE ALL →` link, optional segmented **Bestsellers /
  New Arrivals** control, horizontal drag-scroll track of `ProductCard`s. Props:
  `title`, `seeAllHref?`, `tabs?: { id, label }[]`, `itemsByTab | items`, `layout?: 'shelf' | 'grid'`
  (default `'shelf'`), `motion?`, `hoverEffect?`. Reused for Helmets + Accessories and available to
  other pages (PLP related rail, PDP "related").
- **CategoryCard** — one category tile (kicker, title, caption, arrow), a link. Props from a
  `Category` shape + `className`/`style` escape hatch.

**Hook** (`src/hooks/`):
- **useDragScroll** — pointer drag-to-scroll for the rail track, with click-suppression after a drag
  (ports the DC `setupDrag`). Co-located test. Replaces the DC's per-row inline handler.

**Reused primitives:** `CountUp` (stats), `Marquee` (reviews loop + BrandStrip), `Tabs`
pattern/`segStyle` → the rail's segmented control uses real `<button role="tab">`s.

**Page-local sections** (`src/pages/HomePage/` folder; `HomePage.tsx` + `HomePage.module.css` +
`sections/*`): `HomeHero`, `StatBar`, `WhyUs`, `CompareBand`, `ShowroomCta`. These are one-off to the
home page, so they live with the page rather than in `composite/`. (App.tsx import updates from
`./pages/HomePage` to the folder's `index.ts`.)

---

## 4. Config-first optional props (future-proofing)
The DC ConfigPanel exposes controls we reproduce as **optional props with DC-matching defaults**
(never break the minimal call site, never change default visual output):
- `catalogLayout: 'Shelf' | 'Grid'` (default `Shelf`) → `ProductRail.layout`.
- `motion: 'Calm' | 'Dynamic'` (default `Dynamic`) → rail marquee duration (40s/60s), hover lift
  (−6/−2), card shadow, transition duration (.18s/.4s).
- `hoverEffect: 'Lift' | 'Glow' | 'Tilt'` (default `Lift`) → card/category hover transform.
- `accent` is **not** a prop — read from CSS vars (`var(--accent…)`) per project rule, unlike DC's
  threaded hex.

These thread from `HomePage` defaults into `ProductRail`/cards; expose them on `HomePage` props too
so the page outlives its first call site.

---

## 5. Motion & animation (preserve exact values)
Port timings/easings verbatim — motion is deliberate here:
- `reveal`: `opacity/transform .7s cubic-bezier(.2,.7,.2,1)`, threshold `0.12`, unobserve after in
  (our `useReveal` already does this — reuse it, don't re-implement the IntersectionObserver).
- `fadeUp`: `.7s cubic-bezier(.2,.7,.2,1)` on hero.
- `glow`: `6s ease-in-out infinite`, opacity `.55 → .9`.
- `marquee` (reviews): `Dynamic 40s` / `Calm 60s` linear infinite; pause on hover (`data-pause`).
- `tabSwap` / `tabSwapB`: `.32s ease` on rail content when the segment changes.
- `shimmer`: `3.2s linear infinite` on hero/showroom placeholder panels (same keyframe ProductCard
  already uses — reuse the shared keyframe; add any missing keyframes to `global.css`, not inline).
- Respect `prefers-reduced-motion`: pause marquee/glow/shimmer (an upgrade over the DC source).

---

## 6. Accessibility (upgrades over DC)
DC uses div-as-button / drag-only rails. We upgrade while matching visuals:
- Rail segmented control = real `<button role="tab">` in a `role="tablist"`; arrow-key navigation;
  `aria-selected`. Rail track is keyboard-scrollable (focusable cards / arrow keys), not mouse-only.
- Hero/showroom CTAs and category cards are real `<a>`/`<Link>`; visible focus states.
- Each section is a landmark/`<section aria-labelledby>` tied to its heading; single logical heading
  order (h1 hero → h2 sections).
- Stats numbers keep an accessible text value even while `CountUp` animates.
- Icon-only/decorative placeholders marked `aria-hidden`; the `[ CAMPAIGN SHOT ]` labels are decor.

---

## 7. Discrepancies (DC vs project) — resolved
1. **£ prices / London address / fictional brands** → ₹, Bengaluru, real brands (§1d). Content wins
   from data; DC visuals reproduced.
2. **`window`/inline drag & IntersectionObserver** → `useDragScroll` hook + existing `useReveal`.
3. **Accessories rail data** → separate `accessories.ts`; full accessories PLP/PDP deferred (§1a).
4. **Accent threading** → CSS vars, not a hex prop (§4).

---

## 8. File plan
```
src/data/accessories.ts                 (new)  ACCESSORIES + curation helpers
src/data/home.ts                        (new)  hero/stats/categories/whyUs/showroom/compare
src/data/products.ts                    (edit) getBestsellers/getNewArrivals helpers (+ curation flag if needed)
src/components/composite/ProductRail/   (new)  ProductRail.tsx + .module.css + .test.tsx
src/components/composite/CategoryCard/   (new)  CategoryCard.tsx + .module.css + .test.tsx
src/components/composite/index.ts       (edit) export new composites
src/hooks/useDragScroll.ts (+ .test)    (new)
src/pages/HomePage/HomePage.tsx         (new)  replaces flat src/pages/HomePage.tsx
src/pages/HomePage/HomePage.module.css  (new)
src/pages/HomePage/sections/*           (new)  HomeHero, StatBar, WhyUs, CompareBand, ShowroomCta
src/pages/HomePage/index.ts             (new)  default-export barrel
src/pages/HomePage.tsx                  (del)  old scaffold
src/App.tsx                             (edit) import from ./pages/HomePage
src/styles/global.css                   (edit) add any missing keyframes (tabSwap/fadeUp) if absent
tests/contracts/accessories.contract.test.ts  (new)
tests/integration/routing.test.tsx      (edit) home heading assertion updates
```

---

## 9. Verify (this page)
**Automated:** `tsc --noEmit` + `build` + `lint` clean; `npm test` green including the new
ProductRail/CategoryCard/useDragScroll/accessories-contract tests; coverage thresholds hold.

**Functional (browser):**
- Home renders all 13 sections in order with the header/footer/glow.
- Hero CTAs and category cards navigate (Shop offers → `/shop`, etc.).
- Helmets & Accessories rails: **Bestsellers ⇄ New Arrivals** toggle swaps content with `tabSwap`;
  drag-scroll works with mouse/touch and a drag doesn't trigger a card click; keyboard reaches tabs
  and cards.
- Reviews marquee scrolls and pauses on hover.
- **Accent switcher (all 4 presets)** recolors hero badge/CTAs, rail active tab, category arrows,
  glow, review stars — no stale colors.
- Scroll-reveal fires once per section (no re-trigger fl/jank).

**Edge/responsive:**
- Empty rail (no bestsellers/new) shows a graceful empty state, not a broken track.
- Long product names wrap in cards; long review text doesn't break the marquee row height.
- Breakpoints: hero aspect-ratio + category grid change at 480/640/700/1000px per DC; no horizontal
  body scroll at mobile/tablet/desktop.
- `prefers-reduced-motion` pauses looping animation.

**Regression:** header badge/cart, accent persistence, and the Showcase page still pass (shared
primitives/tokens touched).

---

## 10. Out of scope / deferred
- Full accessories **PLP & PDP** (listing, filters, detail). Home only renders accessories in rails.
- Real imagery — hero/showroom/product tiles stay as DC-style placeholder panels (shimmer), no photos.
- "Compare up to 3 helmets" tool is a **static CTA band** only; the comparison feature itself is not
  built here.
