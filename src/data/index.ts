import { localRepository } from './localRepository'
import type { JournalRepository } from './repository'

// Swap this one line for a Supabase-backed repository when the backend exists.
export const repo: JournalRepository = localRepository
