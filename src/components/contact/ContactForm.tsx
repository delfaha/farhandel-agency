import { AnimatePresence, motion } from 'framer-motion'
import { CircleCheck, Mail, Phone, Send, UserRound } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { Checkbox, SelectInput, TextArea, TextInput } from '@/components/ui/Field'
import { useToast } from '@/hooks/useStore'
import { contactService, type ContactMessage } from '@/services/supportService'
import { focusFirstError, isEmail, isPhone, type FieldErrors } from '@/utils/validation'

const SUBJECTS = [
  { value: 'reservation', label: 'Réservation de vol' },
  { value: 'offre', label: 'Une offre spéciale' },
  { value: 'modification', label: 'Modification ou annulation' },
  { value: 'groupe', label: 'Voyage de groupe / entreprise' },
  { value: 'services', label: 'Hôtel, transfert, assurance' },
  { value: 'autre', label: 'Autre demande' },
]

type ContactField = keyof ContactMessage | 'consent'

const EMPTY: ContactMessage = { lastName: '', firstName: '', email: '', phone: '', subject: '', message: '' }

/** Formulaire de contact : validation accessible, état d'envoi, confirmation animée. */
export function ContactForm() {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const toast = useToast()
  const [values, setValues] = useState<ContactMessage>(EMPTY)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<ContactField>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (field: keyof ContactMessage, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const found: FieldErrors<ContactField> = {}
    if (values.lastName.trim().length < 2) found.lastName = 'Indiquez votre nom.'
    if (values.firstName.trim().length < 2) found.firstName = 'Indiquez votre prénom.'
    if (!isEmail(values.email)) found.email = 'Saisissez une adresse email valide (ex. nom@exemple.com).'
    if (values.phone && !isPhone(values.phone)) found.phone = 'Numéro invalide : indiquez l’indicatif (ex. +253 77 00 00 00).'
    if (!values.subject) found.subject = 'Choisissez un sujet.'
    if (values.message.trim().length < 10) found.message = 'Votre message doit contenir au moins 10 caractères.'
    if (!consent) found.consent = 'Votre accord est nécessaire pour que nous puissions vous répondre.'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    let valid = false
    flushSync(() => {
      valid = validate()
    })
    if (!valid) {
      focusFirstError(formRef.current)
      return
    }
    setSending(true)
    try {
      await contactService.send({ ...values, subject: SUBJECTS.find((subject) => subject.value === values.subject)?.label ?? values.subject })
      setSent(true)
      toast.success('Message enregistré', 'Merci ! Nous revenons vers vous rapidement.')
    } catch {
      toast.error('Envoi impossible', 'Veuillez réessayer ou nous appeler directement.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-line bg-white p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center" role="status">
            <CircleCheck aria-hidden="true" className="mx-auto size-14 text-emerald-600" />
            <h2 className="mt-5 font-display text-4xl text-night-900">Merci, {values.firstName} !</h2>
            <p className="mx-auto mt-3 max-w-md text-night-600">
              Votre message a bien été enregistré. Prototype : l'envoi réel sera activé avec le backend — pour une réponse immédiate, appelez-nous ou
              écrivez-nous sur WhatsApp.
            </p>
            <Button
              variant="outline"
              className="mt-8"
              onClick={() => {
                setValues(EMPTY)
                setConsent(false)
                setSent(false)
              }}
            >
              Envoyer un autre message
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" ref={formRef} onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-labelledby={`${uid}-title`}>
            <h2 id={`${uid}-title`} className="font-display text-4xl text-night-900">
              Écrivez-nous
            </h2>
            <p className="mt-2 text-sm text-night-500">Tous les champs sont obligatoires, sauf mention contraire.</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <TextInput id={`${uid}-last`} label="Nom" icon={UserRound} autoComplete="family-name" value={values.lastName} error={errors.lastName} onChange={(event) => set('lastName', event.target.value)} />
              <TextInput id={`${uid}-first`} label="Prénom" autoComplete="given-name" value={values.firstName} error={errors.firstName} onChange={(event) => set('firstName', event.target.value)} />
              <TextInput id={`${uid}-email`} type="email" label="Email" icon={Mail} autoComplete="email" value={values.email} error={errors.email} onChange={(event) => set('email', event.target.value)} />
              <TextInput
                id={`${uid}-phone`}
                type="tel"
                label="Téléphone"
                optional
                icon={Phone}
                autoComplete="tel"
                placeholder="+253 77 00 00 00"
                value={values.phone}
                error={errors.phone}
                onChange={(event) => set('phone', event.target.value)}
              />
              <SelectInput
                id={`${uid}-subject`}
                label="Sujet"
                placeholder="Choisir un sujet…"
                options={SUBJECTS}
                value={values.subject}
                error={errors.subject}
                onChange={(event) => set('subject', event.target.value)}
                containerClassName="sm:col-span-2"
              />
              <TextArea
                id={`${uid}-message`}
                label="Message"
                rows={5}
                placeholder="Destination, dates, nombre de voyageurs, questions…"
                value={values.message}
                error={errors.message}
                onChange={(event) => set('message', event.target.value)}
                containerClassName="sm:col-span-2"
              />
              <Checkbox
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked)
                  if (errors.consent) setErrors((current) => ({ ...current, consent: undefined }))
                }}
                error={errors.consent}
                label="J'accepte que FarhanDel Agency utilise ces informations pour répondre à ma demande."
                containerClassName="sm:col-span-2"
              />
            </div>
            <Button type="submit" size="lg" loading={sending} iconLeft={!sending && <Send className="size-5" aria-hidden="true" />} className="mt-7 w-full sm:w-auto">
              Envoyer le message
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
