import type { Reaction, Visit, VisitView } from '../data/types'
import { shortMonth } from './dates'
import { REACTION_RATING } from './constants'

export const effectiveRating = (v: Pick<Visit, 'rating' | 'reaction'>): number =>
  v.rating ?? REACTION_RATING[v.reaction]

export function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

export const normalize = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ')

export interface TacoStat {
  name: string
  count: number
  avgRating: number
}

export function tacoStats(views: VisitView[]): TacoStat[] {
  const map = new Map<string, { name: string; ratings: number[] }>()
  for (const v of views) {
    for (const d of v.dishes) {
      const key = normalize(d.name)
      if (!key) continue
      const reaction: Reaction = d.reaction ?? v.reaction
      const entry = map.get(key) ?? { name: d.name, ratings: [] }
      entry.ratings.push(d.reaction ? REACTION_RATING[reaction] : effectiveRating(v))
      map.set(key, entry)
    }
  }
  return [...map.values()]
    .map((e) => ({ name: e.name, count: e.ratings.length, avgRating: average(e.ratings) }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
}

export interface SpotStat {
  restaurantId: string
  name: string
  city: string
  visits: number
  avgRating: number
}

export function spotStats(views: VisitView[]): SpotStat[] {
  const map = new Map<string, { view: VisitView; ratings: number[] }>()
  for (const v of views) {
    const entry = map.get(v.restaurantId) ?? { view: v, ratings: [] }
    entry.ratings.push(effectiveRating(v))
    map.set(v.restaurantId, entry)
  }
  return [...map.values()]
    .map((e) => ({
      restaurantId: e.view.restaurantId,
      name: e.view.restaurant.name,
      city: e.view.restaurant.city,
      visits: e.ratings.length,
      avgRating: average(e.ratings),
    }))
    .sort((a, b) => b.visits - a.visits || b.avgRating - a.avgRating)
}

export interface MonthBucket {
  key: string
  label: string
  count: number
}

/** Visit counts for the last `months` calendar months, oldest first. */
export function monthlyCounts(views: VisitView[], months = 6): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: shortMonth(d), count: 0 })
  }
  for (const v of views) {
    const d = new Date(v.visitedAt)
    const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (bucket) bucket.count++
  }
  return buckets
}

export interface OrderAgain {
  dish: string
  restaurant: string
  restaurantId: string
}

export function orderAgainList(views: VisitView[]): OrderAgain[] {
  const seen = new Set<string>()
  const out: OrderAgain[] = []
  for (const v of views) {
    for (const d of v.dishes) {
      if (!d.orderAgain) continue
      const key = `${v.restaurantId}:${normalize(d.name)}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ dish: d.name, restaurant: v.restaurant.name, restaurantId: v.restaurantId })
    }
  }
  return out
}
