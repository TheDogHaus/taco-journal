import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PhotoImg } from '../../components/PhotoImg'
import { ReactionBadge } from '../../components/ReactionPicker'
import { StarDisplay } from '../../components/StarRating'
import type { VisitView } from '../../data/types'
import { relativeDay } from '../../lib/dates'

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
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-lg leading-tight font-semibold">{visit.restaurant.name}</h3>
          {visit.isFavorite && (
            <span className="mt-0.5 shrink-0 text-salsa">
              <Icon name="heart" size={18} filled />
              <span className="sr-only">Favorite</span>
            </span>
          )}
        </div>
        <p className="truncate text-sm text-muted">
          {[visit.restaurant.city, relativeDay(visit.visitedAt)].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {visit.rating ? <StarDisplay value={visit.rating} size={15} /> : <ReactionBadge value={visit.reaction} />}
          {visit.status === 'quick' && (
            <span className="rounded-full border-2 border-ink bg-sun px-2 py-0.5 text-xs font-extrabold text-ink">
              Needs details
            </span>
          )}
        </div>
        {shown.length > 0 && (
          <p className="mt-1 truncate text-sm font-semibold">
            {shown.join(' · ')}
            {dishes.length > shown.length && <span className="text-muted"> +{dishes.length - shown.length}</span>}
          </p>
        )}
      </div>
    </Link>
  )
}
