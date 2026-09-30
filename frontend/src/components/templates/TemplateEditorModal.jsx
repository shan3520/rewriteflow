import { useId, useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import PipelineCanvas from '../canvas/PipelineCanvas.jsx'
import { withKeys, withoutKeys } from '../../lib/steps.js'

const MAX_INSTRUCTION = 1000

/**
 * Create or edit a workflow. Mount with a `key` per workflow so the form
 * starts fresh each time it opens.
 */
export default function TemplateEditorModal({ open, initial, library, onClose, onSave }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [steps, setSteps] = useState(() => withKeys(initial?.steps ?? []))
  const [instruction, setInstruction] = useState(initial?.custom_instruction ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef(null)
  const ids = { name: useId(), desc: useId(), instruction: useId(), error: useId() }

  const editing = Boolean(initial?.id) && !initial?.starter

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give the workflow a name.')
      nameRef.current?.focus()
      return
    }
    if (!steps.length && !instruction.trim()) {
      setError('Add at least one step or a custom instruction.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), description: description.trim(), steps: withoutKeys(steps), custom_instruction: instruction.trim() })
    } catch (err) {
      setError(err.message || "Couldn't save the workflow.")
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit workflow' : 'New workflow'}
      description="Steps run in order as a single instruction, so a workflow costs one AI call per paragraph."
      size="lg"
      initialFocusRef={nameRef}
    >
      <form onSubmit={handleSubmit} noValidate aria-describedby={error ? ids.error : undefined}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div>
            <label htmlFor={ids.name} className="label text-[10px] block mb-2">Name</label>
            <input id={ids.name} ref={nameRef} className="field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor={ids.desc} className="label text-[10px] block mb-2">Description (optional)</label>
            <input id={ids.desc} className="field" value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <h3 className="label text-[10px] mb-3">Steps</h3>
        <PipelineCanvas steps={steps} library={library} onChange={setSteps} />

        <div className="mt-8">
          <label htmlFor={ids.instruction} className="label text-[10px] block mb-2">Custom instruction (optional)</label>
          <textarea
            id={ids.instruction}
            className="field min-h-[6rem]"
            value={instruction}
            maxLength={MAX_INSTRUCTION}
            placeholder="e.g. Keep British spelling. Never change product names."
            onChange={(e) => setInstruction(e.target.value)}
          />
          <p className="label label-muted text-[10px] mt-1 text-right">{instruction.length} / {MAX_INSTRUCTION}</p>
        </div>

        {error && <p id={ids.error} role="alert" className="mt-4 font-serif text-red-700 dark:text-red-400">{error}</p>}

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save workflow'}</button>
        </div>
      </form>
    </Modal>
  )
}
