import { motion, useScroll, useTransform } from 'framer-motion'
import type { CSSProperties } from 'react'
import { IMAGES } from '@/data/images'
import { Airliner } from '@/components/brand/Airliner'
import { SmartImage } from '@/components/ui/SmartImage'

const CLOUDS = [
  { top: '12%', w: 560, o: 0.24, d: 150, delay: -40 },
  { top: '30%', w: 380, o: 0.2, d: 115, delay: -85 },
  { top: '52%', w: 680, o: 0.16, d: 185, delay: -25 },
  { top: '6%', w: 320, o: 0.18, d: 100, delay: -60 },
  { top: '70%', w: 820, o: 0.12, d: 220, delay: -140 },
]

/** Arrière-plan du Hero : ciel photographique, voiles de nuages en parallaxe et dégradés de lisibilité. */
export function HeroSky() {
  const { scrollY } = useScroll()
  const photoY = useTransform(scrollY, [0, 900], [0, 170])
  const cloudsY = useTransform(scrollY, [0, 900], [0, 70])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y: photoY }} className="absolute inset-x-0 -top-10 bottom-[-12%]">
        <SmartImage image={IMAGES.heroSky} sizes="100vw" priority className="ken-burns size-full bg-night-950" />
      </motion.div>

      <motion.div style={{ y: cloudsY }} className="absolute inset-0">
        {CLOUDS.map((cloud) => (
          <span
            key={cloud.top + cloud.w}
            className="cloud"
            style={{ top: cloud.top, '--w': `${cloud.w}px`, '--o': cloud.o, '--d': `${cloud.d}s`, '--delay': `${cloud.delay}s` } as CSSProperties}
          />
        ))}
      </motion.div>

      {/* Dégradés : lisibilité du texte et de l'en-tête, transition vers le bas de page */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_15_29/0.78)_0%,rgb(6_15_29/0.25)_28%,rgb(6_15_29/0.18)_52%,rgb(6_15_29/0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_0%_45%,rgb(6_15_29/0.72)_0%,rgb(6_15_29/0.2)_55%,transparent_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night-950/90" />
    </div>
  )
}

/** Avion aux couleurs rouge et blanc traversant le ciel (couche intermédiaire, jamais au-dessus du contenu). */
export function HeroPlane({ delay }: { delay: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-plane" style={{ '--plane-delay': `${delay}s` } as CSSProperties}>
        <div className="hero-plane__x">
          <div className="hero-plane__y">
            <div className="hero-plane__s">
              <div className="relative">
                <span className="absolute right-[43%] top-[71%] h-[2px] w-[230%] bg-gradient-to-l from-white/55 via-white/15 to-transparent" />
                <span className="absolute right-[43%] top-[75%] h-px w-[170%] bg-gradient-to-l from-white/35 via-white/10 to-transparent" />
                <Airliner className="relative w-full drop-shadow-[0_14px_20px_rgba(2,8,18,0.45)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
