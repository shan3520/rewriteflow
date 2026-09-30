import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

// The step library (shared/steps.json) and starter workflows (presets/*.yaml)
// live at the repo root so the web backend and the Python CLI read the same
// definitions.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export function loadLibrary({ sharedDir = path.join(ROOT, 'shared'), presetsDir = path.join(ROOT, 'presets') } = {}) {
  const data = JSON.parse(readFileSync(path.join(sharedDir, 'steps.json'), 'utf8'))
  const stepsById = new Map(data.steps.map(s => [s.id, s]))

  const starters = readdirSync(presetsDir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map(file => {
      const raw = parseYaml(readFileSync(path.join(presetsDir, file), 'utf8'))
      return {
        id: `starter:${file.replace(/\.ya?ml$/, '')}`,
        name: raw.name,
        description: raw.description || '',
        steps: normalizeSteps(raw.steps || []),
        custom_instruction: raw.custom_instruction || '',
        starter: true,
      }
    })

  for (const starter of starters) {
    for (const step of starter.steps) {
      if (!stepsById.has(step.id)) {
        throw new Error(`Starter workflow "${starter.name}" uses unknown step "${step.id}"`)
      }
    }
  }

  return { ...data, stepsById, starters }
}

// Steps may be written as bare ids ("grammar") or objects ({ id, params }).
export function normalizeSteps(steps) {
  return steps.map(s => (typeof s === 'string' ? { id: s } : { id: s.id, ...(s.params ? { params: s.params } : {}) }))
}
