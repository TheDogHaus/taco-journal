import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PhotoImg } from '../../components/PhotoImg'
import { ReactionBadge } from '../../components/ReactionPicker'
import { StarDisplay } from '../../components/StarRating'
import type { VisitView } from '../../data/types'
import { formatShortDate } from '../../lib/dates'

export function VisitCard({ visit }: { visit: VisitView }) {
  const dishes = visit.dishes.map((d) => d.name)
  const shown = dishes.slice(0, 3)
  return (
    <Link
      to={`/visit/${visit.id}`}
      className="card flex gap-3 p-3 transition active:translate-y-px"
    >
      <PhotoImg
        id={visit.photoIds[0]}
        alt={`Photo from ${visit.restaurant.name}`}
        className="size-24 shrink-0 rounded-2xl border-2 border-ink"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-lg leading-tight font-semibold">{visit.restaurant.name}</h3>
          {visit.isFavorite && (
            <span className="mt-0.5 shrink-0 text-salsa">
              <Icon name="heart" size={18} filled />
              <span className="sr-only">Favorite</span>
            </span>
          )}
        </div>
        {visit.restaurant.city && <p className="truncate text-sm text-muted">{visit.restaurant.city}</p>}
        <p className="text-sm font-bold text-muted">
          <time dateTime={visit.visitedAt}>{formatShortDate(visit.visitedAt)}</time>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {visit.rating ? <StarDisplay value={visit.rating} size={15} /> : <ReactionBadge value={visit.reaction} />}
        </div>
        {shown.length > 0 && (
          <p className="mt-1 truncate text-sm font-semibold">
            {shown.join(' · ')}
            {dishes.length > shown.length && <span className="text-muted"> +{dishes.length - shown.length}</span>}
          </p>
        )}
        <p className="mt-auto pt-2">
          {visit.status === 'quick' ? (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-sun px-2.5 py-0.5 text-xs font-extrabold text-ink">
              <span aria-hidden="true">⚡</span> Quick bite · needs details
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-lime bg-lime-soft px-2.5 py-0.5 text-xs font-extrabold text-ink">
              <span aria-hidden="true">✓</span> Full entry
            </span>
          )}
        </p>
      </div>
    </Link>
  )
}
