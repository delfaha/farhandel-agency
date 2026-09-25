import { useState } from 'react'
import { Carousel } from '@/components/ui/Carousel'
import type { Offer } from '@/types/content'
import { OfferCard, OfferModal } from './OfferCard'

/** Défilement horizontal des offres, avec modale de détail. */
export function OfferCarousel({ offers, autoplay = false }: { offers: Offer[]; autoplay?: boolean }) {
  const [selected, setSelected] = useState<Offer | null>(null)
  return (
    <>
      <Carousel
        items={offers}
        getKey={(offer) => offer.id}
        label="Offres spéciales"
        autoplay={autoplay}
        itemClassName="w-[86%] sm:w-[47%] lg:w-[31.9%]"
        renderItem={(offer) => <OfferCard offer={offer} onOpen={setSelected} />}
      />
      <OfferModal offer={selected} onClose={() => setSelected(null)} />
    </>
  )
}
