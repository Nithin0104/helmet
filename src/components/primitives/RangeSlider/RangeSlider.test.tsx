import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSlider } from './RangeSlider';

function mockTrackRect(track: Element) {
  Object.defineProperty(track, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, right: 200, bottom: 20, width: 200, height: 20 }),
    configurable: true,
  });
}

describe('RangeSlider (single value)', () => {
  it('renders one thumb with min/max/now reflecting the value', () => {
    render(<RangeSlider min={0} max={100} value={40} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  it('shows a formatted readout with prefix/suffix', () => {
    render(<RangeSlider min={0} max={100000} defaultValue={42999} prefix="₹" />);
    expect(screen.getByText(/₹/)).toBeInTheDocument();
  });

  it('is uncontrolled by default, dragging updates the internal value', () => {
    render(<RangeSlider min={0} max={100} defaultValue={0} />);
    const trackEl = screen.getByRole('slider').parentElement!;
    mockTrackRect(trackEl);

    fireEvent.pointerDown(screen.getByRole('slider'), { pointerId: 1, clientX: 0 });
    fireEvent(window, new PointerEvent('pointermove', { clientX: 100 }));
    fireEvent(window, new PointerEvent('pointerup', {}));

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
  });

  it('is controlled when value is provided: drag reports via onChange without moving itself', () => {
    const onChange = vi.fn();
    render(<RangeSlider min={0} max={100} value={0} onChange={onChange} />);
    const trackEl = screen.getByRole('slider').parentElement!;
    mockTrackRect(trackEl);

    fireEvent.pointerDown(screen.getByRole('slider'), { pointerId: 1, clientX: 0 });
    fireEvent(window, new PointerEvent('pointermove', { clientX: 100 }));
    fireEvent(window, new PointerEvent('pointerup', {}));

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  });

  it('does not start a drag when disabled', () => {
    const onChange = vi.fn();
    render(<RangeSlider min={0} max={100} value={0} onChange={onChange} disabled />);
    const trackEl = screen.getByRole('slider').parentElement!;
    mockTrackRect(trackEl);

    fireEvent.pointerDown(screen.getByRole('slider'), { pointerId: 1, clientX: 0 });
    fireEvent(window, new PointerEvent('pointermove', { clientX: 100 }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('RangeSlider (dual value)', () => {
  it('renders two thumbs for a [lo, hi] value', () => {
    render(<RangeSlider min={0} max={100} value={[20, 80]} onChange={() => {}} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('shows both formatted bounds in the readout', () => {
    render(<RangeSlider min={0} max={100} defaultValue={[10, 90]} suffix="%" />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
