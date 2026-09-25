/**
 * Dates « naïves » : les heures de vol sont exprimées en heure locale de l'aéroport
 * (« AAAA-MM-JJTHH:mm »). Les calculs se font en UTC pour éviter toute dérive liée
 * au fuseau du navigateur.
 */

const MINUTE = 60_000
export const DAY_MS = 86_400_000

const pad = (value: number) => String(value).padStart(2, '0')

/** Date du jour (fuseau du navigateur) au format AAAA-MM-JJ. */
export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Date + heure courantes dans un fuseau UTC+offset, au format local naïf. */
export function nowAtOffset(utcOffsetHours: number, now = Date.now()): string {
  return toLocalString(now + utcOffsetHours * 60 * MINUTE)
}

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

/** « AAAA-MM-JJ » ou « AAAA-MM-JJTHH:mm » → millisecondes (interprétées en UTC). */
export function toMs(value: string): number {
  return Date.parse(value.length === 10 ? `${value}T00:00:00Z` : `${value}:00Z`)
}

/** Millisecondes → « AAAA-MM-JJTHH:mm ». */
export function toLocalString(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16)
}

export function addDays(date: string, days: number): string {
  return new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10)
}

export function addMinutes(dateTime: string, minutes: number): string {
  return toLocalString(toMs(dateTime) + minutes * MINUTE)
}

/** Nombre de jours calendaires de a vers b. */
export function diffDays(a: string, b: string): number {
  return Math.round((toMs(b.slice(0, 10)) - toMs(a.slice(0, 10))) / DAY_MS)
}

export function diffMinutes(a: string, b: string): number {
  return Math.round((toMs(b) - toMs(a)) / MINUTE)
}

export function datePart(dateTime: string): string {
  return dateTime.slice(0, 10)
}

export function timePart(dateTime: string): string {
  return dateTime.slice(11, 16)
}

export function isWeekend(date: string): boolean {
  const day = new Date(toMs(date)).getUTCDay()
  return day === 5 || day === 6 || day === 0
}

export function roundTo(minutes: number, step = 5): number {
  return Math.round(minutes / step) * step
}
