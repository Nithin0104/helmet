import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TrustList, type TrustListItem } from './TrustList';

const ITEMS: TrustListItem[] = [
  { icon: <span>⚡</span>, title: 'Express delivery', sub: 'Next-day dispatch' },
  { icon: <span>↩</span>, title: '15-day returns', sub: 'Full refund' },
  { icon: <span>⛨</span>, title: 'Warranty', sub: 'Brand covered' },
];

describe('TrustList', () => {
  it('renders each trust item title and subtitle', () => {
    render(<TrustList items={ITEMS} />);
    expect(screen.getByText('Express delivery')).toBeInTheDocument();
    expect(screen.getByText('Full refund')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders as a list', () => {
    render(<TrustList items={ITEMS} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders without icons', () => {
    render(<TrustList items={[{ title: 'No icon', sub: 'still fine' }]} />);
    expect(screen.getByText('No icon')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations (stack + row)', async () => {
    const stack = render(<TrustList items={ITEMS} />);
    expect(await axe(stack.container)).toHaveNoViolations();
    const row = render(<TrustList items={ITEMS} layout="row" />);
    expect(await axe(row.container)).toHaveNoViolations();
  });
});
