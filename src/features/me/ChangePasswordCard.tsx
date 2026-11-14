import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AuthError } from '../../auth/authService'
import { MIN_PASSWORD_LENGTH, validatePassword } from '../../auth/validation'
import { useToast } from '../../components/Toast'
import { isSupabaseConfigured } from '../../lib/supabase'
import { PasswordField } from '../auth/TextField'

interface Errors {
  current?: string
  next?: string
  form?: string
}

/** Me tab card: change the password you sign in with (asks for the current one first). */
export function ChangePasswordCard() {
  const { changePassword } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  const close = () => {
    setOpen(false)
    setCurrent('')
    setNext('')
    setErrors({})
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const problems: Errors = {
      current: current ? undefined : 'Enter your current password.',
      next: !next
        ? 'Enter a new password.'
        : (validatePassword(next, { forNewAccount: true }) ??
          (current && next === current ? 'Choose a password different from your current one.' : undefined)),
    }
    setErrors(problems)
    if (problems.current || problems.next) return

    setBusy(true)
    try {
      await changePassword(current, next)
      toast.show('Password updated.')
      close()
    } catch (err) {
      if (err instanceof AuthError && err.field === 'currentPassword') setErrors({ current: err.message })
      else if (err instanceof AuthError && err.field === 'password') setErrors({ next: err.message })
      else setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card space-y-3" aria-labelledby="password-heading">
      <h2 id="password-heading" className="font-display text-lg font-semibold">
        <span aria-hidden="true">🔑</span> Password
      </h2>

      {!open ? (
        <>
          <p className="text-sm text-muted">
            Change the password you use to sign in.
            {!isSupabaseConfigured && ' (Demo mode: passwords aren’t stored, so nothing really changes.)'}
          </p>
          <button type="button" className="btn btn-secondary w-full" onClick={() => setOpen(true)}>
            Change password
          </button>
        </>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            autoFocus
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            error={errors.current}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={errors.next}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          />

          {errors.form && (
            <p role="alert" className="rounded-2xl bg-salsa-soft px-4 py-3 text-sm font-bold">
              {errors.form}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button type="submit" className="btn btn-primary sm:flex-1" disabled={busy}>
              {busy ? 'Updating…' : 'Update password'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
