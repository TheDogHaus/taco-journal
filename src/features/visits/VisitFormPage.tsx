import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, TopBar } from '../../components/PageHeader'
import { useVisitViews } from '../../data/hooks'
import { repo } from '../../data'
import type { PhotoDraft } from '../../data/types'
import { VisitForm } from './VisitForm'

/** Route wrapper: /visit/new (blank) and /visit/:id/edit (loads photos first). */
export function VisitFormPage() {
  const { id } = useParams()
  const { views, isLoading } = useVisitViews()
  const existing = id ? views.find((v) => v.id === id) : undefined

  const photos = useQuery({
    queryKey: ['photos', existing?.id, existing?.photoIds.join(',')],
    enabled: !!existing,
    gcTime: 0,
    queryFn: async (): Promise<PhotoDraft[]> => {
      const loaded = await Promise.all(
        (existing?.photoIds ?? []).map(async (pid) => ({ id: pid, blob: await repo.getPhoto(pid) })),
      )
      return loaded.filter((p): p is PhotoDraft => !!p.blob)
    },
  })

  if (!id) return <VisitForm />

  if (isLoading || (existing && photos.isLoading)) {
    return <p className="p-6 text-muted">Loading…</p>
  }
  if (!existing) {
    return (
      <>
        <TopBar title="Not found" back="close" />
        <EmptyState emoji="🫓" title="Couldn't find that bite">
          <Link to="/" className="btn btn-primary mt-5">
            Back to the journal
          </Link>
        </EmptyState>
      </>
    )
  }
  return <VisitForm key={existing.id} existing={existing} initialPhotos={photos.data ?? []} />
}
