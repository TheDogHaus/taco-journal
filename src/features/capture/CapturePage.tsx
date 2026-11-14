import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionBar, TopBar } from '../../components/PageHeader'
import { PhotoPicker } from '../../components/PhotoPicker'
import { ReactionPicker } from '../../components/ReactionPicker'
import { RestaurantField } from '../../components/RestaurantField'
import { TacoPicker } from '../../components/TacoPicker'
import { useToast } from '../../components/Toast'
import { useSaveVisit, useVisitViews } from '../../data/hooks'
import type { Dish, PhotoDraft, Reaction } from '../../data/types'
import { newId } from '../../lib/ids'
import { normalize } from '../../lib/stats'

const WIDTH = 'max-w-3xl'

/** Quick capture: the minimum needed to remember a bite, in ~15 seconds. */
export function CapturePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const save = useSaveVisit()
  const { views } = useVisitViews()

  const [photos, setPhotos] = useState<PhotoDraft[]>([])
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [cityTouched, setCityTouched] = useState(false)
  const [reaction, setReaction] = useState<Reaction | null>(null)
  const [tacos, setTacos] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Default to the city of your most recent visit until you type your own.
  const cityValue = cityTouched ? city : (views[0]?.restaurant.city ?? '')

  // A photo is optional for a quick bite; you can add one later when you finish the entry.
  const missing = [!name.trim() && 'the restaurant', !reaction && 'how it was'].filter(Boolean) as string[]

  const toggleTaco = (taco: string) =>
    setTacos((prev) =>
      prev.some((t) => normalize(t) === normalize(taco))
        ? prev.filter((t) => normalize(t) !== normalize(taco))
        : [...prev, taco],
    )

  const onSave = async () => {
    if (!reaction || missing.length) return
    setError(null)
    const dishes: Dish[] = tacos.map((t) => ({ id: newId(), name: t, reaction: null, orderAgain: false, notes: '' }))
    try {
      await save.mutateAsync({
        restaurantName: name,
        city: cityValue,
        visitedAt: new Date().toISOString(),
        status: 'quick',
        reaction,
        rating: null,
        wouldReturn: null,
        mood: null,
        occasion: null,
        companions: '',
        priceTier: null,
        amountPaid: null,
        salsaHeat: null,
        notes: note,
        isFavorite: false,
        dishes,
        photos,
      })
      toast.show('Saved! Add the details later from “To finish”.')
      navigate('/', { replace: true })
    } catch {
      setError("Couldn't save that. Your storage might be full — try removing a photo.")
    }
  }

  return (
    <div className="pb-36">
      <TopBar title="Quick bite 🌮" back="close" widthClass={WIDTH} />
      <div className={`mx-auto w-full space-y-6 px-4 pt-5 md:px-8 md:pt-8 ${WIDTH}`}>
        <div className="space-y-5 md:grid md:grid-cols-2 md:items-start md:gap-8 md:space-y-0">
          <div>
            <p className="label">Photo (optional)</p>
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </div>

          <RestaurantField
            name={name}
            city={cityValue}
            onChange={(v) => {
              setName(v.name)
              setCity(v.city)
              setCityTouched(true)
            }}
          />
        </div>

        <div>
          <p className="label">How was it?</p>
          <ReactionPicker value={reaction} onChange={setReaction} />
        </div>

        <div>
          <p className="label">What did you eat? (optional)</p>
          <TacoPicker selected={tacos} onToggle={toggleTaco} />
        </div>

        <div>
          <label htmlFor="quick-note" className="label">
            One-line note (optional)
          </label>
          <input
            id="quick-note"
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="The salsa verde. Wow."
            maxLength={140}
          />
        </div>
      </div>

      <ActionBar widthClass={WIDTH}>
        {error && (
          <p role="alert" className="text-center text-sm font-bold text-salsa-text md:text-right">
            {error}
          </p>
        )}
        {missing.length > 0 && !error && (
          <p className="text-center text-sm text-muted md:text-right">Still need: {missing.join(', ')}</p>
        )}
        <button
          type="button"
          className="btn btn-primary w-full text-lg md:w-auto md:min-w-56"
          disabled={missing.length > 0 || save.isPending}
          onClick={() => void onSave()}
        >
          {save.isPending ? 'Saving…' : 'Save bite'}
        </button>
      </ActionBar>
    </div>
  )
}
