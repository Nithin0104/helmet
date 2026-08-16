# Phase 0 — Foundations, Explained

Study notes walking through *why* Phase 0 is built the way it is, in the order the app
actually boots. Pairs with [`docs/phase-0-foundations.md`](../docs/phase-0-foundations.md)
(the spec) and [`ARCHITECTURE.md`](../ARCHITECTURE.md) (the master plan).

---

## 1. The big picture — what stack, and why

We're using **Vite + React + TypeScript + React Router**, all client-side (no backend yet).

- **Vite** is the dev server + bundler. When you run `npm run dev`, it starts a local server
  that serves your files and instantly recompiles on save (no waiting for a full rebuild).
  `npm run build` produces the static files you'd actually deploy.
- **React** is the UI library — you describe UI as functions that return JSX (`<div>...</div>`-looking
  syntax that's actually JavaScript).
- **TypeScript** adds types on top of JavaScript so mistakes (like passing a string where a
  number is expected) get caught while you write code, not when a user hits the bug.
- **React Router** (`react-router-dom`) lets one page app have multiple "pages" (`/`, `/shop`,
  `/product/:id`...) without actually reloading the browser — it swaps components in and out
  based on the URL.

Nothing here is backend — `data/products.ts` is just a hardcoded array standing in for
"what an API would return later."

## 2. CSS custom properties (design tokens) — `styles/tokens.css`

```css
:root {
  --bg: #08080a;
  --accent: #ff3b24;
  --font-sans: 'Archivo', system-ui, sans-serif;
  --radius-md: 12px;
}
```

A CSS **custom property** (a "CSS variable") is anything starting with `--`. `:root` means
"attach this to the top of the document" so every element can see it. Anywhere else in CSS
you read it with `var(--name)`:

```css
body { background: var(--bg); }
```

**Why bother**, instead of just writing `background: #08080a` everywhere? Because now there's
exactly **one place** that defines what "the background color" means. If you ever want to
change the whole app's background, you edit one line, not hunt through every file. This is
the "single source of truth" idea, applied to design values instead of application data.

## 3. Theming with `[data-accent]` — `styles/accents.css`

```css
[data-accent='blue'] {
  --accent: #2e6bff;
  --accent-hover: #5a8bff;
  --accent-shadow: rgba(46, 107, 255, 0.45);
}
```

This is a CSS **attribute selector** — it matches any element that has `data-accent="blue"`
as an HTML attribute, e.g. `<html data-accent="blue">`. When that attribute is present, it
**redefines** `--accent` for everything inside that element (which, since it's on `<html>`,
means everything on the page).

So the trick is: every button/card in the whole app writes `background: var(--accent)`
**once**, in its own CSS. It never hardcodes "red" or "blue". Instead, the *value* `--accent`
resolves to depends entirely on what `data-accent` is set to on `<html>` right now. Change
that one attribute, and every component using `var(--accent)` repaints instantly, everywhere,
with zero JavaScript re-render needed for the color change itself.

That's oddly powerful — it's why "switch theme" in most modern apps is instant and
flicker-free.

## 4. Who sets `data-accent`? — `theme/ThemeContext.tsx`

This is where React enters. First, some React fundamentals:

**The problem Context solves:** normally in React, data flows one way — a parent passes data
to children via **props**. But if `<App>` → `<SiteHeader>` → `<AccentSwitcher>` is 3 levels
deep, and something at the bottom needs data owned at the top, you'd have to pass props
through every layer that doesn't even use it ("prop drilling"). **Context** is React's escape
hatch: a `Provider` component makes a value available to *any* descendant, no matter how deep,
without passing it through every layer.

Here's the file, piece by piece:

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);
```
This creates the "channel." It starts as `null` because outside a `<ThemeProvider>`, there's
no value to give.

```tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentKey, setAccentKey] = useState<AccentKey>(readStoredAccent);
```
`useState` is React's basic "a component remembers a value across re-renders" hook.
`accentKey` is React's copy of the truth (e.g. `'blue'`); `setAccentKey` is the only way to
change it. The initial value comes from `readStoredAccent()` — a plain function, called once,
that checks `localStorage` for a previously saved choice (so a reload doesn't reset your
theme to red).

```tsx
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentKey);
    window.localStorage.setItem(STORAGE_KEY, accentKey);
  }, [accentKey]);
