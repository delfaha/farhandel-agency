import type { LoginInput, ProfileUpdate, RegisterInput, Session, User } from '@/types/user'
import { randomId } from '@/utils/random'
import { apiRequest, setAuthTokenProvider, USE_MOCKS } from './api/client'
import { db, hashPassword } from './mock/db'
import { mockDelay } from './mock/delay'
import { DEMO_ACCOUNT, DEMO_USER } from './mock/demoData'
import { pushMockNotification } from './notificationService'

export type AuthErrorCode = 'invalid-credentials' | 'email-taken' | 'not-found'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Authentification. La version de démonstration stocke les comptes dans le navigateur
 * (empreinte salée du mot de passe) : elle devra être remplacée par une authentification
 * serveur (sessions HTTP-only ou JWT, vérification d'email, réinitialisation sécurisée).
 */
export interface AuthService {
  login(input: LoginInput): Promise<User>
  register(input: RegisterInput): Promise<User>
  logout(): Promise<void>
  currentUser(): Promise<User | null>
  updateProfile(userId: string, patch: ProfileUpdate): Promise<User>
  requestPasswordReset(email: string): Promise<void>
}

const SESSION_DAYS_REMEMBER = 30
const SESSION_HOURS = 12

setAuthTokenProvider(() => db.session.get()?.token ?? null)

async function ensureDemoAccount(): Promise<void> {
  const users = db.users.all()
  if (users.some((stored) => stored.user.id === DEMO_USER.id)) return
  const salt = randomId('salt')
  users.push({ user: DEMO_USER, salt, hash: await hashPassword(DEMO_ACCOUNT.password, salt) })
  db.users.save(users)
}

function openSession(userId: string, remember: boolean): Session {
  const duration = remember ? SESSION_DAYS_REMEMBER * 86_400_000 : SESSION_HOURS * 3_600_000
  const session: Session = { userId, token: randomId('tok'), expiresAt: new Date(Date.now() + duration).toISOString(), remember }
  db.session.save(session)
  return session
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

const mockAuthService: AuthService = {
  async login({ email, password, remember }) {
    await mockDelay(700, 1100)
    await ensureDemoAccount()
    const stored = db.users.all().find((item) => sameEmail(item.user.email, email))
    if (!stored || (await hashPassword(password, stored.salt)) !== stored.hash) {
      throw new AuthError('invalid-credentials', 'Email ou mot de passe incorrect.')
    }
    openSession(stored.user.id, remember)
    return stored.user
  },

  async register({ firstName, lastName, email, phone, password }) {
    await mockDelay(900, 1300)
    await ensureDemoAccount()
    const users = db.users.all()
    if (users.some((item) => sameEmail(item.user.email, email))) {
      throw new AuthError('email-taken', 'Un compte existe déjà avec cette adresse email.')
    }
    const user: User = {
      id: randomId('usr'),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
      preferences: { seat: 'none', meal: 'standard', channels: { email: true, sms: false, whatsapp: true } },
    }
    const salt = randomId('salt')
    users.push({ user, salt, hash: await hashPassword(password, salt) })
    db.users.save(users)
    openSession(user.id, true)
    pushMockNotification({
      userId: user.id,
      type: 'account',
      title: 'Bienvenue chez FarhanDel Agency',
      message: 'Votre espace client est prêt : suivez vos demandes de réservation, vos bagages et vos services.',
    })
    return user
  },

  async logout() {
    db.session.clear()
  },

  async currentUser() {
    const session = db.session.get()
    if (!session) return null
    if (Date.parse(session.expiresAt) < Date.now()) {
      db.session.clear()
      return null
    }
    await ensureDemoAccount()
    return db.users.all().find((item) => item.user.id === session.userId)?.user ?? null
  },

  async updateProfile(userId, patch) {
    await mockDelay(500, 800)
    const users = db.users.all()
    const index = users.findIndex((item) => item.user.id === userId)
    if (index === -1) throw new AuthError('not-found', 'Compte introuvable.')
    const updated: User = { ...users[index].user, ...patch, id: userId }
    users[index] = { ...users[index], user: updated }
    db.users.save(users)
    return updated
  },

  async requestPasswordReset() {
    // Démonstration : aucun email n'est envoyé. Réponse volontairement identique que le compte existe ou non.
    await mockDelay(700, 1000)
  },
}

const httpAuthService: AuthService = {
  login: (input) => apiRequest<User>('/auth/login', { method: 'POST', body: input }),
  register: (input) => apiRequest<User>('/auth/register', { method: 'POST', body: input }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  currentUser: () => apiRequest<User | null>('/auth/me'),
  updateProfile: (_userId, patch) => apiRequest<User>('/me', { method: 'PATCH', body: patch }),
  requestPasswordReset: (email) => apiRequest<void>('/auth/password-reset', { method: 'POST', body: { email } }),
}

export const authService: AuthService = USE_MOCKS ? mockAuthService : httpAuthService
