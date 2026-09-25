import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

export interface ToastContextValue {
  toasts: ToastItem[]
  show(toast: Omit<ToastItem, 'id'>): void
  success(title: string, description?: string): void
  error(title: string, description?: string): void
  info(title: string, description?: string): void
  dismiss(id: number): void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
