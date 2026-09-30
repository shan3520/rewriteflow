import { useMemo } from 'react'
import { diffParagraphs } from '../../lib/diff.js'
import { cn } from '../../lib/cn.js'

const ADDED = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 rounded-sm no-underline'
const REMOVED = 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100 rounded-sm line-through decoration-red-700/60'

function Parts({ parts, show }) {
  return parts.map((part, i) => {
    if (part.type === 'same') return <span key={i}>{part.value}</span>
    if (!show.includes(part.type)) return null
    return part.type === 'added'
      ? <ins key={i} className={ADDED} title="Added">{part.value}</ins>
      : <del key={i} className={REMOVED} title="Removed">{part.value}</del>
  })
}

/**
 * Word-level diff between an original and a rewrite.
 * layout="inline": one column with deletions and insertions interleaved.
 * layout="split":  original (deletions marked) beside rewrite (insertions marked).
 */
export default function SideBySideDiff({ originalText, rewrittenText, layout = 'inline', className }) {
  const paragraphs = useMemo(() => diffParagraphs(originalText, rewrittenText), [originalText, rewrittenText])

  const legend = (
    <p className="label label-muted text-[10px] mb-4 flex items-center gap-4">
      <span className={cn(REMOVED, 'px-1')}>removed</span>
      <span className={cn(ADDED, 'px-1')}>added</span>
    </p>
  )

  if (layout === 'split') {
    return (
      <div className={className}>
        {legend}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-serif text-base leading-relaxed">
          <section aria-label="Original with removals marked">
            <h3 className="label text-[10px] mb-3">Original</h3>
            {paragraphs.map((parts, i) => (
              <p key={i} className="mb-4 whitespace-pre-wrap"><Parts parts={parts} show={['removed']} /></p>
            ))}
          </section>
          <section aria-label="Rewrite with additions marked">
            <h3 className="label label-accent text-[10px] mb-3">Rewrite</h3>
            {paragraphs.map((parts, i) => (
              <p key={i} className="mb-4 whitespace-pre-wrap"><Parts parts={parts} show={['added']} /></p>
            ))}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {legend}
      {paragraphs.map((parts, i) => (
        <p key={i} className="mb-7 last:mb-0 whitespace-pre-wrap"><Parts parts={parts} show={['added', 'removed']} /></p>
      ))}
    </div>
  )
}
