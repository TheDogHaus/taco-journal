import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from './index'
import type { User } from './authService'

interface AuthContextValue {
  /** loading until the saved session has been checked */
  status: 'loading' | 'signedIn' | 'signedOut'
  user: User | null
  signIn: (email: string, password: string) => Promise<User>
  signUp: (name: string, email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let cancelled = false
    authService.getSession().then((session) => {
      if (cancelled) return
      setUser(session)
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authService.signIn(email, password)
    setUser(next)
    return next
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const next = await authService.signUp(name, email, password)
    setUser(next)
    return next
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status: !checked ? 'loading' : user ? 'signedIn' : 'signedOut',
      user,
      signIn,
      signUp,
      signOut,
      requestPasswordReset: (email: string) => authService.requestPasswordReset(email),
    }),
    [checked, user, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
