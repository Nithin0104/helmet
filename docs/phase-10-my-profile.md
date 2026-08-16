# Phase 10 — My Profile page (account settings hub)

**Depends on:** Phase 9 (mock `useAuth()`, `src/data/user.ts`, `/account` stub route),
Phase 1 (Button, Card, Checkbox, Accordion, Icon), Phase 3 (Checkout — Addresses feed it).

## Goal
Turn the `/account` stub into the real **My Profile** page: a single scrolling page of
cards covering **Profile header · Personal details · Addresses · Security · Communication
preferences · Danger zone**. Addresses is built for real (it feeds Checkout); Security and
account deletion are UI stubs the backend phase fills in.

## Why
`My Profile` is the account **settings** hub — the "your stuff" page for everything that
isn't Orders or Wishlist (those are their own menu items and must not be duplicated here).
The one section with real, buildable-now payoff is **Addresses**: a returning buyer saving
an address here removes typing at Checkout, and it reuses the address shape Checkout already
needs — so building it now pins that contract down before the backend phase. The rest is
field editing (Personal details, Comms toggles) or a slot the backend later makes real
(Security, deletion). Explicitly **not** here: Fit Profile and Payment methods (dropped),
and full order/wishlist lists (they live behind their own routes).

## Layout
**Single scrolling page of cards**, not a sidebar-and-panels settings shell. With Fit
Profile and Payments gone there are few enough sections that one page is simpler, reads
cleanly on mobile, and needs no section-nav to build. Each section is a `Card`; the page
uses `PageShell` like the other account routes. Graduate to sidebar-and-panels only if
Security/Payments grow real in the backend phase — not now.

## Architecture

### Data / seam
- Extend `AuthUser` (from phase 9) or add a sibling `src/data/user.ts` profile shape with
  the fields these sections edit: `phone?`, `dob?`, `addresses: Address[]`, `comms:
  CommsPrefs`. Keep it shaped like a real `GET /me` response so an async fetch drops in
  later without a component rewrite.
- `interface Address { id: string; label?: string; name: string; line1: string; line2?: string; city: string; state: string; postcode: string; country: string; phone?: string; isDefault: boolean }`
  — this is the **same shape Checkout consumes**; define it once and share it, don't fork a
  second address type.
- `interface CommsPrefs { orderUpdates: boolean; backInStock: boolean; promotions: boolean }`.
- Mutations persist through the auth/profile context to `localStorage` (mirror
  `CartContext`'s effect-write + safe read), so edits survive refresh and tolerate
  empty/corrupted storage. `orderUpdates` is effectively always-on (transactional) — render
  it disabled/locked rather than a free toggle.

### Sections (each a `Card` on the page)
1. **Profile header** — avatar (upload / initials fallback), name, email, single Edit
   affordance. Avatar upload is client-only preview for now (no real storage).
2. **Personal details** — name, phone, DOB (optional); email shown read-ish with a "change
   email needs verification" note (verification is backend-later — the field edits mock
   state now).
3. **Addresses** ⭐ (real) — list saved addresses; add / edit / delete; set default (exactly
   one default, enforced in the mutation). Empty state when none saved. This is the section
   that must be genuinely functional, not a stub.
4. **Security** (stub UI) — Change password, 2FA toggle, active sessions / "log out
   everywhere". Render the controls; wire only what's local (e.g. the logout action);
   password/2FA/sessions show a "coming soon"/disabled state — no real auth this phase.
5. **Communication preferences** — toggles for order updates (locked on), back-in-stock
   alerts, promotions. Persist to the profile store.
6. **Danger zone** — Delete account / Download my data as a visually separated destructive
   slot; confirmation UI now, no real deletion.

### Component structure
Break the page into co-located composites rather than one giant file:
`ProfileHeaderCard`, `PersonalDetailsCard`, `AddressBookCard` (+ an `AddressForm` /
`AddressRow`), `SecurityCard`, `CommsPrefsCard`, `DangerZoneCard` — each one folder,
`Component.tsx` + `.module.css`, exported via the composite barrel. Reuse existing
primitives (Card, Button, Checkbox/Toggle, Accordion, Icon, EmptyState); don't hand-roll
form controls that already exist.

### Routing
`/account` now renders `MyProfilePage` (was a stub in phase 9). No new routes required;
Orders (`/account/orders`) and Wishlist (`/account/wishlist`) stay separate.

## Out of scope (deferred)
Real email-change verification; real password change / 2FA / session management; real
account deletion + data export; server-side avatar storage; Fit Profile and Payment methods
(dropped entirely). Order-history and wishlist grids stay behind their own routes — at most
a small "recent orders" glance-link, not a list.

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- Profile/address store — add/edit/delete address, exactly-one-default invariant, comms
  toggle persistence, `localStorage` hydration (present / empty / corrupted). Mirror
  `CartContext.test`.
- `AddressBookCard` / `AddressForm` — validation (required fields, postcode), controlled
  add/edit, default selection, empty state; accessible-name render + `vitest-axe`
  `toHaveNoViolations()`.
- Each card composite — renders its fields; locked `orderUpdates` toggle can't be turned
  off; stubbed Security controls render disabled.
- `user`/profile data contract test in `tests/contracts` (shape guarantee).

**Browser (mobile / tablet / wide):**
- `/account` (logged in) shows all six cards in order; logged-out access redirects to
  login / the account menu (no profile for anon users).
- Add an address → appears in the list, feeds Checkout's saved-address picker; edit and
  delete work; setting a new default clears the old one; empty state shows with zero
  addresses.
- Personal details edits persist across refresh; email shows the verification note.
- Comms toggles persist; order-updates toggle is visibly locked on.
- Security/Danger controls render as disabled/"coming soon" without throwing.
- Full keyboard pass: every field, toggle, and button reachable and operable; focus visible;
  Escape closes any address edit modal/sheet and returns focus to the trigger.
- No horizontal scroll at mobile/tablet/wide; long names/addresses wrap, don't overflow.
- Accent switcher (all 4 presets) recolors buttons, toggles, default badge, and the danger
  slot with no stale colors.

**Forward-compat with the backend:** every section reads the profile through the
context/`src/data/*` seam; swapping mock data for an async `GET /me` of the same shape must
not force a rewrite, and no card assumes data is present before first render without a
loading/empty state. The `Address` shape is the single one Checkout also uses.
