import { AnimatePresence, motion } from 'framer-motion'
import { Headset, Mail, Phone, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { WhatsAppIcon } from '@/components/ui/Misc'
import { contactLinks } from '@/config/site'
import { useEscape, useOnClickOutside } from '@/hooks/useDom'

const ACTIONS = [
  { label: 'Appeler', href: contactLinks.tel, icon: Phone, external: false },
  { label: 'WhatsApp', href: contactLinks.whatsapp('Bonjour FarhanDel Agency, je souhaite des informations pour un voyage.'), icon: null, external: true },
  { label: 'Email', href: contactLinks.email('Demande d’information'), icon: Mail, external: false },
]

/** Contact rapide flottant : Appeler, WhatsApp, Email — accessible au pouce sur mobile. */
export function QuickContact() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const refs = useMemo(() => [wrapperRef], [])
  useOnClickOutside(refs, close, open)
  useEscape(open, close)

  return (
    <div ref={wrapperRef} className="no-print fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.ul
            id="contact-rapide"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }, visible: { transition: { staggerChildren: 0.06 } } }}
            className="flex flex-col items-end gap-2.5"
          >
            {ACTIONS.map((action) => (
              <motion.li
                key={action.label}
                variants={{ hidden: { opacity: 0, y: 12, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <a
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={close}
                  className="flex items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-semibold text-night-900 shadow-card ring-1 ring-night-900/5 transition hover:bg-sand-50"
                >
                  {action.label}
                  <span className="grid size-9 place-items-center rounded-full bg-night-900 text-sand-300">
                    {action.icon ? <action.icon aria-hidden="true" className="size-4" /> : <WhatsAppIcon className="size-4" />}
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="contact-rapide"
        aria-label={open ? 'Fermer le contact rapide' : 'Contact rapide : appeler, WhatsApp, email'}
        className="relative grid size-14 place-items-center rounded-full bg-sand-400 text-night-950 shadow-gold transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {!open && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-sand-400/60 animate-pulse-ring" />}
        <motion.span key={open ? 'close' : 'open'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="relative">
          {open ? <X aria-hidden="true" className="size-6" /> : <Headset aria-hidden="true" className="size-6" />}
        </motion.span>
      </button>
    </div>
  )
}
