import { motion } from 'framer-motion'
import { BadgeCheck, Eye, Plane, Radar } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { airport } from '@/data/airports'
import { CABIN_LABELS } from '@/data/labels'
import type { Booking } from '@/types/booking'
import { flightStatusLink, legEndpoints } from '@/utils/booking'
import { diffDays, todayIso } from '@/utils/date'
import { formatDate, formatDuration, formatTime } from '@/utils/format'
import { BookingDetailsModal } from './ReservationCard'

/** « Prochain voyage » au format carte d'embarquement, avec compte à rebours. */
export function NextTripCard({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const leg = booking.legs[0]
  const { first, last } = legEndpoints(leg)
  const from = airport(first.from)
  const to = airport(last.to)
  const days = Math.max(0, diffDays(todayIso(), first.departure))

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="on-dark relative overflow-hidden rounded-[2rem] bg-night-900 text-white shadow-float"
    >
      <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-sand-400/20 blur-3xl" />
      <div className="relative grid md:grid-cols-[1fr_220px]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand-300">Prochain voyage</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <p className="font-display text-6xl leading-none sm:text-7xl">{from.code}</p>
              <p className="mt-1 text-sm text-white/65">{from.city}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative flex w-20 items-center sm:w-32">
                <span className="h-px flex-1 border-t border-dashed border-white/35" />
                <motion.span initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
                  <Plane aria-hidden="true" className="mx-1 size-5 rotate-45 text-sand-300" />
                </motion.span>
                <span className="h-px flex-1 border-t border-dashed border-white/35" />
              </div>
              <p className="mt-2 text-xs text-white/60">{formatDuration(leg.durationMin)}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-6xl leading-none sm:text-7xl">{to.code}</p>
              <p className="mt-1 text-sm text-white/65">{to.city}</p>
            </div>
          </div>
          <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-white/55">Date</dt>
              <dd className="mt-0.5 font-semibold first-letter:uppercase">{formatDate(first.departure, 'dayMonth')}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">Départ</dt>
              <dd className="mt-0.5 font-semibold">{formatTime(first.departure)}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">Vol</dt>
              <dd className="mt-0.5 font-semibold">{first.flightNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">Classe</dt>
              <dd className="mt-0.5 font-semibold">{CABIN_LABELS[booking.cabin]}</dd>
            </div>
          </dl>
        </div>

        {/* Talon de la carte d'embarquement */}
        <div className="relative flex flex-col justify-between gap-5 border-t border-dashed border-white/20 bg-white/5 p-6 sm:p-8 md:border-l md:border-t-0">
          <span aria-hidden="true" className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-ivory md:block" />
          <span aria-hidden="true" className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-ivory md:block" />
          <div>
            <p className="text-xs text-white/55">Départ dans</p>
            <p className="font-display text-6xl leading-none text-sand-300">{days}</p>
            <p className="text-sm text-white/65">jour{days > 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm font-semibold">
            <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-night-900 transition hover:bg-sand-300">
              <Eye aria-hidden="true" className="size-4" /> Voir les détails
            </button>
            <Link to={flightStatusLink(booking)} className="flex items-center gap-2 rounded-full px-4 py-2 text-white/85 transition hover:bg-white/10">
              <Radar aria-hidden="true" className="size-4" /> Statut du vol
            </Link>
            <Link to="/check-in" className="flex items-center gap-2 rounded-full px-4 py-2 text-white/85 transition hover:bg-white/10">
              <BadgeCheck aria-hidden="true" className="size-4" /> Check-in
            </Link>
          </div>
        </div>
      </div>
      <BookingDetailsModal booking={open ? booking : null} onClose={() => setOpen(false)} />
    </motion.article>
  )
}
