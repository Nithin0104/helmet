import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders as a checkbox, unchecked by default', () => {
    render(<Checkbox label="Accept terms" />);
    const el = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('is keyboard operable: Tab focuses it and Space toggles it (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />);
    const el = screen.getByRole('checkbox', { name: 'Accept terms' });

    await user.tab();
    expect(el).toHaveFocus();

    await user.keyboard(' ');
    expect(el).toHaveAttribute('aria-checked', 'true');
  });

  it('is controlled when checked is provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" checked={false} onChange={onChange} />);
    const el = screen.getByRole('checkbox', { name: 'Accept terms' });

    await user.click(el);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('exposes indeterminate as aria-checked="mixed"', () => {
    render(<Checkbox label="Select all" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute('aria-checked', 'mixed');
  });

  it('does not toggle or call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" disabled onChange={onChange} />);
    const el = screen.getByRole('checkbox', { name: 'Accept terms' });

    await user.click(el);

    expect(onChange).not.toHaveBeenCalled();
    expect(el).toBeDisabled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Checkbox label="Accept terms" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
