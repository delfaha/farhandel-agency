import { SERVICE_LABELS } from '@/data/labels'
import type { Booking, BookingLookup, BookingRequestInput, ServiceType } from '@/types/booking'
import { normalizeText } from '@/utils/format'
import { generatePnr, randomId } from '@/utils/random'
import { normalizePnr } from '@/utils/validation'
import { apiRequest, USE_MOCKS } from './api/client'
import { db } from './mock/db'
import { mockDelay } from './mock/delay'
import { DEMO_USER, demoBookings } from './mock/demoData'
import { pushMockNotification } from './notificationService'

/**
 * Réservations. Côté site, on n'émet que des DEMANDES de réservation : la confirmation
 * (disponibilité réelle, tarif, émission du billet) reste faite par un conseiller,
 * puis par l'API de réservation lorsqu'elle sera connectée. Aucun paiement en ligne.
 */
export interface BookingService {
  lookup(input: BookingLookup): Promise<Booking | null>
  getByPnr(pnr: string): Promise<Booking | null>
  listForUser(userId: string): Promise<Booking[]>
  createRequest(input: BookingRequestInput): Promise<Booking>
  requestService(pnr: string, type: ServiceType, userId?: string): Promise<Booking>
}

function withServiceRequests(booking: Booking): Booking {
  const requested = db.serviceRequests.all()[booking.pnr] ?? []
  const extra = requested
    .filter((type) => !booking.services.some((service) => service.type === type))
    .map((type) => ({ type, status: 'requested' as const }))
  return extra.length ? { ...booking, services: [...booking.services, ...extra] } : booking
}

function allBookings(): Booking[] {
  return [...demoBookings(), ...db.bookings.all()].map(withServiceRequests)
}

const departureOf = (booking: Booking) => booking.legs[0]?.segments[0]?.departure ?? ''

const mockBookingService: BookingService = {
  async lookup({ pnr, lastName }) {
    await mockDelay(600, 1000)
    const code = normalizePnr(pnr)
    const name = normalizeText(lastName)
    return (
      allBookings().find(
        (booking) => booking.pnr === code && booking.passengers.some((passenger) => normalizeText(passenger.lastName) === name),
      ) ?? null
    )
  },

  async getByPnr(pnr) {
    await mockDelay(200, 400)
    return allBookings().find((booking) => booking.pnr === normalizePnr(pnr)) ?? null
  },

  async listForUser(userId) {
    await mockDelay(350, 700)
    return allBookings()
      .filter((booking) => booking.ownerId === userId || (userId === DEMO_USER.id && booking.source === 'demo'))
      .sort((a, b) => departureOf(a).localeCompare(departureOf(b)))
  },

  async createRequest(input) {
    await mockDelay(900, 1400)
    const existing = new Set(allBookings().map((booking) => booking.pnr))
    let pnr = generatePnr()
    while (existing.has(pnr)) pnr = generatePnr()

    const booking: Booking = {
      pnr,
      status: 'pending',
      createdAt: new Date().toISOString(),
      legs: input.itinerary.legs,
      cabin: input.itinerary.cabin,
      fareName: input.itinerary.fareName,
      passengers: input.passengers.map((passenger) => ({ ...passenger, id: randomId('pax') })),
      contact: input.contact,
      services: input.services.map((type) => ({ type, status: 'requested' as const })),
      baggage: input.itinerary.baggage,
      totalPrice: input.itinerary.totalPrice,
      notes: input.notes || undefined,
      ownerId: input.ownerId,
      source: 'request',
    }
    db.bookings.save([...db.bookings.all(), booking])

    if (input.ownerId) {
      pushMockNotification({
        userId: input.ownerId,
        type: 'booking',
        title: `Demande ${pnr} bien reçue`,
        message: 'Un conseiller FarhanDel Agency vérifie la disponibilité réelle et le tarif, puis vous recontacte.',
        link: '/espace-client/reservations',
      })
    }
    return booking
  },

  async requestService(pnr, type, userId) {
    await mockDelay(500, 900)
    const requests = db.serviceRequests.all()
    requests[pnr] = [...new Set([...(requests[pnr] ?? []), type])]
    db.serviceRequests.save(requests)
    const booking = allBookings().find((item) => item.pnr === pnr)
    if (!booking) throw new Error('Réservation introuvable.')
    if (userId) {
      pushMockNotification({
        userId,
        type: 'service',
        title: `${SERVICE_LABELS[type]} demandé`,
        message: `Votre demande pour la réservation ${pnr} a été transmise à votre conseiller (démonstration).`,
        link: '/espace-client/services',
      })
    }
    return booking
  },
}

const httpBookingService: BookingService = {
  lookup: ({ pnr, lastName }) => apiRequest<Booking | null>('/bookings/lookup', { method: 'POST', body: { pnr, lastName } }),
  getByPnr: (pnr) => apiRequest<Booking | null>(`/bookings/${encodeURIComponent(pnr)}`),
  listForUser: () => apiRequest<Booking[]>('/me/bookings'),
  createRequest: (input) => apiRequest<Booking>('/bookings/requests', { method: 'POST', body: input }),
  requestService: (pnr, type) =>
    apiRequest<Booking>(`/bookings/${encodeURIComponent(pnr)}/services`, { method: 'POST', body: { type } }),
}

export const bookingService: BookingService = USE_MOCKS ? mockBookingService : httpBookingService
