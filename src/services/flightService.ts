import type { FareDay, FlightSearchParams, FlightSearchResult, FlightStatusInfo, FlightStatusQuery } from '@/types/flight'
import { apiRequest, USE_MOCKS } from './api/client'
import { mockDelay } from './mock/delay'
import { fareCalendar, generateItineraries } from './mock/flightGenerator'
import { findDemoFlightStatus } from './mock/flightStatus'

/**
 * Recherche de vols, calendrier des prix et statut des vols.
 * À connecter à une API de distribution (GDS / NDC) et à une API de statut de vols.
 */
export interface FlightService {
  search(params: FlightSearchParams): Promise<FlightSearchResult>
  fareCalendar(params: FlightSearchParams): Promise<FareDay[]>
  /** Renvoie null si le vol est inconnu (ou non couvert par la démonstration). */
  status(query: FlightStatusQuery): Promise<FlightStatusInfo | null>
}

const mockFlightService: FlightService = {
  async search(params) {
    await mockDelay(700, 1300)
    return { params, itineraries: generateItineraries(params), isDemo: true }
  },
  async fareCalendar(params) {
    await mockDelay(250, 500)
    return fareCalendar(params)
  },
  async status({ flightNumber, date }) {
    await mockDelay(500, 900)
    return findDemoFlightStatus(flightNumber, date)
  },
}

const httpFlightService: FlightService = {
  search: (params) => apiRequest<FlightSearchResult>('/flights/search', { method: 'POST', body: params }),
  fareCalendar: (params) => apiRequest<FareDay[]>('/flights/fare-calendar', { method: 'POST', body: params }),
  status: ({ flightNumber, date }) =>
    apiRequest<FlightStatusInfo | null>('/flights/status', { query: { flightNumber, date } }),
}

export const flightService: FlightService = USE_MOCKS ? mockFlightService : httpFlightService
