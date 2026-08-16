# Phase 1 — Primitives + Showcase

**Goal:** port the ~29 design-system primitives into `src/components/primitives/*`
(one folder each: `Component.tsx` + `Component.module.css`), and build a **ShowcasePage**
(`/showcase`) that renders every primitive with its variants plus the global accent switcher —
our working port of the DC "APEXLINE Design System" index. This is the largest, highest-learning
phase; pages in Phase 3 become thin because the hard parts live here.

**Depends on:** Phase 0. **Blocks:** Phase 2.

---

## The porting recipe (DC → React)
| DC construct | React equivalent |
| --- | --- |
| `data-props` schema | the component's `Props` interface |
| `renderVals()` returns | `props` + `useState` + derived consts |
| `{{ x }}` / `sc-if` / `sc-for` | `{x}` / `{cond && …}` / `list.map(...)` |
| `style="{{…}}"` inline | a `.module.css` class + CSS vars for dynamic bits |
| `style-hover` / `style-active` | `:hover` / `:active` rules |
| `this.setState` / lifecycle | `useState` / `useEffect` / hooks |
| `window.ApexCart` | `useCart()` |

Accent/hover/shadow always come from `var(--accent…)` — **never** re-implement the per-accent
JS map that each DC file carried.

---

## ⭐ Config-first & future-proofing (the important bit)

For **every** primitive: first read its DC source (`ConfigPanel` controls + the `data-props`
JSON) to capture the *current* configurable surface, then **extend** it with the extra props a
real design system needs. Rules:

- **Additive & optional** — every new prop has a safe default; the minimal call site
  (`<Button variant="lift" label="Shop" />`) must keep working unchanged.
- **Controlled-friendly** — interactive primitives accept `value`/`checked` + `onChange` (and
  work uncontrolled via `defaultValue` when it makes sense).
- **Composable** — accept `className`, `style`, `id`, `aria-*`, and forward the underlying DOM
  ref where relevant; spread `...rest` onto the root element.
- **Data-driven** — things the DC hardcoded (tab items, breadcrumb trail, carousel slides) become
  array props so the component is reusable.
- Don't gold-plate: add props that are clearly useful (sizes, states, handlers, icons), not
  speculative ones. When unsure whether an addition is worth it, note it and ask.

### Per-primitive config map — *current* (from DC) → *add for future-proofing*

**Buttons**
- **Button** — current: `variant` (lift/fill/shine/ghost/icon/press/danger), `label`. Add:
  `size` (sm/md/lg), `disabled`, `loading`, `fullWidth`, `iconLeft`/`iconRight`, `as` (`button`|`a`),
  `href`, `type`, `onClick`, `...rest`.
- **ActionButton** — current: `variant` (add-to-cart/submit). Add: `label`/`loadingLabel`/`doneLabel`,
  `state` (idle/loading/done) controllable, `disabled`, `onClick`, `fullWidth`.
- **Chip** — current: `variant` (select/filter/nav), `label`. Add: `selected`, `onToggle`,
  `removable` + `onRemove`, `count`, `icon`, `disabled`.

**Cards**
- **Card** — current: `variant` (product/category/review/feature), `title`, `brand`. Add: `price`,
  `image`/`media`, `href`/`onClick`, `badge`, `footer`, `children`.

**Navigation**
- **Tabs** — current: `variant` (underline/pill/segment), `speed`. Add: `items[]`,
  `value`/`defaultValue`, `onChange`, `fullWidth`, `size`.
- **Breadcrumbs** — current: `separator` (chevron/slash/dot), `speed`. Add: `items[] {label, href}`.
- **Pagination** — current: `total`, `variant` (numbers/dots), `speed`. Add: `page`, `onChange`,
  `siblingCount`, `showPrevNext`.

**Overlays**
- **Modal** — current: `variant` (center/sheet). Add: `open`, `onClose`, `title`, `children`,
  `footer`, `size`, `closeOnScrim`, `showClose`.
- **Tooltip** — current: `placement` (top/bottom/left/right), `speed`. Add: `content`, `children`
  (trigger), `trigger` (hover/click/focus), `delay`, `disabled`.
- **BottomSheet** — current: `title`. Add: `open`, `onClose`, `children`, `snapPoints`, `showHandle`.

**Forms**
- **TextInput** — current: `placeholder`. Add: `label`, `value`, `onChange`, `type`, `name`,
  `error`/`hint`, `disabled`, `iconLeft`/`iconRight`, `required`.
