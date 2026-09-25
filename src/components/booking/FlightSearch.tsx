import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Info, PlaneLanding, PlaneTakeoff, Plus, Search, Trash } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import type { FlightSearchParams, TripType } from '@/types/flight'
import { cn } from '@/utils/cn'
import { addDays, todayIso } from '@/utils/date'
import {
  defaultDraft,
  draftToParams,
  MAX_SEGMENTS,
  paramsToQuery,
  validateSearch,
  type SearchDraft,
  type SearchErrorKey,
} from '@/utils/search'
import type { FieldErrors } from '@/utils/validation'
import { AirportField, CabinField, DateField, PassengerField, TripTypeSelector } from './SearchFields'

interface FlightSearchProps {
  initialDraft?: SearchDraft
  /** Par défaut : navigation vers /reserver avec les paramètres de recherche. */
  onSearch?: (params: FlightSearchParams) => void
  submitLabel?: string
}

/** Moteur de recherche de vols : aller-retour, aller simple et multidestination. */
export function FlightSearch({ initialDraft, onSearch, submitLabel = 'Rechercher un vol' }: FlightSearchProps) {
  const uid = useId().replace(/:/g, '')
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<SearchDraft>(() => initialDraft ?? defaultDraft())
  const [errors, setErrors] = useState<FieldErrors<SearchErrorKey>>({})
  const [submitted, setSubmitted] = useState(false)
  const [swapTurns, setSwapTurns] = useState(0)
  const today = todayIso()

  const update = (next: SearchDraft) => {
    setDraft(next)
    if (submitted) setErrors(validateSearch(next))
  }

  const setSegment = (index: number, patch: Partial<SearchDraft['segments'][number]>) => {
    const segments = draft.segments.map((segment, i) => (i === index ? { ...segment, ...patch } : segment))
    let returnDate = draft.returnDate
    if (index === 0 && patch.date && returnDate && returnDate < patch.date) returnDate = addDays(patch.date, 7)
    update({ ...draft, segments, returnDate })
  }

  const changeTrip = (tripType: TripType) => {
    let segments = draft.segments
    if (tripType === 'multicity' && segments.length < 2) {
      const first = segments[0]
      segments = [first, { from: first.to, to: '', date: first.date ? addDays(first.date, 4) : '' }]
    }
    if (tripType !== 'multicity') segments = segments.slice(0, 1)
    update({ ...draft, tripType, segments })
  }

  const swap = () => {
    const [first, ...rest] = draft.segments
    setSwapTurns((turns) => turns + 1)
    update({ ...draft, segments: [{ ...first, from: first.to, to: first.from }, ...rest] })
  }

  const addSegment = () => {
    const last = draft.segments[draft.segments.length - 1]
    update({ ...draft, segments: [...draft.segments, { from: last.to, to: '', date: last.date ? addDays(last.date, 3) : '' }] })
  }

  const removeSegment = (index: number) => {
    update({ ...draft, segments: draft.segments.filter((_, i) => i !== index) })
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validateSearch(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus())
      return
    }
    const params = draftToParams(draft)
    if (onSearch) onSearch(params)
    else navigate(`/reserver?${paramsToQuery(params)}`)
  }

  const first = draft.segments[0]
  const errorCount = Object.keys(errors).length

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Rechercher un vol">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TripTypeSelector name={`${uid}-trip`} value={draft.tripType} onChange={changeTrip} />
        <p className="hidden items-center gap-1.5 text-xs text-night-500 md:flex">
          <Info aria-hidden="true" className="size-3.5" />
          Tarifs indicatifs · données de démonstration
        </p>
      </div>

      {draft.tripType !== 'multicity' ? (
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative grid gap-3 sm:grid-cols-2 lg:col-span-7">
            <AirportField
              id={`${uid}-from-0`}
              label="Départ"
              icon={PlaneTakeoff}
              placeholder="Ville ou aéroport"
              value={first.from}
              exclude={first.to}
              error={errors['from-0']}
              onChange={(code) => setSegment(0, { from: code })}
              onSelected={() => !first.to && toRef.current?.focus()}
            />
            <motion.button
              type="button"
              onClick={swap}
              aria-label="Inverser le départ et la destination"
              animate={{ rotate: swapTurns * 180 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute right-4 top-[74px] z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-night-800 shadow-soft transition-colors hover:border-night-900 hover:bg-night-900 hover:text-white sm:left-1/2 sm:right-auto sm:top-[34px] sm:-translate-x-1/2"
            >
              <ArrowLeftRight className="size-4 max-sm:rotate-90" aria-hidden="true" />
            </motion.button>
            <AirportField
              id={`${uid}-to-0`}
              label="Destination"
              icon={PlaneLanding}
              placeholder="Où allez-vous ?"
              value={first.to}
              exclude={first.from}
              error={errors['to-0']}
              inputRef={toRef}
              onChange={(code) => setSegment(0, { to: code })}
            />
          </div>
          <div className={cn('grid gap-3 lg:col-span-5', draft.tripType === 'roundtrip' ? 'grid-cols-2' : 'grid-cols-1')}>
            <DateField
              id={`${uid}-date-0`}
              label="Date de départ"
              value={first.date}
              min={today}
              error={errors['date-0']}
              onChange={(date) => setSegment(0, { date })}
            />
            <AnimatePresence initial={false}>
              {draft.tripType === 'roundtrip' && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <DateField
                    id={`${uid}-return`}
                    label="Date de retour"
                    value={draft.returnDate}
                    min={first.date || today}
                    error={errors.returnDate}
                    onChange={(returnDate) => update({ ...draft, returnDate })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {draft.segments.map((segment, index) => (
              <motion.fieldset
                key={index}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.85fr_auto]"
              >
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-night-500 sm:col-span-2 lg:col-span-4">
                  Vol {index + 1}
                </legend>
                <AirportField
                  id={`${uid}-from-${index}`}
                  label="Départ"
                  icon={PlaneTakeoff}
                  placeholder="Ville ou aéroport"
                  value={segment.from}
                  exclude={segment.to}
                  error={errors[`from-${index}`]}
                  onChange={(code) => setSegment(index, { from: code })}
                />
                <AirportField
                  id={`${uid}-to-${index}`}
                  label="Destination"
                  icon={PlaneLanding}
                  placeholder="Où allez-vous ?"
                  value={segment.to}
                  exclude={segment.from}
                  error={errors[`to-${index}`]}
                  onChange={(code) => setSegment(index, { to: code })}
                />
                <DateField
                  id={`${uid}-date-${index}`}
                  label="Date"
                  value={segment.date}
                  min={index > 0 ? draft.segments[index - 1].date || today : today}
                  error={errors[`date-${index}`]}
                  onChange={(date) => setSegment(index, { date })}
                />
                <button
                  type="button"
                  onClick={() => removeSegment(index)}
                  disabled={draft.segments.length <= 2}
                  aria-label={`Supprimer le vol ${index + 1}`}
                  className="grid h-[68px] w-full place-items-center rounded-2xl border border-line text-night-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 sm:w-[68px]"
                >
                  <Trash className="size-4" aria-hidden="true" />
                </button>
              </motion.fieldset>
            ))}
          </AnimatePresence>
          {draft.segments.length < MAX_SEGMENTS && (
            <button
              type="button"
              onClick={addSegment}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-azure-600 transition hover:bg-azure-50"
            >
              <Plus className="size-4" aria-hidden="true" />
              Ajouter un vol
            </button>
          )}
        </div>
      )}

      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <PassengerField id={`${uid}-passengers`} value={draft.passengers} error={errors.passengers} onChange={(passengers) => update({ ...draft, passengers })} />
        </div>
        <div className="lg:col-span-3">
          <CabinField id={`${uid}-cabin`} value={draft.cabin} onChange={(cabin) => update({ ...draft, cabin })} />
        </div>
        <div className="sm:col-span-2 lg:col-span-5 lg:flex lg:justify-end xl:col-span-6">
          <Button type="submit" size="lg" iconLeft={<Search className="size-5" aria-hidden="true" />} className="h-[68px] w-full rounded-2xl text-[1.02rem] lg:w-auto lg:min-w-[280px]">
            {submitLabel}
          </Button>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {errorCount > 0 ? `${errorCount} champ${errorCount > 1 ? 's' : ''} à corriger.` : ''}
      </p>
      <p className="mt-4 flex items-start gap-1.5 text-xs text-night-500 md:hidden">
        <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        Tarifs indicatifs · données de démonstration
      </p>
    </form>
  )
}
