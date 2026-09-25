import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { ToastContext } from '@/context/ToastContext'

function required<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} doit être utilisé à l'intérieur des providers de l'application.`)
  return value
}

export const useAuth = () => required(useContext(AuthContext), 'useAuth')
export const useToast = () => required(useContext(ToastContext), 'useToast')
