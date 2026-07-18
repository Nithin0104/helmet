import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountUp } from './CountUp';

describe('CountUp', () => {
  it('with duration=0, jumps straight to the formatted final value', () => {
    render(<CountUp value={1234} duration={0} startOnView={false} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('applies prefix, suffix, and decimals', () => {
    render(<CountUp value={42999} duration={0} startOnView={false} prefix="₹" decimals={2} />);
    expect(screen.getByText('₹42,999.00')).toBeInTheDocument();
  });

  it('stays at 0 while startOnView is true and no intersection has fired', () => {
    render(<CountUp value={500} startOnView />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
