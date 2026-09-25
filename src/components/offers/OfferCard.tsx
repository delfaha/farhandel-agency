import { ArrowRight, CalendarRange, Check, Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { airport } from '@/data/airports'
import { CABIN_LABELS } from '@/data/labels'
import { OFFER_BADGE_META } from '@/data/offers'
import type { Offer } from '@/types/content'
import { cn } from '@/utils/cn'
import { addDays, todayIso } from '@/utils/date'
import { formatDate, formatPrice } from '@/utils/format'

function offerPeriod(offer: Offer): string {
  return `Du ${formatDate(offer.period.start, 'monthYear')} au ${formatDate(offer.period.end, 'monthYear')}`
}

function offerBookingLink(offer: Offer): string {
  const start = offer.period.start > todayIso() ? offer.period.start : addDays(todayIso(), 14)
  const query = new URLSearchParams({ trajet: offer.trip === 'roundtrip' ? 'aller-retour' : 'aller-simple', de: offer.from, vers: offer.destination, aller: start })
  if (offer.trip === 'roundtrip') query.set('retour', addDays(start, 7))
  query.set('adultes', '1')
  return `/reserver?${query.toString()}`
}

function OfferBadges({ offer, className }: { offer: Offer; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {offer.badges.map((badge) => (
        <Badge key={badge} tone={OFFER_BADGE_META[badge].tone}>
          {OFFER_BADGE_META[badge].label}
        </Badge>
      ))}
    </div>
  )
}

/** Carte offre : destination, image, période, prix indicatif, description, conditions, bouton « Voir l'offre ». */
export function OfferCard({ offer, onOpen, className }: { offer: Offer; onOpen: (offer: Offer) => void; className?: string }) {
  const city = airport(offer.destination).city
  return (
    <article className={cn('group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-night-900/5 transition-shadow duration-500 hover:shadow-float', className)}>
      <div className="relative">
        <SmartImage
          image={offer.image}
          ratio={0.66}
          maxWidth={1080}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
          className="aspect-[3/2]"
          imgClassName="transition-transform duration-[1.2s] ease-premium group-hover:scale-105"
        />
        <OfferBadges offer={offer} className="absolute left-4 top-4" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-700">
          {airport(offer.from).city} → {city}
        </p>
        <h3 className="mt-2 font-display text-[1.9rem] leading-tight text-night-900">{offer.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-night-500">
          <CalendarRange aria-hidden="true" className="size-4" />
          {offerPeriod(offer)}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-night-600">{offer.description}</p>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-night-500">
          <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          {offer.conditions[0]}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="text-xs text-night-500">
            {offer.trip === 'roundtrip' ? 'Aller-retour dès' : 'Aller simple dès'}
            <span className="block text-2xl font-semibold text-night-900">{formatPrice(offer.price)}</span>
            <span>Prix indicatif fictif</span>
          </p>
          <button
            type="button"
            onClick={() => onOpen(offer)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-night-900 px-5 text-sm font-semibold text-white transition hover:bg-night-700"
            aria-label={`Voir l'offre ${offer.title}`}
          >
            Voir l'offre
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

/** Détail d'une offre (modale) : inclusions, conditions, lien de réservation pré-rempli. */
export function OfferModal({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  return (
    <Modal
      open={offer !== null}
      onClose={onClose}
      title={offer?.title ?? ''}
      size="lg"
      description={offer ? `${airport(offer.from).city} → ${airport(offer.destination).city} · ${offerPeriod(offer)}` : undefined}
      media={
        offer && (
          <div className="relative">
            <SmartImage image={offer.image} ratio={0.45} maxWidth={1440} sizes="(min-width: 768px) 768px, 100vw" className="aspect-[21/9]" />
            <OfferBadges offer={offer} className="absolute left-6 top-6" />
          </div>
        )
      }
      footer={
        offer && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-night-500">
              {CABIN_LABELS[offer.cabin]} · {offer.trip === 'roundtrip' ? 'aller-retour' : 'aller simple'} dès{' '}
              <span className="text-lg font-semibold text-night-900">{formatPrice(offer.price)}</span>
              <span className="block text-xs">Prix indicatif fictif, non contractuel.</span>
            </p>
            <ButtonLink to={offerBookingLink(offer)} onClick={onClose} iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
              Demander cette offre
            </ButtonLink>
          </div>
        )
      }
    >
      {offer && (
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="leading-relaxed text-night-700">{offer.description}</p>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-night-600">Inclus</h3>
            <ul className="mt-3 space-y-2">
              {offer.includes.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-night-700">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-mist p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-night-600">Conditions</h3>
            <ul className="mt-3 space-y-2.5">
              {offer.conditions.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-night-700">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-night-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}
