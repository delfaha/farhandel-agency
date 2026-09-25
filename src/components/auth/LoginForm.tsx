import { KeyRound, LogIn, Mail, Sparkles } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Checkbox, PasswordInput, TextInput } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useAuth, useToast } from '@/hooks/useStore'
import { AuthError, authService } from '@/services/authService'
import { DEMO_ACCOUNT } from '@/services/mock/demoData'
import type { User } from '@/types/user'
import { focusFirstError, isEmail, type FieldErrors } from '@/utils/validation'

function ForgotPasswordModal({ open, onClose, defaultEmail }: { open: boolean; onClose: () => void; defaultEmail: string }) {
  const uid = useId()
  const [email, setEmail] = useState(defaultEmail)
  const [error, setError] = useState<string>()
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isEmail(email)) {
      setError('Saisissez une adresse email valide.')
      return
    }
    setError(undefined)
    setSending(true)
    await authService.requestPasswordReset(email)
    setSending(false)
    setDone(true)
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose()
        setDone(false)
      }}
      title="Mot de passe oublié"
      description="Indiquez l'adresse email de votre compte."
      size="sm"
    >
      {done ? (
        <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation. (Prototype : l'envoi d'emails sera activé avec le
          backend.)
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <TextInput id={`${uid}-email`} type="email" label="Email" icon={Mail} autoComplete="email" value={email} error={error} onChange={(event) => setEmail(event.target.value)} data-autofocus />
          <Button type="submit" variant="dark" fullWidth loading={sending} iconLeft={<KeyRound className="size-4" aria-hidden="true" />}>
            Recevoir un lien
          </Button>
        </form>
      )}
    </Modal>
  )
}

/** Connexion : email, mot de passe, « Se souvenir de moi », « Mot de passe oublié ? ». */
export function LoginForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password' | 'form'>>({})
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const submit = async (credentials: { email: string; password: string }) => {
    const found: FieldErrors<'email' | 'password'> = {}
    if (!isEmail(credentials.email)) found.email = 'Saisissez une adresse email valide.'
    if (!credentials.password) found.password = 'Saisissez votre mot de passe.'
    flushSync(() => setErrors(found))
    if (Object.keys(found).length) {
      focusFirstError(formRef.current)
      return
    }
    setLoading(true)
    try {
      const user = await login({ ...credentials, remember })
      toast.success(`Bonjour, ${user.firstName} !`, 'Vous êtes connecté à votre espace client.')
      onSuccess(user)
    } catch (error) {
      setErrors({ form: error instanceof AuthError ? error.message : 'Connexion impossible pour le moment. Réessayez.' })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit({ email, password })
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`}>
        <h2 id={`${uid}-title`} className="font-display text-4xl text-night-900">
          Se connecter
        </h2>
        <p className="mt-2 text-sm text-night-500">Accédez à vos réservations, bagages et notifications.</p>

        {errors.form && (
          <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            {errors.form}
          </p>
        )}

        <div className="mt-7 space-y-5">
          <TextInput id={`${uid}-email`} type="email" label="Email" icon={Mail} autoComplete="email" value={email} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
          <PasswordInput id={`${uid}-password`} label="Mot de passe" autoComplete="current-password" value={password} error={errors.password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Checkbox label="Se souvenir de moi" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          <button type="button" onClick={() => setForgotOpen(true)} className="text-sm font-semibold text-azure-600 hover:underline">
            Mot de passe oublié ?
          </button>
        </div>

        <Button type="submit" size="lg" variant="dark" fullWidth loading={loading} iconLeft={!loading && <LogIn className="size-5" aria-hidden="true" />} className="mt-7">
          Se connecter
        </Button>

        <div className="mt-6 rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-night-900">
            <Sparkles aria-hidden="true" className="size-4 text-sand-600" />
            Compte de démonstration
          </p>
          <p className="mt-1 text-night-600">
            {DEMO_ACCOUNT.email} · <span className="font-mono">{DEMO_ACCOUNT.password}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_ACCOUNT.email)
              setPassword(DEMO_ACCOUNT.password)
              void submit({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password })
            }}
            className="mt-2 font-semibold text-azure-600 hover:underline"
          >
            Se connecter avec le compte démo
          </button>
        </div>

        <p className="mt-7 text-center text-sm text-night-600">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-night-900 underline decoration-sand-400 decoration-2 underline-offset-4 hover:text-sand-700">
            Créer un compte
          </Link>
        </p>
      </form>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} defaultEmail={email} />
    </>
  )
}
