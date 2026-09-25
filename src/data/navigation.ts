import { BadgeCheck, Luggage, Plane, Radar } from 'lucide-react'
import type { NavItem } from '@/types/content'

export const MAIN_NAV: NavItem[] = [
  { label: 'Accueil', to: '/' },
  { label: 'Réserver', to: '/reserver' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Offres', to: '/offres' },
  { label: 'Services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
]

/** Sous-menu « Réserver » : les quatre parcours du dashboard. */
export const BOOKING_NAV: NavItem[] = [
  { label: 'Réserver un vol', to: '/reserver', description: 'Aller-retour, aller simple ou multidestination', icon: Plane },
  { label: 'Gérer ma réservation', to: '/ma-reservation', description: 'Itinéraire, bagages, services', icon: Luggage },
  { label: 'Check-in', to: '/check-in', description: 'Préparer votre enregistrement', icon: BadgeCheck },
  { label: 'Statut du vol', to: '/statut-vol', description: 'Horaires et suivi en temps réel (démo)', icon: Radar },
]

export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: 'Agence',
    links: [
      { label: 'À propos', to: '/a-propos' },
      { label: 'Notre expertise', to: '/a-propos#expertise' },
      { label: 'Espace client', to: '/espace-client' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Navigation',
    links: [
      { label: 'Accueil', to: '/' },
      { label: 'Réserver un vol', to: '/reserver' },
      { label: 'Destinations', to: '/destinations' },
      { label: 'Offres spéciales', to: '/offres' },
      { label: 'Services', to: '/services' },
    ],
  },
  {
    title: 'Destinations',
    links: [
      { label: 'Istanbul', to: '/reserver?de=JIB&vers=IST' },
      { label: 'Dubai', to: '/reserver?de=JIB&vers=DXB' },
      { label: 'Addis-Abeba', to: '/reserver?de=JIB&vers=ADD' },
      { label: 'Paris', to: '/reserver?de=JIB&vers=CDG' },
      { label: 'Jeddah', to: '/reserver?de=JIB&vers=JED' },
      { label: 'Toutes les destinations', to: '/destinations' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Réservation de billets', to: '/services#billets' },
      { label: 'Hôtels', to: '/services#hotels' },
      { label: 'Transferts', to: '/services#transferts' },
      { label: 'Assurance voyage', to: '/services#assurance' },
      { label: "Voyages d'affaires", to: '/services#affaires' },
    ],
  },
  {
    title: 'Assistance',
    links: [
      { label: 'Gérer ma réservation', to: '/ma-reservation' },
      { label: 'Check-in', to: '/check-in' },
      { label: 'Statut du vol', to: '/statut-vol' },
      { label: 'Bagages', to: '/services#bagages' },
    ],
  },
]

export const LEGAL_NAV: NavItem[] = [
  { label: 'Conditions générales', to: '/conditions-generales' },
  { label: 'Politique de confidentialité', to: '/politique-de-confidentialite' },
  { label: 'Mentions légales', to: '/mentions-legales' },
]
