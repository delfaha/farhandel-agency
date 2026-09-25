import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Luggage, Plane, Radar } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { AutoHeight } from '@/components/ui/Misc'
import { cn } from '@/utils/cn'
import { CheckIn } from './CheckIn'
import { FlightSearch } from './FlightSearch'
import { FlightStatus } from './FlightStatus'
import { ManageBooking } from './ManageBooking'

export type DashboardTab = 'book' | 'manage' | 'checkin' | 'status'

const TABS: { id: DashboardTab; label: string; short: string; icon: typeof Plane }[] = [
  { id: 'book', label: 'Réserver un vol', short: 'Réserver', icon: Plane },
  { id: 'manage', label: 'Gérer ma réservation', short: 'Gérer', icon: Luggage },
  { id: 'checkin', label: 'Check-in', short: 'Check-in', icon: BadgeCheck },
  { id: 'status', label: 'Statut du vol', short: 'Statut', icon: Radar },
]

const panelVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -32 }),
}

/**
 * Dashboard de réservation (Hero) : quatre onglets accessibles au clavier
 * (flèches, Début, Fin), indicateur animé et transition de hauteur fluide.
 */
export function FlightDashboard({ initialTab = 'book', className }: { initialTab?: DashboardTab; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const [tab, setTab] = useState<DashboardTab>(initialTab)
  const [direction, setDirection] = useState(1)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (next: DashboardTab, focus = false) => {
    const from = TABS.findIndex((item) => item.id === tab)
    const to = TABS.findIndex((item) => item.id === next)
    setDirection(to >= from ? 1 : -1)
    setTab(next)
    if (focus) tabRefs.current[to]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1
    const target =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    if (target === null) return
    event.preventDefault()
    select(TABS[target].id, true)
  }

  return (
    <div id="reservation" className={cn('scroll-mt-28 rounded-[1.75rem] bg-white text-night-900 shadow-float ring-1 ring-night-900/5', className)}>
      <div role="tablist" aria-label="Services de réservation" className="on-dark grid grid-cols-4 gap-1 rounded-t-[1.75rem] bg-night-900 p-1.5 sm:p-2">
        {TABS.map((item, index) => {
          const selected = tab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={selected ? `${uid}-panel-${item.id}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1.5 py-2.5 text-[0.72rem] font-semibold transition-colors duration-300 sm:flex-row sm:gap-2.5 sm:px-4 sm:text-sm',
                selected ? 'text-night-900' : 'text-white/70 hover:text-white',
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-tab-pill`}
                  className="absolute inset-0 rounded-[1.25rem] bg-white shadow-soft"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
                />
              )}
              <Icon aria-hidden="true" className={cn('relative size-[18px] shrink-0', selected ? 'text-sand-600' : '')} />
              <span className="relative leading-tight">
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      <AutoHeight>
        <div className="relative">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={tab}
              role="tabpanel"
              id={`${uid}-panel-${tab}`}
              aria-labelledby={`${uid}-tab-${tab}`}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="p-4 sm:p-7"
            >
              {tab === 'book' && <FlightSearch />}
              {tab === 'manage' && <ManageBooking />}
              {tab === 'checkin' && <CheckIn />}
              {tab === 'status' && <FlightStatus />}
            </motion.div>
          </AnimatePresence>
        </div>
      </AutoHeight>
    </div>
  )
}
