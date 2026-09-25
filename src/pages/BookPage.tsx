import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Plane } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { BookingForm } from '@/components/booking/BookingForm'
import { FareCalendar, ItineraryCard, NoResults, ResultsSkeleton, ResultsToolbar } from '@/components/booking/FlightResults'
import { FlightSearch } from '@/components/booking/FlightSearch'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { DemoNotice } from '@/components/ui/Misc'
import { airport, airportLabel } from '@/data/airports'
import { IMAGES } from '@/data/images'
import { CABIN_LABELS, TRIP_LABELS } from '@/data/labels'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { bookingService } from '@/services/bookingService'
import { flightService } from '@/services/flightService'
import type { Booking } from '@/types/booking'
import type { FlightSearchParams } from '@/types/flight'
import { applyFilters, type ResultFilters } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { addDays, todayIso } from '@/utils/date'
import { formatDate } from '@/utils/format'
import { paramsToQuery, passengerSummary, queryToSearch, totalPassengers } from '@/utils/search'

const STEPS = ['Vols', 'Passagers', 'Confirmation']
const POPULAR_ROUTES = ['IST', 'DXB', 'ADD', 'CDG', 'JED', 'NBO']
const DEFAULT_FILTERS: ResultFilters = { directOnly: false, airlines: [], sort: 'recommended' }

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Étapes de la réservation">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4" aria-current={active ? 'step' : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-8 place-items-center rounded-full text-sm font-semibold transition-colors duration-500',
                  done ? 'bg-emerald-600 text-white' : active ? 'bg-night-900 text-sand-300' : 'bg-night-100 text-night-500',
                )}
              >
                {done ? <Check aria-hidden="true" className="size-4" /> : index + 1}
              </span>
              <span className={cn('text-sm font-semibold', active ? 'text-night-900' : 'text-night-500', !active && 'max-sm:sr-only')}>{label}</span>
            </span>
            {index < STEPS.length - 1 && <span aria-hidden="true" className={cn('h-px w-6 sm:w-12', done ? 'bg-emerald-600' : 'bg-night-200')} />}
          </li>
        )
      })}
    </ol>
  )
}

function quickSearch(to: string): string {
  const aller = addDays(todayIso(), 14)
  return `/reserver?${paramsToQuery({
    tripType: 'roundtrip',
    segments: [{ from: 'JIB', to, date: aller }],
    returnDate: addDays(aller, 7),
    passengers: { adults: 1, children: 0, infants: 0 },
    cabin: 'economy',
  })}`
}

function searchTitle(params: FlightSearchParams): string {
  const first = params.segments[0]
  if (params.tripType === 'multicity') return params.segments.map((segment) => airport(segment.from).city).concat(airport(params.segments.at(-1)!.to).city).join(' → ')
  return `${airport(first.from).city} → ${airport(first.to).city}`
}

