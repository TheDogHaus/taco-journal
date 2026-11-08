import { localAuthService } from './authService'
import type { AuthService } from './authService'

// Swap this one line for a Supabase-backed AuthService when the backend exists.
export const authService: AuthService = localAuthService
