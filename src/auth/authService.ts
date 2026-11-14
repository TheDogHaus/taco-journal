import { newId } from '../lib/ids'

export interface User {
  id: string
  name: string
  email: string
}

export type AuthField = 'name' | 'email' | 'password' | 'currentPassword'

/** An error that can be shown next to a specific form field. */
export class AuthError extends Error {
  field?: AuthField
  constructor(message: string, field?: AuthField) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

export interface SignUpResult {
  /** null when the person must confirm their email before they can sign in */
  user: User | null
  needsEmailConfirmation: boolean
}

/**
 * The only surface the UI uses for accounts. Two implementations exist:
 * supabaseAuthService.ts (real accounts) and localAuthService below (demo
 * mode, used when Supabase env values are missing). auth/index.ts picks one.
 */
export interface AuthService {
  getSession(): Promise<User | null>
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<SignUpResult>
  signOut(): Promise<void>
  requestPasswordReset(email: string): Promise<void>
  /** Sets a new password for the signed-in person (used after a reset link). */
  updatePassword(password: string): Promise<void>
  /** For a signed-in person: checks their current password, then sets the new one. */
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  /** Called whenever the signed-in person changes. Returns an unsubscribe function. */
  onChange(callback: (user: User | null) => void): () => void
  /** Called when the person arrives from a "reset your password" email link. */
  onPasswordRecovery(callback: () => void): () => void
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
    return { user, needsEmailConfirmation: false }
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

  async updatePassword(_password) {
    await wait()
  },

  async changePassword(_currentPassword, _newPassword) {
    // Demo mode never stores passwords, so there is nothing to check or change.
    await wait()
  },

  onChange() {
    return () => {}
  },

  onPasswordRecovery() {
    return () => {}
  },
}
