import { Carousel } from '@/components/ui/Carousel'
import type { Destination } from '@/types/content'
import { DestinationCard } from './DestinationCard'

interface DestinationCarouselProps {
  destinations: Destination[]
  autoplay?: boolean
  label?: string
  tone?: 'light' | 'dark'
}

/** Carrousel de destinations : flèches, balayage mobile, pagination, lecture automatique optionnelle. */
export function DestinationCarousel({ destinations, autoplay = false, label = 'Destinations au départ de Djibouti', tone = 'light' }: DestinationCarouselProps) {
  return (
    <Carousel
      items={destinations}
      getKey={(destination) => destination.slug}
      label={label}
      autoplay={autoplay}
      tone={tone}
      itemClassName="w-[84%] sm:w-[46%] lg:w-[31.9%]"
      renderItem={(destination) => <DestinationCard destination={destination} />}
    />
  )
}
