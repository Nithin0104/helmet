# Home Page Review — APEXLINE

A rigorous, multi-lens review of the **Home page** (`/`) and the components it directly
uses, checked against the **live DC source** ("Helmet Showroom Home", DesignSync
`6fb6200b-d6d0-40a7-8520-588a73e78751`) and the project's own rules (`CLAUDE.md`,
`docs/phase-3-home.md`, `ARCHITECTURE.md`).

**Status:** analysis only — no code was changed. Hand any file (or a single finding)
back to have it executed.

## How to read this

Four role files, each written from a principal's seat:

| File | Lens | Findings |
| --- | --- | --- |
| [`01-pm.md`](./01-pm.md) | Principal PM — product value, flows, dead features, expectation-setting | P1–P6 |
| [`02-design.md`](./02-design.md) | Principal Designer — visual/UX rules + DC fidelity: layout, motion, focus, tokens | D1–D9 |
| [`03-frontend.md`](./03-frontend.md) | Principal Frontend — data integrity, component API, state, seams | F1–F8 |
| [`04-qa.md`](./04-qa.md) | Principal QA — test coverage gaps + edge/a11y/responsive checklist | Q1–Q7 |

Every finding uses one template so it is executable as-is:

> **[ID] Title** — *Priority · Effort*
> **Problem** → **Evidence** (`file:line` / DC excerpt) → **Solution** (current → target) → **Verify**.

Effort key: **S** ≈ <1h · **M** ≈ half-day · **L** ≈ multi-day.
Many findings cross-reference each other (e.g. `F3`↔`P2`) — fix the pair together.

## The headline

The home page is **functionally assembled and token-disciplined** — data-driven content,
strong SR labelling, real semantic elements, and a clean CMS seam. The gaps cluster into
three themes:

1. **DC fidelity** — three visual/motion details diverge from the source the project says
   wins (rails render as horizontal shelves where DC wraps into a grid; scroll-reveal uses
   the wrong easing; the ambient glow is placed/timed differently). `CLAUDE.md` requires
   these be **flagged**, not silently kept.
2. **Dead / misleading controls** — a wishlist heart with no handler, quick-add that
   bypasses size/colour, and nearly every link routing to `/shop` (including "Get
   directions" and "Store hours").
3. **Testing frontier** — every primitive and composite is tested, but **none of the 8
   HomePage sections are** (only incidental routing coverage), and `home.ts` is the one
   data module with no contract guard.

## Priority matrix (all findings, ranked)

### 🔴 High — do first
| ID | Lens | Title | Effort | Primary file |
| --- | --- | --- | --- | --- |
| D1 | Design | Rails are horizontal shelves; DC renders wrapping grids | M | `src/pages/HomePage/HomePage.tsx` |
| D2 | Design | Scroll-reveal easing/timing wrong (`.6s ease` vs `.7s cubic-bezier`) | S | `src/styles/global.css` |
| D3 | Design | Ambient glow diverges from DC (placement / 9s vs 6s / scale pulse) | M | `src/components/layout/SiteLayout.*` |
| D8 | Design | No visible `:focus-visible` on home controls | S | `src/pages/HomePage/HomePage.module.css` |
| P1 | PM | Dead/misleading navigation — everything routes to `/shop` | M | `src/data/home.ts` |
| Q1 | QA | No section-level tests for Home (8 sections untested) | M | `src/pages/HomePage/sections/*` |

### 🟠 Medium
| ID | Lens | Title | Effort | Primary file |
| --- | --- | --- | --- | --- |
| D6 | Design | Segmented-control colours off DC | S | `src/components/composite/ProductRail/ProductRail.module.css` |
| D9 | Design | Non-tokenized colour literals | S | `src/pages/HomePage/HomePage.module.css` |
| F1 | Frontend | ReviewsMarquee fabricates ratings (`rating: 5` for all) | S | `src/pages/HomePage/sections/ReviewsMarquee.tsx` |
| F2 | Frontend | Rating representation split (number vs string) | S | `src/data/home.ts` |
| F3 | Frontend | Wishlist heart is a dead control | S | `src/components/composite/ProductCard/ProductCard.tsx` |
| F4 | Frontend | Quick-add bypasses variant selection | M | `src/components/composite/ProductCard/ProductCard.tsx` |
| P2 | PM | Wishlist implies a missing feature | S | (see F3) |
| P3 | PM | Quick-add is a poor commerce flow for variant products | M | (see F4) |
| Q2 | QA | No `home.ts` contract test | S | `tests/contracts/` |
| Q3 | QA | Edge/overflow cases untested (empty rail, long content) | S | `src/pages/HomePage/*` |
| Q4 | QA | Accent switch (4 presets) needs a browser pass | Browser | — |
| Q5 | QA | Reduced-motion needs a browser pass | Browser | — |

### ⚪ Low / info
| ID | Lens | Title | Effort |
| --- | --- | --- | --- |
| D4 | Design | Hero gradient stop uses solid bg (α=1 vs .97) | S |
| D5 | Design | Micro-spacing vs DC | S |
| D7 | Design | Intentional deviations (documented, do not revert) | — |
| F5 | Frontend | ProductRail tabs are uncontrolled-only | S |
| F6 | Frontend | ProductRail has no loading/error variant | S |
| F7 | Frontend | `useDragScroll` robustness (pointer capture) | S |
| F8 | Frontend | Sync-only data seam (note for backend) | info |
| P4 | PM | Trust inconsistency (4.9 vs 5-star cards) | S |
| P5 | PM | Compare CTA promises a non-existent tool | S |
| P6 | PM | Content model is a clean CMS seam (guard it) | info |
| Q6 | QA | Keyboard pass checklist | Browser |
| Q7 | QA | Responsive checklist | Browser |

## Suggested execution order

1. **Fidelity + a11y quick wins:** D2, D8, D9, D6 (all S, high visual payoff).
2. **Decide the two flagged calls:** D1 (rail layout) and F4/P3 (quick-add) — these need
   a product decision before coding (see the ❓ markers in each file).
3. **Data integrity:** F1, F2, F3/P2 — small, unblock Q2.
4. **Tests:** Q1 + Q2 (lock behaviour before/after the above).
5. **Glow + nav:** D3, P1 (touch shared layout / routing — do deliberately).
6. **Browser pass:** Q4–Q7 via the `/run` skill.

## Sanctioned deviations (do NOT "fix" back)

Listed in full at the top of [`02-design.md`](./02-design.md). Summary: £→₹,
London→Bengaluru, fictional→real brands, CountUp stats (DC is static text), h3→h2 heading
normalization, real-tab/roving-tabindex a11y upgrades, and the empty-state addition. These
are intentional improvements over the DC source — a later execution pass must not revert
them while "matching DC".
