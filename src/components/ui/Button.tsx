import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/utils/cn'
import { Spinner } from './LoadingState'

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'outline-light' | 'ghost' | 'light' | 'glass' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sand-400 text-night-950 hover:bg-sand-300 hover:shadow-gold',
  dark: 'bg-night-900 text-white hover:bg-night-700',
  outline: 'border border-night-200 bg-white/60 text-night-900 hover:border-night-900',
  'outline-light': 'border border-white/35 text-white hover:border-white hover:bg-white/10',
  ghost: 'text-night-800 hover:bg-night-50',
  light: 'bg-white text-night-900 hover:bg-sand-50',
  glass: 'glass text-white hover:bg-white/15',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-[0.9375rem]',
  lg: 'h-14 gap-2.5 px-7 text-base',
}

interface StyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: StyleProps = {}): string {
  return cn(
    'group/btn relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.005em]',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-premium active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}

interface ContentProps {
  iconLeft?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  children?: ReactNode
}

function ButtonContent({ iconLeft, iconRight, loading, children }: ContentProps) {
  return (
    <>
      {loading ? <Spinner className="size-4" /> : iconLeft}
      <span>{children}</span>
      {iconRight && (
        <span className="inline-flex transition-transform duration-300 ease-premium group-hover/btn:translate-x-0.5">{iconRight}</span>
      )}
    </>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & ContentProps & { ref?: Ref<HTMLButtonElement> }

export function Button({ variant, size, fullWidth, className, iconLeft, iconRight, loading, children, type = 'button', disabled, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </ButtonContent>
    </button>
  )
}

type ButtonLinkProps = LinkProps & StyleProps & Omit<ContentProps, 'loading'>

export function ButtonLink({ variant, size, fullWidth, className, iconLeft, iconRight, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children as ReactNode}
      </ButtonContent>
    </Link>
  )
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps & Omit<ContentProps, 'loading'>

/** Lien externe (tel:, mailto:, WhatsApp…) avec l'apparence d'un bouton. */
export function ButtonAnchor({ variant, size, fullWidth, className, iconLeft, iconRight, children, ...rest }: ButtonAnchorProps) {
  const external = rest.href?.startsWith('http')
  return (
    <a
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      <ButtonContent iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </a>
  )
}
