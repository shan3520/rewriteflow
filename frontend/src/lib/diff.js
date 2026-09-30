import { diffWordsWithSpace } from 'diff'

const splitParagraphs = (text) => text.split(/\n\n+/).map(p => p.trim()).filter(Boolean)

function toParts(changes) {
  return changes.map(c => ({ type: c.added ? 'added' : c.removed ? 'removed' : 'same', value: c.value }))
}

// Word-level diff. When both texts have the same number of paragraphs (the
// normal case, since the backend rewrites paragraph by paragraph) each pair is
// diffed separately, which keeps long documents fast and the output aligned.
export function diffParagraphs(original, rewritten) {
  const a = splitParagraphs(original)
  const b = splitParagraphs(rewritten)
  if (a.length === b.length) {
    return a.map((p, i) => toParts(diffWordsWithSpace(p, b[i])))
  }
  return [toParts(diffWordsWithSpace(a.join('\n\n'), b.join('\n\n')))]
}

const countWords = (s) => (s.match(/\S+/g) || []).length

// Share of the original's words that were removed or replaced (0 to 1).
export function changeRatio(paragraphs) {
  let same = 0
  let removed = 0
  for (const parts of paragraphs) {
    for (const part of parts) {
      if (part.type === 'same') same += countWords(part.value)
      else if (part.type === 'removed') removed += countWords(part.value)
    }
  }
  const total = same + removed
  return total ? removed / total : 0
}
