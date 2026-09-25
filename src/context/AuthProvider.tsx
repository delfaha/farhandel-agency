import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User } from '@/types/user'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true
    authService
      .currentUser()
      .then((current) => {
        if (!active) return
        setUser(current)
        setStatus(current ? 'authenticated' : 'anonymous')
      })
      .catch(() => active && setStatus('anonymous'))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (input) => {
    const logged = await authService.login(input)
    setUser(logged)
    setStatus('authenticated')
    return logged
  }, [])

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const created = await authService.register(input)
    setUser(created)
    setStatus('authenticated')
    return created
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      if (!user) throw new Error('Aucun utilisateur connecté.')
      const updated = await authService.updateProfile(user.id, patch)
      setUser(updated)
      return updated
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, updateProfile }),
    [user, status, login, register, logout, updateProfile],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
