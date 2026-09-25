/**
 * Générateur de vols FICTIFS pour la démonstration.
 * Les horaires, numéros de vol, disponibilités et prix sont calculés de façon
 * déterministe à partir de la recherche : ils ne reflètent aucune donnée réelle.
 */
import { AIRLINES, HUBS, JIB_DIRECT_ROUTES, getAirline } from '@/data/airlines'
import { airport, distanceKm } from '@/data/airports'
import type {
  BaggageAllowance,
  CabinClass,
  FareDay,
  FlightLeg,
  FlightSearchParams,
  FlightSegment,
  Itinerary,
  ItineraryTag,
} from '@/types/flight'
import { addDays, addMinutes, diffDays, diffMinutes, isWeekend, roundTo, todayIso } from '@/utils/date'
import { hashString, seededRandom } from '@/utils/random'

const DEPARTURE_SLOTS = ['01:35', '03:10', '06:50', '08:25', '10:15', '12:40', '14:05', '16:30', '18:45', '21:20', '23:55']

const CABIN_MULTIPLIER: Record<CabinClass, number> = { economy: 1, premium: 1.65, business: 3.1, first: 4.9 }

/** Nom commercial du tarif (affiché après la classe : « Économique · Classic »). */
const FARE_NAMES: Record<CabinClass, string> = {
  economy: 'Classic',
  premium: 'Comfort',
  business: 'Flex',
  first: 'Signature',
}

const BAGGAGE: Record<CabinClass, BaggageAllowance> = {
  economy: { cabinKg: 8, checkedPieces: 1, checkedKg: 23 },
  premium: { cabinKg: 8, checkedPieces: 2, checkedKg: 23 },
  business: { cabinKg: 12, checkedPieces: 2, checkedKg: 32 },
  first: { cabinKg: 14, checkedPieces: 3, checkedKg: 32 },
}

export function baggageFor(cabin: CabinClass): BaggageAllowance {
  return BAGGAGE[cabin]
}

/** Compagnies pouvant relier a et b sans escale (règles simplifiées de la démo). */
export function directCarriers(a: string, b: string): string[] {
  if (a === b) return []
  if (a === 'JIB' || b === 'JIB') return JIB_DIRECT_ROUTES[a === 'JIB' ? b : a] ?? []
  return Object.values(AIRLINES)
    .filter((airline) => airline.hubs.includes(a) || airline.hubs.includes(b))
    .map((airline) => airline.code)
}

function aircraftFor(km: number, seed: number): string {
  const short = ['Airbus A320neo', 'Boeing 737-800', 'De Havilland Dash 8-400']
  const medium = ['Boeing 737 MAX 8', 'Airbus A321neo', 'Airbus A330-300']
  const long = ['Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER']
  const list = km < 1500 ? short : km < 4200 ? medium : long
  return list[seed % list.length]
}

/** Durée de vol plausible (vitesse de croisière + roulage), arrondie à 5 minutes. */
export function flightDuration(from: string, to: string): number {
  return roundTo((distanceKm(from, to) / 820) * 60 + 32)
}

export function flightNumberFor(carrier: string, from: string, to: string, variant = 0): string {
  return `${carrier} ${100 + (hashString(`${carrier}${from}${to}${variant}`) % 1850)}`
}

export function buildSegment(carrier: string, from: string, to: string, departure: string, variant = 0): FlightSegment {
  const km = distanceKm(from, to)
  const durationMin = flightDuration(from, to)
  const offset = Math.round((airport(to).utcOffset - airport(from).utcOffset) * 60)
  const flightNumber = flightNumberFor(carrier, from, to, variant)
  return {
    id: `${flightNumber.replace(' ', '')}-${departure}`,
    airline: getAirline(carrier),
    flightNumber,
    from,
    to,
    departure,
    arrival: addMinutes(departure, durationMin + offset),
    durationMin,
    aircraft: aircraftFor(km, hashString(flightNumber)),
  }
}

/** Durée totale réelle d'un trajet (fuseaux horaires pris en compte). */
function legDuration(segments: FlightSegment[]): number {
  const first = segments[0]
  const last = segments[segments.length - 1]
  const offset = Math.round((airport(last.to).utcOffset - airport(first.from).utcOffset) * 60)
  return diffMinutes(first.departure, last.arrival) - offset
}

