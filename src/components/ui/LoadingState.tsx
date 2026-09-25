import { Plane } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-xl', className)} />
}

interface LoadingStateProps {
  label?: string
  className?: string
  tone?: 'light' | 'dark'
}

/** État de chargement : un avion en orbite autour d'un point, annoncé aux lecteurs d'écran. */
export function LoadingState({ label = 'Chargement…', className, tone = 'light' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-14 text-sm font-medium',
        tone === 'light' ? 'text-night-500' : 'text-white/70',
        className,
      )}
    >
      <span className="relative grid size-14 place-items-center">
        <span className={cn('absolute inset-0 rounded-full border', tone === 'light' ? 'border-night-100' : 'border-white/15')} />
        <span className="absolute inset-0 animate-[spin_1.6s_linear_infinite]">
          <Plane
            aria-hidden="true"
            className={cn('absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-90', tone === 'light' ? 'text-sand-600' : 'text-sand-300')}
            strokeWidth={2.2}
          />
        </span>
        <span className={cn('size-2 rounded-full', tone === 'light' ? 'bg-night-900' : 'bg-white')} />
      </span>
      <span>{label}</span>
    </div>
  )
}
