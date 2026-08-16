# Home Page — Principal Frontend Engineer Review

*Lens: data integrity, component API design, state management, and the backend seam.*
Findings F1–F8. See [`README.md`](./README.md) for the ranked matrix.

## Executive read

The code is clean and idiomatic: sections are thin and presentational, content lives in
`src/data/*`, effects are isolated in hooks (`useReveal`, `useDragScroll`), class merging
goes through `cx`, and components read design tokens rather than hardcoding. Interactive
elements are real semantic elements (`<Link>`, `<button>`), not div-as-button. The issues
are localized: two data-integrity bugs, two component APIs that under-deliver on the
project's own "future-proof / all states" rules, and a couple of forward-compat notes.

---

## F1 · Med · S — ReviewsMarquee fabricates ratings and uses index keys

**Problem.** Every review card renders a **hardcoded 5-star** rating with empty
`date`/`title`, regardless of the actual review. The section header advertises 4.9, so the
cards contradict the headline (see **P4**). React keys are array indices.

**Evidence.** `src/pages/HomePage/sections/ReviewsMarquee.tsx:8-14`
```tsx
const items = HOME_REVIEWS.map((review, i) => (
  <ReviewCard
    key={i}
    review={{ id: `home-review-${i}`, author: review.name, rating: 5, date: '', title: '', body: review.quote }}
    model={review.model}
  />
));
```
`HOME_REVIEWS` (`src/data/home.ts:115-136`) has no `rating` field, so the component invents
one. `ReviewCard` itself renders the rating faithfully
(`src/components/composite/ReviewCard/ReviewCard.tsx:25`), so the fix is purely data.

**Solution.**
1. Extend `HomeReview` in `home.ts` with `rating: number` (and optionally `date?: string`);
   give the four entries a realistic spread (e.g. 5, 5, 4, 5) that averages ≈ 4.9.
2. Pass `rating: review.rating` through; drop the hardcoded `5`.
3. Key by a stable value (`` key={`${review.name}-${review.model}`} ``), not `i`.

**Verify.** Cards show varied ratings consistent with the header; covered by the new
`home.ts` contract test (**Q2**) and a `ReviewsMarquee` render test (**Q1**).

---

## F2 · Med · S — Rating representation is split across two types

**Problem.** The same "4.9" concept is a **number** in one place and a **string** in
another, and the review count is a pre-formatted string. This is the kind of inconsistency
that bites when the data becomes API-fed.

**Evidence.** `src/data/home.ts`
- `STATS` (40-44): `{ value: 4.9, decimals: 1, suffix: '★', label: 'Rated' }` — numeric.
- `STORE_RATING` (139): `{ score: '4.9', count: '2.1k' }` — strings.

**Solution.** Pick one representation. Recommended: store numbers
(`score: 4.9`, `count: 2100`) and format at the edge (a `formatCompact(2100) → '2.1k'`
helper alongside `lib/format.ts#formatPrice`). If `'2.1k'` must stay a display string,
type it explicitly and document that it's presentational.

**Verify.** `home.ts` contract test asserts the chosen types (**Q2**).

---

## F3 · Med · S — Wishlist heart is a dead control

**Problem.** The `ProductCard` heart button has an accessible label but no behaviour and no
backing feature — it renders on every home rail card. (Product framing in **P2**.)

**Evidence.** `src/components/composite/ProductCard/ProductCard.tsx:65-69`
```tsx
{heart && (
  <button type="button" className={styles.heart} aria-label={`Save ${name}`}>
    ♡
  </button>
)}
```
No `onClick`. Enabled on the home via `src/components/composite/ProductRail/ProductRail.tsx:115`
(`heart`). The DC home did **not** pass `heart`, so removing it also improves fidelity.

**Solution.**
- **Now:** drop `heart` from the home rails (remove the `heart` prop at `ProductRail.tsx:115`,
  or stop threading it from `HomePage`), so no non-functional control ships.
- **If a wishlist is wanted:** add an `onSave?: (product) => void` prop to `ProductCard`
  (keep it uncontrolled-friendly), back it with a localStorage store mirroring
  `CartContext`, and reflect saved state on the icon (`♡`/`♥`).

**Verify.** No inert affordance on rail cards; if built, the heart toggles and persists.

---

## F4 · Med · M — Quick-add bypasses variant selection  ❓decision

**Problem.** Quick-add (and the always-present `+` button) adds a cart line with **no
colour/size**, unlike the PDP flow which requires a variant. This produces under-specified
lines that may not merge with a properly-specified PDP line. (Commerce framing in **P3**.)

