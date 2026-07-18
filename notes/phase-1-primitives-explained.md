# Phase 1 — Primitives + Showcase, Explained

Study notes walking through *why* Phase 1 is built the way it is. Pairs with
[`docs/phase-1-primitives.md`](../docs/phase-1-primitives.md) (the spec) and
[`phase-0-foundations-explained.md`](./phase-0-foundations-explained.md) (read that first —
everything here *consumes* `useTheme()`, the `[data-accent]` trick, and nothing about Phase 0
changes).

---

## 1. The big picture — what got built, and why it's shaped this way

Phase 0 gave us tokens, theming, and two Contexts. Phase 1 doesn't touch any of that — it adds
**~29 self-contained UI building blocks** (`src/components/primitives/*`) plus one page
(`src/pages/ShowcasePage.tsx`) that renders all of them at once.

Why build every button, toggle, modal, etc. *before* any real page? Because a primitive built
in isolation, with every variant visible side-by-side, gets bugs caught immediately (wrong
hover state, broken theming, a variant nobody wired up). A primitive built *while* also wiring
up a product page hides those bugs behind "well it kind of works for this one case." The
showcase is the forcing function — see [section 8](#8-the-showcasepage--proving-it-all-works).

Every primitive folder follows the same two-file shape:
```
src/components/primitives/Button/
  Button.tsx          ← component + its TypeScript Props
  Button.module.css   ← its styles, and only its styles
```

## 2. CSS Modules — why `.module.css` instead of `global.css`

Phase 0's `global.css` and `tokens.css` are **global** — a class like `.btn` there would apply
to *any* element with that class, anywhere in the app. That's fine for one-off things, but with
29 components each wanting their own `.btn`, `.track`, `.item`, `.panel` class names, global
CSS would collide constantly (Accordion's `.item` fighting Card's `.item`).

A file named `*.module.css` gets special treatment from Vite: instead of importing it for its
side effect, you import it as a **JS object** whose keys are your class names and whose values
are auto-generated, collision-proof strings:

```tsx
import styles from './Button.module.css';
// styles.btn === "Button-module__btn__a3F9k" (exact hash varies)
```

```css
/* Button.module.css */
.btn { padding: 10px 20px; }
```

So `styles.btn` in Accordion's file and `styles.btn` in Button's file resolve to two
*different* real class names on the page, even though the source CSS both say `.btn`. This is
what lets every component author write short, obvious class names without a global naming
convention (no more `.button-primary-lg` style prefixing) — the tool guarantees the isolation
instead of a human convention.

One consequence you'll see everywhere: dynamic class names go through a small `cx()` helper,
not string concatenation, because `styles.foo` is an opaque generated string, not `"foo"`.

## 3. `cx()` — the className joiner — `lib/cx.ts`

```ts
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
```

`...parts` is a **rest parameter** — `cx(a, b, c)` collects `[a, b, c]` into one array inside
the function. The type `string | false | null | undefined` is what lets you write conditional
classes inline without a ternary:

```tsx
cx(styles.btn, styles[variant], fullWidth && styles.fullWidth, className)
```

`fullWidth && styles.fullWidth` evaluates to `styles.fullWidth` when `fullWidth` is `true`, or
to the boolean `false` when it isn't (JS `&&` short-circuits and returns the falsy operand
itself, not the string `"false"`). `.filter(Boolean)` then throws away every `false`/`null`/
`undefined` entry before `.join(' ')` stitches the survivors into one class string. This one
seven-line helper is imported by all 29 primitives — it's the only "shared utility" this phase
needed.

`styles[variant]` (bracket access instead of `styles.variant`) is a small but deliberate trick:
since `variant` is a *string value* like `"lift"` at runtime, you can't write `styles.lift`
literally — you look it up dynamically with `styles[variant]`, which works because `styles` is
just a plain JS object under the hood.

## 4. The controlled/uncontrolled pattern — `Toggle.tsx`

This is the single most-repeated pattern in this phase — Toggle, Checkbox, RangeSlider,
TextInput, Tabs, ActionButton, Carousel, Toast all use it. Once you get it in `Toggle`, you have
it everywhere.

