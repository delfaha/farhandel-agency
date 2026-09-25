import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Info, Phone } from 'lucide-react'
import { useState } from 'react'
import { ButtonAnchor } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/Misc'
import { contactLinks } from '@/config/site'
import { airport } from '@/data/airports'
import { checkInService, type CheckInResult } from '@/services/supportService'
import type { BookingLookup } from '@/types/booking'
import { legEndpoints } from '@/utils/booking'
import { formatDate, formatTime } from '@/utils/format'
import { BookingSearch } from './BookingSearch'

/**
 * Onglet « Check-in ». Le prototype n'est relié à aucun système d'enregistrement :
 * il identifie la réservation et oriente le voyageur, sans jamais prétendre effectuer le check-in.
 */
export function CheckIn() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<(CheckInResult & { lookup: BookingLookup }) | null>(null)

  const onSubmit = async (lookup: BookingLookup) => {
    setLoading(true)
    setResult(null)
    try {
      setResult({ ...(await checkInService.start(lookup)), lookup })
    } finally {
      setLoading(false)
    }
  }

  const booking = result?.booking
  const segment = booking && booking.status !== 'completed' ? legEndpoints(booking.legs[0]).first : null

  return (
    <div>
      <p className="mb-5 text-sm text-night-600">Préparez votre enregistrement en ligne avec votre numéro de réservation et votre nom de famille.</p>
      <BookingSearch
        submitLabel="Commencer le check-in"
        nameLabel="Nom de famille"
        loading={loading}
        onSubmit={onSubmit}
        icon={<BadgeCheck className="size-5" aria-hidden="true" />}
      />
      <div aria-live="polite">
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-6 rounded-3xl border border-azure-200 bg-azure-50/70 p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-azure-600 shadow-soft">
                  <Info aria-hidden="true" className="size-5" />
                </span>
                <div className="space-y-2 text-sm leading-relaxed text-night-700">
                  <p className="text-base font-semibold text-night-900">Check-in en ligne pas encore connecté</p>
                  <p>
                    Le site FarhanDel Agency n'est pas encore relié aux systèmes d'enregistrement des compagnies aériennes :{' '}
                    <strong>aucun check-in n'a été effectué</strong> et aucune carte d'embarquement n'a été émise.
                  </p>
                  {segment ? (
                    <p>
                      Réservation <strong>{result.lookup.pnr}</strong> identifiée : vol <strong>{segment.flightNumber}</strong> opéré par{' '}
                      <strong>{segment.airline.name}</strong>, départ de {airport(segment.from).city} le {formatDate(segment.departure, 'long')} à{' '}
                      {formatTime(segment.departure)}. Enregistrez-vous sur le site ou l'application de la compagnie (ouverture généralement 24 à 48 h avant
                      le départ) ou au comptoir de l'aéroport.
                    </p>
                  ) : booking ? (
                    <p>Cette réservation concerne un voyage déjà effectué : aucun enregistrement n'est nécessaire.</p>
                  ) : (
                    <p>
                      Aucune réservation de démonstration ne correspond à ces informations. Vérifiez votre numéro et votre nom, ou contactez votre conseiller.
                    </p>
                  )}
                  <p>Besoin d'aide pour votre enregistrement ? Votre conseiller vous accompagne.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 sm:pl-[52px]">
                <ButtonAnchor href={contactLinks.tel} variant="dark" size="sm" iconLeft={<Phone className="size-4" aria-hidden="true" />}>
                  Appeler l'agence
                </ButtonAnchor>
                <ButtonAnchor
                  href={contactLinks.whatsapp(`Bonjour, j'ai besoin d'aide pour l'enregistrement de ma réservation ${result.lookup.pnr}.`)}
                  variant="outline"
                  size="sm"
                  iconLeft={<WhatsAppIcon className="size-4" />}
                >
                  WhatsApp
                </ButtonAnchor>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
