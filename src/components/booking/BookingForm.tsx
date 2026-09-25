import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, Send, ShieldCheck } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox, SelectInput, TextArea, TextInput } from '@/components/ui/Field'
import { DemoNotice, WhatsAppIcon } from '@/components/ui/Misc'
import { airport } from '@/data/airports'
import { BOOKABLE_SERVICES, CABIN_LABELS, PASSENGER_TITLE_LABELS, PASSENGER_TYPE_LABELS, SERVICE_LABELS } from '@/data/labels'
import { useAuth, useToast } from '@/hooks/useStore'
import { bookingService } from '@/services/bookingService'
import type { Booking, ContactPreference, PassengerInput, PassengerTitle, PassengerType, ServiceType } from '@/types/booking'
import type { FlightSearchParams, Itinerary } from '@/types/flight'
import { legEndpoints } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { diffDays, todayIso } from '@/utils/date'
import { formatDate, formatPrice } from '@/utils/format'
import { isEmail, isPhone, type FieldErrors } from '@/utils/validation'
import { LegSummary } from './FlightDisplay'

const NATIONALITIES = ['Djiboutienne', 'Éthiopienne', 'Somalienne', 'Française', 'Turque', 'Kényane', 'Yéménite', 'Égyptienne', 'Saoudienne', 'Émirienne']

type PassengerErrors = FieldErrors<'firstName' | 'lastName' | 'birthDate' | 'nationality'>

/** Âge (en années) à une date donnée. */
function ageAt(birthDate: string, date: string) {
  return diffDays(birthDate, date) / 365.25
}

function validatePassenger(passenger: PassengerInput, departure: string): PassengerErrors {
  const errors: PassengerErrors = {}
  if (passenger.firstName.trim().length < 2) errors.firstName = 'Indiquez le prénom tel qu’il figure sur le passeport.'
  if (passenger.lastName.trim().length < 2) errors.lastName = 'Indiquez le nom tel qu’il figure sur le passeport.'
  if (!passenger.birthDate) errors.birthDate = 'Indiquez la date de naissance.'
  else if (passenger.birthDate > todayIso()) errors.birthDate = 'La date de naissance ne peut pas être future.'
  else {
    const age = ageAt(passenger.birthDate, departure)
    if (passenger.type === 'adult' && age < 12) errors.birthDate = 'Un adulte doit avoir 12 ans ou plus à la date du voyage.'
    if (passenger.type === 'child' && (age < 2 || age >= 12)) errors.birthDate = 'Un enfant doit avoir entre 2 et 11 ans à la date du voyage.'
    if (passenger.type === 'infant' && age >= 2) errors.birthDate = 'Un bébé doit avoir moins de 2 ans à la date du voyage.'
  }
  if (!passenger.nationality.trim()) errors.nationality = 'Indiquez la nationalité.'
  return errors
}

