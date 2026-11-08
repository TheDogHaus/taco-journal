import type { Reaction } from '../data/types'
import { REACTIONS } from '../lib/constants'

const TONE: Record<Reaction, string> = {
  loved: 'aria-pressed:bg-salsa-soft',
  liked: 'aria-pressed:bg-sun-soft',
  meh: 'aria-pressed:bg-lime-soft',
}

export function ReactionPicker({
  value,
  onChange,
}: {
  value: Reaction | null
  onChange: (value: Reaction) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="How was it?">
      {REACTIONS.map((r) => (
        <button
          key={r.value}
          type="button"
          aria-pressed={value === r.value}
          onClick={() => onChange(r.value)}
          className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-3xl border-2 border-line bg-surface px-2 py-3 font-display font-semibold transition aria-pressed:-translate-y-0.5 aria-pressed:border-ink aria-pressed:shadow-[3px_3px_0_var(--shadow)] ${TONE[r.value]}`}
        >
          <span className="text-4xl leading-none" aria-hidden="true">
            {r.emoji}
          </span>
          <span className="text-sm">{r.label}</span>
        </button>
      ))}
    </div>
  )
}

export function ReactionBadge({ value, className = '' }: { value: Reaction; className?: string }) {
  const r = REACTIONS.find((x) => x.value === value)
  if (!r) return null
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${className}`}>
      <span aria-hidden="true">{r.emoji}</span>
      {r.label}
    </span>
  )
}
