import { DestinationsMarquee } from '@/components/home/DestinationsMarquee'
import { DjiboutiTurkeySection } from '@/components/home/DjiboutiTurkeySection'
import { ExperienceSection } from '@/components/home/ExperienceSection'
import { Hero } from '@/components/home/hero/Hero'
import { ContactCta, HomeDestinations, HomeOffers, ServicesPreview, WhyFarhanDel } from '@/components/home/HomeSections'
import { useSeo } from '@/hooks/useSeo'

export default function HomePage() {
  useSeo({})

  return (
    <>
      <Hero />
      <DestinationsMarquee />
      <ExperienceSection />
      <HomeDestinations />
      <DjiboutiTurkeySection />
      <HomeOffers />
      <WhyFarhanDel />
      <ServicesPreview />
      <ContactCta />
    </>
  )
}
