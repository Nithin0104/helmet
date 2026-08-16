# Phase 4 — New DC components (filters, selection & content states)

**Goal:** port the six components that were added to the DC source (`6fb6200b…`) after
Phases 1–3 but are still missing from both the React library **and** the primitives
design-pane (`f3859a7b…`). Each is built with the exact same recipe every existing
primitive/composite already follows — folder-per-component (`Component.tsx` +
`Component.module.css`), single exported `Props` interface, tokens-only CSS, a co-located
`Component.test.tsx` (accessible-name + `vitest-axe` + interaction/boundary coverage),
barrel export, a `ShowcasePage` demo bay, and a mirrored standalone preview in the
design-pane with a `<!-- @dsCard group="…" -->` marker + `_ds_manifest.json` entry.

**Depends on:** Phases 1–3 (reuses tokens, `cx`, `useReveal`, existing primitives as reference).
**Blocks:** wiring FilterGroup/AppliedFilterBar into the live PLP (follow-up, not this phase).

---

## Scope & tier placement

Confirmed with the user: **all six**, **split by tier**.

| Component | Tier / folder | DC source |
| --- | --- | --- |
| `Select` | `src/components/primitives/Select` | `Select.dc.html` |
| `SegmentedToggle` | `src/components/primitives/SegmentedToggle` | `SegmentedToggle.dc.html` |
| `EmptyState` | `src/components/primitives/EmptyState` | `EmptyState.dc.html` |
| `PromoTile` | `src/components/primitives/PromoTile` | `PromoTile.dc.html` |
| `FilterGroup` | `src/components/composite/FilterGroup` | `FilterGroup.dc.html` |
| `AppliedFilterBar` | `src/components/composite/AppliedFilterBar` | `AppliedFilterBar.dc.html` |

`FilterGroup`/`AppliedFilterBar` are PLP-filter composites (facet lists / applied-chip bars),
so they live under `composite/`; they still get a card in the *primitives* design-pane the user
linked, grouped under **Filters**, exactly as the existing `compare-band` (a HomePage section)
appears in that pane under **Sections**.

---

## Porting recipe (unchanged — same table as Phase 1)

`data-props` → `Props` interface · `renderVals()` → props/`useState`/derived consts ·
`{{x}}`/`sc-if`/`sc-for` → `{x}`/`{cond && …}`/`list.map` · inline `style` → `.module.css`
class + CSS var for the dynamic bit · `style-hover`/`style-active` → `:hover`/`:active` ·
`this.setState` → `useState`. **Accent/hover/shadow come from `var(--accent…)`** — never
re-implement the per-accent JS map (`ACC = {…}`) the DC files carry; that map only exists
because the DC runtime had no CSS variables. Preserve animation timing/easing exactly.

Each `renderVals()` here builds a per-accent `shadow`/`hover` lookup — in React those map to
`var(--accent-shadow)` / `var(--accent-hover)` from `tokens.css`. New reused tokens (e.g. a
dashed empty-state border) go in `tokens.css`, not inline.

---

## ⭐ Config-first & future-proofing — current DC surface → additions

**Select** (primitive)
- DC: `variant` (minimal/boxed/pill/underline/solid), `placement` (down/up), `label`,
  `options: string[]`, internal `open`/`value` state.
- Add (optional, safe defaults): controlled `value` + `onChange` **and** uncontrolled
  `defaultValue`; `options` as `string[]` **or** `{ value, label, disabled? }[]`; `placeholder`;
  `disabled`; `id`/`name`/`aria-label`; `className`.
- A11y upgrade: real `<button>` trigger with `aria-haspopup="listbox"`/`aria-expanded`; panel as
  `role="listbox"`, options `role="option"` + `aria-selected`; keyboard: Enter/Space/↓ opens,
  ↑/↓ moves, Enter selects, Esc closes + returns focus, outside-click closes (mirrors the DC
  fixed-overlay close-catcher, done with a ref + listener like `Tooltip`/`SearchPanel`).

**SegmentedToggle** (primitive)
- DC: `variant` (grid-density/view-mode/text/compact), `shape` (square/rounded/pill),
  `size` (28–52px), `items: any[]`, internal `picked` state.
- Add: controlled `value` + `onChange` / uncontrolled `defaultValue`; `items` as strings or
  `{ label, cols?, rows? }` (dot-grid glyph when `cols*rows`); `disabled`; `aria-label`; `className`.
- A11y: `role="group"`; each segment a `<button>` with `aria-pressed`; ←/→ arrow-key roving,
  visible focus ring; icon-only (dot-grid) segments keep their `aria-label`/`title`.

**EmptyState** (primitive)
- DC: `variant` (dashed/panel/plain/inset), `align` (center/left), `tone` (neutral/accent),
  `showGlyph`, `glyph`, `kicker`, `title`, `body`, `ctaLabel`, `secondaryLabel`.
- Add: `onCtaClick` / `onSecondaryClick` handlers; `icon` as `ReactNode` (falls back to the
  glyph string); `children` slot (overrides body) for rich content; `className`.
- A11y: `role="status"` region so zero-results announces; title as a real heading; CTAs are
  `<button>`s only when a handler/label is present.

**PromoTile** (primitive)
- DC: `variant` (gradient/solid/outline/dark/hatch), `layout` (row/stack), `kicker`,
  `headline`, `sub`, `ctaLabel`; CTA is an `<a href="#">`.
