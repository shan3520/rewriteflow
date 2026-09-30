// The style picker's selection is a single string so it can live in state,
// sessionStorage and the command palette alike:
//   "mode:<mode>"          a built-in mode
//   "workflow:<id>"        a saved workflow (uuid) or starter ("starter:…")

export const DEFAULT_SELECTION = 'mode:standard'

export function modeSelection(mode) {
  return `mode:${mode}`
}

export function workflowSelection(id) {
  return `workflow:${id}`
}

export function parseSelection(key) {
  const i = key.indexOf(':')
  return { kind: key.slice(0, i), id: key.slice(i + 1) }
}

// Request fields for POST /api/rewrite.
export function selectionToRequest(key) {
  const { kind, id } = parseSelection(key)
  return kind === 'workflow' ? { workflowId: id } : { mode: id }
}

// Length / formality adjustments from the ToneSliders control.
export const DEFAULT_ADJUSTMENTS = { length: 'same', formality: 'neutral' }
