import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

/** Shell for signed-out screens. Sends signed-in people back into the app. */
export function AuthLayout() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Splash />
  if (status === 'signedIn') {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    return <Navigate to={from && !from.startsWith('/sign') ? from : '/'} replace />
  }

  return (
    <div className="px-5 pt-10 pb-10">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 grid size-24 place-items-center rounded-full border-2 border-ink bg-sun-soft text-5xl shadow-[4px_4px_0_var(--shadow)]">
          <span aria-hidden="true">🌮</span>
        </div>
        <p className="font-display text-4xl leading-none font-bold">Taco Journal</p>
        <p className="mt-2 text-muted">Every taco worth remembering.</p>
      </div>

      <div className="card space-y-5 border-ink p-5 shadow-[4px_4px_0_var(--shadow)]">
        <Outlet />
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Demo mode · accounts stay on this device until we connect a backend.
      </p>
    </div>
  )
}

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <p className="font-display text-xl text-muted">
        <span aria-hidden="true">🌮 </span>Warming up the tortillas…
      </p>
    </div>
  )
}
