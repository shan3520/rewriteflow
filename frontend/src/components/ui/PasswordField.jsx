import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import TextField from './TextField.jsx'

// A TextField specialized for passwords: owns its own show/hide state and renders
// the visibility toggle as the trailing adornment. All other props (label, id,
// name, required, autoComplete, minLength, value, onChange, placeholder, ...) and
// `children` (e.g. a strength meter) forward to the underlying field.
export default function PasswordField({ children, ...props }) {
  const [show, setShow] = useState(false)

  return (
    <TextField
      type={show ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 tap-target flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...props}
    >
      {children}
    </TextField>
  )
}
