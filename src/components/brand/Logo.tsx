import { useId } from 'react'
import { Link } from 'react-router'
import { cn } from '@/utils/cn'

/**
 * Monogramme FarhanDel Agency : médaillon sable, « F » aux terminaisons biseautées
 * comme des ailes en montée, et une trajectoire de vol qui s'élance vers le monde.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="8" y1="3" x2="40" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3e2b8" />
          <stop offset="0.55" stopColor="#d6ac66" />
          <stop offset="1" stopColor="#a8793a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${gradientId})`} />
      <circle cx="24" cy="24" r="19.6" fill="none" stroke="#0b1a2e" strokeOpacity="0.16" />
      <path d="M16.4 35V16.9c0-1.95 1.35-3.4 3.3-3.4h14.4l-2.65 4.7h-10.1v4.5h9.3l-2.55 4.5h-6.75V35z" fill="#0b1a2e" />
      <path d="M29.6 32.2c3.9-1 6.9-3.5 8.5-6.9" fill="none" stroke="#0b1a2e" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M39.3 22.9l.55 3.55-3.2-1.2z" fill="#0b1a2e" />
    </svg>
  )
}

interface LogoProps {
  tone?: 'light' | 'dark'
  compact?: boolean
  withTagline?: boolean
  className?: string
}

/** Logo complet (monogramme + nom), lien vers l'accueil. */
export function Logo({ tone = 'dark', compact = false, withTagline = false, className }: LogoProps) {
  const light = tone === 'light'
  return (
    <Link to="/" aria-label="FarhanDel Agency — accueil" className={cn('group flex items-center gap-3', className)}>
      <LogoMark
        className={cn(
          'shrink-0 transition-[width,height,transform] duration-500 ease-premium group-hover:rotate-[-8deg]',
          compact ? 'size-9' : 'size-10 sm:size-11',
        )}
      />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[1.7rem] leading-[0.9] tracking-tight', light ? 'text-white' : 'text-night-900')}>FarhanDel</span>
        <span className={cn('mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.42em]', light ? 'text-sand-300' : 'text-sand-700')}>
          Agency
        </span>
        {withTagline && (
          <span className={cn('mt-2 text-[0.7rem] font-medium italic tracking-wide', light ? 'text-white/60' : 'text-night-500')}>
            Travel to the World
          </span>
        )}
      </span>
    </Link>
  )
}