/** Champs d'un passager (identité telle qu'indiquée sur le passeport). */
export function PassengerForm({ index, passenger, errors, onChange, idPrefix }: { index: number; passenger: PassengerInput; errors: PassengerErrors; onChange: (value: PassengerInput) => void; idPrefix: string }) {
  const set = (patch: Partial<PassengerInput>) => onChange({ ...passenger, ...patch })
  return (
    <fieldset className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <legend className="sr-only">
        Passager {index + 1} ({PASSENGER_TYPE_LABELS[passenger.type]})
      </legend>
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="grid size-9 place-items-center rounded-full bg-night-900 text-sm font-semibold text-sand-300">{index + 1}</span>
        <p className="font-semibold text-night-900">Passager {index + 1}</p>
        <Badge tone={passenger.type === 'adult' ? 'night' : passenger.type === 'child' ? 'azure' : 'sand'}>{PASSENGER_TYPE_LABELS[passenger.type]}</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.6fr_1fr_1fr]">
        <SelectInput
          id={`${idPrefix}-title`}
          label="Civilité"
          value={passenger.title}
          onChange={(event) => set({ title: event.target.value as PassengerTitle })}
          options={(Object.keys(PASSENGER_TITLE_LABELS) as PassengerTitle[]).map((value) => ({ value, label: PASSENGER_TITLE_LABELS[value] }))}
        />
        <TextInput
          id={`${idPrefix}-first`}
          label="Prénom(s)"
          autoComplete={index === 0 ? 'given-name' : 'off'}
          value={passenger.firstName}
          error={errors.firstName}
          onChange={(event) => set({ firstName: event.target.value })}
        />
        <TextInput
          id={`${idPrefix}-last`}
          label="Nom"
          autoComplete={index === 0 ? 'family-name' : 'off'}
          value={passenger.lastName}
          error={errors.lastName}
          onChange={(event) => set({ lastName: event.target.value })}
        />
        <TextInput
          id={`${idPrefix}-birth`}
          type="date"
          label="Date de naissance"
          max={todayIso()}
          value={passenger.birthDate}
          error={errors.birthDate}
          onChange={(event) => set({ birthDate: event.target.value })}
          containerClassName="lg:col-span-1"
        />
        <TextInput
          id={`${idPrefix}-nationality`}
          label="Nationalité"
          list={`${idPrefix}-nationalities`}
          value={passenger.nationality}
          error={errors.nationality}
          onChange={(event) => set({ nationality: event.target.value })}
          containerClassName="sm:col-span-1 lg:col-span-2"
        />
        <datalist id={`${idPrefix}-nationalities`}>
          {NATIONALITIES.map((nationality) => (
            <option key={nationality} value={nationality}>
              {nationality}
            </option>
          ))}
        </datalist>
      </div>
      <p className="mt-4 text-xs text-night-500">Les informations de passeport vous seront demandées par votre conseiller, uniquement si nécessaire.</p>
    </fieldset>
  )
}

function emptyPassengers(params: FlightSearchParams): PassengerInput[] {
  const make = (type: PassengerType): PassengerInput => ({ type, title: 'unspecified', firstName: '', lastName: '', birthDate: '', nationality: '' })
  return [
    ...Array.from({ length: params.passengers.adults }, () => make('adult')),
    ...Array.from({ length: params.passengers.children }, () => make('child')),
    ...Array.from({ length: params.passengers.infants }, () => make('infant')),
  ]
}

/** Récapitulatif (colonne latérale) : trajets, voyageurs, bagages, détail du prix fictif. */
export function BookingSummary({ itinerary, params, className }: { itinerary: Itinerary; params: FlightSearchParams; className?: string }) {
  const { adults, children, infants } = params.passengers
  const lines = [
    { label: `${adults} adulte${adults > 1 ? 's' : ''}`, amount: itinerary.pricePerAdult * adults },
    ...(children ? [{ label: `${children} enfant${children > 1 ? 's' : ''} (−25 %)`, amount: Math.round((itinerary.pricePerAdult * 0.75 * children) / 100) * 100 }] : []),
    ...(infants ? [{ label: `${infants} bébé${infants > 1 ? 's' : ''} (10 %)`, amount: Math.round((itinerary.pricePerAdult * 0.1 * infants) / 100) * 100 }] : []),
  ]
  return (
    <aside className={cn('rounded-3xl border border-line bg-white p-5 sm:p-6', className)} aria-label="Récapitulatif du voyage">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-night-500">Votre voyage</p>
      <div className="mt-4 space-y-5">
        {itinerary.legs.map((leg, index) => (
          <div key={index}>
            <p className="mb-2 text-xs font-medium text-night-500">
              {airport(legEndpoints(leg).from).city} → {airport(legEndpoints(leg).to).city} · {formatDate(legEndpoints(leg).departure, 'dayMonth')}
            </p>
            <LegSummary leg={leg} />
          </div>
        ))}
      </div>
      <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-night-500">Classe</dt>
          <dd className="font-semibold text-night-900">{CABIN_LABELS[itinerary.cabin]}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-night-500">Bagages</dt>
          <dd className="text-right font-semibold text-night-900">
            {itinerary.baggage.checkedPieces} × {itinerary.baggage.checkedKg} kg + cabine {itinerary.baggage.cabinKg} kg
          </dd>
        </div>
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-3">
            <dt className="text-night-500">{line.label}</dt>
            <dd className="font-semibold text-night-900">{formatPrice(line.amount)}</dd>
          </div>
        ))}
        <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
          <dt className="font-semibold text-night-900">Total indicatif</dt>
          <dd className="text-2xl font-semibold text-night-900">{formatPrice(itinerary.totalPrice)}</dd>
        </div>
      </dl>
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-mist p-3 text-xs leading-relaxed text-night-600">
        <ShieldCheck aria-hidden="true" className="mt-px size-4 shrink-0 text-emerald-600" />
        Tarif fictif de démonstration. Aucun paiement n'est demandé en ligne : disponibilité et prix réels sont confirmés par un conseiller.
      </p>
    </aside>
  )
}

