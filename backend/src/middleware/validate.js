const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STARTER_RE = /^starter:[a-z0-9_-]+$/

export const MAX_STEPS = 10
export const MAX_INSTRUCTION = 1000
export const MAX_PARAM = 60

export function isWorkflowId(id) {
  return typeof id === 'string' && (UUID_RE.test(id) || STARTER_RE.test(id))
}

export function isUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id)
}

function validateOptions(library, options) {
  if (options === undefined) return { value: {} }
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    return { error: 'options must be an object' }
  }
  const value = {}
  for (const [name, choice] of Object.entries(options)) {
    if (!library.options[name]) return { error: `Unknown option: ${name}` }
    if (!(choice in library.options[name])) return { error: `Invalid value for ${name}: ${choice}` }
    value[name] = choice
  }
  return { value }
}

export function validateSteps(library, steps) {
  if (!Array.isArray(steps)) return { error: 'steps must be an array' }
  if (steps.length > MAX_STEPS) return { error: `A workflow can have at most ${MAX_STEPS} steps` }
  const value = []
  for (const raw of steps) {
    const step = typeof raw === 'string' ? { id: raw } : raw
    const def = step && library.stepsById.get(step.id)
    if (!def) return { error: `Unknown step: ${step?.id ?? raw}` }
    const clean = { id: step.id }
    if (step.params !== undefined) {
      if (typeof step.params !== 'object' || step.params === null) return { error: `Invalid params for ${step.id}` }
      clean.params = {}
      for (const [key, val] of Object.entries(step.params)) {
        if (!def.params?.[key]) return { error: `Unknown param "${key}" for ${step.id}` }
        if (typeof val !== 'string' || val.length > MAX_PARAM) return { error: `Invalid value for ${step.id}.${key}` }
        clean.params[key] = val.trim()
      }
    }
    value.push(clean)
  }
  return { value }
}

function validateInstruction(text) {
  if (text === undefined || text === null) return { value: '' }
  if (typeof text !== 'string') return { error: 'custom_instruction must be a string' }
  if (text.length > MAX_INSTRUCTION) return { error: `custom_instruction must be at most ${MAX_INSTRUCTION} characters` }
  return { value: text.trim() }
}

// Body of POST /api/rewrite. Exactly one source of instructions:
// a built-in mode, a saved/starter workflow id, or inline steps.
export function validateRewriteBody(library, body, { maxTextLength }) {
  if (!body || typeof body !== 'object') return { error: 'Invalid JSON body' }
  const { text, mode, workflowId, steps, custom_instruction } = body

  if (!text || typeof text !== 'string' || !text.trim()) return { error: 'text is required' }
  if (text.length > maxTextLength) {
    return { error: `Text exceeds maximum length of ${maxTextLength.toLocaleString()} characters` }
  }

  const options = validateOptions(library, body.options)
  if (options.error) return options

  const sources = [mode !== undefined, workflowId !== undefined, steps !== undefined || custom_instruction !== undefined]
  if (sources.filter(Boolean).length > 1) return { error: 'Send only one of mode, workflowId or steps' }

  if (workflowId !== undefined) {
    if (!isWorkflowId(workflowId)) return { error: 'Invalid workflowId' }
    return { value: { text, workflowId, options: options.value } }
  }

  if (steps !== undefined || custom_instruction !== undefined) {
    const s = validateSteps(library, steps ?? [])
    if (s.error) return s
    const ci = validateInstruction(custom_instruction)
    if (ci.error) return ci
    if (!s.value.length && !ci.value) return { error: 'Add at least one step or a custom instruction' }
    return { value: { text, workflow: { name: 'Custom workflow', steps: s.value, custom_instruction: ci.value }, options: options.value } }
  }

  const m = mode ?? 'standard'
  if (!library.modes[m]) return { error: `Invalid mode: ${m}` }
  return { value: { text, mode: m, options: options.value } }
}

// Body of POST/PUT /api/workflows.
export function validateWorkflowBody(library, body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid JSON body' }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return { error: 'name is required' }
  if (name.length > 80) return { error: 'name must be at most 80 characters' }
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 200) : ''
  const s = validateSteps(library, body.steps ?? [])
  if (s.error) return s
  const ci = validateInstruction(body.custom_instruction)
  if (ci.error) return ci
  if (!s.value.length && !ci.value) return { error: 'Add at least one step or a custom instruction' }
  return { value: { name, description, steps: s.value, custom_instruction: ci.value } }
}