**The problem:** a form control needs to work two different ways depending on who's using it.
Sometimes the parent wants full ownership of the value (a filter panel that needs to read the
toggle's state to filter a list). Sometimes the parent doesn't care and just wants the toggle to
manage itself (a settings row with no other logic attached). Forcing every caller to wire up
`useState` for the second case is annoying busywork.

```tsx
export function Toggle({ checked, defaultChecked = false, onChange, ... }: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange?.(!on);
  };
```

The component **always** keeps its own `internal` state as a fallback, but only *uses* it when
nobody passed a `checked` prop. `checked !== undefined` is the tell: if the parent never
mentioned `checked` at all (not even `checked={false}` — that's still "defined"), we're in
uncontrolled mode and manage state ourselves. If they did pass it, we treat their value as the
single source of truth and never touch `internal` for rendering — we just still call `setInternal`
too (harmless, since it won't be read) and always call `onChange` either way, so the parent
*can* upgrade to controlled at any time by starting to read that callback.

Two call sites, same component:
```tsx
<Toggle label="Uncontrolled" />                                  // manages itself
<Toggle checked={value} onChange={setValue} label="Controlled" /> // parent owns it
```

This mirrors exactly how a plain HTML `<input>` behaves (uncontrolled by default, controlled if
you fight it with `value` + `onChange`), which is why React calls this pattern "controlled
components" — Toggle is just reimplementing that convention for a custom widget that isn't a
real `<input>` under the hood.

The optional chaining `onChange?.(!on)` means "call `onChange` only if it was actually passed" —
without it, calling `undefined(!on)` would throw when a caller doesn't pass a handler at all.

## 5. Discriminated unions — `Button.tsx`'s `as="button" | "a"` split

Button needs to render either a `<button>` or an `<a>` (a "Shop now" button that's really a
link). The two DOM elements accept genuinely different HTML attributes — `<a>` takes `href`,
`<button>` takes `type`/`disabled` in a different way — so one loose `Props` type would let you
write nonsense like `<Button as="a" type="submit" />` with no compile error.

```ts
type ButtonAsButton = BaseButtonProps & Omit<...HTMLButtonElement>, ...> & { as?: 'button' };
type ButtonAsAnchor = BaseButtonProps & Omit<...HTMLAnchorElement>, ...> & { as: 'a'; href?: string };
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;
```

This is a TypeScript **discriminated union**: two shapes joined with `|`, sharing one field
(`as`) whose *literal value* tells TypeScript which shape you're in. Once you write
`if (props.as === 'a')`, TypeScript narrows `props` to `ButtonAsAnchor` for the rest of that
branch — you get autocomplete for `href` and a compile error if you reference something that
only exists on the button variant. `Omit<ButtonHTMLAttributes<...>, keyof BaseButtonProps>`
means "take every standard button HTML attribute (`onClick`, `disabled`, `form`, ...) except the
ones we've already redeclared ourselves" — so `...rest` can be spread straight onto the real DOM
node without fighting our own prop names.

## 6. Generics for a prop that can be one shape or two — `RangeSlider.tsx`

A price filter slider needs to support both a single value (max price) and a dual-handle range
(min *and* max price) — same component, two different value shapes.

```ts
type SingleValue = number;
type DualValue = [number, number];

export interface RangeSliderProps<V extends SingleValue | DualValue = SingleValue> {
  value?: V;
  onChange?: (value: V) => void;
  ...
}

export function RangeSlider<V extends SingleValue | DualValue = SingleValue>({ ... }: RangeSliderProps<V>) {
```

`<V extends SingleValue | DualValue = SingleValue>` is a **generic type parameter with a
constraint and a default**. Read it as: "this component takes a type `V`, which must be either
a plain number or a `[number, number]` tuple; if the caller doesn't specify, assume plain
number." So:

```tsx
<RangeSlider value={5000} onChange={(v) => ...} />              // V inferred as number
<RangeSlider value={[1000, 9000]} onChange={(v) => ...} />       // V inferred as [number, number]
```

— and inside the second call's `onChange`, TypeScript knows `v` is a tuple, so `v[0]`/`v[1]` are
valid without any manual casting at the *call site*. Inside the component itself we still juggle
`Array.isArray(current)` checks and casts (`current as DualValue`) because TypeScript can't
statically prove which branch of the union a runtime array-check narrows to as cleanly as it can
at the call site — that's a known rough edge with generic unions, which is why the code pulls
`isDual`/`lo`/`hi` into named consts once up front rather than re-checking `Array.isArray`
inline everywhere (this was a real `tsc` error hit and fixed during this phase).

The dragging logic itself (`onPointerDown` → `window.addEventListener('pointermove', ...)`) is
a common vanilla-DOM pattern for drag interactions: capture the pointer on the element you
pressed (`setPointerCapture`), listen on `window` (not the element) so the drag keeps tracking
even if the cursor leaves the thumb, and clean up both listeners on `pointerup`.

## 7. Animating height without measuring the DOM — `Accordion.module.css`

The classic hard problem in CSS: you can't `transition: height` from `0` to `auto`, because CSS
transitions need two concrete numbers to interpolate between, and `auto` isn't one — the usual
workaround is measuring the content's pixel height in JS (`scrollHeight`) and animating to that
number, which means every accordion needs a `ResizeObserver` or manual remeasuring.

This project avoids that entirely with a **CSS Grid trick**:

```css
.panelWrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--speed) ease; }
.open .panelWrap { grid-template-rows: 1fr; }
.panel { overflow: hidden; min-height: 0; }
```

A grid track sized `1fr` means "take a fractional share of the available space"; sized `0fr` it
takes *zero* share — effectively collapsing that row to nothing. Critically, **`fr` values are
animatable** the same way pixel values are, so the browser can smoothly tween from `0fr` to
`1fr`. The actual content sits in a nested `.panel` with `overflow: hidden`, which just gets
visually clipped while its grid row is shrunk. Net effect: pixel-perfect open/close height
animation, zero JavaScript, zero measuring — just two CSS rules gated by the `.open` class that
`Accordion.tsx` toggles.

`style={{ '--speed': ... } as React.CSSProperties}` on the root is how the component makes its
`speed` *prop* control a CSS custom property inline — TypeScript's `CSSProperties` type doesn't
know about custom `--x` properties by default, hence the `as` cast to tell it "trust me, this is
valid inline style."

## 8. Portals for anything that must escape its parent — `Modal.tsx`

```tsx
return createPortal(
  <div className={styles.scrim}>...</div>,
  document.body,
);
```

Normally a React component renders exactly where it sits in the JSX tree — a `<Modal>` rendered
inside a deeply nested `<ProductCard>` would produce DOM nested inside that card, which is a
problem for anything full-screen: a parent with `overflow: hidden` or a lower `z-index` stacking
context could visually clip or bury the modal, even though logically it should sit on top of
*everything*.

`createPortal(children, domNode)` tells React "render this subtree's actual DOM into
`domNode`, but keep it in the *logical* React tree exactly where it is" — so it still receives
props/context normally and unmounts when its parent does, it just physically lives at the end of
`<body>` in the actual page, sidestepping every ancestor's CSS. This is the standard React
pattern for modals, tooltips-that-can-overflow, toasts, and dropdowns.

The rest of `Modal.tsx` is a `useEffect` that (a) sets `document.body.style.overflow = 'hidden'`
while open, so the page behind the modal can't scroll, and (b) listens for the `Escape` key to
close it — both undone in the cleanup function when the modal closes, exactly like the
`IntersectionObserver` cleanup pattern from Phase 0's `useReveal`.

## 9. The config-first rule, in practice

The spec's ⭐ rule was: read what the original DC component configured, then *add* the props a
real design system needs (sizes, controlled value, `disabled`, `className`, `...rest`) —
without breaking the minimal call site. You can see the result in almost every primitive above:

- `Button` started as "variant + label" and grew `size`, `loading`, `fullWidth`, `iconLeft/Right`,
  `as`, all **optional with defaults**, so `<Button variant="lift" label="Shop" />` still works
  unchanged.
- `Toggle`/`RangeSlider`/etc. all accept `className` and forward it into `cx(...)` last, so a
  page-specific override can always win without editing the primitive.
- Data that DC hardcoded into markup (accordion questions, tab labels, breadcrumb trail) became
  array props (`items: AccordionItem[]`) — the exact same reasoning as Phase 0's
  `Product` interface: separate "what the data is" from "how it's rendered," so a page can feed
  in real content later without touching the component.

## 10. The barrel file — `components/primitives/index.ts`

```ts
export { Button } from './Button/Button';
export { Toggle } from './Toggle/Toggle';
// ...27 more
```

A **barrel** is a single file that re-exports everything in a directory, so consumers write:
```ts
import { Button, Toggle, Modal } from '../components/primitives';
```
instead of one import line per component per file. This is purely developer convenience — it
adds no behavior, it's just a shorter, single, stable import path that `ShowcasePage.tsx` (and
every later page) uses.

## 11. The ShowcasePage — proving it all works

`ShowcasePage.tsx` reuses Phase 0's Context hooks directly — no new state-management pattern
needed:

```tsx
function AccentSwitcher() {
  const { accentKey, setAccent } = useTheme();
  return ACCENT_KEYS.map((key) => (
    <button onClick={() => setAccent(key)} style={{ background: ACCENTS[key].base }} />
  ));
}
```

This is the *exact* same `useTheme()` from Phase 0's `FoundationsPlaceholder`, just rendered as
a row of swatches instead of one row of text buttons. Clicking a swatch calls `setAccent`, which
(from Phase 0) stamps `data-accent` on `<html>` — and because every primitive's CSS reads
`var(--accent)` rather than a hardcoded color, **all 29 primitives recolor at once**, with zero
per-component re-render logic. That's the whole point of building theming as CSS variables
first: components downstream never need to know theming exists.

The page structure is four small layout components, composed rather than configured:

```tsx
<Section id="buttons" title="Buttons">      {/* one per category, matches the nav rail */}
  <Bay name="Button">                        {/* one per primitive, a card with a title */}
    <Row>                                    {/* lays out variant instances side by side */}
      <Button variant="lift" label="Lift" />
      <Button variant="fill" label="Fill" />
      ...
```

`NAV_SECTIONS` is one array of `{ id, label, items }` that drives *both* the left nav rail links
and (via matching `id`/`slug()` values) the `<Section>`/`<Bay>` anchors those links jump to —
another instance of the "one array, two renderings" pattern instead of hand-syncing a sidebar
against page content.

---

## Summary chain

**two-file component folders → CSS Modules for collision-free styling → `cx()` to join classes
conditionally → controlled/uncontrolled state as the default interactive pattern → TypeScript
discriminated unions and generics where a prop can genuinely take different shapes → CSS-only
tricks (grid-rows, portals) instead of JS measuring/z-index fights → config-first, additive
props → a barrel export → a showcase page that reuses Phase 0's `useTheme()` to prove every
primitive themes correctly at once.**

Phase 2 (composites) and Phase 3 (real pages) don't introduce new patterns — they just import
from `components/primitives` and combine what's already here, the same way Phase 0's summary
promised.
