import { describe, it, expect } from 'vitest'
import { parseSelection, selectionToRequest, workflowSelection, modeSelection } from '../lib/selection.js'
import { moveItem } from '../lib/steps.js'

describe('selection keys', () => {
  it('round-trips modes, saved workflows and starters', () => {
    expect(selectionToRequest(modeSelection('academic'))).toEqual({ mode: 'academic' })
    expect(selectionToRequest(workflowSelection('starter:email_polish'))).toEqual({ workflowId: 'starter:email_polish' })
    expect(parseSelection('workflow:1234')).toEqual({ kind: 'workflow', id: '1234' })
  })
})

describe('moveItem', () => {
  it('moves without mutating', () => {
    const list = ['a', 'b', 'c']
    expect(moveItem(list, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(list).toEqual(['a', 'b', 'c'])
  })
})
