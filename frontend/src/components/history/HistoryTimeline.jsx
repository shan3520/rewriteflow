import { Fragment, useMemo } from 'react'
import { dayKey, dayLabel } from '../../lib/dates.js'

/** Groups history items by the day they were made, newest first. */
export default function HistoryTimeline({ items, renderItem, now }) {
  const groups = useMemo(() => {
    const out = []
    for (const item of items) {
      const date = new Date(item.created_at)
      const key = dayKey(date)
      if (!out.length || out[out.length - 1].key !== key) out.push({ key, label: dayLabel(date, now), items: [] })
      out[out.length - 1].items.push(item)
    }
    return out
  }, [items, now])

  let index = 0
  return groups.map(group => (
    <section key={group.key} aria-label={group.label} className="mb-10">
      <h2 className="label text-[11px] mb-5 flex items-center gap-4">
        {group.label}
        <span className="flex-1 h-px bg-gray-300 dark:bg-ink-border" aria-hidden="true" />
        <span className="label-muted">{group.items.length}</span>
      </h2>
      {group.items.map(item => <Fragment key={item.id}>{renderItem(item, index++)}</Fragment>)}
    </section>
  ))
}
