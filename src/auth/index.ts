import { isSupabaseConfigured } from '../lib/supabase'
import { localAuthService } from './authService'
import type { AuthService } from './authService'
import { supabaseAuthService } from './supabaseAuthService'

// Real accounts when Supabase is configured, otherwise the local demo.
export const authService: AuthService = isSupabaseConfigured ? supabaseAuthService : localAuthService
