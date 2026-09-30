import { useState } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import ExportStyleOptions from './ExportStyleOptions.jsx'
import { buildExport, downloadBlob } from '../../lib/exporters.js'

/** Download a rewrite as .txt, .md or .docx. */
export default function ExportModal({ open, onClose, rewritten, original, defaultName = 'rewrite', title = 'Rewrite' }) {
  const [settings, setSettings] = useState({ format: 'docx', filename: defaultName, includeOriginal: false })
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    setBusy(true)
    try {
      downloadBlob(await buildExport({ ...settings, title, rewritten, original }))
      onClose()
    } catch (err) {
      toast.error(err.message || "Couldn't create the file.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export"
      description="Download the rewrite to use in another app."
      size="md"
      footer={<>
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={handleExport} disabled={busy}>
          <Download size={14} /> {busy ? 'Preparing…' : 'Download'}
        </button>
      </>}
    >
      <ExportStyleOptions value={settings} onChange={setSettings} />
    </Modal>
  )
}
