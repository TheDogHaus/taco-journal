import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { clearPhotoUrlCache } from '../data/hooks'
import { authService } from './index'
import type { SignUpResult, User } from './authService'

interface AuthContextValue {
  /** loading until the saved session has been checked */
  status: 'loading' | 'signedIn' | 'signedOut'
  user: User | null
  signIn: (email: string, password: string) => Promise<User>
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [checked, setChecked] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const lastUserId = useRef<string | null>(null)

  // Whenever a different person (or nobody) is signed in, drop everything cached
  // for the previous person so their entries and photos never leak across accounts.
  const applyUser = useCallback(
    (next: User | null) => {
      const nextId = next?.id ?? null
      if (lastUserId.current !== nextId) {
        queryClient.clear()
        clearPhotoUrlCache()
        lastUserId.current = nextId
      }
      setUser(next)
      setChecked(true)
    },
    [queryClient],
  )

  useEffect(() => {
    let cancelled = false
    authService.getSession().then((session) => {
      if (!cancelled) applyUser(session)
    })
    const unsubscribe = authService.onChange((next) => {
      if (!cancelled) applyUser(next)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [applyUser])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await authService.signIn(email, password)
      applyUser(next)
      return next
    },
    [applyUser],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authService.signUp(name, email, password)
      if (result.user) applyUser(result.user)
      return result
    },
    [applyUser],
  )

  const signOut = useCallback(async () => {
    await authService.signOut()
    applyUser(null)
  }, [applyUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      status: !checked ? 'loading' : user ? 'signedIn' : 'signedOut',
      user,
      signIn,
      signUp,
      signOut,
      requestPasswordReset: (email: string) => authService.requestPasswordReset(email),
      updatePassword: (password: string) => authService.updatePassword(password),
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
