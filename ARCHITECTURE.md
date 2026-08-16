# APEXLINE Helmet Showroom — Frontend Architecture Plan

## Context

The Claude Design project **"Helmet showroom ecommerce design"** contains a full helmet
e‑commerce design system authored in Claude's proprietary **"DC" format** — HTML templates
with `{{ }}` interpolation, `sc-if`/`sc-for` control flow, `style-hover`/`style-active`
pseudo‑states, `dc-import` composition, and a `DCLogic` class exposing a `renderVals()` method.
It has three tiers:

- **~29 primitives** — Button, ActionButton, Chip, Card, Tabs, Breadcrumbs, Pagination, Modal,
  Tooltip, BottomSheet, TextInput, Toggle, Checkbox, SearchBar, ColorSwatch, RangeSlider,
  Accordion, Badge, StatCard, Rating, QtyStepper, Skeleton, Spinner, ProgressBar, Toast,
  Carousel, HoverZoom, CountUp, Marquee.
- **Composites** — SiteHeader, SiteFooter, ProductCard, SearchPanel, SlideNav, CartToast,
  AnnounceBanner, BrandStrip, ReviewCard, StatCard, ConfigPanel.
- **5 pages** — Home, PLP (product listing), PDP (product detail), Cart, Checkout.

Shared logic lives in `cart-store.js` (a `window` pub/sub + `localStorage` cart‑count store)
and `support.js` (the DC runtime).

The local repo is empty apart from `LICENSE` and git. The goal is to **port** (not mechanically
convert) this design into a genuine, modern React frontend that faithfully reproduces the visuals
and motion, structured as a real component‑driven design system. This is also a **learning
project** — the plan favors approaches that teach transferable frontend fundamentals, and each
foundation notes *why*.

**Decisions locked with the user:** TypeScript · Vite + React Router (client SPA, frontend‑only) ·
CSS variables + CSS Modules · build the design system first, then assemble the pages.

## The design language (extracted from the DC sources)

- **Palette** — bg `#08080a`/`#0b0b0d`; surfaces `#101012`/`#0e0e10`/`#141417`; hairline borders
  `rgba(255,255,255,.09)`; text `#f4f3f1`; muted `#9a9aa0`/`#8a8a8f`; dim `#6a6a70`/`#4d4d54`;
  gold (ratings) `#c9a227`; success green `#1F9D55`; danger `#c0392b`.
- **Accent (themeable)** — 4 presets, each with a `hover` + `shadow` companion:
  - `#FF3B24` → `#ff5a44` / `rgba(255,59,36,.45)` (default red)
  - `#2E6BFF` → `#5a8bff` / `rgba(46,107,255,.45)` (blue)
  - `#FF9B24` → `#ffb454` / `rgba(255,155,36,.45)` (orange)
  - `#8B5CF6` → `#a684fa` / `rgba(139,92,246,.45)` (purple)

  Every component receives `accent` as a prop today.
- **Type** — `Archivo` (400–900) for UI/headings, `Space Mono` (400/700) for labels, prices, tags.
- **Motion** — heavy and intentional: `shimmer` (skeleton/product tiles), `glow` (ambient radial),
  `marquee` (announce bar), scroll‑reveal via `IntersectionObserver`, cart‑badge pop, checkmark pop
  on add‑to‑cart, spinners, pulse rings. Reproduced as CSS `@keyframes` + a couple of hooks.

## Target architecture

### Stack
Vite + React 18 + TypeScript · React Router v6 · CSS Modules + a global tokens layer ·
Context for cross‑cutting state · plain mock‑data modules (no backend this phase).

