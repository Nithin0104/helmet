import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Velocity RS Carbon' },
];

describe('Breadcrumbs', () => {
  it('renders a labelled nav with a link per non-final item', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/shop');
  });

  it('renders the last item as current, non-linked text', () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText('Velocity RS Carbon');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders a single-item trail without crashing', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }]} />);
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
  });

  it('intercepts a plain left-click for SPA navigation, keeping the href', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/'); // real anchor preserved
    await user.click(home);

    expect(onNavigate).toHaveBeenCalledWith('/', expect.anything());
  });

  it('does not intercept when no onNavigate is given', async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs items={items} />);
    // No handler, no throw — the anchor behaves as a normal link.
    await user.click(screen.getByRole('link', { name: 'Shop' }));
    expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Breadcrumbs items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
