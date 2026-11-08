import type { JournalSnapshot, SaveVisitInput, Visit } from './types'

/**
 * The only surface the UI uses to read/write data. Today it is backed by
 * localStorage + IndexedDB (localRepository.ts). Later, a Supabase
 * implementation of this same interface can replace it in data/index.ts.
 */
export interface JournalRepository {
  load(): Promise<JournalSnapshot>
  saveVisit(input: SaveVisitInput): Promise<Visit>
  updateVisit(id: string, patch: Partial<Pick<Visit, 'isFavorite'>>): Promise<void>
  deleteVisit(id: string): Promise<void>
  getPhoto(id: string): Promise<Blob | undefined>
  loadSampleData(): Promise<void>
  exportData(): Promise<string>
  clearAll(): Promise<void>
}
