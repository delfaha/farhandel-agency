import type { LucideIcon } from 'lucide-react'
import type { CabinClass, Region } from './flight'

/** Photographie (Unsplash, licence libre) : identifiant + texte alternatif. */
export interface ImageRef {
  id: string
  alt: string
  /** Point focal (object-position CSS), ex. « 50% 30% ». */
  position?: string
}

export interface Destination {
  slug: string
  city: string
  country: string
  airport: string
  airportName: string
  region: Region
  image: ImageRef
  description: string
  highlights: string[]
  /** Ville d'origine utilisée pour le prix indicatif (JIB par défaut). */
  priceFrom: string
  featured?: boolean
}

export type OfferBadge = 'promotion' | 'nouveau' | 'direct' | 'populaire'

export interface Offer {
  id: string
  title: string
  destination: string
  from: string
  image: ImageRef
  period: { start: string; end: string }
  /** Prix indicatif fictif (DJF). */
  price: number
  trip: 'roundtrip' | 'oneway'
  cabin: CabinClass
  description: string
  includes: string[]
  conditions: string[]
  badges: OfferBadge[]
}

export interface ServiceItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  points: string[]
}

export interface NavItem {
  label: string
  to: string
  description?: string
  icon?: LucideIcon
}
