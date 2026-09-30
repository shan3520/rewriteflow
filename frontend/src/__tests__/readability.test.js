import { describe, it, expect } from 'vitest'
import cases from '../../../shared/fixtures/readability.json'
import { analyze, countSyllables, easeLabel, formatReadingTime, splitSentences } from '../lib/readability.js'

describe('readability', () => {
  it.each(cases)('matches the shared fixture for %#', ({ text, expected }) => {
    expect(analyze(text)).toEqual(expected)
  })

  it('counts syllables with the usual heuristics', () => {
    expect(countSyllables('cat')).toBe(1)
    expect(countSyllables('table')).toBe(2)
    expect(countSyllables('wonderful')).toBe(3)
    expect(countSyllables('2024')).toBe(1)
  })

  it('splits sentences on terminal punctuation and newlines', () => {
    expect(splitSentences('One. "Two!" Three?\nFour')).toHaveLength(4)
  })

  it('labels reading ease and reading time', () => {
    expect(easeLabel(85)).toBe('Very easy')
    expect(easeLabel(10)).toBe('Very hard')
    expect(formatReadingTime(0)).toBe('0 min')
    expect(formatReadingTime(100)).toBe('< 1 min')
    expect(formatReadingTime(476)).toBe('2 min')
  })
})
