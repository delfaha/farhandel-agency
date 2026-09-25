import { motion } from 'framer-motion'
import { BadgeCheck, Bell, Luggage, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { SITE } from '@/config/site'
import { IMAGES } from '@/data/images'
import { EASE_PREMIUM } from '@/utils/motion'

const PERKS = [
  { icon: Ticket, text: 'Toutes vos réservations et demandes au même endroit' },
  { icon: Luggage, text: 'Bagages, services et documents de voyage' },
  { icon: Bell, text: 'Notifications sur vos vols et vos demandes' },
  { icon: BadgeCheck, text: "Un conseiller qui connaît votre dossier" },
]

/** Mise en page des pages Connexion / Inscription : panneau photo + carte formulaire. */
export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: ReactNode; subtitle: ReactNode }) {
  return (
    <section className="on-dark relative isolate min-h-dvh overflow-hidden bg-night-950 pb-16 pt-28 text-white sm:pt-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SmartImage image={IMAGES.authSky} sizes="100vw" priority className="size-full" imgClassName="ken-burns" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgb(6_15_29/0.92)_0%,rgb(6_15_29/0.72)_45%,rgb(6_15_29/0.45)_100%)]" />
      </div>
      <div className="container-page grid items-center lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE_PREMIUM }}>
          <p className="hidden text-eyebrow font-semibold uppercase text-sand-300 lg:block">{SITE.name} · Espace client</p>
          <h1 className="sr-only font-display text-h1 lg:not-sr-only lg:mt-5 lg:block">{title}</h1>
          <p className="mt-5 hidden max-w-lg text-lead text-white/75 lg:block">{subtitle}</p>
          <ul className="mt-10 hidden space-y-4 lg:block">
            {PERKS.map((perk, index) => (
              <motion.li
                key={perk.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: EASE_PREMIUM }}
                className="flex items-center gap-4 text-white/85"
              >
                <span className="glass grid size-11 place-items-center rounded-xl text-sand-300">
                  <perk.icon aria-hidden="true" className="size-5" />
                </span>
                {perk.text}
              </motion.li>
            ))}
          </ul>
          <p className="mt-12 hidden font-display text-3xl italic text-sand-300 lg:block">{SITE.slogan}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_PREMIUM }}
          className="rounded-[2rem] bg-white p-6 text-night-900 shadow-float sm:p-10"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
