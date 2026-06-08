import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { toast } from 'sonner'
import { Loader2, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react'
import Logo from '../components/ui/Logo.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import TextField from '../components/ui/TextField.jsx'
import PasswordField from '../components/ui/PasswordField.jsx'

function PasswordStrength({ password }) {
  if (!password) return null

  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  const idx = Math.min(score, 4)

  return (
    <div className="mt-4" role="meter" aria-valuenow={idx} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
      <div className="flex gap-2 mb-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= idx ? 'bg-oxford dark:bg-oxford-soft' : 'bg-gray-200 dark:bg-ink-raised'}`}
          />
        ))}
      </div>
      <span className="label text-[10px]">{labels[idx]}</span>
    </div>
  )
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const mismatch = confirm !== '' && confirm !== password

  useEffect(() => { document.title = 'Request Access · RewriteFlow' }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) return toast.error("Verification passcodes do not match.")
    if (password.length < 6) return toast.error('Passcode must be at least 6 characters.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Registration request received. Please check your inbox (and spam folder) for a confirmation link.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-svh flex flex-col lg:flex-row bg-paper dark:bg-ink-bg">
      {/* Left Side: Professional Identity */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-oxford dark:bg-[#0b1320] p-20 flex-col justify-between overflow-hidden">
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
            Every rewrite, <br />
            saved and searchable.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-[#fdfbf7]/25 flex items-center justify-center text-[#fdfbf7] mt-1 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="label text-[11px] !text-[#fdfbf7] mb-2.5">Private to you</h3>
                <p className="text-[#fdfbf7]/75 text-lg leading-relaxed max-w-sm font-serif">
                  Your drafts and rewrites are tied to your account and only visible to you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-md border border-[#fdfbf7]/25 flex items-center justify-center text-[#fdfbf7] mt-1 shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="label text-[11px] !text-[#fdfbf7] mb-2.5">Reuse anytime</h3>
                <p className="text-[#fdfbf7]/75 text-lg leading-relaxed max-w-sm font-serif">
                  Open any past rewrite, search across them, and load one back into the workspace in a click.
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
              <h1 className="text-4xl text-oxford dark:text-white mb-3 font-display">Create your account</h1>
              <p className="label text-[11px]">It takes about a minute</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <TextField
                label="Email"
                id="register-email"
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
                id="register-password"
                name="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="font-serif text-lg"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              >
                <PasswordStrength password={password} />
              </PasswordField>

              <TextField
                label="Confirm password"
                id="register-confirm"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="font-serif text-lg"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                error={mismatch ? "Passwords do not match." : undefined}
              />

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4"
              >
                {loading ? (
                  <span className="spinner w-[18px] h-[18px] !border-white/40 !border-t-white" />
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-14 pt-10 border-t border-gray-200 dark:border-ink-border text-center lg:text-left">
              <p className="text-base text-gray-700 dark:text-gray-300 font-serif">
                Already have an account?{' '}
                <Link to="/login" className="text-oxford dark:text-oxford-soft font-semibold hover:underline underline-offset-4 decoration-2 transition-all rounded-sm">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
