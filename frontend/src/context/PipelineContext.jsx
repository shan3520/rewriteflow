import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import * as api from '../lib/api.js'

const PipelineContext = createContext(null)

// Loads the step library, starter workflows and the signed-in user's saved
// workflows, and exposes save/remove so every page sees the same list.
export function PipelineProvider({ children }) {
  const { session } = useAuth()
  const [library, setLibrary] = useState({ steps: [], modes: {}, options: {} })
  const [starters, setStarters] = useState([])
  const [saved, setSaved] = useState([])
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getSteps(), api.getStarterWorkflows()])
      .then(([lib, starterList]) => {
        if (cancelled) return
        setLibrary(lib)
        setStarters(starterList)
        setLibraryLoaded(true)
      })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  const refresh = useCallback(async () => {
    if (!session) return
    try {
      setSaved(await api.listWorkflows(session))
    } catch (err) {
      setError(err.message)
    }
  }, [session])

  useEffect(() => {
    let cancelled = false
    if (session) {
      api.listWorkflows(session)
        .then(list => { if (!cancelled) setSaved(list) })
        .catch(err => { if (!cancelled) setError(err.message) })
    }
    return () => { cancelled = true }
  }, [session])

  const save = useCallback(async (workflow, id) => {
    const body = {
      name: workflow.name,
      description: workflow.description || '',
      steps: workflow.steps,
      custom_instruction: workflow.custom_instruction || '',
    }
    const result = id ? await api.updateWorkflow(session, id, body) : await api.createWorkflow(session, body)
    setSaved(list => [result, ...list.filter(w => w.id !== result.id)])
    return result
  }, [session])

  const remove = useCallback(async (id) => {
    await api.deleteWorkflow(session, id)
    setSaved(list => list.filter(w => w.id !== id))
  }, [session])

  const value = useMemo(() => {
    const workflows = session ? saved : []
    const stepsById = new Map(library.steps.map(s => [s.id, s]))
    const all = [...workflows, ...starters]
    return {
      steps: library.steps,
      stepsById,
      options: library.options,
      starters,
      workflows,
      findWorkflow: (id) => all.find(w => w.id === id) || null,
      loading: !libraryLoaded && !error,
      error,
      refresh,
      save,
      remove,
    }
  }, [library, starters, saved, session, libraryLoaded, error, refresh, save, remove])

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePipeline() {
  const ctx = useContext(PipelineContext)
  if (!ctx) throw new Error('usePipeline must be used inside <PipelineProvider>')
  return ctx
}
