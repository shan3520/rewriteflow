import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuth } from './context/AuthContext.jsx'

// Route-split: each page is its own chunk, so the first paint (the login screen)
// doesn't download and parse the editor and history code it doesn't need yet.
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const AppPage = lazy(() => import('./pages/AppPage.jsx'))
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'))

function PageFallback() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-paper dark:bg-ink-bg">
      <div className="spinner w-8 h-8" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-svh flex items-center justify-center bg-paper dark:bg-ink-bg">
      <div className="spinner w-8 h-8" />
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    // reducedMotion="user" makes every framer-motion animation honor the OS
    // "reduce motion" setting (the CSS @media override only covers CSS motion).
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  )
}
