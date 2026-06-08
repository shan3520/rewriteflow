import { useId } from 'react'
import { cn } from '../../lib/cn.js'

// Labeled form field for the auth surfaces: a <label> bound to a `.field` input,
// with optional inline error wiring (aria-invalid + aria-describedby + red border
// + message) and an optional trailing `endAdornment` (e.g. a show/hide button,
// which gets the pr-11 clearance and a relative wrapper). The `.field` class owns
// background, border, and text color; only the error state overrides the border to
// red. Everything else (type, value, onChange, autoComplete, required, minLength,
// ...) forwards to the <input>. `children` render below the field, e.g. a
// password-strength meter.
//
// Props: label, error?, endAdornment?, id?, children?, ...inputProps
export default function TextField({ label, error, endAdornment, id, className, children, ...inputProps }) {
  const reactId = useId()
  const fieldId = id || reactId
  const errorId = `${fieldId}-error`

  const input = (
    <input
      id={fieldId}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      className={cn(
        'field px-4 py-3',
        endAdornment && 'pr-11',
        error && 'border-red-300 dark:border-red-700/50',
        className,
      )}
      {...inputProps}
    />
  )

  return (
    <div>
      <label htmlFor={fieldId} className="label text-[11px] block mb-2.5">
        {label}
      </label>
      {endAdornment ? (
        <div className="relative">
          {input}
          {endAdornment}
        </div>
      ) : input}
      {error && (
        <p id={errorId} className="text-xs text-red-600 dark:text-red-400 mt-1.5 animate-fade-in">{error}</p>
      )}
      {children}
    </div>
  )
}
