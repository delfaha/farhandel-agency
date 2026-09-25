import { ArrowRight, Hash, Mail, Plane, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { WavingFlag } from '@/components/brand/Flags'
import { LogoMark } from '@/components/brand/Logo'
import { BoxInput } from '@/components/booking/SearchFields'
import { DestinationCard } from '@/components/destinations/DestinationCard'
import { PageHero } from '@/components/layout/PageHero'
import { OfferCard, OfferModal } from '@/components/offers/OfferCard'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Badge, BookingStatusBadge, FlightStatusBadge } from '@/components/ui/Badge'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Checkbox, PasswordInput, SelectInput, TextArea, TextInput } from '@/components/ui/Field'
import { LoadingState, Skeleton, Spinner } from '@/components/ui/LoadingState'
import { DemoNotice } from '@/components/ui/Misc'
import { Modal } from '@/components/ui/Modal'
import { Counter, Reveal, SplitText } from '@/components/ui/Motion'
import { IMAGES } from '@/data/images'
import { DESTINATIONS } from '@/data/destinations'
import { OFFERS } from '@/data/offers'
import { SERVICES } from '@/data/services'
import { useSeo } from '@/hooks/useSeo'
import { useToast } from '@/hooks/useStore'
import type { Offer } from '@/types/content'
import type { BookingStatus } from '@/types/booking'
import type { FlightStatusCode } from '@/types/flight'

const PALETTES: { name: string; token: string; shades: [string, string][] }[] = [
  {
    name: 'Nuit — couleur de marque, surfaces sombres, texte',
    token: 'night',
    shades: [['50', '#f2f5fa'], ['100', '#e2e8f1'], ['200', '#c4d0e1'], ['300', '#95a8c4'], ['400', '#6781a6'], ['500', '#46628b'], ['600', '#304b72'], ['700', '#203858'], ['800', '#132640'], ['900', '#0b1a2e'], ['950', '#060f1d']],
  },
  {
    name: 'Sable — actions principales, détails précieux',
    token: 'sand',
    shades: [['50', '#fcf9f2'], ['100', '#f7efdd'], ['200', '#efdcb7'], ['300', '#e4c58d'], ['400', '#d6ac66'], ['500', '#c69449'], ['600', '#a8793a'], ['700', '#815c2b'], ['800', '#5f4420'], ['900', '#3e2d16']],
  },
  {
    name: 'Azur — liens, focus, information',
    token: 'azure',
    shades: [['50', '#eef5ff'], ['100', '#d9e8ff'], ['200', '#b3d1ff'], ['300', '#80b2ff'], ['400', '#4f8ff5'], ['500', '#2f72e4'], ['600', '#215bc2'], ['700', '#1d4a9b']],
  },
  {
    name: 'Surfaces',
    token: 'surface',
    shades: [['ivory', '#f8f6f1'], ['mist', '#f1f4f8'], ['line', '#e2e7ee'], ['white', '#ffffff']],
  },
]

const TYPE_SCALE = [
  { token: 'text-display', sample: 'Travel to the World', className: 'font-display text-[clamp(3rem,1rem+5vw,6rem)] leading-[0.92]' },
  { token: 'text-h1', sample: 'Votre voyage commence ici', className: 'font-display text-h1' },
  { token: 'text-h2', sample: 'From Djibouti to the World', className: 'font-display text-h2' },
  { token: 'text-h3', sample: 'Réservation de billets', className: 'text-h3 font-semibold' },
  { token: 'text-lead', sample: 'Une expertise aérienne au service de chaque voyageur.', className: 'text-lead text-night-600' },
  { token: 'text-base', sample: 'Texte courant — Plus Jakarta Sans, 16 px, interlignage confortable.', className: 'text-base text-night-700' },
  { token: 'text-eyebrow', sample: 'Sur-titre de section', className: 'text-eyebrow font-semibold uppercase text-sand-700' },
]

const SHADOWS = ['shadow-soft', 'shadow-card', 'shadow-float', 'shadow-gold']
const RADII = [
  { name: 'Champ', value: '1rem', className: 'rounded-2xl' },
  { name: 'Carte', value: '1.5rem', className: 'rounded-3xl' },
  { name: 'Panneau', value: '1.75rem', className: 'rounded-[1.75rem]' },
  { name: 'Pilule', value: '999px', className: 'rounded-full' },
]
const VARIANTS: ButtonVariant[] = ['primary', 'dark', 'outline', 'ghost', 'danger']
const FLIGHT_STATUSES: FlightStatusCode[] = ['on-time', 'delayed', 'boarding', 'in-flight', 'landed', 'cancelled']
const BOOKING_STATUSES: BookingStatus[] = ['confirmed', 'pending', 'cancelled', 'completed']

