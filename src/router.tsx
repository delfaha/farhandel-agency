import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import RootLayout from '@/components/layout/RootLayout'
import { LoadingState } from '@/components/ui/LoadingState'
import NotFoundPage, { ErrorPage } from '@/pages/StatusPages'

/** Chargement différé : chaque page devient un fichier JavaScript séparé (export par défaut ou nommé). */
function page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M = 'default') {
  return async () => ({ Component: (await load())[name] as ComponentType })
}

const account = () => import('@/pages/account/AccountPages')
const auth = () => import('@/pages/AuthPages')
const legal = page(() => import('@/pages/LegalPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: () => <LoadingState label="Chargement…" tone="dark" className="min-h-dvh bg-night-950" />,
    ErrorBoundary: ErrorPage,
    children: [
      {
        // Les erreurs d'une page s'affichent dans la mise en page (en-tête et pied conservés).
        ErrorBoundary: ErrorPage,
        children: [
          { index: true, lazy: page(() => import('@/pages/HomePage')) },
          { path: 'reserver', lazy: page(() => import('@/pages/BookPage')) },
          { path: 'destinations', lazy: page(() => import('@/pages/DestinationsPage')) },
          { path: 'offres', lazy: page(() => import('@/pages/OffersPage')) },
          { path: 'services', lazy: page(() => import('@/pages/ServicesPage')) },
          { path: 'a-propos', lazy: page(() => import('@/pages/AboutPage')) },
          { path: 'contact', lazy: page(() => import('@/pages/ContactPage')) },
          { path: 'statut-vol', lazy: page(() => import('@/pages/FlightStatusPage')) },
          { path: 'ma-reservation', lazy: page(() => import('@/pages/ManageBookingPage')) },
          { path: 'check-in', lazy: page(() => import('@/pages/CheckInPage')) },
          { path: 'connexion', lazy: page(auth, 'LoginPage') },
          { path: 'inscription', lazy: page(auth, 'RegisterPage') },
          {
            path: 'espace-client',
            lazy: page(() => import('@/pages/account/ClientDashboard')),
            children: [
              { index: true, lazy: page(account, 'AccountOverviewPage') },
              { path: 'reservations', lazy: page(account, 'ReservationsPage') },
              { path: 'historique', lazy: page(account, 'HistoryPage') },
              { path: 'profil', lazy: page(account, 'ProfilePage') },
              { path: 'bagages', lazy: page(account, 'BaggagePage') },
              { path: 'services', lazy: page(account, 'AccountServicesPage') },
              { path: 'notifications', lazy: page(account, 'NotificationsPage') },
            ],
          },
          { path: 'conditions-generales', lazy: legal },
          { path: 'politique-de-confidentialite', lazy: legal },
          { path: 'mentions-legales', lazy: legal },
          { path: 'design-system', lazy: page(() => import('@/pages/DesignSystemPage')) },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
], {
  // Même préfixe que le `base` de Vite : le site fonctionne aussi dans un sous-dossier (GitHub Pages).
  basename: import.meta.env.BASE_URL,
})
