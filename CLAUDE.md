# CLAUDE.md

## Project
APEXLINE — a helmet e-commerce storefront. Porting a Claude-Design "DC" format design
system into a real React + TypeScript component library and site.
Currently **frontend-only** (mock data in `src/data/*`); backend comes in a later,
separate phase. Full architecture: `ARCHITECTURE.md`. Phase breakdown: `docs/README.md`
→ `docs/phase-{0,1,2,3}-*.md`.

Because the backend doesn't exist yet, treat `src/data/*` as a stand-in for a future
API contract: shapes, IDs, and async-looking access patterns should already look like
what a real fetch layer would return, so swapping in a backend later doesn't force a
rewrite of components.

## Workflow rules
- Before writing code for a new phase or any non-trivial feature, write/update the
  plan as a phase markdown doc (`docs/phase-N-*.md` style) and get it reviewed first.
  Do not start implementing multi-step work straight from a chat message.
- Work one phase at a time, in order (0 → 1 → 2 → 3, then backend phases later).
  Don't start a later phase's components until the current phase's Verify checklist
  is fully green.
- Each DC source component is pulled via the design MCP (`get_file`) at build time,
  not guessed from memory or recreated from a screenshot — the phase doc captures
  architecture and intent; exact markup/behavior comes from the source per component.
- When a phase doc and the live DC source disagree, the DC source wins for visuals/behavior;
  flag the discrepancy back to the user rather than silently picking one.

## Component conventions
- One folder per component: `Component.tsx` + `Component.module.css`, exported via
  the tier's `index.ts` barrel (`primitives/index.ts`, `composite/index.ts`).
- Props: a single exported `ComponentNameProps` interface. Required props are only
  the ones with no sane default. Everything else optional with a documented default
  (in a one-line comment only if the default isn't obvious from the signature).
- Config-first & future-proof: when porting a primitive, audit its original DC
  `data-props` / ConfigPanel controls and extend with sensible extra optional props
  (sizes, states, handlers, `className`/`style` escape hatch) so the component
  outlives its first call site. Additions must be optional with safe defaults —
  never break the minimal call site or change default visual output.
- Never hardcode hex colors, spacing, or radii — read design tokens via
  `var(--accent)`, `var(--accent-hover)`, `var(--accent-shadow)`, and the token set
  in `styles/tokens.css`. If a value isn't in tokens.css yet and is reused, add it
  there instead of inlining it.
- Controlled vs uncontrolled: prefer controlled (value + onChange from the parent)
  for anything that feeds cart/checkout state; uncontrolled-with-optional-override
  is fine for purely presentational primitives (e.g. Accordion open state) — but
  always allow a controlled override via props, don't force one mode.
- Accessibility is not optional even though the DC source may lack it: interactive
  primitives need semantic elements or proper `role`, keyboard operability (Tab/Enter/
  Space/Escape/Arrow keys as appropriate), visible focus states, and `aria-label`/
  `aria-*` where the visual label isn't the accessible name (icon buttons, swatches).
- Effect/lifecycle logic belongs in hooks (`src/hooks/*`), not copy-pasted per component.
- Content is data: copy, prices, options live in `src/data/*` or are passed as props —
  never hardcoded inside a component or page.
- Loading/empty/error states are part of the component's job, not an afterthought:
  any component that will eventually receive async data (ProductCard, reviews,
  search results) accepts the visual states now (skeleton/empty/error props or
  variants) even while it's fed mock data synchronously.

## Porting recipe (DC → React)
Follow `ARCHITECTURE.md`'s mapping table exactly for consistency across all ~29
primitives / composites:

| DC construct | React equivalent |
| --- | --- |
| `data-props` JSON schema | `Props` interface (+ future-proof additions, optional) |
| `renderVals()` return values | `props`, `useState`, derived consts |
| `{{ label }}` | `{label}` |
| `sc-if value` | `{cond && …}` |
| `sc-for list as x` | `list.map(x => …)` |
| `style="{{ x }}"` | `.module.css` class + CSS var for the dynamic part |
| `style-hover` / `style-active` | `:hover` / `:active` in the module CSS |
| `this.setState` | `useState` setters |
| `componentDidMount` effects | `useEffect` / a hook |
| `window.ApexCart` | `useCart()` |

Extra rules beyond the mechanical mapping:
- Preserve animation timing/easing values exactly (duration, cubic-bezier, delay) —
  motion is a deliberate part of this design language, not incidental.
- Where the DC source has no accessible markup (div-as-button, no focus states),
  upgrade it to a real button/semantic element rather than reproducing the gap —
  visuals must match, but underlying markup doesn't have to be div-for-div.
- Icons/assets referenced by the DC source are pulled via the design MCP alongside
  the component, not substituted with a lookalike.

## Verification
Green build/lint/tests is necessary but not sufficient — a phase is only done once
it's also been driven in a real browser against the checklist below.

**Static checks (every commit)**
- `npm run build` (`tsc -b && vite build`) and `npm run lint` are clean.
- No hardcoded hex/px values introduced where a token already exists.

**Automated tests (every commit)**
- `npm test` is green and `npm run coverage` meets the thresholds in `vite.config.ts`.
- Test architecture: co-located `Component.test.tsx` / `useX.test.ts` next to the unit
  it covers (primitives, hooks, `CartContext`, `ThemeContext`, `src/lib/*`); cross-cutting
  suites live in `tests/` (`tests/utils` shared render helper + fixtures, `tests/contracts`
  for `src/data/*` shape guarantees, `tests/integration` for provider+consumer flows,
  `tests/e2e` for Playwright once it exists).
- **If a test case doesn't already exist for the component/hook/context/data module you're
  touching, write one before considering the work done** — don't fall back to "verified
  manually in the browser" as a substitute when the behavior is testable. Manual browser
  verification (below) covers what automated tests structurally can't (real paint, motion,
  cross-page flows); it doesn't replace tests for logic, state, and rendered output that
  can be asserted directly.
