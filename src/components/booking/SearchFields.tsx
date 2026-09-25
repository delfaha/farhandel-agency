import { AnimatePresence, motion } from 'framer-motion'
import { Armchair, CalendarDays, ChevronDown, MapPin, Minus, Plus, Users, type LucideIcon } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { FieldError } from '@/components/ui/Field'
import { getAirport, searchAirports } from '@/data/airports'
import { CABIN_OPTIONS, TRIP_LABELS } from '@/data/labels'
import { useEscape, useOnClickOutside } from '@/hooks/useDom'
import type { CabinClass, PassengerCounts, TripType } from '@/types/flight'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { MAX_PASSENGERS, passengerSummary } from '@/utils/search'

/** Boîte de champ « billetterie » : libellé discret au-dessus d'une valeur mise en avant. */
function fieldBox(error?: string, active?: boolean) {
  return cn(
    'flex h-[68px] w-full items-center gap-3 rounded-2xl border bg-white px-4 text-left transition-[border-color,box-shadow] duration-200',
    error ? 'border-rose-400' : active ? 'border-azure-500 ring-4 ring-azure-500/15' : 'border-line hover:border-night-200',
    'focus-within:border-azure-500 focus-within:ring-4 focus-within:ring-azure-500/15',
  )
}

const valueClasses = 'block w-full truncate bg-transparent text-base font-semibold text-night-900 outline-none placeholder:font-medium placeholder:text-night-400'
const labelClasses = 'block text-xs font-semibold text-night-500'

/* ---------- Type de voyage ---------- */

