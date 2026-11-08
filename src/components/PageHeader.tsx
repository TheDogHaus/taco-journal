import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

export function BackButton({ fallback = '/', close = false }: { fallback?: string; close?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <button
      type="button"
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate(fallback, { replace: true }))}
      aria-label={close ? 'Close' : 'Back'}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-ink bg-surface text-ink shadow-[2px_2px_0_var(--shadow)] active:translate-x-px active:translate-y-px active:shadow-none"
    >
      <Icon name={close ? 'close' : 'back'} size={22} />
    </button>
  )
}

/** Sticky top bar used on detail and task screens. */
export function TopBar({
  title,
  back = 'back',
  right,
}: {
  title?: string
  back?: 'back' | 'close'
  right?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b-2 border-line bg-bg/95 px-4 py-3 backdrop-blur">
      <BackButton close={back === 'close'} />
      <h1 className="min-w-0 flex-1 truncate font-display text-xl font-semibold">{title}</h1>
      {right}
    </header>
  )
}

export function EmptyState({
  emoji,
  title,
  children,
}: {
  emoji: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid size-24 place-items-center rounded-full border-2 border-ink bg-sun-soft text-5xl shadow-[4px_4px_0_var(--shadow)]">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mx-auto mt-2 max-w-xs text-muted">{children}</div>
    </div>
  )
}

export function Section({
  emoji,
  title,
  hint,
  children,
}: {
  emoji: string
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">
          <span aria-hidden="true">{emoji}</span> {title}
        </h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
