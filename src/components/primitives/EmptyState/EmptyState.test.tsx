import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and body inside a status region', () => {
    render(<EmptyState title="No helmets match those filters" body="Try widening your price range." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No helmets match those filters')).toBeInTheDocument();
    expect(screen.getByText('Try widening your price range.')).toBeInTheDocument();
  });

  it('fires the CTA and secondary handlers', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    const onSecondaryClick = vi.fn();
    render(
      <EmptyState
        title="No results"
        ctaLabel="Clear all filters"
        onCtaClick={onCtaClick}
        secondaryLabel="Browse all"
        onSecondaryClick={onSecondaryClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    await user.click(screen.getByRole('button', { name: 'Browse all' }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);
  });

  it('renders with only a title (no body, no actions, no glyph)', () => {
    render(<EmptyState title="Nothing here" showGlyph={false} />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('prefers children over the body prop', () => {
    render(
      <EmptyState title="Empty" body="ignored">
        <span>rich body</span>
      </EmptyState>,
    );
    expect(screen.getByText('rich body')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <EmptyState title="No helmets match those filters" body="Try again." ctaLabel="Clear filters" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
