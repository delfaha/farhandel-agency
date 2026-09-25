import { animate, motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { EASE_PREMIUM } from '@/utils/motion'

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'

const OFFSETS: Record<RevealVariant, Record<string, number>> = {
  up: { y: 32 },
  down: { y: -24 },
  left: { x: -40 },
  right: { x: 40 },
  zoom: { scale: 0.94 },
  fade: {},
}

function revealVariants(variant: RevealVariant, duration: number, delay = 0): Variants {
  return {
    hidden: { opacity: 0, ...OFFSETS[variant] },
    visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration, delay, ease: EASE_PREMIUM } },
  }
}

const TAGS = { div: motion.div, section: motion.section, li: motion.li, article: motion.article, ul: motion.ul, ol: motion.ol, p: motion.p, span: motion.span }
type Tag = keyof typeof TAGS

interface RevealProps {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  duration?: number
  className?: string
  as?: Tag
  amount?: number
  id?: string
}

/** Apparition au défilement (une seule fois). Respecte « réduire les animations » via MotionConfig. */
export function Reveal({ children, variant = 'up', delay = 0, duration = 0.85, className, as = 'div', amount = 0.2, id }: RevealProps) {
  const Component = TAGS[as]
  return (
    <Component
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={revealVariants(variant, duration, delay)}
    >
      {children}
    </Component>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  as?: Tag
  stagger?: number
  delay?: number
  amount?: number
}

/** Conteneur qui révèle ses enfants <StaggerItem> les uns après les autres. */
export function Stagger({ children, className, as = 'div', stagger = 0.09, delay = 0, amount = 0.15 }: StaggerProps) {
  const Component = TAGS[as]
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className, variant = 'up', as = 'div', duration = 0.8 }: { children: ReactNode; className?: string; variant?: RevealVariant; as?: Tag; duration?: number }) {
  const Component = TAGS[as]
  return (
    <Component className={className} variants={revealVariants(variant, duration)}>
      {children}
    </Component>
  )
}

interface SplitTextProps {
  text: string
  className?: string
  wordClassName?: string
  delay?: number
  stagger?: number
  /** « mount » : dès l'affichage ; « inView » : à l'entrée dans l'écran. */
  trigger?: 'mount' | 'inView'
}

/** Révélation mot à mot, masquée (texte complet lu une seule fois par les lecteurs d'écran). */
export function SplitText({ text, className, wordClassName, delay = 0, stagger = 0.07, trigger = 'inView' }: SplitTextProps) {
  const words = text.split(' ')
  const animation = trigger === 'mount' ? { animate: 'visible' } : { whileInView: 'visible', viewport: { once: true, amount: 0.6 } }
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...animation}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className={cn('inline-block', wordClassName)}
              variants={{ hidden: { y: '115%' }, visible: { y: '0%', transition: { duration: 0.95, ease: EASE_PREMIUM } } }}
            >
              {word}
            </motion.span>
            {index < words.length - 1 && ' '}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

interface CounterProps {
  to: number
  from?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

/** Compteur animé à l'entrée dans l'écran. */
export function Counter({ to, from = 0, duration = 2, prefix = '', suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!inView || !element) return
    if (reduce) {
      element.textContent = `${prefix}${to}${suffix}`
      return
    }
    const controls = animate(from, to, {
      duration,
      ease: EASE_PREMIUM,
      onUpdate: (value) => {
        element.textContent = `${prefix}${Math.round(value)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduce, from, to, duration, prefix, suffix])

  return (
    <span className={className}>
      <span className="sr-only">{`${prefix}${to}${suffix}`}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {`${prefix}${from}${suffix}`}
      </span>
    </span>
  )
}
