import { createContext } from 'react'
import type { LoginInput, ProfileUpdate, RegisterInput, User } from '@/types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login(input: LoginInput): Promise<User>
  register(input: RegisterInput): Promise<User>
  logout(): Promise<void>
  updateProfile(patch: ProfileUpdate): Promise<User>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
