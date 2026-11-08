import { daysAgoIso } from '../lib/dates'
import type { Dish, PhotoDraft, Reaction, Restaurant, Visit } from './types'

export const SEED_PREFIX = 'seed-'

async function placeholderPhoto(emoji: string, from: string, to: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, from)
  gradient.addColorStop(1, to)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  for (let x = 40; x < 800; x += 80) {
    for (let y = 40; y < 600; y += 80) {
      ctx.beginPath()
      ctx.arc(x + ((y / 80) % 2) * 40, y, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.font = '260px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 400, 310)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not build sample photo'))), 'image/jpeg', 0.85),
  )
}

const dish = (
  id: string,
  name: string,
  reaction: Reaction | null,
  orderAgain = false,
  notes = '',
): Dish => ({ id: `${SEED_PREFIX}dish-${id}`, name, reaction, orderAgain, notes })

const restaurants: Restaurant[] = [
  { id: `${SEED_PREFIX}r-esquina`, name: 'La Esquina Taquería', city: 'Los Angeles' },
  { id: `${SEED_PREFIX}r-chuy`, name: "Don Chuy's Birria", city: 'Los Angeles' },
  { id: `${SEED_PREFIX}r-azul`, name: 'Mariscos Playa Azul', city: 'San Diego' },
  { id: `${SEED_PREFIX}r-tigre`, name: 'El Tigre Al Pastor', city: 'Austin' },
  { id: `${SEED_PREFIX}r-nopal`, name: 'Casa Nopal', city: 'Los Angeles' },
].map((r) => ({ ...r, createdAt: new Date().toISOString() }))

type VisitSeed = Pick<Visit, 'restaurantId' | 'status' | 'reaction'> &
  Partial<Omit<Visit, 'id' | 'restaurantId' | 'status' | 'reaction' | 'dishes' | 'photoIds'>> & {
    key: string
    daysAgo: number
    dishes: Dish[]
    photo?: [emoji: string, from: string, to: string]
  }

const R = (k: string) => `${SEED_PREFIX}r-${k}`

