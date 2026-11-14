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

/**
 * Title row with a back/close button.
 * - "sticky" (default): its own bar stuck to the top, used on full-page task screens.
 * - "inline": sits at the top of the page content, used under the site header.
 */
export function TopBar({
  title,
  back = 'back',
  right,
  variant = 'sticky',
  widthClass = 'max-w-6xl',
}: {
  title?: string
  back?: 'back' | 'close'
  right?: ReactNode
  variant?: 'sticky' | 'inline'
  /** Max width of the bar's content so it lines up with the page below it. */
  widthClass?: string
}) {
  const row = (
    <>
      <BackButton close={back === 'close'} />
      <h1 className="min-w-0 flex-1 truncate font-display text-xl font-semibold md:text-2xl">{title}</h1>
      {right}
    </>
  )

  if (variant === 'inline') {
    return <div className="flex items-center gap-3 px-4 py-4 md:px-0">{row}</div>
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-bg/95 backdrop-blur">
      <div className={`mx-auto flex w-full items-center gap-3 px-4 py-3 md:px-8 ${widthClass}`}>{row}</div>
    </header>
  )
}

/** Sticky bottom bar for the main action on a task screen (e.g. Save). */
export function ActionBar({ children, widthClass = 'max-w-2xl' }: { children: ReactNode; widthClass?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-bg/95 backdrop-blur">
      <div
        className={`mx-auto flex w-full flex-col gap-1 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:flex-row md:items-center md:justify-end md:gap-6 md:px-8 ${widthClass}`}
      >
        {children}
      </div>
    </div>
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
    <section className="card mb-4 space-y-4 break-inside-avoid">
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
