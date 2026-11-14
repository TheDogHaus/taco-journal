import { isSupabaseConfigured } from '../lib/supabase'
import { localRepository } from './localRepository'
import type { JournalRepository } from './repository'
import { supabaseRepository } from './supabaseRepository'

// Your account's data in Supabase when it is configured, otherwise the local demo store.
export const repo: JournalRepository = isSupabaseConfigured ? supabaseRepository : localRepository
