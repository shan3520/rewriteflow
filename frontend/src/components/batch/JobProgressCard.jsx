import { Download, Eye, X, CheckCircle2, AlertCircle, Loader2, Clock, Ban } from 'lucide-react'

const STATUS = {
  queued: { label: 'Queued', Icon: Clock, className: 'text-gray-500' },
  running: { label: 'Rewriting', Icon: Loader2, className: 'text-[color:var(--accent)] animate-spin' },
  done: { label: 'Done', Icon: CheckCircle2, className: 'text-emerald-700 dark:text-emerald-400' },
  error: { label: 'Failed', Icon: AlertCircle, className: 'text-red-700 dark:text-red-400' },
  cancelled: { label: 'Cancelled', Icon: Ban, className: 'text-gray-500' },
}

/** One file in a batch: status, progress, meaning-check count and actions. */
export default function JobProgressCard({ job, progress, onView, onDownload, onRemove, canRemove }) {
  const { label, Icon, className } = STATUS[job.status]
  const pct = job.status === 'running' && progress?.total ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <li className="bezel">
      <div className="bezel-inner p-5">
        <div className="flex items-start gap-4">
          <Icon size={18} className={`${className} shrink-0 mt-1`} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg text-oxford dark:text-white truncate">{job.name}</div>
            <div className="label label-muted text-[10px] mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>{label}</span>
              <span>{job.words.toLocaleString()} words</span>
              {job.status === 'running' && progress?.total > 0 && <span>Paragraph {progress.current} of {progress.total}</span>}
              {job.status === 'done' && (
                <span className={job.issues ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                  {job.issues ? `${job.issues} detail${job.issues === 1 ? '' : 's'} to check` : 'Details preserved'}
                </span>
              )}
            </div>
            {job.status === 'error' && <p className="font-serif text-sm text-red-700 dark:text-red-400 mt-2">{job.error}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {job.status === 'done' && (
              <>
                <button type="button" className="btn-ghost !p-2" onClick={onView} aria-label={`View changes in ${job.name}`}><Eye size={16} /></button>
                <button type="button" className="btn-ghost !p-2" onClick={onDownload} aria-label={`Download ${job.name}`}><Download size={16} /></button>
              </>
            )}
            {canRemove && (
              <button type="button" className="btn-ghost !p-2 hover:!text-red-700" onClick={onRemove} aria-label={`Remove ${job.name}`}><X size={16} /></button>
            )}
          </div>
        </div>
        {job.status === 'running' && (
          <div
            role="progressbar"
            aria-label={`Progress for ${job.name}`}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-4 h-1.5 bg-gray-200 dark:bg-ink-raised rounded-full overflow-hidden"
          >
            <div className="progress-bar-fill h-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </li>
  )
}
