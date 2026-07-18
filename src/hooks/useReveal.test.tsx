import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReveal } from './useReveal';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observedTarget: Element | null = null;
  observe = vi.fn((target: Element) => {
    this.observedTarget = target;
  });
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, target: this.observedTarget } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function RevealTarget() {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} data-testid="reveal-target" />;
}

let originalMatchMedia: typeof window.matchMedia;

function stubMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  originalMatchMedia = window.matchMedia;
  stubMatchMedia(false);
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.unstubAllGlobals();
});

describe('useReveal', () => {
  it('observes the element and does not add "in" before it intersects', () => {
    render(<RevealTarget />);
    const el = screen.getByTestId('reveal-target');

    const observer = MockIntersectionObserver.instances.at(-1);
    expect(observer?.observe).toHaveBeenCalledWith(el);
    expect(el.classList.contains('in')).toBe(false);
  });

  it('adds the "in" class and unobserves once the element intersects', () => {
    render(<RevealTarget />);
    const el = screen.getByTestId('reveal-target');
    const observer = MockIntersectionObserver.instances.at(-1)!;

    observer.trigger(true);

    expect(el.classList.contains('in')).toBe(true);
    expect(observer.unobserve).toHaveBeenCalledWith(el);
  });

  it('does not add "in" when the intersection entry is not intersecting', () => {
    render(<RevealTarget />);
    const el = screen.getByTestId('reveal-target');
    const observer = MockIntersectionObserver.instances.at(-1)!;

    observer.trigger(false);

    expect(el.classList.contains('in')).toBe(false);
    expect(observer.unobserve).not.toHaveBeenCalled();
  });

  it('immediately marks revealed and skips observing when prefers-reduced-motion is set', () => {
    stubMatchMedia(true);
    render(<RevealTarget />);
    const el = screen.getByTestId('reveal-target');

    expect(el.classList.contains('in')).toBe(true);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<RevealTarget />);
    const observer = MockIntersectionObserver.instances.at(-1)!;

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
  });
});
