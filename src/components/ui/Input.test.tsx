import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('wires the label to the field, so clicking the label focuses it', () => {
    render(<Input label="Your name" />);

    const field = screen.getByLabelText('Your name');
    expect(field).toBeInTheDocument();
    expect(field.id).not.toBe('');
  });

  /* The id comes from useId rather than Math.random(). A random id differs
     between the server render and hydration, which is what the hydration
     mismatch warning was. This asserts the property that fix relies on:
     ids are unique per instance without being random. */
  it('gives two instances different ids', () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>
    );

    const first = screen.getByLabelText('First');
    const second = screen.getByLabelText('Second');
    expect(first.id).not.toBe(second.id);
  });

  it('prefers an id passed in over the generated one', () => {
    render(<Input label="Postcode" id="postcode" />);

    expect(screen.getByLabelText('Postcode')).toHaveAttribute('id', 'postcode');
  });

  it('shows the error text when there is one', () => {
    render(<Input label="Email" error="Which address should we reply to?" />);

    expect(
      screen.getByText('Which address should we reply to?')
    ).toBeInTheDocument();
  });

  it('renders without a label', () => {
    render(<Input placeholder="Plate" />);

    expect(screen.getByPlaceholderText('Plate')).toBeInTheDocument();
  });
});
