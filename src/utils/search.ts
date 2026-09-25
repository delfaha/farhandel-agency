import { getAirport } from '@/data/airports'
import type { CabinClass, FlightSearchParams, PassengerCounts, SearchSegment, TripType } from '@/types/flight'
import { addDays, isIsoDate, todayIso } from './date'
import type { FieldErrors } from './validation'

/* ---------- Correspondance URL (paramètres lisibles en français) ---------- */

const TRIP_TO_QUERY: Record<TripType, string> = { roundtrip: 'aller-retour', oneway: 'aller-simple', multicity: 'multi' }
const CABIN_TO_QUERY: Record<CabinClass, string> = { economy: 'economique', premium: 'premium', business: 'affaires', first: 'premiere' }

const invert = <K extends string, V extends string>(record: Record<K, V>) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key])) as Record<V, K>

const QUERY_TO_TRIP = invert(TRIP_TO_QUERY)
const QUERY_TO_CABIN = invert(CABIN_TO_QUERY)

export const MAX_PASSENGERS = 9
export const MAX_SEGMENTS = 5

export const DEFAULT_PASSENGERS: PassengerCounts = { adults: 1, children: 0, infants: 0 }

/** Brouillon du formulaire de recherche (champs éventuellement vides). */
export interface SearchDraft {
  tripType: TripType
  segments: SearchSegment[]
  returnDate: string
  passengers: PassengerCounts
  cabin: CabinClass
}

export function defaultDraft(overrides: Partial<SearchDraft> = {}): SearchDraft {
  const today = todayIso()
  return {
    tripType: 'roundtrip',
    segments: [{ from: 'JIB', to: '', date: addDays(today, 14) }],
    returnDate: addDays(today, 21),
    passengers: { ...DEFAULT_PASSENGERS },
    cabin: 'economy',
    ...overrides,
  }
}

export function draftToParams(draft: SearchDraft): FlightSearchParams {
  const segments = draft.tripType === 'multicity' ? draft.segments : draft.segments.slice(0, 1)
  return {
    tripType: draft.tripType,
    segments,
    returnDate: draft.tripType === 'roundtrip' ? draft.returnDate : undefined,
    passengers: draft.passengers,
    cabin: draft.cabin,
  }
}

export function paramsToQuery(params: FlightSearchParams): string {
  const query = new URLSearchParams()
  query.set('trajet', TRIP_TO_QUERY[params.tripType])
  if (params.tripType === 'multicity') {
    query.set('etapes', params.segments.map((segment) => `${segment.from}.${segment.to}.${segment.date}`).join('~'))
  } else {
    const [first] = params.segments
    query.set('de', first.from)
    query.set('vers', first.to)
    query.set('aller', first.date)
    if (params.tripType === 'roundtrip' && params.returnDate) query.set('retour', params.returnDate)
  }
  query.set('adultes', String(params.passengers.adults))
  if (params.passengers.children) query.set('enfants', String(params.passengers.children))
  if (params.passengers.infants) query.set('bebes', String(params.passengers.infants))
  query.set('classe', CABIN_TO_QUERY[params.cabin])
  return query.toString()
}

const clampInt = (value: string | null, min: number, max: number, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

const airportCode = (value: string | null) => {
  const code = (value ?? '').toUpperCase()
  return getAirport(code) ? code : ''
}

/** Lit l'URL : renvoie un brouillon (pour pré-remplir) et les paramètres s'ils sont complets et valides. */
export function queryToSearch(query: URLSearchParams): { draft: SearchDraft; params: FlightSearchParams | null } {
  const base = defaultDraft()
  const tripType = QUERY_TO_TRIP[query.get('trajet') ?? ''] ?? 'roundtrip'
  const cabin = QUERY_TO_CABIN[query.get('classe') ?? ''] ?? 'economy'
  const adults = clampInt(query.get('adultes'), 1, MAX_PASSENGERS, 1)
  const children = clampInt(query.get('enfants'), 0, MAX_PASSENGERS - adults, 0)
  const infants = clampInt(query.get('bebes'), 0, adults, 0)

  let segments: SearchSegment[]
  if (tripType === 'multicity') {
    segments = (query.get('etapes') ?? '')
      .split('~')
      .map((chunk) => chunk.split('.'))
      .filter((parts) => parts.length === 3)
      .slice(0, MAX_SEGMENTS)
      .map(([from, to, date]) => ({ from: airportCode(from), to: airportCode(to), date: isIsoDate(date) ? date : '' }))
    while (segments.length < 2) segments.push({ from: segments.at(-1)?.to ?? '', to: '', date: '' })
  } else {
    const from = query.has('de') ? airportCode(query.get('de')) : base.segments[0].from
    const aller = query.get('aller')
    segments = [{ from, to: airportCode(query.get('vers')), date: isIsoDate(aller) ? aller : base.segments[0].date }]
  }

  const retour = query.get('retour')
  const draft: SearchDraft = {
    tripType,
    segments,
    returnDate: isIsoDate(retour) ? retour : tripType === 'roundtrip' && segments[0].date ? addDays(segments[0].date, 7) : base.returnDate,
    passengers: { adults, children, infants },
    cabin,
  }

  const complete = query.has('aller') || query.has('etapes')
  const params = draftToParams(draft)
  return { draft, params: complete && Object.keys(validateSearch(draft)).length === 0 ? params : null }
}

/* ---------- Validation ---------- */

export type SearchErrorKey = `from-${number}` | `to-${number}` | `date-${number}` | 'returnDate' | 'passengers'

export function validateSearch(draft: SearchDraft, today = todayIso()): FieldErrors<SearchErrorKey> {
  const errors: FieldErrors<SearchErrorKey> = {}
  const segments = draft.tripType === 'multicity' ? draft.segments : draft.segments.slice(0, 1)

  segments.forEach((segment, index) => {
    if (!segment.from) errors[`from-${index}`] = 'Choisissez une ville de départ.'
    if (!segment.to) errors[`to-${index}`] = 'Choisissez une destination.'
    else if (segment.to === segment.from) errors[`to-${index}`] = 'La destination doit être différente du départ.'
    if (!segment.date) errors[`date-${index}`] = 'Choisissez une date de départ.'
    else if (segment.date < today) errors[`date-${index}`] = 'La date ne peut pas être passée.'
    else if (index > 0 && segments[index - 1].date && segment.date < segments[index - 1].date) {
      errors[`date-${index}`] = "Cette date doit suivre celle de l'étape précédente."
    }
  })

  if (draft.tripType === 'roundtrip') {
    if (!draft.returnDate) errors.returnDate = 'Choisissez une date de retour.'
    else if (segments[0].date && draft.returnDate < segments[0].date) errors.returnDate = "Le retour doit suivre l'aller."
  }

  const { adults, children, infants } = draft.passengers
  if (adults < 1) errors.passengers = 'Au moins un adulte est requis.'
  else if (adults + children > MAX_PASSENGERS) errors.passengers = `${MAX_PASSENGERS} passagers maximum par réservation.`
  else if (infants > adults) errors.passengers = 'Un bébé doit voyager avec un adulte.'

  return errors
}

export function passengerSummary({ adults, children, infants }: PassengerCounts): string {
  const parts = [`${adults} adulte${adults > 1 ? 's' : ''}`]
  if (children) parts.push(`${children} enfant${children > 1 ? 's' : ''}`)
  if (infants) parts.push(`${infants} bébé${infants > 1 ? 's' : ''}`)
  return parts.join(', ')
}

export function totalPassengers({ adults, children, infants }: PassengerCounts): number {
  return adults + children + infants
}
