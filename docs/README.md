# APEXLINE — Build Plan (Phased)

This folder breaks the [`../ARCHITECTURE.md`](../ARCHITECTURE.md) master plan into
executable phases. Each phase is a standalone doc with its goal, exact deliverables,
a task checklist, and how to verify before moving on.

| Phase | Doc | Goal | Depends on |
| --- | --- | --- | --- |
| 0 | [phase-0-foundations.md](./phase-0-foundations.md) | Scaffold Vite+React+TS, providers, tokens, hooks, data seam | — |
| 1 | [phase-1-primitives.md](./phase-1-primitives.md) | Port the ~29 design-system primitives + Showcase page | Phase 0 |
| 2 | [phase-2-composites.md](./phase-2-composites.md) | Composites (header/footer/product card…) + SiteLayout | Phase 1 |
| 3 | [phase-3-pages.md](./phase-3-pages.md) | Assemble Home / Shop / Product / Cart / Checkout | Phase 2 |
| 4 | [phase-4-filter-and-selection-components.md](./phase-4-filter-and-selection-components.md) | Filter/selection primitives + composites (Select, SegmentedToggle, EmptyState, PromoTile, FilterGroup, AppliedFilterBar) | Phase 3 |
| 5 | [phase-5-icon-system.md](./phase-5-icon-system.md) | Central `Icon` primitive + `iconMap`, sweep improvised glyphs | Phase 1 |
| 6 | [phase-6-plp.md](./phase-6-plp.md) | Live `/shop` PLP: config-driven, URL-state filters/sort/pagination, responsive | Phases 4–5 |
| 7 | [phase-7-pdp.md](./phase-7-pdp.md) | Full `/product/:id` PDP + 9 PDP components (gallery, size grid, spec table, reviews, sticky buy bar, size guide…) | Phases 4–6 |
| 8 | [phase-8-category-plps.md](./phase-8-category-plps.md) | Config-driven PLPs: `/helmets` `/accessories` `/spares-care` from one `PLP_CONFIGS` registry; collapsible capped-scroll filter accordions; nav `Care`→`Spares & Care` | Phase 6 |
| 9 | [phase-9-account.md](./phase-9-account.md) | Account menu: two-state Profile dropdown / mobile bottom sheet (logged-out Login/Signup/Track Order · logged-in Profile/Orders/Wishlist/Care/Logout) on a mock `useAuth()` seam + stub routes | Phase 2 |
| 10 | [phase-10-my-profile.md](./phase-10-my-profile.md) | My Profile page: single-page cards (Profile header · Personal details · Addresses · Security · Comms prefs · Danger zone); Addresses built for real (feeds Checkout), Security/deletion stubbed | Phase 9 |
| 11 | [phase-11-orders.md](./phase-11-orders.md) | Orders list + detail (`/account/orders`, `/account/orders/:id`) over mock data; status timeline, Buy again (real, adds to cart), Cancel/invoice/help stubbed; shared detail powers guest `/track-order`; no returns | Phase 9 |
| 12 | [phase-12-wishlist.md](./phase-12-wishlist.md) | Wishlist page (`/account/wishlist`): `ProductCard` grid over the existing `useWishlist()` id store; unsave in place, add via card's PDP/cart behavior, empty + clear-all; separate from cart's saved-for-later | Phase 9 |
| 13 | [phase-13-customer-care.md](./phase-13-customer-care.md) | Customer Care page (`/support`): contact channels + showroom address, self-service quick links, `Accordion` FAQ from `src/data/support.ts`, stubbed contact form, warranty/care card; wires footer Support links; no live chat, no returns | Phase 9 |
| 14 | [phase-14-brands.md](./phase-14-brands.md) | Single Brands page (`/brands`): story-driven brand directory (Made-in-India / International), per-tile brand color, live counts + cert badges, tiles deep-link into `/helmets?brand=<slug>`; optional spotlight + "find your brand" matcher; no per-brand pages **(under review — likely folded into the homepage `BrandStrip` instead)** | Phase 8 |
| 15 | [phase-15-showroom.md](./phase-15-showroom.md) | Showroom page (`/showroom`): visual-first physical-store pitch — hero, why-visit, location (static map + directions), hours with live open/closed status, in-store services, gallery, visit testimonials; walk-in only; fixes nav `Showroom`→`/showroom` (`/showcase` leaves the nav) | Phase 3 |

## How we work each phase
1. Read the phase doc + pull the relevant DC sources via the design MCP (`get_file`).
2. Implement the deliverables.
3. Run the phase's **Verify** checklist (`tsc`, `build`, drive it in the browser).
4. Only then advance — later phases assume earlier ones are green.

## Guiding principles
- **CSS variables for tokens/accent** — components read `var(--accent…)`, never hardcode hex.
- **Config-first & future-proof primitives** — see Phase 1. Every primitive audits the original
  DC `data-props`/ConfigPanel controls and *extends* them with sensible extra props (sizes, states,
  handlers) so the component library outlives its first use. Additions must be optional with safe
  defaults — never break the minimal call site.
- **Content is data** — mock content lives in `src/data/*`, the seam a real API drops into later.