function makeLeg(segments: FlightSegment[]): FlightLeg {
  return { segments, durationMin: legDuration(segments), stops: segments.length - 1 }
}

/** Options (directes et avec une escale) pour un trajet donné, à une date donnée. */
export function legOptions(from: string, to: string, date: string): FlightLeg[] {
  const random = seededRandom(`${from}-${to}-${date}`)
  const options: FlightLeg[] = []

  for (const carrier of directCarriers(from, to)) {
    const count = random() > 0.5 ? 2 : 1
    const start = Math.floor(random() * DEPARTURE_SLOTS.length)
    for (let variant = 0; variant < count; variant += 1) {
      const slot = DEPARTURE_SLOTS[(start + variant * 5) % DEPARTURE_SLOTS.length]
      options.push(makeLeg([buildSegment(carrier, from, to, `${date}T${slot}`, variant)]))
    }
  }

  const direct = distanceKm(from, to)
  const viaHubs = (maxRatio: number) =>
    HUBS.filter((hub) => hub !== from && hub !== to)
      .map((hub) => ({ hub, ratio: (distanceKm(from, hub) + distanceKm(hub, to)) / direct }))
      .filter(({ hub, ratio }) => ratio < maxRatio && directCarriers(from, hub).length > 0 && directCarriers(hub, to).length > 0)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 4)

  let hubs = viaHubs(1.55)
  if (options.length === 0 && hubs.length === 0) hubs = viaHubs(3.2)

  for (const { hub } of hubs) {
    const firstCarriers = directCarriers(from, hub)
    const secondCarriers = directCarriers(hub, to)
    const carrier1 = firstCarriers[Math.floor(random() * firstCarriers.length)]
    const carrier2 = secondCarriers.includes(carrier1)
      ? carrier1
      : (secondCarriers.find((code) => AIRLINES[code]?.hubs.includes(hub)) ?? secondCarriers[0])
    const slot = DEPARTURE_SLOTS[Math.floor(random() * DEPARTURE_SLOTS.length)]
    const first = buildSegment(carrier1, from, hub, `${date}T${slot}`, 3)
    const layover = roundTo(80 + random() * 190)
    const second = buildSegment(carrier2, hub, to, addMinutes(first.arrival, layover), 3)
    options.push(makeLeg([first, second]))
  }

  return options.sort((a, b) => a.stops - b.stops || a.durationMin - b.durationMin).slice(0, 6)
}

/** Prix indicatif FICTIF d'un trajet par adulte en classe Économique (DJF). */
function legPrice(leg: FlightLeg, date: string, seed: string): number {
  const random = seededRandom(seed)
  const km = leg.segments.reduce((sum, segment) => sum + distanceKm(segment.from, segment.to), 0)
  let price = 14_000 + 13.5 * km
  if (leg.stops > 0) price *= 0.9
  if (isWeekend(date)) price *= 1.06
  const daysAhead = diffDays(todayIso(), date)
  if (daysAhead < 7) price *= 1.25
  else if (daysAhead < 21) price *= 1.1
  else if (daysAhead > 90) price *= 0.95
  return price * (0.9 + random() * 0.24)
}

const round100 = (value: number) => Math.round(value / 100) * 100

function legsSpec(params: FlightSearchParams) {
  const [first] = params.segments
  if (params.tripType === 'roundtrip' && params.returnDate) {
    return [first, { from: first.to, to: first.from, date: params.returnDate }]
  }
  return params.tripType === 'multicity' ? params.segments : [first]
}

function signature(legs: FlightLeg[]): string {
  return legs.map((leg) => leg.segments.map((segment) => segment.id).join('+')).join('|')
}

