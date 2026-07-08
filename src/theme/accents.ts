export type AccentKey = 'red' | 'blue' | 'orange' | 'purple';

export interface AccentDef {
  base: string;
  hover: string;
  shadow: string;
}

export const ACCENTS: Record<AccentKey, AccentDef> = {
  red: { base: '#FF3B24', hover: '#ff5a44', shadow: 'rgba(255,59,36,.45)' },
  blue: { base: '#2E6BFF', hover: '#5a8bff', shadow: 'rgba(46,107,255,.45)' },
  orange: { base: '#FF9B24', hover: '#ffb454', shadow: 'rgba(255,155,36,.45)' },
  purple: { base: '#8B5CF6', hover: '#a684fa', shadow: 'rgba(139,92,246,.45)' },
};

export const ACCENT_KEYS: AccentKey[] = ['red', 'blue', 'orange', 'purple'];

export const DEFAULT_ACCENT: AccentKey = 'red';
