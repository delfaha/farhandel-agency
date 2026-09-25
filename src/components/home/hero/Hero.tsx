import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Compass, Plane } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { FlightDashboard } from '@/components/booking/FlightDashboard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { SplitText } from '@/components/ui/Motion'
import { SITE } from '@/config/site'
import { usePauseOffscreen } from '@/hooks/useDom'
import { cn } from '@/utils/cn'
import { EASE_PREMIUM } from '@/utils/motion'
import { readStorage, writeStorage } from '@/utils/storage'
import { FlagsGreeting } from './FlagsGreeting'
import { HeroPlane, HeroSky } from './HeroSky'

/** Chronologie de l'histoire visuelle (secondes). Rejouée en version courte lors des visites suivantes. */
const FIRST_VISIT = { logo: 0.15, flags: 0.5, greet: 1.55, title: 1.75, details: 2.15, plane: 2.3, dashboard: 2.45 }
const RETURN_VISIT = { logo: 0, flags: 0.1, greet: 0.9, title: 0.15, details: 0.3, plane: 1.2, dashboard: 0.35 }
const INSTANT = { logo: 0, flags: 0, greet: 0, title: 0, details: 0, plane: 0, dashboard: 0 }

function useIntroTiming() {
  const reduce = useReducedMotion()
  const [firstVisit] = useState(() => !readStorage('intro-played', false, 'session'))
  useEffect(() => {
    writeStorage('intro-played', true, 'session')
  }, [])
  return reduce ? INSTANT : firstVisit ? FIRST_VISIT : RETURN_VISIT
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE_PREMIUM },
})

export function Hero() {
  const t = useIntroTiming()
  const sectionRef = useRef<HTMLElement>(null)
  usePauseOffscreen(sectionRef)

  const startBooking = () => {
    const dashboard = document.getElementById('reservation')
    dashboard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => dashboard?.querySelector<HTMLInputElement>('[role="combobox"][id*="-to-"]')?.focus({ preventScroll: true }), 650)
  }

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="on-dark relative isolate bg-night-950 text-white">
      {/* Couche 1 : ciel, nuages, paysage aérien */}
      <HeroSky />
      {/* Couche 2 : avion en arrière-plan */}
      <HeroPlane delay={t.plane} />

      {/* Couche 3 : contenu FarhanDel Agency + dashboard.
          Mobile : titre → drapeaux → dashboard → boutons → badge (le dashboard reste proche du haut).
          Desktop : titre et boutons à gauche, drapeaux et badge à droite, dashboard pleine largeur. */}
      <div
        className={cn(
          'container-page relative z-20 grid gap-y-8 pb-10 pt-28 sm:pt-32 lg:gap-x-8 lg:gap-y-6 lg:pb-14',
          '[grid-template-areas:"text""flags""dash""cta""badge"]',
          'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:[grid-template-areas:"text_flags""cta_badge""dash_dash"]',
        )}
      >
        <div className="self-center [grid-area:text]">
            <h1 id="hero-title">
              <motion.span {...fadeUp(t.logo)} className="mb-5 flex items-center gap-3 text-eyebrow font-semibold uppercase text-sand-300">
                <LogoMark className="size-8" />
                {SITE.name}
                <span aria-hidden="true" className="h-px w-10 bg-sand-300/50" />
                <span className="text-white/60">Djibouti</span>
              </motion.span>
              <SplitText
                text={SITE.slogan}
                trigger="mount"
                delay={t.title}
                stagger={0.09}
                className="block font-display text-[clamp(3.3rem,1.2rem+6.2vw,6.7rem)] leading-[0.92] tracking-[-0.02em] text-white"
              />
            </h1>

            <motion.div {...fadeUp(t.details)} className="mt-6 max-w-xl">
              <p className="text-lead text-white/85">{SITE.signatureFr}</p>
              <p className="mt-1 font-display text-2xl italic text-sand-300">{SITE.signature}</p>
            </motion.div>
        </div>

        <motion.div {...fadeUp(t.details + 0.2)} className="flex flex-wrap gap-3 self-start [grid-area:cta]">
          <Button size="lg" onClick={startBooking} iconLeft={<Plane className="size-5" aria-hidden="true" />} className="max-lg:hidden">
            Réserver un vol
          </Button>
          <ButtonLink
            to="/destinations"
            size="lg"
            variant="glass"
            iconLeft={<Compass className="size-5" aria-hidden="true" />}
            iconRight={<ArrowRight className="size-4" aria-hidden="true" />}
            className="max-sm:w-full"
          >
            Découvrir nos destinations
          </ButtonLink>
        </motion.div>

        <FlagsGreeting timing={{ flags: t.flags, greet: t.greet }} className="self-center [grid-area:flags]" />

        {/* 15+ ans d'expérience du responsable (profil fictif de démonstration, voir config/site.ts) */}
        <motion.div {...fadeUp(t.details + 0.1)} className="flex justify-center self-start [grid-area:badge]">
          <div className="glass flex max-w-md items-center gap-4 rounded-2xl p-3 pr-5">
            <span className="grid shrink-0 place-items-center rounded-xl bg-sand-400 px-3.5 py-2.5 text-center leading-none text-night-950">
              <span className="font-display text-4xl">15+</span>
              <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.18em]">ans</span>
            </span>
            <span className="min-w-0 text-sm leading-snug">
              <span className="block font-semibold text-white">15+ ans d'expérience dans le secteur aérien</span>
              <span className="mt-1 block text-white/70">
                {SITE.representative.name} · <span className="whitespace-nowrap">{SITE.representative.experience}</span>
              </span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: t.dashboard, ease: EASE_PREMIUM }}
          className="relative [grid-area:dash] lg:mt-2"
        >
          <FlightDashboard />
        </motion.div>
      </div>
    </section>
  )
}
