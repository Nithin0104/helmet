import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest-axe's own `extend-expect` entry ships a broken (empty) runtime file and
// types keyed to a `Vi` namespace Vitest 4 no longer declares — see tests/vitest-axe.d.ts
// for the working type augmentation. Register the matcher directly here instead.
expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
  // ThemeContext/CartContext persist to localStorage; without this, state leaks
  // across tests within a file (and across files, since jsdom's window is reused).
  window.localStorage.clear();
});

beforeAll(() => {
  // jsdom has no matchMedia — useMediaQuery needs it.
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList;
  }

  // jsdom has no IntersectionObserver — useReveal needs it. This no-op stub keeps
  // unrelated suites from throwing; the dedicated useReveal test replaces it with a
  // controllable mock that captures the constructor callback.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(_cb: IntersectionObserverCallback) {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [] as IntersectionObserverEntry[];
      }
    },
  );

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  // jsdom no-ops these; Modal/BottomSheet/Carousel-class primitives call them.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.scrollTo = vi.fn();

  // jsdom doesn't implement the Pointer Capture API; RangeSlider's drag handling calls it.
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
});
