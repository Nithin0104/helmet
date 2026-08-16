import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { useOffscreen } from './useOffscreen';

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

  trigger(isIntersecting: boolean, top: number) {
    this.callback(
      [
        {
          isIntersecting,
          boundingClientRect: { top } as DOMRectReadOnly,
          target: this.observedTarget,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function Probe() {
  const [ref, offscreen] = useOffscreen<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="probe">
      {offscreen ? 'offscreen' : 'onscreen'}
    </div>
  );
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useOffscreen', () => {
  it('starts on-screen and observes the element', () => {
    render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId('probe'));
    expect(screen.getByTestId('probe')).toHaveTextContent('onscreen');
  });

  it('reports offscreen when the element scrolls above the viewport', () => {
    render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    act(() => observer.trigger(false, -120));
    expect(screen.getByTestId('probe')).toHaveTextContent('offscreen');
  });

  it('stays on-screen when the element is below the fold (not yet scrolled past)', () => {
    render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    act(() => observer.trigger(false, 400));
    expect(screen.getByTestId('probe')).toHaveTextContent('onscreen');
  });

  it('returns on-screen while intersecting', () => {
    render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    act(() => observer.trigger(true, -120));
    expect(screen.getByTestId('probe')).toHaveTextContent('onscreen');
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
