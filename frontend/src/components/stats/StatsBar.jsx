import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { analyze, easeLabel, formatReadingTime } from '../../lib/readability.js'
import { changeRatio, diffParagraphs } from '../../lib/diff.js'

function Stat({ label, before, after, hint }) {
  return (
    <div className="min-w-[8.5rem]">
      <dt className="label label-muted text-[10px] mb-1.5" title={hint}>{label}</dt>
      <dd className="font-mono text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 tabular-nums">
        <span>{before}</span>
        <ArrowRight size={12} className="text-gray-400" aria-label="to" />
        <span className="font-semibold text-[color:var(--accent)]">{after}</span>
      </dd>
    </div>
  )
}

// Before/after readability numbers for a finished rewrite.
export default function StatsBar({ originalText, rewrittenText }) {
  const { a, b, changed } = useMemo(() => ({
    a: analyze(originalText),
    b: analyze(rewrittenText),
    changed: changeRatio(diffParagraphs(originalText, rewrittenText)),
  }), [originalText, rewrittenText])

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-5" aria-label="Readability before and after">
      <Stat label="Words" before={a.words.toLocaleString()} after={b.words.toLocaleString()} />
      <Stat label="Grade level" before={a.fleschKincaidGrade} after={b.fleschKincaidGrade} hint="Flesch–Kincaid grade: roughly the US school grade needed to follow the text. Lower is easier." />
      <Stat label="Reading ease" before={`${a.fleschReadingEase} · ${easeLabel(a.fleschReadingEase)}`} after={`${b.fleschReadingEase} · ${easeLabel(b.fleschReadingEase)}`} hint="Flesch reading ease, 0–100+. Higher is easier." />
      <Stat label="Avg sentence" before={`${a.avgSentenceLength} w`} after={`${b.avgSentenceLength} w`} />
      <Stat label="Reading time" before={formatReadingTime(a.words)} after={formatReadingTime(b.words)} />
      <div>
        <dt className="label label-muted text-[10px] mb-1.5">Words changed</dt>
        <dd className="font-mono text-sm font-semibold text-[color:var(--accent)] tabular-nums">{Math.round(changed * 100)}%</dd>
      </div>
    </dl>
  )
}
