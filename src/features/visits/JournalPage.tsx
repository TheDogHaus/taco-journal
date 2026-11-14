import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { firstName } from '../../auth/validation'
import { PhotoImg } from '../../components/PhotoImg'
import { EmptyState } from '../../components/PageHeader'
import { useLoadSampleData, useVisitViews } from '../../data/hooks'
import { formatShortDate } from '../../lib/dates'
import { VisitCard } from './VisitCard'

export function JournalPage() {
  const { user } = useAuth()
  const { views, restaurants, isLoading } = useVisitViews()
  const sample = useLoadSampleData()

  const drafts = views.filter((v) => v.status === 'quick')

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 px-4 pt-6 pb-4 md:pt-10 md:pb-6">
        <div>
          {user && (
            <p className="mb-1 font-display text-lg font-semibold text-salsa-text">
              Hola, {firstName(user.name)} <span aria-hidden="true">👋</span>
            </p>
          )}
          <h1 className="font-display text-4xl leading-none font-bold md:text-5xl">My Taco Journal</h1>
          <p className="mt-2 text-muted">
            {views.length > 0
              ? `${views.length} ${views.length === 1 ? 'bite' : 'bites'} across ${restaurants.length} ${restaurants.length === 1 ? 'spot' : 'spots'}`
              : 'Every taco worth remembering.'}
          </p>
        </div>
      </header>

      {isLoading ? (
        <p className="px-4 text-muted">Warming up the tortillas…</p>
      ) : views.length === 0 ? (
        <EmptyState emoji="🌮" title="Your journal is hungry">
          <p>Log your first taco in about 15 seconds. Just the spot and how it was. Add a photo if you like.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/capture" className="btn btn-primary">
              Log my first taco
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => sample.mutate()}
              disabled={sample.isPending}
            >
              {sample.isPending ? 'Plating…' : 'Try it with sample tacos'}
            </button>
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-8 px-4">
          {drafts.length > 0 && (
            <section aria-labelledby="to-finish">
              <h2 id="to-finish" className="mb-2 font-display text-lg font-semibold">
                To finish <span className="text-muted">({drafts.length})</span>
              </h2>
              <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
                {drafts.map((v) => (
                  <li key={v.id} className="w-56 shrink-0 snap-start md:w-auto">
                    <Link
                      to={`/visit/${v.id}/edit`}
                      className="block overflow-hidden rounded-3xl border-2 border-ink bg-surface shadow-[3px_3px_0_var(--shadow)] transition hover:-translate-y-0.5"
                    >
                      <PhotoImg id={v.photoIds[0]} alt="" className="h-28 w-full" />
                      <div className="p-3">
                        <p className="truncate font-display font-semibold">{v.restaurant.name}</p>
                        <p className="text-xs text-muted">{formatShortDate(v.visitedAt)}</p>
                        <p className="mt-2 text-sm font-extrabold text-salsa-text">Finish entry →</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Newest first. Each card carries its own date. */}
          <section aria-labelledby="all-bites">
            <h2 id="all-bites" className="mb-3 font-display text-lg font-semibold">
              All bites <span className="text-muted">· newest first</span>
            </h2>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {views.map((v) => (
                <li key={v.id}>
                  <VisitCard visit={v} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