interface BookingFormProps {
  itinerary: Itinerary
  params: FlightSearchParams
  onBack: () => void
  onCreated: (booking: Booking) => void
}

/** Étape 2 : passagers, contact, services optionnels et consentement → demande de réservation. */
export function BookingForm({ itinerary, params, onBack, onCreated }: BookingFormProps) {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const { user } = useAuth()
  const toast = useToast()
  const departure = legEndpoints(itinerary.legs[0]).departure.slice(0, 10)

  const [passengers, setPassengers] = useState<PassengerInput[]>(() => {
    const list = emptyPassengers(params)
    if (user && list[0]) {
      list[0] = { ...list[0], firstName: user.firstName, lastName: user.lastName, birthDate: user.birthDate ?? '', nationality: user.nationality ?? '' }
    }
    return list
  })
  const [contact, setContact] = useState({ email: user?.email ?? '', phone: user?.phone ?? '', preferred: 'whatsapp' as ContactPreference })
  const [services, setServices] = useState<ServiceType[]>([])
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [passengerErrors, setPassengerErrors] = useState<PassengerErrors[]>([])
  const [contactErrors, setContactErrors] = useState<FieldErrors<'email' | 'phone' | 'consent'>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const perPassenger = passengers.map((passenger) => validatePassenger(passenger, departure))
    const contactFound: FieldErrors<'email' | 'phone' | 'consent'> = {}
    if (!isEmail(contact.email)) contactFound.email = 'Saisissez une adresse email valide (ex. nom@exemple.com).'
    if (!isPhone(contact.phone)) contactFound.phone = 'Saisissez un numéro valide, avec l’indicatif (ex. +253 77 00 00 00).'
    if (!consent) contactFound.consent = 'Votre accord est nécessaire pour que nous traitions la demande.'
    setPassengerErrors(perPassenger)
    setContactErrors(contactFound)
    return perPassenger.every((errors) => Object.keys(errors).length === 0) && Object.keys(contactFound).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setSubmitting(true)
    try {
      const booking = await bookingService.createRequest({ itinerary, search: params, passengers, contact, services, notes, ownerId: user?.id })
      onCreated(booking)
    } catch (error) {
      toast.error('Envoi impossible', error instanceof Error ? error.message : 'Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleService = (type: ServiceType) =>
    setServices((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]))

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-label="Demande de réservation">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-azure-600 hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Modifier le vol sélectionné
        </button>

        <section aria-labelledby={`${uid}-passengers`}>
          <h2 id={`${uid}-passengers`} className="font-display text-3xl text-night-900">
            Passagers
          </h2>
          <p className="mt-1 text-sm text-night-500">Saisissez les noms exactement comme sur les passeports.</p>
          <div className="mt-5 space-y-4">
            {passengers.map((passenger, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.5 }}>
                <PassengerForm
                  index={index}
                  idPrefix={`${uid}-p${index}`}
                  passenger={passenger}
                  errors={passengerErrors[index] ?? {}}
                  onChange={(value) => setPassengers((current) => current.map((item, i) => (i === index ? value : item)))}
                />
              </motion.div>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${uid}-contact`} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id={`${uid}-contact`} className="font-display text-3xl text-night-900">
            Contact
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextInput
              id={`${uid}-email`}
              type="email"
              label="Email"
              icon={Mail}
              autoComplete="email"
              value={contact.email}
              error={contactErrors.email}
              onChange={(event) => setContact({ ...contact, email: event.target.value })}
            />
            <TextInput
              id={`${uid}-phone`}
              type="tel"
              label="Téléphone"
              icon={Phone}
              autoComplete="tel"
              placeholder="+253 77 00 00 00"
              value={contact.phone}
              error={contactErrors.phone}
              onChange={(event) => setContact({ ...contact, phone: event.target.value })}
            />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-night-800">Comment préférez-vous être recontacté ?</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(
                [
                  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon className="size-4" /> },
                  { value: 'phone', label: 'Téléphone', icon: <Phone aria-hidden="true" className="size-4" /> },
                  { value: 'email', label: 'Email', icon: <Mail aria-hidden="true" className="size-4" /> },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-azure-500',
                    contact.preferred === option.value ? 'border-night-900 bg-night-900 text-white' : 'border-line text-night-700 hover:border-night-300',
                  )}
                >
                  <input
                    type="radio"
                    name={`${uid}-preferred`}
                    value={option.value}
                    checked={contact.preferred === option.value}
                    onChange={() => setContact({ ...contact, preferred: option.value })}
                    className="sr-only"
                  />
                  {option.icon}
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby={`${uid}-services`} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
          <h2 id={`${uid}-services`} className="font-display text-3xl text-night-900">
            Services optionnels
          </h2>
          <p className="mt-1 text-sm text-night-500">Votre conseiller vous proposera un devis pour chaque service choisi.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {BOOKABLE_SERVICES.map((type) => (
              <Checkbox
                key={type}
                label={SERVICE_LABELS[type]}
                checked={services.includes(type)}
                onChange={() => toggleService(type)}
                containerClassName={cn('rounded-2xl border p-4 transition', services.includes(type) ? 'border-night-900 bg-mist' : 'border-line')}
              />
            ))}
          </div>
          <TextArea
            id={`${uid}-notes`}
            label="Remarques"
            optional
            placeholder="Préférences de siège, repas, assistance, voyage de groupe…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            containerClassName="mt-5"
            rows={3}
          />
        </section>

        <DemoNotice>
          Vous envoyez une <strong>demande de réservation</strong> : aucun billet n'est émis et aucun paiement n'est effectué. Un conseiller vérifie la disponibilité
          réelle et le tarif, puis vous recontacte.
        </DemoNotice>

        <Checkbox
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          error={contactErrors.consent}
          label={
            <>
              J'accepte que FarhanDel Agency utilise ces informations pour traiter ma demande, conformément à la{' '}
              <Link to="/politique-de-confidentialite" className="font-semibold text-azure-600 underline">
                politique de confidentialité
              </Link>{' '}
              et aux{' '}
              <Link to="/conditions-generales" className="font-semibold text-azure-600 underline">
                conditions générales
              </Link>
              .
            </>
          }
        />

        <Button type="submit" size="lg" loading={submitting} iconLeft={!submitting && <Send className="size-5" aria-hidden="true" />} className="w-full sm:w-auto">
          Envoyer ma demande de réservation
        </Button>
      </form>

      <BookingSummary itinerary={itinerary} params={params} className="lg:sticky lg:top-28" />
    </div>
  )
}