- Add: `href` **or** `onClick` (renders `<a>` vs `<button>` accordingly), `ctaHref`; `children`;
  `className`. Keep the row/stack flex behavior and `translateY(-2px)` hover exactly.

**FilterGroup** (composite)
- DC: `variant` (checkbox/radio/pill/swatch), `mode` (multi/single), `searchable`,
  `showCounts`, `collapsible`, `title`, `searchPlaceholder`, `options: [label, count][]`,
  internal `picked`/`query`/`open` state.
- Add: controlled `value: string[]` + `onChange` / uncontrolled `defaultValue`; `options` as
  `{ value, label, count?, hex? }[]` (swatch colors from data, not a hardcoded `HEX` map);
  controlled `open`/`onOpenChange`; `className`. Reuse the `fgPop` check animation exactly.
- A11y: fieldset/`role="group"` + legend from `title`; checkbox rows are real
  `<input type="checkbox|radio">` visually restyled (or `role` equivalents) with labels;
  pill/swatch options `aria-pressed`; search input labelled; collapse toggle `aria-expanded`.

**AppliedFilterBar** (composite)
- DC: `variant` (inline/stacked/boxed), `chipStyle` (outline/solid/soft/pill), `showCount`,
  `showGroups`, `countLabel`, `clearLabel`, `chips: [group,label][]`, internal `removed` state.
- Add: controlled `chips` + `onRemove(chip)` + `onClearAll` (so the parent PLP owns filter
  state) with an uncontrolled fallback that self-manages `removed`; `emptyLabel`; `className`.
  Reuse the `afbIn` chip-in animation exactly. Prefer composing the existing **`Chip`**
  primitive (removable + count) over re-rendering bespoke chip markup where it doesn't fight the
  DC visuals; match the DC skins via the chip's `variant`/props or a thin wrapper class.
- A11y: bar as `role="region"` `aria-label="Applied filters"`; each chip's remove is a
  `<button>` with `aria-label="Remove {group} {label}"`; clear-all is a `<button>`.

> Don't gold-plate — add the props above (clearly useful: controlled state, data-driven options,
> handlers, `className`), not speculative ones. Anything uncertain gets flagged, not invented.

---

## Design-pane sync (`f3859a7b…`)

Mirror each component as a **standalone, self-contained preview HTML** (inline CSS/JS, the same
`data-accent` token block + `@dsCard` first-line marker used by `save-button.html`) and add a
`cards[]` entry to `_ds_manifest.json`. Groups:

| Preview file | `@dsCard group` |
| --- | --- |
| `select.html` | Forms |
| `segmented-toggle.html` | Forms |
| `empty-state.html` | Feedback |
| `promo-tile.html` | Sections |
| `filter-group.html` | Filters |
| `applied-filter-bar.html` | Filters |

Sync uses the DesignSync tool ordering: `list_files`/`get_file` → `finalize_plan` (writes =
the six new `*.html` + `_ds_manifest.json`) → `write_files`. No deletes. The manifest keeps its
existing 32 cards and gains these six. Previews are authored from the ported React visuals so
pane and library stay identical.

---

## ShowcasePage

Add live demo bays so each is visually verified with the accent switcher:
- **Forms** section gains `Select` + `SegmentedToggle` (controlled `useState` demos, each variant).
- **Feedback** section gains `EmptyState` (dashed + panel, with/without CTA, `left` align).
- A new **Sections** bay for `PromoTile` (all 5 skins, row + stack).
- A new **Filters** section (imports the two composites) for `FilterGroup` (all 4 variants,
  searchable/collapsible) + `AppliedFilterBar` (remove + clear-all live).

Nav rail (`NAV_SECTIONS`) updated to match.

---

## Tests (co-located, one per component — blocker if missing)

Follow `Chip.test.tsx` / `Modal.test.tsx` / `QtyStepper.test.tsx` patterns. Every component:
render-with-accessible-name + `toHaveNoViolations()`. Interactive ones additionally:
- **Select** — controlled + uncontrolled selection, open/close, Esc closes + refocuses trigger,
  keyboard arrow navigation, disabled option not selectable, outside-click closes.
- **SegmentedToggle** — controlled + uncontrolled pick, arrow-key roving, `aria-pressed` on
  active, boundary (single item, empty items).
- **EmptyState** — CTA/secondary handlers fire; renders without body/CTA (empty strings) safely.
- **PromoTile** — renders `<a>` for `href` vs `<button>` for `onClick`; stack layout; no-CTA case.
- **FilterGroup** — controlled + uncontrolled toggle, single vs multi mode, search filters +
  no-match state, collapse toggle, count pill, swatch variant colors from data.
- **AppliedFilterBar** — controlled remove + clear-all callbacks; uncontrolled self-manage;
  empty state; group prefix when `showGroups`.

Coverage must stay above the `vite.config.ts` thresholds.

## Verify

- `npm run build` + `npm run lint` + `npm test` + `npm run coverage` all green.
- `/showcase`: all six render; every variant matches its DC preview (hover/press/motion —
  `selDrop`/`selRise`, `fgPop`, `afbIn` timings preserved); accent switcher recolors all six.
- Edge cases: empty options, single option, long labels wrap, no-match search, all-chips-removed.
- Full keyboard pass on Select/SegmentedToggle/FilterGroup (Tab/Arrows/Enter/Esc, visible focus,
  focus returns on close).
- Design-pane: the six new cards appear in `f3859a7b` under the right groups and match the library.
- Cross-phase: `npm test` confirms no regression to existing primitives/composites/contexts.
