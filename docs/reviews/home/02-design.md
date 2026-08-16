# Home Page — Principal Designer Review

*Lens: visual design, motion, UX rules, accessibility, and fidelity to the DC source.*
Findings D1–D9. See [`README.md`](./README.md) for the ranked matrix.

> Basis: the live DC source **"Helmet Showroom Home"** (DesignSync
> `6fb6200b-d6d0-40a7-8520-588a73e78751`) was pulled and diffed line-by-line against the
> implementation. Per `CLAUDE.md`, when the phase doc and the live DC source disagree, the
> **DC source wins for visuals/behavior** — so the fidelity gaps below are flagged, not
> silently accepted.

---

## ⛔ Intentional deviations — do NOT revert (covers D7)

These differ from the raw DC source **on purpose** and are correct. A later execution pass
must not "fix" them back while matching DC:

| Deviation | Why it's right |
| --- | --- |
| £ → ₹ prices (via `lib/format.ts`) | Localization to the Indian market (`phase-3-home.md §1d`). |
| "UNIT 4… LONDON / 9AM–7PM" → "…BENGALURU / 10AM–8PM" | Same localization. |
| Fictional brands (APEX/STRATA/NORDVIK…) → real brands | Real catalog, meaningful PLP filters. |
| Stats animate via `CountUp` | DC shows static text; animated count is a sanctioned enhancement (`phase-3-home.md §2`). |
| Compare & Showroom headings `h3` → `h2` | Heading-hierarchy correctness — DC's `h3`-without-`h2` skips a level. A11y upgrade. |
| Rail tabs are real `role="tab"` + roving `tabIndex` + arrow keys | DC used plain `<button>`s with no keyboard model. A11y upgrade (`phase-3-home.md §6`). |
| Empty-state message on rails | DC assumed always-populated lists; graceful empty is an upgrade. |

Everything **below** this box is a genuine gap to close.

---

## D1 · High · M — Rails are horizontal shelves; DC renders wrapping grids  ❓decision

**Problem.** On the home page the Helmets and Accessories rails are **horizontal
drag-scroll shelves** (cards in a single row that overflows sideways). In the DC source the
same rails are **responsive wrapping grids** — cards flow onto multiple rows and never
scroll horizontally. This is the most visible structural divergence from the design.

**Evidence.**
- DC `renderVals()` → `shelfRowStyle` (the default, non-grid layout):
  ```
  display:grid; grid-template-columns:repeat(auto-fit, minmax(148px, 1fr)); gap:12px;
  padding:12px clamp(16px,3vw,32px) 22px;
  ```
  The DC `data-drag="1"` handler sets `scrollLeft`, but over a wrapping grid that never
  overflows horizontally it is effectively a **no-op** — the rendered design wraps.
- Ours: `src/pages/HomePage/HomePage.tsx:33,36` renders `<ProductRail … />` with **no
  `layout` prop** → defaults to `'shelf'`
  (`src/components/composite/ProductRail/ProductRail.tsx:39`) →
  `src/components/composite/ProductRail/ProductRail.module.css` `.shelf` =
  `display:flex; gap:12px; overflow-x:auto; cursor:grab;` with `fixedWidth` cards. That is
  a real horizontal scroller, not a grid.

**Solution (flag for decision — do not silently keep).**
- **Recommended (match DC):** pass `layout="grid"` on both home rails in
  `HomePage.tsx`. `ProductRail`'s grid mode
  (`repeat(auto-fit, minmax(160px, 1fr))`) already mirrors DC's wrapping behaviour; nudge
  the `minmax` to `148px` to match exactly. Keep `shelf` available for other pages
  (PLP-related / PDP-related rails), where a horizontal shelf is a defensible pattern.
