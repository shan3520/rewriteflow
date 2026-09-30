import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar.jsx'
import Modal from '../components/ui/Modal.jsx'
import TemplateLibrary from '../components/templates/TemplateLibrary.jsx'
import TemplateEditorModal from '../components/templates/TemplateEditorModal.jsx'
import { usePipeline } from '../context/PipelineContext.jsx'
import { workflowSelection } from '../lib/selection.js'

export default function WorkflowsPage() {
  const { steps, stepsById, starters, workflows, loading, error, save, remove } = usePipeline()
  const navigate = useNavigate()
  // { workflow, id? }: id set when editing an existing saved workflow
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editorKey, setEditorKey] = useState(0)

  useEffect(() => { document.title = 'Workflows · RewriteFlow' }, [])

  function openEditor(workflow, id) {
    setEditorKey(k => k + 1)
    setEditing({ workflow, id })
  }

  function handleUse(workflow) {
    sessionStorage.setItem('reuse_selection', workflowSelection(workflow.id))
    navigate('/')
  }

  async function handleSave(workflow) {
    await save(workflow, editing?.id)
    toast.success(editing?.id ? 'Workflow updated.' : 'Workflow saved.')
    setEditing(null)
  }

  async function confirmDelete() {
    try {
      await remove(deleting.id)
      toast.success('Workflow deleted.')
    } catch (err) {
      toast.error(err.message || "Couldn't delete the workflow.")
    }
    setDeleting(null)
  }

  return (
    <div className="min-h-svh flex flex-col bg-paper dark:bg-ink-bg">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full safe-px pt-28 pb-16 focus:outline-none">
        <div className="mb-14 border-b border-gray-300 dark:border-ink-border pb-10">
          <h1 className="text-4xl sm:text-5xl font-display italic text-oxford dark:text-white mb-4">Workflows</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-[62ch] leading-relaxed">
            Save the edits you make again and again (fix grammar, tighten, make it formal, translate) as one reusable recipe, then pick it from the style menu in the workspace.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>
        ) : error && !steps.length ? (
          <p role="alert" className="font-serif text-lg text-red-700 dark:text-red-400">Couldn&apos;t load workflows: {error}</p>
        ) : (
          <TemplateLibrary
            starters={starters}
            workflows={workflows}
            stepsById={stepsById}
            onUse={handleUse}
            onNew={() => openEditor(null)}
            onEdit={(w) => openEditor(w, w.id)}
            onDuplicate={(w) => openEditor({ ...w, id: undefined, starter: false, name: `${w.name} (copy)` })}
            onDelete={setDeleting}
          />
        )}
      </main>

      {editing && (
        <TemplateEditorModal
          key={editorKey}
          open
          initial={editing.workflow}
          library={steps}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete workflow?"
        description={deleting ? `“${deleting.name}” will be removed. Past rewrites made with it stay in your history.` : ''}
        size="sm"
        footer={<>
          <button type="button" className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button type="button" className="btn-primary !bg-red-700 !border-red-700 hover:!bg-white hover:!text-red-700" onClick={confirmDelete}>Delete</button>
        </>}
      />
    </div>
  )
}
