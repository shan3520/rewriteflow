import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { toast } from 'sonner'
import { ArrowRight, Book, Library } from 'lucide-react'
import Logo from '../components/ui/Logo.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import TextField from '../components/ui/TextField.jsx'
import PasswordField from '../components/ui/PasswordField.jsx'

// Inline paper grain (SVG turbulence) as a data URI — no third-party request.
const PAPER_GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { document.title = 'Sign in · RewriteFlow' }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-svh flex flex-col lg:flex-row bg-paper dark:bg-ink-bg">
      {/* Left Side: Professional Identity */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-oxford dark:bg-oxford-deep p-20 flex-col justify-between overflow-hidden">
        {/* Self-hosted paper grain — no external dependency. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: PAPER_GRAIN }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <Logo className="invert brightness-0 dark:invert-0 dark:brightness-100" />
        </motion.div>

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl text-paper leading-[1.05] mb-12 font-display italic"
          >
            A faithful rewrite, <br />
            paragraph by paragraph.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-paper/25 flex items-center justify-center text-paper mt-1 shrink-0">
                <Library size={18} />
              </div>
              <div>
                <p className="label text-[11px] !text-paper mb-2.5">Meaning preserved</p>
                <p className="text-paper/75 text-lg leading-relaxed max-w-sm font-serif">
                  Each paragraph is reworded on its own, so the result says what your draft said, in different words.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-paper/25 flex items-center justify-center text-paper mt-1 shrink-0">
                <Book size={18} />
              </div>
              <div>
                <p className="label text-[11px] !text-paper mb-2.5">Five styles</p>
                <p className="text-paper/75 text-lg leading-relaxed max-w-sm font-serif">
                  Standard, Professional, Extensive, Clarified, or Expressive. Pick the tone that fits the document.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 pt-12 border-t border-paper/15">
          <p className="label text-[10px] !text-paper/55">
            RewriteFlow, est. 2026
          </p>
        </div>
      </div>

      {/* Right Side: Disciplined Form */}
      <div className="flex-1 flex flex-col bg-paper dark:bg-ink-bg">
        <div className="flex items-center justify-between p-8 lg:hidden">
          <Logo />
          <ThemeToggle />
        </div>

        <main className="flex-1 flex items-center justify-center px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="mb-12 text-center lg:text-left">
              <div className="hidden lg:flex justify-end mb-16">
                <ThemeToggle className="hover:bg-gray-100 dark:hover:bg-gray-900" />
              </div>
              <h1 className="text-4xl text-oxford dark:text-white mb-3 font-display">Welcome back</h1>
              <p className="label text-[11px]">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <TextField
                label="Email"
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="font-serif text-lg"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <PasswordField
                label="Password"
                id="login-password"
                name="password"
                autoComplete="current-password"
                required
                className="font-serif text-lg"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4"
              >
                {loading ? (
                  <span className="spinner w-[18px] h-[18px] !border-white/40 !border-t-white" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-14 pt-10 border-t border-gray-200 dark:border-ink-border text-center lg:text-left">
              <p className="text-base text-gray-700 dark:text-gray-300 font-serif">
                New here?{' '}
                <Link to="/register" className="text-oxford dark:text-oxford-soft font-semibold hover:underline underline-offset-4 decoration-2 transition-all rounded-sm">
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
