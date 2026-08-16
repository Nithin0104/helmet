import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins truthy string parts with a space', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out false, null, and undefined', () => {
    expect(cx('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cx(false, null, undefined)).toBe('');
  });

  it('returns an empty string with no arguments', () => {
    expect(cx()).toBe('');
  });

  it('supports conditional class patterns', () => {
    const active = true;
    const disabled = false;
    expect(cx('base', active && 'active', disabled && 'disabled')).toBe('base active');
  });
});
