# Phase 8 — Config-driven Category PLPs (Accessories + Spares & Care)

**Depends on:** Phase 6 (the `/shop` PLP), Phase 4 (FilterGroup).

## Goal
Generalise the single Helmets PLP into a **config-driven page** that serves every
product category, and ship two new PLPs — **Accessories** and **Spares & Care** —
plus a refreshed filter accordion (collapsible + capped-height scroll, first group
open) applied across all three.

## Why
`ShopPage` was hardcoded to `PRODUCTS` + "Helmets" copy + a fixed `FILTER_SCHEMA`,
even though the catalog engine (`src/lib/catalog.ts`) was already dataset-agnostic.
The DC sources (`Accessories PLP Responsive`, `Spares and Care PLP Responsive`) are
"the same page, different config": a 3-facet rail (Category / Brand / Price), a
capped-height scrollable option list, and per-page copy. Making the page a function
of a config registry means a future PLP is a data entry + a route, not a new page.

## Architecture
- **`src/data/plp.ts`** — `PLP_CONFIGS` registry (`helmets`, `accessories`,
  `spares-care`). Each `PlpConfig` binds copy (title/subtitle/breadcrumb/countNoun/
  metaDescription), the `products` dataset, and an ordered `filters: PlpFilter[]`
  rail (facet | price | stock, interleaved). `facetConfigsOf(config)` extracts the
  facet entries the URL/facets engine needs.
- **`ShopPage`** takes a `config` prop (defaults to Helmets so `/shop` keeps working)
  and is otherwise a pure function of it — derives facets from `config.products`,
  drives `useProductFilters(facets, facetConfigs)`, and threads `config` to header /
  sidebar / sheet / grid.
- **`useProductFilters(facets, facetConfigs = FILTER_SCHEMA)`** — parameterised by the
  page's facet rail; facets absent from it are never read or written.
- **`FilterSidebar`** maps `config.filters` in order: every group is a collapsible
  accordion (`FilterGroup collapsible defaultOpen={i === 0}` → first open, rest
  collapsed); Price is a matching collapsible; Stock is a plain toggle. A facet with
  `scopedBy` (Accessories/Spares brand → category) hides unreachable options and shows
  an "IN N …" note (`FilterGroup titleNote`).
- **Capped scroll** — `FilterGroup.module.css .list` gains
  `max-height: var(--filter-list-max-h, 240px); overflow-y: auto` + themed scrollbar
  (token added to `tokens.css`).
- **Availability** — `Product.inStock?: boolean` + `isInStock()` honoring it, so the
  sizeless accessories/spares/care catalogs can mark SKUs sold out.
- **Data** — `accessories.ts` enriched (10 → 22, more categories, out-of-stock items);
  new `spares.ts`; Spares & Care catalog = `[...SPARES, ...CARE]`.
- **Nav/routing** — `/shop` → `/helmets` (+ redirect); new `/accessories`,
  `/spares-care`; nav label `Care` → **Spares & Care**; home category strip hrefs
  point at the real routes.

## Verify
**Static/automated (green):** `npm run build`, `npm run lint`, `npm test`,
`npm run coverage` — added contracts (`plp`, `spares`, enriched `accessories`),
`isInStock` flag cases, `FilterGroup` collapsed/`titleNote` cases, and a category-PLP
integration suite.

**Browser (mobile / tablet / wide):**
- `/helmets`, `/accessories`, `/spares-care` each load with the right title,
  breadcrumb, copy and facet set (6 vs 3 groups); first accordion open, rest collapsed;
  long option lists scroll inside the 240px cap.
- Out-of-stock cards show the overlay + disabled add on accessories & spares.
- Filter → sort → paginate → chips → clear-all per catalog; state survives refresh;
  empty state renders; brand facet scopes to the selected category ("IN …" note).
- Header shows **Spares & Care**; nav active state tracks the current category; mobile
  filter sheet mirrors the desktop rail; accent switcher (all 4) recolors cleanly.
- `/shop` redirects to `/helmets`; homepage category strip resolves.
