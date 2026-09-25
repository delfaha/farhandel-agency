import { motion, useScroll, useTransform } from 'framer-motion'
import { Earth, Globe, MapPin, Plane } from 'lucide-react'
import { useRef } from 'react'
import { Counter, Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SmartImage } from '@/components/ui/SmartImage'
import { SITE } from '@/config/site'
import { IMAGES } from '@/data/images'

const STATS = [
  { icon: Globe, title: 'International', label: 'Expérience aérienne' },
  { icon: MapPin, title: 'Djibouti', label: 'Notre base' },
  { icon: Earth, title: 'Worldwide', label: 'Notre vision' },
]

/** « 15+ Years of Aviation Experience » : compteur animé, piliers et profil de la direction. */
export function ExperienceSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])
  const badgeY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section id="expertise" ref={ref} aria-labelledby="experience-title" className="relative scroll-mt-24 overflow-hidden bg-ivory py-24 sm:py-32">
      <div aria-hidden="true" className="absolute -right-40 top-10 size-[480px] rounded-full bg-sand-200/40 blur-3xl" />
      <div className="container-page relative grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal variant="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card">
            <motion.div style={{ y: imageY }} className="absolute inset-[-9%]">
              <SmartImage image={IMAGES.cabinWindow} sizes="(min-width: 1024px) 40vw, 90vw" maxWidth={1440} className="size-full" />
            </motion.div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 flex items-center gap-2 text-sm font-medium text-white/85">
              <Plane aria-hidden="true" className="size-4 rotate-45 text-sand-300" />
              Au cœur du secteur aérien international
            </p>
          </div>
          <motion.div style={{ y: badgeY }} className="on-dark absolute -bottom-10 -right-3 rounded-[1.75rem] bg-night-900 p-6 text-white shadow-float sm:-right-10 sm:p-8">
            <Counter to={SITE.representative.years} suffix="+" duration={2.2} className="font-display text-7xl leading-none text-sand-300 sm:text-8xl" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Années d'expérience</p>
          </motion.div>
        </Reveal>

        <div>
          <SectionHeading
            id="experience-title"
            eyebrow="15+ ans d'expérience dans l'aérien"
            title={
              <>
                15+ Years of <em>Aviation</em> Experience
              </>
            }
            description="Une expérience acquise au cœur du secteur aérien international, aujourd'hui mise au service des voyageurs de Djibouti et du monde."
          />

          <Stagger className="mt-10 grid gap-3 sm:grid-cols-3" stagger={0.12}>
            {STATS.map((stat) => (
              <StaggerItem key={stat.title} className="group rounded-2xl border border-line bg-white p-5 transition duration-500 hover:-translate-y-1 hover:shadow-card">
                <stat.icon aria-hidden="true" className="size-5 text-sand-600 transition-transform duration-500 group-hover:rotate-12" />
                <p className="mt-4 font-display text-[1.7rem] leading-none text-night-900">{stat.title}</p>
                <p className="mt-1.5 text-sm text-night-500">{stat.label}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-8 rounded-3xl border-l-4 border-sand-400 bg-white p-6 shadow-soft sm:p-7">
            <p className="font-display text-2xl leading-snug text-night-900 sm:text-[1.7rem]">
              Une expertise acquise au cœur des grandes compagnies aériennes internationales et mise au service de nos voyageurs.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-night-900 font-display text-lg text-sand-300">{SITE.representative.initials}</span>
              <div>
                <p className="font-semibold text-night-900">{SITE.representative.name}</p>
                <p className="text-sm text-night-500">
                  {SITE.representative.role} · {SITE.representative.experience} (expérience antérieure)
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
