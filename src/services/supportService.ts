import type { Booking, BookingLookup } from '@/types/booking'
import { randomId } from '@/utils/random'
import { apiRequest, USE_MOCKS } from './api/client'
import { bookingService } from './bookingService'
import { db } from './mock/db'
import { mockDelay } from './mock/delay'

/* ---------- Contact ---------- */

export interface ContactMessage {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

export interface ContactService {
  /** En démonstration, le message est seulement enregistré dans le navigateur (aucun envoi réel). */
  send(message: ContactMessage): Promise<{ id: string; delivered: boolean }>
}

const mockContactService: ContactService = {
  async send(message) {
    await mockDelay(900, 1400)
    const id = randomId('msg')
    db.messages.save([...db.messages.all(), { ...message, id, createdAt: new Date().toISOString() }].slice(-50))
    return { id, delivered: false }
  },
}

const httpContactService: ContactService = {
  send: (message) => apiRequest<{ id: string; delivered: boolean }>('/contact', { method: 'POST', body: message }),
}

export const contactService: ContactService = USE_MOCKS ? mockContactService : httpContactService

/* ---------- Check-in ---------- */

export interface CheckInResult {
  /** Faux tant qu'aucun système d'enregistrement de compagnie n'est connecté. */
  available: boolean
  booking: Booking | null
}

export interface CheckInService {
  start(lookup: BookingLookup): Promise<CheckInResult>
}

const mockCheckInService: CheckInService = {
  async start(lookup) {
    // Le prototype ne réalise JAMAIS d'enregistrement : il identifie seulement la réservation.
    const booking = await bookingService.lookup(lookup)
    return { available: false, booking }
  },
}

const httpCheckInService: CheckInService = {
  start: (lookup) => apiRequest<CheckInResult>('/check-in/start', { method: 'POST', body: lookup }),
}

export const checkInService: CheckInService = USE_MOCKS ? mockCheckInService : httpCheckInService

/* ---------- Paiement (futur) ---------- */

/**
 * Point d'extension pour un prestataire de paiement (session de paiement hébergée).
 * Volontairement non implémenté : le prototype ne simule aucune transaction bancaire.
 */
export interface PaymentService {
  createCheckoutSession(pnr: string): Promise<{ redirectUrl: string }>
}

export const paymentService: PaymentService = {
  async createCheckoutSession() {
    throw new Error("Le paiement en ligne n'est pas encore disponible : un conseiller vous indiquera les modalités de règlement.")
  },
}