- **Toggle** — current: `size` (small/medium/large). Add: `checked`, `onChange`, `disabled`,
  `label`, `name`.
- **Checkbox** — current: `size`, `shape` (rounded/circle). Add: `checked`, `indeterminate`,
  `onChange`, `disabled`, `label`, `name`.
- **SearchBar** — current: `placeholder`. Add: `value`, `onChange`, `onSubmit`, `onClear`, `loading`.
- **ColorSwatch** — current: `size`. Add: `colors[]`, `value`, `onChange`, `disabled` per option, `label`.
- **RangeSlider** — current: `min`, `max`, `prefix`. Add: `value` (single **or** dual `[lo,hi]`),
  `step`, `onChange`, `suffix`, `disabled`.

**Data display**
- **Accordion** — current: `mode` (single/multi), `speed`. Add: `items[] {q,a}`, `defaultOpen`.
- **Badge** — current: `variant` (soft/solid/outline/dot), `label`. Add: `tone`
  (accent/success/danger/gold/neutral), `size`, `icon`, `pulse`.
- **StatCard** — current: `value`, `label`, `delta`. Add: `trend` (up/down), `prefix`/`suffix`,
  `icon`, `countUp` toggle, `duration`.

**Inputs**
- **Rating** — current: `max`, `icon` (star/circle/heart). Add: `value`, `onChange`, `readOnly`,
  `allowHalf`, `size`.
- **QtyStepper** — current: `variant` (rounded/pill). Add: `value`, `min`, `max`, `onChange`, `size`, `disabled`.

**Feedback**
- **Skeleton** — current: `variant` (text/card), `lineHeight`. Add: `lines`, `width`, `circle`, `radius`.
- **Spinner** — current: `size`. Add: `thickness`, `color` (defaults to accent), `label` (a11y).
- **ProgressBar** — current: `height`, `speed`. Add: `value` (0–100), `indeterminate`, `showLabel`, `tone`.
- **Toast** — current: `message`, `position` (bottom/top), `duration`. Add: `tone`
  (success/error/info), `open`, `onDismiss`, `action`, `icon`.

**Media**
- **Carousel** — current: `autoplay`, `interval`, `speed`. Add: `items[]`/`children`, `loop`,
  `showArrows`, `showDots`, `index`/`onChange`, `pauseOnHover`.
- **HoverZoom** — current: `zoom`, `mode` (overlay/always). Add: `src`/`media`, `alt`, `overlayContent`.

**Motion**
- **CountUp** — current: `value`, `suffix`, `duration`. Add: `prefix`, `decimals`, `easing`,
  `startOnView` (uses `useReveal`).
- **Marquee** — current: `variant` (dark/solid), `direction` (left/right), `speed`. Add:
  `items[]`/`children`, `pauseOnHover`, `gap`.

> Reference: **Button Motion Kit** / **Component Motion Kit** DC files document the intended
> easings/keyframes — consult them when tuning transitions, but they aren't components to port.

---

## ShowcasePage
Port of the DC design-system index: left nav rail by category, a card ("bay") per primitive
showing a live demo + its variants, and the **global accent switcher** wired to `useTheme()`.
This is how each primitive is visually verified in isolation as it's built. Route: `/showcase`.

## Suggested build order (dependency-friendly)
1. Foundations of look: **Button, Chip, Badge, Card**.
2. Forms: **TextInput, Toggle, Checkbox, ColorSwatch, RangeSlider, SearchBar**.
3. Feedback/motion: **Spinner, Skeleton, ProgressBar, Toast, CountUp, Marquee**.
4. Data/inputs: **Rating, QtyStepper, StatCard, Accordion**.
5. Navigation: **Tabs, Breadcrumbs, Pagination**.
6. Overlays/media: **Modal, Tooltip, BottomSheet, Carousel, HoverZoom**.
7. **ActionButton** (uses `useCart` + spinner/check states).
8. Barrel `components/primitives/index.ts`; assemble **ShowcasePage** as they land.

## Verify
- `/showcase` renders every primitive; each variant matches its DC preview (hover, press, motion).
- Flipping the accent switcher recolors **all** primitives (proves CSS-variable theming).
- `tsc --noEmit` + `build` green. Interactive primitives work both controlled and uncontrolled.
- Spot-check a couple against the live DC render via the design MCP.
