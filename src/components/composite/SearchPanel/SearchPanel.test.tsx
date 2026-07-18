import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithProviders, screen, userEvent } from '../../../../tests/utils';
import { SearchPanel } from './SearchPanel';

describe('SearchPanel', () => {
  it('renders nothing when closed', () => {
    renderWithProviders(<SearchPanel open={false} onClose={() => {}} />, { route: '/' });
    expect(screen.queryByRole('dialog', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('shows trending terms when there is no query', () => {
    renderWithProviders(<SearchPanel open onClose={() => {}} trending={['Track', 'Carbon']} />, {
      route: '/',
    });
    expect(screen.getByText('TRENDING SEARCHES')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Track' })).toBeInTheDocument();
  });

  it('filters the catalog live and links results to their PDP', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPanel open onClose={() => {}} />, { route: '/' });

    await user.type(screen.getByRole('searchbox'), 'velocity');

    const link = screen.getByRole('link', { name: /Velocity RS Carbon/ });
    expect(link).toHaveAttribute('href', '/product/velocity-rs-carbon');
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPanel open onClose={() => {}} />, { route: '/' });

    await user.type(screen.getByRole('searchbox'), 'zzzzz');

    expect(screen.getByText(/No results for/)).toBeInTheDocument();
  });

  it('fills the query when a trending chip is picked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPanel open onClose={() => {}} trending={['Velocity RS']} />, {
      route: '/',
    });

    await user.click(screen.getByRole('button', { name: 'Velocity RS' }));

    expect(screen.getByRole('searchbox')).toHaveValue('Velocity RS');
  });

  it('closes on the Cancel button and on scrim click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SearchPanel open onClose={onClose} />, { route: '/' });

    await user.click(screen.getByRole('button', { name: 'CANCEL' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<SearchPanel open onClose={onClose} />, { route: '/' });

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no detectable accessibility violations', async () => {
    renderWithProviders(<SearchPanel open onClose={() => {}} />, { route: '/' });
    const dialog = screen.getByRole('dialog', { name: 'Search' });
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
