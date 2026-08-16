import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { FreeShipMeter } from './FreeShipMeter';

describe('FreeShipMeter', () => {
  it('shows the remaining amount and progress while below the threshold', () => {
    render(<FreeShipMeter subtotal={2000} threshold={4999} />);
    expect(screen.getByText(/Add ₹2,999 for free delivery/)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2000');
    expect(bar).toHaveAttribute('aria-valuemax', '4999');
  });

  it('shows the unlocked label once the threshold is met (boundary)', () => {
    render(<FreeShipMeter subtotal={4999} threshold={4999} unlockedLabel="Free delivery unlocked" />);
    expect(screen.getByText('Free delivery unlocked')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4999');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<FreeShipMeter subtotal={1000} threshold={4999} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
