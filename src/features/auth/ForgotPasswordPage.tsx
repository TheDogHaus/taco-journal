import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { validateEmail } from '../../auth/validation'
import { TextField } from './TextField'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const problem = validateEmail(email)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      await requestPasswordReset(email)
      setSentTo(email.trim())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <>
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-2 border-ink bg-lime-soft text-3xl">
            <span aria-hidden="true">📬</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
          <p className="mt-1 text-muted">
            If there’s an account for <strong className="text-ink">{sentTo}</strong>, we’ve sent a link to reset your
            password.
          </p>
        </div>
        <Link to="/sign-in" className="btn btn-primary w-full">
          Back to sign in
        </Link>
        <button
          type="button"
          className="mx-auto block text-sm font-extrabold text-salsa-text underline underline-offset-2"
          onClick={() => setSentTo(null)}
        >
          Use a different email
        </button>
      </>
    )
  }

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted">No worries. We’ll email you a link to set a new one.</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm">
        <Link to="/sign-in" className="font-extrabold text-salsa-text underline underline-offset-2">
          ← Back to sign in
        </Link>
      </p>
    </>
  )
}
