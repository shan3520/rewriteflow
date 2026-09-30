import { describe, it, expect } from 'vitest'
import { changeRatio, diffParagraphs } from '../lib/diff.js'

describe('diffParagraphs', () => {
  it('diffs paragraph pairs separately when counts match', () => {
    const result = diffParagraphs('The cat sat.\n\nIt was fine.', 'The dog sat.\n\nIt was fine.')
    expect(result).toHaveLength(2)
    expect(result[0].filter(p => p.type === 'removed').map(p => p.value)).toEqual(['cat'])
    expect(result[0].filter(p => p.type === 'added').map(p => p.value)).toEqual(['dog'])
    expect(result[1].every(p => p.type === 'same')).toBe(true)
  })

  it('keeps shared phrases when a sentence is reordered', () => {
    const [parts] = diffParagraphs('Sales rose 12% in 2024 thanks to Acme Corp.', 'Thanks to Acme Corp, sales increased in 2024.')
    expect(parts.filter(p => p.type === 'same').map(p => p.value.trim())).toContain('to Acme Corp')
  })

  it('falls back to one block when paragraph counts differ', () => {
    expect(diffParagraphs('A.\n\nB.', 'A and B.')).toHaveLength(1)
  })

  it('computes the share of original words changed', () => {
    expect(changeRatio(diffParagraphs('one two three four', 'one two three four'))).toBe(0)
    expect(changeRatio(diffParagraphs('one two three four', 'one two six four'))).toBe(0.25)
  })
})
