import { useState } from 'react'
import { TACO_TYPES } from '../lib/constants'
import { normalize } from '../lib/stats'

/** Multi-select taco chips plus a free-text "something else" field. */
export function TacoPicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (name: string) => void
}) {
  const [custom, setCustom] = useState('')
  const isOn = (name: string) => selected.some((s) => normalize(s) === normalize(name))
  const extras = selected.filter((s) => !TACO_TYPES.some((t) => normalize(t) === normalize(s)))

  const addCustom = () => {
    const name = custom.trim()
    if (name && !isOn(name)) onToggle(name)
    setCustom('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Taco types">
        {[...TACO_TYPES, ...extras].map((name) => (
          <button
            key={name}
            type="button"
            className="chip"
            aria-pressed={isOn(name)}
            onClick={() => onToggle(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="field"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Something else? e.g. Tripa"
          aria-label="Add another taco type"
        />
        <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={addCustom} disabled={!custom.trim()}>
          Add
        </button>
      </div>
    </div>
  )
}
