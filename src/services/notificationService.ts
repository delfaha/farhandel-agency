import type { AppNotification } from '@/types/user'
import { randomId } from '@/utils/random'
import { apiRequest, USE_MOCKS } from './api/client'
import { db } from './mock/db'
import { mockDelay } from './mock/delay'
import { DEMO_USER, demoNotifications } from './mock/demoData'

/** Notifications du client (à relier plus tard à un système email / SMS / WhatsApp / push). */
export interface NotificationService {
  list(userId: string): Promise<AppNotification[]>
  markRead(userId: string, ids: string[]): Promise<void>
  markAllRead(userId: string): Promise<void>
}

/** Ajoute une notification locale (utilisé par les autres services de démonstration). */
export function pushMockNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): void {
  const items = db.notifications.all()
  items.push({ ...notification, id: randomId('ntf'), createdAt: new Date().toISOString(), read: false })
  db.notifications.save(items.slice(-200))
}

function allFor(userId: string): AppNotification[] {
  const readIds = new Set(db.readNotifications.get(userId))
  const base = userId === DEMO_USER.id ? demoNotifications() : []
  return [...base, ...db.notifications.all().filter((item) => item.userId === userId)]
    .map((item) => ({ ...item, read: item.read || readIds.has(item.id) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const mockNotificationService: NotificationService = {
  async list(userId) {
    await mockDelay(200, 450)
    return allFor(userId)
  },
  async markRead(userId, ids) {
    const current = new Set(db.readNotifications.get(userId))
    ids.forEach((id) => current.add(id))
    db.readNotifications.save(userId, [...current])
  },
  async markAllRead(userId) {
    db.readNotifications.save(userId, allFor(userId).map((item) => item.id))
  },
}

const httpNotificationService: NotificationService = {
  list: () => apiRequest<AppNotification[]>('/me/notifications'),
  markRead: (_userId, ids) => apiRequest<void>('/me/notifications/read', { method: 'POST', body: { ids } }),
  markAllRead: () => apiRequest<void>('/me/notifications/read-all', { method: 'POST' }),
}

export const notificationService: NotificationService = USE_MOCKS ? mockNotificationService : httpNotificationService
