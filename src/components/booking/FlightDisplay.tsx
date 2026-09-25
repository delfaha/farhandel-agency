import { Clock, Plane } from 'lucide-react'
import { AirlineChip } from '@/components/ui/Misc'
import { airport, getAirport } from '@/data/airports'
import type { FlightLeg } from '@/types/flight'
import { legEndpoints } from '@/utils/booking'
import { cn } from '@/utils/cn'
import { diffDays, diffMinutes } from '@/utils/date'
import { formatDate, formatDuration, formatTime } from '@/utils/format'

function layoverMinutes(leg: FlightLeg, index: number): number {
  const arriving = leg.segments[index]
  const leaving = leg.segments[index + 1]
  return leaving ? diffMinutes(arriving.arrival, leaving.departure) : 0
}

/** Résumé horizontal d'un trajet : heures, durée, escales. */
export function LegSummary({ leg, className, tone = 'light' }: { leg: FlightLeg; className?: string; tone?: 'light' | 'dark' }) {
  const { first, last } = legEndpoints(leg)
  const dayShift = diffDays(first.departure, last.arrival)
  const hubs = leg.segments.slice(0, -1).map((segment) => segment.to)
  const dark = tone === 'dark'

  return (
    <div className={cn('flex items-center gap-3 sm:gap-5', className)}>
      <div className="w-16 shrink-0">
        <p className={cn('text-xl font-semibold tabular-nums sm:text-2xl', dark ? 'text-white' : 'text-night-900')}>{formatTime(first.departure)}</p>
        <p className={cn('text-sm font-semibold', dark ? 'text-white/60' : 'text-night-500')} title={getAirport(first.from)?.name}>
          {first.from}
        </p>
      </div>
      <div className="min-w-0 flex-1 text-center">
        <p className={cn('text-xs', dark ? 'text-white/60' : 'text-night-500')}>{formatDuration(leg.durationMin)}</p>
        <div className="relative my-2 flex items-center">
          <span className={cn('h-px flex-1', dark ? 'bg-white/25' : 'bg-night-200')} />
          {hubs.map((hub) => (
            <span key={hub} className="mx-1 size-2 rounded-full border-2 border-amber-500 bg-white" />
          ))}
          {hubs.length > 0 && <span className={cn('h-px flex-1', dark ? 'bg-white/25' : 'bg-night-200')} />}
          <Plane aria-hidden="true" className={cn('ml-1 size-4 shrink-0 rotate-45', dark ? 'text-sand-300' : 'text-sand-600')} />
        </div>
        <p className={cn('text-xs font-semibold', leg.stops === 0 ? (dark ? 'text-emerald-300' : 'text-emerald-700') : dark ? 'text-amber-300' : 'text-amber-700')}>
          {leg.stops === 0 ? 'Vol direct' : `${leg.stops} escale${leg.stops > 1 ? 's' : ''} · ${hubs.join(', ')}`}
        </p>
      </div>
      <div className="w-16 shrink-0 text-right">
        <p className={cn('text-xl font-semibold tabular-nums sm:text-2xl', dark ? 'text-white' : 'text-night-900')}>
          {formatTime(last.arrival)}
          {dayShift > 0 && (
            <sup className="ml-0.5 text-xs font-bold text-rose-600" title={`Arrivée ${dayShift} jour${dayShift > 1 ? 's' : ''} plus tard`}>
              +{dayShift}
            </sup>
          )}
        </p>
        <p className={cn('text-sm font-semibold', dark ? 'text-white/60' : 'text-night-500')} title={getAirport(last.to)?.name}>
          {last.to}
        </p>
      </div>
    </div>
  )
}

/** Détail vertical d'un trajet : chaque vol, compagnie, appareil, escales. */
export function LegDetails({ leg }: { leg: FlightLeg }) {
  return (
    <ol className="space-y-1">
      {leg.segments.map((segment, index) => {
        const from = airport(segment.from)
        const to = airport(segment.to)
        const layover = layoverMinutes(leg, index)
        return (
          <li key={segment.id}>
            <div className="grid grid-cols-[auto_1fr] gap-x-4">
              <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full border-2 border-night-900 bg-white" />
                <span className="my-1 w-px flex-1 bg-night-200" />
                <span className="size-2.5 rounded-full bg-night-900" />
              </div>
              <div className="space-y-3 pb-2">
                <p className="text-sm">
                  <span className="font-semibold tabular-nums text-night-900">{formatTime(segment.departure)}</span>
                  <span className="text-night-500"> · {formatDate(segment.departure, 'dayMonth')} · </span>
                  <span className="font-semibold text-night-900">
                    {from.city} ({from.code})
                  </span>
                  <span className="block text-xs text-night-500">{from.name}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-mist px-3 py-2.5">
                  <AirlineChip airline={segment.airline} size="sm" />
                  <div className="min-w-0 text-xs leading-relaxed text-night-600">
                    <p className="font-semibold text-night-900">
                      {segment.airline.name} · {segment.flightNumber}
                    </p>
                    <p>
                      {segment.aircraft} · {formatDuration(segment.durationMin)} de vol
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="font-semibold tabular-nums text-night-900">{formatTime(segment.arrival)}</span>
                  <span className="text-night-500"> · {formatDate(segment.arrival, 'dayMonth')} · </span>
                  <span className="font-semibold text-night-900">
                    {to.city} ({to.code})
                  </span>
                  <span className="block text-xs text-night-500">{to.name}</span>
                </p>
              </div>
            </div>
            {layover > 0 && (
              <p className="my-2 ml-7 flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                <Clock aria-hidden="true" className="size-3.5" />
                Escale à {to.city} · {formatDuration(layover)}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
