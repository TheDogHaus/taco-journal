import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthError } from '../../auth/authService'
import { firstName, validateEmail, validatePassword } from '../../auth/validation'
import { useToast } from '../../components/Toast'
import { PasswordField, TextField } from './TextField'

export function SignInPage() {
  const { signIn } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { email: validateEmail(email), password: validatePassword(password) }
    setErrors(next)
    if (next.email || next.password) return

    setBusy(true)
    try {
      const user = await signIn(email, password)
      toast.show(`Welcome back, ${firstName(user.name)}!`)
    } catch (err) {
      if (err instanceof AuthError) {
        setErrors(err.field ? { [err.field]: err.message } : { form: err.message })
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="text-muted">Sign in to see your tacos.</p>
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
          error={errors.email}
        />
        <PasswordField
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-extrabold text-salsa-text underline underline-offset-2">
            Forgot password?
          </Link>
        </div>

        {errors.form && (
          <p role="alert" className="rounded-2xl bg-salsa-soft px-4 py-3 text-sm font-bold">
            {errors.form}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm">
        New here?{' '}
        <Link to="/create-account" className="font-extrabold text-salsa-text underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </>
  )
}
