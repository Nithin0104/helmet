# Phase 3 — Cart Page (`/cart`)

Sub-step of [phase-3-pages.md](./phase-3-pages.md): the live shopping-bag page, ported from the
DC source **Helmet Cart.dc.html** (DesignSync project `6fb6200b…`). The `/cart` route was a
`PageShell` placeholder; this step makes it real and fills the component-library gaps the design
exposes.

## Goal

A config-driven, mobile-first Cart page that reads live `useCart()` state: line items with
qty/save/remove, an order summary with promo + totals, free-shipping progress, saved-for-later,
suggested add-ons, an empty state, undo-on-remove, and a mobile sticky checkout bar. Checkout
navigates to the existing `/checkout` route.

## New library components (DC `get_file` is the visual/behaviour spec)

| Component | Tier | Reuses | Notes |
| --- | --- | --- | --- |
| `CartLineItem` | composite | `QtyStepper` | image tile, brand/model, colour+size chips, stock line, ETA, qty stepper, Save/Remove icon buttons (real `<button>` + `aria-label` + tooltip). `saved` variant hides stepper/ETA, flips Save → "Move to bag". |
| `OrderSummary` | composite | `TextInput`, `TrustList` | collapsible promo input + APPLY, summary rows, big total, checkout CTA (spinner), pay-method chips, trust rows. |
| `FreeShipMeter` | composite | — | "Add ₹X for free delivery" / unlocked, progress bar (turns `--success` when met). |
| `MobileCheckoutBar` | composite | — | fixed bottom bar, tap-to-expand breakdown (scrim), total + CTA. Keyboard-operable toggle, Escape collapses. |
| `UndoToast` | composite | — | `role="status"` snackbar, message + UNDO action. |

Design-system rules: single `…Props` interface, minimal required props, everything else optional
with safe defaults + `className`/`style` escape hatch. **No `accent` colour prop** — we use the
global `[data-accent]` theme via `var(--accent)` (the DC threads an accent hex; that's the one
deliberate divergence). Preserve DC animation timing/easing exactly; add `prefers-reduced-motion`
guards. No hardcoded hex/px where a token exists.

## State + logic

- **`src/data/cart.ts`** — `FREE_SHIP_THRESHOLD` (4999), `FLAT_SHIPPING` (249), `GST_RATE` (0.18),
  `PROMOS` (RIDE10 10%, APEX15 15%), `PAY_METHODS`, `CART_TRUST`, `DEFAULT_ETA`, `SUGGESTED_LIMIT`.
- **`src/lib/cart.ts`** — pure: `computeTotals(subtotal, promoCode)`, `buildSummaryRows(totals, promoCode)`,
  `toDisplayLine(line)` (enrich via `getProduct`/`getAccessory` → type/colourHex/stock/eta, degrades
  gracefully), `getSuggested(lines, catalog, limit)`.
- **`src/cart/CartContext.tsx`** — add persistent `saved: CartLine[]` (key `apex_saved`) +
  `save`/`moveToBag`/`removeSaved`. Existing API untouched.

## Page

`src/pages/CartPage/` — `CartPage.tsx` + `.module.css` + `index.ts` + `sections/{SuggestedRail,SavedForLater}.tsx`.
Renders inside the existing `SiteLayout` (no duplicate header/footer). Desktop 2-col sticky-summary
grid at ≥900px; single column on mobile. Undo is page-local (6s timer). Mobile bar shows when the
summary is off-screen (`useOffscreen`). Suggested rail uses `useDragScroll` + prev/next.

## Verify

- `npm run build`, `npm run lint`, `npm test`, `npm run coverage` all green.
- Each new component: accessible-name render test + `vitest-axe` no-violations; interactive ones get
  controlled/boundary coverage. `src/lib/cart.test.ts` covers totals/promo/free-ship boundary/enrichment.
  `CartContext.test.tsx` covers saved-for-later persistence + corrupt storage. Cart-flow integration test.
- Browser: accent switcher (all 4) recolours with no stale colour; empty bag; single vs many items;
  qty min/max; out-of-stock; promo invalid→valid; long names wrap; refresh persists cart **and** saved;
  keyboard pass (tab/Escape/focus); responsive 1-col→2-col with no horizontal scroll; mobile bar only
  when summary off-screen. DC source wins on any visual discrepancy — flag divergences.
