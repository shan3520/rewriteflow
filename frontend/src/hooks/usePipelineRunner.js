import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { rewriteText } from '../lib/api.js'

const IDLE = { status: 'idle', progress: { current: 0, total: 0 }, output: '', source: '', result: null, error: null }

/**
 * Runs one streaming rewrite at a time. `run(request)` resolves with the
 * final result, or null if it was cancelled; it rejects on failure.
 * status: idle | running | done | cancelled | error
 */
export function usePipelineRunner() {
  const { session } = useAuth()
  const [state, setState] = useState(IDLE)
  const controllerRef = useRef(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const run = useCallback(async (request) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ ...IDLE, status: 'running', source: request.text })

    try {
      const result = await rewriteText(session, request, {
        signal: controller.signal,
        onProgress: (current, total) => setState(s => ({ ...s, progress: { current, total } })),
        onParagraph: (paragraph) => setState(s => ({ ...s, output: s.output ? `${s.output}\n\n${paragraph}` : paragraph })),
      })
      setState(s => ({ ...s, status: 'done', output: result.rewritten_text, result }))
      return result
    } catch (err) {
      if (err.name === 'AbortError') return null
      setState(s => ({ ...s, status: 'error', error: err.message }))
      throw err
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [session])

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState(s => (s.status === 'running' ? { ...s, status: 'cancelled' } : s))
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState(IDLE)
  }, [])

  return { ...state, loading: state.status === 'running', done: state.status === 'done', run, cancel, reset }
}
