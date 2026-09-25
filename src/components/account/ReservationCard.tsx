import { motion } from 'framer-motion'
import { Clock, Download, Eye, Plane, Radar, Sparkles, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { BookingDetails } from '@/components/booking/BookingDetails'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { airport } from '@/data/airports'
import { SERVICE_LABELS } from '@/data/labels'
import type { Booking } from '@/types/booking'
import { flightStatusLink, legEndpoints } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { diffDays, todayIso } from '@/utils/date'
import { formatDate, formatTime } from '@/utils/format'
import { downloadConfirmation } from '@/utils/confirmation'

/** Modale de détail d'une réservation (réutilisée par plusieurs pages). */
export function BookingDetailsModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  return (
    <Modal open={booking !== null} onClose={onClose} title={booking ? `Réservation ${booking.pnr}` : ''} size="xl">
      {booking && <BookingDetails key={booking.pnr} booking={booking} />}
    </Modal>
  )
}

/** Carte réservation : numéro, destination, date, heure, statut, passagers, services + actions. */
export function ReservationCard({ booking, index = 0 }: { booking: Booking; index?: number }) {
  const [open, setOpen] = useState(false)
  const firstLeg = booking.legs[0]
  const { first, from } = legEndpoints(firstLeg)
  const destination = legEndpoints(booking.legs.length === 2 ? firstLeg : booking.legs[booking.legs.length - 1]).to
  const upcoming = booking.status === 'confirmed' || booking.status === 'pending'
  const days = diffDays(todayIso(), first.departure)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl border border-line bg-white transition-shadow duration-500 hover:shadow-card"
    >
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-semibold tracking-[0.16em] text-night-900">{booking.pnr}</span>
            <BookingStatusBadge status={booking.status} />
            {upcoming && days >= 0 && <span className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-semibold text-sand-800">J-{days}</span>}
          </div>
          <h3 className="mt-3 font-display text-3xl leading-none text-night-900">
            {airport(from).city} <span className="text-night-300">→</span> {airport(destination).city}
          </h3>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Date</dt>
              <Clock aria-hidden="true" className="size-4 text-night-400" />
              <dd className="text-night-700 first-letter:uppercase">{formatDate(first.departure, 'medium')}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Heure et vol</dt>
              <Plane aria-hidden="true" className="size-4 rotate-45 text-night-400" />
              <dd className="text-night-700">
                {formatTime(first.departure)} · {first.flightNumber}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Passagers</dt>
              <UsersRound aria-hidden="true" className="size-4 text-night-400" />
              <dd className="truncate text-night-700">{booking.passengers.map((passenger) => `${passenger.firstName} ${passenger.lastName.toUpperCase()}`).join(', ')}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Services</dt>
              <Sparkles aria-hidden="true" className="size-4 text-night-400" />
              <dd className="truncate text-night-700">{booking.services.length ? booking.services.map((service) => SERVICE_LABELS[service.type]).join(', ') : 'Aucun service'}</dd>
            </div>
          </dl>
        </div>
        <div className={cn('flex flex-wrap gap-2 md:flex-col md:items-stretch')}>
          <Button size="sm" variant="dark" onClick={() => setOpen(true)} iconLeft={<Eye className="size-4" aria-hidden="true" />}>
            Voir les détails
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadConfirmation(booking)} iconLeft={<Download className="size-4" aria-hidden="true" />}>
            Télécharger la confirmation
          </Button>
          {upcoming && (
            <Link to={flightStatusLink(booking)} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-azure-600 hover:underline">
              <Radar aria-hidden="true" className="size-4" /> Statut du vol
            </Link>
          )}
        </div>
      </div>
      <BookingDetailsModal booking={open ? booking : null} onClose={() => setOpen(false)} />
    </motion.article>
  )
}
