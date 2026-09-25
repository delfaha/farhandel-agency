import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Reveal } from './Motion'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2' | 'h3'
  action?: ReactNode
  className?: string
  id?: string
}

/**
 * Titre de section : sur-titre doré, grand titre éditorial (serif) et chapô.
 * Utiliser <em> dans le titre pour l'accent italique doré.
 */
export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'light', as: Tag = 'h2', action, className, id }: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p
            className={cn(
              'mb-4 flex items-center gap-3 text-eyebrow font-semibold uppercase',
              align === 'center' && 'justify-center',
              dark ? 'text-sand-300' : 'text-sand-700',
            )}
          >
            <span aria-hidden="true" className={cn('h-px w-8', dark ? 'bg-sand-300/60' : 'bg-sand-600/50')} />
            {eyebrow}
          </p>
        )}
        <Tag
          id={id}
          className={cn(
            'font-display text-h2 [&_em]:italic',
            dark ? 'text-white [&_em]:text-sand-300' : 'text-night-900 [&_em]:text-sand-600',
          )}
        >
          {title}
        </Tag>
        {description && (
          <div className={cn('mt-5 max-w-2xl text-lead', align === 'center' && 'mx-auto', dark ? 'text-white/70' : 'text-night-600')}>
            {description}
          </div>
        )}
      </Reveal>
      {action && <Reveal delay={0.15} className="shrink-0">{action}</Reveal>}
    </div>
  )
}
