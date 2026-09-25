import { Mail, Phone, UserPlus, UserRound } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Checkbox, PasswordInput, TextInput } from '@/components/ui/Field'
import { useAuth, useToast } from '@/hooks/useStore'
import { AuthError } from '@/services/authService'
import type { RegisterInput, User } from '@/types/user'
import { isEmail, isPhone, isStrongEnough, type FieldErrors } from '@/utils/validation'

type Field = keyof RegisterInput | 'confirm' | 'terms' | 'form'

/** Création de compte : identité, contact, mot de passe (robustesse), acceptation des conditions. */
export function RegisterForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const { register } = useAuth()
  const toast = useToast()
  const [values, setValues] = useState<RegisterInput>({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof RegisterInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const found: FieldErrors<Field> = {}
    if (values.firstName.trim().length < 2) found.firstName = 'Indiquez votre prénom.'
    if (values.lastName.trim().length < 2) found.lastName = 'Indiquez votre nom.'
    if (!isEmail(values.email)) found.email = 'Saisissez une adresse email valide (ex. nom@exemple.com).'
    if (!isPhone(values.phone)) found.phone = 'Saisissez un numéro valide, avec l’indicatif (ex. +253 77 00 00 00).'
    if (!isStrongEnough(values.password)) found.password = 'Au moins 8 caractères, avec une majuscule, une minuscule et un chiffre.'
    if (!confirm) found.confirm = 'Confirmez votre mot de passe.'
    else if (confirm !== values.password) found.confirm = 'Les deux mots de passe ne correspondent pas.'
    if (!terms) found.terms = 'Vous devez accepter les conditions pour créer un compte.'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setLoading(true)
    try {
      const user = await register(values)
      toast.success(`Bienvenue, ${user.firstName} !`, 'Votre compte FarhanDel Agency est créé.')
      onSuccess(user)
    } catch (error) {
      if (error instanceof AuthError && error.code === 'email-taken') {
        setErrors({ email: error.message })
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      } else {
        setErrors({ form: 'Création du compte impossible pour le moment. Réessayez.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="font-display text-4xl text-night-900">
        Créer votre compte
      </h2>
      <p className="mt-2 text-sm text-night-500">Suivez vos demandes, vos voyages et vos services en un seul endroit.</p>

      {errors.form && (
        <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
          {errors.form}
        </p>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <TextInput id={`${uid}-first`} label="Prénom" icon={UserRound} autoComplete="given-name" value={values.firstName} error={errors.firstName} onChange={(event) => set('firstName', event.target.value)} />
        <TextInput id={`${uid}-last`} label="Nom" autoComplete="family-name" value={values.lastName} error={errors.lastName} onChange={(event) => set('lastName', event.target.value)} />
        <TextInput id={`${uid}-email`} type="email" label="Email" icon={Mail} autoComplete="email" value={values.email} error={errors.email} onChange={(event) => set('email', event.target.value)} containerClassName="sm:col-span-2" />
        <TextInput
          id={`${uid}-phone`}
          type="tel"
          label="Téléphone"
          icon={Phone}
          autoComplete="tel"
          placeholder="+253 77 00 00 00"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => set('phone', event.target.value)}
          containerClassName="sm:col-span-2"
        />
        <PasswordInput
          id={`${uid}-password`}
          label="Mot de passe"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          showStrength
          onChange={(event) => set('password', event.target.value)}
          containerClassName="sm:col-span-2"
        />
        <PasswordInput
          id={`${uid}-confirm`}
          label="Confirmation du mot de passe"
          autoComplete="new-password"
          value={confirm}
          error={errors.confirm}
          onChange={(event) => {
            setConfirm(event.target.value)
            if (errors.confirm) setErrors((current) => ({ ...current, confirm: undefined }))
          }}
          containerClassName="sm:col-span-2"
        />
      </div>

      <Checkbox
        containerClassName="mt-6"
        checked={terms}
        error={errors.terms}
        onChange={(event) => {
          setTerms(event.target.checked)
          if (errors.terms) setErrors((current) => ({ ...current, terms: undefined }))
        }}
        label={
          <>
            J'accepte les{' '}
            <Link to="/conditions-generales" className="font-semibold text-azure-600 underline">
              conditions générales
            </Link>{' '}
            et la{' '}
            <Link to="/politique-de-confidentialite" className="font-semibold text-azure-600 underline">
              politique de confidentialité
            </Link>
            .
          </>
        }
      />

      <Button type="submit" size="lg" variant="dark" fullWidth loading={loading} iconLeft={!loading && <UserPlus className="size-5" aria-hidden="true" />} className="mt-7">
        Créer mon compte
      </Button>

      <p className="mt-7 text-center text-sm text-night-600">
        Vous avez déjà un compte ?{' '}
        <Link to="/connexion" className="font-semibold text-night-900 underline decoration-sand-400 decoration-2 underline-offset-4 hover:text-sand-700">
          Se connecter
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-night-500">Prototype : les comptes sont enregistrés uniquement dans ce navigateur.</p>
    </form>
  )
}
