import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('associates its label via htmlFor/id', () => {
    render(<TextInput label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('typing updates the value (uncontrolled input passthrough)', async () => {
    const user = userEvent.setup();
    render(<TextInput label="Email" />);

    await user.type(screen.getByLabelText('Email'), 'rider@apexline.in');

    expect(screen.getByLabelText('Email')).toHaveValue('rider@apexline.in');
  });

  it('is controlled when value/onChange are provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput label="Email" value="a" onChange={onChange} />);

    await user.type(screen.getByLabelText('Email'), 'b');

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('Email')).toHaveValue('a');
  });

  it('links an error message via aria-describedby and marks aria-invalid', () => {
    render(<TextInput label="Email" error="Enter a valid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email')).toHaveAttribute('id', input.getAttribute('aria-describedby'));
  });

  it('links a hint via aria-describedby when there is no error', () => {
    render(<TextInput label="Email" hint="We will never share this" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('We will never share this')).toHaveAttribute(
      'id',
      input.getAttribute('aria-describedby'),
    );
  });

  it('shows a required marker and sets the required attribute', () => {
    render(<TextInput label="Email" required />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('disables the input', () => {
    render(<TextInput label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<TextInput label="Email" hint="We will never share this" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
