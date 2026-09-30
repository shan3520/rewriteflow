import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplateLibrary from '../components/templates/TemplateLibrary.jsx'

const stepsById = new Map([['grammar', { id: 'grammar', label: 'Fix grammar' }], ['translate', { id: 'translate', label: 'Translate' }]])
const saved = { id: 'w1', name: 'Mine', steps: [{ id: 'grammar' }, { id: 'translate', params: { lang: 'French' } }], custom_instruction: 'Be brief' }
const starter = { id: 'starter:email_polish', name: 'Email Polish', description: 'Short emails', steps: [{ id: 'grammar' }], starter: true }

describe('TemplateLibrary', () => {
  it('shows saved and starter workflows with their steps', () => {
    render(<TemplateLibrary starters={[starter]} workflows={[saved]} stepsById={stepsById} onUse={vi.fn()} onEdit={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />)
    expect(screen.getByText('Mine')).toBeTruthy()
    expect(screen.getByText('2. Translate (French)')).toBeTruthy()
    expect(screen.getByText('+ custom instruction')).toBeTruthy()
    expect(screen.getByText('Email Polish')).toBeTruthy()
  })

  it('starters can be used or duplicated but not edited or deleted', () => {
    const onDuplicate = vi.fn()
    render(<TemplateLibrary starters={[starter]} workflows={[]} stepsById={stepsById} onUse={vi.fn()} onEdit={vi.fn()} onDuplicate={onDuplicate} onDelete={vi.fn()} onNew={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Edit: Email Polish' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete: Email Polish' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate: Email Polish' }))
    expect(onDuplicate).toHaveBeenCalledWith(starter)
  })

  it('shows an empty state for saved workflows', () => {
    render(<TemplateLibrary starters={[]} workflows={[]} stepsById={stepsById} onUse={vi.fn()} onEdit={vi.fn()} onDuplicate={vi.fn()} onDelete={vi.fn()} onNew={vi.fn()} />)
    expect(screen.getByText(/haven't saved any workflows/)).toBeTruthy()
  })
})
