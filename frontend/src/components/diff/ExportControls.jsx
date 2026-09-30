import { useState } from 'react'
import { FileDown } from 'lucide-react'
import ExportModal from '../export/ExportModal.jsx'

/**
 * "Export" button for an output header, plus the dialog it opens. Pass
 * `open`/`onOpenChange` to control it from outside (e.g. the command palette).
 */
export default function ExportControls({ rewritten, original, defaultName, title, disabled, open: openProp, onOpenChange }) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState

  return (
    <>
      <button
        type="button"
        disabled={disabled || !rewritten}
        onClick={() => setOpen(true)}
        className="label label-accent text-[10px] flex items-center gap-1.5 tap-target hover:underline underline-offset-4 disabled:opacity-50"
      >
        <FileDown size={12} /> Export
      </button>
      {open && (
        <ExportModal
          open
          onClose={() => setOpen(false)}
          rewritten={rewritten}
          original={original}
          defaultName={defaultName}
          title={title}
        />
      )}
    </>
  )
}
