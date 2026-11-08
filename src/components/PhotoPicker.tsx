import { useRef, useState } from 'react'
import { useBlobUrl } from '../data/hooks'
import type { PhotoDraft } from '../data/types'
import { MAX_PHOTOS } from '../lib/constants'
import { newId } from '../lib/ids'
import { compressImage } from '../lib/image'
import { Icon } from './Icon'

function Thumb({ photo, onRemove, index }: { photo: PhotoDraft; onRemove: () => void; index: number }) {
  const url = useBlobUrl(photo.blob)
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-ink bg-line">
      {url && <img src={url} alt={`Photo ${index + 1}`} className="size-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove photo ${index + 1}`}
        className="absolute top-1 right-1 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-ink bg-surface text-ink"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}

export function PhotoPicker({
  photos,
  onChange,
}: {
  photos: PhotoDraft[]
  onChange: (photos: PhotoDraft[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const room = MAX_PHOTOS - photos.length

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    setBusy(true)
    try {
      const picked = Array.from(files).slice(0, room)
      const added: PhotoDraft[] = []
      for (const file of picked) {
        added.push({ id: newId(), blob: await compressImage(file) })
      }
      onChange([...photos, ...added])
      if (files.length > room) setError(`Only ${MAX_PHOTOS} photos per visit — kept the first ${room}.`)
    } catch {
      setError("Couldn't read that photo. Try a different one?")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
        aria-label="Add photos"
      />

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink bg-sun-soft font-display text-lg font-semibold text-ink"
        >
          <Icon name="camera" size={36} />
          {busy ? 'Processing…' : 'Snap or choose your tacos'}
          <span className="text-sm font-normal text-muted">Up to {MAX_PHOTOS} photos</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {photos.map((p, i) => (
            <Thumb
              key={p.id}
              photo={p}
              index={i}
              onRemove={() => onChange(photos.filter((x) => x.id !== p.id))}
            />
          ))}
          {room > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-label="Add another photo"
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink bg-sun-soft text-sm font-bold text-ink"
            >
              <Icon name="plus" size={24} />
              {busy ? '…' : `${photos.length}/${MAX_PHOTOS}`}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-salsa-text">
          {error}
        </p>
      )}
    </div>
  )
}
