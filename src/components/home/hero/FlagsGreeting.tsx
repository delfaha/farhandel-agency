import { useAnimate, useReducedMotion } from 'framer-motion'
import { Handshake } from 'lucide-react'
import { useEffect } from 'react'
import { FLAGS, type FlagId } from '@/components/brand/flagData'
import { WavingFlag } from '@/components/brand/Flags'
import { SITE } from '@/config/site'
import { cn } from '@/utils/cn'

interface Timing {
  flags: number
  greet: number
}

function FlagOnPole({ flag, className, floatDelay, hidden }: { flag: FlagId; className?: string; floatDelay: string; hidden: boolean }) {
  return (
    <div
      className={cn('flag-unit relative w-[116px] sm:w-[170px] lg:w-[196px]', className)}
      style={{ transformOrigin: '2px 100%', opacity: hidden ? 0 : undefined }}
    >
      <div className="animate-float" style={{ animationDelay: floatDelay }}>
        {/* Mât et pommeau doré */}
        <span className="absolute bottom-0 left-0 top-1 w-[4px] rounded-full bg-gradient-to-b from-sand-100 via-sand-400 to-sand-800 shadow-[1px_0_2px_rgb(0_0_0/0.35)]" />
        <span className="absolute -left-[3.5px] -top-1.5 size-[11px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff8e6,#d6ac66_55%,#7f5d28)] shadow" />
        <div className="pl-[4px] pt-1.5">
          <WavingFlag flag={flag} className="rounded-r-[3px]" />
        </div>
        <div className="h-9 sm:h-16 lg:h-14" />
      </div>
      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-white/80">{FLAGS[flag].name}</p>
    </div>
  )
}

/**
 * Djibouti × Turquie : les deux drapeaux entrent simultanément (gauche / droite),
 * se rapprochent, s'inclinent l'un vers l'autre comme deux personnes qui se saluent,
 * puis restent côte à côte en flottant légèrement.
 */
export function FlagsGreeting({ timing, className }: { timing: Timing; className?: string }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const offscreen = Math.min(window.innerWidth * 0.7, 900)
    const ease = [0.22, 1, 0.36, 1] as const
    const controls = animate([
      ['.flag-dj', { x: [-offscreen, 14, 0], opacity: [0, 1, 1] }, { duration: 1.35, at: timing.flags, ease }],
      ['.flag-tr', { x: [offscreen, -14, 0], opacity: [0, 1, 1] }, { duration: 1.35, at: timing.flags, ease }],
      ['.flag-dj', { x: [0, 16, 16, 0], rotate: [0, 8, -1.5, 0] }, { duration: 1.25, at: timing.greet, ease: 'easeInOut' }],
      ['.flag-tr', { x: [0, -16, -16, 0], rotate: [0, -8, 1.5, 0] }, { duration: 1.25, at: timing.greet, ease: 'easeInOut' }],
      ['.greet-badge', { scale: [0.3, 1.18, 1], opacity: [0, 1, 1] }, { duration: 0.75, at: timing.greet + 0.3, ease }],
      ['.greet-caption', { opacity: [0, 1], y: [10, 0] }, { duration: 0.8, at: timing.greet + 0.55, ease }],
    ])
    return () => controls.stop()
  }, [animate, reduce, timing.flags, timing.greet])

  const hidden = reduce ? undefined : { opacity: 0 }

  return (
    <div
      ref={scope}
      role="group"
      aria-label="Djibouti et la Turquie se saluent : symbole du lien entre les deux pays"
      className={cn('relative mx-auto flex w-full max-w-[520px] flex-col items-center', className)}
    >
      <div className="relative flex items-end justify-center gap-7 sm:gap-12">
        <FlagOnPole flag="djibouti" className="flag-dj" floatDelay="0s" hidden={!reduce} />
        <div className="greet-badge absolute left-1/2 top-[34%] z-10 -translate-x-1/2" style={hidden}>
          <span className="relative grid size-12 place-items-center rounded-full bg-night-900/85 text-sand-300 shadow-float ring-1 ring-sand-300/40 backdrop-blur sm:size-14">
            <span className="absolute inset-0 rounded-full bg-sand-300/30 animate-pulse-ring" aria-hidden="true" />
            <Handshake className="relative size-5 sm:size-6" aria-hidden="true" />
          </span>
        </div>
        <FlagOnPole flag="turkey" className="flag-tr" floatDelay="-3.4s" hidden={!reduce} />
      </div>
      <div className="greet-caption mt-4 text-center sm:mt-6" style={hidden}>
        <p className="font-display text-2xl text-white sm:text-3xl">
          Djibouti <span className="text-sand-300">×</span> Turquie
        </p>
        <p className="mt-1 text-sm italic text-white/70">{SITE.connecting}</p>
      </div>
    </div>
  )
}
