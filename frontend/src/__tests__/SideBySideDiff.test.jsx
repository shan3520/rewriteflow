import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SideBySideDiff from '../components/diff/SideBySideDiff.jsx'

describe('SideBySideDiff', () => {
  it('marks removed and added words inline', () => {
    const { container } = render(<SideBySideDiff originalText="The cat sat." rewrittenText="The dog sat." />)
    expect(container.querySelector('del').textContent).toBe('cat')
    expect(container.querySelector('ins').textContent).toBe('dog')
  })

  it('split layout shows removals only on the original side', () => {
    render(<SideBySideDiff layout="split" originalText="The cat sat." rewrittenText="The dog sat." />)
    const original = screen.getByLabelText('Original with removals marked')
    const rewrite = screen.getByLabelText('Rewrite with additions marked')
    expect(original.querySelector('del').textContent).toBe('cat')
    expect(original.querySelector('ins')).toBeNull()
    expect(rewrite.querySelector('ins').textContent).toBe('dog')
    expect(rewrite.querySelector('del')).toBeNull()
  })
})
