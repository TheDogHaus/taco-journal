// Domain types. These mirror the planned Supabase tables so the local
// repository can be swapped for a Supabase one without touching the UI.

export type Reaction = 'loved' | 'liked' | 'meh'
export type VisitStatus = 'quick' | 'complete'
export type PriceTier = 1 | 2 | 3 | 4
export type SalsaHeat = 1 | 2 | 3 | 4

export interface Restaurant {
  id: string
  name: string
  city: string
  createdAt: string
}

export interface Dish {
  id: string
  name: string
  reaction: Reaction | null
  orderAgain: boolean
  notes: string
}

export interface Visit {
  id: string
  restaurantId: string
  /** ISO timestamp of the visit */
  visitedAt: string
  /** quick = captured in the moment, complete = fully filled in */
  status: VisitStatus
  reaction: Reaction
  /** 0.5 – 5 in half steps; null when only a reaction was given */
  rating: number | null
  wouldReturn: boolean | null
  mood: string | null
  occasion: string | null
  companions: string
  priceTier: PriceTier | null
  amountPaid: number | null
  salsaHeat: SalsaHeat | null
  notes: string
  isFavorite: boolean
  dishes: Dish[]
  /** Ordered ids of photos stored separately (Storage bucket later) */
  photoIds: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface VisitView extends Visit {
  restaurant: Restaurant
}

export interface PhotoDraft {
  id: string
  blob: Blob
}

export interface JournalSnapshot {
  restaurants: Restaurant[]
  visits: Visit[]
}

export interface SaveVisitInput {
  /** Omit to create a new visit */
  id?: string
  restaurantName: string
  city: string
  visitedAt: string
  status: VisitStatus
  reaction: Reaction
  rating: number | null
  wouldReturn: boolean | null
  mood: string | null
  occasion: string | null
  companions: string
  priceTier: PriceTier | null
  amountPaid: number | null
  salsaHeat: SalsaHeat | null
  notes: string
  isFavorite: boolean
  dishes: Dish[]
  photos: PhotoDraft[]
}
