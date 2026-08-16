# Phase 5 — Icon system (Lucide)

**Goal:** replace every improvised icon in the app — unicode glyphs rendered as text
(`×`, `▾`, `⌄`, `‹›`, `★`, `♥`, `▲▼`, `→`, emoji `🔒☺⌕◫`) and the five hand-rolled inline
`<svg>` elements — with a single, tokenized icon layer built on **`lucide-react`**. One
central `Icon` primitive is the seam; everything else consumes it.

**Depends on:** Phases 1–4 (reuses tokens, `cx`, existing `icon?: ReactNode` prop slots,
the `currentColor`/`var(--accent)` color model, the `vitest-axe` test pattern).
**Blocks:** nothing — this is a cross-cutting refactor, not a new page/flow.

**Why now:** the same `×` is inlined independently in 8 components and sizes/renders
differently in each; icon-only controls are inconsistently labelled; glyphs don't scale
crisply. A shared primitive fixes consistency, accessibility, and maintainability at once.

---

## Decisions (confirmed with user)

- **Central `Icon` primitive** wrapping `lucide-react` — not direct per-call-site Lucide usage.
- **Full sweep** — all ~30 spots across primitives, composites, pages, and `src/data/*`.
- **Keep `Rating`'s custom gradient star SVG** — Lucide can't do partial/half-star fill;
  only the simple *full* stars elsewhere migrate to Lucide `Star`.
- **Migrate data-file glyphs** — glyph strings in `src/data/*` become string *keys* mapped to
  Lucide components via a shared `iconMap` (keeps data serialisable / backend-friendly).

---

## 1. Dependency & tokens

- `lucide-react` added to `package.json` (React components — no Vite/SVG-plugin change needed).
- `src/styles/tokens.css` gains an icon size scale (no hardcoded px in components):
  `--icon-sm: 16px; --icon-md: 20px; --icon-lg: 24px;`

## 2. `Icon` primitive — `src/components/primitives/Icon/`

`Icon.tsx` + `Icon.module.css` + `Icon.test.tsx`; barrel line in `primitives/index.ts`.

```ts
export type IconSize = 'sm' | 'md' | 'lg';
export interface IconProps {
  icon: LucideIcon;          // the Lucide component, e.g. X, ChevronDown
  label?: string;            // set -> role="img" + aria-label; unset -> aria-hidden (decorative)
  size?: IconSize | number;  // default 'md' -> var(--icon-md); number = raw px escape hatch
  strokeWidth?: number;      // default 2 (matches the old inline SVGs)
  className?: string;
  style?: CSSProperties;
}
```

- **Color:** always `currentColor` — consumers set `color: var(--accent)` / inherit `--text`
  in their own module CSS. Honours the accent switcher with zero JS. Never pass a hex to Lucide.
- **Size:** token scale via a CSS var on the wrapper (`sm/md/lg`), raw number allowed.
- **A11y:** decorative by default (`aria-hidden`, `focusable={false}`) since icons sit next to
  visible text or inside already-labelled buttons; `label` promotes to `role="img"` + `aria-label`.

## 3. Data-driven mapping — `src/lib/icons.ts`

A small `iconMap: Record<string, LucideIcon>` so `src/data/*` can carry string keys
(`'check'`, `'phone'`, …) instead of glyph characters, and consumers resolve key → component.

## 4. Glyph → Lucide swap (full list)

**Primitives** — `Modal`/`BottomSheet`/`Toast`/`Chip`/`SlideNav` close `×`→`X`;
`SearchBar` magnifier SVG→`Search`, clear `×`→`X`; `QtyStepper` `−`/`+`→`Minus`/`Plus`;
`Select` `▾`→`ChevronDown`, `✓`→`Check`; `Accordion` `⌄`→`ChevronDown`;
`Breadcrumbs` `›`/`•`→`ChevronRight`/`Dot` (slash stays text); `Carousel`/`Pagination`
`‹›`→`ChevronLeft`/`ChevronRight`; `StatCard` `▲▼`→`ChevronUp`/`ChevronDown`;
`SaveButton` `♥`/`♡`→`Heart` (filled via CSS when saved); `Checkbox`/`ActionButton` tick
SVG→`Check`; `PromoTile` CTA `→`→`ArrowRight`; `EmptyState` keeps its `glyph` string prop
for back-compat, consumers pass `icon` via the existing `ReactNode` slot. **`Rating` unchanged.**

**Composite** — `AppliedFilterBar` `×`→`X`; `FilterGroup` `▾`/`×`/`✓`→`ChevronDown`/`X`/`Check`;
`SiteHeader` `🔒☺⌕◫`→`Lock`/`User`/`Search`/`ShoppingBag`; `SearchPanel` `⌕`→`Search`;
`CartToast` `✓`→`Check`; `ReviewCard` stars→`Star`, verified `✓`→`BadgeCheck`;
`ProductCard` `★`→`Star`, add SVG→`Plus`; `CategoryCard`/`ProductRail` `→`→`ArrowRight`.

**Pages** — `CategoryStrip` `→`→`ArrowRight`; `ReviewsMarquee` `★`→`Star`;
`ShowcasePage` demo `★`/`☆`→`Star` (sort-label `→` is real text, left as-is).

**Data** — `home.ts` `icon:'✔'`→`'check'`, `'☎'`→`'phone'`; StatCard `suffix:'★'`, the
`'… →'` / `'★ FREE SHIPPING …'` copy and `ProductRail.seeAllLabel = 'SEE ALL →'` lose the baked
glyph, consumer renders the Icon beside the text.

## 5. Tests

- New `Icon.test.tsx`: decorative (aria-hidden, no accessible name) / labelled (accessible name) /
  `toHaveNoViolations()` — follows `QtyStepper.test.tsx` / `Modal.test.tsx`.
- Update any existing test asserting on a glyph's text content (query by `aria-label`/role instead).
- `npm test` green, coverage above `vite.config.ts` thresholds (lines/fns/stmts 70, branches 65).

## Verify

- `npm run build` + `npm run lint` + `npm test` + `npm run coverage` all green.
- Grep `src/` for the glyph set — none remain as icons (JSDoc `→` and real punctuation excepted).
- `/showcase` + Home/PLP/PDP/Cart/Checkout in browser: every icon renders crisp and inherits color;
  accent switcher recolors accent-tinted icons (SaveButton heart, active chevrons); icon-only
  buttons reachable + focus-visible + labelled; decorative icons `aria-hidden` (no double SR
  announcements); no layout jump vs the glyphs at mobile/tablet/desktop.
- Cross-phase: `npm test` confirms no regression to shared primitives (Modal, Chip, QtyStepper…).

> Design-pane mirror (`f3859a7b…`): an `icon.html` preview card is a sensible follow-up so the
> pane documents the new primitive, but it's not required to land the code swap.
