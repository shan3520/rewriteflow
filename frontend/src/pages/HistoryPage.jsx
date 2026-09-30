import { useState, useEffect, useId, useMemo, useCallback, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getHistory, deleteHistoryItem } from '../lib/api.js'
import { toast } from 'sonner'
import { Trash2, ChevronDown, Clock, FileText, RotateCcw, Search, X, Book, Eye } from 'lucide-react'
import HistoryTimeline from '../components/history/HistoryTimeline.jsx'
import SnapshotRestoreModal from '../components/history/SnapshotRestoreModal.jsx'
import { cn } from '../lib/cn.js'
import { MODES, modeLabel } from '../lib/modes.js'
import { modeSelection } from '../lib/selection.js'

// Label for a history entry: the mode's label, or the workflow's name.
function itemLabel(item) {
  return item.mode === 'workflow' ? item.workflow_name || 'Workflow' : modeLabel(item.mode)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const HistoryCard = memo(function HistoryCard({ item, onDelete, onReuse, onView, index }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const panelId = useId()
  const confirmRef = useRef(null)
  const deleteTriggerRef = useRef(null)
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return }
    if (confirming) confirmRef.current?.focus()
    else deleteTriggerRef.current?.focus()
  }, [confirming])

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete(item.id)
      toast.success('Rewrite deleted.')
    } catch (err) {
      toast.error(err.message || "Couldn't delete that rewrite.")
      setDeleting(false)
      setConfirming(false)
    }
  }

  function cancelDelete(e) {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="bezel bezel-interactive mb-5"
    >
      <div className="bezel-inner overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-6 p-6">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex-1 min-w-0 flex items-start gap-6 text-left group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap mb-3">
              <span className="label label-accent text-[10px] px-2 py-1 rounded border border-[color:var(--accent)]/25">
                {itemLabel(item)}
              </span>
              <span className="label text-[11px] flex items-center gap-2">
                <Clock size={12} /> {formatDate(item.created_at)}
              </span>
            </div>
            <p dir="auto" className="text-lg font-serif text-gray-900 dark:text-gray-100 truncate leading-relaxed">
              {item.original_text?.slice(0, 160)}{item.original_text?.length > 160 ? '…' : ''}
            </p>
            <div className="flex items-center gap-5 mt-4">
              <span className="label text-[10px] flex items-center gap-2">
                <FileText size={12} />
                {item.original_word_count?.toLocaleString()} in
              </span>
              <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">/</span>
              <span className="label label-accent text-[10px]">{item.rewritten_word_count?.toLocaleString()} out</span>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={cn('mt-1 shrink-0 text-gray-500 transition-transform duration-300 group-hover:text-oxford dark:group-hover:text-white', expanded && 'rotate-180')}
          />
        </button>

        <div className="flex items-center gap-4 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => onView(item)}
            aria-label="View changes, readability and meaning check"
            title="View changes"
            className="tap-target flex items-center justify-center rounded-md text-gray-500 hover:text-oxford dark:hover:text-oxford-soft hover:bg-gray-100 dark:hover:bg-ink-raised transition-colors border border-transparent hover:border-gray-200 dark:hover:border-ink-border"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => onReuse(item)}
            aria-label="Load this document into the workspace"
            title="Load into workspace"
            className="tap-target flex items-center justify-center rounded-md text-gray-500 hover:text-oxford dark:hover:text-oxford-soft hover:bg-gray-100 dark:hover:bg-ink-raised transition-colors border border-transparent hover:border-gray-200 dark:hover:border-ink-border"
          >
            <RotateCcw size={18} />
          </button>
          <AnimatePresence mode="wait">
            {confirming ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="label text-[10px] px-4 py-2 rounded-md !text-white bg-red-800 hover:bg-red-900 transition-colors tap-target"
                >
                  {deleting ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="label text-[10px] px-4 py-2 rounded-md tap-target hover:!text-gray-900 dark:hover:!text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="trigger"
                ref={deleteTriggerRef}
                type="button"
                onClick={handleDelete}
                aria-label="Delete this record"
                title="Delete record"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tap-target flex items-center justify-center rounded-md text-gray-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
              >
                <Trash2 size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded preview */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 dark:border-ink-border grid grid-cols-1 md:grid-cols-2 bg-gray-50 dark:bg-ink-bg">
              <div className="p-8 lg:p-10 border-b md:border-b-0 md:border-r border-gray-200 dark:border-ink-border">
                <div className="label text-[10px] mb-5">Original</div>
                <p dir="auto" className="text-lg font-serif text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{item.original_text}</p>
              </div>
              <div className="p-8 lg:p-10">
                <div className="label label-accent text-[10px] mb-5">Rewritten</div>
                <p dir="auto" className="text-lg font-serif text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{item.rewritten_text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  )
})

