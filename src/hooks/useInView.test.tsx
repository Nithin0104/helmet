import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { useInView } from './useInView';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observedTarget: Element | null = null;
  options?: IntersectionObserverInit;
  observe = vi.fn((target: Element) => {
    this.observedTarget = target;
  });
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, target: this.observedTarget } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function Probe({ threshold }: { threshold?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(threshold);
  return (
    <div ref={ref} data-testid="probe">
      {inView ? 'in' : 'out'}
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

describe('useInView', () => {
  it('starts out of view and observes the element with the given threshold', () => {
    render(<Probe threshold={0.5} />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId('probe'));
    expect(observer.options).toEqual({ threshold: 0.5 });
    expect(screen.getByTestId('probe')).toHaveTextContent('out');
  });

  it('reports in-view when the element intersects and back out when it leaves', () => {
    render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    act(() => observer.trigger(true));
    expect(screen.getByTestId('probe')).toHaveTextContent('in');
    act(() => observer.trigger(false));
    expect(screen.getByTestId('probe')).toHaveTextContent('out');
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    const observer = MockIntersectionObserver.instances.at(-1)!;
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});
