import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../auth'
import { SiteHeader } from './SiteHeader'
import { ToastProvider } from './Toast'

/**
 * A "reset your password" email link can land on any page (for example when the
 * address in the link isn't on the allowed list, Supabase falls back to the site
 * root). Whenever one is opened, send the person to the reset form.
 */
function RecoveryRedirect() {
  const navigate = useNavigate()
  useEffect(
    () => authService.onPasswordRecovery(() => navigate('/reset-password', { replace: true })),
    [navigate],
  )
  return null
}

/** Full-width page background shared by every screen. */
export function RootLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <ToastProvider>
      <RecoveryRedirect />
      <div className="min-h-dvh bg-bg">
        <Outlet />
      </div>
    </ToastProvider>
  )
}

/** Pages with the site header and footer (Journal, Search, Insights, Me, details). */
export function TabsLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:border-2 focus:border-ink focus:bg-surface focus:px-4 focus:py-2 focus:font-bold"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 pb-16 md:px-4">
        <Outlet />
      </main>
      <footer className="border-t-2 border-line py-6 text-center text-sm text-muted">
        Taco Journal · made with salsa <span aria-hidden="true">🌶️</span>
      </footer>
    </div>
  )
}

/** Task screens (capture, forms) that take over the whole page. */
export function FocusLayout() {
  return <Outlet />
}
