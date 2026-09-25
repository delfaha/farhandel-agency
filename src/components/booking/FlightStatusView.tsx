import { motion } from 'framer-motion'
import { BadgeCheck, DoorOpen, Plane, PlaneLanding, PlaneTakeoff, Ticket, TriangleAlert } from 'lucide-react'
import { FlightStatusBadge } from '@/components/ui/Badge'
import { AirlineChip } from '@/components/ui/Misc'
import { airport } from '@/data/airports'
import { TIMELINE_STAGES } from '@/data/labels'
import type { FlightStatusInfo, TimelineStage } from '@/types/flight'
import { cn } from '@/utils/cn'
import { formatDate, formatDuration, formatTime } from '@/utils/format'
import { diffMinutes } from '@/utils/date'

const STAGE_ICONS: Record<TimelineStage, typeof Plane> = {
  booking: Ticket,
  checkin: BadgeCheck,
  boarding: DoorOpen,
  takeoff: PlaneTakeoff,
  cruise: Plane,
  arrival: PlaneLanding,
}

/** Avancement de la frise (0 → 1). En vol, la position reflète la progression réelle du vol. */
function timelineProgress(status: FlightStatusInfo): number {
  if (status.status === 'cancelled') return 0
  const index = TIMELINE_STAGES.findIndex((stage) => stage.id === status.stage)
  const steps = TIMELINE_STAGES.length - 1
  if (status.stage === 'cruise') return Math.min(0.97, (3 + 2 * status.progress) / steps)
  return index / steps
}

function TimeBlock({ label, scheduled, estimated, align = 'left', city, code }: { label: string; scheduled: string; estimated: string; align?: 'left' | 'right'; city: string; code: string }) {
  const changed = scheduled !== estimated
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-night-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-night-900 sm:text-4xl">{code}</p>
      <p className="truncate text-sm text-night-600">{city}</p>
      <dl className={cn('mt-3 space-y-1 text-sm', align === 'right' && 'ml-auto')}>
        <div className={cn('flex gap-2', align === 'right' && 'justify-end')}>
          <dt className="text-night-500">Prévu</dt>
          <dd className={cn('font-semibold tabular-nums', changed ? 'text-night-400 line-through' : 'text-night-900')}>{formatTime(scheduled)}</dd>
        </div>
        <div className={cn('flex gap-2', align === 'right' && 'justify-end')}>
          <dt className="text-night-500">Estimé</dt>
          <dd className={cn('font-semibold tabular-nums', changed ? 'text-amber-700' : 'text-night-900')}>{formatTime(estimated)}</dd>
        </div>
      </dl>
    </div>
  )
}