**Evidence.** `src/components/composite/ProductCard/ProductCard.tsx:42-46`
```tsx
const handleAdd = () => {
  if (soldOut) return;
  if (onAdd) onAdd(product);
  else add({ productId: id, name, brand, price });   // no color / size
};
```
Both the quick-add bar (77-81) and the footer `+` (100-108) call it. Compare with the PDP,
which gathers colour + size before calling `useCart().add`. Whether two lines merge depends
on the cart's line key — verify in `src/cart/CartContext.tsx` (if it keys on
`productId+color+size`, a variant-less line is a distinct row).

**Solution (decide — ❓ product call, see P3).**
- **Recommended:** on the home rails, make the card action **navigate to the PDP** rather
  than add; reserve real quick-add for variant-less accessories (add an
  `variantless?: boolean`/`quickAddable` signal on the product or derive it from
  `!colors && !sizes`).
- Or: quick-add opens a compact size/colour picker before adding.
- Or: pass an explicit default variant and label it.

**Verify.** Home-originated cart lines match the PDP line shape, or quick-add is only
enabled where the product truly has no variant. Add a cart-flow test for the chosen path.

---

## F5 · Low · S — ProductRail tabs are uncontrolled-only

**Problem.** `ProductRail` owns its active-tab state with no way for a parent to control or
observe it — a deviation from `CLAUDE.md`: "always allow a controlled override via props,
don't force one mode."

**Evidence.** `src/components/composite/ProductRail/ProductRail.tsx:46` — `useState(0)`
with no `activeTab` / `onTabChange` props in `ProductRailProps` (16-29).

**Solution.** Add optional `activeTabId?: string` + `onTabChange?: (id: string) => void`;
fall back to internal state when omitted (uncontrolled-with-override, the pattern the repo
uses elsewhere). Low urgency — the home doesn't need it yet, but it's the stated convention
and cheap now.

**Verify.** Controlled + uncontrolled tests, mirroring an existing interactive primitive
(e.g. `QtyStepper.test.tsx`).

---

## F6 · Low · S — ProductRail has no loading/error variant

**Problem.** `ProductRail` handles the **empty** state but exposes no `loading`/`error`
affordance — yet it's exactly the component that will receive async data later
(`CLAUDE.md`: components that will eventually receive async data "accept the visual states
now (skeleton/empty/error props or variants)").

**Evidence.** `src/components/composite/ProductRail/ProductRail.tsx:100-101` renders the
empty message; there is no `loading` path. It leans on `ProductCard`'s shimmer for the
image only.

**Solution.** Add an optional `loading?: boolean` that renders N `Skeleton`/placeholder
cards in the track, and (optionally) an `error?` slot. Safe default (`false`) keeps the
minimal call site unchanged.

**Verify.** A loading test asserts skeleton cards render and are `aria-busy`/labelled.

---

## F7 · Low · S — useDragScroll robustness

**Problem.** The drag hook ends a drag on `pointerleave` but never calls
`setPointerCapture`. A fast drag that leaves the element mid-press is handled (via
`pointerleave`), but pointer capture would keep tracking through the release for a smoother
result.

**Evidence.** `src/hooks/useDragScroll.ts:22-54` — wires `pointerdown/move/up/leave` +
capture-phase `click`, no `el.setPointerCapture(e.pointerId)`.

**Solution.** Optional hardening: `setPointerCapture` on `pointerdown`,
`releasePointerCapture` on end. Only relevant if D1 keeps the shelf layout; if the rails
become grids (D1), the drag hook is unused on the home and this is moot there.

**Verify.** Drag continues smoothly when the pointer exits the track mid-drag; existing
`useDragScroll.test.tsx` still green.

---

## F8 · info — Sync-only data seam

**Observation.** `src/pages/HomePage/HomePage.tsx:13-21` builds `helmetTabs` /
`accessoryTabs` at **module scope** by calling `getBestsellers`/`getNewArrivals`
synchronously, and `home.ts` is entirely synchronous. Correct today, but the project's
forward-compat rule says a `src/data/*` module should be swappable for an async fetch of the
same shape without a rewrite. These module-scope calls (and the section imports of `HERO`,
`STATS`, etc.) assume the data exists before first render.

**Recommendation.** No change now — flag it: when the backend lands, move the tab
derivation into the component with a loading path (ties to **F6**), and ensure sections
tolerate "data not yet arrived" (empty/skeleton) rather than assuming a synchronous import.

---

## Frontend scorecard

| Area | Verdict |
| --- | --- |
| Component structure / conventions | ✅ Clean, idiomatic, token-driven |
| Data integrity | 🟠 Fabricated ratings (F1), split rating types (F2) |
| Component API completeness | 🟠 Uncontrolled-only tabs (F5), no loading variant (F6) |
| Affordance correctness | 🟠 Dead heart (F3), variant-less quick-add (F4) |
| Effect isolation (hooks) | ✅ `useReveal` / `useDragScroll` well-factored |
| Backend forward-compat | ⚪ Sync-only seam — note for later (F8) |
