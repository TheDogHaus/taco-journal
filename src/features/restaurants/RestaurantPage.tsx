import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { EmptyState, TopBar } from '../../components/PageHeader'
import { StarDisplay } from '../../components/StarRating'
import { useVisitViews } from '../../data/hooks'
import { average, effectiveRating, orderAgainList } from '../../lib/stats'
import { VisitCard } from '../visits/VisitCard'

export function RestaurantPage() {
  const { id } = useParams()
  const { views, restaurants, isLoading } = useVisitViews()
  const restaurant = restaurants.find((r) => r.id === id)
  const visits = views.filter((v) => v.restaurantId === id)

  if (isLoading) return <p className="p-6 text-muted">Loading…</p>
  if (!restaurant) {
    return (
      <>
        <TopBar variant="inline" title="Not found" />
        <EmptyState emoji="🫓" title="Couldn't find that spot">
          <Link to="/" className="btn btn-primary mt-5">
            Back to the journal
          </Link>
        </EmptyState>
      </>
    )
  }

  const avg = average(visits.map(effectiveRating))
  const again = orderAgainList(visits)

  return (
    <div>
      <TopBar variant="inline" title="Taquería" />
      <div className="space-y-6 px-4 py-2 lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:space-y-0">
        <div className="space-y-6 lg:sticky lg:top-28">
          <div>
            <h2 className="font-display text-3xl leading-tight font-bold md:text-4xl">{restaurant.name}</h2>
            {restaurant.city && (
              <p className="text-muted">
                <Icon name="pin" size={14} className="mr-1 inline align-[-2px]" />
                {restaurant.city}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-display text-lg font-semibold">
                {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
              </span>
              <StarDisplay value={Math.round(avg * 10) / 10} size={20} />
            </div>
          </div>

          {again.length > 0 && (
            <section className="rounded-3xl border-2 border-ink bg-lime-soft p-4">
              <h3 className="font-display text-lg font-semibold">Order again ↻</h3>
              <p className="font-bold">{again.map((a) => a.dish).join(' · ')}</p>
            </section>
          )}
        </div>

        <section>
          <h3 className="mb-2 font-display text-lg font-semibold">Every visit</h3>
          <ul className="grid gap-3 xl:grid-cols-2">
            {visits.map((v) => (
              <li key={v.id}>
                <VisitCard visit={v} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
