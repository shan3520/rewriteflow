import { useMemo } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { checkMeaning, FACT_LABELS } from '../../lib/meaningCheck.js'

function FactList({ title, facts, tone }) {
  if (!facts.length) return null
  return (
    <div>
      <h4 className="label text-[10px] mb-2">{title}</h4>
      <ul className="flex flex-wrap gap-2">
        {facts.map(f => (
          <li
            key={`${f.type}:${f.value}`}
            className={tone === 'missing'
              ? 'font-serif text-sm px-2 py-1 rounded border border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100'
              : 'font-serif text-sm px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'}
          >
            <span className="label text-[9px] mr-1.5 opacity-80">{FACT_LABELS[f.type]}</span>
            {f.value}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Lists the numbers, names, links, citations and quotes that the rewrite
 * dropped or introduced, so they can be checked before the text is used.
 */
export default function MeaningCheckPanel({ originalText, rewrittenText, result: given }) {
  const result = useMemo(() => given ?? checkMeaning(originalText, rewrittenText), [given, originalText, rewrittenText])
  const issues = result.missing.length + result.added.length

  if (!issues) {
    return (
      <div className="flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
        <ShieldCheck size={18} className="shrink-0 mt-0.5" />
        <p className="font-serif">
          {result.checked
            ? `All ${result.checked} specific detail${result.checked === 1 ? '' : 's'} (numbers, names, links, citations, quotes) carried over unchanged.`
            : 'No numbers, names, links, citations or quotes to check.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 text-amber-800 dark:text-amber-300">
        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
        <p className="font-serif">
          {issues} detail{issues === 1 ? '' : 's'} changed. Check these before you use the rewrite. Some may be harmless rewording, like “5” becoming “five”.
        </p>
      </div>
      <FactList title="Missing from the rewrite" facts={result.missing} tone="missing" />
      <FactList title="New in the rewrite" facts={result.added} tone="added" />
    </div>
  )
}
