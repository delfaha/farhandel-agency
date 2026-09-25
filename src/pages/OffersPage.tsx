import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { OfferCarousel } from '@/components/offers/OfferCarousel'
import { OfferCard, OfferModal } from '@/components/offers/OfferCard'
import { DemoNotice } from '@/components/ui/Misc'
import { Reveal } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { IMAGES } from '@/data/images'
import { OFFER_BADGE_META, OFFERS } from '@/data/offers'
import { useSeo } from '@/hooks/useSeo'
import type { Offer, OfferBadge } from '@/types/content'
import { cn } from '@/utils/cn'

type Filter = OfferBadge | 'toutes'

export default function OffersPage() {
  useSeo({
    title: 'Offres spéciales',
    description: 'Offres spéciales FarhanDel Agency au départ de Djibouti : promotions, nouveautés, vols directs et destinations populaires (prix indicatifs).',
  })
  const [filter, setFilter] = useState<Filter>('toutes')
  const [selected, setSelected] = useState<Offer | null>(null)
  const list = useMemo(() => (filter === 'toutes' ? OFFERS : OFFERS.filter((offer) => offer.badges.includes(filter))), [filter])
  const filters: Filter[] = ['toutes', 'promotion', 'nouveau', 'direct', 'populaire']

  return (
    <>
      <PageHero
        eyebrow="Offres spéciales"
        title={
          <>
            Des offres pensées <em>pour voyager mieux</em>
          </>
        }
        description="Promotions de saison, nouvelles routes et vols directs : une sélection de l'agence, avec un accompagnement de A à Z."
        image={IMAGES.dramaticSky}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Offres' }]}
      />

      <section aria-labelledby="offers-featured" className="bg-white py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading id="offers-featured" eyebrow="À saisir" title={<>Les offres <em>du moment</em></>} />
          <DemoNotice className="mt-6 max-w-3xl">Prix et périodes de démonstration : fictifs, non contractuels, sous réserve de disponibilité réelle.</DemoNotice>
          <Reveal className="mt-10" delay={0.1}>
            <OfferCarousel offers={OFFERS.filter((offer) => offer.badges.includes('promotion') || offer.badges.includes('nouveau'))} autoplay />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="offers-all" className="bg-ivory py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading id="offers-all" eyebrow="Toutes les offres" title={<>Filtrer par <em>type d'offre</em></>} />
          <div role="group" aria-label="Filtrer les offres" className="mt-8 flex flex-wrap gap-2">
            {filters.map((value) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'relative rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-300',
                    active ? 'border-night-900 text-white' : 'border-line bg-white text-night-700 hover:border-night-300',
                  )}
                >
                  {active && <motion.span layoutId="offer-filter" className="absolute inset-0 rounded-full bg-night-900" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
                  <span className="relative">{value === 'toutes' ? 'Toutes' : OFFER_BADGE_META[value].label}</span>
                </button>
              )
            })}
          </div>
          <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((offer) => (
                <motion.li
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OfferCard offer={offer} onOpen={setSelected} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </section>
      <OfferModal offer={selected} onClose={() => setSelected(null)} />
    </>
  )
}
