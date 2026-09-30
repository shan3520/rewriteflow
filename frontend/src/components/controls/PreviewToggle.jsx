import { cn } from '../../lib/cn.js'

const VIEWS = [
  { value: 'clean', label: 'Clean' },
  { value: 'changes', label: 'Changes' },
]

// Switches the output panel between the plain rewrite and the word-level diff.
export default function PreviewToggle({ value, onChange, disabled }) {
  return (
    <div role="radiogroup" aria-label="Output view" className="inline-flex rounded-md border border-gray-300 dark:border-ink-border p-0.5">
      {VIEWS.map(v => (
        <button
          key={v.value}
          type="button"
          role="radio"
          aria-checked={value === v.value}
          disabled={disabled}
          onClick={() => onChange(v.value)}
          className={cn(
            'label text-[10px] px-2.5 py-1 rounded transition-colors disabled:opacity-50',
            value === v.value ? 'bg-oxford text-white dark:bg-oxford-soft dark:text-oxford-deep' : 'hover:bg-gray-100 dark:hover:bg-ink-raised',
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