### Folder structure
```
src/
  main.tsx                # Router + providers mount
  App.tsx                 # <Routes>, shared <SiteLayout> shell
  styles/
    tokens.css            # :root design tokens (colors, surfaces, radii, fonts) as CSS vars
    accents.css           # per-accent --accent / --accent-hover / --accent-shadow (data-accent themes)
    global.css            # reset, body bg, font imports, shared @keyframes + .reveal/.shim helpers
  theme/
    accents.ts            # ACCENTS map (base/hover/shadow) — single source of truth, typed
    ThemeContext.tsx      # useTheme(): current accent + setAccent; sets data-accent on <html>
  cart/
    CartContext.tsx       # line-item cart, localStorage-persisted; add/remove/setQty/subtotal/count
  hooks/
    useReveal.ts          # IntersectionObserver scroll-reveal (replaces the DC setupReveal)
    useMediaQuery.ts      # desktop/mobile split the header needs
  data/
    types.ts              # Product, Color, SizeOption, Review, Faq, CartLine …
    products.ts           # catalog (Velocity RS Carbon + the PLP/related set) from DC mock data
    reviews.ts, faqs.ts   # extracted PDP content
  components/             # THE DESIGN SYSTEM (tier 1 + tier 2)
    primitives/
      Button/ Button.tsx + Button.module.css
      Chip/ Card/ Badge/ Tabs/ Breadcrumbs/ Pagination/ Modal/ Tooltip/ BottomSheet/
      TextInput/ Toggle/ Checkbox/ SearchBar/ ColorSwatch/ RangeSlider/ Accordion/
      StatCard/ Rating/ QtyStepper/ Skeleton/ Spinner/ ProgressBar/ Toast/ Carousel/
      HoverZoom/ CountUp/ Marquee/ ActionButton/     (each = Component.tsx + .module.css)
      index.ts            # barrel export
    composite/
      SiteHeader/ SiteFooter/ ProductCard/ SearchPanel/ SlideNav/ AnnounceBanner/
      CartToast/ BrandStrip/ ReviewCard/
    layout/
      SiteLayout.tsx      # header + <Outlet/> + footer; `minimal` variant for checkout
  pages/
    HomePage.tsx  ShopPage.tsx (PLP)  ProductPage.tsx (PDP)  CartPage.tsx  CheckoutPage.tsx
    ShowcasePage.tsx      # renders every primitive with variants (our "Design System" index)
```

### Foundations (build first — everything else depends on these)

1. **Design tokens → `styles/tokens.css` + `accents.css`.**
   Port the palette to CSS custom properties on `:root`. Model the accent exactly as the design
   already does — as CSS variables (`--accent`, `--accent-hover`, `--accent-shadow`) — but swap them
   by setting `data-accent="red|blue|orange|purple"` on `<html>` (rules in `accents.css`).
   *Why:* the DC files thread `accent` through every component as a prop and recompute a hover/shadow
   map in each file; CSS variables let a component just write `background:var(--accent)` and inherit the
   theme, deleting that repetition. `theme/accents.ts` keeps the same map typed for any JS that needs
   the literal hex (e.g. inline SVG fills).

2. **`ThemeContext`** — holds the active accent key, exposes `setAccent`, writes `data-accent` to
   `<html>`. Replaces passing `accent="…"` into every component. The Showcase page gets the accent
   switcher (the DC "global accent" swatches).

3. **`CartContext`** — the DC `cart-store.js` only tracks a *count*; the Cart and Checkout pages need
   real **line items**. Design a typed cart (`{ productId, color, size, qty, price }[]`) with
   `add/remove/setQty`, derived `count`/`subtotal`, persisted to `localStorage` (keeping the DC
   persistence idea) and hydrated on load. The header badge subscribes via `useCart().count` — the same
   "badge stays in sync everywhere" behavior, done idiomatically with Context instead of `window` events.
   *Why:* teaches the canonical React state-sharing pattern and where global state belongs.

4. **Motion** — move all `@keyframes` (`shimmer`, `glow`, `marquee`, cart pop, `checkPop`, `spin`, pulse
   rings) into `global.css`; port the `IntersectionObserver` reveal into `hooks/useReveal.ts`
   (`const ref = useReveal()` → adds `.in` when in view).
   *Why:* effect logic belongs in reusable hooks, not copied into every page's lifecycle as the DC files do.

5. **Data layer** — lift the inline arrays from the DC pages (COLORS, SIZES, SPECS, REVIEWS, FAQS,
   RELATED, the PLP catalog) into typed modules under `data/`. Pages/components consume typed data
   instead of hardcoding it.
   *Why:* separates content from presentation — the point of a component library.

### Porting method: DC → React (the repeatable recipe)

