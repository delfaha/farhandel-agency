/**
 * Statuts de vol SIMULÉS. Seuls les vols de démonstration ci-dessous renvoient un résultat :
 * aucun statut n'est inventé pour un vol réel saisi par un visiteur.
 */
import { getAirline } from '@/data/airlines'
import { airport } from '@/data/airports'
import type { FlightStatusCode, FlightStatusInfo, TimelineStage } from '@/types/flight'
import { addMinutes, diffMinutes, nowAtOffset, toLocalString, toMs, todayIso } from '@/utils/date'
import { normalizeFlightNumber } from '@/utils/validation'
import { flightDuration } from './flightGenerator'

type Scenario = 'on-time' | 'delayed' | 'boarding' | 'in-flight' | 'landed' | 'cancelled'

interface DemoFlight {
  number: string
  from: string
  to: string
  /** Heure de départ utilisée pour les dates autres qu'aujourd'hui. */
  slot: string
  scenario: Scenario
  delay?: number
  aircraft: string
}

export const DEMO_FLIGHTS: DemoFlight[] = [
  { number: 'TK 686', from: 'JIB', to: 'IST', slot: '03:10', scenario: 'in-flight', aircraft: 'Airbus A330-300' },
  { number: 'FZ 624', from: 'JIB', to: 'DXB', slot: '16:30', scenario: 'boarding', aircraft: 'Boeing 737 MAX 8' },
  { number: 'ET 453', from: 'JIB', to: 'ADD', slot: '13:40', scenario: 'delayed', delay: 35, aircraft: 'De Havilland Dash 8-400' },
  { number: 'QR 1394', from: 'DOH', to: 'JIB', slot: '08:25', scenario: 'on-time', aircraft: 'Airbus A320neo' },
  { number: 'AF 574', from: 'CDG', to: 'JIB', slot: '10:15', scenario: 'landed', aircraft: 'Boeing 787-9' },
  { number: 'SV 490', from: 'JIB', to: 'JED', slot: '12:40', scenario: 'cancelled', aircraft: 'Airbus A320neo' },
]

export const DEMO_FLIGHT_HINTS = DEMO_FLIGHTS.map((flight) => ({ number: flight.number, scenario: flight.scenario }))

/** Heure de départ programmée pour aujourd'hui, placée autour de l'heure actuelle selon le scénario. */
function todaySchedule(flight: DemoFlight): string {
  const now = nowAtOffset(airport(flight.from).utcOffset)
  const duration = flightDuration(flight.from, flight.to)
  const offsets: Record<Scenario, number> = {
    'in-flight': -Math.round(duration * 0.42),
    boarding: 25,
    delayed: 170,
    'on-time': 290,
    landed: -(duration + 55),
    cancelled: 140,
  }
  const target = toMs(addMinutes(now, offsets[flight.scenario]))
  return toLocalString(Math.round(target / 300_000) * 300_000)
}

function computeStatus(departure: string, arrival: string, delay: number, cancelled: boolean, fromOffset: number, toOffset: number) {
  const estimatedDeparture = addMinutes(departure, delay)
  const estimatedArrival = addMinutes(arrival, delay)
  const nowFrom = nowAtOffset(fromOffset)
  const nowTo = nowAtOffset(toOffset)
  let status: FlightStatusCode
  let stage: TimelineStage
  let progress = 0

  if (cancelled) {
    status = 'cancelled'
    stage = 'booking'
  } else if (nowTo >= estimatedArrival) {
    status = 'landed'
    stage = 'arrival'
    progress = 1
  } else if (nowFrom >= estimatedDeparture) {
    const total = diffMinutes(estimatedDeparture, estimatedArrival) - Math.round((toOffset - fromOffset) * 60)
    const elapsed = diffMinutes(estimatedDeparture, nowFrom)
    progress = Math.min(0.98, Math.max(0.02, elapsed / total))
    status = 'in-flight'
    stage = progress < 0.08 ? 'takeoff' : 'cruise'
  } else if (diffMinutes(nowFrom, estimatedDeparture) <= 45) {
    status = 'boarding'
    stage = 'boarding'
  } else {
    status = delay > 0 ? 'delayed' : 'on-time'
    stage = diffMinutes(nowFrom, estimatedDeparture) <= 180 ? 'checkin' : 'booking'
  }

  return { status, stage, progress, estimatedDeparture, estimatedArrival }
}

export function findDemoFlightStatus(flightNumber: string, date: string): FlightStatusInfo | null {
  const normalized = normalizeFlightNumber(flightNumber)
  const flight = DEMO_FLIGHTS.find((item) => item.number === normalized)
  if (!flight) return null

  const from = airport(flight.from)
  const to = airport(flight.to)
  const today = todayIso()
  const isToday = date === today
  const departure = isToday ? todaySchedule(flight) : `${date}T${flight.slot}`
  const duration = flightDuration(flight.from, flight.to)
  const arrival = addMinutes(departure, duration + Math.round((to.utcOffset - from.utcOffset) * 60))
  const delay = flight.scenario === 'delayed' ? (flight.delay ?? 30) : 0
  const cancelled = flight.scenario === 'cancelled' && isToday
  const computed = computeStatus(departure, arrival, isToday ? delay : 0, cancelled, from.utcOffset, to.utcOffset)
  const showGate = computed.status === 'boarding' || computed.status === 'on-time' || computed.status === 'delayed'

  return {
    flightNumber: flight.number,
    airline: getAirline(flight.number.slice(0, 2)),
    from: flight.from,
    to: flight.to,
    date,
    scheduledDeparture: departure,
    estimatedDeparture: computed.estimatedDeparture,
    scheduledArrival: arrival,
    estimatedArrival: computed.estimatedArrival,
    status: computed.status,
    delayMinutes: cancelled ? 0 : isToday ? delay : 0,
    stage: computed.stage,
    progress: computed.progress,
    terminal: flight.from === 'JIB' ? 'Terminal passagers' : 'Terminal 1',
    gate: showGate ? `${flight.from === 'JIB' ? 'Porte' : 'Porte B'} ${(flight.number.charCodeAt(0) % 9) + 1}` : null,
    aircraft: flight.aircraft,
    isDemo: true,
  }
}
