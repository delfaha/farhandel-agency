import type { CSSProperties } from 'react'
import { useMediaQuery } from '@/hooks/useDom'
import { cn } from '@/utils/cn'
import { FLAGS, type FlagId } from './flagData'

/**
 * Drapeau « en tissu » : l'image est découpée en bandes verticales animées avec un
 * léger déphasage (ondulation + ombres et reflets). Le bord côté mât reste fixe.
 */
export function WavingFlag({ flag, className, amplitude = 7 }: { flag: FlagId; className?: string; amplitude?: number }) {
  const mobile = useMediaQuery('(max-width: 767px)')
  const strips = mobile ? 14 : 28
  const style = { '--flag': `url("${FLAGS[flag].src}")`, '--n': strips, '--wave-amp': `${amplitude}px` } as CSSProperties
  return (
    <div role="img" aria-label={FLAGS[flag].label} className={cn('flag-fabric', className)} style={style}>
      {Array.from({ length: strips }, (_, index) => (
        <span key={index} aria-hidden="true" className="flag-strip" style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  )
}

/** Petit drapeau rond (pastilles, itinéraires). */
export function FlagBadge({ flag, className }: { flag: FlagId; className?: string }) {
  return (
    <span className={cn('relative block overflow-hidden rounded-full ring-2 ring-white/80', className)}>
      <img src={FLAGS[flag].src} alt={FLAGS[flag].label} className="absolute inset-0 size-full scale-[1.35] object-cover" draggable={false} />
    </span>
  )
}
