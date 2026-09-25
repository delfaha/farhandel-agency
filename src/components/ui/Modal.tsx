import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useDom'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  footer?: ReactNode
  /** Visuel pleine largeur au-dessus du titre (photo d'offre…). */
  media?: ReactNode
}

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }

/** Fenêtre modale accessible : focus piégé, Échap, retour du focus, défilement bloqué. Feuille glissante sur mobile. */
export function Modal({ open, onClose, title, description, size = 'md', children, footer, media }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useFocusTrap(panelRef, open, onClose)
  useLockBodyScroll(open)

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-night-950/55 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-float outline-none sm:rounded-[1.75rem]',
              SIZES[size],
            )}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-y-auto overscroll-contain">
              {media}
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 sm:px-8 sm:pt-7">
                <div>
                  <h2 id={titleId} className="font-display text-3xl leading-tight text-night-900 sm:text-4xl">
                    {title}
                  </h2>
                  {description && (
                    <div id={descriptionId} className="mt-1.5 text-sm text-night-500">
                      {description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-night-500 transition hover:bg-mist hover:text-night-900"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="px-6 pb-6 pt-2 sm:px-8 sm:pb-8">{children}</div>
            </div>
            {footer && <div className="border-t border-line bg-ivory/70 px-6 py-4 sm:px-8">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
