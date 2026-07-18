import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Pagination } from './Pagination';

describe('Pagination (numbers variant)', () => {
  it('starts on page 1 by default (uncontrolled) with Previous disabled', () => {
    render(<Pagination total={5} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });

  it('advances page on Next click (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Pagination total={5} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables Next on the last page', () => {
    render(<Pagination total={3} page={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('is controlled when page is provided: click reports via onChange without moving itself', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination total={5} page={1} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '3' }));

    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders a single page with both arrows disabled (boundary state)', () => {
    render(<Pagination total={1} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('collapses a large range into ellipses beyond the sibling window', () => {
    render(<Pagination total={20} page={10} onChange={() => {}} siblingCount={1} />);
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Pagination total={5} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Pagination (dots variant)', () => {
  it('renders a dot per page with the current one marked aria-current', async () => {
    const user = userEvent.setup();
    render(<Pagination total={4} variant="dots" />);

    expect(screen.getByRole('button', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toHaveAttribute('aria-current', 'page');
  });
});
