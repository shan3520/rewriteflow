import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Copy, Check, RotateCcw, BookOpen, Square, Command } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import SideBySideDiff from '../components/diff/SideBySideDiff.jsx'
import ExportControls from '../components/diff/ExportControls.jsx'
import PreviewToggle from '../components/controls/PreviewToggle.jsx'
import StylePicker from '../components/controls/StylePicker.jsx'
import ToneSliders from '../components/controls/ToneSliders.jsx'
import StatsBar from '../components/stats/StatsBar.jsx'
import MeaningCheckPanel from '../components/stats/MeaningCheckPanel.jsx'
import CommandPalette from '../components/palette/CommandPalette.jsx'
import { usePipelineRunner } from '../hooks/usePipelineRunner.js'
import { useStyleChoices } from '../hooks/useStyleChoices.js'
import { useKeyboardShortcuts, modKey } from '../hooks/useKeyboardShortcuts.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SELECTION, modeSelection, selectionToRequest } from '../lib/selection.js'
import { MODES } from '../lib/modes.js'

const MAX_CHARS = 50_000

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function initialSelection() {
  const saved = sessionStorage.getItem('reuse_selection')
  if (saved) return saved
  const reuseMode = sessionStorage.getItem('reuse_mode')
  return reuseMode && MODES.some(m => m.value === reuseMode) ? modeSelection(reuseMode) : DEFAULT_SELECTION
}

export default function AppPage() {
  const navigate = useNavigate()
  const { toggle: toggleTheme } = useTheme()
  const runner = usePipelineRunner()
  const choices = useStyleChoices()
  const [inputText, setInputText] = useState(() => sessionStorage.getItem('reuse_text') || '')
  const [selection, setSelection] = useState(initialSelection)
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState('clean')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const { loading, done, output: outputText, source: sourceText, progress } = runner
  const selected = choices.find(c => c.key === selection)

  useEffect(() => { document.title = 'RewriteFlow · AI Text Refinement' }, [])

  const lastParaRef = useCallback((node) => {
    if (!node || !loading) return
    // A JS scrollIntoView with behavior:'smooth' overrides the reduced-motion CSS,
    // so honor the preference explicitly during streaming.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' })
  }, [loading])

  function chooseStyle(key) {
    setSelection(key)
    sessionStorage.setItem('reuse_selection', key)
  }

  async function handleRewrite() {
    if (loading) return
    if (!inputText.trim()) return toast.error('Please provide a document to refine.')
    if (!selected) return toast.error('That workflow is no longer available. Pick another style.')
    try {
      await runner.run({ text: inputText, ...selectionToRequest(selection), options: adjustments })
    } catch (err) {
      toast.error(err.message || 'The refinement process encountered an error.')
    }
  }

  function handleReset() {
    runner.reset()
    setInputText('')
    setView('clean')
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

  useKeyboardShortcuts({
    'mod+enter': handleRewrite,
    'mod+k': () => setPaletteOpen(o => !o),
  })

  const commands = [
    { id: 'rewrite', group: 'Actions', label: 'Rewrite text', hint: `${modKey} Enter`, disabled: loading || !inputText.trim(), run: handleRewrite },
    { id: 'stop', group: 'Actions', label: 'Stop rewriting', disabled: !loading, run: runner.cancel },
    { id: 'copy', group: 'Actions', label: 'Copy rewrite', disabled: !outputText, run: handleCopy },
    { id: 'export', group: 'Actions', label: 'Export rewrite…', disabled: !done, run: () => setExportOpen(true) },
    { id: 'view', group: 'Actions', label: view === 'changes' ? 'Show clean rewrite' : 'Show changes', disabled: !done, run: () => setView(v => (v === 'changes' ? 'clean' : 'changes')) },
    { id: 'reset', group: 'Actions', label: 'Clear the workspace', disabled: !inputText && !outputText, run: handleReset },
    ...choices.map(c => ({ id: `style-${c.key}`, group: c.group, label: `Use: ${c.label}`, keywords: 'style mode workflow', run: () => chooseStyle(c.key) })),
    ...['shorter', 'same', 'longer'].map(v => ({ id: `length-${v}`, group: 'Adjust', label: `Length: ${v}`, run: () => setAdjustments(a => ({ ...a, length: v })) })),
    ...['casual', 'neutral', 'formal'].map(v => ({ id: `tone-${v}`, group: 'Adjust', label: `Tone: ${v}`, run: () => setAdjustments(a => ({ ...a, formality: v })) })),
    { id: 'go-workflows', group: 'Go to', label: 'Workflows', run: () => navigate('/workflows') },
    { id: 'go-batch', group: 'Go to', label: 'Batch', run: () => navigate('/batch') },
    { id: 'go-history', group: 'Go to', label: 'History', run: () => navigate('/history') },
    { id: 'theme', group: 'Settings', label: 'Toggle dark mode', run: toggleTheme },
  ]

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
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display italic text-oxford dark:text-white">
              RewriteFlow
            </h1>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="btn-ghost hidden sm:flex items-center gap-2 border border-gray-300 dark:border-ink-border"
              aria-label="Open command palette"
            >
              <Command size={13} /> {modKey} K
            </button>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-[60ch] leading-relaxed">
            Paste a draft, choose a style or workflow, and get a faithful rewrite paragraph by paragraph. Then check what changed before you use it.
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
            <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
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
                {done && (
                  <ExportControls
                    rewritten={outputText}
                    original={sourceText}
                    title={selected ? `Rewrite · ${selected.label}` : 'Rewrite'}
                    open={exportOpen}
                    onOpenChange={setExportOpen}
                  />
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
                {runner.status === 'cancelled' && (
                  <p className="label label-muted text-[10px] mt-6">Stopped. The paragraphs above were finished before you stopped.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-8 pt-12 border-t border-gray-300 dark:border-ink-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 w-full md:w-auto">
              <StylePicker value={selection} onChange={chooseStyle} choices={choices} disabled={loading} />
              {loading ? (
                <button onClick={runner.cancel} className="btn-primary w-full sm:w-auto sm:min-w-[190px] flex items-center justify-center gap-2">
                  <Square size={12} fill="currentColor" /> Stop
                </button>
              ) : (
                <button
                  onClick={handleRewrite}
                  disabled={!inputText.trim()}
                  className="btn-primary w-full sm:w-auto sm:min-w-[190px]"
                  title={`${modKey}+Enter`}
                >
                  Rewrite text
                </button>
              )}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8">
              {(inputText || outputText) && (
                <button
                  onClick={handleReset}
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
          <ToneSliders value={adjustments} onChange={setAdjustments} disabled={loading} />
        </div>

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

        {/* Review: readability and meaning check for the finished rewrite */}
        {done && (
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

        <p className="label label-muted text-[10px] mt-12 hidden sm:block">
          {modKey}+Enter to rewrite · {modKey}+K for commands
        </p>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  )
}
