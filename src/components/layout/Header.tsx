import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { BOOKING_NAV, MAIN_NAV } from '@/data/navigation'
import { useEscape, useLockBodyScroll, useMouseHover, useOnClickOutside, useScrolled } from '@/hooks/useDom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useAuth, useToast } from '@/hooks/useStore'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'
import { MobileMenu } from './MobileMenu'

const BOOKING_PATHS = ['/reserver', '/ma-reservation', '/check-in', '/statut-vol']

/** Pages dont le haut est sombre (Hero, bandeau photo) : l'en-tête y est transparent. */
function hasDarkTop(pathname: string) {
  return !pathname.startsWith('/espace-client')
}

function navLinkClass(transparent: boolean, active: boolean) {
  return cn(
    'relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors duration-300',
    transparent ? (active ? 'text-white' : 'text-white/75 hover:text-white') : active ? 'text-night-900' : 'text-night-600 hover:text-night-900',
  )
}

function ActiveBar() {
  return (
    <motion.span
      layoutId="nav-active-bar"
      className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-sand-400"
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
    />
  )
}

function BookingMenu({ transparent, active }: { transparent: boolean; active: boolean }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number>(0)
  const close = useCallback(() => setOpen(false), [])
  const refs = useMemo(() => [wrapperRef], [])
  useOnClickOutside(refs, close, open)
  useEscape(open, () => {
    setOpen(false)
    buttonRef.current?.focus()
  })
  useMouseHover(
    wrapperRef,
    () => {
      window.clearTimeout(closeTimer.current)
      setOpen(true)
    },
    () => {
      closeTimer.current = window.setTimeout(() => setOpen(false), 160)
    },
  )

  return (
    <li ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-reserver"
        onClick={() => setOpen((current) => !current)}
        className={cn(navLinkClass(transparent, active), 'inline-flex items-center gap-1')}
      >
        Réserver
        <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform duration-300', open && 'rotate-180')} />
        {active && <ActiveBar />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-reserver"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-3"
          >
            <ul className="grid gap-1 rounded-3xl bg-white p-2.5 text-night-900 shadow-float ring-1 ring-night-900/5">
              {BOOKING_NAV.map((item) => {
                const Icon = item.icon ?? Ticket
                return (
                  <li key={item.to}>
                    <Link to={item.to} onClick={close} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-mist">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-night-900 text-sand-300 transition-transform duration-300 group-hover:scale-105">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{item.label}</span>
                        <span className="block text-sm text-night-500">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function UserMenu({ user, transparent }: { user: User; transparent: boolean }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const refs = useMemo(() => [wrapperRef], [])
  useOnClickOutside(refs, close, open)
  const { logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const buttonRef = useRef<HTMLButtonElement>(null)
  useEscape(open, () => {
    setOpen(false)
    buttonRef.current?.focus()
  })

  const signOut = async () => {
    close()
    await logout()
    toast.info('Vous êtes déconnecté', 'À bientôt sur FarhanDel Agency.')
    navigate('/')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu du compte de ${user.firstName}`}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold transition',
          transparent ? 'text-white hover:bg-white/10' : 'text-night-900 hover:bg-mist',
        )}
      >
        <span className="grid size-9 place-items-center rounded-full bg-sand-400 text-xs font-bold text-night-950">{initials(user.firstName, user.lastName)}</span>
        <span className="hidden sm:inline">{user.firstName}</span>
        <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-2xl bg-white p-2 text-night-900 shadow-float ring-1 ring-night-900/5"
          >
            <p className="px-3 pb-2 pt-1.5 text-xs text-night-500">
              Connecté en tant que
              <span className="block truncate text-sm font-semibold text-night-900">{user.email}</span>
            </p>
            {[
              { to: '/espace-client', label: 'Mon espace client', icon: LayoutDashboard },
              { to: '/espace-client/reservations', label: 'Mes réservations', icon: Ticket },
              { to: '/espace-client/notifications', label: 'Notifications', icon: Bell },
            ].map((item) => (
              <Link key={item.to} role="menuitem" to={item.to} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-mist">
                <item.icon aria-hidden="true" className="size-4 text-night-500" />
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            <button type="button" role="menuitem" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50">
              <LogOut aria-hidden="true" className="size-4" />
              Se déconnecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuToggle({ open, onClick, transparent }: { open: boolean; onClick: () => void; transparent: boolean }) {
  const line = cn('absolute left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full', transparent && !open ? 'bg-white' : 'bg-night-900')
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="menu-mobile"
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      className={cn('relative grid size-11 place-items-center rounded-full transition lg:hidden', transparent && !open ? 'hover:bg-white/10' : 'hover:bg-mist')}
    >
      <motion.span className={line} style={{ top: 15 }} animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
      <motion.span className={line} style={{ top: 21 }} animate={open ? { opacity: 0, scaleX: 0.3 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.25 }} />
      <motion.span className={line} style={{ top: 27 }} animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
    </button>
  )
}

export function Header() {
  const { pathname } = useLocation()
  const scrolled = useScrolled(24)
  // Le menu mobile est lié à la page où il a été ouvert : il se ferme de lui-même à la navigation.
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname
  const { user, status } = useAuth()
  const headerRef = useRef<HTMLElement>(null)
  const transparent = hasDarkTop(pathname) && !scrolled && !menuOpen
  const closeMenu = useCallback(() => setMenuPath(null), [])
  useFocusTrap(headerRef, menuOpen, closeMenu)
  useLockBodyScroll(menuOpen)

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500 ease-premium',
        transparent
          ? 'on-dark bg-transparent text-white'
          : menuOpen
            ? 'bg-white text-night-900'
            : 'bg-white/90 text-night-900 shadow-[0_1px_0_rgb(11_26_46/0.06),0_12px_32px_-20px_rgb(11_26_46/0.4)] backdrop-blur-xl',
      )}
    >
      <div className={cn('container-page flex items-center justify-between gap-6 transition-[height] duration-500 ease-premium', scrolled ? 'h-16' : 'h-20 lg:h-24')}>
        <Logo tone={transparent ? 'light' : 'dark'} compact={scrolled} />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {MAIN_NAV.map((item) =>
              item.to === '/reserver' ? (
                <BookingMenu key={item.to} transparent={transparent} active={BOOKING_PATHS.includes(pathname)} />
              ) : (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => navLinkClass(transparent, isActive)}>
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && <ActiveBar />}
                      </>
                    )}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {status === 'authenticated' && user ? (
            <UserMenu user={user} transparent={transparent} />
          ) : (
            <>
              <Link
                to="/connexion"
                className={cn(
                  'hidden rounded-full px-4 py-2 text-sm font-semibold transition sm:inline-flex',
                  transparent ? 'text-white hover:bg-white/10' : 'text-night-800 hover:bg-mist',
                )}
              >
                Se connecter
              </Link>
              <ButtonLink to="/inscription" size="sm" variant={transparent ? 'primary' : 'dark'} className="hidden sm:inline-flex">
                Créer un compte
              </ButtonLink>
            </>
          )}
          <MenuToggle open={menuOpen} onClick={() => setMenuPath((current) => (current === pathname ? null : pathname))} transparent={transparent} />
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={closeMenu} offset={scrolled ? 64 : 80} />
    </header>
  )
}
