import { Archive } from 'lucide-react'
import JobProgressCard from './JobProgressCard.jsx'
import { FORMATS } from '../../lib/exporters.js'

/** Summary line, save-format choice, "download all" and the list of files. */
export default function BatchDashboard({ jobs, running, progress, format, onFormatChange, onView, onDownload, onRemove, onDownloadAll }) {
  const count = (status) => jobs.filter(j => j.status === status).length
  const done = count('done')

  return (
    <section aria-labelledby="batch-files-heading">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 id="batch-files-heading" className="label text-[11px]">
          {jobs.length} file{jobs.length === 1 ? '' : 's'} · {done} done
          {count('error') > 0 && ` · ${count('error')} failed`}
          {count('queued') > 0 && ` · ${count('queued')} queued`}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="label label-muted text-[10px]">Save as</span>
            <select className="field !py-1.5 !w-auto !text-base" value={format} onChange={(e) => onFormatChange(e.target.value)}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>.{f.ext}</option>)}
            </select>
          </label>
          <button type="button" className="btn-ghost flex items-center gap-2 border border-gray-300 dark:border-ink-border" disabled={!done || running} onClick={onDownloadAll}>
            <Archive size={14} /> Download all (.zip)
          </button>
        </div>
      </div>
      <ul className="space-y-4" aria-live="polite">
        {jobs.map(job => (
          <JobProgressCard
            key={job.id}
            job={job}
            progress={job.status === 'running' ? progress : null}
            canRemove={job.status !== 'running' && !(running && job.status === 'queued')}
            onView={() => onView(job)}
            onDownload={() => onDownload(job)}
            onRemove={() => onRemove(job)}
          />
        ))}
      </ul>
    </section>
  )
}
