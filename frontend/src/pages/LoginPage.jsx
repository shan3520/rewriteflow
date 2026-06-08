import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { toast } from 'sonner'
import { Loader2, ArrowRight, Book, Library, GraduationCap } from 'lucide-react'
import Logo from '../components/ui/Logo.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import TextField from '../components/ui/TextField.jsx'
import PasswordField from '../components/ui/PasswordField.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { document.title = 'Sign In · RewriteFlow' }, [])

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
      <div className="hidden lg:flex lg:w-1/2 relative bg-oxford dark:bg-[#0b1320] p-20 flex-col justify-between overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <Logo className="invert brightness-0 dark:invert-0 dark:brightness-100" />
        </motion.div>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl text-[#fdfbf7] leading-[1.05] mb-12 font-display italic"
          >
            A faithful rewrite, <br />
            paragraph by paragraph.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-[#fdfbf7]/25 flex items-center justify-center text-[#fdfbf7] mt-1 shrink-0">
                <Library size={18} />
              </div>
              <div>
                <h3 className="label text-[11px] !text-[#fdfbf7] mb-2.5">Meaning preserved</h3>
                <p className="text-[#fdfbf7]/75 text-lg leading-relaxed max-w-sm font-serif">
                  Each paragraph is reworded on its own, so the result says what your draft said, in different words.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-[#fdfbf7]/25 flex items-center justify-center text-[#fdfbf7] mt-1 shrink-0">
                <Book size={18} />
              </div>
              <div>
                <h3 className="label text-[11px] !text-[#fdfbf7] mb-2.5">Five styles</h3>
                <p className="text-[#fdfbf7]/75 text-lg leading-relaxed max-w-sm font-serif">
                  Standard, Professional, Extensive, Clarified, or Expressive. Pick the tone that fits the document.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 pt-12 border-t border-[#fdfbf7]/15">
          <p className="label text-[10px] !text-[#fdfbf7]/55">
            RewriteFlow, est. 2026
          </p>
        </div>
      </div>

      {/* Right Side: Disciplined Form */}
      <div className="flex-1 flex flex-col bg-[#fdfbf7] dark:bg-[#1a1a1a]">
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
