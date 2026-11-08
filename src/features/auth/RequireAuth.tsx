import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Splash } from './AuthLayout'

/** Wraps every screen that needs an account; signed-out visitors go to sign in. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <Splash />
  if (status === 'signedOut') return <Navigate to="/sign-in" replace state={{ from: location }} />
  return <Outlet />
}
