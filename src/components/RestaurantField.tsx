import { useId, useMemo } from 'react'
import { useVisitViews } from '../data/hooks'
import { relativeDay } from '../lib/dates'
import { normalize } from '../lib/stats'

interface Props {
  name: string
  city: string
  onChange: (value: { name: string; city: string }) => void
  /** Ignore this visit when computing the "been here before" hint (editing). */
  excludeVisitId?: string
}

export function RestaurantField({ name, city, onChange, excludeVisitId }: Props) {
  const { views, restaurants } = useVisitViews()
  const nameId = useId()
  const cityId = useId()

  const suggestions = useMemo(() => {
    const seen = new Set<string>()
    const recents = views.flatMap((v) => {
      if (seen.has(v.restaurantId)) return []
      seen.add(v.restaurantId)
      return [v.restaurant]
    })
    const q = normalize(name)
    const list = q ? recents.filter((r) => normalize(r.name).includes(q)) : recents
    return list
      .filter((r) => !(normalize(r.name) === q && normalize(r.city) === normalize(city)))
      .slice(0, q ? 5 : 6)
  }, [views, name, city])

  const hint = useMemo(() => {
    const n = normalize(name)
    if (!n) return null
    const c = normalize(city)
    const match = restaurants.find((r) => normalize(r.name) === n && (!c || normalize(r.city) === c))
    if (!match) return null
    const past = views.filter((v) => v.restaurantId === match.id && v.id !== excludeVisitId)
    if (!past.length) return null
    const dishes = past.flatMap((v) => v.dishes)
    const again = dishes.find((d) => d.orderAgain)?.name
    const loved = dishes.find((d) => d.reaction === 'loved')?.name
    const tail = again
      ? ` You said you'd order the ${again} again.`
      : loved
        ? ` You loved the ${loved}.`
        : ''
    return `Welcome back! ${past.length} ${past.length === 1 ? 'visit' : 'visits'} so far, last one ${relativeDay(past[0].visitedAt).toLowerCase()}.${tail}`
  }, [views, restaurants, name, city, excludeVisitId])

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={nameId} className="label">
          Restaurant
        </label>
        <input
          id={nameId}
          className="field"
          value={name}
          onChange={(e) => onChange({ name: e.target.value, city })}
          placeholder="Where did you eat?"
          autoComplete="off"
          autoCapitalize="words"
        />
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-bold tracking-wide text-muted uppercase">
            {name.trim() ? 'Did you mean' : 'Recent spots'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((r) => (
              <button
                key={r.id}
                type="button"
                className="chip"
                onClick={() => onChange({ name: r.name, city: r.city })}
              >
                {r.name}
                {r.city && <span className="font-normal text-muted">· {r.city}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {hint && (
        <p className="pop-in rounded-2xl border-2 border-lime bg-lime-soft px-3.5 py-2.5 text-sm font-bold text-ink">
          <span aria-hidden="true">👋 </span>
          {hint}
        </p>
      )}

      <div>
        <label htmlFor={cityId} className="label">
          City
        </label>
        <input
          id={cityId}
          className="field"
          value={city}
          onChange={(e) => onChange({ name, city: e.target.value })}
          placeholder="e.g. Los Angeles"
          autoComplete="off"
          autoCapitalize="words"
        />
      </div>
    </div>
  )
}
