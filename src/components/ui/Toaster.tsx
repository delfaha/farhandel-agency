import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ToastItem } from '@/context/ToastContext'
import { useToast } from '@/hooks/useStore'
import { cn } from '@/utils/cn'

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }
const ACCENTS = { success: 'text-emerald-400', error: 'text-rose-400', info: 'text-sand-300' }
const DURATION = 5200

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(DURATION)
  const startedAt = useRef(0)
  const Icon = ICONS[toast.variant]

  useEffect(() => {
    if (paused) return
    startedAt.current = Date.now()
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current -= Date.now() - startedAt.current
    }
  }, [paused, onDismiss, toast.id])

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className="on-dark pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-night-900/95 p-4 pr-3 text-white shadow-float ring-1 ring-white/10 backdrop-blur"
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', ACCENTS[toast.variant])} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{toast.title}</p>
        {toast.description && <p className="mt-1 text-sm leading-relaxed text-white/70">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="grid size-8 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </motion.li>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <ol
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[120] flex flex-col gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </ol>
  )
}
