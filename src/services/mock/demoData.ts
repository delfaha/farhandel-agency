/**
 * Compte, réservations et notifications de DÉMONSTRATION.
 * Les dates sont calculées par rapport à aujourd'hui pour que le prototype reste cohérent dans le temps.
 */
import type { Booking } from '@/types/booking'
import type { FlightLeg } from '@/types/flight'
import type { AppNotification, User } from '@/types/user'
import { addDays, todayIso } from '@/utils/date'
import { baggageFor, buildSegment } from './flightGenerator'

export const DEMO_ACCOUNT = {
  email: 'demo@farhandel-agency.example',
  password: 'Demo2026!',
} as const

export const DEMO_USER: User = {
  id: 'demo-user',
  firstName: 'Hodan',
  lastName: 'Abdi',
  email: DEMO_ACCOUNT.email,
  phone: '+253 77 00 00 00',
  createdAt: '2026-01-12T09:30:00.000Z',
  birthDate: '1992-04-18',
  nationality: 'Djiboutienne',
  city: 'Djibouti',
  preferences: {
    seat: 'window',
    meal: 'halal',
    channels: { email: true, sms: false, whatsapp: true },
  },
}

/** Réservation d'exemple accessible sans compte depuis « Gérer ma réservation ». */
export const DEMO_LOOKUP = { pnr: 'FLS7K2', lastName: 'ABDI' } as const

function leg(carrier: string, flightNumber: string, from: string, to: string, date: string, time: string): FlightLeg {
  const segment = { ...buildSegment(carrier, from, to, `${date}T${time}`), flightNumber }
  segment.id = `${flightNumber.replace(' ', '')}-${segment.departure}`
  return { segments: [segment], durationMin: segment.durationMin, stops: 0 }
}

const createdDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

export function demoBookings(): Booking[] {
  const today = todayIso()
  const d = (days: number) => addDays(today, days)
  const contact = { email: DEMO_USER.email, phone: DEMO_USER.phone, preferred: 'whatsapp' as const }
  const hodan = { id: 'p-hodan', type: 'adult' as const, title: 'unspecified' as const, firstName: 'Hodan', lastName: 'Abdi', nationality: 'Djiboutienne' }

  return [
    {
      pnr: 'FLS7K2',
      status: 'confirmed',
      createdAt: createdDaysAgo(12),
      legs: [leg('TK', 'TK 686', 'JIB', 'IST', d(19), '03:10')],
      cabin: 'economy',
      fareName: 'Classic',
      passengers: [{ ...hodan, seat: '14A' }],
      contact,
      services: [
        { type: 'insurance', status: 'confirmed', detail: 'Multirisque — Europe' },
        { type: 'transfer', status: 'requested', detail: 'Aéroport → hôtel (Sultanahmet)' },
        { type: 'meal', status: 'confirmed', detail: 'Repas halal' },
      ],
      baggage: baggageFor('economy'),
      totalPrice: 62_400,
      ownerId: DEMO_USER.id,
      source: 'demo',
    },
    {
      pnr: 'DXB5M8',
      status: 'pending',
      createdAt: createdDaysAgo(2),
      legs: [leg('FZ', 'FZ 624', 'JIB', 'DXB', d(84), '16:30'), leg('FZ', 'FZ 625', 'DXB', 'JIB', d(94), '11:55')],
      cabin: 'economy',
      fareName: 'Classic',
      passengers: [hodan, { id: 'p-omar', type: 'adult', title: 'mr', firstName: 'Omar', lastName: 'Abdi', nationality: 'Djiboutienne' }],
      contact,
      services: [
        { type: 'hotel', status: 'requested', detail: '4 nuits — Downtown Dubai' },
        { type: 'extra-baggage', status: 'requested', detail: '+1 × 23 kg au retour' },
      ],
      baggage: baggageFor('economy'),
      totalPrice: 148_800,
      ownerId: DEMO_USER.id,
      source: 'demo',
    },
    {
      pnr: 'ADD3P9',
      status: 'completed',
      createdAt: createdDaysAgo(140),
      legs: [leg('ET', 'ET 453', 'JIB', 'ADD', d(-112), '13:40'), leg('ET', 'ET 452', 'ADD', 'JIB', d(-105), '09:20')],
      cabin: 'economy',
      fareName: 'Classic',
      passengers: [hodan],
      contact,
      services: [],
      baggage: baggageFor('economy'),
      totalPrice: 44_600,
      ownerId: DEMO_USER.id,
      source: 'demo',
    },
    {
      pnr: 'NBO4R6',
      status: 'completed',
      createdAt: createdDaysAgo(240),
      legs: [leg('KQ', 'KQ 356', 'JIB', 'NBO', d(-211), '06:50'), leg('KQ', 'KQ 357', 'NBO', 'JIB', d(-201), '18:45')],
      cabin: 'economy',
      fareName: 'Classic',
      passengers: [hodan],
      contact,
      services: [{ type: 'transfer', status: 'confirmed', detail: 'Aéroport ↔ hôtel' }],
      baggage: baggageFor('economy'),
      totalPrice: 91_300,
      ownerId: DEMO_USER.id,
      source: 'demo',
    },
    {
      pnr: 'CDG8T1',
      status: 'completed',
      createdAt: createdDaysAgo(360),
      legs: [leg('AF', 'AF 575', 'JIB', 'CDG', d(-330), '23:55'), leg('AF', 'AF 574', 'CDG', 'JIB', d(-316), '10:15')],
      cabin: 'business',
      fareName: 'Flex',
      passengers: [hodan],
      contact,
      services: [{ type: 'lounge', status: 'confirmed', detail: 'Salon au départ de Paris' }],
      baggage: baggageFor('business'),
      totalPrice: 512_000,
      ownerId: DEMO_USER.id,
      source: 'demo',
    },
  ]
}

export function demoNotifications(now = Date.now()): AppNotification[] {
  const hoursAgo = (hours: number) => new Date(now - hours * 3_600_000).toISOString()
  const userId = DEMO_USER.id
  return [
    {
      id: 'demo-n1',
      userId,
      type: 'flight',
      title: 'Votre voyage à Istanbul approche',
      message: "Vol TK 686 dans 19 jours. L'enregistrement se fera auprès de la compagnie, en général 24 h avant le départ.",
      createdAt: hoursAgo(3),
      read: false,
      link: '/espace-client/reservations',
    },
    {
      id: 'demo-n2',
      userId,
      type: 'booking',
      title: 'Demande DXB5M8 en cours de traitement',
      message: 'Un conseiller vérifie la disponibilité réelle et le tarif de votre voyage à Dubai.',
      createdAt: hoursAgo(26),
      read: false,
      link: '/espace-client/reservations',
    },
    {
      id: 'demo-n3',
      userId,
      type: 'offer',
      title: 'Nouvelle offre : Escapade sur le Bosphore',
      message: 'Notre sélection pour Istanbul cet automne (prix indicatifs fictifs).',
      createdAt: hoursAgo(52),
      read: true,
      link: '/offres',
    },
    {
      id: 'demo-n4',
      userId,
      type: 'service',
      title: 'Assurance voyage confirmée',
      message: 'Votre assurance pour la réservation FLS7K2 est confirmée (démonstration).',
      createdAt: hoursAgo(120),
      read: true,
      link: '/espace-client/services',
    },
    {
      id: 'demo-n5',
      userId,
      type: 'account',
      title: 'Bienvenue dans votre espace client',
      message: 'Retrouvez ici vos réservations, vos bagages, vos services et vos notifications.',
      createdAt: hoursAgo(24 * 90),
      read: true,
    },
  ]
}
