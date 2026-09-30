import { describe, it, expect } from 'vitest'
import cases from '../../../shared/fixtures/meaning_check.json'
import { checkMeaning, extractFacts } from '../lib/meaningCheck.js'

describe('meaning check', () => {
  it.each(cases)('$name', ({ original, rewritten, expected }) => {
    expect(checkMeaning(original, rewritten)).toEqual(expected)
  })

  it('treats 1,000 and 1000 as the same number', () => {
    expect(checkMeaning('We sold 1,000 units.', 'We sold 1000 units.').missing).toEqual([])
  })

  it('does not report the pronoun I or sentence-initial words as names', () => {
    expect(extractFacts("I think so. Yesterday I'm sure it rained.")).toEqual([])
  })

  it('does not count a number that is part of a larger one', () => {
    const result = checkMeaning('The fee is 5 dollars.', 'The fee is 50 dollars.')
    expect(result.missing).toEqual([{ type: 'number', value: '5' }])
    expect(result.added).toEqual([{ type: 'number', value: '50' }])
  })
})
