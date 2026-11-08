import { clear, createStore, del, get, set } from 'idb-keyval'
import { newId } from '../lib/ids'
import { normalize } from '../lib/stats'
import type { JournalRepository } from './repository'
import { buildSampleData, SEED_PREFIX } from './seed'
import type { JournalSnapshot, Restaurant, SaveVisitInput, Visit } from './types'

const STORAGE_KEY = 'taco-journal:v1'

interface StoreShape {
  version: 1
  restaurants: Restaurant[]
  visits: Visit[]
}

// Photos are binary, so they live in IndexedDB instead of localStorage.
let photoStore: ReturnType<typeof createStore> | undefined
const photos = () => (photoStore ??= createStore('taco-journal', 'photos'))
const photoKey = (id: string) => `photo:${id}`

function readStore(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape
      if (parsed.version === 1) return parsed
    }
  } catch {
    // unreadable data: behave like a fresh journal
  }
  return { version: 1, restaurants: [], visits: [] }
}

function writeStore(store: StoreShape): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

/** Drops restaurants that no longer have any (non-deleted) visits. */
function pruneRestaurants(store: StoreShape): void {
  const used = new Set(store.visits.filter((v) => !v.deletedAt).map((v) => v.restaurantId))
  store.restaurants = store.restaurants.filter((r) => used.has(r.id))
}

function findOrCreateRestaurant(store: StoreShape, name: string, city: string): Restaurant {
  const n = normalize(name)
  const c = normalize(city)
  const existing = store.restaurants.find((r) => normalize(r.name) === n && normalize(r.city) === c)
  if (existing) return existing
  const created: Restaurant = {
    id: newId(),
    name: name.trim(),
    city: city.trim(),
    createdAt: new Date().toISOString(),
  }
  store.restaurants.push(created)
  return created
}

const byDateDesc = (a: Visit, b: Visit) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()

export const localRepository: JournalRepository = {
  async load(): Promise<JournalSnapshot> {
    const store = readStore()
    const visits = store.visits.filter((v) => !v.deletedAt).sort(byDateDesc)
    const used = new Set(visits.map((v) => v.restaurantId))
    return { restaurants: store.restaurants.filter((r) => used.has(r.id)), visits }
  },

  async saveVisit(input: SaveVisitInput): Promise<Visit> {
    const store = readStore()
    const now = new Date().toISOString()
    const restaurant = findOrCreateRestaurant(store, input.restaurantName, input.city)
    const previous = input.id ? store.visits.find((v) => v.id === input.id) : undefined

    // Persist photo blobs, then remove any that were taken off this visit.
    await Promise.all(input.photos.map((p) => set(photoKey(p.id), p.blob, photos())))
    const keep = new Set(input.photos.map((p) => p.id))
    await Promise.all(
      (previous?.photoIds ?? []).filter((id) => !keep.has(id)).map((id) => del(photoKey(id), photos())),
    )

    const visit: Visit = {
      id: previous?.id ?? newId(),
      restaurantId: restaurant.id,
      visitedAt: input.visitedAt,
      status: input.status,
      reaction: input.reaction,
      rating: input.rating,
      wouldReturn: input.wouldReturn,
      mood: input.mood,
      occasion: input.occasion,
      companions: input.companions.trim(),
      priceTier: input.priceTier,
      amountPaid: input.amountPaid,
      salsaHeat: input.salsaHeat,
      notes: input.notes.trim(),
      isFavorite: input.isFavorite,
      dishes: input.dishes.filter((d) => d.name.trim()).map((d) => ({ ...d, name: d.name.trim() })),
      photoIds: input.photos.map((p) => p.id),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      deletedAt: null,
    }

    store.visits = previous
      ? store.visits.map((v) => (v.id === visit.id ? visit : v))
      : [...store.visits, visit]
    pruneRestaurants(store)
    writeStore(store)
    return visit
  },

  async updateVisit(id, patch) {
    const store = readStore()
    store.visits = store.visits.map((v) =>
      v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v,
    )
    writeStore(store)
  },

  async deleteVisit(id) {
    const store = readStore()
    const now = new Date().toISOString()
    // Soft delete, matching the planned `deleted_at` column.
    store.visits = store.visits.map((v) => (v.id === id ? { ...v, deletedAt: now } : v))
    pruneRestaurants(store)
    writeStore(store)
  },

  async getPhoto(id) {
    return get<Blob>(photoKey(id), photos())
  },

  async loadSampleData() {
    const sample = await buildSampleData()
    await Promise.all(sample.photos.map((p) => set(photoKey(p.id), p.blob, photos())))
    const store = readStore()
    // Replace any previously-loaded sample rows, keep the user's own entries.
    store.restaurants = store.restaurants.filter((r) => !r.id.startsWith(SEED_PREFIX))
    store.visits = store.visits.filter((v) => !v.id.startsWith(SEED_PREFIX))
    store.restaurants.push(...sample.restaurants)
    store.visits.push(...sample.visits)
    writeStore(store)
  },

  async exportData() {
    const store = readStore()
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), note: 'Photos are not included in this export.', ...store },
      null,
      2,
    )
  },

  async clearAll() {
    localStorage.removeItem(STORAGE_KEY)
    await clear(photos())
  },
}
