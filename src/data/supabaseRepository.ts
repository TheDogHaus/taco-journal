import { getSupabase } from '../lib/supabase'
import { newId } from '../lib/ids'
import { normalize } from '../lib/stats'
import type { JournalRepository } from './repository'
import { buildSampleData } from './seed'
import type {
  JournalSnapshot,
  PriceTier,
  Reaction,
  Restaurant,
  SalsaHeat,
  SaveVisitInput,
  Visit,
  VisitStatus,
} from './types'

const BUCKET = 'food-photos'

// ---- row shapes as stored in Postgres (snake_case) ---------------------------

interface RestaurantRow {
  id: string
  name: string
  city: string
  created_at: string
}

interface DishRow {
  id: string
  name: string
  reaction: Reaction | null
  order_again: boolean
  notes: string
  sort_order: number
}

interface PhotoRow {
  id: string
  sort_order: number
}

interface VisitRow {
  id: string
  restaurant_id: string
  visited_at: string
  status: VisitStatus
  reaction: Reaction
  rating: number | string | null
  would_return: boolean | null
  mood: string | null
  occasion: string | null
  companions: string
  price_tier: PriceTier | null
  amount_paid: number | string | null
  salsa_heat: SalsaHeat | null
  notes: string
  is_favorite: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
  dishes: DishRow[]
  photos: PhotoRow[]
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order
const toNumberOrNull = (v: number | string | null) => (v === null ? null : Number(v))

function toRestaurant(r: RestaurantRow): Restaurant {
  return { id: r.id, name: r.name, city: r.city, createdAt: r.created_at }
}

function toVisit(r: VisitRow): Visit {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    visitedAt: r.visited_at,
    status: r.status,
    reaction: r.reaction,
    rating: toNumberOrNull(r.rating),
    wouldReturn: r.would_return,
    mood: r.mood,
    occasion: r.occasion,
    companions: r.companions,
    priceTier: r.price_tier,
    amountPaid: toNumberOrNull(r.amount_paid),
    salsaHeat: r.salsa_heat,
    notes: r.notes,
    isFavorite: r.is_favorite,
    dishes: [...r.dishes].sort(bySortOrder).map((d) => ({
      id: d.id,
      name: d.name,
      reaction: d.reaction,
      orderAgain: d.order_again,
      notes: d.notes,
    })),
    photoIds: [...r.photos].sort(bySortOrder).map((p) => p.id),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at,
  }
}

// ---- helpers -----------------------------------------------------------------

/** Unwraps a Supabase response, turning an error into a thrown Error. */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

function failOnError(res: { error: { message: string } | null }): void {
  if (res.error) throw new Error(res.error.message)
}

async function currentUserId(): Promise<string> {
  const { data } = await getSupabase().auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('You need to be signed in.')
  return id
}

/** Storage path of a photo: one folder per user, matching the storage security rules. */
const photoPath = (userId: string, photoId: string) => `${userId}/${photoId}.jpg`

async function findOrCreateRestaurant(name: string, city: string): Promise<string> {
  const sb = getSupabase()
  const n = normalize(name)
  const c = normalize(city)
  const existing = unwrap(await sb.from('restaurants').select('id, name, city')) as Pick<
    RestaurantRow,
    'id' | 'name' | 'city'
  >[]
  const match = existing.find((r) => normalize(r.name) === n && normalize(r.city) === c)
  if (match) return match.id
  const created = unwrap(
    await sb.from('restaurants').insert({ name: name.trim(), city: city.trim() }).select('id').single(),
  ) as { id: string }
  return created.id
}

// ---- repository --------------------------------------------------------------

async function load(): Promise<JournalSnapshot> {
  const sb = getSupabase()
  const [restaurantsRes, visitsRes] = await Promise.all([
    sb.from('restaurants').select('id, name, city, created_at'),
    sb
      .from('visits')
      .select('*, dishes(*), photos(id, sort_order)')
      .is('deleted_at', null)
      .order('visited_at', { ascending: false }),
  ])
  const visits = (unwrap(visitsRes) as unknown as VisitRow[]).map(toVisit)
  const used = new Set(visits.map((v) => v.restaurantId))
  const restaurants = (unwrap(restaurantsRes) as RestaurantRow[]).filter((r) => used.has(r.id)).map(toRestaurant)
  return { restaurants, visits }
}

