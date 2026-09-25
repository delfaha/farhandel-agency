import { AnimatePresence, motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { bookingService } from '@/services/bookingService'
import type { Booking, BookingLookup } from '@/types/booking'
import { BookingPreview } from './BookingDetails'
import { BookingSearch } from './BookingSearch'

type Result = { kind: 'found'; booking: Booking; lookup: BookingLookup } | { kind: 'not-found' } | { kind: 'error'; message: string }

/** Onglet « Gérer ma réservation » : recherche puis aperçu (itinéraire, horaires, passager, bagages, services, statut). */
export function ManageBooking() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const onSubmit = async (lookup: BookingLookup) => {
    setLoading(true)
    setResult(null)
    try {
      const booking = await bookingService.lookup(lookup)
      setResult(booking ? { kind: 'found', booking, lookup } : { kind: 'not-found' })
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Service indisponible.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="mb-5 text-sm text-night-600">Consultez votre itinéraire, vos horaires, vos bagages et vos services, ou ajoutez une demande.</p>
      <BookingSearch submitLabel="Rechercher ma réservation" loading={loading} onSubmit={onSubmit} />
      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {result?.kind === 'found' && (
            <motion.div key={result.booking.pnr} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <BookingPreview booking={result.booking} onOpen={() => navigate('/ma-reservation', { state: result.lookup })} />
            </motion.div>
          )}
          {(result?.kind === 'not-found' || result?.kind === 'error') && (
            <motion.p
              key="not-found"
              role="alert"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-900"
            >
              <SearchX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {result.kind === 'error'
                ? result.message
                : 'Aucune réservation ne correspond à ces informations. Vérifiez le numéro (6 caractères) et le nom de famille, ou contactez votre conseiller.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
