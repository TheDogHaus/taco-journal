import { usePhotoUrl } from '../data/hooks'

/** A stored photo by id, with a playful taco tile when there isn't one. */
export function PhotoImg({ id, alt, className = '' }: { id?: string; alt: string; className?: string }) {
  const url = usePhotoUrl(id)
  if (!url) {
    return (
      <div
        role={id ? undefined : 'img'}
        aria-label={id ? undefined : alt}
        className={`grid place-items-center bg-linear-to-br from-sun-soft to-salsa-soft text-3xl ${className}`}
      >
        <span aria-hidden="true">🌮</span>
      </div>
    )
  }
  return <img src={url} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}
