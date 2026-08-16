import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { QtyStepper } from './QtyStepper';

describe('QtyStepper', () => {
  it('renders with accessible increase/decrease controls', () => {
    render(<QtyStepper />);
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeInTheDocument();
  });

  it('is uncontrolled by default, starting from defaultValue', async () => {
    const user = userEvent.setup();
    render(<QtyStepper defaultValue={3} />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('is controlled when value is provided: internal state does not change without a parent update', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QtyStepper value={2} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('clamps to max and disables the increase button at the boundary', () => {
    render(<QtyStepper value={5} max={5} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });

  it('clamps to min and disables the decrease button at the boundary', () => {
    render(<QtyStepper value={1} min={1} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('does not call onChange past the max when clicked while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QtyStepper value={5} max={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables both controls when disabled is set', () => {
    render(<QtyStepper disabled />);
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('exposes the current value via aria-live for screen readers', () => {
    render(<QtyStepper defaultValue={2} />);
    const valueNode = screen.getByText('2');
    expect(valueNode).toHaveAttribute('aria-live', 'polite');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<QtyStepper />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