/** Carte de statut : départ, destination, heures prévues et estimées, statut, avancement. */
export function FlightStatusCard({ status, compact = false }: { status: FlightStatusInfo; compact?: boolean }) {
  const from = airport(status.from)
  const to = airport(status.to)
  const cancelled = status.status === 'cancelled'
  const duration = diffMinutes(status.scheduledDeparture, status.scheduledArrival) - Math.round((to.utcOffset - from.utcOffset) * 60)

  return (
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AirlineChip airline={status.airline} />
          <div>
            <p className="font-semibold text-night-900">
              {status.flightNumber} <span className="font-normal text-night-500">· {status.airline.name}</span>
            </p>
            <p className="text-sm text-night-500 first-letter:uppercase">{formatDate(status.date, 'long')}</p>
          </div>
        </div>
        <FlightStatusBadge status={status.status} size="md" />
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-6">
        <TimeBlock label="Départ" code={from.code} city={from.city} scheduled={status.scheduledDeparture} estimated={status.estimatedDeparture} />
        <div className="flex flex-col items-center pt-9 text-center">
          <Plane aria-hidden="true" className={cn('size-5 rotate-45', cancelled ? 'text-rose-400' : 'text-sand-600')} />
          <p className="mt-2 whitespace-nowrap text-xs text-night-500">{formatDuration(duration)}</p>
        </div>
        <TimeBlock label="Arrivée" code={to.code} city={to.city} scheduled={status.scheduledArrival} estimated={status.estimatedArrival} align="right" />
      </div>

      {status.status === 'in-flight' && (
        <div className="mt-6">
          <div className="relative h-1.5 rounded-full bg-night-100">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sand-300 to-sand-500"
              initial={{ width: 0 }}
              animate={{ width: `${status.progress * 100}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ left: 0 }}
              animate={{ left: `${status.progress * 100}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="grid size-7 place-items-center rounded-full bg-night-900 text-sand-300 shadow-soft">
                <Plane aria-hidden="true" className="size-3.5 rotate-45" />
              </span>
            </motion.span>
          </div>
          <p className="mt-3 text-xs text-night-500">Vol effectué à {Math.round(status.progress * 100)} % (estimation simulée)</p>
        </div>
      )}

      {cancelled && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Vol annulé (simulation). En situation réelle, votre conseiller vous proposerait une solution de réacheminement.
        </p>
      )}

      {!compact && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-night-500">Terminal</dt>
            <dd className="mt-0.5 font-semibold text-night-900">{status.terminal}</dd>
          </div>
          <div>
            <dt className="text-xs text-night-500">Porte</dt>
            <dd className="mt-0.5 font-semibold text-night-900">{status.gate ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-night-500">Appareil</dt>
            <dd className="mt-0.5 font-semibold text-night-900">{status.aircraft}</dd>
          </div>
          <div>
            <dt className="text-xs text-night-500">Retard</dt>
            <dd className="mt-0.5 font-semibold text-night-900">{status.delayMinutes ? formatDuration(status.delayMinutes) : 'Aucun'}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}

/** Frise animée : Réservation → Enregistrement → Embarquement → Décollage → En vol → Arrivée. */
export function FlightStatusTimeline({ status }: { status: FlightStatusInfo }) {
  const progress = timelineProgress(status)
  const cancelled = status.status === 'cancelled'
  const reachedIndex = cancelled ? 0 : TIMELINE_STAGES.findIndex((stage) => stage.id === status.stage)

  return (
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-night-600">Progression du voyage</h3>

      {/* Horizontale (tablette et plus) */}
      <div className="relative mt-10 hidden md:block">
        <div className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-5 h-1 rounded-full bg-night-100">
          <motion.div
            className={cn('absolute inset-y-0 left-0 rounded-full', cancelled ? 'bg-rose-400' : 'bg-gradient-to-r from-sand-300 via-sand-400 to-sand-600')}
            initial={{ width: 0 }}
            whileInView={{ width: `${progress * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </div>
        <ol className="relative grid grid-cols-6">
          {TIMELINE_STAGES.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.id]
            const done = !cancelled && index <= reachedIndex
            const current = !cancelled && index === reachedIndex
            return (
              <motion.li
                key={stage.id}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + index * 0.18, duration: 0.6 }}
                aria-current={current ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'relative grid size-11 place-items-center rounded-full border-2 transition-colors',
                    done ? 'border-sand-500 bg-night-900 text-sand-300' : 'border-night-100 bg-white text-night-300',
                    current && 'ring-4 ring-sand-300/40',
                  )}
                >
                  {current && <span className="absolute inset-0 rounded-full bg-sand-300/40 animate-pulse-ring" aria-hidden="true" />}
                  <Icon aria-hidden="true" className="relative size-5" />
                </span>
                <span className={cn('mt-3 text-sm font-semibold', done ? 'text-night-900' : 'text-night-400')}>{stage.label}</span>
                <span className="sr-only">{done ? (current ? ' (étape en cours)' : ' (terminée)') : ' (à venir)'}</span>
              </motion.li>
            )
          })}
        </ol>
      </div>

      {/* Verticale (mobile) */}
      <ol className="relative mt-6 space-y-5 md:hidden">
        <span aria-hidden="true" className="absolute bottom-3 left-[21px] top-3 w-1 rounded-full bg-night-100" />
        <motion.span
          aria-hidden="true"
          className={cn('absolute left-[21px] top-3 w-1 origin-top rounded-full', cancelled ? 'bg-rose-400' : 'bg-gradient-to-b from-sand-300 to-sand-600')}
          style={{ height: `calc((100% - 1.5rem) * ${progress})` }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {TIMELINE_STAGES.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.id]
          const done = !cancelled && index <= reachedIndex
          const current = !cancelled && index === reachedIndex
          return (
            <li key={stage.id} className="relative flex items-center gap-4" aria-current={current ? 'step' : undefined}>
              <span
                className={cn(
                  'relative grid size-11 shrink-0 place-items-center rounded-full border-2',
                  done ? 'border-sand-500 bg-night-900 text-sand-300' : 'border-night-100 bg-white text-night-300',
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className={cn('font-semibold', done ? 'text-night-900' : 'text-night-400')}>
                {stage.label}
                {current && <span className="ml-2 text-xs font-medium text-sand-700">En cours</span>}
              </span>
            </li>
          )
        })}
      </ol>

      {cancelled && <p className="mt-6 text-sm font-medium text-rose-700">Le voyage s'est arrêté à l'étape de réservation : vol annulé (simulation).</p>}
    </div>
  )
}
