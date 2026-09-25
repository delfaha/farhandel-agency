import { Hash, Search, UserRound } from 'lucide-react'
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { DEMO_LOOKUP } from '@/services/mock/demoData'
import type { BookingLookup } from '@/types/booking'
import { isPnr, normalizePnr, type FieldErrors } from '@/utils/validation'
import { BoxInput } from './SearchFields'

interface BookingSearchProps {
  submitLabel: string
  nameLabel?: string
  loading?: boolean
  defaultValues?: Partial<BookingLookup>
  onSubmit: (lookup: BookingLookup) => void
  icon?: ReactNode
}

/** Formulaire « numéro de réservation + nom » (Gérer ma réservation, Check-in). */
export function BookingSearch({ submitLabel, nameLabel = 'Nom du passager', loading, defaultValues, onSubmit, icon }: BookingSearchProps) {
  const uid = useId().replace(/:/g, '')
  const formRef = useRef<HTMLFormElement>(null)
  const [pnr, setPnr] = useState(defaultValues?.pnr ?? '')
  const [lastName, setLastName] = useState(defaultValues?.lastName ?? '')
  const [errors, setErrors] = useState<FieldErrors<'pnr' | 'lastName'>>({})

  const validate = (values: BookingLookup) => {
    const found: FieldErrors<'pnr' | 'lastName'> = {}
    if (!values.pnr.trim()) found.pnr = 'Saisissez votre numéro de réservation.'
    else if (!isPnr(values.pnr)) found.pnr = 'Le numéro de réservation comporte 6 lettres ou chiffres (ex. FLS7K2).'
    if (values.lastName.trim().length < 2) found.lastName = 'Saisissez le nom de famille figurant sur la réservation.'
    return found
  }

  const submit = (values: BookingLookup) => {
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    onSubmit({ pnr: normalizePnr(values.pnr), lastName: values.lastName.trim() })
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit({ pnr, lastName })
  }

  const fillDemo = () => {
    setPnr(DEMO_LOOKUP.pnr)
    setLastName(DEMO_LOOKUP.lastName)
    submit({ pnr: DEMO_LOOKUP.pnr, lastName: DEMO_LOOKUP.lastName })
  }

  return (
    <form ref={formRef} onSubmit={onFormSubmit} noValidate>
      <div className="grid items-start gap-3 md:grid-cols-[1fr_1fr_auto]">
        <BoxInput
          id={`${uid}-pnr`}
          label="Numéro de réservation"
          icon={Hash}
          value={pnr}
          maxLength={8}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Ex. FLS7K2"
          error={errors.pnr}
          onChange={(event) => setPnr(event.target.value.toUpperCase())}
          className="uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal"
        />
        <BoxInput
          id={`${uid}-name`}
          label={nameLabel}
          icon={UserRound}
          value={lastName}
          autoComplete="family-name"
          placeholder="Tel qu'indiqué sur le billet"
          error={errors.lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <Button type="submit" size="lg" loading={loading} iconLeft={icon ?? <Search className="size-5" aria-hidden="true" />} className="h-[68px] w-full rounded-2xl md:w-auto">
          {submitLabel}
        </Button>
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-night-500">
        <span>Démonstration : réservation d'exemple</span>
        <button type="button" onClick={fillDemo} className="rounded-md bg-mist px-2 py-1 font-semibold tracking-wide text-night-800 transition hover:bg-sand-100">
          {DEMO_LOOKUP.pnr} · {DEMO_LOOKUP.lastName}
        </button>
      </p>
    </form>
  )
}
