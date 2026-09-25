import { motion } from 'framer-motion'
import { ChevronRight, Info, type LucideIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type ReactNode, type SVGProps } from 'react'
import { Link } from 'react-router'
import { DEMO_NOTICE } from '@/config/site'
import type { Airline } from '@/types/flight'
import { cn } from '@/utils/cn'

/** Mention « données de démonstration » (prix, horaires, statuts fictifs). */
export function DemoNotice({ children = DEMO_NOTICE, className, tone = 'light' }: { children?: ReactNode; className?: string; tone?: 'light' | 'dark' }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm leading-relaxed',
        tone === 'light' ? 'border border-amber-200/80 bg-amber-50/80 text-amber-950' : 'border border-white/15 bg-white/5 text-white/75',
        className,
      )}
    >
      <Info aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', tone === 'light' ? 'text-amber-700' : 'text-sand-300')} />
      <span>{children}</span>
    </p>
  )
}

/** Hauteur animée selon le contenu (onglets du dashboard, résultats qui apparaissent). */
export function AutoHeight({ children, className }: { children: ReactNode; className?: string }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  const [animating, setAnimating] = useState(false)

  useLayoutEffect(() => {
    const element = innerRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ height }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onAnimationStart={() => setAnimating(true)}
      onAnimationComplete={() => setAnimating(false)}
      style={{ overflow: animating ? 'hidden' : 'visible' }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-sm', tone === 'dark' ? 'text-white/65' : 'text-night-500')}>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5 opacity-60" />}
            {item.to ? (
              <Link to={item.to} className={cn('link-underline', tone === 'dark' ? 'hover:text-white' : 'hover:text-night-900')}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={tone === 'dark' ? 'text-white' : 'text-night-900'}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center rounded-3xl border border-dashed border-night-200 bg-white/60 px-6 py-12 text-center', className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-sand-100 text-sand-700">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-night-900">{title}</h3>
      {description && <div className="mt-2 max-w-md text-sm leading-relaxed text-night-500">{description}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Pastille compagnie : code IATA sur fond de marque FarhanDel (aucun logo de compagnie reproduit). */
export function AirlineChip({ airline, size = 'md' }: { airline: Airline; size?: 'sm' | 'md' }) {
  return (
    <span
      title={airline.name}
      className={cn(
        'grid shrink-0 place-items-center rounded-xl bg-night-900 font-semibold tracking-wide text-sand-300',
        size === 'md' ? 'size-10 text-xs' : 'size-8 text-[0.65rem]',
      )}
    >
      {airline.code}
    </span>
  )
}

/** Pictogramme WhatsApp simplifié (lien de contact). */
export function WhatsAppIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...rest}>
      <path d="M3.6 20.4l1.25-4.1A8.4 8.4 0 1 1 8 19.3z" />
      <path
        fill="currentColor"
        stroke="none"
        d="M9.05 8.55c.2-.45.45-.55.75-.55h.45c.2 0 .4.1.5.35l.7 1.6c.1.25.05.5-.1.7l-.5.55c-.1.15-.1.3-.05.45.6 1.05 1.45 1.9 2.5 2.5.15.1.35.05.45-.05l.55-.5c.2-.15.45-.2.7-.1l1.6.7c.25.1.35.3.35.5v.45c0 .3-.1.55-.55.75-.6.3-1.6.4-2.95-.2-1.5-.7-3.1-2.3-3.8-3.8-.6-1.35-.5-2.35-.2-2.95z"
      />
    </svg>
  )
}
