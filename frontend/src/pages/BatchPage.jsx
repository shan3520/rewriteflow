import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FilePlus, Play, Square } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import StylePicker from '../components/controls/StylePicker.jsx'
import ToneSliders from '../components/controls/ToneSliders.jsx'
import BatchUploadModal from '../components/batch/BatchUploadModal.jsx'
import BatchDashboard from '../components/batch/BatchDashboard.jsx'
import SnapshotRestoreModal from '../components/history/SnapshotRestoreModal.jsx'
import { usePipelineRunner } from '../hooks/usePipelineRunner.js'
import { useStyleChoices } from '../hooks/useStyleChoices.js'
import { checkMeaning } from '../lib/meaningCheck.js'
import { buildExport, buildZip, downloadBlob } from '../lib/exporters.js'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SELECTION, selectionToRequest } from '../lib/selection.js'
import { sleep } from '../lib/sleep.js'

const MAX_CHARS = 50_000

let nextId = 0
const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)

export default function BatchPage() {
  const navigate = useNavigate()
  const runner = usePipelineRunner()
  const choices = useStyleChoices()
  const [jobs, setJobs] = useState([])
  const [selection, setSelection] = useState(() => sessionStorage.getItem('reuse_selection') || DEFAULT_SELECTION)
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS)
  const [format, setFormat] = useState('txt')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [running, setRunning] = useState(false)
  const stopRef = useRef(false)
  const jobsRef = useRef(jobs)
  useEffect(() => { jobsRef.current = jobs })

  useEffect(() => { document.title = 'Batch · RewriteFlow' }, [])

  const patch = (id, changes) => setJobs(list => list.map(j => (j.id === id ? { ...j, ...changes } : j)))

  function addFiles(files) {
    setJobs(list => [...list, ...files.map(f => ({
      id: `job-${nextId++}`, name: f.name, text: f.text, words: countWords(f.text), status: 'queued', output: '', issues: 0, error: null,
    }))])
  }

  async function runOne(job, request) {
    // One retry after a rate-limit response, waiting as long as the server asks.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await runner.run({ ...request, text: job.text })
      } catch (err) {
        if (err.status === 429 && attempt === 0 && !stopRef.current) {
          const wait = (err.retryAfter ?? 30) * 1000
          toast.message(`Rate limited. Waiting ${Math.round(wait / 1000)}s before continuing…`)
          await sleep(wait)
          continue
        }
        throw err
      }
    }
  }

  async function start() {
    const request = { ...selectionToRequest(selection), options: adjustments }
    stopRef.current = false
    setRunning(true)
    for (const job of jobsRef.current.filter(j => j.status === 'queued' || j.status === 'error')) {
      if (stopRef.current) break
      patch(job.id, { status: 'running', error: null })
      try {
        const result = await runOne(job, request)
        if (!result) {
          patch(job.id, { status: 'cancelled' })
          break
        }
        const check = checkMeaning(job.text, result.rewritten_text)
        patch(job.id, { status: 'done', output: result.rewritten_text, issues: check.missing.length + check.added.length })
      } catch (err) {
        patch(job.id, { status: 'error', error: err.message })
      }
    }
    setRunning(false)
    if (!stopRef.current) toast.success('Batch finished.')
  }

  function stop() {
    stopRef.current = true
    runner.cancel()
  }

  const outputName = (job) => `${job.name.replace(/\.[^.]+$/, '')}-rewritten`

  async function download(job) {
    downloadBlob(await buildExport({ format, filename: outputName(job), title: job.name, rewritten: job.output, original: job.text }))
  }

  async function downloadAll() {
    const done = jobs.filter(j => j.status === 'done')
    const files = await Promise.all(done.map(job => buildExport({ format, filename: outputName(job), title: job.name, rewritten: job.output })))
    downloadBlob(await buildZip(files, 'rewrites'))
  }

  function restore(snapshot) {
    sessionStorage.setItem('reuse_text', snapshot.original_text)
    navigate('/')
  }

  const pending = jobs.some(j => j.status === 'queued' || j.status === 'error')

  return (
    <div className="min-h-svh flex flex-col bg-paper dark:bg-ink-bg">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl mx-auto w-full safe-px pt-28 pb-16 focus:outline-none">
        <div className="mb-12 border-b border-gray-300 dark:border-ink-border pb-10">
          <h1 className="text-4xl sm:text-5xl font-display italic text-oxford dark:text-white mb-4">Batch</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-[62ch] leading-relaxed">
            Run a whole folder of drafts through the same style or workflow. Files are processed one at a time, and each result gets its own meaning check.
          </p>
        </div>

        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <StylePicker value={selection} onChange={setSelection} choices={choices} disabled={running} />
            <button type="button" className="btn-ghost flex items-center justify-center gap-2 border border-gray-300 dark:border-ink-border !py-3.5" onClick={() => setUploadOpen(true)} disabled={running}>
              <FilePlus size={14} /> Add files
            </button>
            {running ? (
              <button type="button" className="btn-primary flex items-center justify-center gap-2" onClick={stop}>
                <Square size={12} fill="currentColor" /> Stop
              </button>
            ) : (
              <button type="button" className="btn-primary flex items-center justify-center gap-2" onClick={start} disabled={!pending}>
                <Play size={14} /> {jobs.some(j => j.status === 'error') ? 'Run remaining' : 'Start batch'}
              </button>
            )}
          </div>
          <ToneSliders value={adjustments} onChange={setAdjustments} disabled={running} />
        </div>

        {jobs.length === 0 ? (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="w-full border-2 border-dashed border-gray-300 dark:border-ink-border rounded-xl py-20 flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400 hover:border-[color:var(--accent)] transition-colors"
          >
            <FilePlus size={36} strokeWidth={1} />
            <span className="font-serif text-xl">Add .txt or .md files to get started</span>
          </button>
        ) : (
          <BatchDashboard
            jobs={jobs}
            running={running}
            progress={runner.progress}
            format={format}
            onFormatChange={setFormat}
            onView={(job) => setViewing({ original_text: job.text, rewritten_text: job.output, title: job.name, filename: outputName(job) })}
            onDownload={download}
            onRemove={(job) => setJobs(list => list.filter(j => j.id !== job.id))}
            onDownloadAll={downloadAll}
          />
        )}
      </main>

      {uploadOpen && <BatchUploadModal open onClose={() => setUploadOpen(false)} onAdd={addFiles} maxChars={MAX_CHARS} />}
      <SnapshotRestoreModal snapshot={viewing} onClose={() => setViewing(null)} onRestore={restore} />
    </div>
  )
}
