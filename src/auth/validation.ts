export const MIN_PASSWORD_LENGTH = 8

export function validateEmail(email: string): string | undefined {
  const value = email.trim()
  if (!value) return 'Enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'That email doesn’t look right.'
  return undefined
}

export function validatePassword(password: string, { forNewAccount = false } = {}): string | undefined {
  if (!password) return 'Enter your password.'
  if (forNewAccount && password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return undefined
}

export function validateName(name: string): string | undefined {
  return name.trim() ? undefined : 'Tell us what to call you.'
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name
