# Phase 0 — Scaffold & Foundations

**Goal:** a running Vite + React + TypeScript app with all cross-cutting foundations in place
(design tokens, theme + cart contexts, motion hooks, data seam) and a blank routed shell that
proves the theming works. No product UI yet — this is the platform everything else is built on.

**Depends on:** nothing. **Blocks:** all later phases.

---

## Deliverables

### 1. Toolchain
- Vite + React 19 + TypeScript (already scaffolded), `react-router-dom` installed.
- `package.json` name → `apexline`.
- Fonts (`Archivo`, `Space Mono`) loaded via `<link>` in `index.html`; page `<title>` = `APEXLINE`.
- Default `App.css`/`index.css`/`assets` removed.

### 2. Styles — `src/styles/`
- **`tokens.css`** — `:root` custom properties: surfaces (`--bg`, `--surface`, `--border`…),
  text (`--text`, `--text-muted`, `--text-dim`…), semantic (`--gold`, `--success`, `--danger`),
  accent trio (`--accent`, `--accent-hover`, `--accent-shadow`), fonts, radii, `--max-w`.
- **`accents.css`** — `[data-accent="red|blue|orange|purple"]` blocks overriding the accent trio.
  Mirror of `theme/accents.ts`.
- **`global.css`** — reset, base element styles, **all shared `@keyframes`** (shimmer, glow,
  marquee, spin, checkPop, pulseRing, cartPop, toastIn, fade, panelDrop), the `.reveal`/`.shim`/
  `.row-scroll` helpers, and a `prefers-reduced-motion` guard.

### 3. Theme — `src/theme/`
- **`accents.ts`** — typed `ACCENTS` map (`red|blue|orange|purple` → base/hover/shadow),
  `ACCENT_KEYS`, `DEFAULT_ACCENT`.
- **`ThemeContext.tsx`** — `ThemeProvider` + `useTheme()`. Holds active accent key, writes
  `data-accent` onto `<html>`, persists to `localStorage` (`apex_accent`), hydrates on load.
  API: `{ accent: Accent; accentKey: AccentKey; setAccent(key) }`.

### 4. Cart — `src/cart/`
- **`CartContext.tsx`** — `CartProvider` + `useCart()`. **Line-item** model (the DC store only
  tracked a count; Cart/Checkout need lines). Persists to `localStorage` (`apex_cart`).
  - `CartLine { id, productId, name, brand, price, color?, size?, qty }` (id = `productId|color|size`).
  - API: `{ lines, count, subtotal, add(line, qty?), setQty(id, qty), remove(id), clear() }`.
  - `add` merges into an existing matching line; `setQty(≤0)` removes the line.

### 5. Hooks — `src/hooks/`
- **`useReveal.ts`** — returns a ref; attaches an `IntersectionObserver` that adds `.in` when the
  element enters view (ports the DC `setupReveal`). Honors `prefers-reduced-motion`.
- **`useMediaQuery.ts`** — `useMediaQuery(query)` + `useIsDesktop()` (`min-width: 800px`, the DC
  breakpoint).

### 6. Data seam — `src/data/`
- **`types.ts`** — `ColorOption`, `SizeOption`, `Spec`, `Review`, `Faq`, `Product`.
- **`products.ts`** — typed catalog seeded from the DC mock data: `velocity-rs-carbon` fully
  detailed (colors, sizes, views, specs, faqs, reviews) + lighter listing entries (Iridium GP,
  Circuit R, Urban GT Modular, Trail Pro ADV, Vega Tour, Noir Track, Summit ADV Carbon).
  Helper `getProduct(id)`.

### 7. Entry wiring
- **`main.tsx`** — imports the three stylesheets; mounts
  `BrowserRouter > ThemeProvider > CartProvider > App`.
- **`App.tsx`** — `<Routes>` with a temporary themed placeholder proving tokens + accent switch +
  cart increment work. Real pages replace it in Phase 3.

---

## Task checklist
- [ ] Merge scaffold into repo (done — preserved `.git`, `LICENSE`, `ARCHITECTURE.md`).
- [ ] `styles/tokens.css`, `accents.css`, `global.css`
- [ ] `theme/accents.ts`, `theme/ThemeContext.tsx`
- [ ] `cart/CartContext.tsx`
- [ ] `hooks/useReveal.ts`, `hooks/useMediaQuery.ts`
- [ ] `data/types.ts`, `data/products.ts`
- [ ] `index.html` (fonts + title), `main.tsx`, `App.tsx`
- [ ] Rename package to `apexline`

## Verify
- `npx tsc --noEmit` clean; `npm run build` green.
- `npm run dev` → blank shell paints on `var(--bg)` with Archivo font, **no console errors**.
- Placeholder: clicking an accent swatch recolors the accent instantly **and** survives reload
  (localStorage). Cart increment updates a count that also persists across reload.

## Notes / decisions
- Kept `useTheme`/`useCart` co-located with their providers (one disable comment for the
  react-refresh lint) — simplest to learn; can split later if it ever matters.
- Product images are dashed-gradient placeholder tiles (as in the design); real assets later.