- New primitives get at minimum: an accessible-name render test and one `vitest-axe`
  `toHaveNoViolations()` check. Interactive primitives (anything with `value`/`onChange`,
  keyboard handling, or open/close state) also get controlled + uncontrolled coverage and
  boundary-condition tests (min/max, empty, disabled) — follow the pattern in an existing
  primitive test (e.g. `QtyStepper.test.tsx`, `Modal.test.tsx`) rather than inventing a new one.
- A failing or missing test is a blocker for that piece of work, the same as a failing build.

**Functional — happy path**
- The phase's own Verify checklist in `docs/phase-N-*.md` passes end-to-end in the browser.
- Accent switcher (all 4 presets) recolors every affected component with no stale colors.

**Functional — edge cases (check per component/page, not just the golden path)**
- Empty states: empty cart, zero PLP/search results, product with no reviews/FAQs.
- Boundary states: qty stepper at min/max, single-page pagination, last/first page,
  out-of-stock product (add-to-cart disabled, not just visually greyed).
- Long/overflowing content: long product names/titles wrapping in cards, long review
  text, many chips/filters wrapping the layout instead of breaking it.
- Data reload: cart state and accent survive a full page refresh (localStorage
  hydration), and don't throw if localStorage is empty/corrupted on first load.
- Interrupted flows: navigating away mid-checkout, back button after add-to-cart,
  duplicate rapid clicks on add-to-cart/qty controls not double-submitting.

**Accessibility**
- Full keyboard pass: Tab order is logical, every interactive element is reachable
  and operable without a mouse, focus is visible, Escape closes modals/sheets/drawers
  and returns focus to the trigger.
- Screen-reader labels present on icon-only controls, form inputs, and status changes
  (toast, cart badge count) — not just visual text.

**Responsive**
- Desktop/mobile header swap at the documented breakpoint (800px) with no layout jump.
- Key pages (Home/PLP/PDP/Cart/Checkout) checked at a mobile width, a tablet width,
  and a wide desktop width — no horizontal scroll, no clipped/overlapping content.

**Cross-phase regression**
- Advancing to a new phase does not silently break an earlier phase's Verify checklist —
  run `npm test` (covers primitives/hooks/contexts automatically) and re-run the prior
  phase's manual browser checks if the new phase touched shared primitives, tokens, or
  context (Theme/Cart).

**Forward-compat with the backend (frontend phases only)**
- Anything currently reading `src/data/*` would still work if that module's synchronous
  export were replaced with an async fetch returning the same shape — no component
  assumes data is available before first render without a loading state.
