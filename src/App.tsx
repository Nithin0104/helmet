import { Route, Routes } from 'react-router-dom';
import { useTheme } from './theme/ThemeContext';
import { useCart } from './cart/CartContext';
import { ACCENTS, ACCENT_KEYS } from './theme/accents';
import ShowcasePage from './pages/ShowcasePage';

function FoundationsPlaceholder() {
  const { accentKey, setAccent } = useTheme();
  const { count, add } = useCart();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '.08em' }}>
        PHASE 0 — FOUNDATIONS
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 800 }}>APEXLINE</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 480 }}>
        Tokens, theme, cart, hooks, and the data seam are wired. Real pages arrive in later phases.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        {ACCENT_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setAccent(key)}
            aria-label={`Set accent to ${key}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-pill)',
              background: ACCENTS[key].base,
              border: key === accentKey ? '2px solid var(--text)' : '2px solid transparent',
              opacity: key === accentKey ? 1 : 0.55,
            }}
          />
        ))}
      </div>

      <button
        onClick={() =>
          add({ productId: 'velocity-rs-carbon', name: 'Velocity RS Carbon', brand: 'Apexline', price: 42999 })
        }
        style={{
          padding: '12px 28px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 700,
        }}
      >
        Add to cart · {count} in cart
      </button>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<FoundationsPlaceholder />} />
      <Route path="/showcase" element={<ShowcasePage />} />
    </Routes>
  );
}

export default App;
