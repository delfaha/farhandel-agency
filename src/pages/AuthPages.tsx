import { Navigate, useLocation, useNavigate } from 'react-router'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useSeo } from '@/hooks/useSeo'
import { useAuth } from '@/hooks/useStore'

function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state && 'from' in state && typeof state.from === 'string' && state.from.startsWith('/')) return state.from
  return '/espace-client'
}

export function LoginPage() {
  useSeo({ title: 'Connexion', description: 'Connectez-vous à votre espace client FarhanDel Agency.', noindex: true })
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const target = redirectTarget(location.state)

  if (status === 'authenticated') return <Navigate to={target} replace />

  return (
    <AuthLayout
      title={
        <>
          Heureux de vous <em className="text-sand-300">revoir</em>
        </>
      }
      subtitle="Retrouvez vos voyages, vos demandes en cours et les informations utiles avant le départ."
    >
      <LoginForm onSuccess={() => navigate(target, { replace: true })} />
    </AuthLayout>
  )
}

export function RegisterPage() {
  useSeo({ title: 'Créer un compte', description: 'Créez votre compte client FarhanDel Agency pour suivre vos réservations et services.', noindex: true })
  const { status } = useAuth()
  const navigate = useNavigate()

  if (status === 'authenticated') return <Navigate to="/espace-client" replace />

  return (
    <AuthLayout
      title={
        <>
          Votre voyage <em className="text-sand-300">commence ici</em>
        </>
      }
      subtitle="Créez votre compte en une minute et laissez-nous vous accompagner, de la réservation au retour."
    >
      <RegisterForm onSuccess={() => navigate('/espace-client', { replace: true })} />
    </AuthLayout>
  )
}
