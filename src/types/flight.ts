/** Grandes régions utilisées pour classer destinations et aéroports. */
export type Region = 'afrique' | 'moyen-orient' | 'europe' | 'asie'

export interface Airport {
  /** Code IATA (ex. JIB). */
  code: string
  city: string
  name: string
  country: string
  region: Region
  lat: number
  lng: number
  /** Décalage horaire UTC standard, en heures (heure d'été ignorée pour la démo). */
  utcOffset: number
  /** Proposé en suggestion rapide dans le moteur de recherche. */
  popular?: boolean
}

export interface Airline {
  code: string
  name: string
  hubs: string[]
}

export type TripType = 'roundtrip' | 'oneway' | 'multicity'
export type CabinClass = 'economy' | 'premium' | 'business' | 'first'

export interface PassengerCounts {
  adults: number
  children: number
  infants: number
}

export interface SearchSegment {
  from: string
  to: string
  /** Date locale au format AAAA-MM-JJ. */
  date: string
}

export interface FlightSearchParams {
  tripType: TripType
  /** Aller simple / aller-retour : un segment. Multidestination : 2 à 5 segments. */
  segments: SearchSegment[]
  returnDate?: string
  passengers: PassengerCounts
  cabin: CabinClass
}

/** Un vol opéré (un décollage, un atterrissage). Heures locales « AAAA-MM-JJTHH:mm ». */
export interface FlightSegment {
  id: string
  airline: Airline
  flightNumber: string
  from: string
  to: string
  departure: string
  arrival: string
  durationMin: number
  aircraft: string
}

/** Un trajet (aller, retour ou étape d'un multidestination), éventuellement avec escale. */
export interface FlightLeg {
  segments: FlightSegment[]
  durationMin: number
  stops: number
}

export interface BaggageAllowance {
  cabinKg: number
  checkedPieces: number
  checkedKg: number
}

export type ItineraryTag = 'cheapest' | 'fastest' | 'recommended'

/** Proposition complète (tous les trajets) — données de démonstration. */
export interface Itinerary {
  id: string
  legs: FlightLeg[]
  cabin: CabinClass
  /** Prix indicatif fictif par adulte, en DJF. */
  pricePerAdult: number
  /** Total indicatif fictif pour tous les passagers, en DJF. */
  totalPrice: number
  fareName: string
  refundable: boolean
  baggage: BaggageAllowance
  tags: ItineraryTag[]
}

export interface FareDay {
  date: string
  /** Prix indicatif le plus bas (fictif), ou null si aucun vol de démonstration. */
  price: number | null
}

export interface FlightSearchResult {
  params: FlightSearchParams
  itineraries: Itinerary[]
  /** Toujours vrai tant qu'aucune API de compagnie n'est connectée. */
  isDemo: boolean
}

export type FlightStatusCode = 'on-time' | 'delayed' | 'boarding' | 'in-flight' | 'landed' | 'cancelled'

export type TimelineStage = 'booking' | 'checkin' | 'boarding' | 'takeoff' | 'cruise' | 'arrival'

export interface FlightStatusInfo {
  flightNumber: string
  airline: Airline
  from: string
  to: string
  date: string
  scheduledDeparture: string
  estimatedDeparture: string
  scheduledArrival: string
  estimatedArrival: string
  status: FlightStatusCode
  delayMinutes: number
  /** Étape atteinte dans la frise (réservation → arrivée). */
  stage: TimelineStage
  /** Avancement du vol entre 0 et 1 (en vol uniquement). */
  progress: number
  terminal: string
  gate: string | null
  aircraft: string
  isDemo: boolean
}

export interface FlightStatusQuery {
  flightNumber: string
  date: string
}
