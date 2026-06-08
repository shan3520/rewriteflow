import { PenLine, GraduationCap, Shuffle, Feather, BookOpen } from 'lucide-react'

// Single source of truth for rewrite styles. `value` is the API/storage enum;
// `label` is what the user sees everywhere — the picker, the history chip, and
// the filter bar — so the displayed name can never drift from the chosen one.
export const MODES = [
  { value: 'standard', label: 'Standard', desc: 'Preserves the original document meaning', Icon: BookOpen },
  { value: 'academic', label: 'Professional', desc: 'Formal tone and polished structure', Icon: GraduationCap },
  { value: 'aggressive', label: 'Extensive', desc: 'Maximum restructuring for originality', Icon: Shuffle },
  { value: 'simplified', label: 'Clarified', desc: 'Plain English for maximum readability', Icon: Feather },
  { value: 'creative', label: 'Expressive', desc: 'A more literary and engaging approach', Icon: PenLine },
]

const MODE_LABELS = Object.fromEntries(MODES.map(m => [m.value, m.label]))

// Resolve a stored mode value to its display label; falls back to the raw value
// for any legacy/unknown enum so history never renders blank.
export function modeLabel(value) {
  return MODE_LABELS[value] || value
}
