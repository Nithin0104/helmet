import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Rating } from './Rating';

describe('Rating', () => {
  it('renders an interactive slider with an accessible name describing the value', () => {
    render(<Rating value={3} max={5} onChange={() => {}} />);
    expect(screen.getByRole('slider', { name: '3 out of 5' })).toBeInTheDocument();
  });

  it('renders read-only as an img role, not interactive', () => {
    render(<Rating value={4} max={5} readOnly />);
    const el = screen.getByRole('img', { name: '4 out of 5' });
    expect(el).not.toHaveAttribute('aria-valuenow');
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('is uncontrolled by default, starting from defaultValue', () => {
    render(<Rating defaultValue={2} max={5} />);
    expect(screen.getByRole('slider', { name: '2 out of 5' })).toBeInTheDocument();
  });

  it('clicking a star reports the new value via onChange (controlled, whole-star mode)', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={2} max={5} onChange={onChange} />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(5);
    fireEvent.click(svgs[4].parentElement!);

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('renders max icons regardless of value', () => {
    const { container } = render(<Rating value={0} max={5} onChange={() => {}} />);
    expect(container.querySelectorAll('svg')).toHaveLength(5);
  });
});
