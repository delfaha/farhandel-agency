import { ArrowRight, BadgeCheck, Briefcase, Download, Luggage, MessageCircle, Plane, Plus, Radar, Sparkles, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { BookingStatusBadge, Badge } from '@/components/ui/Badge'
import { Button, ButtonAnchor } from '@/components/ui/Button'
import { contactLinks } from '@/config/site'
import { airport } from '@/data/airports'
import { BOOKABLE_SERVICES, CABIN_LABELS, PASSENGER_TITLE_LABELS, PASSENGER_TYPE_LABELS, SERVICE_LABELS, SERVICE_STATUS_LABELS } from '@/data/labels'
import { useAuth, useToast } from '@/hooks/useStore'
import { bookingService } from '@/services/bookingService'
import type { Booking, ServiceType } from '@/types/booking'
import { flightStatusLink, legEndpoints } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { downloadConfirmation } from '@/utils/confirmation'
import { formatDate, formatPrice, formatTime } from '@/utils/format'
import { LegDetails, LegSummary } from './FlightDisplay'

const STATUS_EXPLANATION: Record<Booking['status'], string> = {
  confirmed: 'Votre réservation est confirmée. Pensez à vérifier vos documents de voyage (passeport, visa) avant le départ.',
  pending: 'Votre demande est en cours de traitement : un conseiller vérifie la disponibilité réelle et le tarif, puis vous recontacte.',
  cancelled: 'Cette réservation a été annulée. Contactez-nous pour organiser un nouveau voyage.',
  completed: 'Ce voyage est terminé. Merci de votre confiance !',
}

function Section({ icon: Icon, title, children, className }: { icon: typeof Plane; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-3xl border border-line bg-white p-5 sm:p-6', className)}>
      <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-night-600">
        <Icon aria-hidden="true" className="size-4 text-sand-600" />
        {title}
      </h3>
      {children}
    </section>
  )
}

/** Vue complète d'une réservation : itinéraire, horaires, passagers, bagages, services, statut. */
export function BookingDetails({ booking: initial, showActions = true }: { booking: Booking; showActions?: boolean }) {
  const [booking, setBooking] = useState(initial)
  const [service, setService] = useState<ServiceType | ''>('')
  const [requesting, setRequesting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const available = BOOKABLE_SERVICES.filter((type) => !booking.services.some((item) => item.type === type))
  const upcoming = booking.status === 'confirmed' || booking.status === 'pending'

  const requestService = async () => {
    if (!service) return
    setRequesting(true)
    try {
      const updated = await bookingService.requestService(booking.pnr, service, user?.id)
      setBooking(updated)
      setService('')
      toast.success('Demande transmise', `${SERVICE_LABELS[service]} : votre conseiller revient vers vous (démonstration).`)
    } catch (error) {
      toast.error('Demande impossible', error instanceof Error ? error.message : undefined)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="on-dark relative overflow-hidden rounded-3xl bg-night-900 p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-24 size-72 rounded-full bg-sand-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand-300">Réservation</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.18em] sm:text-4xl">{booking.pnr}</p>
            <p className="mt-2 text-sm text-white/70">
              {CABIN_LABELS[booking.cabin]} · {booking.fareName} · créée le {formatDate(booking.createdAt.slice(0, 10), 'monthYear')}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <BookingStatusBadge status={booking.status} size="md" />
            <p className="text-sm text-white/70">
              Total indicatif <span className="font-semibold text-white">{formatPrice(booking.totalPrice)}</span>
              <span className="block text-xs text-white/50">Montant fictif (démonstration)</span>
            </p>
          </div>
        </div>
        <div className="relative mt-6 space-y-4 border-t border-white/10 pt-6">
          {booking.legs.map((leg, index) => (
            <div key={index}>
              <p className="mb-2 text-xs font-medium text-white/60">
                {booking.legs.length > 1 ? `Trajet ${index + 1} · ` : ''}
                {formatDate(legEndpoints(leg).departure, 'long')}
              </p>
              <LegSummary leg={leg} tone="dark" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Section icon={Plane} title="Itinéraire et horaires">
          <div className="space-y-6">
            {booking.legs.map((leg, index) => {
              const { from, to } = legEndpoints(leg)
              return (
                <div key={index}>
                  <p className="mb-3 font-semibold text-night-900">
                    {airport(from).city} → {airport(to).city}
                  </p>
                  <LegDetails leg={leg} />
                </div>
              )
            })}
          </div>
        </Section>

        <div className="space-y-5">
          <Section icon={BadgeCheck} title="Statut">
            <BookingStatusBadge status={booking.status} />
            <p className="mt-3 text-sm leading-relaxed text-night-600">{STATUS_EXPLANATION[booking.status]}</p>
            {upcoming && (
              <Link to={flightStatusLink(booking)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-600 hover:underline">
                <Radar aria-hidden="true" className="size-4" />
                Statut du vol {legEndpoints(booking.legs[0]).first.flightNumber}
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            )}
          </Section>

          <Section icon={UserRound} title={`Passager${booking.passengers.length > 1 ? 's' : ''}`}>
            <ul className="divide-y divide-line">
              {booking.passengers.map((passenger) => (
                <li key={passenger.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-night-900">
                      {passenger.title !== 'unspecified' && `${PASSENGER_TITLE_LABELS[passenger.title]} `}
                      {passenger.firstName} {passenger.lastName.toUpperCase()}
                    </p>
                    <p className="text-xs text-night-500">{PASSENGER_TYPE_LABELS[passenger.type]}</p>
                  </div>
                  {passenger.seat && <Badge tone="azure">Siège {passenger.seat}</Badge>}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Luggage} title="Bagages">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-mist p-3">
                <dt className="flex items-center gap-1.5 text-xs text-night-500">
                  <Briefcase aria-hidden="true" className="size-3.5" /> Cabine
                </dt>
                <dd className="mt-1 font-semibold text-night-900">1 × {booking.baggage.cabinKg} kg</dd>
              </div>
              <div className="rounded-2xl bg-mist p-3">
                <dt className="flex items-center gap-1.5 text-xs text-night-500">
                  <Luggage aria-hidden="true" className="size-3.5" /> Soute
                </dt>
                <dd className="mt-1 font-semibold text-night-900">
                  {booking.baggage.checkedPieces} × {booking.baggage.checkedKg} kg
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-night-500">Franchise par passager (hors bébé), selon les règles de la compagnie opérant le vol.</p>
          </Section>
        </div>
      </div>

      <Section icon={Sparkles} title="Services">
        {booking.services.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {booking.services.map((item) => (
              <li key={item.type} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-night-900">{SERVICE_LABELS[item.type]}</p>
                  {item.detail && <p className="text-xs text-night-500">{item.detail}</p>}
                </div>
                <Badge tone={item.status === 'requested' ? 'amber' : 'emerald'}>{SERVICE_STATUS_LABELS[item.status]}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-night-500">Aucun service ajouté pour le moment.</p>
        )}
        {upcoming && available.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-semibold text-night-800">
              Ajouter un service
              <select
                value={service}
                onChange={(event) => setService(event.target.value as ServiceType)}
                className="mt-1.5 block h-11 w-full rounded-xl border border-line bg-white px-3 font-normal text-night-900 focus:border-azure-500 focus:outline-none focus:ring-4 focus:ring-azure-500/15"
              >
                <option value="">Choisir un service…</option>
                {available.map((type) => (
                  <option key={type} value={type}>
                    {SERVICE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="dark" disabled={!service} loading={requesting} onClick={requestService} iconLeft={<Plus className="size-4" aria-hidden="true" />}>
              Demander
            </Button>
          </div>
        )}
      </Section>

      {showActions && (
        <div className="flex flex-wrap gap-3">
          <Button variant="dark" onClick={() => downloadConfirmation(booking)} iconLeft={<Download className="size-4" aria-hidden="true" />}>
            Télécharger la confirmation
          </Button>
          <ButtonAnchor
            variant="outline"
            href={contactLinks.whatsapp(`Bonjour FarhanDel Agency, je vous contacte au sujet de ma réservation ${booking.pnr}.`)}
            iconLeft={<MessageCircle className="size-4" aria-hidden="true" />}
          >
            Contacter mon conseiller
          </ButtonAnchor>
        </div>
      )}
    </div>
  )
}

/** Aperçu compact affiché dans le dashboard de la page d'accueil. */
export function BookingPreview({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const firstLeg = booking.legs[0]
  const { first, from, to } = legEndpoints(firstLeg)
  const services = booking.services.map((item) => SERVICE_LABELS[item.type])

  return (
    <div className="mt-6 rounded-3xl border border-line bg-ivory/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-semibold tracking-[0.16em] text-night-900">{booking.pnr}</span>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-night-500">
          {airport(from).city} → {airport(to).city} · {formatDate(first.departure, 'medium')}
        </p>
      </div>
      <LegSummary leg={firstLeg} className="mt-5" />
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-3.5">
          <dt className="text-xs text-night-500">Horaires</dt>
          <dd className="mt-1 font-semibold text-night-900">
            {first.flightNumber} · {formatTime(first.departure)} → {formatTime(legEndpoints(firstLeg).arrival)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-3.5">
          <dt className="text-xs text-night-500">Passager{booking.passengers.length > 1 ? 's' : ''}</dt>
          <dd className="mt-1 font-semibold text-night-900">{booking.passengers.map((passenger) => `${passenger.firstName} ${passenger.lastName.toUpperCase()}`).join(', ')}</dd>
        </div>
        <div className="rounded-2xl bg-white p-3.5">
          <dt className="text-xs text-night-500">Bagages</dt>
          <dd className="mt-1 font-semibold text-night-900">
            Cabine {booking.baggage.cabinKg} kg · Soute {booking.baggage.checkedPieces} × {booking.baggage.checkedKg} kg
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-3.5">
          <dt className="text-xs text-night-500">Services</dt>
          <dd className="mt-1 font-semibold text-night-900">{services.length ? services.join(', ') : 'Aucun'}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="dark" size="sm" onClick={onOpen} iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
          Voir tous les détails
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadConfirmation(booking)} iconLeft={<Download className="size-4" aria-hidden="true" />}>
          Confirmation
        </Button>
      </div>
    </div>
  )
}
