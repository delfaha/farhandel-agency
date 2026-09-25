import { ArrowRight, MessageCircle, PhoneCall, Plane, Send, ThumbsUp } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { contactLinks } from '@/config/site'
import { IMAGES } from '@/data/images'
import { SERVICES } from '@/data/services'
import { useSeo } from '@/hooks/useSeo'

const PROCESS = [
  { icon: MessageCircle, title: 'Votre demande', text: 'En ligne, par téléphone, WhatsApp ou à l’agence, au centre-ville.' },
  { icon: Send, title: 'Notre proposition', text: 'Itinéraires, horaires et tarifs réels comparés pour vous, sans engagement.' },
  { icon: ThumbsUp, title: 'Votre confirmation', text: 'Émission des billets et des services choisis, documents envoyés.' },
  { icon: Plane, title: 'Bon voyage', text: 'Assistance avant, pendant et après le voyage, jusqu’au retour.' },
]

export default function ServicesPage() {
  useSeo({
    title: 'Services',
    description: "Réservation de billets, assistance voyage, hôtels, transferts, assurance, bagages, voyages d'affaires et conseils : les services de FarhanDel Agency à Djibouti.",
  })

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Un seul interlocuteur, <em>tout votre voyage</em>
          </>
        }
        description="De la réservation de billets à l'assistance sur place, nous prenons en charge chaque détail avec l'expertise du secteur aérien."
        image={IMAGES.tarmac}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Services' }]}
      />

      <section aria-labelledby="services-grid" className="bg-ivory py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading id="services-grid" eyebrow="Nos services" title={<>Ce que nous faisons <em>pour vous</em></>} align="center" />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {SERVICES.map((service, index) => (
              <StaggerItem key={service.id}>
                <ServiceCard service={service} index={index} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="process-title" className="on-dark bg-night-950 py-20 text-white sm:py-28">
        <div className="container-page">
          <SectionHeading id="process-title" tone="dark" eyebrow="Comment ça marche" title={<>Quatre étapes, <em>zéro souci</em></>} />
          <Stagger className="relative mt-14 grid gap-8 md:grid-cols-4" stagger={0.14}>
            <span aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-sand-400/0 via-sand-400/50 to-sand-400/0 md:block" />
            {PROCESS.map((step, index) => (
              <StaggerItem key={step.title} className="relative">
                <span className="relative grid size-14 place-items-center rounded-full border border-sand-300/40 bg-night-900 text-sand-300">
                  <step.icon aria-hidden="true" className="size-6" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">Étape {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-14 flex flex-wrap gap-3">
            <ButtonLink to="/reserver" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Commencer une réservation
            </ButtonLink>
            <ButtonAnchor href={contactLinks.tel} variant="outline-light" iconLeft={<PhoneCall className="size-4" aria-hidden="true" />}>
              Parler à un conseiller
            </ButtonAnchor>
          </Reveal>
        </div>
      </section>
    </>
  )
}
