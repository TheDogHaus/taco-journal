import type { PriceTier, Reaction, SalsaHeat } from '../data/types'

export const MAX_PHOTOS = 3

export interface Option {
  value: string
  emoji: string
  label: string
}

export const REACTIONS: { value: Reaction; emoji: string; label: string }[] = [
  { value: 'loved', emoji: '🤤', label: 'Loved it' },
  { value: 'liked', emoji: '😋', label: 'Pretty good' },
  { value: 'meh', emoji: '😐', label: 'Meh' },
]

/** Rating used in stats when a visit only has a quick reaction. */
export const REACTION_RATING: Record<Reaction, number> = { loved: 5, liked: 3.5, meh: 2 }

export const TACO_TYPES = [
  'Al pastor',
  'Carnitas',
  'Carne asada',
  'Birria',
  'Barbacoa',
  'Lengua',
  'Suadero',
  'Chorizo',
  'Pollo',
  'Fish',
  'Shrimp',
  'Veggie',
  'Campechano',
  'Cabeza',
]

export const MOODS: Option[] = [
  { value: 'craving', emoji: '🤤', label: 'Craving' },
  { value: 'celebrating', emoji: '🎉', label: 'Celebrating' },
  { value: 'adventurous', emoji: '🧭', label: 'Adventurous' },
  { value: 'cozy', emoji: '🧣', label: 'Cozy' },
  { value: 'rushed', emoji: '⏱️', label: 'Rushed' },
  { value: 'hangry', emoji: '😤', label: 'Hangry' },
]

export const OCCASIONS: Option[] = [
  { value: 'weeknight', emoji: '🌙', label: 'Weeknight' },
  { value: 'date-night', emoji: '💕', label: 'Date night' },
  { value: 'lunch-break', emoji: '🥪', label: 'Lunch break' },
  { value: 'late-night', emoji: '🦉', label: 'Late night' },
  { value: 'friends', emoji: '🧑‍🤝‍🧑', label: 'With friends' },
  { value: 'family', emoji: '🏠', label: 'Family' },
  { value: 'road-trip', emoji: '🚗', label: 'Road trip' },
  { value: 'solo', emoji: '🎧', label: 'Solo treat' },
]

export const SALSA_HEAT: { value: SalsaHeat; label: string }[] = [
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hot' },
  { value: 4, label: 'Fire!' },
]

export const PRICE_TIERS: PriceTier[] = [1, 2, 3, 4]

export function optionFor<T extends { value: string | number }>(list: T[], value: T['value'] | null): T | undefined {
  return value === null ? undefined : list.find((o) => o.value === value)
}

export function optionLabel(list: Option[], value: string | null): string {
  return optionFor(list, value)?.label ?? ''
}
