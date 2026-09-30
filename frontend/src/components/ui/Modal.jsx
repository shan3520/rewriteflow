import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn.js'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Accessible dialog: traps Tab focus, closes on Escape or backdrop click, and
// returns focus to whatever opened it.
export default function Modal({ open, onClose, title, description, children, footer, size = 'md', initialFocusRef }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    const panel = panelRef.current
    const first = initialFocusRef?.current || panel?.querySelector(FOCUSABLE) || panel
    first?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflow
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [open, initialFocusRef])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full bezel animate-fade-in-up focus:outline-none my-8',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-2xl',
          size === 'lg' && 'max-w-5xl',
        )}
      >
        <div className="bezel-inner p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h2 id={titleId} className="text-2xl font-display text-oxford dark:text-white">{title}</h2>
              {description && <p id={descId} className="mt-1 font-serif text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost !p-2 shrink-0">
              <X size={18} />
            </button>
          </div>
          {children}
          {footer && <div className="mt-8 flex flex-wrap items-center justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
