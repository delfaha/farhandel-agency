import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { DestinationCard } from '@/components/destinations/DestinationCard'
import { DestinationCarousel } from '@/components/destinations/DestinationCarousel'
import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/Misc'
import { Reveal } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { REGION_LABELS } from '@/data/airports'
import { DESTINATION_REGIONS, DESTINATIONS, FEATURED_DESTINATIONS } from '@/data/destinations'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'
import type { Region } from '@/types/flight'
import { cn } from '@/utils/cn'

type Filter = Region | 'toutes'

export default function DestinationsPage() {
  useSeo({
    title: 'Destinations',
    description: 'Destinations au départ de Djibouti : Afrique, Moyen-Orient, Europe et Asie. Istanbul, Dubai, Paris, Addis-Abeba, Nairobi, Doha, Jeddah…',
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('region') as Filter | null
  const filter: Filter = requested && (requested === 'toutes' || DESTINATION_REGIONS.includes(requested as Region)) ? requested : 'toutes'
  const [hovered, setHovered] = useState<Filter | null>(null)
  const list = useMemo(() => (filter === 'toutes' ? DESTINATIONS : DESTINATIONS.filter((destination) => destination.region === filter)), [filter])

  const setFilter = (value: Filter) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'toutes') next.delete('region')
    else next.set('region', value)
    setSearchParams(next, { preventScrollReset: true, replace: true })
  }

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'toutes', label: 'Toutes', count: DESTINATIONS.length },
    ...DESTINATION_REGIONS.map((region) => ({ value: region, label: REGION_LABELS[region], count: DESTINATIONS.filter((destination) => destination.region === region).length })),
  ]

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={
          <>
            From Djibouti <em>to the World</em>
          </>
        }
        description="Des destinations choisies pour les affaires, la famille, les études, le pèlerinage ou la découverte — avec un conseiller à chaque étape."
        image={IMAGES.wingClouds}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Destinations' }]}
      />

      <section aria-labelledby="featured-title" className="bg-white py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading id="featured-title" eyebrow="À la une" title={<>Nos destinations <em>phares</em></>} />
          <Reveal className="mt-12" delay={0.1}>
            <DestinationCarousel destinations={FEATURED_DESTINATIONS} autoplay label="Destinations phares" />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="all-title" className="bg-ivory py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            id="all-title"
            eyebrow="Par région"
            title={<>Explorer par <em>région</em></>}
            description="Afrique, Moyen-Orient, Europe et Asie : filtrez les destinations desservies par nos conseillers."
          />

          <LayoutGroup>
            <div role="group" aria-label="Filtrer par région" className="mt-10 flex flex-wrap gap-2" onPointerLeave={() => setHovered(null)}>
              {filters.map((item) => {
                const active = filter === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(item.value)}
                    onPointerEnter={() => setHovered(item.value)}
                    className={cn('relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300', active ? 'text-white' : 'text-night-700 hover:text-night-900')}
                  >
                    {active && <motion.span layoutId="region-pill" className="absolute inset-0 rounded-full bg-night-900" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
                    {!active && hovered === item.value && <motion.span layoutId="region-hover" className="absolute inset-0 rounded-full bg-white shadow-soft" />}
                    <span className="relative">
                      {item.label} <span className={cn('ml-1 text-xs', active ? 'text-sand-300' : 'text-night-400')}>{item.count}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((destination) => (
                  <motion.li
                    key={destination.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <DestinationCard destination={destination} size="regular" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>

          <DemoNotice className="mt-10 max-w-3xl">
            Prix « à partir de » indicatifs et fictifs, calculés pour un aller-retour en classe Économique : ils ne représentent pas des disponibilités réelles.
          </DemoNotice>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-page">
          <Reveal className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-line bg-ivory p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-3xl text-night-900 sm:text-4xl">Votre destination n'est pas listée ?</h2>
              <p className="mt-2 text-night-600">Nos conseillers organisent des voyages vers la plupart des aéroports du monde.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/contact" variant="dark" iconLeft={<MessageCircle className="size-4" aria-hidden="true" />}>
                Nous contacter
              </ButtonLink>
              <ButtonLink to="/reserver" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
                Rechercher un vol
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
