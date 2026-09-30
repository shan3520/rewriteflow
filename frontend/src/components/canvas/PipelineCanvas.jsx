import { Fragment, useId, useState } from 'react'
import { Plus } from 'lucide-react'
import NodeCard from './NodeCard.jsx'
import ConnectionLines from './ConnectionLines.jsx'
import { MAX_STEPS, moveItem, withKeys } from '../../lib/steps.js'

/**
 * Editable, ordered chain of workflow steps. `steps` is [{ id, params? }];
 * `library` is the step list from /api/steps.
 */
export default function PipelineCanvas({ steps, library, onChange }) {
  const selectId = useId()
  const [toAdd, setToAdd] = useState(library[0]?.id ?? '')
  const byId = new Map(library.map(s => [s.id, s]))
  const full = steps.length >= MAX_STEPS

  function update(index, patch) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function setParam(index, key, value) {
    const params = { ...(steps[index].params || {}) }
    if (value) params[key] = value
    else delete params[key]
    update(index, { params: Object.keys(params).length ? params : undefined })
  }

  return (
    <div>
      {steps.length === 0 ? (
        <p className="font-serif text-gray-600 dark:text-gray-400 mb-4">No steps yet. Add one below, or rely on the custom instruction alone.</p>
      ) : (
        <ol className="mb-4" aria-label="Workflow steps">
          {steps.map((step, i) => (
            <Fragment key={step._key ?? i}>
              {i > 0 && <ConnectionLines />}
              <li>
                <NodeCard
                  index={i}
                  total={steps.length}
                  step={step}
                  def={byId.get(step.id)}
                  onMove={(dir) => onChange(moveItem(steps, i, i + dir))}
                  onRemove={() => onChange(steps.filter((_, j) => j !== i))}
                  onParamChange={(key, value) => setParam(i, key, value)}
                />
              </li>
            </Fragment>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={selectId} className="sr-only">Step to add</label>
        <select
          id={selectId}
          value={toAdd}
          onChange={(e) => setToAdd(e.target.value)}
          disabled={full}
          className="field !py-2 !w-auto"
        >
          {library.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button
          type="button"
          className="btn-ghost flex items-center gap-2 border border-gray-300 dark:border-ink-border"
          disabled={full || !toAdd}
          onClick={() => onChange(withKeys([...steps, { id: toAdd }]))}
        >
          <Plus size={14} /> Add step
        </button>
        {full && <span className="label label-muted text-[10px]">Maximum {MAX_STEPS} steps</span>}
      </div>
    </div>
  )
}
