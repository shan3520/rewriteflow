import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PipelineCanvas from '../components/canvas/PipelineCanvas.jsx'
import { withKeys, withoutKeys } from '../lib/steps.js'

const library = [
  { id: 'grammar', label: 'Fix grammar', description: '' },
  { id: 'concise', label: 'Make concise', description: '' },
  { id: 'translate', label: 'Translate', description: '', params: { lang: { label: 'Language', default: 'Spanish' } } },
]

function Harness({ initial, onSteps = () => {} }) {
  const [steps, setSteps] = useState(() => withKeys(initial))
  return <PipelineCanvas steps={steps} library={library} onChange={(next) => { setSteps(next); onSteps(withoutKeys(next)) }} />
}

const labels = () => within(screen.getByRole('list', { name: 'Workflow steps' })).getAllByRole('listitem').map(li => li.querySelector('.font-display').textContent)

describe('PipelineCanvas', () => {
  it('reorders, removes and adds steps', () => {
    render(<Harness initial={[{ id: 'grammar' }, { id: 'concise' }]} />)
    const moveUp = screen.getByRole('button', { name: 'Move Make concise down' }).previousElementSibling
    moveUp.focus()
    fireEvent.click(moveUp)
    expect(labels()).toEqual(['Make concise', 'Fix grammar'])
    // Stable keys: the same button moved with its step and kept focus.
    expect(document.activeElement).toBe(moveUp)

    fireEvent.click(screen.getByRole('button', { name: 'Remove Fix grammar' }))
    expect(labels()).toEqual(['Make concise'])

    fireEvent.change(screen.getByLabelText('Step to add'), { target: { value: 'translate' } })
    fireEvent.click(screen.getByRole('button', { name: /Add step/ }))
    expect(labels()).toEqual(['Make concise', 'Translate'])
  })

  it('edits step parameters and drops empty ones', () => {
    const onSteps = vi.fn()
    render(<Harness initial={[{ id: 'translate' }]} onSteps={onSteps} />)
    const input = screen.getByPlaceholderText('Spanish')
    fireEvent.change(input, { target: { value: 'German' } })
    expect(onSteps).toHaveBeenLastCalledWith([{ id: 'translate', params: { lang: 'German' } }])
    fireEvent.change(input, { target: { value: '' } })
    expect(onSteps).toHaveBeenLastCalledWith([{ id: 'translate', params: undefined }])
  })

  it('disables moving past either end', () => {
    render(<Harness initial={[{ id: 'grammar' }, { id: 'concise' }]} />)
    expect(screen.getByRole('button', { name: 'Move Fix grammar up' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Move Make concise down' }).disabled).toBe(true)
  })
})
