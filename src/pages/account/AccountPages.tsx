import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CheckCheck,
  CircleAlert,
  Luggage,
  Plane,
  Plus,
  Save,
  Sparkles,
  Tag,
  Ticket,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { firstDeparture, pastBookings, upcomingBookings, useAccountData } from '@/components/account/accountData'
import { NextTripCard } from '@/components/account/NextTripCard'
import { ReservationCard } from '@/components/account/ReservationCard'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Checkbox, SelectInput, TextInput } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/Misc'
import { Stagger, StaggerItem } from '@/components/ui/Motion'
import { airport } from '@/data/airports'
import { BOOKABLE_SERVICES, SERVICE_LABELS, SERVICE_STATUS_LABELS } from '@/data/labels'
import { useAuth, useToast } from '@/hooks/useStore'
import { bookingService } from '@/services/bookingService'
import type { Booking, ServiceType } from '@/types/booking'
import type { AppNotification, MealPreference, NotificationType, SeatPreference } from '@/types/user'
import { legEndpoints } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { formatDate, timeAgo } from '@/utils/format'
import { isPhone, type FieldErrors } from '@/utils/validation'

function PageTitle({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl text-night-900 sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 text-night-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Panel({ title, icon: Icon, link, children, className }: { title: string; icon: typeof Plane; link?: { to: string; label: string }; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-3xl border border-line bg-white p-5 sm:p-6', className)} aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-semibold text-night-900">
          <Icon aria-hidden="true" className="size-4 text-sand-600" />
          {title}
        </h2>
        {link && (
          <Link to={link.to} className="inline-flex items-center gap-1 text-sm font-semibold text-azure-600 hover:underline">
            {link.label}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  booking: Ticket,
  flight: Plane,
  offer: Tag,
  account: UserRound,
  service: Sparkles,
}

function NotificationItem({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const Icon = NOTIFICATION_ICONS[notification.type]
  const content = (
    <>
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', notification.read ? 'bg-mist text-night-500' : 'bg-night-900 text-sand-300')}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className={cn('text-sm', notification.read ? 'font-medium text-night-700' : 'font-semibold text-night-900')}>{notification.title}</span>
          <span className="shrink-0 text-xs text-night-400">{timeAgo(notification.createdAt)}</span>
        </span>
        <span className="mt-0.5 block text-sm leading-relaxed text-night-500">{notification.message}</span>
      </span>
      {!notification.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sand-500">
          <span className="sr-only">Non lue</span>
        </span>
      )}
    </>
  )
  const className = 'flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-mist'
  return notification.link ? (
    <Link to={notification.link} onClick={() => onRead(notification.id)} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => onRead(notification.id)} className={className}>
      {content}
    </button>
  )
}

/* ---------- Tableau de bord ---------- */

export function AccountOverviewPage() {
  const { user, bookings, bookingsLoading, notifications, unread, markRead } = useAccountData()
  const upcoming = upcomingBookings(bookings)
  const past = pastBookings(bookings)
  const next = upcoming[0]
  const pending = upcoming.filter((booking) => booking.status === 'pending').length
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  const stats = [
    { label: 'Voyages à venir', value: upcoming.length, icon: Plane },
    { label: 'Demandes en cours', value: pending, icon: CalendarClock },
    { label: 'Voyages effectués', value: past.filter((booking) => booking.status === 'completed').length, icon: CheckCheck },
    { label: 'Notifications', value: unread, icon: BellRing },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-night-500 first-letter:uppercase">{today}</p>
        <h1 className="mt-1 font-display text-5xl text-night-900 sm:text-6xl">
          Bonjour, <em className="text-sand-600">{user.firstName}</em>
        </h1>
        <p className="mt-2 text-night-600">Heureux de vous retrouver. Voici l'essentiel de vos voyages.</p>
      </div>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4" stagger={0.07}>
        {stats.map((stat) => (
          <StaggerItem key={stat.label} className="rounded-3xl border border-line bg-white p-5">
            <stat.icon aria-hidden="true" className="size-5 text-sand-600" />
            <p className="mt-4 font-display text-4xl leading-none text-night-900">{bookingsLoading ? '–' : stat.value}</p>
            <p className="mt-1 text-sm text-night-500">{stat.label}</p>
          </StaggerItem>
        ))}
      </Stagger>

      {bookingsLoading ? (
        <Skeleton className="h-72 rounded-[2rem]" />
      ) : next ? (
        <NextTripCard booking={next} />
      ) : (
        <EmptyState
          icon={Plane}
          title="Aucun voyage à venir"
          description="Votre prochain voyage apparaîtra ici dès votre première demande de réservation."
          action={<ButtonLink to="/reserver">Réserver un vol</ButtonLink>}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Mes réservations" icon={Ticket} link={{ to: '/espace-client/reservations', label: 'Tout voir' }}>
          {bookingsLoading ? (
            <Skeleton className="h-24" />
          ) : upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 3).map((booking) => {
                const { first, from } = legEndpoints(booking.legs[0])
                return (
                  <li key={booking.pnr} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-night-900">
                        {airport(from).city} → {airport(legEndpoints(booking.legs[0]).to).city}
                      </p>
                      <p className="text-sm text-night-500 first-letter:uppercase">
                        {formatDate(first.departure, 'medium')} · {booking.pnr}
                      </p>
                    </div>
                    <Badge tone={booking.status === 'confirmed' ? 'emerald' : 'amber'} dot>
                      {booking.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-night-500">Aucune réservation en cours.</p>
          )}
        </Panel>

        <Panel title="Notifications" icon={Bell} link={{ to: '/espace-client/notifications', label: 'Tout voir' }}>
          {notifications.length ? (
            <div className="-m-3 space-y-1">
              {notifications.slice(0, 3).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onRead={(id) => void markRead([id])} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-night-500">Aucune notification.</p>
          )}
        </Panel>

        <Panel title="Historique" icon={CalendarClock} link={{ to: '/espace-client/historique', label: 'Voir' }}>
          <p className="text-sm text-night-600">
            {past.length ? `${past.length} voyage${past.length > 1 ? 's' : ''} effectué${past.length > 1 ? 's' : ''}, dont le dernier vers ${airport(legEndpoints(past[0].legs[0]).to).city}.` : 'Vos voyages passés apparaîtront ici.'}
          </p>
        </Panel>

        <Panel title="Informations personnelles" icon={UserRound} link={{ to: '/espace-client/profil', label: 'Modifier' }}>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-night-500">Nom</dt>
              <dd className="font-semibold text-night-900">
                {user.firstName} {user.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-night-500">Téléphone</dt>
              <dd className="font-semibold text-night-900">{user.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-night-500">Email</dt>
              <dd className="truncate font-semibold text-night-900">{user.email}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Bagages" icon={Luggage} link={{ to: '/espace-client/bagages', label: 'Gérer' }}>
          {next ? (
            <p className="text-sm text-night-600">
              Prochain vol : cabine {next.baggage.cabinKg} kg · soute {next.baggage.checkedPieces} × {next.baggage.checkedKg} kg par passager.
            </p>
          ) : (
            <p className="text-sm text-night-500">Aucun bagage à préparer pour le moment.</p>
          )}
        </Panel>

        <Panel title="Services" icon={Sparkles} link={{ to: '/espace-client/services', label: 'Ajouter' }}>
          <p className="text-sm text-night-600">
            {upcoming.flatMap((booking) => booking.services).length
              ? `${upcoming.flatMap((booking) => booking.services).length} service(s) associé(s) à vos prochains voyages.`
              : 'Assurance, transfert, hôtel, assistance : ajoutez des services à vos voyages.'}
          </p>
        </Panel>
      </div>
    </div>
  )
}

/* ---------- Mes réservations ---------- */

export function ReservationsPage() {
  const { bookings, bookingsLoading } = useAccountData()
  const upcoming = upcomingBookings(bookings)
  return (
    <div>
      <PageTitle
        title="Mes réservations"
        description="Vos voyages confirmés et vos demandes en cours de traitement."
        action={
          <ButtonLink to="/reserver" size="sm" iconLeft={<Plus className="size-4" aria-hidden="true" />}>
            Nouvelle réservation
          </ButtonLink>
        }
      />
      {bookingsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : upcoming.length ? (
        <div className="space-y-4">
          {upcoming.map((booking, index) => (
            <ReservationCard key={booking.pnr} booking={booking} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Ticket} title="Aucune réservation en cours" description="Recherchez un vol et envoyez votre première demande." action={<ButtonLink to="/reserver">Réserver un vol</ButtonLink>} />
      )}
    </div>
  )
}

/* ---------- Historique ---------- */

export function HistoryPage() {
  const { bookings, bookingsLoading } = useAccountData()
  const past = pastBookings(bookings)
  const cities = new Set(past.map((booking) => legEndpoints(booking.legs[0]).to))
  return (
    <div>
      <PageTitle title="Historique" description={past.length ? `${past.length} voyage${past.length > 1 ? 's' : ''} · ${cities.size} destination${cities.size > 1 ? 's' : ''} différente${cities.size > 1 ? 's' : ''}` : 'Vos voyages passés.'} />
      {bookingsLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : past.length ? (
        <div className="space-y-4">
          {past.map((booking, index) => (
            <ReservationCard key={booking.pnr} booking={booking} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarClock} title="Pas encore d'historique" description="Vos voyages effectués apparaîtront ici." />
      )}
    </div>
  )
}

/* ---------- Informations personnelles ---------- */

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    birthDate: user?.birthDate ?? '',
    nationality: user?.nationality ?? '',
    city: user?.city ?? '',
    seat: user?.preferences.seat ?? 'none',
    meal: user?.preferences.meal ?? 'standard',
    channels: user?.preferences.channels ?? { email: true, sms: false, whatsapp: true },
  }))
  const [errors, setErrors] = useState<FieldErrors<'firstName' | 'lastName' | 'phone'>>({})
  const [saving, setSaving] = useState(false)
  if (!user) return null

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found: FieldErrors<'firstName' | 'lastName' | 'phone'> = {}
    if (form.firstName.trim().length < 2) found.firstName = 'Indiquez votre prénom.'
    if (form.lastName.trim().length < 2) found.lastName = 'Indiquez votre nom.'
    if (!isPhone(form.phone)) found.phone = 'Numéro invalide : indiquez l’indicatif (ex. +253 77 00 00 00).'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate || undefined,
        nationality: form.nationality.trim() || undefined,
        city: form.city.trim() || undefined,
        preferences: { seat: form.seat, meal: form.meal, channels: form.channels },
      })
      toast.success('Profil mis à jour', 'Vos informations ont bien été enregistrées.')
    } catch (error) {
      toast.error('Enregistrement impossible', error instanceof Error ? error.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageTitle title="Informations personnelles" description="Ces informations pré-remplissent vos demandes de réservation." />
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <section className="rounded-3xl border border-line bg-white p-5 sm:p-7" aria-labelledby="identity-title">
          <h2 id="identity-title" className="font-semibold text-night-900">
            Identité et contact
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextInput label="Prénom" autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
            <TextInput label="Nom" autoComplete="family-name" value={form.lastName} error={errors.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
            <TextInput label="Email" type="email" value={user.email} disabled hint="Pour changer d'email, contactez l'agence." />
            <TextInput label="Téléphone" type="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <TextInput label="Date de naissance" type="date" optional value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} />
            <TextInput label="Nationalité" optional value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} />
            <TextInput label="Ville de résidence" optional autoComplete="address-level2" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5 sm:p-7" aria-labelledby="prefs-title">
          <h2 id="prefs-title" className="font-semibold text-night-900">
            Préférences de voyage
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <SelectInput
              label="Siège préféré"
              value={form.seat}
              onChange={(event) => setForm({ ...form, seat: event.target.value as SeatPreference })}
              options={[
                { value: 'none', label: 'Sans préférence' },
                { value: 'window', label: 'Hublot' },
                { value: 'aisle', label: 'Couloir' },
              ]}
            />
            <SelectInput
              label="Repas"
              value={form.meal}
              onChange={(event) => setForm({ ...form, meal: event.target.value as MealPreference })}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'halal', label: 'Halal' },
                { value: 'vegetarian', label: 'Végétarien' },
                { value: 'child', label: 'Enfant' },
                { value: 'none', label: 'Sans repas' },
              ]}
            />
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-night-800">Recevoir mes notifications par</legend>
            <div className="mt-3 flex flex-wrap gap-5">
              {(['email', 'sms', 'whatsapp'] as const).map((channel) => (
                <Checkbox
                  key={channel}
                  label={channel === 'email' ? 'Email' : channel === 'sms' ? 'SMS' : 'WhatsApp'}
                  checked={form.channels[channel]}
                  onChange={(event) => setForm({ ...form, channels: { ...form.channels, [channel]: event.target.checked } })}
                />
              ))}
            </div>
          </fieldset>
        </section>

        <Button type="submit" size="lg" variant="dark" loading={saving} iconLeft={!saving && <Save className="size-5" aria-hidden="true" />}>
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  )
}

/* ---------- Bagages ---------- */

const BAGGAGE_RULES = [
  'Liquides en cabine : contenants de 100 ml maximum, dans un sac transparent refermable d’un litre.',
  'Batteries au lithium et cigarettes électroniques : uniquement en cabine.',
  'Objets tranchants, inflammables ou dangereux : interdits en cabine, parfois en soute.',
  'Les franchises varient selon la compagnie et le tarif : vérifiez-les avant le départ.',
]

export function BaggagePage() {
  const { bookings, bookingsLoading, user, refresh } = useAccountData()
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)
  const upcoming = upcomingBookings(bookings)

  const addBag = async (booking: Booking) => {
    setPending(booking.pnr)
    try {
      await bookingService.requestService(booking.pnr, 'extra-baggage', user.id)
      toast.success('Demande de bagage envoyée', `Réservation ${booking.pnr} : votre conseiller vous confirme le tarif (démonstration).`)
      refresh()
    } finally {
      setPending(null)
    }
  }

  return (
    <div>
      <PageTitle title="Bagages" description="Franchises de vos prochains voyages et demandes de bagages supplémentaires." />
      {bookingsLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : upcoming.length ? (
        <div className="space-y-4">
          {upcoming.map((booking) => {
            const requested = booking.services.some((service) => service.type === 'extra-baggage')
            return (
              <article key={booking.pnr} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-night-900">
                      {airport(legEndpoints(booking.legs[0]).from).city} → {airport(legEndpoints(booking.legs[0]).to).city}
                    </p>
                    <p className="text-sm text-night-500 first-letter:uppercase">
                      {formatDate(firstDeparture(booking), 'medium')} · {booking.pnr}
                    </p>
                  </div>
                  {requested ? (
                    <Badge tone="amber" dot>
                      Bagage supplémentaire demandé
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" loading={pending === booking.pnr} onClick={() => addBag(booking)} iconLeft={<Plus className="size-4" aria-hidden="true" />}>
                      Ajouter un bagage
                    </Button>
                  )}
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {booking.passengers.map((passenger) => (
                    <li key={passenger.id} className="rounded-2xl bg-mist p-4 text-sm">
                      <p className="font-semibold text-night-900">
                        {passenger.firstName} {passenger.lastName.toUpperCase()}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-night-600">
                        <BriefcaseBusiness aria-hidden="true" className="size-4" /> Cabine : 1 × {booking.baggage.cabinKg} kg
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-night-600">
                        <Luggage aria-hidden="true" className="size-4" />
                        {passenger.type === 'infant' ? 'Soute : poussette uniquement' : `Soute : ${booking.baggage.checkedPieces} × ${booking.baggage.checkedKg} kg`}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={Luggage} title="Aucun bagage à préparer" description="Les franchises de vos prochains voyages s'afficheront ici." />
      )}
      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6" aria-labelledby="rules-title">
        <h2 id="rules-title" className="flex items-center gap-2 font-semibold text-amber-950">
          <CircleAlert aria-hidden="true" className="size-4" /> Règles essentielles
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-950/85">
          {BAGGAGE_RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/* ---------- Services ---------- */

export function AccountServicesPage() {
  const { bookings, bookingsLoading, user, refresh } = useAccountData()
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)
  const upcoming = upcomingBookings(bookings)

  const request = async (booking: Booking, type: ServiceType) => {
    setPending(`${booking.pnr}-${type}`)
    try {
      await bookingService.requestService(booking.pnr, type, user.id)
      toast.success(`${SERVICE_LABELS[type]} demandé`, `Réservation ${booking.pnr} — votre conseiller revient vers vous (démonstration).`)
      refresh()
    } finally {
      setPending(null)
    }
  }

  return (
    <div>
      <PageTitle title="Services" description="Assurance, transferts, hôtels, assistance : complétez vos prochains voyages." />
      {bookingsLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : upcoming.length ? (
        <div className="space-y-4">
          {upcoming.map((booking) => (
            <article key={booking.pnr} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <p className="font-semibold text-night-900">
                {airport(legEndpoints(booking.legs[0]).from).city} → {airport(legEndpoints(booking.legs[0]).to).city}{' '}
                <span className="font-normal text-night-500">· {booking.pnr}</span>
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {BOOKABLE_SERVICES.map((type) => {
                  const current = booking.services.find((service) => service.type === type)
                  return (
                    <li key={type} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
                      <span className="text-sm font-medium text-night-800">{SERVICE_LABELS[type]}</span>
                      {current ? (
                        <Badge tone={current.status === 'requested' ? 'amber' : 'emerald'}>{SERVICE_STATUS_LABELS[current.status]}</Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() => request(booking, type)}
                          disabled={pending === `${booking.pnr}-${type}`}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-azure-600 transition hover:bg-azure-50 disabled:opacity-50"
                        >
                          <Plus aria-hidden="true" className="size-3.5" /> Demander
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Sparkles} title="Aucun voyage à compléter" description="Réservez un vol pour y associer des services." action={<ButtonLink to="/services" variant="outline">Découvrir nos services</ButtonLink>} />
      )}
    </div>
  )
}

/* ---------- Notifications ---------- */

export function NotificationsPage() {
  const { notifications, unread, markRead, markAllRead } = useAccountData()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const list = filter === 'unread' ? notifications.filter((item) => !item.read) : notifications

  return (
    <div>
      <PageTitle
        title="Notifications"
        description={unread ? `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}` : 'Vous êtes à jour.'}
        action={
          <Button size="sm" variant="outline" disabled={!unread} onClick={() => void markAllRead()} iconLeft={<CheckCheck className="size-4" aria-hidden="true" />}>
            Tout marquer comme lu
          </Button>
        }
      />
      <div role="group" aria-label="Filtrer les notifications" className="mb-4 flex gap-2">
        {(['all', 'unread'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn('rounded-full px-4 py-2 text-sm font-semibold transition', filter === value ? 'bg-night-900 text-white' : 'bg-white text-night-700 hover:bg-mist')}
          >
            {value === 'all' ? 'Toutes' : 'Non lues'}
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-line bg-white p-3">
        <AnimatePresence initial={false}>
          {list.length ? (
            list.map((notification) => (
              <motion.div key={notification.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                <NotificationItem notification={notification} onRead={(id) => void markRead([id])} />
              </motion.div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-night-500">Aucune notification {filter === 'unread' ? 'non lue' : ''}.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
