# Phase 11 — Orders (list + detail, guest Track Order)

**Depends on:** Phase 9 (mock `useAuth()`, `/account/orders` + `/track-order` stub routes),
Phase 10 (`Address` shape), Phase 2/3 (Badge, EmptyState, CartLineItem, OrderSummary,
PageShell, CartContext for Buy again).

## Goal
Turn the `/account/orders` stub into a real **Orders list** plus an **Order detail** page
at `/account/orders/:id`, driven by mock order data. The detail view is shared with the
guest **Track Order** route. No returns/exchanges anywhere.

## Why
Orders is where a buyer confirms "did it ship, when does it arrive" — the top return-visit
reason for a store, and the whole point of the guest Track Order entry we already added in
phase 9. It's mostly **assembly of composites that already exist** (`Badge`, `EmptyState`,
`CartLineItem`, `OrderSummary`) over a mock `orders` dataset, so it's cheap to build and it
pins down the order/shipment contract the backend later satisfies. **Buy again** is the one
action that genuinely works now — it just adds lines to the existing cart — and it's the
right helmet-store affordance (riders rebuy visors/liners/spares far more than whole
helmets, so per-item beats whole-order reorder). Returns/Exchange is **out** — the store
doesn't offer it.

## Architecture

### Data / seam — `src/data/orders.ts`
Mock dataset shaped like a real `GET /orders` + `GET /orders/:id`, so an async fetch drops
in later without a component rewrite.
- `type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'`.
- `interface OrderItem { productId: string; name: string; brand: string; image: string; color?: string; size?: string; qty: number; price: number }`.
- `interface Order { id: string; number: string; placedAt: string; status: OrderStatus; items: OrderItem[]; shipping: Address; totals: OrderTotals; tracking?: { carrier: string; number: string; url?: string }; canCancel: boolean }`
  — `Address` is the **same shape from phase 10** (shared, not forked); `OrderTotals`
  mirrors what `OrderSummary` already renders.
- Access looks async-ready: `getOrders()` / `getOrder(id)` returning the mock now, a fetch
  later. Include fixtures across every status (incl. an empty-history user) so all states
  are drawable.

### Orders list — `/account/orders`
- One row/card per order: number, `placedAt` date, **status badge**, stacked item
  thumbnails, item count, total, and a primary action (Track / View).
- Status → `Badge` variant mapping (Processing · Shipped · Out for delivery · Delivered ·
  Cancelled). Define the mapping once (a small helper), reuse it in list + detail.
- **Empty state** via `EmptyState` — "No orders yet → Shop helmets".
- Newest first. Filters/search are **out of scope** for v1.

### Order detail — `/account/orders/:id`
- **Status timeline / tracking** — ordered → shipped → out for delivery → delivered, with
  the current status highlighted; show `tracking.number` + carrier (link if `tracking.url`).
  A cancelled order shows the cancelled state, not the progress rail.
- **Items** — each rendered in the `CartLineItem` visual language (thumbnail, name,
  color/size, qty, price) with per-item **Buy again** and **Write a review**.
- **Shipping address** — from `order.shipping` (the shared `Address`).
- **Order summary / totals** — reuse the `OrderSummary` composite.
- **Actions:** **Cancel order** (rendered only when `canCancel` — i.e. not yet shipped),
  **Download invoice**, **Get help with this order**.

### Buy again (works for real)
Per-item action calls `useCart().add(...)` with the order line's product/color/size, then a
cart toast (reuse `CartToast`). Whole-order reorder is intentionally **not** provided.

### Guest Track Order — `/track-order`
- Simple lookup: order number + email (guest checkout has no account). On a match, render
  the **same Order detail view** (extract it as a shared component the route and the account
  page both mount), scoped to what a guest may see. No login required.

### Routing
- `/account/orders` → `OrdersListPage` (logged-in; anon redirects to login/account menu).
- `/account/orders/:id` → `OrderDetailPage`.
- `/track-order` → `TrackOrderPage` (lookup → shared detail view). Replaces the phase-9 stub.

## Out of scope (deferred / dropped)
**Dropped entirely:** Returns / Exchange / RMA (store doesn't offer it). **Backend-later,
stubbed now:** real carrier tracking, real cancel, invoice PDF generation, "Get help"
ticketing. **Skipped for v1:** list filters/search, whole-order reorder.

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- `orders` data contract test in `tests/contracts` (shape guarantee; `Address` matches
  phase 10; totals match `OrderSummary`'s expected props).
- Status→badge mapping helper — one case per status.
- `OrdersListPage` — renders a row per order, newest first, empty state at zero orders.
- `OrderDetailPage` — timeline highlights the right step per status; cancelled shows the
  cancelled state; Cancel button appears only when `canCancel`; Buy again adds the line to
  the cart and fires the toast; accessible-name render + `vitest-axe`
  `toHaveNoViolations()`.
- `TrackOrderPage` — match renders the shared detail; no-match shows a not-found message.

**Browser (mobile / tablet / wide):**
- `/account/orders` (logged in) lists orders with correct badges/thumbnails/totals; empty
  state shows for the zero-order fixture; anon access redirects.
- Open an order → detail shows the timeline at the right step, items, address, summary; a
  shipped order hides Cancel; a processing order shows it.
- **Buy again** adds the item to the cart (badge increments, toast fires) and the cart shows
  the right product/color/size.
- Download invoice / Get help render as stubbed actions without throwing.
- `/track-order` — valid number+email renders the same detail view; invalid shows
  not-found; no login required.
- Full keyboard pass: list rows, detail actions, and the track-order form all reachable and
  operable; focus visible; Escape closes any toast/help affordance.
- No horizontal scroll at mobile/tablet/wide; long product names and many items wrap/stack
  cleanly.
- Accent switcher (all 4 presets) recolors badges, timeline, primary actions, and the toast
  with no stale colors.

**Forward-compat with the backend:** list and detail read through `getOrders()`/
`getOrder(id)`; swapping the mock for an async fetch of the same shape must not force a
rewrite, and no view assumes data is present before first render without a loading/empty
state. The order's `Address` is the single shape shared with Profile and Checkout.
