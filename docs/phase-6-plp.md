# Phase 6 — Helmet Showroom PLP (`/shop`)

**Goal:** turn the `/shop` placeholder into the live Product Listing Page ported from
the DC source `Helmet Showroom PLP Responsive.dc.html` (`6fb6200b…`) — a responsive,
URL-driven, config-first catalog page that wires the Phase-4 filter/selection
components onto real data, plus the filter/sort/pagination logic layer they need.

**Depends on:** Phases 1–4 (primitives, composites, `FilterGroup`/`AppliedFilterBar`/
`Select`/`SegmentedToggle`/`EmptyState`/`PromoTile`), Phase 5 (`Icon`).
**Blocks:** a future Accessories PLP and the backend phase (this defines the facet/
query seam an API will implement).

---

## Scope

| Area | Deliverable |
| --- | --- |
| Data | `Product.certification`; catalog grown to ~24 helmets; `src/data/filters.ts` facet config |
| Logic | `src/lib/catalog.ts` — pure `deriveFacets`/`filterProducts`/`sortProducts`/`countFor`/`paginate`/`isInStock` |
| State | `useProductFilters` (URL ↔ state) + `useDebounce` |
| Page | `src/pages/ShopPage/` folder — orchestrator + `parts/*` + module CSS |
| Shared | `ProductCard` gains optional `showCertification` (default off) |

## DC ↔ real-data reconciliation

The DC source wins on layout/behaviour; content stays real. DC £/fictional brands →
₹/real Indian brands via `formatPrice`. DC "Safety Rating" (SHARP/ECE/DOT) → real
`certification` (`ISI`, `ECE 22.06`, `DOT`, `SHARP 5`). DC "In stock only" → derived
`isInStock(p) = p.sizes?.some(s => s.available) ?? true`; the catalog now includes one
fully sold-out SKU so that filter + the sold-out card have something to act on (the
contract test was updated to allow it while still guaranteeing buyable products).

## Config-first / future-proofing

- `FILTER_SCHEMA` (in `src/data/filters.ts`) is **serializable** — which facets exist,
  how they render (`checkbox`/`swatch`/`pill`), their `urlParam`, and searchability.
  A backend can return this shape. The non-serializable accessor registry (how each
  facet reads a `Product`) lives in `src/lib/catalog.ts`, keeping the config JSON-clean.
- Facet options + live counts are **derived from the catalog** (`deriveFacets` +
  count-aware `countFor`), never hardcoded.
- All filter/sort/page state is **owned by `useProductFilters` and stored in the URL**
  (`?brand=…&type=…&cert=…&price=…&stock=1&sort=…&page=2`, slugified + validated);
  every part is a controlled, presentational consumer. Deep links are shareable and a
  corrupt query degrades gracefully. Any facet/sort change resets to page 1.
- Responsive: `useIsDesktop()` (800px) swaps the sticky sidebar for a `BottomSheet`;
  grid density via `SegmentedToggle` (mobile 1↔2, desktop 2↔3) through a `--plp-cols`
  CSS var. Prices/counts use `--font-mono`; tokens-only CSS.

## Tests

- `src/lib/catalog.test.ts` — filter/sort/paginate/facets/counts (pure, deterministic).
- `src/hooks/useDebounce.test.ts`, `src/hooks/useProductFilters.test.tsx` — URL sync,
  page reset, chip build/remove, clear-all, corrupt-query resilience.
- `tests/integration/plp-flow.test.tsx` — facet narrows grid, sort, pagination slice,
  deep-link hydration, empty state + clear, chip removal, mobile sheet.
- `tests/contracts/data.contract.test.ts` — extended for `certification` + stock states.
- `ProductCard.test.tsx` / `AppliedFilterBar.test.tsx` — new-prop + controlled-re-add.

## Verify

- `npm run build` + `npm run lint` + `npm test` + `npm run coverage` all green.
- `/shop`: filter by every facet + price + in-stock → grid, live counts, chips and the
  result label all update; sort reorders; numbered pager is deep-linkable; back button
  steps through filter states; accent switcher recolors checkboxes/chips/price/pager/CTAs.
- Edge cases: zero-results `EmptyState` + clear CTA; fully sold-out SKU (add disabled,
  overlay, hidden by in-stock filter); single page hides the pager; long names wrap;
  many chips wrap/scroll; price slider at min/max; refresh preserves filters (URL) +
  cart/accent (localStorage); corrupt query doesn't throw.
- A11y: full keyboard pass (facets, sort, density, chip remove, pager, cards); Escape
  closes the mobile sheet and restores focus; icon-only controls labelled; count is a
  live region.
- Responsive: desktop sidebar ↔ mobile sheet at 800px with no jump; Home/PLP at mobile/
  tablet/desktop widths — no horizontal scroll, no clipped content.
- Cross-phase: re-run Home checks (shared `ProductCard`/tokens); `npm test` covers the rest.

## Forward-compat

`deriveFacets`/`filterProducts`/`sortProducts`/`paginate` are pure over `Product[]` and
`FILTER_SCHEMA` is serializable, so swapping `PRODUCTS` (sync) for an async fetch of the
same shape needs only a loading state in `ShopPage` (`Skeleton` available) — no logic rewrite.
