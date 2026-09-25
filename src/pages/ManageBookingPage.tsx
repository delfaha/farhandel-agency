import { AnimatePresence, motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { BookingDetails } from '@/components/booking/BookingDetails'
import { BookingSearch } from '@/components/booking/BookingSearch'
import { PageHero } from '@/components/layout/PageHero'
import { LoadingState } from '@/components/ui/LoadingState'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'
import { bookingService } from '@/services/bookingService'
import type { Booking, BookingLookup } from '@/types/booking'

function isLookup(value: unknown): value is BookingLookup {
  return typeof value === 'object' && value !== null && 'pnr' in value && 'lastName' in value
}

export default function ManageBookingPage() {
  useSeo({
    title: 'Gérer ma réservation',
    description: 'Consultez votre réservation FarhanDel Agency : itinéraire, horaires, passagers, bagages, services et statut. Ajoutez un service ou téléchargez votre confirmation.',
  })
  const location = useLocation()
  const initial = isLookup(location.state) ? location.state : undefined
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined)
  const resultRef = useRef<HTMLDivElement>(null)

  const search = async (lookup: BookingLookup) => {
    setLoading(true)
    setBooking(undefined)
    try {
      setBooking(await bookingService.lookup(lookup))
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initial) void search(initial)
    // Recherche automatique uniquement à l'arrivée depuis le dashboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Gérer ma réservation"
        title={
          <>
            Votre voyage, <em>en un coup d'œil</em>
          </>
        }
        description="Itinéraire, horaires, passagers, bagages, services et statut : retrouvez tout avec votre numéro de réservation."
        image={IMAGES.windowView}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Gérer ma réservation' }]}
      />
      <div className="bg-ivory pb-24">
        <div className="container-page relative z-10 -mt-10 sm:-mt-12">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-float ring-1 ring-night-900/5 sm:p-7">
            <BookingSearch submitLabel="Rechercher ma réservation" loading={loading} defaultValues={initial} onSubmit={search} />
          </div>
        </div>
        <div ref={resultRef} className="container-page mt-10 scroll-mt-28" aria-live="polite">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingState label="Recherche de votre réservation…" />
              </motion.div>
            ) : booking ? (
              <motion.div key={booking.pnr} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <BookingDetails key={booking.pnr} booking={booking} />
              </motion.div>
            ) : booking === null ? (
              <motion.p
                key="none"
                role="alert"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900"
              >
                <SearchX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                Aucune réservation ne correspond à ces informations. Vérifiez le numéro (6 caractères) et le nom de famille, ou contactez votre conseiller.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
