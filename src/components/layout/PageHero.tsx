import { motion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from '@/components/ui/Misc'
import { SmartImage } from '@/components/ui/SmartImage'
import type { ImageRef } from '@/types/content'
import { cn } from '@/utils/cn'
import { EASE_PREMIUM } from '@/utils/motion'

interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  image: ImageRef
  breadcrumbs: Crumb[]
  children?: ReactNode
  className?: string
}

/** Bandeau photographique des pages intérieures (fond sombre sous l'en-tête transparent). */
export function PageHero({ eyebrow, title, description, image, breadcrumbs, children, className }: PageHeroProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 120])

  return (
    <section className={cn('on-dark relative isolate overflow-hidden bg-night-950 text-white', className)}>
      <motion.div aria-hidden="true" style={{ y }} className="absolute inset-x-0 -top-8 bottom-[-15%] -z-10">
        <SmartImage image={image} sizes="100vw" priority className="size-full" imgClassName="scale-105" />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_15_29/0.82)_0%,rgb(6_15_29/0.45)_45%,rgb(6_15_29/0.92)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_0%_60%,rgb(6_15_29/0.6),transparent_70%)]" />

      <div className="container-page pb-14 pt-32 sm:pb-20 sm:pt-40 lg:pt-44">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE_PREMIUM }}>
          <Breadcrumbs items={breadcrumbs} />
        </motion.div>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE_PREMIUM }}
            className="mt-8 flex items-center gap-3 text-eyebrow font-semibold uppercase text-sand-300"
          >
            <span aria-hidden="true" className="h-px w-8 bg-sand-300/60" />
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE_PREMIUM }}
          className={cn('max-w-4xl font-display text-h1 [&_em]:italic [&_em]:text-sand-300', eyebrow ? 'mt-4' : 'mt-8')}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE_PREMIUM }}
            className="mt-5 max-w-2xl text-lead text-white/75"
          >
            {description}
          </motion.div>
        )}
        {children && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.34, ease: EASE_PREMIUM }} className="mt-8">
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
