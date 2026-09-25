import { ArrowRight, Award, Globe, HeartHandshake, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { DestinationCarousel } from '@/components/destinations/DestinationCarousel'
import { OfferCarousel } from '@/components/offers/OfferCarousel'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { DemoNotice, WhatsAppIcon } from '@/components/ui/Misc'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { contactLinks, SITE } from '@/config/site'
import { FEATURED_DESTINATIONS } from '@/data/destinations'
import { OFFERS } from '@/data/offers'
import { SERVICES } from '@/data/services'

export function HomeDestinations() {
  return (
    <section aria-labelledby="home-destinations-title" className="bg-white py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          id="home-destinations-title"
          eyebrow="Destinations"
          title={
            <>
              Au départ de Djibouti, <em>vers l'essentiel</em>
            </>
          }
          description="Afrique, Moyen-Orient, Europe et Asie : une sélection de destinations accompagnées par nos conseillers."
          action={
            <ButtonLink to="/destinations" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Toutes les destinations
            </ButtonLink>
          }
        />
        <Reveal className="mt-12" delay={0.1}>
          <DestinationCarousel destinations={FEATURED_DESTINATIONS} autoplay />
        </Reveal>
      </div>
    </section>
  )
}

export function HomeOffers() {
  return (
    <section aria-labelledby="home-offers-title" className="bg-ivory py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          id="home-offers-title"
          eyebrow="Offres du moment"
          title={
            <>
              Des envies d'ailleurs, <em>au bon prix</em>
            </>
          }
          description="Promotions, nouveautés et vols directs sélectionnés par l'agence."
          action={
            <ButtonLink to="/offres" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Toutes les offres
            </ButtonLink>
          }
        />
        <Reveal className="mt-6" delay={0.05}>
          <DemoNotice className="max-w-3xl">Offres de démonstration : les prix et périodes affichés sont fictifs et non contractuels.</DemoNotice>
        </Reveal>
        <Reveal className="mt-10" delay={0.1}>
          <OfferCarousel offers={OFFERS.slice(0, 6)} />
        </Reveal>
      </div>
    </section>
  )
}

const REASONS = [
  { icon: Award, title: 'Expertise', text: '15+ années dans le secteur aérien, au plus près des compagnies et de leurs règles.' },
  { icon: HeartHandshake, title: 'Accompagnement', text: 'Une assistance personnalisée, avant, pendant et après votre voyage.' },
  { icon: Globe, title: 'International', text: 'Une vision tournée vers le monde, depuis notre base de Djibouti.' },
  { icon: ShieldCheck, title: 'Confiance', text: 'Une relation durable avec nos voyageurs, fondée sur la transparence.' },
]

export function WhyFarhanDel() {
  return (
    <section aria-labelledby="why-title" className="bg-white py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          id="why-title"
          align="center"
          eyebrow="Pourquoi nous choisir"
          title={
            <>
              Pourquoi <em>FarhanDel Agency</em> ?
            </>
          }
          description="L'exigence d'un professionnel de l'aérien, la proximité d'une agence à taille humaine."
        />
        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
          {REASONS.map((reason, index) => (
            <StaggerItem key={reason.title} className="group relative bg-white p-8 transition-colors duration-500 hover:bg-night-900">
              <span className="font-display text-5xl text-night-100 transition-colors duration-500 group-hover:text-white/15">
                {String(index + 1).padStart(2, '0')}
              </span>
              <reason.icon aria-hidden="true" className="mt-8 size-7 text-sand-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-sand-300" />
              <h3 className="mt-5 text-xl font-semibold text-night-900 transition-colors duration-500 group-hover:text-white">{reason.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-night-600 transition-colors duration-500 group-hover:text-white/70">{reason.text}</p>
              <span aria-hidden="true" className="absolute bottom-0 left-8 right-8 h-[3px] origin-left scale-x-0 rounded-t-full bg-sand-400 transition-transform duration-500 ease-premium group-hover:scale-x-100" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

export function ServicesPreview() {
  return (
    <section aria-labelledby="home-services-title" className="bg-ivory py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          id="home-services-title"
          eyebrow="Services"
          title={
            <>
              Tout votre voyage, <em>entre de bonnes mains</em>
            </>
          }
          description="Billets, hôtels, transferts, assurance : un interlocuteur unique pour chaque étape."
          action={
            <ButtonLink to="/services" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Tous nos services
            </ButtonLink>
          }
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {SERVICES.slice(0, 6).map((service, index) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} index={index} showPoints={false} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

export function ContactCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-white py-20 sm:py-28">
      <div className="container-page">
        <Reveal variant="zoom" className="on-dark relative isolate overflow-hidden rounded-[2.25rem] bg-night-900 px-6 py-14 text-white sm:px-14 sm:py-20">
          <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 size-[460px] rounded-full bg-sand-400/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-40 -left-20 -z-10 size-[420px] rounded-full bg-azure-500/20 blur-3xl" />
          <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-eyebrow font-semibold uppercase text-sand-300">{SITE.signature}</p>
              <h2 id="cta-title" className="mt-4 font-display text-h2">
                Parlons de votre <em className="text-sand-300">prochain voyage</em>
              </h2>
              <p className="mt-5 max-w-xl text-lead text-white/70">
                Un conseiller vous répond et construit avec vous l'itinéraire idéal : dates, budget, escales, bagages et services.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonAnchor href={contactLinks.tel} iconLeft={<Phone className="size-4" aria-hidden="true" />}>
                  Appeler l'agence
                </ButtonAnchor>
                <ButtonAnchor href={contactLinks.whatsapp('Bonjour FarhanDel Agency, je prépare un voyage.')} variant="glass" iconLeft={<WhatsAppIcon className="size-4" />}>
                  WhatsApp
                </ButtonAnchor>
                <ButtonLink to="/contact" variant="outline-light" iconLeft={<Mail className="size-4" aria-hidden="true" />}>
                  Nous écrire
                </ButtonLink>
              </div>
            </div>
            <address className="glass rounded-3xl p-6 not-italic">
              <p className="font-display text-2xl">{SITE.representative.name}</p>
              <p className="text-sm text-white/60">{SITE.representative.role}</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a href={contactLinks.tel} className="flex items-center gap-3 hover:text-sand-300">
                    <Phone aria-hidden="true" className="size-4 text-sand-300" />
                    {SITE.phone.display}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin aria-hidden="true" className="size-4 text-sand-300" />
                  {SITE.address.street}, {SITE.address.city}
                </li>
              </ul>
            </address>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
