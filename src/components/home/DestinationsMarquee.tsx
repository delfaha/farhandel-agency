import { Plane } from 'lucide-react'
import { DESTINATIONS } from '@/data/destinations'

/** Bandeau défilant (horizontal, infini) des villes desservies — se met en pause au survol. */
export function DestinationsMarquee() {
  const items = DESTINATIONS.map((destination) => ({ city: destination.city, code: destination.airport }))
  const renderRow = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item.code} className="flex items-center">
          <span className="px-6 font-display text-3xl text-white/85 sm:text-4xl">{item.city}</span>
          <span className="rounded-md border border-white/20 px-2 py-0.5 text-xs font-bold tracking-[0.2em] text-sand-300">{item.code}</span>
          <Plane aria-hidden="true" className="ml-6 size-4 rotate-45 text-white/30" />
        </li>
      ))}
    </ul>
  )

  return (
    <section aria-label="Villes desservies" className="marquee on-dark relative overflow-hidden border-y border-white/10 bg-night-950 py-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-night-950 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-night-950 to-transparent" />
      <div className="marquee-track flex w-max" style={{ ['--marquee-duration' as string]: '70s' }}>
        {renderRow(false)}
        {renderRow(true)}
      </div>
    </section>
  )
}
