import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/PageHeader'
import { useVisitViews } from '../../data/hooks'
import { average, effectiveRating, monthlyCounts, orderAgainList, spotStats, tacoStats } from '../../lib/stats'

function Tile({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className={`rounded-3xl border-2 border-ink p-4 shadow-[3px_3px_0_var(--shadow)] ${tone}`}>
      <p className="font-display text-4xl leading-none font-bold">{value}</p>
      <p className="mt-1 text-sm font-bold">{label}</p>
    </div>
  )
}

function Bar({ label, value, max, detail }: { label: string; value: number; max: number; detail: string }) {
  return (
    <li>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="truncate font-bold">{label}</span>
        <span className="shrink-0 text-sm text-muted">{detail}</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-salsa" style={{ width: `${Math.max(6, (value / max) * 100)}%` }} />
      </div>
    </li>
  )
}

export function InsightsPage() {
  const { views, restaurants, isLoading } = useVisitViews()

  const data = useMemo(() => {
    const tacos = tacoStats(views).slice(0, 6)
    const spots = spotStats(views).slice(0, 5)
    const months = monthlyCounts(views, 6)
    return {
      tacos,
      spots,
      months,
      again: orderAgainList(views).slice(0, 8),
      avg: average(views.map(effectiveRating)),
      favorites: views.filter((v) => v.isFavorite).length,
    }
  }, [views])

  if (isLoading) return null

  if (views.length === 0) {
    return (
      <EmptyState emoji="📊" title="No stats yet">
        <p>Your taco habits will show up here after you log a few bites.</p>
        <Link to="/capture" className="btn btn-primary mt-5">
          Log a taco
        </Link>
      </EmptyState>
    )
  }

  const maxMonth = Math.max(1, ...data.months.map((m) => m.count))

  return (
    <div>
      <header className="px-4 pt-6 pb-4 md:pt-10 md:pb-6">
        <h1 className="font-display text-3xl font-bold md:text-5xl">Your taco story</h1>
        <p className="text-muted">What your bites say about you.</p>
      </header>

      <div className="space-y-7 px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Tile value={String(views.length)} label="Bites logged" tone="bg-sun-soft" />
          <Tile value={String(restaurants.length)} label="Different spots" tone="bg-salsa-soft" />
          <Tile value={data.avg.toFixed(1)} label="Average rating" tone="bg-lime-soft" />
          <Tile value={String(data.favorites)} label="Favorites" tone="bg-surface" />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
        {data.tacos.length > 0 && (
          <section className="card">
            <h2 className="mb-3 font-display text-lg font-semibold">Your go-to tacos</h2>
            <ul className="space-y-3">
              {data.tacos.map((t) => (
                <Bar
                  key={t.name}
                  label={t.name}
                  value={t.count}
                  max={data.tacos[0].count}
                  detail={`${t.count}× · ★ ${t.avgRating.toFixed(1)}`}
                />
              ))}
            </ul>
          </section>
        )}

        <section className="card">
          <h2 className="mb-3 font-display text-lg font-semibold">Most visited spots</h2>
          <ol className="space-y-3">
            {data.spots.map((s, i) => (
              <li key={s.restaurantId}>
                <Link to={`/restaurant/${s.restaurantId}`} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun font-display font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{s.name}</span>
                    <span className="text-sm text-muted">{s.city}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm">
                    <span className="block font-bold">
                      {s.visits} {s.visits === 1 ? 'visit' : 'visits'}
                    </span>
                    <span className="text-muted">★ {s.avgRating.toFixed(1)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <h2 className="mb-3 font-display text-lg font-semibold">Bites per month</h2>
          <ul className="flex h-40 items-end gap-2">
            {data.months.map((m) => (
              <li key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-sm font-extrabold">{m.count}</span>
                <div
                  className="w-full rounded-t-xl border-2 border-ink bg-salsa"
                  style={{ height: m.count ? `${Math.max(8, (m.count / maxMonth) * 100)}%` : '4px', opacity: m.count ? 1 : 0.3 }}
                  aria-hidden="true"
                />
                <span className="text-xs font-bold text-muted">{m.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {data.again.length > 0 && (
          <section className="rounded-3xl border-2 border-ink bg-lime-soft p-4">
            <h2 className="mb-2 font-display text-lg font-semibold">Order these again ↻</h2>
            <ul className="space-y-1.5">
              {data.again.map((a) => (
                <li key={`${a.restaurantId}-${a.dish}`} className="font-bold">
                  {a.dish} <span className="font-normal text-muted">at</span>{' '}
                  <Link to={`/restaurant/${a.restaurantId}`} className="underline decoration-wavy underline-offset-2">
                    {a.restaurant}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>
      </div>
    </div>
  )
}
