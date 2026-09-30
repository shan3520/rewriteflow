import { useId } from 'react'
import { FORMATS } from '../../lib/exporters.js'
import { cn } from '../../lib/cn.js'

// Format, file name and "include original" choices for an export.
export default function ExportStyleOptions({ value, onChange, showIncludeOriginal = true }) {
  const nameId = useId()
  const set = (patch) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="label text-[10px] mb-3">Format</legend>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map(f => (
            <label
              key={f.value}
              className={cn(
                'bezel-inner cursor-pointer px-4 py-3 text-center transition-colors',
                value.format === f.value && '!border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/20',
              )}
            >
              <input type="radio" name="export-format" value={f.value} checked={value.format === f.value} onChange={() => set({ format: f.value })} className="sr-only" />
              <span className="block font-display text-lg text-oxford dark:text-white">{f.label}</span>
              <span className="label label-muted text-[10px]">.{f.ext}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={nameId} className="label text-[10px] block mb-2">File name</label>
        <input id={nameId} className="field" value={value.filename} maxLength={80} onChange={(e) => set({ filename: e.target.value })} />
      </div>

      {showIncludeOriginal && (
        <label className="flex items-center gap-3 font-serif text-lg text-gray-800 dark:text-gray-200">
          <input type="checkbox" checked={value.includeOriginal} onChange={(e) => set({ includeOriginal: e.target.checked })} className="w-4 h-4 accent-[color:var(--accent)]" />
          Include the original text after the rewrite
        </label>
      )}
    </div>
  )
}
