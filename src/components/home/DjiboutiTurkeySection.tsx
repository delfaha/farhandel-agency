import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowRight, Earth } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FlagBadge } from '@/components/brand/Flags'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Motion'
import { SITE } from '@/config/site'
import { cn } from '@/utils/cn'

const VIEW = { width: 400, height: 760 }
const ROUTE = 'M110 92 C 110 236, 290 214, 290 380 S 130 526, 130 668'

const NODES = [
  { id: 'djibouti', x: 110, y: 92, at: 0, title: 'Djibouti', subtitle: 'Notre base', text: "Au carrefour de la mer Rouge et de l'Afrique de l'Est." },
  { id: 'turkey', x: 290, y: 380, at: 0.5, title: 'Turquie', subtitle: 'Hub d’Istanbul', text: 'Un pont entre deux continents et des correspondances vers tous les horizons.' },
  { id: 'world', x: 130, y: 668, at: 0.98, title: 'World', subtitle: 'Le monde entier', text: 'Europe, Asie, Amériques : chaque itinéraire pensé sur mesure.' },
] as const

/** Route aérienne animée Djibouti → Turquie → World : le tracé et l'avion suivent le défilement. */
export function DjiboutiTurkeySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const routeRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  const reduce = useReducedMotion()
  const [reached, setReached] = useState(reduce ? NODES.length : 0)

  const { scrollYProgress } = useScroll({ target: routeRef, offset: ['start 78%', 'end 62%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 })

  const place = (value: number) => {
    const path = pathRef.current
    const plane = planeRef.current
    if (!path || !plane) return
    const total = path.getTotalLength()
    const clamped = Math.min(1, Math.max(0, value))
    const point = path.getPointAtLength(total * clamped)
    const ahead = path.getPointAtLength(Math.min(total, total * clamped + 1))
    const behind = path.getPointAtLength(Math.max(0, total * clamped - 1))
    const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
    plane.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`)
    const count = NODES.filter((node) => clamped >= node.at).length
    setReached((current) => (current === count ? current : count))
  }

  useMotionValueEvent(progress, 'change', (value) => {
    if (!reduce) place(value)
  })

  useEffect(() => {
    place(reduce ? 1 : progress.get())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  return (
    <section ref={sectionRef} aria-labelledby="route-title" className="on-dark relative overflow-hidden bg-night-950 py-24 text-white sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgb(214_172_102/0.14),transparent_70%),radial-gradient(50%_40%_at_10%_90%,rgb(47_114_228/0.14),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(70%_60%_at_60%_50%,black,transparent)]" />

      <div className="container-page relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="flex flex-wrap items-center gap-3 text-eyebrow font-semibold uppercase text-sand-300">
              <FlagBadge flag="djibouti" className="size-6" /> Djibouti
              <ArrowRight aria-hidden="true" className="size-3.5" />
              <FlagBadge flag="turkey" className="size-6" /> Turquie
              <ArrowRight aria-hidden="true" className="size-3.5" />
              <Earth aria-hidden="true" className="size-5" /> World
            </p>
            <h2 id="route-title" className="mt-6 font-display text-h2">
              From Djibouti <em className="text-sand-300">to the World.</em>
            </h2>
            <p className="mt-6 max-w-lg text-lead text-white/70">
              De notre base à Djibouti jusqu'au hub d'Istanbul, puis vers les grandes capitales du monde : chaque itinéraire est construit avec
              l'exigence d'un professionnel de l'aérien.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/reserver" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
                Planifier mon itinéraire
              </ButtonLink>
              <ButtonLink to="/destinations" variant="outline-light">
                Voir les destinations
              </ButtonLink>
            </div>
            <p className="mt-10 font-display text-2xl italic text-white/50">{SITE.connecting}</p>
          </Reveal>
        </div>

        <div ref={routeRef} className="relative mx-auto w-full max-w-[460px]" style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}>
          <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <linearGradient id="route-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#efdcb7" />
                <stop offset="0.5" stopColor="#d6ac66" />
                <stop offset="1" stopColor="#a8793a" />
              </linearGradient>
            </defs>
            {[150, 300, 450, 600].map((y) => (
              <line key={y} x1="0" x2={VIEW.width} y1={y} y2={y} stroke="white" strokeOpacity="0.06" strokeDasharray="2 8" />
            ))}
            <path d={ROUTE} fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
            <motion.path
              ref={pathRef}
              d={ROUTE}
              fill="none"
              stroke="url(#route-gold)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength: reduce ? 1 : progress }}
            />
            <g ref={planeRef}>
              <circle r="17" fill="#0b1a2e" stroke="#d6ac66" strokeOpacity="0.6" />
              {/* Silhouette d'avion orientée vers la droite (sens de la trajectoire) */}
              <path d="M9 0 L-4 -2.2 L-8 -9 L-10.5 -9 L-8 -2.2 L-12 -1.6 L-13.5 -4.5 L-15 -4.5 L-14 0 L-15 4.5 L-13.5 4.5 L-12 1.6 L-8 2.2 L-10.5 9 L-8 9 L-4 2.2 Z" fill="#efdcb7" transform="translate(3 0)" />
            </g>
          </svg>

          {NODES.map((node, index) => {
            const active = reached > index
            const right = node.x > VIEW.width / 2
            return (
              <div
                key={node.id}
                className={cn('absolute flex items-start gap-4', right ? 'flex-row-reverse text-right' : 'text-left')}
                style={{
                  top: `${(node.y / VIEW.height) * 100}%`,
                  ...(right ? { right: `${((VIEW.width - node.x) / VIEW.width) * 100}%` } : { left: `${(node.x / VIEW.width) * 100}%` }),
                  translate: right ? '28px -28px' : '-28px -28px',
                }}
              >
                <span
                  className={cn(
                    'relative grid size-14 shrink-0 place-items-center rounded-full border-2 bg-night-900 transition-all duration-700 ease-premium',
                    active ? 'scale-110 border-sand-300 shadow-gold' : 'scale-95 border-white/20',
                  )}
                >
                  {active && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-sand-300/30 animate-pulse-ring" />}
                  {node.id === 'world' ? (
                    <Earth aria-hidden="true" className={cn('size-7 transition-colors', active ? 'text-sand-300' : 'text-white/60')} />
                  ) : (
                    <FlagBadge flag={node.id} className="size-10" />
                  )}
                </span>
                <div
                  className={cn(
                    'w-[min(13.5rem,calc(100vw-10rem))] pt-1 transition-all duration-700 ease-premium sm:w-[16rem]',
                    active ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-45',
                  )}
                >
                  <h3 className="font-display text-3xl leading-none">{node.title}</h3>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{node.subtitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{node.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
