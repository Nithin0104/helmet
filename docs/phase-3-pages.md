# Phase 3 — Pages

**Goal:** assemble the five store pages from the Phase 1 primitives + Phase 2 composites, wire the
router, and prove the end-to-end shopping flow. Pages should be thin — mostly layout + data from
`src/data/*` + components.

**Depends on:** Phase 2.

---

## Routes (`App.tsx`)
| Path | Page | Layout |
| --- | --- | --- |
| `/` | HomePage | SiteLayout |
| `/shop` | ShopPage (PLP) | SiteLayout |
| `/product/:id` | ProductPage (PDP) | SiteLayout |
| `/cart` | CartPage | SiteLayout |
| `/checkout` | CheckoutPage | SiteLayout `minimal` |
| `/showcase` | ShowcasePage | none (dev/design reference) |
| `*` | NotFound → redirect `/` | — |

## Pages

- **HomePage** — hero (accent glow, headline, CTAs), BrandStrip, featured product rails
  (`ProductCard`), category cards, stats (`StatCard`/`CountUp`), marquee, scroll-reveal sections.
- **ShopPage (PLP)** — filter sidebar/sheet (type, brand, price via `RangeSlider`, `Checkbox`,
  `Chip`), sort control, responsive product grid, `Pagination`. Reads/derives from `data/products`;
  filters/sort in URL search params or local state. On mobile, filters open in a `BottomSheet`.
- **ProductPage (PDP)** — image gallery (hero + thumbnail strip driven by `product.views`/`colors`),
  brand/name, `Rating`, price, ColourSwatch selector, size grid (stock/low/sold-out states),
  `QtyStepper`, add-to-cart flow (loading→done→toast, `useCart().add`), `Tabs`
  (Description/Specs/Reviews), FAQ `Accordion`, review summary + `ReviewCard`s, related rail.
  Data via `getProduct(params.id)`; 404 → redirect. This is the richest page — port its DC source closely.
- **CartPage** — line items from `useCart()` (image, name, variant, `QtyStepper`, remove), order
  summary (subtotal/shipping/total), promo input, empty-cart state, checkout CTA → `/checkout`.
- **CheckoutPage** — `minimal` layout; multi-section form (contact, shipping, payment) using
  `TextInput`/`Checkbox`, order summary from cart, `ProgressBar` for steps, place-order → success +
  `clear()`.

## Verify (end-to-end)
- Browse `/shop`, apply a filter + sort → grid updates + pagination works.
- Open a PDP → pick colour/size → qty 2 → add to cart: badge increments by 2, toast fires.
- `/cart` shows the exact line with variant + qty controls; changing qty updates subtotal;
  remove empties correctly.
- `/checkout` (minimal header) → place order → success, cart cleared.
- Reload mid-flow: cart + accent persist (localStorage).
- Responsive at 800px and below; no horizontal body scroll; `tsc --noEmit` + `build` green.
- Drive it in a real browser (the `/run` skill), not just types.

## Done = definition
All five routes navigable from the header, full add→cart→checkout loop works, theming switch recolors
the whole site, and the Showcase page still renders every primitive.
