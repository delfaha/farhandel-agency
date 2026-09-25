export type FieldErrors<K extends string = string> = Partial<Record<K, string>>

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/** Numéro international ou local : 8 à 15 chiffres, espaces, tirets et « + » tolérés. */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[\s().-]/g, '')
  return /^\+?\d{8,15}$/.test(digits)
}

/** Numéro de réservation (PNR) : 6 caractères alphanumériques. */
export function normalizePnr(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

export function isPnr(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalizePnr(value))
}

/** « tk686 », « TK-686 » → « TK 686 ». */
export function normalizeFlightNumber(value: string): string {
  const compact = value.replace(/[\s-]/g, '').toUpperCase()
  const match = compact.match(/^([A-Z0-9]{2})(\d{1,4})$/)
  return match ? `${match[1]} ${match[2]}` : compact
}

export function isFlightNumber(value: string): boolean {
  return /^[A-Z0-9]{2} \d{1,4}$/.test(normalizeFlightNumber(value))
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  checks: { length: boolean; lower: boolean; upper: boolean; digit: boolean; symbol: boolean }
}

export function passwordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  const score = (!password ? 0 : !checks.length ? 1 : Math.min(4, Math.max(1, passed - 1))) as PasswordStrength['score']
  const labels = ['—', 'Faible', 'Moyen', 'Bon', 'Excellent']
  return { score, label: labels[score], checks }
}

/** Mot de passe accepté : 8 caractères minimum, avec minuscule, majuscule et chiffre. */
export function isStrongEnough(password: string): boolean {
  const { checks } = passwordStrength(password)
  return checks.length && checks.lower && checks.upper && checks.digit
}

/**
 * Valide un formulaire : les erreurs sont appliquées de façon synchrone (flushSync côté appelant)
 * puis le focus est placé sur le premier champ en erreur, dans l'ordre du DOM.
 */
export function focusFirstError(form: HTMLFormElement | null): void {
  form?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus()
}
