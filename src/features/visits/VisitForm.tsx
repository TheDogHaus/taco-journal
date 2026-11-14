import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Section, TopBar } from '../../components/PageHeader'
import { PhotoPicker } from '../../components/PhotoPicker'
import { ReactionPicker } from '../../components/ReactionPicker'
import { RestaurantField } from '../../components/RestaurantField'
import { StarRating } from '../../components/StarRating'
import { TacoPicker } from '../../components/TacoPicker'
import { useToast } from '../../components/Toast'
import { useSaveVisit } from '../../data/hooks'
import type { Dish, PhotoDraft, PriceTier, Reaction, SalsaHeat, VisitView } from '../../data/types'
import { MOODS, OCCASIONS, PRICE_TIERS, REACTIONS, SALSA_HEAT } from '../../lib/constants'
import { isoFromDateInput, toDateInput } from '../../lib/dates'
import { newId } from '../../lib/ids'
import { normalize } from '../../lib/stats'

interface FormState {
  name: string
  city: string
  date: string
  photos: PhotoDraft[]
  reaction: Reaction | null
  rating: number | null
  wouldReturn: boolean | null
  dishes: Dish[]
  mood: string | null
  occasion: string | null
  companions: string
  salsaHeat: SalsaHeat | null
  priceTier: PriceTier | null
  amountPaid: string
  notes: string
  isFavorite: boolean
}

function initialState(existing: VisitView | undefined, photos: PhotoDraft[]): FormState {
  if (!existing) {
    return {
      name: '',
      city: '',
      date: toDateInput(new Date().toISOString()),
      photos: [],
      reaction: null,
      rating: null,
      wouldReturn: null,
      dishes: [],
      mood: null,
      occasion: null,
      companions: '',
      salsaHeat: null,
      priceTier: null,
      amountPaid: '',
      notes: '',
      isFavorite: false,
    }
  }
  return {
    name: existing.restaurant.name,
    city: existing.restaurant.city,
    date: toDateInput(existing.visitedAt),
    photos,
    reaction: existing.reaction,
    rating: existing.rating,
    wouldReturn: existing.wouldReturn,
    dishes: existing.dishes,
    mood: existing.mood,
    occasion: existing.occasion,
    companions: existing.companions,
    salsaHeat: existing.salsaHeat,
    priceTier: existing.priceTier,
    amountPaid: existing.amountPaid !== null ? String(existing.amountPaid) : '',
    notes: existing.notes,
    isFavorite: existing.isFavorite,
  }
}

