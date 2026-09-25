import { Check, ChevronDown, CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'
import { passwordStrength } from '@/utils/validation'

const inputClasses = cn(
  'block w-full rounded-xl border border-line bg-white text-[0.95rem] text-night-900 shadow-[inset_0_1px_1px_rgb(11_26_46/0.03)]',
  'placeholder:text-night-400 transition-[border-color,box-shadow] duration-200',
  'hover:border-night-200 focus:border-azure-500 focus:outline-none focus:ring-4 focus:ring-azure-500/15',
  'aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/15',
  'disabled:cursor-not-allowed disabled:bg-mist disabled:text-night-400',
)

interface FieldShellProps {
  id: string
  label: ReactNode
  error?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
  children: ReactNode
  labelClassName?: string
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-rose-700">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}

/** Libellé + champ + aide + message d'erreur, correctement reliés (aria-describedby). */
export function FieldShell({ id, label, error, hint, optional, className, children, labelClassName }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={cn('mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-night-800', labelClassName)}>
        <span>{label}</span>
        {optional && <span className="text-xs font-medium text-night-500">Facultatif</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-night-500">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: ReactNode
  error?: string
  hint?: ReactNode
  optional?: boolean
  icon?: LucideIcon
  containerClassName?: string
  ref?: Ref<HTMLInputElement>
}

export function TextInput({ label, error, hint, optional, icon: Icon, containerClassName, className, id, ref, ...rest }: TextInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} optional={optional} className={containerClassName}>
      <div className="relative">
        {Icon && <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-night-400" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className={cn(inputClasses, 'h-12', Icon ? 'pl-11 pr-4' : 'px-4', className)}
          {...rest}
        />
      </div>
    </FieldShell>
  )
}

type PasswordInputProps = Omit<TextInputProps, 'type' | 'icon'> & { showStrength?: boolean; value: string }

const STRENGTH_COLORS = ['bg-night-100', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600']

export function PasswordInput({ label, error, hint, optional, containerClassName, className, id, showStrength, value, ref, ...rest }: PasswordInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [visible, setVisible] = useState(false)
  const strength = passwordStrength(value)

  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} optional={optional} className={containerClassName}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(describedBy(inputId, error, hint), showStrength && `${inputId}-strength`) || undefined}
          className={cn(inputClasses, 'h-12 pl-4 pr-12', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-night-500 transition hover:bg-mist hover:text-night-900"
        >
          {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
        </button>
      </div>
      {showStrength && (
        <div id={`${inputId}-strength`} className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300', strength.score >= level ? STRENGTH_COLORS[strength.score] : 'bg-night-100')}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-night-500">
            Robustesse : <span className="font-semibold text-night-800">{value ? strength.label : '—'}</span> · 8 caractères minimum, avec
            majuscule, minuscule et chiffre.
          </p>
        </div>
      )}
    </FieldShell>
  )
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode
  error?: string
  hint?: ReactNode
  optional?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
  containerClassName?: string
  ref?: Ref<HTMLSelectElement>
}

export function SelectInput({ label, error, hint, optional, options, placeholder, containerClassName, className, id, ref, ...rest }: SelectInputProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint} optional={optional} className={containerClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          className={cn(inputClasses, 'h-12 appearance-none pl-4 pr-11', className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-night-500" />
      </div>
    </FieldShell>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode
  error?: string
  hint?: ReactNode
  optional?: boolean
  containerClassName?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function TextArea({ label, error, hint, optional, containerClassName, className, id, ref, ...rest }: TextAreaProps) {
  const autoId = useId()
  const areaId = id ?? autoId
  return (
    <FieldShell id={areaId} label={label} error={error} hint={hint} optional={optional} className={containerClassName}>
      <textarea
        ref={ref}
        id={areaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(areaId, error, hint)}
        className={cn(inputClasses, 'min-h-32 resize-y px-4 py-3 leading-relaxed', className)}
        {...rest}
      />
    </FieldShell>
  )
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  error?: string
  description?: ReactNode
  containerClassName?: string
  tone?: 'light' | 'dark'
}

export function Checkbox({ label, error, description, containerClassName, className, id, tone = 'light', ...rest }: CheckboxProps) {
  const autoId = useId()
  const boxId = id ?? autoId
  return (
    <div className={containerClassName}>
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
          <input
            id={boxId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${boxId}-error` : description ? `${boxId}-desc` : undefined}
            className={cn(
              'peer size-5 cursor-pointer appearance-none rounded-md border transition-colors duration-200',
              tone === 'light' ? 'border-night-300 bg-white checked:border-night-900 checked:bg-night-900' : 'border-white/40 bg-white/5 checked:border-sand-400 checked:bg-sand-400',
              'aria-[invalid=true]:border-rose-500',
              className,
            )}
            {...rest}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className={cn('pointer-events-none absolute size-3.5 opacity-0 transition-opacity peer-checked:opacity-100', tone === 'light' ? 'text-white' : 'text-night-950')}
          />
        </span>
        <span className="text-sm leading-relaxed">
          <label htmlFor={boxId} className={cn('font-medium', tone === 'light' ? 'text-night-800' : 'text-white/85')}>
            {label}
          </label>
          {description && (
            <span id={`${boxId}-desc`} className={cn('block', tone === 'light' ? 'text-night-500' : 'text-white/60')}>
              {description}
            </span>
          )}
        </span>
      </div>
      <FieldError id={`${boxId}-error`}>{error}</FieldError>
    </div>
  )
}