async function saveVisit(input: SaveVisitInput): Promise<Visit> {
  const sb = getSupabase()
  const userId = await currentUserId()
  const restaurantId = await findOrCreateRestaurant(input.restaurantName, input.city)
  const visitId = input.id ?? newId()

  // Which photos does this visit already have? Only upload the new ones.
  const existingPhotoIds = input.id
    ? (unwrap(await sb.from('photos').select('id').eq('visit_id', visitId)) as { id: string }[]).map((p) => p.id)
    : []
  const alreadyStored = new Set(existingPhotoIds)
  const keep = new Set(input.photos.map((p) => p.id))

  for (const photo of input.photos) {
    if (alreadyStored.has(photo.id)) continue
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(photoPath(userId, photo.id), photo.blob, { contentType: 'image/jpeg', upsert: true })
    if (error) throw new Error(error.message)
  }

  const saved = unwrap(
    await sb
      .from('visits')
      .upsert({
        id: visitId,
        restaurant_id: restaurantId,
        visited_at: input.visitedAt,
        status: input.status,
        reaction: input.reaction,
        rating: input.rating,
        would_return: input.wouldReturn,
        mood: input.mood,
        occasion: input.occasion,
        companions: input.companions.trim(),
        price_tier: input.priceTier,
        amount_paid: input.amountPaid,
        salsa_heat: input.salsaHeat,
        notes: input.notes.trim(),
        is_favorite: input.isFavorite,
        deleted_at: null,
      })
      .select('created_at, updated_at')
      .single(),
  ) as { created_at: string; updated_at: string }

  // Dishes: replace the whole list.
  failOnError(await sb.from('dishes').delete().eq('visit_id', visitId))
  const dishes = input.dishes
    .filter((d) => d.name.trim())
    .map((d, index) => ({
      id: d.id,
      visit_id: visitId,
      name: d.name.trim(),
      reaction: d.reaction,
      order_again: d.orderAgain,
      notes: d.notes,
      sort_order: index,
    }))
  if (dishes.length) failOnError(await sb.from('dishes').insert(dishes))

  // Photos: remove the ones taken off first (keeps us under the 3-photo limit), then add new ones.
  const removed = existingPhotoIds.filter((id) => !keep.has(id))
  if (removed.length) {
    failOnError(await sb.from('photos').delete().in('id', removed))
    await sb.storage.from(BUCKET).remove(removed.map((id) => photoPath(userId, id)))
  }
  const added = input.photos
    .map((p, index) => ({ id: p.id, visit_id: visitId, sort_order: index }))
    .filter((p) => !alreadyStored.has(p.id))
  if (added.length) failOnError(await sb.from('photos').insert(added))

  return {
    id: visitId,
    restaurantId,
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
    dishes: input.dishes,
    photoIds: input.photos.map((p) => p.id),
    createdAt: saved.created_at,
    updatedAt: saved.updated_at,
    deletedAt: null,
  }
}

export const supabaseRepository: JournalRepository = {
  load,
  saveVisit,

  async updateVisit(id, patch) {
    if (patch.isFavorite === undefined) return
    failOnError(await getSupabase().from('visits').update({ is_favorite: patch.isFavorite }).eq('id', id))
  },

  async deleteVisit(id) {
    // Soft delete, same as the local version.
    failOnError(await getSupabase().from('visits').update({ deleted_at: new Date().toISOString() }).eq('id', id))
  },

  async getPhoto(id) {
    try {
      const userId = await currentUserId()
      const { data, error } = await getSupabase().storage.from(BUCKET).download(photoPath(userId, id))
      return error ? undefined : data
    } catch {
      return undefined
    }
  },

  async loadSampleData() {
    const sample = await buildSampleData()
    const restaurants = new Map(sample.restaurants.map((r) => [r.id, r]))
    const blobs = new Map(sample.photos.map((p) => [p.id, p.blob]))
    // Sample ids aren't real UUIDs, so give everything fresh ones as it is saved.
    for (const v of sample.visits) {
      const restaurant = restaurants.get(v.restaurantId)
      if (!restaurant) continue
      await saveVisit({
        restaurantName: restaurant.name,
        city: restaurant.city,
        visitedAt: v.visitedAt,
        status: v.status,
        reaction: v.reaction,
        rating: v.rating,
        wouldReturn: v.wouldReturn,
        mood: v.mood,
        occasion: v.occasion,
        companions: v.companions,
        priceTier: v.priceTier,
        amountPaid: v.amountPaid,
        salsaHeat: v.salsaHeat,
        notes: v.notes,
        isFavorite: v.isFavorite,
        dishes: v.dishes.map((d) => ({ ...d, id: newId() })),
        photos: v.photoIds.flatMap((pid) => {
          const blob = blobs.get(pid)
          return blob ? [{ id: newId(), blob }] : []
        }),
      })
    }
  },

  async exportData() {
    const snapshot = await load()
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), note: 'Photos are not included in this export.', ...snapshot },
      null,
      2,
    )
  },

  async clearAll() {
    const sb = getSupabase()
    const userId = await currentUserId()
    // Photo files first, then the rows (deleting restaurants cascades to visits, dishes and photos).
    const { data: files } = await sb.storage.from(BUCKET).list(userId, { limit: 1000 })
    if (files?.length) {
      await sb.storage.from(BUCKET).remove(files.map((f) => `${userId}/${f.name}`))
    }
    failOnError(await sb.from('restaurants').delete().not('id', 'is', null))
  },
}
