import { ArrowDown } from 'lucide-react'

// Decorative connector drawn between two steps in the chain.
export default function ConnectionLines() {
  return (
    <div className="flex flex-col items-center py-1 text-gray-400 dark:text-gray-600" aria-hidden="true">
      <span className="block w-px h-3 bg-current" />
      <ArrowDown size={14} />
    </div>
  )
}