export default function HistoryPage() {
  const { session } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [viewing, setViewing] = useState(null)
  const navigate = useNavigate()
  const headingRef = useRef(null)

  useEffect(() => {
    if (!session) return
    getHistory(session)
      .then(data => setHistory(data.rewrites || data || []))
      .catch((err) => toast.error(err.message || "Couldn't load your history."))
      .finally(() => setLoading(false))
  }, [session])

  useEffect(() => { document.title = 'Document Archives · RewriteFlow' }, [])

  const handleDelete = useCallback(async (id) => {
    await deleteHistoryItem(session, id)
    setHistory(h => h.filter(item => item.id !== id))
    requestAnimationFrame(() => headingRef.current?.focus())
  }, [session])

  const handleReuse = useCallback((item) => {
    sessionStorage.setItem('reuse_text', item.original_text)
    // Workflow entries store the workflow's name, not its id, so keep the
    // current style selection for those.
    if (item.mode !== 'workflow') sessionStorage.setItem('reuse_selection', modeSelection(item.mode))
    navigate('/')
    toast.success('Document loaded to workspace.')
  }, [navigate])

  const filtered = useMemo(() => history.filter(item => {
    if (filterMode !== 'all' && item.mode !== filterMode) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return item.original_text?.toLowerCase().includes(q) || item.rewritten_text?.toLowerCase().includes(q)
    }
    return true
  }), [history, filterMode, searchQuery])

  const filters = useMemo(() => [
    'all',
    ...MODES.map(m => m.value),
    ...(history.some(item => item.mode === 'workflow') ? ['workflow'] : []),
  ], [history])

  return (
    <div className="min-h-svh flex flex-col bg-paper dark:bg-ink-bg">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full safe-px pt-28 pb-16 focus:outline-none" tabIndex={-1}>
        {/* Header */}
        <div className="mb-14 border-b border-gray-300 dark:border-ink-border pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-md border border-[color:var(--accent)]/25 flex items-center justify-center text-oxford dark:text-oxford-soft">
              <Book size={20} />
            </div>
            <h1 ref={headingRef} className="text-5xl font-display italic text-oxford dark:text-white">
              History
            </h1>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-[60ch]">
            {loading
              ? 'Loading your rewrites…'
              : `${filtered.length} saved rewrite${filtered.length !== 1 ? 's' : ''}. Search, reopen, or reuse any of them.`}
          </p>
        </div>

        {/* Search and filter bar */}
        {!loading && history.length > 0 && (
          <div className="flex flex-col md:flex-row gap-5 mb-10">
            {/* Search */}
            <div className="relative flex-1">
              <label htmlFor="history-search" className="sr-only">Search your rewrites</label>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="history-search"
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by keyword…"
                className="field pl-12 pr-12 py-3.5 text-lg font-serif"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 tap-target flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Mode filter */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-ink-surface border border-gray-200 dark:border-ink-border rounded-lg overflow-x-auto no-scrollbar">
              {filters.map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  aria-pressed={filterMode === m}
                  className={cn(
                    "label text-[10px] px-3.5 py-2 rounded-md transition-colors whitespace-nowrap",
                    filterMode === m
                      ? "bg-oxford text-white dark:bg-oxford-soft dark:text-ink-bg"
                      : "!text-gray-600 dark:!text-gray-400 hover:!text-oxford dark:hover:!text-white"
                  )}
                >
                  {m === 'all' ? 'All' : m === 'workflow' ? 'Workflows' : modeLabel(m)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div className="py-28 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-xl border border-dashed border-gray-300 dark:border-ink-border flex items-center justify-center mb-9 text-gray-500">
              <FileText size={44} strokeWidth={1} />
            </div>
            <h2 className="text-3xl text-gray-900 dark:text-white font-display mb-3">No rewrites yet</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-sm font-serif text-lg mb-9">
              Every rewrite you run is saved here automatically. Start one to see it appear.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Start a rewrite
            </button>
          </div>
        )}

        {/* No results search */}
        {!loading && history.length > 0 && filtered.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Search size={44} strokeWidth={1} className="text-gray-500 mb-5" />
            <h2 className="text-2xl text-gray-700 dark:text-gray-300 font-display">Nothing matches that search</h2>
            <p className="label text-[11px] mt-3">Try a different keyword or filter</p>
          </div>
        )}

        {/* History cards, grouped by day */}
        <HistoryTimeline
          items={filtered}
          renderItem={(item, i) => (
            <HistoryCard item={item} onDelete={handleDelete} onReuse={handleReuse} onView={setViewing} index={i} />
          )}
        />
      </main>

      <SnapshotRestoreModal
        snapshot={viewing && { ...viewing, title: itemLabel(viewing), filename: `rewrite-${viewing.created_at.slice(0, 10)}` }}
        onClose={() => setViewing(null)}
        onRestore={(item) => { setViewing(null); handleReuse(item) }}
      />
    </div>
  )
}
