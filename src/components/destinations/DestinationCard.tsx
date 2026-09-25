import { ArrowUpRight, MapPin, Plane } from 'lucide-react'
import { Link } from 'react-router'
import { SmartImage } from '@/components/ui/SmartImage'
import { airportLabel, REGION_LABELS } from '@/data/airports'
import { indicativePrice } from '@/services/mock/flightGenerator'
import type { Destination } from '@/types/content'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

const priceCache = new Map<string, number | null>()

/** Prix indicatif FICTIF « à partir de » (aller-retour Économique) calculé par le générateur de démonstration. */
function destinationPrice(destination: Destination): number | null {
  const from = destination.priceFrom
  const key = `${from}-${destination.airport}`
  if (!priceCache.has(key)) priceCache.set(key, indicativePrice(from, destination.airport))
  return priceCache.get(key) ?? null
}

function bookingLink(destination: Destination): string {
  return `/reserver?de=${destination.priceFrom}&vers=${destination.airport}`
}

interface DestinationCardProps {
  destination: Destination
  className?: string
  /** Variante haute (carrousel) ou compacte (grille). */
  size?: 'tall' | 'regular'
}

/** Carte destination : grande photo, ville, pays, aéroport, description, prix indicatif, bouton « Réserver ». */
export function DestinationCard({ destination, className, size = 'tall' }: DestinationCardProps) {
  const price = destinationPrice(destination)
  return (
    <article
      className={cn(
        'group relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-night-900 text-white shadow-card',
        size === 'tall' ? 'min-h-[520px]' : 'min-h-[460px]',
        className,
      )}
    >
      <SmartImage
        image={destination.image}
        ratio={1.3}
        maxWidth={1080}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
        className="absolute inset-0 -z-10"
        imgClassName="transition-transform duration-[1.4s] ease-premium group-hover:scale-[1.07]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_15_29/0.35)_0%,transparent_28%,rgb(6_15_29/0.55)_55%,rgb(6_15_29/0.95)_100%)]" />

      <div className="flex items-start justify-between gap-3 p-5">
        <span className="glass rounded-full px-3 py-1 text-xs font-semibold">{REGION_LABELS[destination.region]}</span>
        <span className="glass rounded-full px-3 py-1 text-xs font-bold tracking-[0.14em]">{destination.airport}</span>
      </div>

      <div className="mt-auto p-6 pt-0">
        <p className="flex items-center gap-1.5 text-sm text-white/75">
          <MapPin aria-hidden="true" className="size-3.5" />
          {destination.country}
        </p>
        <h3 className="mt-1 font-display text-[2.6rem] leading-none">{destination.city}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/65">
          <Plane aria-hidden="true" className="size-3.5 rotate-45" />
          {destination.airportName}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">{destination.description}</p>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-4">
          <p className="text-xs text-white/65">
            {destination.priceFrom === 'JIB' ? 'Aller-retour dès' : `Depuis ${airportLabel(destination.priceFrom)} dès`}
            <span className="block text-xl font-semibold text-white">{price ? formatPrice(price) : 'Sur demande'}</span>
            <span className="text-[0.68rem]">Prix indicatif fictif</span>
          </p>
          <Link
            to={bookingLink(destination)}
            aria-label={`Réserver un vol pour ${destination.city}`}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-night-900 transition duration-300 hover:bg-sand-300 after:absolute after:inset-0 after:content-['']"
          >
            Réserver
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
