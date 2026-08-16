import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders the wordmark as a link to home by default', () => {
    renderWithProviders(<Logo />, { route: '/' });
    expect(screen.getByRole('link', { name: 'APEXLINE' })).toHaveAttribute('href', '/');
  });

  it('honours a custom href', () => {
    renderWithProviders(<Logo href="/shop" />, { route: '/' });
    expect(screen.getByRole('link', { name: 'APEXLINE' })).toHaveAttribute('href', '/shop');
  });

  it('fires onClick (e.g. to close an overlay)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProviders(<Logo onClick={onClick} />, { route: '/' });

    await user.click(screen.getByRole('link', { name: 'APEXLINE' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = renderWithProviders(<Logo />, { route: '/' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
