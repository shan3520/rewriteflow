// Builds system prompts from the shared step library.

function fillParams(template, paramDefs = {}, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key] ?? paramDefs[key]?.default ?? ''
    return String(value).trim()
  })
}

function optionLines(library, options = {}) {
  const lines = []
  for (const [name, choices] of Object.entries(library.options)) {
    const line = choices[options[name]]
    if (line) lines.push(line)
  }
  return lines
}

function finish(library, parts, options) {
  return [...parts, ...optionLines(library, options), library.preserveRule, library.outputRule]
    .filter(Boolean)
    .join('\n\n')
}

export function buildModePrompt(library, mode, options) {
  const def = library.modes[mode]
  if (!def) throw new Error(`Unknown mode: ${mode}`)
  return finish(library, [def.prompt], options)
}

export function buildWorkflowPrompt(library, { steps = [], custom_instruction = '' }, options) {
  const parts = ['You are a careful editor.']
  if (steps.length) {
    const list = steps.map((s, i) => {
      const def = library.stepsById.get(s.id)
      if (!def) throw new Error(`Unknown step: ${s.id}`)
      return `${i + 1}. ${fillParams(def.instruction, def.params, s.params)}`
    })
    parts.push(`Apply the following edits to the text, in order:\n${list.join('\n')}`)
  }
  if (custom_instruction.trim()) {
    parts.push(`Additional instructions from the user:\n${custom_instruction.trim()}`)
  }
  return finish(library, parts, options)
}
