import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastContextValue, type ToastItem } from './ToastContext'

const MAX_TOASTS = 3

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback<ToastContextValue['show']>((toast) => {
    const id = nextId.current++
    setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { ...toast, id }])
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      show,
      dismiss,
      success: (title, description) => show({ title, description, variant: 'success' }),
      error: (title, description) => show({ title, description, variant: 'error' }),
      info: (title, description) => show({ title, description, variant: 'info' }),
    }),
    [toasts, show, dismiss],
  )

  return <ToastContext value={value}>{children}</ToastContext>
}
