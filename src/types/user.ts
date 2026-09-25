export type SeatPreference = 'window' | 'aisle' | 'none'
export type MealPreference = 'standard' | 'halal' | 'vegetarian' | 'child' | 'none'

export interface UserPreferences {
  seat: SeatPreference
  meal: MealPreference
  channels: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
  birthDate?: string
  nationality?: string
  city?: string
  preferences: UserPreferences
}

export interface Session {
  userId: string
  token: string
  expiresAt: string
  remember: boolean
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
  remember: boolean
}

export type ProfileUpdate = Partial<Omit<User, 'id' | 'email' | 'createdAt'>>

export type NotificationType = 'booking' | 'flight' | 'offer' | 'account' | 'service'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string
}
