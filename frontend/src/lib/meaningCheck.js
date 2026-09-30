// Meaning check: finds the concrete details a rewrite must not lose or invent
// (numbers, names, URLs, emails, citations and direct quotes) and reports
// which ones are missing from, or newly added to, the rewritten text.
// engine/nodes/hallucination.py is a Python port of the same algorithm; both
// are checked against shared/fixtures/meaning_check.json.

const URL_RE = /\bhttps?:\/\/[^\s<>"'()[\]]+/g
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g
const PAREN_CITATION_RE = /\([^()]*\b(?:1[5-9]|20)\d{2}[a-z]?\b[^()]*\)/g
const BRACKET_CITATION_RE = /\[\d+(?:\s*[,–-]\s*\d+)*\]/g
const QUOTE_RE = /["“]([^"“”\n]{3,300})["”]/g
const NUMBER_RE = /(?<![A-Za-z0-9_.,])(?<![A-Za-z]-)\d+(?:[.,]\d+)*(?:\s?%)?/g
const NAME_RE = /[A-Z][A-Za-z0-9'’&-]*(?:[ \t]+[A-Z][A-Za-z0-9'’&-]*)*/g
const SENTENCE_START_CHAR_RE = /[.!?:;"“”'‘’([•*#>\-–—]/
const PRONOUN_I_RE = /^I(?:['’][a-z]+)?$/

export const FACT_LABELS = {
  number: 'Number',
  name: 'Name',
  url: 'Link',
  email: 'Email',
  citation: 'Citation',
  quote: 'Quote',
}

const collapse = (s) => s.replace(/\s+/g, ' ').trim()
const straightQuotes = (s) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function normalizeNumber(value) {
  return value.replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/\s/g, '')
}

function atSentenceStart(text, index) {
  const m = text.slice(0, index).match(/(\S?)(\s*)$/)
  return !m[1] || SENTENCE_START_CHAR_RE.test(m[1]) || m[2].includes('\n')
}

// Pull matches out of `text`, replacing each with a space so later patterns
// don't double-count them. Returns [values, remainingText].
function take(text, re, map = (m) => m[0]) {
  const values = []
  const rest = text.replace(re, (...args) => {
    const m = args.slice(0, -2)
    values.push(map(m))
    return ' '
  })
  return [values, rest]
}

export function extractFacts(text) {
  const facts = []
  let rest = text

  let urls, emails, cites, brackets, quotes
  ;[urls, rest] = take(rest, URL_RE, (m) => m[0].replace(/[.,;:!?]+$/, ''))
  ;[emails, rest] = take(rest, EMAIL_RE)
  ;[cites, rest] = take(rest, PAREN_CITATION_RE, (m) => collapse(m[0]))
  ;[brackets, rest] = take(rest, BRACKET_CITATION_RE, (m) => collapse(m[0]))
  ;[quotes, rest] = take(rest, QUOTE_RE, (m) => collapse(straightQuotes(m[1])))

  urls.forEach(v => facts.push({ type: 'url', value: v }))
  emails.forEach(v => facts.push({ type: 'email', value: v }))
  ;[...cites, ...brackets].forEach(v => facts.push({ type: 'citation', value: v }))
  quotes.forEach(v => facts.push({ type: 'quote', value: v }))

  for (const m of rest.matchAll(NUMBER_RE)) {
    facts.push({ type: 'number', value: normalizeNumber(m[0]) })
  }

  for (const m of rest.matchAll(NAME_RE)) {
    let words = m[0].split(/[ \t]+/)
    if (atSentenceStart(rest, m.index)) words = words.slice(1)
    words = words.map(w => w.replace(/['’]s$/, '').replace(/[-']+$/, ''))
    const name = words.join(' ')
    if (name.length < 2 || PRONOUN_I_RE.test(name)) continue
    facts.push({ type: 'name', value: name })
  }

  const seen = new Set()
  return facts.filter(f => {
    const key = `${f.type}:${f.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function presentIn(fact, other) {
  switch (fact.type) {
    case 'number':
      return other.numbers.has(fact.value)
    case 'name':
      return new RegExp(`(?<![A-Za-z0-9])${escapeRe(fact.value)}(?![A-Za-z0-9])`).test(other.flat)
    case 'quote':
      return other.flatStraight.includes(fact.value)
    default:
      return other.flat.includes(fact.value)
  }
}

function prepare(text) {
  const facts = extractFacts(text)
  const flat = collapse(text)
  return {
    facts,
    flat,
    flatStraight: straightQuotes(flat),
    numbers: new Set(facts.filter(f => f.type === 'number').map(f => f.value)),
  }
}

export function checkMeaning(original, rewritten) {
  const a = prepare(original)
  const b = prepare(rewritten)
  return {
    checked: a.facts.length,
    missing: a.facts.filter(f => !presentIn(f, b)),
    added: b.facts.filter(f => !presentIn(f, a)),
  }
}