```
`useEffect` runs a side effect (something that reaches *outside* React — touching the DOM
directly, or `localStorage`) after render. The `[accentKey]` at the end is the **dependency
array**: "only re-run this effect when `accentKey` changes." So every time someone calls
`setAccentKey('blue')`, React re-renders, then this effect fires and (a) stamps
`data-accent="blue"` onto `<html>` (which is what makes `accents.css` kick in) and (b) saves
`'blue'` to `localStorage` so it survives a reload.

```tsx
  return (
    <ThemeContext.Provider value={{ accent: ACCENTS[accentKey], accentKey, setAccent: setAccentKey }}>
      {children}
    </ThemeContext.Provider>
  );
```
This is the actual "broadcast." Anything rendered inside `<ThemeProvider>...</ThemeProvider>`
(i.e. `{children}`) can now ask for this value.

```tsx
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
```
This is a **custom hook** — just a function whose name starts with `use` and which calls other
hooks inside it. `useContext(ThemeContext)` is how a descendant *tunes in* to the channel. We
wrap it in `useTheme()` so components never have to import `ThemeContext` directly or remember
to null-check it — they just call `useTheme()` and get `{ accent, accentKey, setAccent }`. The
`throw` is a deliberate crash: if someone uses `useTheme()` outside a `<ThemeProvider>`, we
want a loud error immediately, not a silent `undefined` bug later.

## 5. The cart works the same way, plus real data — `cart/CartContext.tsx`

Same Context pattern, but now it's managing a **list**, not a single value.

```ts
export interface CartLine {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  color?: string;
  size?: string;
  qty: number;
}
```
An `interface` in TypeScript is a **shape contract**: "anything typed `CartLine` must have
exactly these fields, with these types." `color?:` — the `?` means optional. TypeScript will
yell at you at compile time if you try to build a `CartLine` missing `qty`, or pass a string
where `price` (a `number`) is expected.

**Why does a cart *line* need an `id` separate from `productId`?** Because you can add the
*same* helmet in two different colors — those need to be two separate rows in the cart, not
merged into one. So the `id` is computed from all three things that make a line unique:

```ts
function lineId(line) {
  return [line.productId, line.color ?? '', line.size ?? ''].join('|');
}
```
`??` is the **nullish coalescing operator** — "use the left side unless it's `null`/`undefined`,
then use the right side." So a helmet with no color/size becomes `"velocity-rs-carbon|"` and
one in blue/M becomes `"velocity-rs-carbon|blue|m"` — different strings, different cart lines.

```ts
const add = (line: CartLineInput, qty = 1) => {
  const id = lineId(line);
  setLines((prev) => {
    const existing = prev.find((l) => l.id === id);
    if (existing) {
      return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
    }
    return [...prev, { ...line, id, qty }];
  });
};
```
`qty = 1` is a **default parameter** — call `add(line)` and qty is 1; call `add(line, 3)` and
it's 3.

`setLines((prev) => ...)` is the **functional update** form of `useState`'s setter — instead
of `setLines(newArray)`, you give it a function that receives the *current* state and returns
the *new* state. This matters because React batches updates; if you did
`setLines([...lines, x])` twice in a row, both might read the same stale `lines` and you'd
lose one. The functional form always sees the latest value.

`{ ...l, qty: l.qty + qty }` is the **spread operator**: "copy every field from `l`, then
override `qty`." This is important in React — you never *mutate* existing objects/arrays
(never do `l.qty += qty`), you always build a *new* one. React detects changes by checking
if the reference changed, so mutating in place would make React think nothing happened.

```ts
const setQty = (id: string, qty: number) => {
  setLines((prev) =>
    qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
  );
};
```
Setting quantity to 0 or less just removes that line — a common cart UX shortcut so you don't
need a separate "remove" button when someone drags a quantity stepper down to zero.

```ts
const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
```
`useMemo` caches a computed value and only recalculates it when its dependency (`[lines]`)
changes — avoids re-summing the whole cart on every unrelated re-render. `.reduce()` is the
array method for "walk the array, accumulate one result" — here, summing all the quantities
into a single total badge count.

## 6. Custom hooks — reusable pieces of logic

**`useReveal.ts`** — the "fade/slide in when scrolled into view" effect:

```ts
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
```
`useRef` gives you a mutable box (`ref.current`) that persists across renders *without*
triggering a re-render when it changes — unlike `useState`. It's the tool for "I need a direct
handle to a real DOM element." The `<T extends HTMLElement = HTMLDivElement>` is a **generic**
— it lets the hook be used on a `<div>` by default, but also on a `<section>` or `<img>` by
writing `useReveal<HTMLImageElement>()`, while still being type-safe.

```ts
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.classList.add('in');
          observer.unobserve(el);
        }
      }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
