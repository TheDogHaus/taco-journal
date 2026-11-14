import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { EmptyState } from '../../components/PageHeader'
import { useVisitViews } from '../../data/hooks'
import type { Reaction } from '../../data/types'
import { OCCASIONS, PRICE_TIERS, REACTIONS } from '../../lib/constants'
import { EMPTY_FILTERS, activeFilterCount, filterVisits } from '../../lib/search'
import type { Filters } from '../../lib/search'
import { VisitCard } from '../visits/VisitCard'

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function SearchPage() {
  const { views, isLoading } = useVisitViews()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [open, setOpen] = useState(false)
  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }))

  const cities = useMemo(
    () => [...new Set(views.map((v) => v.restaurant.city).filter(Boolean))].sort(),
    [views],
  )
  const tacos = useMemo(() => {
    const map = new Map<string, string>()
    for (const v of views) for (const d of v.dishes) map.set(d.name.toLowerCase(), d.name)
    return [...map.values()].sort()
  }, [views])

  const results = useMemo(() => filterVisits(views, filters), [views, filters])
  const count = activeFilterCount(filters)
  const hasAny = count > 0 || filters.query.trim() !== ''

  const toggleReaction = (r: Reaction) =>
    patch({
      reactions: filters.reactions.includes(r) ? filters.reactions.filter((x) => x !== r) : [...filters.reactions, r],
    })
  const pick = <K extends 'city' | 'taco' | 'occasion' | 'price'>(key: K, value: Filters[K]) =>
    patch({ [key]: filters[key] === value ? null : value } as Partial<Filters>)

  return (
    <div>
      <header className="px-4 pt-6 pb-3 md:pt-10 md:pb-5">
        <h1 className="font-display text-3xl font-bold md:text-5xl">Search</h1>
        <p className="text-muted">Find that one amazing al pastor.</p>
      </header>

      <div className="px-4">
        <div className="max-w-2xl space-y-3">
        <div className="relative">
          <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            className="field pl-11"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Restaurant, taco, note, friend…"
            aria-label="Search your visits"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm lg:invisible"
            aria-expanded={open}
            aria-controls="filter-panel"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name="sliders" size={18} />
            Filters{count > 0 && ` (${count})`}
          </button>
          <label className="flex items-center gap-2 text-sm font-bold">
            Sort
            <select
              className="field w-auto py-2"
              value={filters.sort}
              onChange={(e) => patch({ sort: e.target.value as Filters['sort'] })}
            >
              <option value="newest">Newest</option>
              <option value="top">Top rated</option>
            </select>
          </label>
        </div>
        </div>

        <div className="mt-3 lg:mt-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div
          id="filter-panel"
          className={`card space-y-4 lg:sticky lg:top-28 lg:block ${open ? 'pop-in' : 'hidden'}`}
        >
            <FilterGroup label="How it was">
              {REACTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className="chip"
                  aria-pressed={filters.reactions.includes(r.value)}
                  onClick={() => toggleReaction(r.value)}
                >
                  <span aria-hidden="true">{r.emoji}</span> {r.label}
                </button>
              ))}
              <button
                type="button"
                className="chip"
                aria-pressed={filters.fourPlus}
                onClick={() => patch({ fourPlus: !filters.fourPlus })}
              >
                ★ 4 &amp; up
              </button>
              <button
                type="button"
                className="chip"
                aria-pressed={filters.favoritesOnly}
                onClick={() => patch({ favoritesOnly: !filters.favoritesOnly })}
              >
                ♥ Favorites
              </button>
            </FilterGroup>

            {tacos.length > 0 && (
              <FilterGroup label="Taco type">
                {tacos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="chip"
                    aria-pressed={filters.taco === t}
                    onClick={() => pick('taco', t)}
                  >
                    {t}
                  </button>
                ))}
              </FilterGroup>
            )}

            {cities.length > 0 && (
              <FilterGroup label="City">
                {cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="chip"
                    aria-pressed={filters.city === c}
                    onClick={() => pick('city', c)}
                  >
                    {c}
                  </button>
                ))}
              </FilterGroup>
            )}

            <FilterGroup label="Occasion">
              {OCCASIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="chip"
                  aria-pressed={filters.occasion === o.value}
                  onClick={() => pick('occasion', o.value)}
                >
                  <span aria-hidden="true">{o.emoji}</span> {o.label}
                </button>
              ))}
            </FilterGroup>

            <FilterGroup label="Price">
              {PRICE_TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip"
                  aria-pressed={filters.price === t}
                  onClick={() => pick('price', t)}
                >
                  {'$'.repeat(t)}
                </button>
              ))}
            </FilterGroup>

            {count > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setFilters((f) => ({ ...EMPTY_FILTERS, query: f.query, sort: f.sort }))}
              >
                Clear filters
              </button>
            )}
        </div>

        <div className="pt-4 lg:pt-0">
        {isLoading ? null : views.length === 0 ? (
          <EmptyState emoji="🔎" title="Nothing to search yet">
            <p>Log a few bites and they will show up here.</p>
            <Link to="/capture" className="btn btn-primary mt-5">
              Log a taco
            </Link>
          </EmptyState>
        ) : results.length === 0 ? (
          <EmptyState emoji="🫙" title="No tacos match">
            <p>Try fewer filters or a different word.</p>
          </EmptyState>
        ) : (
          <>
            <p className="mb-2 text-sm font-bold text-muted" aria-live="polite">
              {results.length} {results.length === 1 ? 'result' : 'results'}
              {hasAny ? '' : ' · everything'}
            </p>
            <ul className="grid gap-3 md:grid-cols-2">
              {results.map((v) => (
                <li key={v.id}>
                  <VisitCard visit={v} />
                </li>
              ))}
            </ul>
          </>
        )}
        </div>
        </div>
      </div>
    </div>
  )
}
