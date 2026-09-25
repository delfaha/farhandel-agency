import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigation, useNavigationType, useOutlet } from 'react-router'
import { Toaster } from '@/components/ui/Toaster'
import { EASE_PREMIUM } from '@/utils/motion'
import { AuthProvider } from '@/context/AuthProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { Footer } from './Footer'
import { Header } from './Header'
import { QuickContact } from './QuickContact'

/** Première partie du chemin : les sous-pages de l'espace client partagent la même transition. */
const sectionKey = (pathname: string) => pathname.split('/')[1] || 'accueil'

function scrollToHashOrTop(hash: string, top = 0) {
  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) {
      target.scrollIntoView({ block: 'start' })
      return
    }
  }
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

/** Transitions de pages (fondu + légère montée) et gestion du défilement / du focus. */
function AnimatedOutlet() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const outlet = useOutlet()
  const positions = useRef(new Map<string, number>())
  const previous = useRef(location)
  const mainRef = useRef<HTMLElement>(null)

  // Chargement direct d'une URL avec ancre (ex. /services#hotels) : défilement une fois le contenu affiché.
  useEffect(() => {
    if (!previous.current.hash) return
    const timer = window.setTimeout(() => scrollToHashOrTop(previous.current.hash), 450)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const key = location.key
    const save = () => positions.current.set(key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.key])

  const afterNavigation = () => {
    const saved = navigationType === 'POP' ? positions.current.get(location.key) : undefined
    scrollToHashOrTop(location.hash, saved ?? 0)
    mainRef.current?.focus({ preventScroll: true })
  }

  // Navigation interne à une même section (espace client, ancre, paramètres) : pas de transition de sortie.
  useLayoutEffect(() => {
    const before = previous.current
    previous.current = location
    if (before.key === location.key || sectionKey(before.pathname) !== sectionKey(location.pathname)) return
    if (before.pathname !== location.pathname || (location.hash && location.hash !== before.hash)) {
      const saved = navigationType === 'POP' ? positions.current.get(location.key) : undefined
      scrollToHashOrTop(location.hash, saved ?? 0)
    }
  }, [location, navigationType])

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={afterNavigation}>
      <motion.main
        key={sectionKey(location.pathname)}
        ref={mainRef}
        id="contenu"
        tabIndex={-1}
        className="flex-1 outline-none"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_PREMIUM } }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } }}
      >
        {outlet}
      </motion.main>
    </AnimatePresence>
  )
}

/** Fine barre de progression pendant le chargement d'une page (code découpé par route). */
function RouteProgress() {
  const navigation = useNavigation()
  const loading = navigation.state !== 'idle'
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[130] h-[3px] origin-left bg-gradient-to-r from-sand-300 via-sand-400 to-sand-600"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 2.5, ease: [0.1, 0.8, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  )
}

export default function RootLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <ToastProvider>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-night-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
          >
            Aller au contenu principal
          </a>
          <RouteProgress />
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            <Header />
            <AnimatedOutlet />
            <Footer />
          </div>
          <QuickContact />
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </MotionConfig>
  )
}
