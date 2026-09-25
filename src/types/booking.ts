import type { BaggageAllowance, CabinClass, FlightLeg, FlightSearchParams, Itinerary } from './flight'

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export type PassengerType = 'adult' | 'child' | 'infant'
export type PassengerTitle = 'mr' | 'mrs' | 'unspecified'

export interface Passenger {
  id: string
  type: PassengerType
  title: PassengerTitle
  firstName: string
  lastName: string
  birthDate?: string
  nationality?: string
  seat?: string
}

export type ServiceType = 'extra-baggage' | 'insurance' | 'transfer' | 'hotel' | 'assistance' | 'seat' | 'meal' | 'lounge'

export type ServiceStatus = 'included' | 'requested' | 'confirmed'

export interface BookingService {
  type: ServiceType
  status: ServiceStatus
  detail?: string
}

export type ContactPreference = 'phone' | 'whatsapp' | 'email'

export interface BookingContact {
  email: string
  phone: string
  preferred: ContactPreference
}

/** Réservation (démo) ou demande de réservation enregistrée localement. */
export interface Booking {
  pnr: string
  status: BookingStatus
  createdAt: string
  legs: FlightLeg[]
  cabin: CabinClass
  fareName: string
  passengers: Passenger[]
  contact: BookingContact
  services: BookingService[]
  baggage: BaggageAllowance
  /** Montant indicatif fictif (DJF) — aucun paiement n'est jamais encaissé en ligne. */
  totalPrice: number
  notes?: string
  ownerId?: string
  /** « demo » : données fictives intégrées ; « request » : demande envoyée depuis le site. */
  source: 'demo' | 'request'
}

export interface PassengerInput {
  type: PassengerType
  title: PassengerTitle
  firstName: string
  lastName: string
  birthDate: string
  nationality: string
}

export interface BookingRequestInput {
  itinerary: Itinerary
  search: FlightSearchParams
  passengers: PassengerInput[]
  contact: BookingContact
  services: ServiceType[]
  notes: string
  ownerId?: string
}

export interface BookingLookup {
  pnr: string
  lastName: string
}
