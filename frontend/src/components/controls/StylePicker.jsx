import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, Settings2 } from 'lucide-react'
import { cn } from '../../lib/cn.js'

/**
 * Listbox for choosing a mode or workflow. `choices` come from
 * useStyleChoices(); `value` is a selection key (see lib/selection.js).
 */
export default function StylePicker({ value, onChange, choices, disabled }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const listboxId = useId()

  const index = Math.max(0, choices.findIndex(c => c.key === value))
  const selected = choices[index]
  const SelectedIcon = selected?.Icon

  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [open])

  // When the listbox opens, move focus to the selected option so arrow keys
  // and Escape work without a hunt for the menu.
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => optionRefs.current[index]?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open, index])

  function choose(key) {
    onChange(key)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleTriggerKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setOpen(true)
    }
  }

  function handleListKeyDown(e) {
    const count = choices.length
    const current = optionRefs.current.findIndex(el => el === document.activeElement)
    const focus = (i) => optionRefs.current[i]?.focus()
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); focus(current < 0 ? 0 : (current + 1) % count) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(current < 0 ? count - 1 : (current - 1 + count) % count) }
    else if (e.key === 'Home') { e.preventDefault(); focus(0) }
    else if (e.key === 'End') { e.preventDefault(); focus(count - 1) }
    // Close and hand focus back to the trigger so the next Tab proceeds in
    // normal order instead of dropping to <body> as the options unmount.
    else if (e.key === 'Tab') { e.preventDefault(); close() }
  }

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-label={`Rewrite style: ${selected?.label ?? 'loading'}`}
        className="bezel-inner flex items-center gap-4 px-5 py-3.5 w-full sm:min-w-[260px] sm:max-w-[340px] justify-between hover:border-[color:var(--accent)] transition-colors disabled:opacity-60"
      >
        <span className="flex items-center gap-3 label text-xs text-[color:var(--accent)] min-w-0">
          {SelectedIcon && <SelectedIcon size={16} className="shrink-0" />}
          <span className="truncate">{selected?.label ?? '…'}</span>
        </span>
        <ChevronDown size={14} className={cn('text-gray-500 transition-transform duration-200 shrink-0', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label="Rewrite style"
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-3 left-0 w-full sm:w-96 bezel z-dropdown max-h-[60vh] overflow-y-auto"
          >
            {choices.map((c, i) => (
              <Fragment key={c.key}>
                {(i === 0 || choices[i - 1].group !== c.group) && (
                  <li role="presentation" className="label label-muted text-[9px] px-6 pt-4 pb-2">{c.group}</li>
                )}
                <li role="presentation">
                  <button
                    ref={el => { optionRefs.current[i] = el }}
                    type="button"
                    role="option"
                    aria-selected={value === c.key}
                    onClick={() => choose(c.key)}
                    className={cn(
                      'w-full text-left px-6 py-3.5 rounded-md transition-colors',
                      value === c.key ? 'bg-gray-100 dark:bg-ink-raised' : 'hover:bg-gray-50 dark:hover:bg-ink-raised/60',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <c.Icon size={18} className={cn('shrink-0', value === c.key ? 'text-oxford dark:text-oxford-soft' : 'text-gray-500')} />
                      <div className="min-w-0">
                        <div className={cn('label text-xs truncate', value === c.key && 'label-accent')}>{c.label}</div>
                        <div className="text-sm font-serif text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{c.desc}</div>
                      </div>
                    </div>
                  </button>
                </li>
              </Fragment>
            ))}
            <li role="presentation" className="border-t border-gray-200 dark:border-ink-border mt-2">
              <Link to="/workflows" className="flex items-center gap-2 label text-[10px] px-6 py-3.5 hover:text-[color:var(--accent)]">
                <Settings2 size={13} /> Manage workflows
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
