// Readability statistics. engine/metrics/readability.py implements the same
// algorithm; both are checked against shared/fixtures/readability.json.

const WORD_RE = /[A-Za-z]+(?:['’][A-Za-z]+)*|\d+(?:[.,]\d+)*/g
const SENTENCE_SPLIT_RE = /(?<=[.!?])["'”’)\]]*\s+|\n+/

export const WORDS_PER_MINUTE = 238

export function splitSentences(text) {
  return text.split(SENTENCE_SPLIT_RE).filter(s => /[A-Za-z0-9]/.test(s))
}

export function countSyllables(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 3) return 1
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  const groups = w.match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups ? groups.length : 0)
}

const round1 = (x) => Math.round(x * 10) / 10

export function analyze(text) {
  const words = text.match(WORD_RE) || []
  const sentences = splitSentences(text).length
  if (!words.length || !sentences) {
    return { words: 0, sentences: 0, syllables: 0, avgSentenceLength: 0, fleschReadingEase: 0, fleschKincaidGrade: 0, readingMinutes: 0 }
  }
  const syllables = words.reduce((n, w) => n + countSyllables(w), 0)
  const wps = words.length / sentences
  const spw = syllables / words.length
  return {
    words: words.length,
    sentences,
    syllables,
    avgSentenceLength: round1(wps),
    fleschReadingEase: round1(206.835 - 1.015 * wps - 84.6 * spw),
    fleschKincaidGrade: round1(0.39 * wps + 11.8 * spw - 15.59),
    readingMinutes: round1(words.length / WORDS_PER_MINUTE),
  }
}

// Plain-language band for a Flesch reading-ease score.
export function easeLabel(score) {
  if (score >= 80) return 'Very easy'
  if (score >= 60) return 'Plain'
  if (score >= 50) return 'Fairly hard'
  if (score >= 30) return 'Hard'
  return 'Very hard'
}

export function formatReadingTime(words) {
  if (!words) return '0 min'
  const minutes = words / WORDS_PER_MINUTE
  return minutes < 1 ? '< 1 min' : `${Math.round(minutes)} min`
}
