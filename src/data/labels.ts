import type { BookingStatus, PassengerTitle, PassengerType, ServiceStatus, ServiceType } from '@/types/booking'
import type { CabinClass, FlightStatusCode, TimelineStage, TripType } from '@/types/flight'

export type Tone = 'emerald' | 'amber' | 'azure' | 'violet' | 'night' | 'rose' | 'sand' | 'slate'

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Économique',
  premium: 'Premium Economy',
  business: 'Affaires',
  first: 'Première',
}

export const CABIN_OPTIONS = (Object.keys(CABIN_LABELS) as CabinClass[]).map((value) => ({ value, label: CABIN_LABELS[value] }))

export const TRIP_LABELS: Record<TripType, string> = {
  roundtrip: 'Aller-retour',
  oneway: 'Aller simple',
  multicity: 'Multidestination',
}

export const FLIGHT_STATUS_META: Record<FlightStatusCode, { label: string; tone: Tone }> = {
  'on-time': { label: "À l'heure", tone: 'emerald' },
  delayed: { label: 'Retardé', tone: 'amber' },
  boarding: { label: 'Embarquement', tone: 'azure' },
  'in-flight': { label: 'En vol', tone: 'violet' },
  landed: { label: 'Arrivé', tone: 'night' },
  cancelled: { label: 'Annulé', tone: 'rose' },
}

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; tone: Tone }> = {
  confirmed: { label: 'Confirmée', tone: 'emerald' },
  pending: { label: 'En attente de confirmation', tone: 'amber' },
  cancelled: { label: 'Annulée', tone: 'rose' },
  completed: { label: 'Voyage effectué', tone: 'slate' },
}

export const TIMELINE_STAGES: { id: TimelineStage; label: string }[] = [
  { id: 'booking', label: 'Réservation' },
  { id: 'checkin', label: 'Enregistrement' },
  { id: 'boarding', label: 'Embarquement' },
  { id: 'takeoff', label: 'Décollage' },
  { id: 'cruise', label: 'En vol' },
  { id: 'arrival', label: 'Arrivée' },
]

export const SERVICE_LABELS: Record<ServiceType, string> = {
  'extra-baggage': 'Bagage supplémentaire',
  insurance: 'Assurance voyage',
  transfer: 'Transfert aéroport',
  hotel: 'Hôtel',
  assistance: 'Assistance aéroport',
  seat: 'Choix du siège',
  meal: 'Repas spécial',
  lounge: 'Accès salon',
}

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  included: 'Inclus',
  requested: 'Demandé',
  confirmed: 'Confirmé',
}

/** Services proposés en option lors d'une demande de réservation. */
export const BOOKABLE_SERVICES: ServiceType[] = ['extra-baggage', 'insurance', 'transfer', 'hotel', 'assistance', 'meal']

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  adult: 'Adulte',
  child: 'Enfant',
  infant: 'Bébé',
}

export const PASSENGER_TITLE_LABELS: Record<PassengerTitle, string> = {
  mr: 'M.',
  mrs: 'Mme',
  unspecified: 'Non précisé',
}