const visitSeeds: VisitSeed[] = [
  {
    key: 'nopal-quick',
    daysAgo: 1,
    restaurantId: R('nopal'),
    status: 'quick',
    reaction: 'liked',
    dishes: [dish('q1', 'Pollo', null)],
    photo: ['🌮', '#f7b21b', '#e4472b'],
  },
  {
    key: 'azul-quick',
    daysAgo: 3,
    restaurantId: R('azul'),
    status: 'quick',
    reaction: 'loved',
    notes: 'Shrimp tacos with the little crunchy cheese edge!!',
    dishes: [dish('q2', 'Shrimp', null)],
    photo: ['🦐', '#7bc4b8', '#2f7f8f'],
  },
  {
    key: 'chuy-1',
    daysAgo: 6,
    restaurantId: R('chuy'),
    status: 'complete',
    reaction: 'loved',
    rating: 5,
    wouldReturn: true,
    mood: 'craving',
    occasion: 'friends',
    companions: 'Sam & Priya',
    priceTier: 2,
    amountPaid: 34,
    salsaHeat: 3,
    isFavorite: true,
    notes: 'Tortillas get griddled in the birria fat. The consomé for dunking is unreal. Go early, line wraps around the block by 1pm.',
    dishes: [
      dish('c1', 'Birria', 'loved', true, 'Dunk it. Dunk it twice.'),
      dish('c2', 'Campechano', 'liked', false, 'Crispy chorizo bits'),
    ],
    photo: ['🌮', '#e4472b', '#8a1f0f'],
  },
  {
    key: 'esquina-1',
    daysAgo: 12,
    restaurantId: R('esquina'),
    status: 'complete',
    reaction: 'liked',
    rating: 4,
    wouldReturn: true,
    mood: 'rushed',
    occasion: 'lunch-break',
    priceTier: 1,
    amountPaid: 14,
    salsaHeat: 2,
    notes: 'Fast, cheap, solid. Green salsa is the move.',
    dishes: [dish('e1', 'Al pastor', 'loved', true), dish('e2', 'Carnitas', 'liked')],
    photo: ['🌶️', '#8bbf4f', '#3f7a2a'],
  },
  {
    key: 'tigre-1',
    daysAgo: 20,
    restaurantId: R('tigre'),
    status: 'complete',
    reaction: 'loved',
    rating: 4.5,
    wouldReturn: true,
    mood: 'adventurous',
    occasion: 'solo',
    priceTier: 2,
    amountPaid: 22,
    salsaHeat: 4,
    isFavorite: true,
    notes: 'Watched them shave the pineapple off the trompo. Habanero salsa made me cry a little. Worth it.',
    dishes: [
      dish('t1', 'Al pastor', 'loved', true, 'Pineapple on top, always'),
      dish('t2', 'Lengua', 'liked'),
    ],
    photo: ['🍍', '#f7b21b', '#d97a1a'],
  },
  {
    key: 'azul-1',
    daysAgo: 34,
    restaurantId: R('azul'),
    status: 'complete',
    reaction: 'liked',
    rating: 4,
    wouldReturn: true,
    mood: 'cozy',
    occasion: 'road-trip',
    companions: 'Mom',
    priceTier: 2,
    amountPaid: 41,
    salsaHeat: 1,
    notes: 'Beach-day lunch. Fish tacos were crispy and light.',
    dishes: [dish('a1', 'Fish', 'loved', true), dish('a2', 'Shrimp', 'liked')],
    photo: ['🐟', '#7bc4b8', '#2f7f8f'],
  },
  {
    key: 'esquina-2',
    daysAgo: 49,
    restaurantId: R('esquina'),
    status: 'complete',
    reaction: 'meh',
    rating: 2.5,
    wouldReturn: false,
    mood: 'hangry',
    occasion: 'weeknight',
    priceTier: 1,
    amountPaid: 12,
    notes: 'Carne asada was dry. The salsa saved it.',
    dishes: [dish('e3', 'Carne asada', 'meh', false, 'Overcooked')],
    photo: ['🥩', '#c58f5a', '#7a4a2a'],
  },
  {
    key: 'nopal-1',
    daysAgo: 66,
    restaurantId: R('nopal'),
    status: 'complete',
    reaction: 'loved',
    rating: 4.5,
    wouldReturn: true,
    mood: 'celebrating',
    occasion: 'date-night',
    companions: 'Alex',
    priceTier: 3,
    amountPaid: 78,
    salsaHeat: 2,
    isFavorite: true,
    notes: 'Fancier take on tacos. Nopales taco surprised me — smoky and bright. Mezcal margaritas were dangerous.',
    dishes: [dish('n1', 'Veggie', 'loved', true, 'Grilled nopales'), dish('n2', 'Fish', 'liked')],
    photo: ['🌵', '#a9d46a', '#4f8a24'],
  },
  {
    key: 'chuy-2',
    daysAgo: 91,
    restaurantId: R('chuy'),
    status: 'complete',
    reaction: 'liked',
    rating: 4,
    wouldReturn: true,
    mood: 'craving',
    occasion: 'weeknight',
    priceTier: 2,
    amountPaid: 26,
    salsaHeat: 2,
    dishes: [dish('c3', 'Birria', 'liked')],
    notes: 'First visit. Good, but the second time was better — ask for extra consomé.',
    photo: ['🍲', '#e4472b', '#a02a14'],
  },
]

export interface SampleData {
  restaurants: Restaurant[]
  visits: Visit[]
  photos: PhotoDraft[]
}

export async function buildSampleData(): Promise<SampleData> {
  const visits: Visit[] = []
  const photos: PhotoDraft[] = []
  for (const s of visitSeeds) {
    const photoIds: string[] = []
    if (s.photo) {
      const id = `${SEED_PREFIX}photo-${s.key}`
      photos.push({ id, blob: await placeholderPhoto(...s.photo) })
      photoIds.push(id)
    }
    const visitedAt = daysAgoIso(s.daysAgo)
    visits.push({
      id: `${SEED_PREFIX}v-${s.key}`,
      restaurantId: s.restaurantId,
      visitedAt,
      status: s.status,
      reaction: s.reaction,
      rating: s.rating ?? null,
      wouldReturn: s.wouldReturn ?? null,
      mood: s.mood ?? null,
      occasion: s.occasion ?? null,
      companions: s.companions ?? '',
      priceTier: s.priceTier ?? null,
      amountPaid: s.amountPaid ?? null,
      salsaHeat: s.salsaHeat ?? null,
      notes: s.notes ?? '',
      isFavorite: s.isFavorite ?? false,
      dishes: s.dishes,
      photoIds,
      createdAt: visitedAt,
      updatedAt: visitedAt,
      deletedAt: null,
    })
  }
  return { restaurants, visits, photos }
}