Each DC file becomes one component folder. The mechanical mapping:

| DC construct | React equivalent |
| --- | --- |
| `data-props` JSON schema | the component's `Props` TypeScript interface |
| `renderVals()` return values | `props`, `useState`, and derived consts in the function body |
| `{{ label }}` | `{label}` |
| `sc-if value` | `{cond && …}` / conditional render |
| `sc-for list as x` | `list.map(x => …)` |
| `style="{{ x }}"` inline strings | a `.module.css` class (static) + CSS vars for dynamic bits |
| `style-hover` / `style-active` | `.class:hover` / `.class:active` in the module CSS |
| `this.setState` | `useState` setters |
| `componentDidMount` effects | `useEffect` / a hook |
| `window.ApexCart` | `useCart()` |

**Worked example — `Button` (the pattern for all primitives):**
`Props = { variant: 'lift'|'fill'|'shine'|'ghost'|'icon'|'press'|'danger'; label?: string }`.
Seven variants → seven CSS module classes; the accent/hover/shadow come from `var(--accent…)` so no
per‑accent JS map is needed; hover & active states become `:hover`/`:active` rules (e.g.
`.lift:hover{transform:translateY(-3px);background:var(--accent-hover);box-shadow:0 12px 28px var(--accent-shadow)}`).
The `danger` pulse ring reuses the shared `@keyframes`. This recipe covers every primitive.

### Phased build order

- **Phase 0 — Scaffold & foundations:** `npm create vite@latest . -- --template react-ts`; add
  React Router; create `styles/*`, `theme/*`, `cart/*`, `hooks/*`, `data/*`; wire providers in
  `main.tsx`; import the two Google fonts. Get a blank themed shell rendering.
- **Phase 1 — Primitives** (`components/primitives/*`) built against a **`ShowcasePage`** (our port
  of the DC "APEXLINE Design System" index) so each is visually verified in isolation with its
  variants + the accent switcher. This is the bulk and the highest‑learning phase.
- **Phase 2 — Composites** (`SiteHeader`, `SiteFooter`, `ProductCard`, `SearchPanel`, `SlideNav`,
  `AnnounceBanner`, `CartToast`, `BrandStrip`, `ReviewCard`) + `SiteLayout`. Header wires real routing
  (`<Link>`), `useMediaQuery` for desktop/mobile, `useCart` badge, and the `minimal` checkout variant.
- **Phase 3 — Pages** assembled from the library: `HomePage`, `ShopPage` (PLP w/ filters, sort,
  pagination), `ProductPage` (PDP: gallery, color/size selectors, qty, tabs, FAQ, reviews, related,
  add‑to‑cart flow), `CartPage`, `CheckoutPage`. Routes: `/`, `/shop`, `/product/:id`, `/cart`,
  `/checkout`, `/showcase`.

Each remaining DC source is pulled (via the design MCP `get_file`) as it is ported, so no visual detail
is lost — this document captures the architecture; exact markup/data is read per‑component at build time.

## Verification

- `npm run dev` after Phase 0 → blank themed shell paints (correct bg, fonts, no console errors);
  `npm run build` + `tsc --noEmit` stays green throughout.
- **Phase 1:** `/showcase` renders every primitive; toggling the accent switcher recolors all of them
  (proves the CSS‑variable theming); hover/press/motion match the DC previews.
- **Phase 2:** header badge increments live when any add‑to‑cart fires; slide nav + search panel
  open/close; mobile vs desktop header swaps at the 800px breakpoint; footer + layout correct on every route.
- **Phase 3:** end‑to‑end flow — browse `/shop` → open a PDP → pick colour/size, add to cart (badge
  updates, toast fires) → `/cart` shows the line item with qty controls + subtotal → `/checkout`
  (minimal header). Verify by driving the app in a browser, not just tests.
- Responsive + `localStorage` cart persistence across reloads confirmed manually.

## Open follow-ups (not blocking this frontend phase)

- Product **images** are placeholder tiles in the design (dashed‑gradient swatches); we reproduce those
  faithfully now and can swap in real assets later.
- No backend/API this phase (per "focus fully on frontend"); `data/*` is the seam where a real API drops in later.
