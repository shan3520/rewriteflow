import { ArrowUp, ArrowDown, X } from 'lucide-react'

// One step in a workflow chain: its instruction, any parameters, and
// keyboard-accessible controls to reorder or remove it.
export default function NodeCard({ index, total, step, def, onMove, onRemove, onParamChange }) {
  const label = def?.label ?? step.id
  return (
    <div className="bezel">
      <div className="bezel-inner p-4 flex items-start gap-4">
        <span className="label label-accent text-xs w-6 shrink-0 pt-0.5 tabular-nums" aria-hidden="true">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg text-oxford dark:text-white leading-tight">{label}</div>
          {def?.description && <p className="font-serif text-sm text-gray-600 dark:text-gray-400 mt-0.5">{def.description}</p>}
          {def?.params && Object.entries(def.params).map(([key, param]) => (
            <label key={key} className="mt-3 flex items-center gap-3">
              <span className="label text-[10px]">{param.label}</span>
              <input
                type="text"
                value={step.params?.[key] ?? ''}
                placeholder={param.default}
                maxLength={60}
                onChange={(e) => onParamChange(key, e.target.value)}
                className="field !py-1.5 !text-base max-w-[14rem]"
              />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" className="btn-ghost !p-2" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
            <ArrowUp size={16} />
          </button>
          <button type="button" className="btn-ghost !p-2" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`Move ${label} down`}>
            <ArrowDown size={16} />
          </button>
          <button type="button" className="btn-ghost !p-2 hover:!text-red-700 dark:hover:!text-red-400" onClick={onRemove} aria-label={`Remove ${label}`}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