export function generateItineraries(params: FlightSearchParams): Itinerary[] {
  const specs = legsSpec(params)
  const optionsPerLeg = specs.map((spec) => legOptions(spec.from, spec.to, spec.date))
  if (optionsPerLeg.some((options) => options.length === 0)) return []

  const { adults, children, infants } = params.passengers
  const travellerFactor = adults + children * 0.75 + infants * 0.1
  const count = Math.min(8, Math.max(...optionsPerLeg.map((options) => options.length)))
  const seen = new Set<string>()
  const itineraries: Itinerary[] = []

  for (let index = 0; index < count; index += 1) {
    const outbound = optionsPerLeg[0][index % optionsPerLeg[0].length]
    const carrier = outbound.segments[0].airline.code
    const legs = optionsPerLeg.map((options, legIndex) => {
      if (legIndex === 0) return outbound
      const sameCarrier = options.filter((option) => option.segments[0].airline.code === carrier)
      return sameCarrier[index % Math.max(1, sameCarrier.length)] ?? options[index % options.length]
    })
    const key = signature(legs)
    if (seen.has(key)) continue
    seen.add(key)

    const base = legs.reduce((sum, leg, legIndex) => sum + legPrice(leg, specs[legIndex].date, `${key}-${legIndex}`), 0)
    const pricePerAdult = round100(base * CABIN_MULTIPLIER[params.cabin])
    const refundable = params.cabin === 'business' || params.cabin === 'first' || (params.cabin === 'premium' && hashString(key) % 2 === 0)

    itineraries.push({
      id: (hashString(`${key}-${params.cabin}`) >>> 0).toString(36),
      legs,
      cabin: params.cabin,
      pricePerAdult,
      totalPrice: round100(pricePerAdult * travellerFactor),
      fareName: FARE_NAMES[params.cabin],
      refundable,
      baggage: BAGGAGE[params.cabin],
      tags: [],
    })
  }

  return tagItineraries(itineraries)
}

function tagItineraries(itineraries: Itinerary[]): Itinerary[] {
  if (itineraries.length === 0) return itineraries
  const duration = (itinerary: Itinerary) => itinerary.legs.reduce((sum, leg) => sum + leg.durationMin, 0)
  const minPrice = Math.min(...itineraries.map((itinerary) => itinerary.totalPrice))
  const maxPrice = Math.max(...itineraries.map((itinerary) => itinerary.totalPrice))
  const minDuration = Math.min(...itineraries.map(duration))
  const maxDuration = Math.max(...itineraries.map(duration))
  const norm = (value: number, min: number, max: number) => (max === min ? 0 : (value - min) / (max - min))
  const score = (itinerary: Itinerary) =>
    norm(itinerary.totalPrice, minPrice, maxPrice) * 0.55 + norm(duration(itinerary), minDuration, maxDuration) * 0.45

  const cheapest = itineraries.reduce((best, item) => (item.totalPrice < best.totalPrice ? item : best))
  const fastest = itineraries.reduce((best, item) => (duration(item) < duration(best) ? item : best))
  const recommended = itineraries.reduce((best, item) => (score(item) < score(best) ? item : best))

  return itineraries.map((itinerary) => {
    const tags: ItineraryTag[] = []
    if (itinerary === recommended) tags.push('recommended')
    if (itinerary === cheapest) tags.push('cheapest')
    if (itinerary === fastest) tags.push('fastest')
    return { ...itinerary, tags }
  })
}

/** Calendrier des prix (± 3 jours) : prix indicatif le plus bas par adulte pour chaque date de départ. */
export function fareCalendar(params: FlightSearchParams, span = 3): FareDay[] {
  if (params.tripType === 'multicity') return []
  const [first] = params.segments
  const today = todayIso()
  return Array.from({ length: span * 2 + 1 }, (_, index) => {
    const date = addDays(first.date, index - span)
    if (date < today || (params.returnDate && date > params.returnDate)) return { date, price: null }
    const itineraries = generateItineraries({ ...params, segments: [{ ...first, date }] })
    return { date, price: itineraries.length ? Math.min(...itineraries.map((itinerary) => itinerary.pricePerAdult)) : null }
  })
}

/** Prix indicatif « à partir de » (aller-retour Économique, 1 adulte, J+45) pour les cartes destinations. */
export function indicativePrice(from: string, to: string): number | null {
  const date = addDays(todayIso(), 45)
  const itineraries = generateItineraries({
    tripType: 'roundtrip',
    segments: [{ from, to, date }],
    returnDate: addDays(date, 7),
    passengers: { adults: 1, children: 0, infants: 0 },
    cabin: 'economy',
  })
  return itineraries.length ? Math.min(...itineraries.map((itinerary) => itinerary.totalPrice)) : null
}
