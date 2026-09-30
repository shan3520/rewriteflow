import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { PenTool, Clock, LogOut, Menu, X, Workflow, Files } from 'lucide-react'
import Logo from './ui/Logo'
import ThemeToggle from './ui/ThemeToggle'
import { cn } from '../lib/cn'

const navLinks = [
  { to: '/', label: 'Workspace', Icon: PenTool },
  { to: '/workflows', label: 'Workflows', Icon: Workflow },
  { to: '/batch', label: 'Batch', Icon: Files },
  { to: '/history', label: 'History', Icon: Clock },
]

export default function Navbar() {
  const { session, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the mobile menu when the route changes (including back/forward), without
  // an effect: adjust state during render off the previous pathname. This is the
  // React-recommended alternative to setState-in-effect.
  const [menuPath, setMenuPath] = useState(location.pathname)
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname)
    setMobileOpen(false)
  }

  async function handleSignOut() {
    setMobileOpen(false)
    try {
      await signOut()
      toast.success('Signed out.')
    } catch {
      toast.error("Couldn't sign you out.")
    }
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  if (!session) return null

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-sticky transition-all duration-300 border-b bg-paper dark:bg-ink-bg",
        scrolled
          ? "border-gray-300 dark:border-ink-border shadow-[var(--shadow-sm)] py-3"
          : "border-transparent py-5"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-tooltip focus:bg-oxford focus:text-white focus:px-4 focus:py-2 focus:rounded-md label text-[11px]"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto safe-px flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity rounded-md">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-ink-surface p-1 rounded-lg border border-gray-200 dark:border-ink-border">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={cn(
                  "label text-[10px] flex items-center gap-2 px-5 py-2 rounded-md transition-colors",
                  isActive(link.to)
                    ? "bg-oxford text-white dark:bg-oxford-soft dark:text-ink-bg shadow-[var(--shadow-sm)]"
                    : "!text-gray-600 dark:!text-gray-400 hover:!text-oxford dark:hover:!text-white hover:bg-gray-200/60 dark:hover:bg-ink-raised"
                )}
              >
                <link.Icon size={13} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-ink-border" />

          <div className="flex items-center gap-2">
            <ThemeToggle className="hover:bg-gray-100 dark:hover:bg-ink-raised" />
            <button
              onClick={handleSignOut}
              className="btn-ghost flex items-center gap-2 tap-target hover:!text-red-700 dark:hover:!text-red-400 hover:!bg-transparent group"
            >
              <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden tap-target flex items-center justify-center text-gray-700 dark:text-gray-300"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-paper dark:bg-ink-bg border-t border-gray-200 dark:border-ink-border overflow-hidden"
          >
            <div className="safe-px py-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                  className={cn(
                    "label text-xs flex items-center gap-4 p-4 rounded-lg border tap-target",
                    isActive(link.to)
                      ? "bg-oxford text-white border-oxford dark:bg-oxford-soft dark:text-ink-bg dark:border-oxford-soft"
                      : "!text-gray-600 dark:!text-gray-400 border-gray-200 dark:border-ink-border"
                  )}
                >
                  <link.Icon size={18} />
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="flex items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-ink-border">
                  <ThemeToggle />
                </div>
                <button
                  onClick={handleSignOut}
                  className="label text-xs flex items-center justify-center gap-3 p-4 rounded-lg !text-red-700 dark:!text-red-400 border border-red-200 dark:border-red-900/40 tap-target"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
