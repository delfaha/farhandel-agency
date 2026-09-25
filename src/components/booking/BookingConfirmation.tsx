import { motion } from 'framer-motion'
import { Download, Home, LayoutDashboard, Search, UserPlus } from 'lucide-react'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { DemoNotice, WhatsAppIcon } from '@/components/ui/Misc'
import { contactLinks } from '@/config/site'
import { airport } from '@/data/airports'
import { useAuth } from '@/hooks/useStore'
import type { Booking } from '@/types/booking'
import { legEndpoints } from '@/utils/booking'
import { downloadConfirmation } from '@/utils/confirmation'
import { formatDate } from '@/utils/format'

function AnimatedCheck() {
  return (
    <svg viewBox="0 0 88 88" className="mx-auto size-24" aria-hidden="true">
      <motion.circle
        cx="44"
        cy="44"
        r="40"
        fill="none"
        stroke="#d6ac66"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M27 45 L39 57 L62 32"
        fill="none"
        stroke="#0b1a2e"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
      />
    </svg>
  )
}

const NEXT_STEPS = [
  { title: 'Vérification', text: 'Un conseiller vérifie la disponibilité réelle et le meilleur tarif pour votre itinéraire.' },
  { title: 'Proposition', text: 'Vous recevez une proposition détaillée par le canal choisi (WhatsApp, téléphone ou email).' },
  { title: 'Confirmation', text: "Après votre accord, le billet est émis et le règlement s'effectue selon les modalités convenues avec l'agence." },
]

/** Étape 3 : accusé de réception de la demande (aucun billet émis, aucun paiement). */
export function BookingConfirmation({ booking }: { booking: Booking }) {
  const { user } = useAuth()
  const { from, departure } = legEndpoints(booking.legs[0])
  const to = legEndpoints(booking.legs[booking.legs.length === 2 ? 0 : booking.legs.length - 1]).to

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <AnimatedCheck />
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 font-display text-h2 text-night-900">
          Demande bien envoyée
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mx-auto mt-3 max-w-xl text-lead text-night-600">
          Merci ! Votre demande pour {airport(from).city} → {airport(to).city}, le {formatDate(departure, 'long')}, a été enregistrée.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
        className="on-dark mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-night-900 p-6 text-white sm:flex-row sm:p-8"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sand-300">Référence de la demande</p>
          <p className="mt-1 font-mono text-4xl font-semibold tracking-[0.2em]">{booking.pnr}</p>
        </div>
        <BookingStatusBadge status={booking.status} size="md" />
      </motion.div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {NEXT_STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.12 }}
            className="rounded-3xl border border-line bg-white p-5"
          >
            <span className="grid size-9 place-items-center rounded-full bg-sand-100 text-sm font-semibold text-sand-800">{index + 1}</span>
            <p className="mt-3 font-semibold text-night-900">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-night-600">{step.text}</p>
          </motion.li>
        ))}
      </ol>

      <DemoNotice className="mt-8">
        Prototype : aucun billet n'a été émis et aucun paiement n'a été effectué. Retrouvez votre demande à tout moment dans « Gérer ma réservation » avec la
        référence {booking.pnr} et votre nom de famille.
      </DemoNotice>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="dark" onClick={() => downloadConfirmation(booking)} iconLeft={<Download className="size-4" aria-hidden="true" />}>
          Télécharger le récapitulatif
        </Button>
        {user ? (
          <ButtonLink to="/espace-client/reservations" variant="outline" iconLeft={<LayoutDashboard className="size-4" aria-hidden="true" />}>
            Voir mes réservations
          </ButtonLink>
        ) : (
          <ButtonLink to="/inscription" variant="outline" iconLeft={<UserPlus className="size-4" aria-hidden="true" />}>
            Créer un compte
          </ButtonLink>
        )}
        <ButtonLink to="/ma-reservation" state={{ pnr: booking.pnr, lastName: booking.passengers[0]?.lastName }} variant="outline" iconLeft={<Search className="size-4" aria-hidden="true" />}>
          Suivre ma demande
        </ButtonLink>
        <ButtonAnchor href={contactLinks.whatsapp(`Bonjour, je viens d'envoyer la demande de réservation ${booking.pnr}.`)} variant="ghost" iconLeft={<WhatsAppIcon className="size-4" />}>
          WhatsApp
        </ButtonAnchor>
        <ButtonLink to="/" variant="ghost" iconLeft={<Home className="size-4" aria-hidden="true" />}>
          Accueil
        </ButtonLink>
      </div>
    </div>
  )
}
