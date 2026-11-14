import type { AuthError as SupabaseAuthError, User as SupabaseUser } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'
import { AuthError } from './authService'
import type { AuthService, User } from './authService'

function toUser(u: SupabaseUser): User {
  const email = u.email ?? ''
  const metaName = typeof u.user_metadata?.name === 'string' ? u.user_metadata.name.trim() : ''
  return { id: u.id, email, name: metaName || email.split('@')[0] || 'Taco fan' }
}

/** Turns a Supabase error into a friendly message, attached to a field when it fits one. */
function friendly(error: SupabaseAuthError): AuthError {
  switch (error.code) {
    case 'invalid_credentials':
      return new AuthError("That email and password don't match.", 'password')
    case 'email_not_confirmed':
      return new AuthError('Please confirm your email first. Check your inbox for the link.', 'email')
    case 'user_already_exists':
    case 'email_exists':
      return new AuthError('An account with this email already exists. Try signing in instead.', 'email')
    case 'email_address_invalid':
      return new AuthError("That email address doesn't look right.", 'email')
    case 'weak_password':
      return new AuthError('Choose a stronger password (at least 8 characters).', 'password')
    case 'same_password':
      return new AuthError('Choose a different password from your current one.', 'password')
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return new AuthError('Too many attempts. Please wait a minute and try again.')
    case 'signup_disabled':
      return new AuthError('New sign-ups are turned off for this project.')
    default:
      return new AuthError(error.message || 'Something went wrong. Please try again.')
  }
}

export const supabaseAuthService: AuthService = {
  async getSession() {
    const { data } = await getSupabase().auth.getSession()
    return data.session?.user ? toUser(data.session.user) : null
  },

  async signIn(email, password) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw friendly(error)
    return toUser(data.user)
  },

  async signUp(name, email, password) {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
    })
    if (error) throw friendly(error)
    // With email confirmation on, an existing address comes back as a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      throw new AuthError('An account with this email already exists. Try signing in instead.', 'email')
    }
    if (!data.session || !data.user) return { user: null, needsEmailConfirmation: true }
    return { user: toUser(data.user), needsEmailConfirmation: false }
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw friendly(error)
  },

  async requestPasswordReset(email) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw friendly(error)
  },

  async updatePassword(password) {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw friendly(error)
  },

  async changePassword(currentPassword, newPassword) {
    const sb = getSupabase()
    const { data } = await sb.auth.getSession()
    const email = data.session?.user.email
    if (!email) throw new AuthError('Please sign in again to change your password.')

    // Prove it's really them: signing in with the current password is the check.
    const { error: verifyError } = await sb.auth.signInWithPassword({ email, password: currentPassword })
    if (verifyError) {
      if (verifyError.code === 'invalid_credentials') {
        throw new AuthError("That isn't your current password.", 'currentPassword')
      }
      throw friendly(verifyError)
    }

    const { error } = await sb.auth.updateUser({ password: newPassword })
    if (error) throw friendly(error)
  },

  onPasswordRecovery(callback) {
    const { data } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') callback()
    })
    return () => data.subscription.unsubscribe()
  },

  onChange(callback) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      // Keep this synchronous: calling Supabase from inside this callback can deadlock.
      callback(session?.user ? toUser(session.user) : null)
    })
    return () => data.subscription.unsubscribe()
  },
}
