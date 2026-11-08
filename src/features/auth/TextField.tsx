import { useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, className = '', ...props }: TextFieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className={`field ${error ? 'border-salsa!' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-bold text-salsa-text">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** Password input with a Show/Hide toggle. */
export function PasswordField({
  label = 'Password',
  error,
  hint,
  ...props
}: Omit<TextFieldProps, 'type' | 'label'> & { label?: string }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`field pr-20 ${error ? 'border-salsa!' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 min-h-10 -translate-y-1/2 cursor-pointer rounded-full px-3 text-sm font-extrabold text-salsa-text"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-bold text-salsa-text">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
