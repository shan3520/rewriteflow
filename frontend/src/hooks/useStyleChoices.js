import { useMemo } from 'react'
import { Workflow } from 'lucide-react'
import { usePipeline } from '../context/PipelineContext.jsx'
import { MODES } from '../lib/modes.js'
import { modeSelection, workflowSelection } from '../lib/selection.js'

function summarize(workflow, stepsById) {
  if (workflow.description) return workflow.description
  const labels = workflow.steps.map(s => stepsById.get(s.id)?.label ?? s.id)
  return labels.length ? labels.join(' → ') : 'Custom instruction'
}

// Everything the style picker and command palette can select: the built-in
// modes, then the user's saved workflows, then the starter workflows.
export function useStyleChoices() {
  const { workflows, starters, stepsById } = usePipeline()
  return useMemo(() => [
    ...MODES.map(m => ({ key: modeSelection(m.value), label: m.label, desc: m.desc, Icon: m.Icon, group: 'Modes' })),
    ...workflows.map(w => ({ key: workflowSelection(w.id), label: w.name, desc: summarize(w, stepsById), Icon: Workflow, group: 'Your workflows' })),
    ...starters.map(w => ({ key: workflowSelection(w.id), label: w.name, desc: summarize(w, stepsById), Icon: Workflow, group: 'Starter workflows' })),
  ], [workflows, starters, stepsById])
}
