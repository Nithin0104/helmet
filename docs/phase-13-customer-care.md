# Phase 13 — Customer Care page (`/support`)

**Depends on:** Phase 9 (account menu, `/support` stub route, `/track-order`), Phase 11
(`/account/orders`), Phase 1 (`Accordion`, `Button`, form primitives, `EmptyState`,
`Icon`), existing `Faq` type, `SizeGuideSheet`, `FOOTER_ADDRESS`.

## Goal
Turn the `/support` stub into a real **Customer Care** page: contact channels first, then
self-service quick links, an FAQ built on the `Accordion` primitive, a (stubbed) contact
form, the showroom address, and a small warranty/care card. Also gives the footer's dead
"Support" links a real destination.

## Why
Support is the "I'm stuck / I need a human" surface, and right now the footer's Support
column points at `href="#"` — dead ends. This page is almost entirely **assembly of existing
pieces** (`Accordion` + the `Faq` type, `FOOTER_ADDRESS`, links into Orders / Track Order /
`SizeGuideSheet`) over a mock `support` dataset, plus one new (stubbed) contact form. It also
enforces a policy fact the rest of the account cluster established: **the store has no
returns/exchanges**, so the FAQ must *answer* that clearly rather than let a rider assume
one exists.

## Architecture

### Data — `src/data/support.ts`
Shaped like a real content/FAQ endpoint so it can be swapped for a CMS/API later.
- `SUPPORT_CONTACT` — `{ phone, email, whatsapp?, hours, address }` (address defaults to the
  same `FOOTER_ADDRESS` source — one source of truth, don't fork the showroom address).
- `SUPPORT_FAQS: FaqGroup[]` where `interface FaqGroup { id: string; title: string; faqs: Faq[] }`
  — reuse the existing `Faq` type (`{ id, question, answer }`). Groups: **Orders & shipping ·
  Sizing & fit · Payments · Warranty & care · Account**.
- `SUPPORT_TOPICS` — the contact-form topic options (mirrors the FAQ groups).
- Access looks async-ready (`getSupportContent()` returning the mock now, a fetch later).

### Page — `SupportPage` (`/support`), sections top → bottom
1. **Header + contact channels** — phone / email / WhatsApp / hours as real actionable links
   (`tel:`, `mailto:`, `https:` for WhatsApp) plus the showroom address. This is first
   because it's the highest-intent path; icon per channel (lucide).
2. **Self-service quick links** — Track an order (`/track-order`), My orders
   (`/account/orders`), Sizing & fit (opens `SizeGuideSheet`), Shipping info (FAQ anchor).
   A compact row/grid of link cards that deflect the common questions.
3. **FAQ** ⭐ — the bulk. Each `FaqGroup` is a titled block; each `Faq` an `Accordion` item
   (reuse the primitive, don't hand-roll open/close). **No returns/exchanges** anywhere — a
   Warranty & care entry states the "all sales final / exchange policy" plainly so it's
   answered, not implied. (Optional, ship-if-clean: a client-side FAQ search filtering
   questions, with `EmptyState` on no match — skip if it adds noise.)
4. **Contact form** — "Still need help?": name, email, order # (optional), topic
   (`SUPPORT_TOPICS`), message. Real, validated UI now; **submit is stubbed** — success toast
   / confirmation state, no actual send. Prefill order # / email when arriving from an order
   or while logged in (`useAuth()`), but don't require login.
5. **Warranty & care** — one short card: brief warranty terms + a link into the Spares & Care
   catalog (`/spares-care`).

### Deliberately out
**No live chat** (noise without a backend), no ticket status / history, no returns/RMA
(store doesn't offer it), no static map (address text only).

### Footer wiring
Point the footer "Support" column links (currently `href="#"`) at `/support` and its section
anchors, so the dead links resolve. Keep it data-driven via `navigation.ts` — don't hardcode
in `SiteFooter`.

## Out of scope (deferred / dropped)
Real form submission (email/ticket), live chat, map embed, returns, ticket tracking. Contact
info, quick links, FAQ, form UI, and warranty copy are all this phase.

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- `support` data contract test in `tests/contracts` (contact shape; `FaqGroup`/`Faq` shape;
  topics present; address resolves to the shared `FOOTER_ADDRESS` source).
- `SupportPage` — renders all sections; contact channels have correct `tel:`/`mailto:` hrefs;
  FAQ groups render as accordions and expand/collapse; accessible-name render + `vitest-axe`
  `toHaveNoViolations()`.
- Contact form — required-field validation, topic selection, submit shows the stubbed success
  state without navigating/sending; prefill from `useAuth()` / an order context when present.
- (If search shipped) filtering narrows questions; no-match shows `EmptyState`.

**Browser (mobile / tablet / wide):**
- `/support` loads with contact channels first; phone/email/WhatsApp open the right handler;
  showroom address matches the footer's.
- Quick links resolve: Track order, My orders, Sizing (opens `SizeGuideSheet`), Shipping FAQ.
- FAQ groups expand/collapse via `Accordion`; the no-returns policy is clearly stated; no copy
  implies returns/exchanges exist.
- Contact form validates, submits to the stubbed success state, and prefills order #/email
  when arriving logged-in or from an order.
- Footer "Support" links now navigate to `/support` (+ anchors), no more `#` dead ends.
- Full keyboard pass: channels, accordions, quick links, and every form field reachable and
  operable; Escape closes the `SizeGuideSheet`; focus visible throughout.
- No horizontal scroll at mobile/tablet/wide; long FAQ answers and address wrap cleanly.
- Accent switcher (all 4 presets) recolors accordions, buttons, links, and form focus with no
  stale colors.

**Forward-compat with the backend:** page reads `getSupportContent()` and `useAuth()`;
swapping the mock for a CMS/API of the same shape must not force a rewrite, and the contact
form's stubbed submit is a single seam to replace with a real POST. No section assumes content
is present before first render without an empty/loading path.
