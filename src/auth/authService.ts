import { newId } from '../lib/ids'

export interface User {
  id: string
  name: string
  email: string
}

export type AuthField = 'name' | 'email' | 'password'

/** An error that can be shown next to a specific form field. */
export class AuthError extends Error {
  field?: AuthField
  constructor(message: string, field?: AuthField) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

/**
 * The only surface the UI uses for accounts. Today it is a local demo
 * (localAuthService below). Later, a Supabase implementation of this same
 * interface (supabase.auth.signUp / signInWithPassword / signOut /
 * resetPasswordForEmail / getSession) can replace it in auth/index.ts.
 */
export interface AuthService {
  getSession(): Promise<User | null>
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<User>
  signOut(): Promise<void>
  requestPasswordReset(email: string): Promise<void>
}

// ---- local demo implementation ---------------------------------------------
// Demo only: accounts live in this browser and passwords are NOT stored or
// checked. Do not reuse this for anything real.

const ACCOUNTS_KEY = 'taco-journal:auth:accounts'
const SESSION_KEY = 'taco-journal:auth:session'

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))
const normalizeEmail = (email: string) => email.trim().toLowerCase()

function readAccounts(): User[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as User[]
  } catch {
    return []
  }
}

export const localAuthService: AuthService = {
  async getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  },

  async signUp(name, email, _password) {
    await wait()
    const accounts = readAccounts()
    const normalized = normalizeEmail(email)
    if (accounts.some((a) => a.email === normalized)) {
      throw new AuthError('An account with this email already exists. Try signing in instead.', 'email')
    }
    const user: User = { id: newId(), name: name.trim(), email: normalized }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, user]))
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signIn(email, _password) {
    await wait()
    const user = readAccounts().find((a) => a.email === normalizeEmail(email))
    if (!user) {
      throw new AuthError("We couldn't find an account with that email. Want to create one?", 'email')
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signOut() {
    localStorage.removeItem(SESSION_KEY)
  },

  async requestPasswordReset(_email) {
    // Real services answer the same way whether or not the email exists.
    await wait()
  },
}
