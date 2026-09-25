import { useOutletContext } from 'react-router'
import type { Booking } from '@/types/booking'
import type { AppNotification, User } from '@/types/user'
import { todayIso } from '@/utils/date'

export interface AccountData {
  user: User
  bookings: Booking[]
  bookingsLoading: boolean
  notifications: AppNotification[]
  unread: number
  refresh: () => void
  markRead: (ids: string[]) => Promise<void>
  markAllRead: () => Promise<void>
}

/** Données de l'espace client partagées par toutes les sous-pages (contexte d'Outlet). */
export function useAccountData(): AccountData {
  return useOutletContext<AccountData>()
}

export function firstDeparture(booking: Booking): string {
  return booking.legs[0]?.segments[0]?.departure ?? ''
}

/** Voyages à venir (confirmés ou en attente), du plus proche au plus lointain. */
export function upcomingBookings(bookings: Booking[]): Booking[] {
  const today = todayIso()
  return bookings
    .filter((booking) => (booking.status === 'confirmed' || booking.status === 'pending') && firstDeparture(booking).slice(0, 10) >= today)
    .sort((a, b) => firstDeparture(a).localeCompare(firstDeparture(b)))
}

/** Voyages effectués ou passés, du plus récent au plus ancien. */
export function pastBookings(bookings: Booking[]): Booking[] {
  const today = todayIso()
  return bookings
    .filter((booking) => booking.status === 'completed' || booking.status === 'cancelled' || firstDeparture(booking).slice(0, 10) < today)
    .sort((a, b) => firstDeparture(b).localeCompare(firstDeparture(a)))
}
