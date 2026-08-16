import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
import { SlideNav } from './SlideNav';

const ITEMS = [
  { label: 'Helmets', href: '/shop' },
  { label: 'Showroom', href: '/showcase' },
];

describe('SlideNav', () => {
  it('renders nothing when closed', () => {
    renderWithProviders(<SlideNav open={false} onClose={() => {}} items={ITEMS} />, { route: '/' });
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
  });

  it('renders the nav items as links to their routes when open', () => {
    renderWithProviders(<SlideNav open onClose={() => {}} items={ITEMS} />, { route: '/' });
    expect(screen.getByRole('link', { name: /Helmets/ })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: /Showroom/ })).toHaveAttribute('href', '/showcase');
  });

  it('marks the active item with aria-current', () => {
    renderWithProviders(<SlideNav open onClose={() => {}} items={ITEMS} active="Showroom" />, {
      route: '/',
    });
    expect(screen.getByRole('link', { name: /Showroom/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Helmets/ })).not.toHaveAttribute('aria-current');
  });

  it('closes via the close button and when a link is followed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SlideNav open onClose={onClose} items={ITEMS} />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('link', { name: /Helmets/ }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SlideNav open onClose={onClose} items={ITEMS} />, { route: '/' });

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no detectable accessibility violations', async () => {
    renderWithProviders(<SlideNav open onClose={() => {}} items={ITEMS} active="Helmets" />, {
      route: '/',
    });
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
