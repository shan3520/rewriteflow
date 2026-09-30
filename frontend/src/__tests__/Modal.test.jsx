import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../components/ui/Modal.jsx'

describe('Modal', () => {
  it('renders a labelled dialog, focuses inside it and closes on Escape', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Export"><button>Inside</button></Modal>)
    const dialog = screen.getByRole('dialog', { name: 'Export' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Hidden" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
