import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthError } from '../../auth/authService'
import {
  MIN_PASSWORD_LENGTH,
  firstName,
  validateEmail,
  validateName,
  validatePassword,
} from '../../auth/validation'
import { useToast } from '../../components/Toast'
import { PasswordField, TextField } from './TextField'

export function CreateAccountPage() {
  const { signUp } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password, { forNewAccount: true }),
    }
    setErrors(next)
    if (next.name || next.email || next.password) return

    setBusy(true)
    try {
      const result = await signUp(name, email, password)
      if (result.user) {
        toast.show(`Welcome, ${firstName(result.user.name)}! Let’s log some tacos.`)
      } else {
        // Email confirmation is switched on in the project: they must tap the link first.
        setConfirmEmail(email.trim())
        setBusy(false)
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setErrors(err.field ? { [err.field]: err.message } : { form: err.message })
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
      setBusy(false)
    }
  }

  if (confirmEmail) {
    return (
      <>
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-2 border-ink bg-lime-soft text-3xl">
            <span aria-hidden="true">📬</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Confirm your email</h1>
          <p className="mt-1 text-muted">
            We sent a link to <strong className="text-ink">{confirmEmail}</strong>. Tap it to finish creating your
            account.
          </p>
        </div>
        <Link to="/sign-in" className="btn btn-primary w-full">
          Back to sign in
        </Link>
      </>
    )
  }

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-muted">Your private taco diary, ready in a minute.</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <TextField
          label="Your name"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="Make it a good one"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />

        {errors.form && (
          <p role="alert" className="rounded-2xl bg-salsa-soft px-4 py-3 text-sm font-bold">
            {errors.form}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-extrabold text-salsa-text underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </>
  )
}
