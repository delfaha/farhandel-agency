import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Luggage, SlidersHorizontal, Sparkles, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AirlineChip, EmptyState } from '@/components/ui/Misc'
import { Skeleton } from '@/components/ui/LoadingState'
import { airport } from '@/data/airports'
import { CABIN_LABELS } from '@/data/labels'
import type { FareDay, Itinerary, ItineraryTag } from '@/types/flight'
import { legEndpoints, type ResultFilters, type SortKey } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { formatDate, formatDuration, formatPrice } from '@/utils/format'
import { LegDetails, LegSummary } from './FlightDisplay'

const TAG_META: Record<ItineraryTag, { label: string; tone: 'emerald' | 'azure' | 'sand'; icon: typeof Zap }> = {
  recommended: { label: 'Recommandé', tone: 'sand', icon: Sparkles },
  cheapest: { label: 'Le moins cher', tone: 'emerald', icon: Check },
  fastest: { label: 'Le plus rapide', tone: 'azure', icon: Zap },
}

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommandés' },
  { value: 'price', label: 'Prix croissant' },
  { value: 'duration', label: 'Durée la plus courte' },
  { value: 'departure', label: 'Départ le plus tôt' },
]

/** Carte d'itinéraire : trajets, compagnie, durée, bagages, prix indicatif fictif. */
export function ItineraryCard({ itinerary, onSelect, travellers }: { itinerary: Itinerary; onSelect: (itinerary: Itinerary) => void; travellers: number }) {
  const [open, setOpen] = useState(false)
  const airlines = [...new Map(itinerary.legs.flatMap((leg) => leg.segments.map((segment) => [segment.airline.code, segment.airline]))).values()]

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white transition-shadow duration-500 hover:shadow-card">
      <div className="grid lg:grid-cols-[1fr_250px]">
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {airlines.map((airline) => (
              <span key={airline.code} className="flex items-center gap-2 text-sm font-semibold text-night-800">
                <AirlineChip airline={airline} size="sm" />
                {airline.name}
              </span>
            ))}
            {itinerary.tags.map((tag) => {
              const meta = TAG_META[tag]
              return (
                <Badge key={tag} tone={meta.tone} icon={<meta.icon aria-hidden="true" className="size-3" />}>
                  {meta.label}
                </Badge>
              )
            })}
          </div>
          <div className="space-y-5">
            {itinerary.legs.map((leg, index) => (
              <div key={index}>
                {itinerary.legs.length > 1 && (
                  <p className="mb-2 text-xs font-medium text-night-500">
                    {index === 0 ? 'Aller' : itinerary.legs.length === 2 ? 'Retour' : `Vol ${index + 1}`} · {formatDate(legEndpoints(leg).departure, 'dayMonth')}
                  </p>
                )}
                <LegSummary leg={leg} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-600 hover:underline"
          >
            {open ? 'Masquer les détails' : 'Détails du vol'}
            <ChevronDown aria-hidden="true" className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-line bg-ivory/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs text-night-500">
              {CABIN_LABELS[itinerary.cabin]} · {itinerary.fareName}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-night-900">{formatPrice(itinerary.pricePerAdult)}</p>
            <p className="text-xs text-night-500">par adulte · prix indicatif fictif</p>
            {travellers > 1 && <p className="mt-1 text-sm font-medium text-night-700">Total {formatPrice(itinerary.totalPrice)}</p>}
            <ul className="mt-3 space-y-1 text-xs text-night-600">
              <li className="flex items-center gap-1.5">
                <Luggage aria-hidden="true" className="size-3.5" /> Soute {itinerary.baggage.checkedPieces} × {itinerary.baggage.checkedKg} kg · cabine {itinerary.baggage.cabinKg} kg
              </li>
              <li className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-3.5" /> {itinerary.refundable ? 'Remboursable (selon conditions)' : 'Non remboursable'}
              </li>
            </ul>
          </div>
          <Button onClick={() => onSelect(itinerary)} fullWidth>
            Sélectionner
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="grid gap-6 border-t border-line p-5 sm:p-6 md:grid-cols-2">
              {itinerary.legs.map((leg, index) => (
                <div key={index}>
                  <p className="mb-3 text-sm font-semibold text-night-900">
                    {airport(legEndpoints(leg).from).city} → {airport(legEndpoints(leg).to).city} · {formatDuration(leg.durationMin)}
                  </p>
                  <LegDetails leg={leg} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

/** Bandeau de dates flexibles (± 3 jours) avec le prix indicatif le plus bas de chaque jour. */
export function FareCalendar({ days, selected, onSelect, loading }: { days: FareDay[]; selected: string; onSelect: (date: string) => void; loading: boolean }) {
  if (!days.length && !loading) return null
  const cheapest = Math.min(...days.map((day) => day.price ?? Infinity))
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-night-500">Dates flexibles · prix indicatif par adulte</p>
      <div role="group" aria-label="Dates flexibles : prix indicatif le plus bas par adulte autour de votre date de départ" className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {loading && !days.length
          ? Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className={cn('h-[72px] rounded-2xl', (index === 0 || index === 6) && 'max-sm:hidden')} />)
          : days.map((day, index) => {
              const active = day.date === selected
              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={day.price === null}
                  onClick={() => onSelect(day.date)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-2xl border px-1.5 py-3 text-center transition duration-300 disabled:cursor-not-allowed disabled:opacity-40',
                    (index === 0 || index === 6) && 'max-sm:hidden',
                    active ? 'border-night-900 bg-night-900 text-white shadow-card' : 'border-line bg-white hover:border-night-300',
                  )}
                >
                  <span className={cn('block text-xs first-letter:uppercase', active ? 'text-white/70' : 'text-night-500')}>{formatDate(day.date, 'dayMonth')}</span>
                  <span className={cn('mt-1 block text-[0.8rem] font-semibold sm:text-sm', !active && day.price === cheapest && 'text-emerald-700')}>
                    {day.price === null ? '—' : formatPrice(day.price)}
                  </span>
                </button>
              )
            })}
      </div>
    </div>
  )
}

/** Filtres (escales, compagnies) et tri des résultats. */
export function ResultsToolbar({ itineraries, filters, onChange }: { itineraries: Itinerary[]; filters: ResultFilters; onChange: (filters: ResultFilters) => void }) {
  const [open, setOpen] = useState(false)
  const airlines = useMemo(
    () => [...new Map(itineraries.flatMap((itinerary) => itinerary.legs.flatMap((leg) => leg.segments.map((segment) => [segment.airline.code, segment.airline])))).values()],
    [itineraries],
  )
  const toggleAirline = (code: string) =>
    onChange({ ...filters, airlines: filters.airlines.includes(code) ? filters.airlines.filter((item) => item !== code) : [...filters.airlines, code] })

  return (
    <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="filtres-resultats"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-night-800 transition hover:border-night-300"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtres
          {(filters.directOnly || filters.airlines.length > 0) && (
            <span className="grid size-5 place-items-center rounded-full bg-night-900 text-[0.65rem] text-white">{Number(filters.directOnly) + filters.airlines.length}</span>
          )}
        </button>
        <label className="flex items-center gap-2 text-sm text-night-600">
          Trier par
          <select
            value={filters.sort}
            onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
            className="h-10 rounded-full border border-line bg-white px-3 font-semibold text-night-900 focus:border-azure-500 focus:outline-none focus:ring-4 focus:ring-azure-500/15"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id="filtres-resultats" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 grid gap-5 border-t border-line pt-4 sm:grid-cols-[auto_1fr]">
              <label className="flex items-center gap-2.5 text-sm font-medium text-night-800">
                <input type="checkbox" checked={filters.directOnly} onChange={(event) => onChange({ ...filters, directOnly: event.target.checked })} className="size-4 accent-night-900" />
                Vols directs uniquement
              </label>
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-night-500">Compagnies</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {airlines.map((airline) => {
                    const active = filters.airlines.includes(airline.code)
                    return (
                      <button
                        key={airline.code}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleAirline(airline.code)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                          active ? 'border-night-900 bg-night-900 text-white' : 'border-line text-night-700 hover:border-night-300',
                        )}
                      >
                        {airline.name}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="grid gap-4 rounded-3xl border border-line bg-white p-6 lg:grid-cols-[1fr_250px]">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </div>
  )
}

export function NoResults({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="Aucun vol de démonstration ne correspond"
      description="Essayez d'autres dates, retirez des filtres, ou contactez-nous : nos conseillers ont accès à bien plus d'options que cette démonstration."
      action={onReset && <Button variant="outline" onClick={onReset}>Réinitialiser les filtres</Button>}
    />
  )
}
