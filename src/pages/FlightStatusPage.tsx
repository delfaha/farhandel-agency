import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router'
import { FlightStatusForm, StatusNotFound } from '@/components/booking/FlightStatus'
import { FlightStatusCard, FlightStatusTimeline } from '@/components/booking/FlightStatusView'
import { PageHero } from '@/components/layout/PageHero'
import { LoadingState } from '@/components/ui/LoadingState'
import { DemoNotice } from '@/components/ui/Misc'
import { IMAGES } from '@/data/images'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { flightService } from '@/services/flightService'
import { isIsoDate, todayIso } from '@/utils/date'
import { isFlightNumber, normalizeFlightNumber } from '@/utils/validation'

export default function FlightStatusPage() {
  useSeo({
    title: 'Statut du vol',
    description: 'Suivez un vol : départ, destination, heures prévues et estimées, statut (à l’heure, retardé, embarquement, en vol, arrivé, annulé) et frise de progression.',
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const rawFlight = searchParams.get('vol') ?? ''
  const rawDate = searchParams.get('date')
  const flightNumber = rawFlight && isFlightNumber(rawFlight) ? normalizeFlightNumber(rawFlight) : ''
  const date = isIsoDate(rawDate) ? rawDate : todayIso()
  const enabled = !!flightNumber
  const status = useAsync(() => flightService.status({ flightNumber, date }), `${flightNumber}|${date}`, enabled)

  return (
    <>
      <PageHero
        eyebrow="Statut du vol"
        title={
          <>
            Où en est <em>votre vol</em> ?
          </>
        }
        description="Horaires prévus et estimés, statut et progression, de la réservation à l'arrivée."
        image={IMAGES.wingBlue}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Statut du vol' }]}
      />

      <div className="bg-ivory pb-24">
        <div className="container-page relative z-10 -mt-10 sm:-mt-12">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-float ring-1 ring-night-900/5 sm:p-7">
            <FlightStatusForm
              key={`${flightNumber}|${date}`}
              initial={{ flightNumber, date }}
              loading={status.loading && enabled}
              onSubmit={(query) => setSearchParams({ vol: query.flightNumber.replace(' ', ''), date: query.date }, { preventScrollReset: true })}
            />
          </div>
        </div>

        <div className="container-page mt-10 space-y-5" aria-live="polite">
          <DemoNotice>
            Démonstration : seuls les vols d'exemple renvoient un statut, entièrement simulé. Le suivi réel nécessitera une API de statut des vols ; en attendant,
            référez-vous à la compagnie aérienne.
          </DemoNotice>
          <AnimatePresence mode="wait">
            {!enabled ? null : status.loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingState label={`Recherche du vol ${flightNumber}…`} />
              </motion.div>
            ) : status.data ? (
              <motion.div key={status.data.flightNumber + date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5">
                <FlightStatusCard status={status.data} />
                <FlightStatusTimeline status={status.data} />
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <StatusNotFound flightNumber={flightNumber} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