export function TripTypeSelector({ value, onChange, name }: { value: TripType; onChange: (value: TripType) => void; name: string }) {
  return (
    <fieldset>
      <legend className="sr-only">Type de voyage</legend>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(TRIP_LABELS) as TripType[]).map((type) => {
          const selected = value === type
          return (
            <label
              key={type}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-azure-500 has-[:focus-visible]:ring-offset-2',
                selected ? 'text-white' : 'text-night-600 hover:bg-mist hover:text-night-900',
              )}
            >
              <input type="radio" name={name} value={type} checked={selected} onChange={() => onChange(type)} className="sr-only" />
              {selected && (
                <motion.span layoutId={`${name}-pill`} className="absolute inset-0 rounded-full bg-night-900" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
              <span className="relative">{TRIP_LABELS[type]}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/* ---------- Aéroport (combobox accessible) ---------- */

interface AirportFieldProps {
  id: string
  label: string
  value: string
  onChange: (code: string) => void
  exclude?: string
  error?: string
  icon: LucideIcon
  placeholder: string
  onSelected?: () => void
  inputRef?: Ref<HTMLInputElement>
}

export function AirportField({ id, label, value, onChange, exclude, error, icon: Icon, placeholder, onSelected, inputRef }: AirportFieldProps) {
  const selected = value ? getAirport(value) : undefined
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const results = useMemo(() => searchAirports(query, exclude).slice(0, 7), [query, exclude])
  const listId = `${id}-list`

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])
  const outsideRefs = useMemo(() => [wrapperRef], [])
  useOnClickOutside(outsideRefs, close, open)

  const choose = (code: string) => {
    onChange(code)
    close()
    onSelected?.()
  }

  const move = (delta: number) => {
    if (!open) {
      setOpen(true)
      return
    }
    const next = (active + delta + results.length) % Math.max(results.length, 1)
    setActive(next)
    listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      if (results[active]) choose(results[active].code)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab' && open) {
      if (query && results[active]) onChange(results[active].code)
      close()
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className={fieldBox(error, open)}>
        <Icon aria-hidden="true" className="size-5 shrink-0 text-night-400" />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && results[active] ? `${id}-option-${results[active].code}` : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete="off"
            spellCheck={false}
            value={open ? query : (selected?.city ?? '')}
            placeholder={selected ? selected.city : placeholder}
            onFocus={() => {
              setOpen(true)
              setQuery('')
              setActive(0)
            }}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            className={valueClasses}
          />
        </div>
        {selected && (
          <span className="rounded-lg bg-mist px-2 py-1 text-xs font-bold tracking-wider text-night-700">{selected.code}</span>
        )}
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={`${label} : suggestions d'aéroports`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[340px] w-full min-w-[min(320px,calc(100vw-3rem))] overflow-y-auto overscroll-contain rounded-2xl bg-white p-1.5 shadow-float ring-1 ring-night-900/5"
          >
            {!query && (
              <div role="presentation" className="px-3 pb-1.5 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-night-500">
                Destinations populaires
              </div>
            )}
            {results.map((airport, index) => (
              // Motif combobox ARIA : le focus reste sur le champ (aria-activedescendant) qui gère le clavier ;
              // le clic est un raccourci souris sur l'option active.
              // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={airport.code}
                id={`${id}-option-${airport.code}`}
                data-index={index}
                role="option"
                tabIndex={-1}
                aria-selected={index === active}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(airport.code)}
                onPointerMove={() => setActive(index)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 aria-selected:bg-mist"
              >
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-sand-600" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-night-900">
                    {airport.city} <span className="font-normal text-night-500">· {airport.country}</span>
                  </span>
                  <span className="block truncate text-xs text-night-500">{airport.name}</span>
                </span>
                <span className="text-xs font-bold tracking-wider text-night-700">{airport.code}</span>
              </div>
            ))}
            {results.length === 0 && (
              <div role="presentation" className="px-3 py-4 text-sm text-night-500">
                Aucun aéroport ne correspond à « {query} ».
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Date ---------- */

interface DateFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  error?: string
}

export function DateField({ id, label, value, onChange, min, error }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const openPicker = () => {
    try {
      inputRef.current?.showPicker()
    } catch {
      /* navigateur sans showPicker : le champ natif reste utilisable */
    }
  }
  return (
    <div>
      <div className={fieldBox(error)}>
        <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-night-400" />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
          <input
            ref={inputRef}
            id={id}
            type="date"
            value={value}
            min={min}
            onChange={(event) => onChange(event.target.value)}
            onClick={openPicker}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(error && `${id}-error`, value && `${id}-day`) || undefined}
            className={cn(valueClasses, 'min-h-6 [color-scheme:light]')}
          />
        </div>
        {value && (
          <span id={`${id}-day`} className="hidden shrink-0 text-xs font-medium text-night-500 first-letter:uppercase 2xl:block">
            {formatDate(value, 'weekday')}
          </span>
        )}
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

/* ---------- Passagers ---------- */

const PASSENGER_ROWS: { key: keyof PassengerCounts; label: string; hint: string; add: string; remove: string }[] = [
  { key: 'adults', label: 'Adultes', hint: '12 ans et plus', add: 'Ajouter un adulte', remove: 'Retirer un adulte' },
  { key: 'children', label: 'Enfants', hint: 'De 2 à 11 ans', add: 'Ajouter un enfant', remove: 'Retirer un enfant' },
  { key: 'infants', label: 'Bébés', hint: 'Moins de 2 ans, sur les genoux', add: 'Ajouter un bébé', remove: 'Retirer un bébé' },
]

export function PassengerField({ id, value, onChange, error }: { id: string; value: PassengerCounts; onChange: (value: PassengerCounts) => void; error?: string }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const outsideRefs = useMemo(() => [wrapperRef], [])
  useOnClickOutside(outsideRefs, close, open)
  useEscape(open, () => {
    setOpen(false)
    buttonRef.current?.focus()
  })

  const limits = (key: keyof PassengerCounts) => {
    if (key === 'adults') return { min: 1, max: MAX_PASSENGERS - value.children }
    if (key === 'children') return { min: 0, max: MAX_PASSENGERS - value.adults }
    return { min: 0, max: value.adults }
  }

  const update = (key: keyof PassengerCounts, delta: number) => {
    const next = { ...value, [key]: value[key] + delta }
    if (next.infants > next.adults) next.infants = next.adults
    onChange(next)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        data-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen((current) => !current)}
        className={fieldBox(error, open)}
      >
        <Users aria-hidden="true" className="size-5 shrink-0 text-night-400" />
        <span className="min-w-0 flex-1">
          <span className={labelClasses}>Passagers</span>
          <span className="block truncate text-base font-semibold text-night-900">{passengerSummary(value)}</span>
        </span>
        <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 text-night-500 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <FieldError id={`${id}-error`}>{error}</FieldError>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="dialog"
            aria-label="Choisir le nombre de passagers"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(340px,calc(100vw-3rem))] rounded-2xl bg-white p-5 shadow-float ring-1 ring-night-900/5 sm:left-auto sm:right-0"
          >
            <ul className="divide-y divide-line">
              {PASSENGER_ROWS.map((row) => {
                const { min, max } = limits(row.key)
                return (
                  <li key={row.key} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <div>
                      <p className="font-semibold text-night-900">{row.label}</p>
                      <p className="text-xs text-night-500">{row.hint}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CounterButton label={row.remove} disabled={value[row.key] <= min} onClick={() => update(row.key, -1)}>
                        <Minus className="size-4" aria-hidden="true" />
                      </CounterButton>
                      <output aria-live="polite" aria-label={`${row.label} : ${value[row.key]}`} className="w-5 text-center font-semibold tabular-nums">
                        {value[row.key]}
                      </output>
                      <CounterButton label={row.add} disabled={value[row.key] >= max} onClick={() => update(row.key, 1)}>
                        <Plus className="size-4" aria-hidden="true" />
                      </CounterButton>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-night-500">
              {MAX_PASSENGERS} passagers maximum par demande. Groupes : contactez-nous pour un devis dédié.
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                buttonRef.current?.focus()
              }}
              className="mt-4 h-10 w-full rounded-full bg-night-900 text-sm font-semibold text-white transition hover:bg-night-700"
            >
              Valider
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CounterButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full border border-night-200 text-night-900 transition hover:border-night-900 hover:bg-night-900 hover:text-white disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  )
}

/* ---------- Classe ---------- */

export function CabinField({ id, value, onChange }: { id: string; value: CabinClass; onChange: (value: CabinClass) => void }) {
  return (
    <div className={fieldBox()}>
      <Armchair aria-hidden="true" className="size-5 shrink-0 text-night-400" />
      <div className="relative min-w-0 flex-1">
        <label htmlFor={id} className={labelClasses}>
          Classe
        </label>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as CabinClass)}
          className="block w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-base font-semibold text-night-900 outline-none"
        >
          {CABIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-0.5 right-0 size-4 text-night-500" />
      </div>
    </div>
  )
}

/* ---------- Champ texte au style billetterie ---------- */

type BoxInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  icon: LucideIcon
  error?: string
  hint?: ReactNode
}

export function BoxInput({ id, label, icon: Icon, error, hint, className, ...rest }: BoxInputProps) {
  return (
    <div>
      <div className={fieldBox(error)}>
        <Icon aria-hidden="true" className="size-5 shrink-0 text-night-400" />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className={labelClasses}>
            {label}
          </label>
          <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(valueClasses, className)}
            {...rest}
          />
        </div>
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-night-500">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}
