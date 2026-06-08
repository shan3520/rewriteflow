import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { cn } from '../../lib/cn.js'

// Icon button that flips light/dark. The shape, accessible label, and 44px touch
// target are fixed; callers pass the hover treatment (and a smaller `size` where
// the surface is denser) so the one control sits right on both the app navbar
// and the auth headers. The labeled mobile-menu toggle stays inline in Navbar:
// that's a menu row, a different affordance.
export default function ThemeToggle({ size = 17, className }) {
  const { dark, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'tap-target flex items-center justify-center p-2 rounded-xl text-gray-500 dark:text-gray-400 transition-all duration-200',
        className,
      )}
    >
      {/* Crossfade + counter-rotate the two icons so flipping the theme reads as a
          state change, not a snap. The outgoing icon rotates away as the incoming
          one settles to 0deg. Reduced motion zeroes this via the global override. */}
      <span className="relative block" style={{ width: size, height: size }} aria-hidden="true">
        <Sun
          size={size}
          className={cn(
            'absolute inset-0 transition duration-200 ease-[var(--ease-out-quint)]',
            dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50',
          )}
        />
        <Moon
          size={size}
          className={cn(
            'absolute inset-0 transition duration-200 ease-[var(--ease-out-quint)]',
            dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100',
          )}
        />
      </span>
    </button>
  )
}