export default function BookPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { draft, params } = useMemo(() => queryToSearch(searchParams), [searchParams])
  const queryKey = params ? paramsToQuery(params) : ''
  const step = searchParams.get('etape')
  const selectedId = searchParams.get('vol')
  const reference = searchParams.get('ref')
  // Les filtres sont réinitialisés à chaque nouvelle recherche (clé = paramètres de recherche).
  const [filterState, setFilterState] = useState<{ key: string; filters: ResultFilters }>({ key: queryKey, filters: DEFAULT_FILTERS })
  const filters = filterState.key === queryKey ? filterState.filters : DEFAULT_FILTERS
  const setFilters = (next: ResultFilters) => setFilterState({ key: queryKey, filters: next })
  const [created, setCreated] = useState<Booking | null>(null)

  useSeo({
    title: params ? `Vols ${searchTitle(params)}` : 'Réserver un vol',
    description: "Recherchez un vol au départ de Djibouti : aller-retour, aller simple ou multidestination. Demande de réservation accompagnée par un conseiller FarhanDel Agency.",
    canonical: '/reserver',
  })

  const results = useAsync(() => flightService.search(params as FlightSearchParams), queryKey, !!params)
  const calendar = useAsync(() => flightService.fareCalendar(params as FlightSearchParams), queryKey, !!params && params.tripType !== 'multicity')
  const confirmation = useAsync(() => bookingService.getByPnr(reference ?? ''), reference ?? '', step === 'confirmation' && !!reference && created?.pnr !== reference)

  const itineraries = useMemo(() => results.data?.itineraries ?? [], [results.data])
  const visible = useMemo(() => applyFilters(itineraries, filters), [itineraries, filters])
  const selected = itineraries.find((itinerary) => itinerary.id === selectedId)
  const currentStep = step === 'confirmation' ? 2 : step === 'passagers' ? 1 : 0
  const booking = created?.pnr === reference ? created : (confirmation.data ?? null)

  const goTo = (update: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams)
    update(next)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeDate = (date: string) => {
    if (!params) return
    const next: FlightSearchParams = { ...params, segments: [{ ...params.segments[0], date }, ...params.segments.slice(1)] }
    setSearchParams(paramsToQuery(next), { preventScrollReset: true })
  }

  return (
    <>
      <PageHero
        eyebrow="Réservation"
        title={params ? searchTitle(params) : <>Réserver un <em>vol</em></>}
        description={
          params
            ? `${TRIP_LABELS[params.tripType]} · ${formatDate(params.segments[0].date, 'medium')}${params.returnDate ? ` → ${formatDate(params.returnDate, 'medium')}` : ''} · ${passengerSummary(params.passengers)} · ${CABIN_LABELS[params.cabin]}`
            : 'Aller-retour, aller simple ou multidestination : trouvez votre vol, puis envoyez votre demande à un conseiller.'
        }
        image={IMAGES.wingWhite}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Réserver' }]}
      />

      <div className="bg-ivory pb-24">
        {currentStep === 0 && (
          <div className="container-page relative z-10 -mt-10 sm:-mt-12">
            <div className="rounded-[1.75rem] bg-white p-4 shadow-float ring-1 ring-night-900/5 sm:p-7">
              <FlightSearch key={queryKey} initialDraft={draft} onSearch={(next) => setSearchParams(paramsToQuery(next))} submitLabel={params ? 'Modifier la recherche' : 'Rechercher un vol'} />
            </div>
          </div>
        )}

        <div className="container-page pt-10">
          {params && <Stepper current={currentStep} />}

          <AnimatePresence mode="wait">
            {!params && (
              <motion.section key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-labelledby="routes-title" className="mt-4">
                <h2 id="routes-title" className="font-display text-3xl text-night-900">
                  Itinéraires populaires au départ de Djibouti
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {POPULAR_ROUTES.map((code) => (
                    <li key={code}>
                      <Link
                        to={quickSearch(code)}
                        className="group flex items-center justify-between rounded-2xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
                      >
                        <span>
                          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-night-500">JIB → {code}</span>
                          <span className="mt-1 block text-lg font-semibold text-night-900">Djibouti → {airport(code).city}</span>
                        </span>
                        <span className="grid size-10 place-items-center rounded-full bg-mist text-night-800 transition group-hover:bg-night-900 group-hover:text-sand-300">
                          <ArrowRight aria-hidden="true" className="size-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <DemoNotice className="mt-8 max-w-3xl" />
              </motion.section>
            )}

            {params && currentStep === 0 && (
              <motion.section key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-labelledby="results-title" className="mt-8 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 id="results-title" className="font-display text-3xl text-night-900">
                      Vols disponibles <span className="text-night-400">(démonstration)</span>
                    </h2>
                    <p className="mt-1 text-sm text-night-500" aria-live="polite">
                      {results.loading ? 'Recherche des meilleures options…' : `${visible.length} proposition${visible.length > 1 ? 's' : ''} · ${airportLabel(params.segments[0].from)} → ${airportLabel(params.segments[0].to)}`}
                    </p>
                  </div>
                </div>
                <DemoNotice />
                {params.tripType !== 'multicity' && (
                  <FareCalendar days={calendar.data ?? []} loading={calendar.loading} selected={params.segments[0].date} onSelect={changeDate} />
                )}
                {!results.loading && itineraries.length > 0 && <ResultsToolbar itineraries={itineraries} filters={filters} onChange={setFilters} />}
                {results.loading ? (
                  <>
                    <LoadingState label="Recherche des vols de démonstration…" className="py-6" />
                    <ResultsSkeleton />
                  </>
                ) : results.error ? (
                  <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">
                    La recherche a échoué : {results.error.message}{' '}
                    <button type="button" onClick={results.reload} className="font-semibold underline">
                      Réessayer
                    </button>
                  </p>
                ) : visible.length === 0 ? (
                  <NoResults onReset={itineraries.length ? () => setFilters(DEFAULT_FILTERS) : undefined} />
                ) : (
                  <ul className="space-y-4">
                    {visible.map((itinerary, index) => (
                      <motion.li key={itinerary.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 6) * 0.06, duration: 0.5 }}>
                        <ItineraryCard
                          itinerary={itinerary}
                          travellers={totalPassengers(params.passengers)}
                          onSelect={(chosen) =>
                            goTo((next) => {
                              next.set('etape', 'passagers')
                              next.set('vol', chosen.id)
                            })
                          }
                        />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.section>
            )}

            {params && currentStep === 1 && (
              <motion.section key="passengers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
                {results.loading ? (
                  <LoadingState label="Chargement du vol sélectionné…" />
                ) : selected ? (
                  <BookingForm
                    itinerary={selected}
                    params={params}
                    onBack={() =>
                      goTo((next) => {
                        next.delete('etape')
                        next.delete('vol')
                      })
                    }
                    onCreated={(newBooking) => {
                      setCreated(newBooking)
                      goTo((next) => {
                        next.set('etape', 'confirmation')
                        next.set('ref', newBooking.pnr)
                        next.delete('vol')
                      })
                    }}
                  />
                ) : (
                  <div className="rounded-3xl border border-line bg-white p-8 text-center">
                    <Plane aria-hidden="true" className="mx-auto size-8 text-night-300" />
                    <p className="mt-3 font-semibold text-night-900">Ce vol n'est plus disponible dans la démonstration.</p>
                    <Button
                      className="mt-5"
                      variant="dark"
                      onClick={() =>
                        goTo((next) => {
                          next.delete('etape')
                          next.delete('vol')
                        })
                      }
                    >
                      Revenir aux résultats
                    </Button>
                  </div>
                )}
              </motion.section>
            )}

            {params && currentStep === 2 && (
              <motion.section key="confirmation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-12">
                {booking ? (
                  <BookingConfirmation booking={booking} />
                ) : confirmation.loading ? (
                  <LoadingState label="Chargement de votre demande…" />
                ) : (
                  <p className="text-center text-night-600">Demande introuvable sur cet appareil.</p>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
