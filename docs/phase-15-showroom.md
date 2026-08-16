# Phase 15 — Showroom page (`/showroom`)

**Depends on:** Phase 3 (HomePage `ShowroomCta` teaser, `SHOWROOM` data), Phase 1
(`Carousel`, `Button`, `Icon`, `Badge`), Phase 2 (`ReviewCard`/testimonials), `FOOTER_ADDRESS`.

## Goal
Give the "Showroom" nav item a real customer destination: a **visual-first `/showroom`
page** selling the physical store — try before you buy, expert fitting, every brand under
one roof. Walk-in only (no booking), static map + directions, live open/closed status. Also
fixes the nav, which currently points shoppers at the dev-only `/showcase`.

## Why
Helmets are the product people most want to **try on** — online sizing is a gamble, and the
physical showroom is the store's real edge over pure-online sellers. Today the "Showroom"
nav entry routes to `/showcase`, a **design/dev reference page** (per `App.tsx`), so a
shopper clicking it lands in a component gallery. This page makes the promise the homepage
`ShowroomCta` teaser already gestures at ("VISIT THE SHOWROOM") into a real page, and moves
the dev showcase out of the customer nav. Mostly **assembly over existing pieces** +
extending the existing `SHOWROOM` data object.

## Architecture

### Data — extend `SHOWROOM` in `src/data/home.ts` (or a new `src/data/showroom.ts`)
The teaser already uses `SHOWROOM` (eyebrow/heading/copy/address/hours/CTAs). Extend the same
object so the teaser and the page share one source — don't fork the address/hours.
- Add: `hoursByDay` (structured, for the open/closed calc + display), `mapImage` (static
  map asset), `directionsUrl` (external maps link), `landmark`, `parking`, `services[]`,
  `gallery[]` (image slots), `experienceReviews[]` (visit testimonials, distinct from product
  reviews), `phone`, `whatsapp?`.
- Shaped like a real content endpoint (swap for CMS later). **Image/map assets and any store
  facts are content slots** — real photos/addresses filled by the user, not invented here.

### Page — `ShowroomPage` (`/showroom`), sections top → bottom
1. **Hero** — atmospheric showroom imagery + headline ("Try before you ride"); the page is
   visual-first.
2. **Why visit** ⭐ — the reason it exists: try every brand in person, expert fitting, full
   range in stock, honest advice. A few icon+copy points (reuse the `WhyUs` visual language).
3. **Location & getting there** — address (shared `FOOTER_ADDRESS`), **static map image** +
   a **"Get directions"** button (opens `directionsUrl` in a new tab — external link, so
   `rel="noopener"`), landmark, parking, and a clear **"Walk-ins welcome — no appointment
   needed"** line.
4. **Hours** — `hoursByDay` laid out clearly, with a live **Open now / Closed** indicator
   computed from the current time in a small hook (`useStoreOpen(hoursByDay)`); handle the
   closed/edge case honestly (e.g. "Opens at 10:00").
5. **In-store services** — fitting, visor/parts replacement, servicing (from `services[]`).
   No click-and-collect, no returns.
6. **Gallery** — reuse `Carousel` over `gallery[]` image slots; keyboard + swipe as the
   primitive already supports.
7. **Store experience reviews** — testimonials about *visiting* (not product reviews), reusing
   the review card visual; renders nothing if empty.

### Deliberately out
No appointment/booking (walk-in only), no click-and-collect, no live/interactive map embed
(static image + link only), no returns.

### Routing / nav cleanup (required)
- Add `/showroom` route (inside `SiteLayout`) → `ShowroomPage`.
- Point `DESKTOP_NAV` + `MOBILE_NAV` "Showroom" `href` from `/showcase` → `/showroom`.
- `/showcase` **stays** as a dev-only route but leaves the customer nav (reachable directly,
  not linked from chrome).
- HomePage `ShowroomCta` primary CTA now targets `/showroom`.

## Out of scope
Appointment booking, click-and-collect, interactive maps, real photo/map asset sourcing
(slots now), multi-location support, and any unverified store facts (left as TODO content).

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- `showroom`/`SHOWROOM` data contract test — required fields present; `hoursByDay` well-formed;
  address resolves to the shared `FOOTER_ADDRESS` source; `directionsUrl` is an absolute URL.
- `useStoreOpen` hook — open vs closed at boundary times, before-open / after-close, a closed
  day; deterministic with an injected "now" (don't read the real clock in the test).
- `ShowroomPage` — renders all sections; "Get directions" is an external link with
  `rel="noopener"` + `target="_blank"`; gallery renders `Carousel`; experience-reviews section
  hides when empty; accessible-name render + `vitest-axe` `toHaveNoViolations()`.

**Browser (mobile / tablet / wide):**
- `/showroom` loads visual-first; hero, why-visit, location, hours, services, gallery,
  reviews all present.
- Open/closed indicator reflects the current time; "Get directions" opens the maps link in a
  new tab; "Walk-ins welcome" is clearly stated (no booking UI anywhere).
- Nav "Showroom" (desktop + mobile) and the homepage `ShowroomCta` both land on `/showroom`;
  `/showcase` is no longer linked from the header/footer.
- Gallery carousel works by keyboard and swipe; Escape/arrow behavior per the primitive.
- Full keyboard pass: directions button, carousel, and any links reachable/operable, focus
  visible; no horizontal scroll at any width; long address/hours wrap cleanly.
- Accent switcher (all 4 presets) recolors the hero accents, buttons, open-now badge, and
  carousel controls with no stale colors.

**Forward-compat with the backend:** page reads the `SHOWROOM`/showroom data + `useStoreOpen`;
swapping the mock for an async content fetch of the same shape must not force a rewrite. No
section assumes content/images are present before first render without an empty/placeholder
path.
