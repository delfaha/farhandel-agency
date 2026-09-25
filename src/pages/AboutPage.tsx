import { ArrowRight, Compass, Eye, HeartHandshake, Scale } from 'lucide-react'
import { FlagBadge } from '@/components/brand/Flags'
import { DjiboutiTurkeySection } from '@/components/home/DjiboutiTurkeySection'
import { ExperienceSection } from '@/components/home/ExperienceSection'
import { PageHero } from '@/components/layout/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { INDEPENDENCE_NOTICE, SITE } from '@/config/site'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'

const VALUES = [
  { icon: Compass, title: 'Mission', text: 'Rendre le voyage aérien simple, sûr et serein pour chaque voyageur au départ ou à destination de Djibouti.' },
  { icon: Eye, title: 'Vision', text: 'Faire de Djibouti un point de départ naturel vers le monde, grâce à un conseil aérien de haut niveau.' },
  { icon: HeartHandshake, title: 'Proximité', text: 'Une agence à taille humaine : un conseiller qui connaît votre dossier et répond vraiment.' },
  { icon: Scale, title: 'Transparence', text: 'Des conditions claires, des tarifs expliqués et aucune promesse que nous ne pouvons tenir.' },
]

export default function AboutPage() {
  useSeo({
    title: 'À propos',
    description: `FarhanDel Agency, agence de voyage aérien à Djibouti dirigée par ${SITE.representative.name} : 15+ ans d'expérience dans le secteur aérien international.`,
  })

  return (
    <>
      <PageHero
        eyebrow="À propos"
        title={
          <>
            Une agence née de <em>15 ans d'aérien</em>
          </>
        }
        description="FarhanDel Agency met l'expérience du secteur aérien international au service des voyageurs de Djibouti et du monde."
        image={IMAGES.wingSunset}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'À propos' }]}
      />

      <section aria-labelledby="story-title" className="bg-white py-20 sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            id="story-title"
            eyebrow="Notre histoire"
            title={
              <>
                De l'aérien international <em>à votre voyage</em>
              </>
            }
          />
          <Reveal className="space-y-5 text-lead text-night-700" delay={0.1}>
            <p>
              FarhanDel Agency est dirigée par <strong className="text-night-900">{SITE.representative.name}</strong>. Son parcours : plus de quinze
              années d'expérience dans le secteur aérien, dont plusieurs comme <strong className="text-night-900">Senior Agent au sein d'une grande compagnie internationale</strong>.
            </p>
            <p>
              Cette connaissance du terrain — règles tarifaires, correspondances, bagages, situations imprévues — est aujourd'hui mise au service des
              voyageurs, depuis notre agence du centre-ville de Djibouti.
            </p>
            <p className="flex items-center gap-3 text-base text-night-500">
              <FlagBadge flag="djibouti" className="size-7" />
              <FlagBadge flag="turkey" className="size-7" />
              {SITE.connecting}
            </p>
          </Reveal>
        </div>
      </section>

      <ExperienceSection />

      <section aria-labelledby="values-title" className="bg-white py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading id="values-title" eyebrow="Nos engagements" title={<>Ce qui nous <em>guide</em></>} align="center" />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {VALUES.map((value) => (
              <StaggerItem key={value.title} className="rounded-[1.75rem] border border-line bg-ivory p-7 transition duration-500 hover:-translate-y-1 hover:shadow-card">
                <value.icon aria-hidden="true" className="size-7 text-sand-600" />
                <h3 className="mt-6 text-xl font-semibold text-night-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-night-600">{value.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <DjiboutiTurkeySection />

      <section className="bg-ivory py-16">
        <div className="container-page">
          <Reveal className="rounded-3xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-night-600">Indépendance</h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-night-600">{INDEPENDENCE_NOTICE}</p>
            <ButtonLink to="/contact" variant="dark" className="mt-6" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Rencontrer l'agence
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  )
}
