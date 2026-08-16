import type { LucideIcon } from 'lucide-react';
import { Boxes, Headset, ShieldCheck, Star, Store } from 'lucide-react';

/**
 * String-key → Lucide component map for icons that arrive as *data*
 * (`src/data/*`), so content stays serialisable and backend-friendly — a
 * future API returns a key like `'shield-check'`, not a React node or a raw
 * glyph. Extend as new data-driven icons appear.
 */
export const iconMap = {
  star: Star,
  'shield-check': ShieldCheck,
  boxes: Boxes,
  store: Store,
  headset: Headset,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof iconMap;
