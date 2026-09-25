import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CalendarClock, LayoutDashboard, LogOut, Luggage, Sparkles, Ticket, UserRound } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import type { AccountData } from '@/components/account/accountData'
import { upcomingBookings } from '@/components/account/accountData'
import { LoadingState } from '@/components/ui/LoadingState'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useAuth, useToast } from '@/hooks/useStore'
import { bookingService } from '@/services/bookingService'
import { notificationService } from '@/services/notificationService'
import type { Booking } from '@/types/booking'
import type { AppNotification, User } from '@/types/user'
import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'

const NAV = [
  { to: '/espace-client', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/espace-client/reservations', label: 'Mes réservations', icon: Ticket },
  { to: '/espace-client/historique', label: 'Historique', icon: CalendarClock },
  { to: '/espace-client/profil', label: 'Informations personnelles', icon: UserRound },
  { to: '/espace-client/bagages', label: 'Bagages', icon: Luggage },
  { to: '/espace-client/services', label: 'Services', icon: Sparkles },
  { to: '/espace-client/notifications', label: 'Notifications', icon: Bell },
]

function Dashboard({ user }: { user: User }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const toast = useToast()
  const data = useAsync(() => Promise.all([bookingService.listForUser(user.id), notificationService.list(user.id)]), user.id)
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set())
  const bookings = useMemo<Booking[]>(() => data.data?.[0] ?? [], [data.data])
  const notifications = useMemo<AppNotification[]>(
    () => (data.data?.[1] ?? []).map((item) => (readIds.has(item.id) ? { ...item, read: true } : item)),
    [data.data, readIds],
  )
  const bookingsLoading = data.loading && !data.data
  const refresh = data.reload

  const markRead = useCallback(
    async (ids: string[]) => {
      await notificationService.markRead(user.id, ids)
      setReadIds((current) => new Set([...current, ...ids]))
    },
    [user.id],
  )
  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead(user.id)
    setReadIds(new Set((data.data?.[1] ?? []).map((item) => item.id)))
  }, [user.id, data.data])

  const unread = notifications.filter((item) => !item.read).length
  const context = useMemo<AccountData>(
    () => ({ user, bookings, bookingsLoading, notifications, unread, refresh, markRead, markAllRead }),
    [user, bookings, bookingsLoading, notifications, unread, refresh, markRead, markAllRead],
  )
  const counts: Record<string, number> = { '/espace-client/reservations': upcomingBookings(bookings).length, '/espace-client/notifications': unread }

  const signOut = async () => {
    await logout()
    toast.info('Vous êtes déconnecté', 'À bientôt sur FarhanDel Agency.')
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-ivory pb-24 pt-24 lg:pt-28">
      <div className="container-page grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="hidden rounded-3xl border border-line bg-white p-5 lg:block">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-night-900 font-semibold text-sand-300">{initials(user.firstName, user.lastName)}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-night-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-night-500">{user.email}</p>
              </div>
            </div>
          </div>
          <nav aria-label="Espace client" className="-mx-4 mt-0 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:mt-4 lg:overflow-visible lg:px-0">
            <ul className="flex gap-2 lg:flex-col lg:gap-1 lg:rounded-3xl lg:border lg:border-line lg:bg-white lg:p-2">
              {NAV.map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-2xl',
                        isActive ? 'text-white' : 'bg-white text-night-700 hover:bg-mist hover:text-night-900 max-lg:border max-lg:border-line lg:bg-transparent',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="account-nav" className="absolute inset-0 rounded-full bg-night-900 lg:rounded-2xl" transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }} />}
                        <item.icon aria-hidden="true" className={cn('relative size-4', isActive ? 'text-sand-300' : 'text-night-400')} />
                        <span className="relative">{item.label}</span>
                        {counts[item.to] > 0 && (
                          <span className={cn('relative ml-auto grid min-w-5 place-items-center rounded-full px-1.5 text-[0.68rem] font-bold', isActive ? 'bg-sand-400 text-night-950' : 'bg-night-900 text-white')}>
                            {counts[item.to]}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
              <li className="hidden lg:block">
                <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                  <LogOut aria-hidden="true" className="size-4" />
                  Se déconnecter
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <Outlet context={context} />
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={signOut} className="mt-10 flex items-center gap-2 text-sm font-semibold text-rose-700 lg:hidden">
            <LogOut aria-hidden="true" className="size-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

/** Espace client protégé : redirige vers la connexion si nécessaire. */
export default function ClientDashboard() {
  useSeo({ title: 'Espace client', description: 'Votre espace client FarhanDel Agency.', noindex: true })
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingState label="Chargement de votre espace…" className="min-h-dvh pt-32" />
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return <Dashboard user={user} />
}
