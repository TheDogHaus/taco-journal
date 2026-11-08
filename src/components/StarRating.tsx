import type { KeyboardEvent } from 'react'
import { useRef } from 'react'

const STAR_PATH = 'M12 2.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.6 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z'

function Star({ fill, size }: { fill: number; size: number }) {
  const pct = Math.round(fill * 100)
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0" aria-hidden="true">
        <path d={STAR_PATH} fill="var(--line)" />
      </svg>
      {pct > 0 && (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill="var(--sun)" stroke="var(--ink)" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

const fillFor = (value: number | null, index: number) => Math.min(1, Math.max(0, (value ?? 0) - index))

/** Read-only stars with the numeric value next to them. */
export function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={fillFor(value, i)} size={size} />
        ))}
      </span>
      <span className="text-sm font-extrabold text-ink">{value.toFixed(1)}</span>
    </span>
  )
}

interface StarRatingProps {
  value: number | null
  onChange: (value: number | null) => void
  size?: number
}

/**
 * Half-star rating. Tap the left half of a star for .5, the right half for a
 * whole star; tap the same value again to clear. Arrow keys step by 0.5.
 */
export function StarRating({ value, onChange, size = 42 }: StarRatingProps) {
  const ref = useRef<HTMLDivElement>(null)

  const pick = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const next = Math.max(0.5, Math.ceil(ratio * 10) / 2)
    onChange(next === value ? null : next)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = value ?? 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(5, current + 0.5))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(current <= 0.5 ? null : current - 0.5)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      onChange(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Star rating"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value ?? 0}
        aria-valuetext={value ? `${value} out of 5 stars` : 'Not rated'}
        onClick={(e) => pick(e.clientX)}
        onKeyDown={onKeyDown}
        className="flex cursor-pointer touch-manipulation gap-1 rounded-xl"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={fillFor(value, i)} size={size} />
        ))}
      </div>
      <span className="font-display text-lg font-semibold text-ink">
        {value ? value.toFixed(1) : <span className="text-sm font-normal text-muted">Optional · tap a star</span>}
      </span>
    </div>
  )
}
