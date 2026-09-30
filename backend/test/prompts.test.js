import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadLibrary } from '../src/lib/library.js'
import { buildModePrompt, buildWorkflowPrompt } from '../src/lib/prompts.js'

const library = loadLibrary()

test('library loads steps, modes and starter workflows', () => {
  assert.ok(library.stepsById.has('grammar'))
  assert.deepEqual(Object.keys(library.modes).sort(), ['academic', 'aggressive', 'creative', 'simplified', 'standard'])
  assert.ok(library.starters.length >= 5)
  for (const s of library.starters) {
    assert.match(s.id, /^starter:/)
    assert.ok(s.steps.length > 0, `${s.name} has steps`)
  }
})

test('mode prompt ends with the preserve and output rules', () => {
  const prompt = buildModePrompt(library, 'standard')
  assert.ok(prompt.startsWith(library.modes.standard.prompt))
  assert.ok(prompt.includes(library.preserveRule))
  assert.ok(prompt.endsWith(library.outputRule))
})

test('mode prompts no longer frame the task as plagiarism removal', () => {
  for (const mode of Object.keys(library.modes)) {
    assert.doesNotMatch(buildModePrompt(library, mode), /plagiarism|zero phrases/i)
  }
})

test('unknown mode throws', () => {
  assert.throws(() => buildModePrompt(library, 'nope'), /Unknown mode/)
})

test('workflow prompt numbers steps in order and fills params', () => {
  const prompt = buildWorkflowPrompt(library, {
    steps: [{ id: 'grammar' }, { id: 'translate', params: { lang: 'French' } }],
    custom_instruction: 'Keep it short.',
  })
  assert.match(prompt, /1\. Correct spelling/)
  assert.match(prompt, /2\. Translate the text into French/)
  assert.match(prompt, /Additional instructions from the user:\nKeep it short\./)
})

test('workflow prompt uses param defaults when none are given', () => {
  const prompt = buildWorkflowPrompt(library, { steps: [{ id: 'translate' }] })
  assert.match(prompt, /into Spanish/)
})

test('options add length and formality lines', () => {
  const prompt = buildModePrompt(library, 'standard', { length: 'shorter', formality: 'formal' })
  assert.ok(prompt.includes(library.options.length.shorter))
  assert.ok(prompt.includes(library.options.formality.formal))
  const neutral = buildModePrompt(library, 'standard', { length: 'same', formality: 'neutral' })
  assert.equal(neutral, buildModePrompt(library, 'standard'))
})
