import { RotateCcw } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import SideBySideDiff from '../diff/SideBySideDiff.jsx'
import StatsBar from '../stats/StatsBar.jsx'
import MeaningCheckPanel from '../stats/MeaningCheckPanel.jsx'
import ExportControls from '../diff/ExportControls.jsx'

/**
 * Detailed view of one past rewrite (or batch result): word diff, readability
 * and meaning check, with export and "restore to editor" actions.
 * `snapshot` is { original_text, rewritten_text, title?, filename? }.
 */
export default function SnapshotRestoreModal({ snapshot, onRestore, onClose }) {
  if (!snapshot) return null
  const title = snapshot.title ?? 'Rewrite'

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="lg"
      footer={<>
        <ExportControls rewritten={snapshot.rewritten_text} original={snapshot.original_text} defaultName={snapshot.filename ?? 'rewrite'} title={title} />
        {onRestore && (
          <button type="button" className="btn-primary flex items-center gap-2" onClick={() => onRestore(snapshot)}>
            <RotateCcw size={14} /> Restore to editor
          </button>
        )}
      </>}
    >
      <div className="space-y-8">
        <SideBySideDiff layout="split" originalText={snapshot.original_text} rewrittenText={snapshot.rewritten_text} />
        <div className="border-t border-gray-200 dark:border-ink-border pt-6">
          <h3 className="label text-[10px] mb-4">Readability</h3>
          <StatsBar originalText={snapshot.original_text} rewrittenText={snapshot.rewritten_text} />
        </div>
        <div className="border-t border-gray-200 dark:border-ink-border pt-6">
          <h3 className="label text-[10px] mb-4">Meaning check</h3>
          <MeaningCheckPanel originalText={snapshot.original_text} rewrittenText={snapshot.rewritten_text} />
        </div>
      </div>
    </Modal>
  )
}
