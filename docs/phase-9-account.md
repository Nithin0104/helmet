# Phase 9 — Account Menu (Profile dropdown + mock auth)

**Depends on:** Phase 2 (SiteHeader, SiteLayout), Phase 1 (BottomSheet, Badge, Button,
Icon), Phase 3 (CartContext pattern to mirror).

## Goal
Turn the dead **Account** icon in `SiteHeader` into a real, two-state **Account menu**:
a desktop anchored dropdown / mobile bottom sheet that shows **Login / Signup + Track
Order** when logged out, and a greeting + **My Profile · Orders · Wishlist · Customer
Care · Logout** when logged in. Backed by a **mock `useAuth()`** so both states are
buildable now and the auth contract is defined before the backend phase.

## Why
The header's `User` button (`SiteHeader.tsx`, `aria-label="Account"`) currently has no
`onClick`, no menu, no route — it's a visual placeholder. The store already speaks the
"trigger opens a panel" language (`SlideNav`, `SearchPanel`), so an account menu fits the
existing vocabulary. Building it now, on mock data, does the same job `src/data/*` does
for the catalog: it **pins down the user / orders / wishlist contract** the real backend
will later satisfy, instead of discovering that shape during the backend phase and
rewriting the header. Guest **Track Order** matters because most first helmet purchases
are guest checkouts — those buyers return with no account and need a way in.

## Architecture

### Mock auth seam — `src/auth/AuthContext.tsx`
Mirror `CartContext` exactly (provider + `useAuth()` hook + `localStorage` hydration, same
try/catch-safe read, same "throw if used outside provider" guard). This is the seam a real
auth API drops into later — shapes should already look like what a real session endpoint
returns.

- `STORAGE_KEY = 'apex_auth'`.
- `interface AuthUser { id: string; name: string; email: string; avatarUrl?: string }`.
- `interface AuthContextValue { user: AuthUser | null; isLoggedIn: boolean; login: (email: string) => void; logout: () => void }`
  — `login` resolves a mock user from `src/data/user.ts` (no real credentials — Login/Signup
  is a stub that just flips state; **entering real passwords is out of scope** and stays a
  backend-phase concern).
- `wishlistCount` is **derived**, not stored here — read it from the existing saved/wishlist
  source (`useCart().saved` for now, or a dedicated wishlist store if this phase adds one)
  so there's one source of truth.
- Provider added alongside `CartProvider` in the app's provider tree.

### Mock data — `src/data/user.ts`
A `MOCK_USER: AuthUser` (name/email/avatar) as the stand-in the future `GET /me` returns.
Keep it in `src/data/*` per the "content is data" rule — never hardcode the name in the
component.

### Component — `AccountMenu` (composite)
**One** component driven by `isLoggedIn`, not two designs. Ported from the Claude-Design
(DC) source per the porting recipe — the DC source owns visuals/behavior; this doc owns
architecture and the props contract.

**`AccountMenuProps` (maps from the DC `data-props`):**
- `open: boolean`, `onClose: () => void` — controlled by `SiteHeader` (matches `SlideNav`/
  `SearchPanel`).
- `loggedIn: boolean` — from `useAuth().isLoggedIn`.
- `userName?: string`, `userEmail?: string`, `avatarUrl?: string` — greeting header.
- `wishlistCount?: number` — badge next to Wishlist (reuse the cart-badge visual language).
- Handlers: `onLogin`, `onSignup`, `onTrackOrder`, `onLogout` (or plain `<Link>` routes for
  the navigational rows).
- `className` escape hatch.

**Rows & grouping (draw dividers as real elements so the port keeps the grouping):**
- Logged out: **Login** (primary) · **Signup** (secondary/link) · **Track Order**.
- Logged in:
  - greeting header (name + email)
  - My Profile · Orders · Wishlist *(with count badge)*
  - ─── divider ───
  - Customer Care
  - ─── divider ───
  - Logout *(isolated at the bottom so it isn't mis-clicked)*
- Row icons (lucide): `User`, `Package`, `Heart`, `LifeBuoy`, `LogOut`; trigger stays `User`.

**Responsive container:** design/port the **dropdown content** only; render it inside an
anchored popover on desktop and reuse the existing **`BottomSheet`** primitive on mobile
(same 800px swap the header already uses). Don't redraw the sheet.

**Accessibility (not optional even if the DC source lacks it):**
- Trigger is a real `<button>` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- Menu uses `role="menu"` / `role="menuitem"` (or a plain nav list of links/buttons —
  pick one and be consistent); every row is a real `<button>`/`<a>`, keyboard-operable.
- **Escape** closes and returns focus to the trigger; click-outside closes; focus is
  trapped/visible while open. Follow the existing `SearchPanel`/modal pattern.
- Wishlist count badge has an accessible label (e.g. `aria-label="Wishlist, 3 saved"`).

### Wiring — `SiteHeader`
- Add `const { isLoggedIn, user, logout } = useAuth();`
- Replace the inert Account `<button>` with the trigger that toggles `accountOpen` state
  (same `useState` + open/close pattern as `navOpen`/`searchOpen`; opening Account closes
  the others, as `openSearch` already does).
- Render `<AccountMenu … />` after `<SearchPanel … />`.

### Routes (stubs this phase, real pages later)
Add placeholder routes inside the `SiteLayout` group in `App.tsx`, each rendering a simple
`PageShell` stub fed by mock data so the links resolve:
`/account` (My Profile) · `/account/orders` · `/account/wishlist` · `/support` (Customer
Care) · `/track-order`. Deep account-page content (order detail, returns, fit profile,
addresses) is **out of scope** — later phases.

## Out of scope (deliberately deferred)
Real authentication / passwords / sessions; signup form validation; payment methods;
addresses; order detail + returns/exchanges; the "My Garage / Fit profile" feature. This
phase ships the **menu, the two states, the mock seam, and stub routes** — nothing that
needs a backend.

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- `AuthContext` — login sets user + `isLoggedIn`, logout clears, `localStorage` hydration
  (present / empty / corrupted), throws outside provider (mirror `CartContext.test`).
- `AccountMenu` — accessible-name render test + `vitest-axe` `toHaveNoViolations()`; both
  states render the right rows; `wishlistCount` badge shows/omits at 0; Escape/close and
  focus-return; controlled `open`/`onClose`.
- `SiteHeader` — trigger toggles the menu; opening Account closes nav/search.
- `user` data contract test in `tests/contracts` (shape guarantee, like the other `src/data/*`).

**Browser (mobile / tablet / wide):**
- Logged out: icon opens the menu with Login / Signup / Track Order; each routes to its stub.
- Toggle mock login → menu now shows greeting (name + email) and the account rows; Wishlist
  count matches the saved/wishlist source; Logout returns to the logged-out menu.
- Desktop = anchored dropdown, mobile = bottom sheet, swapping at 800px with no layout jump.
- Full keyboard pass: Tab to trigger, Enter/Space opens, arrow/Tab through rows, Escape
  closes and returns focus to the trigger; focus visible throughout.
- Divider grouping intact (account · help · logout); Logout not adjacent to other actions.
- State survives refresh (logged-in stays logged-in via `localStorage`), and doesn't throw
  on empty/corrupted storage.
- Accent switcher (all 4 presets) recolors the menu, badge, and primary Login button with
  no stale colors.

**Forward-compat with the backend:** everything reads `useAuth()` / `src/data/user.ts`;
swapping `MOCK_USER` for an async `GET /me` returning the same `AuthUser` shape must not
force a component rewrite. No row assumes the user is present before first render without a
logged-out fallback.
