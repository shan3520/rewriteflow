import { useEffect, useRef } from 'react'

// Registers global shortcuts like { 'mod+enter': fn, 'mod+k': fn }, where
// "mod" is Cmd on macOS and Ctrl elsewhere. They fire even while typing in a
// text field, since both shortcuts are meant for use from the editor.
export function useKeyboardShortcuts(shortcuts) {
  const ref = useRef(shortcuts)
  useEffect(() => { ref.current = shortcuts })

  useEffect(() => {
    function onKeyDown(e) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const combo = `mod+${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`
      const handler = ref.current[combo]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
export const modKey = isMac ? '⌘' : 'Ctrl'
