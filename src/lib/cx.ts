/**
 * Tiny className joiner. Filters out falsy values so call sites can write
 * `cx(styles.base, active && styles.active, className)` without ternary noise.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
