import { useId, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import { cn } from '../../lib/cn.js'

function matches(command, query) {
  const hay = `${command.label} ${command.group} ${command.keywords ?? ''}`.toLowerCase()
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(word => hay.includes(word))
}

/**
 * Searchable list of actions. `commands` are { id, label, group, hint?,
 * keywords?, disabled?, run }. Arrow keys move, Enter runs, Escape closes.
 */
export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listId = useId()

  const results = useMemo(() => commands.filter(c => !c.disabled && matches(c, query)), [commands, query])
  const activeIndex = Math.min(active, Math.max(0, results.length - 1))

  function runCommand(command) {
    onClose()
    setQuery('')
    setActive(0)
    command.run()
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((activeIndex + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((activeIndex - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      runCommand(results[activeIndex])
    }
  }

  const optionId = (i) => `${listId}-${i}`

  return (
    <Modal open={open} onClose={onClose} title="Commands" size="md" initialFocusRef={inputRef}>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
          aria-label="Search commands"
          placeholder="Type a command, style or page…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={handleKeyDown}
          className="field !pl-10"
        />
      </div>
      <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto -mx-2">
        {results.length === 0 && <li className="font-serif text-gray-600 dark:text-gray-400 px-4 py-6 text-center">No matching commands</li>}
        {results.map((c, i) => (
          <li
            key={c.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex}
            onMouseEnter={() => setActive(i)}
            onClick={() => runCommand(c)}
            className={cn(
              'flex items-center justify-between gap-4 px-4 py-2.5 rounded-md cursor-pointer',
              i === activeIndex ? 'bg-gray-100 dark:bg-ink-raised' : '',
            )}
          >
            <span className="font-serif text-base text-gray-900 dark:text-gray-100">{c.label}</span>
            <span className="label label-muted text-[9px] shrink-0">{c.hint ?? c.group}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
