import { SITE } from '@/config/site'
import { toMs } from './date'

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: SITE.currency,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

/** 115000 → « 115 000 DJF ». */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

const dateFormatters = {
  short: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  medium: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
  long: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  dayMonth: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
  monthYear: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  weekday: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' }),
}

export type DateStyle = keyof typeof dateFormatters

/** Formate une date « AAAA-MM-JJ » (ou date-heure naïve) en français. */
export function formatDate(value: string, style: DateStyle = 'medium'): string {
  if (!value) return ''
  return dateFormatters[style].format(new Date(toMs(value.slice(0, 10))))
}

/** « 2026-10-12T08:55 » → « 08:55 ». */
export function formatTime(dateTime: string): string {
  return dateTime.slice(11, 16)
}

/** 345 → « 5 h 45 ». */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

/** Date ISO (horodatage réel) → « il y a 3 heures ». */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 60) return relative.format(seconds, 'second')
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour')
  if (abs < 2_592_000) return relative.format(Math.round(seconds / 86_400), 'day')
  return relative.format(Math.round(seconds / 2_592_000), 'month')
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`
}

/** Initiales pour les avatars. */
export function initials(firstName: string, lastName = ''): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase()
}

/** Supprime accents et casse (comparaisons de noms, recherche d'aéroports). */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
