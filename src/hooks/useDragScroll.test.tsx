import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useDragScroll } from './useDragScroll';

function Track() {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="track">
      <a href="/x" data-testid="card">
        card
      </a>
    </div>
  );
}

describe('useDragScroll', () => {
  it('scrolls the track horizontally as the pointer drags', () => {
    render(<Track />);
    const track = screen.getByTestId('track');
    expect(track.scrollLeft).toBe(0);

    fireEvent.pointerDown(track, { clientX: 100 });
    fireEvent.pointerMove(track, { clientX: 40 }); // dragged left 60px
    expect(track.scrollLeft).toBe(60);

    fireEvent.pointerUp(track);
  });

  it('does not move the track when the pointer is not down', () => {
    render(<Track />);
    const track = screen.getByTestId('track');
    fireEvent.pointerMove(track, { clientX: 40 });
    expect(track.scrollLeft).toBe(0);
  });

  it('suppresses the click that follows a drag', () => {
    render(<Track />);
    const track = screen.getByTestId('track');

    fireEvent.pointerDown(track, { clientX: 100 });
    fireEvent.pointerMove(track, { clientX: 40 });
    fireEvent.pointerUp(track);

    // A drag happened, so the trailing click is cancelled (defaultPrevented).
    const notCancelled = fireEvent.click(screen.getByTestId('card'));
    expect(notCancelled).toBe(false);
  });

  it('ends the drag on pointercancel', () => {
    render(<Track />);
    const track = screen.getByTestId('track');

    fireEvent.pointerDown(track, { clientX: 100 });
    fireEvent.pointerMove(track, { clientX: 40 });
    expect(track.scrollLeft).toBe(60);

    fireEvent.pointerCancel(track);
    // Drag ended: a move without a fresh pointerdown no longer scrolls.
    fireEvent.pointerMove(track, { clientX: 200 });
    expect(track.scrollLeft).toBe(60);
  });

  it('allows a normal click when there was no drag', () => {
    render(<Track />);
    const track = screen.getByTestId('track');

    fireEvent.pointerDown(track, { clientX: 100 });
    fireEvent.pointerUp(track);

    const notCancelled = fireEvent.click(screen.getByTestId('card'));
    expect(notCancelled).toBe(true);
  });
});
