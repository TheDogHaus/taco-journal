import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { EmptyState, TopBar } from '../../components/PageHeader'
import { PhotoImg } from '../../components/PhotoImg'
import { ReactionBadge } from '../../components/ReactionPicker'
import { StarDisplay } from '../../components/StarRating'
import { useToast } from '../../components/Toast'
import { useDeleteVisit, useUpdateVisit, useVisitViews } from '../../data/hooks'
import { MOODS, OCCASIONS, SALSA_HEAT, optionFor } from '../../lib/constants'
import { formatFullDate } from '../../lib/dates'

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface px-3 py-2">
      <dt className="text-xs font-bold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="font-bold">{children}</dd>
    </div>
  )
}

export function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { views, isLoading } = useVisitViews()
  const update = useUpdateVisit()
  const remove = useDeleteVisit()
  const visit = views.find((v) => v.id === id)

  if (isLoading) return <p className="p-6 text-muted">Loading…</p>
  if (!visit) {
    return (
      <>
        <TopBar title="Not found" />
        <EmptyState emoji="🫓" title="Couldn't find that bite">
          <p>It may have been deleted.</p>
          <Link to="/" className="btn btn-primary mt-5">
            Back to the journal
          </Link>
        </EmptyState>
      </>
    )
  }

  const mood = optionFor(MOODS, visit.mood)
  const occasion = optionFor(OCCASIONS, visit.occasion)
  const heat = SALSA_HEAT.find((h) => h.value === visit.salsaHeat)

  const onDelete = async () => {
    if (!window.confirm(`Delete your visit to ${visit.restaurant.name}? This can't be undone here.`)) return
    await remove.mutateAsync(visit.id)
    toast.show('Visit deleted.')
    navigate('/', { replace: true })
  }

  return (
    <div>
      <TopBar
        title="Your bite"
        right={
          <button
            type="button"
            aria-pressed={visit.isFavorite}
            aria-label={visit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => update.mutate({ id: visit.id, patch: { isFavorite: !visit.isFavorite } })}
            className={`grid size-11 cursor-pointer place-items-center rounded-full border-2 border-ink shadow-[2px_2px_0_var(--shadow)] ${
              visit.isFavorite ? 'bg-salsa-soft text-salsa' : 'bg-surface text-ink'
            }`}
          >
            <Icon name="heart" size={22} filled={visit.isFavorite} />
          </button>
        }
      />

      {visit.photoIds.length > 0 ? (
        <ul className="flex snap-x snap-mandatory overflow-x-auto" aria-label="Photos">
          {visit.photoIds.map((pid, i) => (
            <li key={pid} className="w-full shrink-0 snap-center">
              <PhotoImg id={pid} alt={`Photo ${i + 1} from ${visit.restaurant.name}`} className="aspect-4/3 w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <PhotoImg alt="No photo" className="aspect-4/3 w-full text-6xl" />
      )}

      <div className="space-y-5 px-4 py-5">
        {visit.status === 'quick' && (
          <div className="rounded-3xl border-2 border-ink bg-sun-soft p-4">
            <p className="font-display text-lg font-semibold">Quick bite — details welcome</p>
            <p className="text-sm">You captured this on the go. Add the rating, dishes and the vibe whenever you like.</p>
            <Link to={`/visit/${visit.id}/edit`} className="btn btn-primary btn-sm mt-3">
              Finish entry
            </Link>
          </div>
        )}

        <div>
          <h2 className="font-display text-3xl leading-tight font-bold">
            <Link to={`/restaurant/${visit.restaurantId}`} className="underline decoration-salsa decoration-wavy decoration-2 underline-offset-4">
              {visit.restaurant.name}
            </Link>
          </h2>
          <p className="text-muted">
            {visit.restaurant.city && (
              <>
                <Icon name="pin" size={14} className="mr-1 inline align-[-2px]" />
                {visit.restaurant.city} ·{' '}
              </>
            )}
            {formatFullDate(visit.visitedAt)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {visit.rating && <StarDisplay value={visit.rating} size={24} />}
            <ReactionBadge value={visit.reaction} className="text-base" />
            {visit.wouldReturn !== null && (
              <span className="text-sm font-bold">{visit.wouldReturn ? '↩️ Would go back' : '🚫 Wouldn’t go back'}</span>
            )}
          </div>
        </div>

        {visit.dishes.length > 0 && (
          <section>
            <h3 className="mb-2 font-display text-lg font-semibold">What you ate</h3>
            <ul className="space-y-2">
              {visit.dishes.map((d) => (
                <li key={d.id} className="card flex items-start gap-3 p-3">
                  <span className="text-2xl" aria-hidden="true">
                    🌮
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold">
                      {d.name}
                      {d.orderAgain && (
                        <span className="ml-2 rounded-full bg-lime-soft px-2 py-0.5 align-middle font-body text-xs font-extrabold text-ink">
                          ↻ order again
                        </span>
                      )}
                    </p>
                    {d.notes && <p className="text-sm text-muted">{d.notes}</p>}
                  </div>
                  {d.reaction && <ReactionBadge value={d.reaction} className="shrink-0" />}
                </li>
              ))}
            </ul>
          </section>
        )}

        {visit.notes && (
          <section>
            <h3 className="mb-2 font-display text-lg font-semibold">Notes</h3>
            <p className="whitespace-pre-wrap rounded-3xl border-2 border-line bg-surface p-4">{visit.notes}</p>
          </section>
        )}

        {(mood || occasion || visit.companions || visit.priceTier || visit.amountPaid !== null || heat) && (
          <section>
            <h3 className="mb-2 font-display text-lg font-semibold">The details</h3>
            <dl className="grid grid-cols-2 gap-2">
              {mood && (
                <Fact label="Mood">
                  {mood.emoji} {mood.label}
                </Fact>
              )}
              {occasion && (
                <Fact label="Occasion">
                  {occasion.emoji} {occasion.label}
                </Fact>
              )}
              {visit.companions && <Fact label="With">{visit.companions}</Fact>}
              {(visit.priceTier || visit.amountPaid !== null) && (
                <Fact label="Spent">
                  {visit.priceTier && '$'.repeat(visit.priceTier)}
                  {visit.priceTier && visit.amountPaid !== null && ' · '}
                  {visit.amountPaid !== null && `$${visit.amountPaid.toFixed(2)}`}
                </Fact>
              )}
              {heat && (
                <Fact label="Salsa heat">
                  {'🌶️'.repeat(heat.value)} {heat.label}
                </Fact>
              )}
            </dl>
          </section>
        )}

        <div className="flex gap-3 pt-2">
          <Link to={`/visit/${visit.id}/edit`} className="btn btn-primary flex-1">
            <Icon name="edit" size={18} /> Edit
          </Link>
          <button type="button" className="btn btn-danger" onClick={() => void onDelete()} disabled={remove.isPending}>
            <Icon name="trash" size={18} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
