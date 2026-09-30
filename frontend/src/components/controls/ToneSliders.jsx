import { cn } from '../../lib/cn.js'

const GROUPS = [
  { name: 'length', label: 'Length', choices: [['shorter', 'Shorter'], ['same', 'Same'], ['longer', 'Longer']] },
  { name: 'formality', label: 'Tone', choices: [['casual', 'Casual'], ['neutral', 'Neutral'], ['formal', 'Formal']] },
]

// Length and formality adjustments applied on top of any mode or workflow.
export default function ToneSliders({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {GROUPS.map(group => (
        <div key={group.name} className="flex items-center gap-3">
          <span id={`adjust-${group.name}`} className="label label-muted text-[10px]">{group.label}</span>
          <div role="radiogroup" aria-labelledby={`adjust-${group.name}`} className="inline-flex rounded-md border border-gray-300 dark:border-ink-border p-0.5">
            {group.choices.map(([choice, label]) => (
              <button
                key={choice}
                type="button"
                role="radio"
                aria-checked={value[group.name] === choice}
                disabled={disabled}
                onClick={() => onChange({ ...value, [group.name]: choice })}
                className={cn(
                  'label text-[10px] px-2.5 py-1.5 rounded transition-colors disabled:opacity-50',
                  value[group.name] === choice
                    ? 'bg-oxford text-white dark:bg-oxford-soft dark:text-oxford-deep'
                    : 'hover:bg-gray-100 dark:hover:bg-ink-raised',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
