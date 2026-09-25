import type { Booking } from '@/types/booking'
import type { FlightLeg, FlightStatusQuery, Itinerary } from '@/types/flight'

/** Premier et dernier vol d'un trajet (avec ou sans escale). */
export function legEndpoints(leg: FlightLeg) {
  const first = leg.segments[0]
  const last = leg.segments[leg.segments.length - 1]
  return { first, last, from: first.from, to: last.to, departure: first.departure, arrival: last.arrival }
}

/** Lien vers la page « Statut du vol » pour un vol donné. */
export function statusLink({ flightNumber, date }: FlightStatusQuery): string {
  return `/statut-vol?vol=${encodeURIComponent(flightNumber.replace(' ', ''))}&date=${date}`
}

/** Statut du premier vol d'une réservation. */
export function flightStatusLink(booking: Booking): string {
  const { first } = legEndpoints(booking.legs[0])
  return statusLink({ flightNumber: first.flightNumber, date: first.departure.slice(0, 10) })
}

export type SortKey = 'recommended' | 'price' | 'duration' | 'departure'

export interface ResultFilters {
  directOnly: boolean
  airlines: string[]
  sort: SortKey
}

const totalDuration = (itinerary: Itinerary) => itinerary.legs.reduce((sum, leg) => sum + leg.durationMin, 0)

/** Filtre (vols directs, compagnies) et trie les résultats de recherche. */
export function applyFilters(itineraries: Itinerary[], filters: ResultFilters): Itinerary[] {
  const filtered = itineraries.filter(
    (itinerary) =>
      (!filters.directOnly || itinerary.legs.every((leg) => leg.stops === 0)) &&
      (filters.airlines.length === 0 || itinerary.legs.some((leg) => leg.segments.some((segment) => filters.airlines.includes(segment.airline.code)))),
  )
  const sorters: Record<SortKey, (a: Itinerary, b: Itinerary) => number> = {
    recommended: (a, b) => Number(b.tags.includes('recommended')) - Number(a.tags.includes('recommended')) || a.totalPrice - b.totalPrice,
    price: (a, b) => a.totalPrice - b.totalPrice,
    duration: (a, b) => totalDuration(a) - totalDuration(b),
    departure: (a, b) => a.legs[0].segments[0].departure.localeCompare(b.legs[0].segments[0].departure),
  }
  return [...filtered].sort(sorters[filters.sort])
}
