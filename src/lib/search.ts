import type { PriceTier, Reaction, VisitView } from '../data/types'
import { MOODS, OCCASIONS, optionLabel } from './constants'
import { effectiveRating } from './stats'

export interface Filters {
  query: string
  reactions: Reaction[]
  city: string | null
  taco: string | null
  occasion: string | null
  price: PriceTier | null
  fourPlus: boolean
  favoritesOnly: boolean
  sort: 'newest' | 'top'
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  reactions: [],
  city: null,
  taco: null,
  occasion: null,
  price: null,
  fourPlus: false,
  favoritesOnly: false,
  sort: 'newest',
}

/** Number of active filters (not counting the text query or sort order). */
export function activeFilterCount(f: Filters): number {
  return (
    (f.reactions.length ? 1 : 0) +
    (f.city ? 1 : 0) +
    (f.taco ? 1 : 0) +
    (f.occasion ? 1 : 0) +
    (f.price ? 1 : 0) +
    (f.fourPlus ? 1 : 0) +
    (f.favoritesOnly ? 1 : 0)
  )
}

function haystack(v: VisitView): string {
  return [
    v.restaurant.name,
    v.restaurant.city,
    v.notes,
    v.companions,
    optionLabel(MOODS, v.mood),
    optionLabel(OCCASIONS, v.occasion),
    ...v.dishes.flatMap((d) => [d.name, d.notes]),
  ]
    .join(' ')
    .toLowerCase()
}

export function filterVisits(views: VisitView[], f: Filters): VisitView[] {
  const tokens = f.query.toLowerCase().split(/\s+/).filter(Boolean)
  const result = views.filter((v) => {
    if (tokens.length) {
      const hay = haystack(v)
      if (!tokens.every((t) => hay.includes(t))) return false
    }
    if (f.reactions.length && !f.reactions.includes(v.reaction)) return false
    if (f.city && v.restaurant.city !== f.city) return false
    if (f.taco && !v.dishes.some((d) => d.name.toLowerCase() === f.taco!.toLowerCase())) return false
    if (f.occasion && v.occasion !== f.occasion) return false
    if (f.price && v.priceTier !== f.price) return false
    if (f.fourPlus && effectiveRating(v) < 4) return false
    if (f.favoritesOnly && !v.isFavorite) return false
    return true
  })
  if (f.sort === 'top') {
    result.sort(
      (a, b) =>
        effectiveRating(b) - effectiveRating(a) ||
        new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime(),
    )
  }
  return result
}