function Block({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-t border-line py-14">
      <h2 id={`${id}-title`} className="font-display text-4xl text-night-900">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-night-600">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  useSeo({ title: 'Design System', description: 'Design system « Nuit & Sable » de FarhanDel Agency.', noindex: true })
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [password, setPassword] = useState('Voyage2026')

  const toc = [
    ['couleurs', 'Couleurs'],
    ['typographie', 'Typographie'],
    ['formes', 'Rayons & ombres'],
    ['boutons', 'Boutons'],
    ['champs', 'Champs'],
    ['badges', 'Badges'],
    ['cartes', 'Cartes'],
    ['retours', 'Modales & toasts'],
    ['mouvement', 'Animations'],
  ]

  return (
    <>
      <PageHero
        eyebrow="Design System"
        title={
          <>
            Nuit <em>&amp;</em> Sable
          </>
        }
        description="Tokens, typographies et composants de l'identité FarhanDel Agency — la référence pour faire évoluer le site."
        image={IMAGES.duskSky}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Design System' }]}
      />
      <div className="bg-ivory pb-24">
        <div className="container-page">
          <nav aria-label="Sommaire du design system" className="flex flex-wrap gap-2 py-8">
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-night-700 hover:border-night-300">
                {label}
              </a>
            ))}
          </nav>

          <Block id="couleurs" title="Couleurs" description="Palette distincte des codes rouge / blanc des compagnies. Les couleurs nationales ne servent qu'aux drapeaux.">
            <div className="space-y-8">
              {PALETTES.map((palette) => (
                <div key={palette.token}>
                  <p className="mb-3 text-sm font-semibold text-night-800">{palette.name}</p>
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
                    {palette.shades.map(([shade, hex]) => (
                      <li key={shade} className="overflow-hidden rounded-2xl border border-line bg-white">
                        <span className="block h-14" style={{ background: hex }} />
                        <span className="block px-2.5 py-2 text-xs">
                          <span className="block font-semibold text-night-900">{palette.token === 'surface' ? shade : `${palette.token}-${shade}`}</span>
                          <span className="font-mono text-night-500">{hex}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <LogoMark className="size-12" />
                  <span className="text-sm text-night-600">Monogramme (sable dégradé + « F » aux ailes biseautées)</span>
                </div>
                <div className="flex w-56 gap-3">
                  <WavingFlag flag="djibouti" amplitude={4} />
                  <WavingFlag flag="turkey" amplitude={4} />
                </div>
              </div>
            </div>
          </Block>

          <Block id="typographie" title="Typographie" description="Instrument Serif (titres éditoriaux, accents italiques) · Plus Jakarta Sans Variable (interface et lecture).">
            <ul className="space-y-6">
              {TYPE_SCALE.map((item) => (
                <li key={item.token} className="grid gap-2 border-b border-line pb-6 md:grid-cols-[180px_1fr] md:items-baseline">
                  <code className="text-xs font-semibold text-sand-700">{item.token}</code>
                  <p className={`${item.className} text-night-900`}>{item.sample}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="formes" title="Rayons, espacements & ombres" description="Espacement de section : 6–8 rem ; conteneur : 78 rem ; gouttières fluides (1 à 2 rem).">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RADII.map((radius) => (
                <div key={radius.name} className={`${radius.className} flex h-28 flex-col justify-end border border-line bg-white p-4`}>
                  <p className="font-semibold text-night-900">{radius.name}</p>
                  <p className="text-sm text-night-500">{radius.value}</p>
                </div>
              ))}
              {SHADOWS.map((shadow) => (
                <div key={shadow} className={`${shadow} flex h-28 items-end rounded-3xl bg-white p-4`}>
                  <code className="text-sm font-semibold text-night-800">{shadow}</code>
                </div>
              ))}
            </div>
          </Block>

          <Block id="boutons" title="Boutons" description="Pilules, trois tailles, icônes animées au survol, état de chargement (aria-busy).">
            <div className="space-y-5">
              {(['lg', 'md', 'sm'] as const).map((size) => (
                <div key={size} className="flex flex-wrap items-center gap-3">
                  {VARIANTS.map((variant) => (
                    <Button key={variant} variant={variant} size={size} iconRight={variant === 'primary' ? <ArrowRight className="size-4" aria-hidden="true" /> : undefined}>
                      {variant}
                    </Button>
                  ))}
                  <Button size={size} loading>
                    Chargement
                  </Button>
                </div>
              ))}
              <div className="on-dark flex flex-wrap gap-3 rounded-3xl bg-night-900 p-6">
                <Button variant="primary">Réserver un vol</Button>
                <Button variant="glass" iconLeft={<Plane className="size-4" aria-hidden="true" />}>
                  glass
                </Button>
                <Button variant="outline-light">outline-light</Button>
                <Button variant="light">light</Button>
              </div>
            </div>
          </Block>

          <Block id="champs" title="Champs de formulaire" description="Libellés visibles, aide et erreurs reliées (aria-describedby), focus azur, erreurs en rose avec icône.">
            <div className="grid gap-6 md:grid-cols-2">
              <TextInput label="Email" icon={Mail} placeholder="nom@exemple.com" />
              <TextInput label="Téléphone" error="Numéro invalide : indiquez l’indicatif (ex. +253 77 00 00 00)." defaultValue="7700" />
              <SelectInput label="Classe" options={[{ value: 'eco', label: 'Économique' }, { value: 'business', label: 'Affaires' }]} />
              <TextInput label="Champ désactivé" disabled value="Lecture seule" readOnly />
              <PasswordInput label="Mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} showStrength />
              <TextArea label="Message" optional placeholder="Votre message…" rows={3} />
              <BoxInput id="ds-box" label="Numéro de réservation (style billetterie)" icon={Hash} placeholder="Ex. FLS7K2" />
              <Checkbox label="J'accepte les conditions générales" description="Case personnalisée, entièrement accessible au clavier." />
            </div>
          </Block>

          <Block id="badges" title="Badges" description="Offres, statuts de vol (point animé pour les statuts en direct) et statuts de réservation.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="sand">Promotion</Badge>
                <Badge tone="azure">Nouveau</Badge>
                <Badge tone="emerald">Vol direct</Badge>
                <Badge tone="night">Populaire</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {FLIGHT_STATUSES.map((status) => (
                  <FlightStatusBadge key={status} status={status} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {BOOKING_STATUSES.map((status) => (
                  <BookingStatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
          </Block>

          <Block id="cartes" title="Cartes" description="Destination (photo pleine hauteur), offre (photo + contenu), service (icône + filet doré au survol).">
            <div className="grid gap-5 md:grid-cols-3">
              <DestinationCard destination={DESTINATIONS[6]} size="regular" />
              <OfferCard offer={OFFERS[0]} onOpen={setOffer} />
              <ServiceCard service={SERVICES[0]} index={0} />
            </div>
          </Block>

          <Block id="retours" title="Modales, toasts & états" description="Modale : piège de focus, Échap, retour du focus, feuille glissante sur mobile. Toasts : annoncés aux lecteurs d'écran.">
            <div className="flex flex-wrap gap-3">
              <Button variant="dark" onClick={() => setModalOpen(true)}>
                Ouvrir une modale
              </Button>
              <Button variant="outline" onClick={() => toast.success('Demande envoyée', 'Un conseiller vous recontacte rapidement.')}>
                Toast succès
              </Button>
              <Button variant="outline" onClick={() => toast.info('Information', 'Données de démonstration.')}>
                Toast info
              </Button>
              <Button variant="outline" onClick={() => toast.error('Envoi impossible', 'Veuillez réessayer.')}>
                Toast erreur
              </Button>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-line bg-white">
                <LoadingState label="Recherche des vols…" />
              </div>
              <div className="space-y-3 rounded-3xl border border-line bg-white p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
              </div>
              <div className="flex flex-col justify-center gap-4 rounded-3xl border border-line bg-white p-6">
                <DemoNotice>Mention « données de démonstration ».</DemoNotice>
                <span className="flex items-center gap-2 text-sm text-night-600">
                  <Spinner className="size-4" /> Indicateur compact
                </span>
              </div>
            </div>
          </Block>

          <Block id="mouvement" title="Animations" description="Courbe « premium » cubic-bezier(0.22, 1, 0.36, 1) ; 150 / 300 / 600 / 900 ms ; tout est désactivé avec « réduire les animations ».">
            <div className="grid gap-5 md:grid-cols-3">
              <Reveal variant="up" className="rounded-3xl bg-white p-6 shadow-soft">
                <p className="font-semibold text-night-900">Reveal · up</p>
                <p className="text-sm text-night-500">Apparition au défilement</p>
              </Reveal>
              <Reveal variant="zoom" delay={0.15} className="rounded-3xl bg-white p-6 shadow-soft">
                <p className="font-semibold text-night-900">Reveal · zoom</p>
                <p className="text-sm text-night-500">Zoom léger</p>
              </Reveal>
              <Reveal variant="left" delay={0.3} className="rounded-3xl bg-white p-6 shadow-soft">
                <p className="font-semibold text-night-900">Reveal · left</p>
                <p className="text-sm text-night-500">Glissement latéral</p>
              </Reveal>
              <div className="on-dark rounded-3xl bg-night-900 p-6 text-white">
                <Counter to={15} suffix="+" className="font-display text-7xl text-sand-300" />
                <p className="text-sm text-white/70">Compteur animé</p>
              </div>
              <div className="rounded-3xl bg-white p-6 md:col-span-2">
                <SplitText text="From Djibouti to the World." className="font-display text-5xl text-night-900" />
                <p className="mt-2 text-sm text-night-500">Révélation de texte mot à mot</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-night-500">
              <Search aria-hidden="true" className="size-4" />
              Également : drapeaux en tissu, avion du Hero, nuages en parallaxe, route animée, transitions de pages, onglets et carrousels.
            </div>
          </Block>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Exemple de modale"
        description="Fermez avec Échap, le bouton ou un clic à l'extérieur."
        footer={
          <div className="flex justify-end">
            <Button variant="dark" onClick={() => setModalOpen(false)}>
              Compris
            </Button>
          </div>
        }
      >
        <p className="text-night-700">Le focus clavier reste piégé dans la fenêtre tant qu'elle est ouverte, puis revient sur le bouton déclencheur.</p>
      </Modal>
      <OfferModal offer={offer} onClose={() => setOffer(null)} />
    </>
  )
}
