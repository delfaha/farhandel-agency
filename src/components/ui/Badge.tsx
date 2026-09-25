import type { ReactNode } from 'react'
import { BOOKING_STATUS_META, FLIGHT_STATUS_META, type Tone } from '@/data/labels'
import type { BookingStatus } from '@/types/booking'
import type { FlightStatusCode } from '@/types/flight'
import { cn } from '@/utils/cn'

const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-900 ring-amber-600/25',
  azure: 'bg-azure-50 text-azure-700 ring-azure-500/25',
  violet: 'bg-violet-50 text-violet-800 ring-violet-600/20',
  night: 'bg-night-900 text-white ring-night-900',
  rose: 'bg-rose-50 text-rose-800 ring-rose-600/20',
  sand: 'bg-sand-100 text-sand-800 ring-sand-600/25',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
}

const DOTS: Record<Tone, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  azure: 'bg-azure-500',
  violet: 'bg-violet-500',
  night: 'bg-sand-300',
  rose: 'bg-rose-500',
  sand: 'bg-sand-500',
  slate: 'bg-slate-400',
}

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  icon?: ReactNode
  dot?: boolean
  /** Point animé (statut « en direct »). */
  live?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ tone = 'slate', children, icon, dot, live, size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        TONES[tone],
        className,
      )}
    >
      {(dot || live) && (
        <span className="relative flex size-2">
          {live && <span className={cn('absolute inset-0 rounded-full animate-pulse-ring', DOTS[tone])} />}
          <span className={cn('relative size-2 rounded-full', DOTS[tone])} />
        </span>
      )}
      {icon}
      {children}
    </span>
  )
}

export function FlightStatusBadge({ status, size }: { status: FlightStatusCode; size?: 'sm' | 'md' }) {
  const meta = FLIGHT_STATUS_META[status]
  return (
    <Badge tone={meta.tone} size={size} dot live={status === 'boarding' || status === 'in-flight'}>
      {meta.label}
    </Badge>
  )
}

export function BookingStatusBadge({ status, size }: { status: BookingStatus; size?: 'sm' | 'md' }) {
  const meta = BOOKING_STATUS_META[status]
  return (
    <Badge tone={meta.tone} size={size} dot>
      {meta.label}
    </Badge>
  )
}
