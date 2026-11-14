import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthError } from '../../auth/authService'
import { MIN_PASSWORD_LENGTH, validatePassword } from '../../auth/validation'
import { AuthShell, Splash } from './AuthLayout'
import { PasswordField } from './TextField'

/**
 * Where the "reset your password" email link lands. The link signs the person in
 * temporarily, so this page lives outside the signed-out layout (which would
 * otherwise bounce them straight into the app).
 */
export function ResetPasswordPage() {
  const { status, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (status === 'loading') return <Splash />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const problem = validatePassword(password, { forNewAccount: true })
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'signedOut') {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-2 border-ink bg-sun-soft text-3xl">
            <span aria-hidden="true">⌛</span>
          </div>
          <h1 className="font-display text-2xl font-bold">This link has expired</h1>
          <p className="mt-1 text-muted">Reset links only work once, for a short time. Request a fresh one.</p>
        </div>
        <Link to="/forgot-password" className="btn btn-primary w-full">
          Send a new link
        </Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-2 border-ink bg-lime-soft text-3xl">
            <span aria-hidden="true">✅</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Password updated</h1>
          <p className="mt-1 text-muted">You’re all set and signed in.</p>
        </div>
        <Link to="/" className="btn btn-primary w-full">
          Go to my journal
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div>
        <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
        <p className="text-muted">Pick something you haven’t used before.</p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          placeholder="Make it a good one"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
