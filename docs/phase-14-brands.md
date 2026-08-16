# Phase 14 — Brands page (`/brands`)

**Depends on:** Phase 6/8 (PLP + `?brand=<slug>` URL filter), Phase 2 (ProductCard/rail,
Badge, Breadcrumbs, EmptyState), Phase 1 (CountUp, Carousel), catalog `brand` facet.

## Goal
Replace the placeholder "Brands" nav target (currently `/helmets`) with a real **single
Brands page**: a rich, story-driven brand directory. Each brand is a substantial tile that
routes into the **existing PLP filtered by that brand** (`/helmets?brand=<slug>`) — no
per-brand pages. Brands: **Vega, Axor, MT, Reisemoto, Steelbird, SMK, Studds, Royal
Enfield**.

## Why
"Brands" is a dead nav entry pointing at the generic Helmets PLP. A real page turns the
catalog's biggest asset — a mix of **Indian heritage** (Studds, Steelbird, Vega, Royal
Enfield, Axor) and **international** (MT, SMK, Reisemoto) names — into a browsable story, and
it's cheap: the PLP already deep-links on `?brand=<slug>` (confirmed by
`useProductFilters` tests), so tiles are just links into filtered PLPs. It's **assembly over
existing components + a new `src/data/brands.ts`**, no new catalog machinery. Certification
badges (ISI/DOT/ECE) do real work here — for helmets, brand trust *is* safety trust.

## Single page — no per-brand routes
Everything lives on `/brands`. A brand's products are reached through the existing PLP filter,
not a dedicated brand route. (The earlier idea of full-page re-theming per brand is **out**
with per-brand pages; brand color survives as a **per-tile accent** — see below.)

## Architecture

### Data — `src/data/brands.ts`
Shaped like a real `GET /brands` response so it can be swapped for an API/CMS later.
- `interface Brand { slug: string; name: string; logo?: string; color: string; origin: string; originFlag?: string; foundedYear?: number; tagline: string; blurb?: string; certifications: string[]; heroImage?: string; featured?: boolean }`
- `slug` **must match the PLP brand slug** (the slugified `brand` value, e.g. `mt-helmets`)
  so tiles link correctly — derive both from one slugify helper; don't hand-type two slugs.
- **`productCount` / `priceFrom` are derived** from the existing catalog (filter products by
  brand), not stored — one source of truth. A small selector (`brandStats(slug)`).
- **Brand facts are content slots, not asserted.** Founding years, origin claims,
  "largest/oldest", which cert each brand carries, Axor↔Steelbird relationship, Reisemoto's
  positioning — leave as clearly-marked `TODO` copy for the user to fill with verified facts.
  Do not invent them.
- Reconcile with the existing `BRANDS` marquee list in `navigation.ts` (currently 7, missing
  Reisemoto, different order) — `brands.ts` becomes the source; the marquee reads from it.

### Per-tile brand color (keeps the visual richness)
Each tile sets `--brand-accent: <brand.color>` as a scoped CSS var driving its hover
glow / logo backdrop / "Explore →" — the same token pattern the site uses for `--accent`,
just scoped to the tile. **Never hardcode the hex in the component** (CLAUDE.md); it comes
from `brand.color` in data. Site-wide `--accent` is untouched.

### Page — `BrandsPage` (`/brands`), sections top → bottom
1. **Hero** — title + one line ("N brands, from Indian heritage to European engineering").
2. **Featured spotlight** (optional, ship-if-clean) — one `featured` brand as a larger
   banner tile; rotates/pick-first. Skip if it complicates the grid.
3. **Grouped brand grid** — two labelled groups, **"Made in India"** and **"International"**
   (group derived from `brand.origin`). Each tile: logo on `--brand-accent`, signature/hero
   image, tagline, origin flag, founded year, **price-from**, **live product count**, and a
   cert badge row (`Badge`). Reuse the existing card hover-lift motion. Tile → `/helmets?brand=<slug>`.
4. **Trust / certification row** — a short strip explaining ISI/DOT/ECE so the badges mean
   something. Static copy.
5. **"Find your brand" matcher** (optional, ship-if-clean) — 2–3 quick questions (budget ·
   riding style · full-face vs open) → recommends a brand, links to its filtered PLP. Small,
   self-contained, client-only; cut it if it bloats the phase.

### Edge cases baked in
- A brand with **zero matching products** in the catalog (Reisemoto / Royal Enfield may have
  none yet): tile still renders but shows "Coming soon" / disabled count instead of linking to
  an empty PLP — or links but the PLP's existing `EmptyState` covers it. Decide one; don't
  render a broken "0 products" link.
- Long brand names / many certs wrap inside the tile, don't overflow.

### Nav / routing
- Add `/brands` route (inside `SiteLayout`) → `BrandsPage`.
- Update `DESKTOP_NAV` + `MOBILE_NAV` "Brands" `href` from `/helmets` → `/brands`.
- Footer "COMPANY → Our brands" link points at `/brands`.

## Out of scope
Per-brand pages/routes, full-page brand re-theming, brand-level reviews aggregation, real
logo/hero asset sourcing (slots now), and any unverified brand facts (left as TODO copy).

## Verify

**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage`. New tests:
- `brands` data contract test in `tests/contracts` — every `Brand.slug` matches a real PLP
  brand slug (or is explicitly flagged "no products"); required fields present; colors are
  token-safe values.
- `brandStats` selector — count/price-from derived correctly; a no-product brand returns 0
  and is handled.
- `BrandsPage` — renders a tile per brand, grouped by origin; tile links to the correct
  `/helmets?brand=<slug>`; no-product brand doesn't link to an empty PLP; accessible-name
  render + `vitest-axe` `toHaveNoViolations()`.
- (If matcher shipped) answering routes to the expected brand's filtered PLP.

**Browser (mobile / tablet / wide):**
- `/brands` loads; tiles grouped Made-in-India / International; each shows logo on its brand
  color, tagline, origin, price-from, live product count, cert badges.
- Clicking a tile lands on `/helmets?brand=<slug>` with the brand chip active and results
  filtered; a no-product brand behaves per the chosen edge rule (no broken link).
- Nav "Brands" (desktop + mobile) and footer "Our brands" go to `/brands`, not `/helmets`.
- Per-tile brand color themes only that tile; site `--accent` and the accent switcher (all 4)
  are unaffected and recolor the rest of the page cleanly.
- Full keyboard pass: every tile and matcher control reachable/operable, focus visible; no
  horizontal scroll at any width; long names/certs wrap.

**Forward-compat with the backend:** page reads `src/data/brands.ts` + catalog-derived
stats; swapping brands for an async `GET /brands` of the same shape must not force a rewrite.
Tiles depend only on `slug`; no tile assumes brand data or product counts before first render
without a fallback.
