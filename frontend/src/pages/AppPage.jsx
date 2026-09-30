import { useState, useRef, useEffect, useId, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { rewriteText } from '../lib/api.js'
import { toast } from 'sonner'
import { Copy, Check, ChevronDown, RotateCcw, BookOpen } from 'lucide-react'
import { cn } from '../lib/cn.js'
import { MODES } from '../lib/modes.js'
import SideBySideDiff from '../components/diff/SideBySideDiff.jsx'
import PreviewToggle from '../components/controls/PreviewToggle.jsx'
import StatsBar from '../components/stats/StatsBar.jsx'
import MeaningCheckPanel from '../components/stats/MeaningCheckPanel.jsx'

const MAX_CHARS = 50_000

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function AppPage() {
  const { session } = useAuth()
  const [inputText, setInputText] = useState(() => sessionStorage.getItem('reuse_text') || '')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState(() => {
    const reuseMode = sessionStorage.getItem('reuse_mode')
    return reuseMode && MODES.some(m => m.value === reuseMode) ? reuseMode : 'standard'
  })
  const [modeOpen, setModeOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [copied, setCopied] = useState(false)
  // The input as it was when the last rewrite finished, so the review tools
  // compare against what was actually sent even if the draft is edited later.
  const [sourceText, setSourceText] = useState('')
  const [done, setDone] = useState(false)
  const [view, setView] = useState('clean')

  const abortControllerRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const listboxId = useId()

  const selectedMode = MODES.find(m => m.value === mode)
  const SelectedIcon = selectedMode.Icon
  const modeIndex = MODES.findIndex(m => m.value === mode)

  useEffect(() => { document.title = 'RewriteFlow · AI Text Refinement' }, [])

  const lastParaRef = useCallback((node) => {
    if (!node || !loading) return
    // A JS scrollIntoView with behavior:'smooth' overrides the reduced-motion CSS,
    // so honor the preference explicitly during streaming.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' })
  }, [loading])

  useEffect(() => {
    if (!modeOpen) return
    const handler = () => setModeOpen(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [modeOpen])

  function selectMode(value) {
    setMode(value)
    setModeOpen(false)
    triggerRef.current?.focus()
  }

  // When the listbox opens, move focus to the selected option so arrow keys
  // and Escape work without a hunt for the menu.
  useEffect(() => {
    if (!modeOpen) return
    const i = Math.max(0, modeIndex)
    const raf = requestAnimationFrame(() => optionRefs.current[i]?.focus())
    return () => cancelAnimationFrame(raf)
  }, [modeOpen, modeIndex])

  function handleTriggerKeyDown(e) {
    if (!modeOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setModeOpen(true)
    }
  }

  function handleListKeyDown(e) {
    const count = MODES.length
    const current = optionRefs.current.findIndex(el => el === document.activeElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      setModeOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      optionRefs.current[current < 0 ? 0 : (current + 1) % count]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      optionRefs.current[current < 0 ? count - 1 : (current - 1 + count) % count]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      optionRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      optionRefs.current[count - 1]?.focus()
    } else if (e.key === 'Tab') {
      // Close and hand focus back to the trigger so the next Tab proceeds in
      // normal order instead of dropping to <body> as the options unmount.
      e.preventDefault()
      setModeOpen(false)
      triggerRef.current?.focus()
    }
  }

  async function handleRewrite() {
    if (!inputText.trim()) return toast.error('Please provide a document to refine.')
    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    const source = inputText
    setLoading(true)
    setDone(false)
    setOutputText('')
    setProgress({ current: 0, total: 0 })

    try {
      const result = await rewriteText(
        session,
        inputText,
        mode,
        (current, total) => setProgress({ current, total }),
        (paragraph) => setOutputText(prev => prev + (prev ? '\n\n' : '') + paragraph),
        { signal: controller.signal }
      )
      setOutputText(result.rewritten_text)
      setSourceText(source)
      setDone(true)
    } catch (err) {
      if (err.name === 'AbortError') return
      toast.error(err.message || "The refinement process encountered an error.")
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  async function handleCopy() {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to access clipboard.')
    }
  }

  const progressPct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
  const inputWordCount = useMemo(() => countWords(inputText), [inputText])
  const outputWordCount = useMemo(() => countWords(outputText), [outputText])
  const outputParagraphs = useMemo(() => (outputText ? outputText.split(/\n\n+/) : []), [outputText])

  return (
    <div className="min-h-svh flex flex-col bg-paper dark:bg-ink-bg">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full safe-px pt-28 pb-16 focus:outline-none">
        {/* Persistent status region: always in the DOM so screen readers announce
            each progress update reliably (a region inserted already-populated may
            not announce its first value). */}
        <div className="sr-only" role="status" aria-live="polite">
          {loading && progress.total > 0 ? `Rewriting paragraph ${progress.current} of ${progress.total}` : ''}
        </div>
        {/* Header */}
        <div className="mb-16 border-b border-gray-300 dark:border-ink-border pb-12">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display italic text-oxford dark:text-white">
              RewriteFlow
            </h1>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-[60ch] leading-relaxed">
            Paste a draft, choose a style, and get a faithful rewrite paragraph by paragraph. The text stays yours; only the wording changes.
          </p>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Left: Original */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label htmlFor="input-textarea" className="label text-[11px]">Source document</label>
              <span className="label label-muted text-[11px]">{inputWordCount.toLocaleString()} words</span>
            </div>
            <div className="bezel bezel-interactive h-[50vh] lg:h-[600px]">
              <textarea
                id="input-textarea"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste or type the text you want rewritten…"
                maxLength={MAX_CHARS}
                className="bezel-inner w-full h-full p-9 text-lg text-gray-900 dark:text-gray-100 focus:outline-none leading-relaxed font-serif"
              />
            </div>
          </div>

          {/* Right: Rewritten */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="label label-accent text-[11px]">Refined output</span>
              <div className="flex items-center gap-5">
                {done && <PreviewToggle value={view} onChange={setView} />}
                <span className="label label-muted text-[11px]">{outputWordCount.toLocaleString()} words</span>
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="label label-accent text-[10px] flex items-center gap-1.5 tap-target hover:underline underline-offset-4"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <div className="bezel h-[50vh] lg:h-[600px]">
              <div
                role="region"
                aria-label="Refined output"
                aria-busy={loading}
                className="bezel-inner h-full p-9 text-lg text-gray-900 dark:text-gray-100 overflow-y-auto leading-relaxed font-serif"
              >
                <AnimatePresence mode="wait">
                  {loading && !outputText && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center gap-6"
                    >
                      <div className="spinner w-8 h-8" />
                      <span className="label text-[11px]">Rewriting your text…</span>
                    </motion.div>
                  )}
                  {!loading && !outputText && (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-500">
                      <BookOpen size={44} strokeWidth={1} />
                      <span className="label text-[11px]">Your rewrite will appear here</span>
                    </div>
                  )}
                </AnimatePresence>
                {done && view === 'changes' ? (
                  <SideBySideDiff originalText={sourceText} rewrittenText={outputText} />
                ) : outputParagraphs.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    ref={i === outputParagraphs.length - 1 ? lastParaRef : undefined}
                    className="mb-7 last:mb-0"
                  >{para}</motion.p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-12 border-t border-gray-300 dark:border-ink-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 w-full md:w-auto">
            {/* Mode selector */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                ref={triggerRef}
                onClick={() => setModeOpen(o => !o)}
                onKeyDown={handleTriggerKeyDown}
                aria-haspopup="listbox"
                aria-controls={modeOpen ? listboxId : undefined}
                aria-expanded={modeOpen}
                aria-label={`Rewrite style: ${selectedMode.label}`}
                className="bezel-inner flex items-center gap-4 px-5 py-3.5 w-full sm:min-w-[240px] justify-between hover:border-[color:var(--accent)] transition-colors"
              >
                <span className="flex items-center gap-3 label text-xs text-[color:var(--accent)]">
                  <SelectedIcon size={16} />
                  {selectedMode.label}
                </span>
                <ChevronDown size={14} className={cn('text-gray-500 transition-transform duration-200', modeOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {modeOpen && (
                  <motion.ul
                    id={listboxId}
                    role="listbox"
                    aria-label="Rewrite style"
                    onKeyDown={handleListKeyDown}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-full mb-3 left-0 w-full sm:w-80 bezel z-dropdown"
                  >
                    {MODES.map((m, i) => (
                      <li key={m.value} role="presentation">
                        <button
                          ref={el => { optionRefs.current[i] = el }}
                          role="option"
                          aria-selected={mode === m.value}
                          onClick={() => selectMode(m.value)}
                          className={cn(
                            'w-full text-left px-6 py-4 rounded-md transition-colors',
                            mode === m.value ? 'bg-gray-100 dark:bg-ink-raised' : 'hover:bg-gray-50 dark:hover:bg-ink-raised/60',
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <m.Icon size={18} className={mode === m.value ? 'text-oxford dark:text-oxford-soft' : 'text-gray-500'} />
                            <div>
                              <div className={cn('label text-xs', mode === m.value && 'label-accent')}>{m.label}</div>
                              <div className="text-sm font-serif text-gray-600 dark:text-gray-400 mt-0.5">{m.desc}</div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleRewrite}
              disabled={loading || !inputText.trim()}
              className="btn-primary w-full sm:w-auto sm:min-w-[190px]"
            >
              {loading ? 'Rewriting…' : 'Rewrite text'}
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-8">
            {(inputText || outputText) && (
              <button
                onClick={() => {
                  abortControllerRef.current?.abort()
                  setInputText('')
                  setOutputText('')
                  setProgress({ current: 0, total: 0 })
                  setLoading(false)
                  setDone(false)
                }}
                className="label text-[10px] flex items-center gap-2 tap-target text-gray-600 dark:text-gray-400 hover:!text-red-700 dark:hover:!text-red-400 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
            <div className="label label-muted text-[10px]">
              {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </div>
          </div>
        </div>

        {/* Review: readability and meaning check for the finished rewrite */}
        {done && !loading && (
          <section aria-labelledby="review-heading" className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bezel">
              <div className="bezel-inner p-7">
                <h2 id="review-heading" className="label text-[11px] mb-5">Readability</h2>
                <StatsBar originalText={sourceText} rewrittenText={outputText} />
              </div>
            </div>
            <div className="bezel">
              <div className="bezel-inner p-7">
                <h2 className="label text-[11px] mb-5">Meaning check</h2>
                <MeaningCheckPanel originalText={sourceText} rewrittenText={outputText} />
              </div>
            </div>
          </section>
        )}

        {/* Progress bar */}
        <AnimatePresence>
          {loading && progress.total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12"
            >
              <div className="bezel">
                <div className="bezel-inner p-7">
                  <div className="flex items-center justify-between mb-4">
                    <span className="label text-[11px]">
                      Rewriting paragraph {progress.current} of {progress.total}
                    </span>
                    <span className="label label-accent text-xs">{progressPct}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Rewrite progress"
                    className="h-2 bg-gray-200 dark:bg-ink-raised rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
                      className="progress-bar-fill h-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
