import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { useState } from 'react'
import { ContactForm } from '@/components/contact/ContactForm'
import { PageHero } from '@/components/layout/PageHero'
import { ButtonAnchor } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/Misc'
import { Reveal } from '@/components/ui/Motion'
import { contactLinks, SITE } from '@/config/site'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'

function LocationMap() {
  const [loaded, setLoaded] = useState(false)
  const { lat, lng } = SITE.coordinates
  const bbox = [lng - 0.012, lat - 0.008, lng + 0.012, lat + 0.008].map((value) => value.toFixed(4)).join('%2C')
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-mist">
      {!loaded && <div aria-hidden="true" className="skeleton absolute inset-0" />}
      <iframe
        title={`Carte de localisation — ${SITE.address.street}, ${SITE.address.city}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="relative block h-[340px] w-full border-0 grayscale-[35%] sm:h-[420px]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-4 text-sm">
        <p className="text-night-600">Position indicative — adresse exacte à confirmer.</p>
        <div className="flex flex-wrap gap-4">
          <a href={contactLinks.maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-azure-600 hover:underline">
            Agrandir la carte <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
          <a href={contactLinks.directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-azure-600 hover:underline">
            Itinéraire <Navigation aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  useSeo({
    title: 'Contact',
    description: `Contactez FarhanDel Agency à Djibouti : ${SITE.phone.display}, WhatsApp, ${SITE.address.street}. ${SITE.representative.name} et son équipe répondent à vos demandes de voyage.`,
  })

  const items = [
    { icon: Phone, label: 'Téléphone', value: SITE.phone.display, href: contactLinks.tel },
    { icon: MapPin, label: 'Adresse', value: `${SITE.address.street}, ${SITE.address.city}` },
    { icon: Mail, label: 'Email', value: SITE.email, href: contactLinks.email() },
    { icon: Clock, label: 'Horaires', value: SITE.hours },
  ]

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Parlons de votre <em>voyage</em>
          </>
        }
        description="Une question, un devis, un changement de dernière minute ? Nous vous répondons rapidement."
        image={IMAGES.calmSky}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Contact' }]}
      />

      <section className="bg-ivory py-16 sm:py-24">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1} className="space-y-5">
            <address className="on-dark rounded-[1.75rem] bg-night-900 p-7 not-italic text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">Votre conseiller</p>
              <p className="mt-2 font-display text-3xl">{SITE.representative.name}</p>
              <p className="text-sm text-white/60">
                {SITE.representative.role} · {SITE.representative.years}+ ans d'expérience dans l'aérien
              </p>
              <ul className="mt-6 space-y-4">
                {items.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sand-300">
                      <item.icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="block text-white/55">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="break-words font-semibold hover:text-sand-300">
                          {item.value}
                        </a>
                      ) : (
                        <span className="font-semibold">{item.value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 grid grid-cols-2 gap-2">
                <ButtonAnchor href={contactLinks.tel} size="sm" iconLeft={<Phone className="size-4" aria-hidden="true" />}>
                  Appeler
                </ButtonAnchor>
                <ButtonAnchor href={contactLinks.whatsapp('Bonjour FarhanDel Agency !')} size="sm" variant="glass" iconLeft={<WhatsAppIcon className="size-4" />}>
                  WhatsApp
                </ButtonAnchor>
              </div>
            </address>
          </Reveal>
        </div>

        <div className="container-page mt-8">
          <Reveal>
            <h2 className="sr-only">Localisation de l'agence</h2>
            <LocationMap />
          </Reveal>
        </div>
      </section>
    </>
  )
}
