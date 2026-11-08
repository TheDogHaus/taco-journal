import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { repo } from './index'
import type { Restaurant, SaveVisitInput, Visit, VisitView } from './types'

const JOURNAL_KEY = ['journal'] as const

export function useJournal() {
  return useQuery({ queryKey: JOURNAL_KEY, queryFn: () => repo.load() })
}

/** Visits joined with their restaurant, newest first. */
export function useVisitViews(): { views: VisitView[]; restaurants: Restaurant[]; isLoading: boolean } {
  const { data, isLoading } = useJournal()
  const joined = useMemo(() => {
    const restaurants = data?.restaurants ?? []
    const byId = new Map(restaurants.map((r) => [r.id, r]))
    const views = (data?.visits ?? []).flatMap((v) => {
      const restaurant = byId.get(v.restaurantId)
      return restaurant ? [{ ...v, restaurant }] : []
    })
    return { views, restaurants }
  }, [data])
  return { ...joined, isLoading }
}

function useRefreshJournal() {
  const qc = useQueryClient()
  // Returning the promise makes mutateAsync wait for fresh data.
  return () => qc.invalidateQueries({ queryKey: JOURNAL_KEY })
}

export function useSaveVisit() {
  const refresh = useRefreshJournal()
  return useMutation({ mutationFn: (input: SaveVisitInput) => repo.saveVisit(input), onSuccess: refresh })
}

export function useUpdateVisit() {
  const refresh = useRefreshJournal()
  return useMutation({
    mutationFn: (args: { id: string; patch: Partial<Pick<Visit, 'isFavorite'>> }) =>
      repo.updateVisit(args.id, args.patch),
    onSuccess: refresh,
  })
}

export function useDeleteVisit() {
  const refresh = useRefreshJournal()
  return useMutation({ mutationFn: (id: string) => repo.deleteVisit(id), onSuccess: refresh })
}

export function useLoadSampleData() {
  const refresh = useRefreshJournal()
  return useMutation({ mutationFn: () => repo.loadSampleData(), onSuccess: refresh })
}

export function useClearAll() {
  const refresh = useRefreshJournal()
  return useMutation({ mutationFn: () => repo.clearAll(), onSuccess: refresh })
}

// ---- photos ----------------------------------------------------------------

const urlCache = new Map<string, string>()

/** Object URL for a stored photo id (cached for the life of the page). */
export function usePhotoUrl(id: string | undefined): string | undefined {
  const [loaded, setLoaded] = useState<{ id: string; url: string }>()
  const cached = id ? urlCache.get(id) : undefined
  useEffect(() => {
    if (!id || urlCache.has(id)) return
    let cancelled = false
    repo.getPhoto(id).then((blob) => {
      if (cancelled || !blob) return
      const created = URL.createObjectURL(blob)
      urlCache.set(id, created)
      setLoaded({ id, url: created })
    })
    return () => {
      cancelled = true
    }
  }, [id])
  return cached ?? (loaded && loaded.id === id ? loaded.url : undefined)
}

/** Object URL for an in-memory blob (photos picked but not yet saved). */
export function useBlobUrl(blob: Blob): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const created = URL.createObjectURL(blob)
    setUrl(created)
    return () => URL.revokeObjectURL(created)
  }, [blob])
  return url
}
