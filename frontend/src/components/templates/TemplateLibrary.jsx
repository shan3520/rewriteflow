import { Play, Pencil, CopyPlus, Trash2, Plus } from 'lucide-react'

function StepChips({ workflow, stepsById }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 mt-4" aria-label="Steps">
      {workflow.steps.map((s, i) => (
        <li key={i} className="label text-[9px] px-2 py-1 rounded border border-gray-300 dark:border-ink-border">
          {i + 1}. {stepsById.get(s.id)?.label ?? s.id}
          {s.params && Object.values(s.params).length ? ` (${Object.values(s.params).join(', ')})` : ''}
        </li>
      ))}
      {workflow.custom_instruction && (
        <li className="label label-muted text-[9px] px-2 py-1">+ custom instruction</li>
      )}
    </ol>
  )
}

function WorkflowCard({ workflow, stepsById, actions }) {
  return (
    <li className="bezel">
      <div className="bezel-inner p-6 flex flex-col h-full">
        <h3 className="font-display text-xl text-oxford dark:text-white">{workflow.name}</h3>
        {workflow.description && <p className="font-serif text-gray-700 dark:text-gray-300 mt-1">{workflow.description}</p>}
        <StepChips workflow={workflow} stepsById={stepsById} />
        <div className="mt-auto pt-6 flex flex-wrap gap-2">
          {actions.map(({ label, Icon, onClick, danger, primary }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-label={`${label}: ${workflow.name}`}
              className={primary
                ? 'btn-primary !py-2 !px-4 flex items-center gap-2'
                : `btn-ghost flex items-center gap-2 ${danger ? 'hover:!text-red-700 dark:hover:!text-red-400' : ''}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </li>
  )
}

/** Starter and saved workflows, with the actions available for each. */
export default function TemplateLibrary({ starters, workflows, stepsById, onUse, onEdit, onDuplicate, onDelete, onNew }) {
  return (
    <div className="space-y-14">
      <section aria-labelledby="saved-heading">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 id="saved-heading" className="label text-[11px]">Your workflows</h2>
          <button type="button" className="btn-primary !py-2.5 flex items-center gap-2" onClick={onNew}>
            <Plus size={14} /> New workflow
          </button>
        </div>
        {workflows.length === 0 ? (
          <p className="font-serif text-lg text-gray-600 dark:text-gray-400">
            You haven&apos;t saved any workflows yet. Start from scratch or duplicate a starter below.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflows.map(w => (
              <WorkflowCard
                key={w.id}
                workflow={w}
                stepsById={stepsById}
                actions={[
                  { label: 'Use', Icon: Play, onClick: () => onUse(w), primary: true },
                  { label: 'Edit', Icon: Pencil, onClick: () => onEdit(w) },
                  { label: 'Duplicate', Icon: CopyPlus, onClick: () => onDuplicate(w) },
                  { label: 'Delete', Icon: Trash2, onClick: () => onDelete(w), danger: true },
                ]}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="starter-heading">
        <h2 id="starter-heading" className="label text-[11px] mb-6">Starter workflows</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {starters.map(w => (
            <WorkflowCard
              key={w.id}
              workflow={w}
              stepsById={stepsById}
              actions={[
                { label: 'Use', Icon: Play, onClick: () => onUse(w), primary: true },
                { label: 'Duplicate', Icon: CopyPlus, onClick: () => onDuplicate(w) },
              ]}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