```
`IntersectionObserver` is a **browser API** (not React) that watches an element and fires a
callback when it scrolls into/out of the viewport — far cheaper than manually listening to
`scroll` events and doing math yourself. `threshold: 0.15` means "fire once 15% of the element
is visible." Once it's visible we add the `.in` class (which `global.css`'s `.reveal.in` rule
uses to animate opacity/transform) and `unobserve` — no point watching something that already
revealed itself.

The `return () => observer.disconnect()` at the end of a `useEffect` is the **cleanup
function** — React calls it right before the component unmounts (or before the effect
re-runs). Without it, you'd leak observers every time a component using this hook was removed
from the page.

**`useMediaQuery.ts`** turns a CSS media query string into a live boolean in JS, so you can
branch your *React* rendering logic (not just CSS) on screen size — e.g. render a completely
different `<MobileNav>` vs `<DesktopNav>` component, which pure CSS can't do.

## 7. The data layer — `data/types.ts` + `products.ts`

This is just plain TypeScript, no React at all:

```ts
export interface Product {
  id: string;
  name: string;
  price: number;
  colors?: ColorOption[];
  ...
}
```
This defines what a "product" *is*, structurally. Then `products.ts` is literally just an
array of objects matching that shape — currently hardcoded, but this is deliberately the exact
shape a real API response would eventually have. `getProduct(id)` is a tiny helper
(`PRODUCTS.find(p => p.id === id)`) so pages later don't repeat that `.find()` call everywhere.

**Why does this matter architecturally?** Separating "what the data looks like" from "how
it's displayed" means when a real backend shows up later, you swap `products.ts`'s hardcoded
array for a `fetch()` call, and nothing else in the app needs to change — every component
already consumes `Product` objects, not raw arrays.

## 8. Wiring it all together — `main.tsx`

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

This is the actual "boot sequence." Order matters here, outside-in:
1. `<StrictMode>` — a React dev-mode helper that intentionally double-invokes some functions
   to help you catch bugs (side effects that aren't idempotent). It does nothing in production.
2. `<BrowserRouter>` — makes `useNavigate`, `<Routes>`, `<Link>` etc. work anywhere inside it,
   by reading the browser's URL.
3. `<ThemeProvider>` — now anything inside can call `useTheme()`.
4. `<CartProvider>` — now anything inside can call `useCart()`.
5. `<App />` — your actual page content, which can freely use routing, theme, and cart because
   it's nested inside all three providers.

If you flipped the order and put `<App />` *outside* `<ThemeProvider>`, calling `useTheme()`
inside `App` would throw the error we wrote earlier — it wouldn't be a descendant of the
provider.

## 9. `App.tsx` — putting it together

```tsx
function FoundationsPlaceholder() {
  const { accentKey, setAccent } = useTheme();
  const { count, add } = useCart();
```
This is a component *consuming* both contexts — this is the payoff of everything above. It
doesn't know or care how theme/cart are implemented; it just calls two hooks and gets values
+ functions back.

```tsx
{ACCENT_KEYS.map((key) => (
  <button key={key} onClick={() => setAccent(key)} ... />
))}
```
`.map()` turns the 4-item array `['red','blue','orange','purple']` into 4 `<button>` elements
— this is the standard React way to render a list, instead of writing out 4 buttons by hand.
`key={key}` is required by React whenever you render a list — it's how React tracks which item
is which across re-renders (without it, React can get confused about what moved where).

```tsx
function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationsPlaceholder />} />
    </Routes>
  );
}
```
Right now there's only one route (`/`), so this doesn't look like much yet — but this is the
seam where `/shop`, `/product/:id`, `/cart` etc. get added in later phases, each mapping a URL
path to a page component.

---

## Summary chain

**tokens → CSS attribute theming → React Context broadcasting that state → hooks for reusable
browser-API logic → typed data → providers wiring it together at boot → a component consuming
all of it.**

Every later phase (primitives, composites, pages) just adds more components that plug into
this same foundation — nothing here changes, they only *consume* `useTheme()`, `useCart()`,
`useReveal()`, and `getProduct()`.
