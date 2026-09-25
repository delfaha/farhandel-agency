import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LayoutDashboard, Mail, Phone } from 'lucide-react'
import { NavLink } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/Misc'
import { contactLinks, SITE } from '@/config/site'
import { BOOKING_NAV, MAIN_NAV } from '@/data/navigation'
import { useAuth } from '@/hooks/useStore'
import { cn } from '@/utils/cn'

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
}
const item = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

/** Menu mobile plein écran, sous l'en-tête (le bouton burger animé reste accessible). */
export function MobileMenu({ open, onClose, offset }: { open: boolean; onClose: () => void; offset: number }) {
  const { user, status } = useAuth()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-mobile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-white lg:hidden"
          style={{ top: offset }}
        >
          <nav aria-label="Menu principal (mobile)" className="container-page pb-10 pt-4">
            <motion.ul variants={list} initial="hidden" animate="visible" className="divide-y divide-line">
              {MAIN_NAV.map((link, index) => (
                <motion.li key={link.to} variants={item}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    onClick={onClose}
                    data-autofocus={index === 0 ? true : undefined}
                    className={({ isActive }) =>
                      cn('flex items-center justify-between py-4 font-display text-[2rem] leading-none', isActive ? 'text-sand-700' : 'text-night-900')
                    }
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden="true" className="size-5 text-night-300" />
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-night-500">Voyager</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {BOOKING_NAV.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.to}>
                      <NavLink to={link.to} onClick={onClose} className="flex h-full flex-col gap-2 rounded-2xl bg-mist p-4 text-sm font-semibold text-night-900">
                        {Icon && <Icon aria-hidden="true" className="size-5 text-sand-700" />}
                        {link.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {status === 'authenticated' && user ? (
                  <ButtonLink to="/espace-client" onClick={onClose} variant="dark" size="lg" fullWidth iconLeft={<LayoutDashboard className="size-5" aria-hidden="true" />}>
                    Mon espace ({user.firstName})
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink to="/connexion" onClick={onClose} variant="outline" size="lg" fullWidth>
                      Se connecter
                    </ButtonLink>
                    <ButtonLink to="/inscription" onClick={onClose} variant="dark" size="lg" fullWidth>
                      Créer un compte
                    </ButtonLink>
                  </>
                )}
              </div>

              <div className="mt-8 rounded-3xl bg-night-900 p-5 text-white">
                <p className="font-display text-2xl">{SITE.name}</p>
                <p className="text-sm text-white/60">
                  {SITE.representative.name} · {SITE.address.street}, {SITE.address.city}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold">
                  <a href={contactLinks.tel} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 py-3">
                    <Phone aria-hidden="true" className="size-5 text-sand-300" />
                    Appeler
                  </a>
                  <a href={contactLinks.whatsapp()} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 py-3">
                    <WhatsAppIcon className="size-5 text-sand-300" />
                    WhatsApp
                  </a>
                  <a href={contactLinks.email()} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 py-3">
                    <Mail aria-hidden="true" className="size-5 text-sand-300" />
                    Email
                  </a>
                </div>
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
