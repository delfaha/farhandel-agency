/**
 * « Base de données » de démonstration persistée dans le navigateur (localStorage).
 * Elle sera remplacée par le backend : aucune donnée ne quitte l'appareil du visiteur.
 */
import type { Booking, ServiceType } from '@/types/booking'
import type { AppNotification, Session, User } from '@/types/user'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

export interface StoredUser {
  user: User
  salt: string
  hash: string
}

export interface StoredMessage {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

function collection<T>(key: string) {
  return {
    all: (): T[] => readStorage<T[]>(key, []),
    save: (items: T[]) => writeStorage(key, items),
  }
}

export const db = {
  users: collection<StoredUser>('users'),
  bookings: collection<Booking>('bookings'),
  notifications: collection<AppNotification>('notifications'),
  messages: collection<StoredMessage>('messages'),

  /** Services demandés sur une réservation existante (surcouche, y compris sur les réservations de démo). */
  serviceRequests: {
    all: (): Record<string, ServiceType[]> => readStorage<Record<string, ServiceType[]>>('service-requests', {}),
    save: (value: Record<string, ServiceType[]>) => writeStorage('service-requests', value),
  },

  readNotifications: {
    get: (userId: string): string[] => readStorage<string[]>(`notifications-read:${userId}`, []),
    save: (userId: string, ids: string[]) => writeStorage(`notifications-read:${userId}`, ids),
  },

  session: {
    get(): Session | null {
      return readStorage<Session | null>('session', null, 'local') ?? readStorage<Session | null>('session', null, 'session')
    },
    save(session: Session) {
      removeStorage('session', 'local')
      removeStorage('session', 'session')
      writeStorage('session', session, session.remember ? 'local' : 'session')
    },
    clear() {
      removeStorage('session', 'local')
      removeStorage('session', 'session')
    },
  },
}

/** Empreinte SHA-256 salée (WebCrypto). Démonstration uniquement : l'authentification réelle se fera côté serveur. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  // Contexte non sécurisé (http hors localhost) : repli non cryptographique, suffisant pour la démo.
  let hash = 0
  for (const byte of data) hash = (Math.imul(hash, 31) + byte) | 0
  return `weak-${(hash >>> 0).toString(16)}`
}