- **Alternative (conscious enhancement):** keep the drag-shelf as a deliberate mobile-first
  choice — but then **document it** as an intentional deviation (it currently isn't), since
  the `useDragScroll` hook + shelf are already built and tested.

**Verify.** Side-by-side against the DC preview at 1280 / 768 / 375; if switched to grid,
cards wrap into rows with no horizontal scroll. `npm test` (add/keep a ProductRail grid
test).

---

## D2 · High · S — Scroll-reveal easing/timing is wrong

**Problem.** Sections fade/slide in with the wrong curve and duration. Motion is a
deliberate part of this design language (`CLAUDE.md`: "preserve animation timing/easing
values exactly"), and this one is off from both the DC source and the phase doc's own spec.

**Evidence.**
- Ours: `src/styles/global.css:193-199`
  ```css
  .reveal { opacity:0; transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease; }
  ```
- DC + `docs/phase-3-home.md §5` require: `opacity/transform .7s cubic-bezier(.2,.7,.2,1)`,
  `translateY(26px)`.

**Solution.**
```css
.reveal { opacity:0; transform: translateY(26px);
  transition: opacity .7s cubic-bezier(.2,.7,.2,1),
              transform .7s cubic-bezier(.2,.7,.2,1); }
```
(Shared file — used by every home section via the `Reveal` wrapper. Low risk; the
`prefers-reduced-motion` block at `global.css:230-239` still neutralizes it.)

**Verify.** Reveal feels like the DC source (slightly longer, eased-out); reduced-motion
still short-circuits to the final state.

---

## D3 · High · M — Ambient glow diverges from DC

**Problem.** The accent "glow" behind the hero looks and behaves differently from the
design: different placement, a longer pulse, and an extra scale animation the DC never had.

**Evidence.**
- DC home ships a **page-local** glow div:
  ```
  position:absolute; top:20px; right:-140px; width:420px; height:420px;
  background:radial-gradient(circle, <accent-shadow>, transparent 65%);
  filter:blur(20px); animation:glow 6s ease-in-out infinite;
  ```
  DC `@keyframes glow { 0%,100%{opacity:.55} 50%{opacity:.9} }` — **opacity only**.
- Ours: the home page has **no page-local glow**; it inherits `SiteLayout`'s `.glow`
  (`src/components/layout/SiteLayout.module.css`) which is a **fixed** full-bleed radial
  animated `glow 9s`, and `src/styles/global.css` `@keyframes glow` adds
  `transform: scale(1.08)` at 50% — a pulse DC doesn't have.
- Net: placement (page-local top-right vs fixed full-bleed), duration (**6s vs 9s**), and
  an **added scale** all differ.

**Solution (touches shared layout — do deliberately).**
- **Option A (closest to DC):** add a page-local glow div to `HomePage` matching the DC
  spec above, reading `var(--accent-shadow)`; leave `SiteLayout` alone for other pages.
- **Option B (reconcile shared):** change `SiteLayout`'s glow to `6s` and drop the
  `scale` from the `glow` keyframe so it's opacity-only — but this changes every page, so
  confirm intent first.
- Recommended: **A** (scope the fix to the home page; don't perturb other routes).

**Verify.** Glow sits top-right near the hero, pulses opacity only, on a 6s cycle; matches
the DC preview.

---

## D8 · High · S — No visible `:focus-visible` on home controls

**Problem.** Keyboard focus is invisible on almost every interactive element on the page.
Hover and active states are styled; the focus state is not, so a keyboard user can't tell
where they are. Accessibility is not optional here (`CLAUDE.md`).

**Evidence.** `:hover`/`:active` only, no focus styling, on:
- `src/pages/HomePage/HomePage.module.css` — `.ctaPrimary` (167/173), `.ctaGhost` (190),
  `.storeSecondary` (479), `.seeAll` (39), `.compareLink` (338).
- `src/components/composite/CategoryCard/CategoryCard.module.css` — `.card` (22/28).
- `src/components/composite/ProductRail/ProductRail.module.css` — `.tab` (59/64) and
  `.seeAll` (32). (Only `.track:focus-visible` at line 110 exists.)
- `src/styles/global.css:46-50` strips the default `button` border and `a` has
  `color:inherit; text-decoration:none` — so nothing draws focus by default.

**Solution.** Add a consistent focus ring to every interactive home element:
```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```
applied per-class (CTAs, category card, rail tabs, see-all, compare link). Reuse the exact
treatment already on `.track:focus-visible` for consistency.

**Verify.** Full keyboard Tab pass — focus is clearly visible on every CTA, card, tab, and
link, in all four accent themes.

---

## D6 · Med · S — Segmented-control colours off DC

**Problem.** The Bestsellers / New Arrivals segmented control is slightly lower-contrast
than the design in its inactive state.

**Evidence.** DC `segStyle`: inactive border `rgba(255,255,255,.14)`, inactive text
`#b0b0b6`. Ours (`ProductRail.module.css` `.tab`, 44-57): border `var(--border)` (`.09`)
and colour `var(--text-muted)` (`#9a9aa0`). So both border and text sit a step dimmer than
DC.

**Solution.** Introduce a control-border token (see D9's `--border-strong`, or a dedicated
`--control-border: rgba(255,255,255,.14)`) and an inactive-label token to match DC, or set
these values directly on `.tab`.

**Verify.** Inactive tabs match DC contrast; active state (accent fill) unchanged.

---

## D9 · Med · S — Non-tokenized colour literals

**Problem.** Several raw `rgba()` literals appear where the project rule says to use tokens
(`CLAUDE.md`: "Never hardcode hex/… If a value isn't in tokens.css yet and is reused, add
it there"). **Important nuance:** some of these faithfully reproduce the DC source's
*varied* white-alpha borders (`.2`, `.18`, `.14`, `.09`, `.08`), so **do not flatten
everything to `--border`** — that would flatten a deliberate visual gradient. Add the
missing tokens instead.

**Evidence.**
- `src/pages/HomePage/HomePage.module.css`: `.ctaGhost`/`.storeSecondary` borders
  `rgba(255,255,255,.2)` (185, 471); `.compareTilePlus` `rgba(255,255,255,.18)` (376);
  hero/store sweep overlay `rgba(255,255,255,.05)` (82, 413); `.stat:hover`
  `rgba(255,255,255,.04)` (216); `.heroInner` gradient `rgba(8,8,10,.2)` (120).
- `src/components/composite/CategoryCard/CategoryCard.module.css:25` — hover shadow
  `rgba(0,0,0,.55)`.

**Solution.** Add to `src/styles/tokens.css` and reference:
```css
--border-strong: rgba(255,255,255,.2);   /* ghost-CTA / plus-tile borders */
--overlay-sweep: rgba(255,255,255,.05);  /* hero/store shimmer sweep */
--surface-hover: rgba(255,255,255,.04);  /* stat hover wash */
--shadow-card: 0 16px 34px rgba(0,0,0,.55);
```
Keep `--border` (`.09`) for hairlines; use `--border-strong` for the intentionally heavier
ones. (`.18` is a one-off dashed border — token only if it recurs.)

**Verify.** No raw literal remains where a token now exists; rendered colours are
pixel-identical (these tokens equal the current literals).

---

## D4 · Low · S — Hero gradient stop uses solid bg

**Problem.** The hero's bottom scrim is a touch more opaque than DC at its first stop.

**Evidence.** `HomePage.module.css:120` uses `var(--bg)` (`#08080a`, α=1) at the 34% stop;
DC uses `rgba(8,8,10,.97)`.

**Solution.** Introduce a `--bg-97: rgba(8,8,10,.97)` token (or accept — the difference is
imperceptible). Low priority.

**Verify.** Hero scrim matches DC.

---

## D5 · Low · S — Micro-spacing vs DC

**Problem.** A few paddings differ from the DC source by 2–22px.

**Evidence.**
- Accessories rail: ours reuses `.rail` (`ProductRail.module.css:1`, top-pad **28px**); DC
  accessories section top-pad is **22px**.
- Section bottoms: several `.section` bottoms are **8px** vs DC **6px**.
- Compare band bottom: ours `.section` bottom **8px** vs DC symmetric **30px**.

**Solution.** Either add small per-section overrides (a `railTight` variant for
accessories; a `compareSection` with symmetric padding) or accept as within tolerance. Low
priority — none causes layout breakage.

**Verify.** Vertical rhythm matches the DC preview.

---

## Designer scorecard

| Area | Verdict |
| --- | --- |
| Token discipline | ✅ Strong overall; a few literals to tokenize (D9) |
| Layout fidelity | 🔴 Rails shelf-vs-grid (D1); minor spacing (D5) |
| Motion fidelity | 🔴 Reveal easing (D2), glow (D3); hero `fadeUp`/sweep are correct |
| Focus / a11y states | 🔴 `:focus-visible` missing (D8) |
| Semantic structure | ✅ Sections labelled; heading order upgraded (intentional) |
| Colour accuracy | 🟠 Segmented control (D6), hero scrim (D4) |
