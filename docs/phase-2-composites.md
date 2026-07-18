# Phase 2 — Composites & Layout

**Goal:** port the composite components (built *from* Phase 1 primitives + real data) and the
app shell that wraps every page. After this phase the site has a working header/footer, product
cards, search, and navigation — but the page bodies are still stubs.

**Depends on:** Phase 1. **Blocks:** Phase 3.

---

## Deliverables — `src/components/composite/*`

- **AnnounceBanner** — marquee promo strip. Props: `messages: string[]`, `speed`. Uses the shared
  `marquee` keyframe; pauses on hover.
- **SiteHeader** — sticky header with **desktop + mobile** variants (swap at 800px via
  `useIsDesktop`), logo, nav (real `<Link>`s with active state from the router), account/search/cart
  icon buttons, and a live cart badge from `useCart().count` (with the `cartPop` animation). Props:
  `activePage`, `minimal` (compact "secure checkout" bar for the Checkout page), `showAnnouncement`.
  Opens SlideNav (mobile) and SearchPanel.
- **SlideNav** — full-screen mobile nav overlay. Props: `open`, `onClose`, `items[]`, `active`.
- **SearchPanel** — overlay search with input, trending terms, and live filtered results over the
  `data/products` catalog. Props: `open`, `onClose`, `trending[]`.
- **SiteFooter** — columns + brand line. Props: `columns[] {h, items[]}`, `copyright`, `showLogo`, `maxWidth`.
- **ProductCard** — the catalog tile: placeholder image w/ shimmer, brand/model, price, rating/meta,
  badge, heart, quick-add + `+` add button wired to `useCart().add`. Props from `data/types`
  `Product` + `onAdd?`, `heart?`, `quickAdd?`, `soldOut?`, sizing (`fixedWidth`/`grow`).
- **CartToast** — slide-up "added to cart" confirmation. Props: `visible`, `message`. (May reuse the
  Phase 1 `Toast` primitive under the hood.)
- **BrandStrip** — logo/brand row for the home page. Props: `brands[]`.
- **ReviewCard** — single review (avatar, stars, title, body, verified). Props from `Review`.

## Deliverables — `src/components/layout/`
- **SiteLayout** — `<SiteHeader/>` + `<main><Outlet/></main>` + `<SiteFooter/>`, plus the ambient
  accent `glow`. A `minimal` prop switches to the checkout shell (compact header, no footer nav).
  Consumed by the router as the element wrapping page routes.

## Notes
- Composites hold **layout + data wiring**; primitives stay presentational. If a composite wants a
  behavior a primitive lacks, add it to the primitive as an optional prop (per Phase 1 rules) rather
  than duplicating markup.
- The DC `SiteHeader` subscribed to a `window` cart store; here the badge just reads `useCart()`.
- Pull each DC source (`SiteHeader`, `SiteFooter`, `SlideNav`, `SearchPanel`, `ProductCard`,
  `CartToast`, `BrandStrip`, `ReviewCard`) as it's ported.

## Porting decisions (as-built)
Where the DC source is a prototype hack or conflicts with real-storefront behavior, we upgrade
and note it here (DC visuals are still reproduced faithfully):
- **Accent** is read from CSS vars (`var(--accent…)`), not threaded as an `accent` hex prop like DC.
- **Cart icon** navigates to `/cart` (a `<Link>`), instead of DC's demo `window.ApexCart.add(1)`.
  The live badge still reflects `useCart().count` with the `cartPop` animation.
- **Currency** is `₹` (INR) via `lib/format.ts#formatPrice`, matching `data/products.ts` (localized
  to India) rather than DC's hardcoded `£` — prices are data, not styling.
- **Nav / footer / trending / brands / announcements** are content → `src/data/navigation.ts`.
- **Reused primitives:** `AnnounceBanner` and `BrandStrip` wrap the Phase 1 `Marquee` (its `solid`
  variant is literally the DC announce bar). `CartToast` is standalone to match the DC's centered
  accent-bordered toast exactly.
- **Focus trapping** for SlideNav/SearchPanel lives in a new reusable `hooks/useFocusTrap.ts`
  (Tab-cycle + Escape + restore focus to trigger + body scroll lock), not copied per overlay.
- **App shell:** `App.tsx` wraps routes in `SiteLayout` (normal) / minimal `SiteLayout` (`/checkout`)
  with Phase 3 stub page bodies, so the header/footer/layout can be driven in the browser now.

## Verify
- Header badge updates live when any add-to-cart fires anywhere; badge count persists on reload.
- Desktop ⇄ mobile header swaps exactly at 800px; SlideNav + SearchPanel open/close and trap focus.
- SearchPanel returns correct filtered results from `data/products`.
- Footer + layout render correctly on every route; `minimal` layout works for `/checkout`.
- `tsc --noEmit` + `build` green.
