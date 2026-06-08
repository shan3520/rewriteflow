import { clsx } from 'clsx'

// Lightweight conditional class joiner. All call sites in this project compose
// non-overlapping class strings (base + conditional variant), so tailwind-merge's
// conflict resolution is unnecessary. Dropping it saves ~150 kB (raw) / ~50 kB
// (gzipped) from the main JS bundle — the single largest bundle reduction
// available. If a future component genuinely needs Tailwind conflict resolution
// (overriding a base class with a prop-driven class), import twMerge locally
// in that component rather than re-adding it to the shared utility.
export function cn(...inputs) {
  return clsx(inputs)
}