/** Single-select chip group; tap the selected chip again to clear it. */
function ChipChoice<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; emoji?: string }[]
  value: T | null
  onChange: (v: T | null) => void
  label: string
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="chip"
          aria-pressed={value === o.value}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.emoji && <span aria-hidden="true">{o.emoji}</span>}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function VisitForm({
  existing,
  initialPhotos = [],
}: {
  existing?: VisitView
  initialPhotos?: PhotoDraft[]
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const save = useSaveVisit()
  const [s, setS] = useState<FormState>(() => initialState(existing, initialPhotos))
  const [error, setError] = useState<string | null>(null)
  const [today] = useState(() => toDateInput(new Date().toISOString()))
  const patch =(p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }))

  // Photos are optional; only the restaurant and the reaction are required.
  const missing = [!s.name.trim() && 'the restaurant', !s.reaction && 'how it was'].filter(Boolean) as string[]

  const toggleDish = (name: string) => {
    const has = s.dishes.some((d) => normalize(d.name) === normalize(name))
    patch({
      dishes: has
        ? s.dishes.filter((d) => normalize(d.name) !== normalize(name))
        : [...s.dishes, { id: newId(), name, reaction: null, orderAgain: false, notes: '' }],
    })
  }
  const updateDish = (id: string, p: Partial<Dish>) =>
    patch({ dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...p } : d)) })

  // Fixed at mount so the heading doesn't flip to "Edit" while the save completes.
  const [title] = useState(() =>
    !existing ? 'New entry' : existing.status === 'quick' ? 'Finish entry' : 'Edit entry',
  )

  const onSave = async () => {
    if (!s.reaction || missing.length) return
    setError(null)
    const amount = s.amountPaid.trim() === '' ? null : Number(s.amountPaid)
    try {
      const saved = await save.mutateAsync({
        id: existing?.id,
        restaurantName: s.name,
        city: s.city,
        visitedAt: isoFromDateInput(s.date, existing?.visitedAt),
        status: 'complete',
        reaction: s.reaction,
        rating: s.rating,
        wouldReturn: s.wouldReturn,
        mood: s.mood,
        occasion: s.occasion,
        companions: s.companions,
        priceTier: s.priceTier,
        amountPaid: amount !== null && Number.isFinite(amount) && amount >= 0 ? amount : null,
        salsaHeat: s.salsaHeat,
        notes: s.notes,
        isFavorite: s.isFavorite,
        dishes: s.dishes,
        photos: s.photos,
      })
      toast.show(existing ? 'Entry updated.' : 'Entry saved. Nice one!')
      navigate(`/visit/${saved.id}`, { replace: true })
    } catch {
      setError("Couldn't save that. Your storage might be full — try removing a photo.")
    }
  }

  return (
    <div className="pb-44">
      <TopBar title={title} back="close" />
      <div className="space-y-4 px-4 pt-4">
        <Section emoji="📸" title="Photos" hint="Optional, up to three.">
          <PhotoPicker photos={s.photos} onChange={(photos) => patch({ photos })} />
        </Section>

        <Section emoji="📍" title="The spot">
          <RestaurantField
            name={s.name}
            city={s.city}
            onChange={(v) => patch({ name: v.name, city: v.city })}
            excludeVisitId={existing?.id}
          />
          <div>
            <label htmlFor="visit-date" className="label">
              When
            </label>
            <input
              id="visit-date"
              type="date"
              className="field"
              value={s.date}
              max={today}
              onChange={(e) => e.target.value && patch({ date: e.target.value })}
            />
          </div>
        </Section>

        <Section emoji="⭐" title="The verdict">
          <div>
            <p className="label">How was it?</p>
            <ReactionPicker value={s.reaction} onChange={(reaction) => patch({ reaction })} />
          </div>
          <div>
            <p className="label">Star rating (half stars welcome)</p>
            <StarRating value={s.rating} onChange={(rating) => patch({ rating })} />
          </div>
          <div>
            <p className="label">Would you go back?</p>
            <ChipChoice
              label="Would you go back?"
              value={s.wouldReturn === null ? null : s.wouldReturn ? 'yes' : 'no'}
              options={[
                { value: 'yes', label: 'Yes, definitely', emoji: '↩️' },
                { value: 'no', label: 'Nope', emoji: '🚫' },
              ]}
              onChange={(v) => patch({ wouldReturn: v === null ? null : v === 'yes' })}
            />
          </div>
        </Section>

        <Section emoji="🌮" title="What you ate">
          <TacoPicker selected={s.dishes.map((d) => d.name)} onToggle={toggleDish} />
          {s.dishes.length > 0 && (
            <ul className="space-y-3">
              {s.dishes.map((d) => (
                <li key={d.id} className="space-y-2.5 rounded-2xl border-2 border-line bg-bg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold">{d.name}</p>
                    <button
                      type="button"
                      className="grid size-9 cursor-pointer place-items-center rounded-full text-muted"
                      aria-label={`Remove ${d.name}`}
                      onClick={() => toggleDish(d.name)}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={`Rate ${d.name}`}>
                    {REACTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className="chip"
                        aria-pressed={d.reaction === r.value}
                        onClick={() => updateDish(d.id, { reaction: d.reaction === r.value ? null : r.value })}
                      >
                        <span aria-hidden="true">{r.emoji}</span>
                        <span className="sr-only">{r.label}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="chip"
                      aria-pressed={d.orderAgain}
                      onClick={() => updateDish(d.id, { orderAgain: !d.orderAgain })}
                    >
                      ↻ Order again
                    </button>
                  </div>
                  <input
                    className="field"
                    value={d.notes}
                    onChange={(e) => updateDish(d.id, { notes: e.target.value })}
                    placeholder="Tortilla, toppings, salsa…"
                    aria-label={`Notes on ${d.name}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section emoji="💭" title="The vibe">
          <div>
            <p className="label">Mood</p>
            <ChipChoice label="Mood" options={MOODS} value={s.mood} onChange={(mood) => patch({ mood })} />
          </div>
          <div>
            <p className="label">Occasion</p>
            <ChipChoice
              label="Occasion"
              options={OCCASIONS}
              value={s.occasion}
              onChange={(occasion) => patch({ occasion })}
            />
          </div>
          <div>
            <label htmlFor="companions" className="label">
              Who were you with?
            </label>
            <input
              id="companions"
              className="field"
              value={s.companions}
              onChange={(e) => patch({ companions: e.target.value })}
              placeholder="Just me, or names…"
            />
          </div>
          <div>
            <p className="label">Salsa heat</p>
            <ChipChoice
              label="Salsa heat"
              options={SALSA_HEAT.map((h) => ({ ...h, emoji: '🌶️'.repeat(h.value) }))}
              value={s.salsaHeat}
              onChange={(salsaHeat) => patch({ salsaHeat })}
            />
          </div>
        </Section>

        <Section emoji="💸" title="The damage">
          <ChipChoice
            label="Price range"
            options={PRICE_TIERS.map((t) => ({ value: t, label: '$'.repeat(t) }))}
            value={s.priceTier}
            onChange={(priceTier) => patch({ priceTier })}
          />
          <div>
            <label htmlFor="amount" className="label">
              Total spent (optional)
            </label>
            <input
              id="amount"
              className="field"
              inputMode="decimal"
              value={s.amountPaid}
              onChange={(e) => patch({ amountPaid: e.target.value.replace(/[^0-9.]/g, '') })}
              placeholder="$0.00"
            />
          </div>
        </Section>

        <Section emoji="📝" title="Notes">
          <textarea
            className="field min-h-32"
            value={s.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="What made it memorable? The line, the smell, the salsa, the first bite…"
            aria-label="Notes"
          />
          <button
            type="button"
            aria-pressed={s.isFavorite}
            className="chip"
            onClick={() => patch({ isFavorite: !s.isFavorite })}
          >
            <Icon name="heart" size={16} filled={s.isFavorite} /> Favorite spot
          </button>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t-2 border-line bg-bg/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        {error && (
          <p role="alert" className="mb-2 text-center text-sm font-bold text-salsa-text">
            {error}
          </p>
        )}
        {missing.length > 0 && !error && (
          <p className="mb-2 text-center text-sm text-muted">Still need: {missing.join(', ')}</p>
        )}
        <button
          type="button"
          className="btn btn-primary w-full text-lg"
          disabled={missing.length > 0 || save.isPending}
          onClick={() => void onSave()}
        >
          {save.isPending ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </div>
  )
}
