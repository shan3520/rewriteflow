import { useId, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import { cn } from '../../lib/cn.js'
import { ACCEPT, readTextFiles } from '../../lib/files.js'

/** Pick or drop .txt/.md files to add to the batch. */
export default function BatchUploadModal({ open, onClose, onAdd, maxChars }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState([])

  async function handleFiles(fileList) {
    const { files, errors: problems } = await readTextFiles([...fileList], maxChars)
    setErrors(problems)
    if (files.length) onAdd(files)
    if (files.length && !problems.length) onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add files" description={`Plain text or Markdown, up to ${maxChars.toLocaleString()} characters each.`} size="md">
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={cn(
          'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg px-6 py-12 cursor-pointer text-center transition-colors',
          dragging ? 'border-[color:var(--accent)] bg-gray-50 dark:bg-ink-raised' : 'border-gray-300 dark:border-ink-border hover:border-[color:var(--accent)]',
        )}
      >
        <Upload size={28} className="text-gray-500" />
        <span className="font-serif text-lg text-gray-800 dark:text-gray-200">Drop files here or <span className="underline underline-offset-4">browse</span></span>
        <span className="label label-muted text-[10px]">{ACCEPT.join(' · ')}</span>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT.join(',')}
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      {errors.length > 0 && (
        <ul role="alert" className="mt-4 space-y-1 font-serif text-red-700 dark:text-red-400">
          {errors.map(err => <li key={err}>{err}</li>)}
        </ul>
      )}
    </Modal>
  )
}
