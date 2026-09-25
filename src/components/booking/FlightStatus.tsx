import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Plane, Radar, SearchX } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { FLIGHT_STATUS_META } from '@/data/labels'
import { flightService } from '@/services/flightService'
import { DEMO_FLIGHT_HINTS } from '@/services/mock/flightStatus'
import type { FlightStatusInfo, FlightStatusQuery } from '@/types/flight'
import { statusLink } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { todayIso } from '@/utils/date'
import { isFlightNumber, normalizeFlightNumber, type FieldErrors } from '@/utils/validation'
import { FlightStatusCard } from './FlightStatusView'
import { BoxInput, DateField } from './SearchFields'

interface FlightStatusFormProps {
  initial?: Partial<FlightStatusQuery>
  loading?: boolean
  onSubmit: (query: FlightStatusQuery) => void
}

/** Formulaire numéro de vol + date, avec vols de démonstration à essayer. */
export function FlightStatusForm({ initial, loading, onSubmit }: FlightStatusFormProps) {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const [flightNumber, setFlightNumber] = useState(initial?.flightNumber ?? '')
  const [date, setDate] = useState(initial?.date ?? todayIso())
  const [errors, setErrors] = useState<FieldErrors<'flight' | 'date'>>({})

  const submit = (query: FlightStatusQuery) => {
    const found: FieldErrors<'flight' | 'date'> = {}
    if (!query.flightNumber.trim()) found.flight = 'Saisissez un numéro de vol.'
    else if (!isFlightNumber(query.flightNumber)) found.flight = 'Format attendu : code compagnie + numéro (ex. TK 686).'
    if (!query.date) found.date = 'Choisissez une date.'
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    onSubmit({ flightNumber: normalizeFlightNumber(query.flightNumber), date: query.date })
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit({ flightNumber, date })
  }

  return (
    <form ref={formRef} onSubmit={onFormSubmit} noValidate>
      <div className="grid items-start gap-3 md:grid-cols-[1fr_1fr_auto]">
        <BoxInput
          id={`${uid}-flight`}
          label="Numéro de vol"
          icon={Plane}
          value={flightNumber}
          placeholder="Ex. TK 686"
          autoComplete="off"
          spellCheck={false}
          error={errors.flight}
          onChange={(event) => setFlightNumber(event.target.value.toUpperCase())}
        />
        <DateField id={`${uid}-date`} label="Date" value={date} error={errors.date} onChange={setDate} />
        <Button type="submit" size="lg" loading={loading} iconLeft={<Radar className="size-5" aria-hidden="true" />} className="h-[68px] w-full rounded-2xl md:w-auto">
          Rechercher
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-night-500">
        <span>Vols de démonstration :</span>
        {DEMO_FLIGHT_HINTS.map((hint) => (
          <button
            key={hint.number}
            type="button"
            onClick={() => {
              setFlightNumber(hint.number)
              setDate(todayIso())
              submit({ flightNumber: hint.number, date: todayIso() })
            }}
            className="rounded-md bg-mist px-2 py-1 font-semibold text-night-800 transition hover:bg-sand-100"
          >
            {hint.number}
            <span className="sr-only"> ({FLIGHT_STATUS_META[hint.scenario].label})</span>
          </button>
        ))}
      </div>
    </form>
  )
}

export function StatusNotFound({ flightNumber }: { flightNumber: string }) {
  return (
    <p role="alert" className="flex items-start gap-3 rounded-2xl border border-night-100 bg-mist px-4 py-3.5 text-sm text-night-700">
      <SearchX aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-night-500" />
      <span>
        Le vol <strong>{flightNumber}</strong> n'est pas couvert par la démonstration. Le suivi en temps réel de tous les vols sera disponible après
        connexion à une API de statut des vols ; en attendant, consultez le site de la compagnie ou contactez votre conseiller.
      </span>
    </p>
  )
}

/** Onglet « Statut du vol » du dashboard. */
export function FlightStatus() {
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<FlightStatusQuery | null>(null)
  const [status, setStatus] = useState<FlightStatusInfo | null | undefined>(undefined)

  const onSubmit = async (next: FlightStatusQuery) => {
    setLoading(true)
    setQuery(next)
    setStatus(undefined)
    try {
      setStatus(await flightService.status(next))
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="mb-5 text-sm text-night-600">Suivez un vol : horaires prévus et estimés, statut et progression.</p>
      <FlightStatusForm loading={loading} onSubmit={onSubmit} />
      <div aria-live="polite" className={cn(status !== undefined && 'mt-6')}>
        <AnimatePresence mode="wait">
          {status && query && (
            <motion.div key={status.flightNumber + status.date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <FlightStatusCard status={status} compact />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-night-500">Statut simulé à des fins de démonstration — ne reflète pas l'état réel du vol.</p>
                <Link to={statusLink(query)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-azure-600 hover:underline">
                  Suivi détaillé et frise
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
          {status === null && query && (
            <motion.div key="none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StatusNotFound flightNumber={query.flightNumber} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
