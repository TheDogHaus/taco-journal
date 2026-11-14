import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/**
 * True when both env values are set (see .env.example). When false, the app
 * falls back to the local demo mode so a fresh clone still runs.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey)

let client: SupabaseClient | undefined

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  // The publishable key is designed to be public; row level security protects the data.
  return (client ??= createClient(url!, publishableKey!))
}
