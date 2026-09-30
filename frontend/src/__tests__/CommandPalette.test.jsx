import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CommandPalette from '../components/palette/CommandPalette.jsx'

function setup() {
  const copy = vi.fn()
  const formal = vi.fn()
  const onClose = vi.fn()
  const commands = [
    { id: 'copy', group: 'Actions', label: 'Copy rewrite', run: copy },
    { id: 'hidden', group: 'Actions', label: 'Disabled thing', disabled: true, run: vi.fn() },
    { id: 'formal', group: 'Adjust', label: 'Tone: formal', run: formal },
  ]
  render(<CommandPalette open onClose={onClose} commands={commands} />)
  return { copy, formal, onClose, input: screen.getByRole('combobox', { name: 'Search commands' }) }
}

describe('CommandPalette', () => {
  it('lists enabled commands only', () => {
    setup()
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['Copy rewriteActions', 'Tone: formalAdjust'])
  })

  it('filters by every typed word, including the group', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'adjust form' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.change(input, { target: { value: 'nothing matches' } })
    expect(screen.getByText('No matching commands')).toBeTruthy()
  })

  it('runs the highlighted command with arrow keys and Enter, then closes', () => {
    const { input, formal, onClose } = setup()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getAllByRole('option')[1].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(formal).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalled()
  })

  it('runs a command on click', () => {
    const { copy } = setup()
    fireEvent.click(screen.getByText('Copy rewrite'))
    expect(copy).toHaveBeenCalledOnce()
  })
})
