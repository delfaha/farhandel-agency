import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useDragScroll } from '@/hooks/useDom'
import { cn } from '@/utils/cn'

interface CarouselProps<T> {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T, index: number) => ReactNode
  /** Nom accessible du carrousel. */
  label: string
  /** Largeur des diapositives selon l'écran (classes Tailwind). */
  itemClassName?: string
  autoplay?: boolean
  interval?: number
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Carrousel natif (scroll-snap) : balayage tactile, glisser à la souris, flèches,
 * pagination, lecture automatique optionnelle (pause au survol / focus, bouton pause).
 */
export function Carousel<T>({
  items,
  getKey,
  renderItem,
  label,
  itemClassName = 'w-[84%] sm:w-[46%] lg:w-[31.8%]',
  autoplay = false,
  interval = 5500,
  tone = 'light',
  className,
}: CarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [hovered, setHovered] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const reduce = useReducedMotion()
  useDragScroll(trackRef)

  const step = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return 1
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    return first.offsetWidth + gap
  }, [])

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const size = step()
    const maxScroll = track.scrollWidth - track.clientWidth
    const count = maxScroll <= 2 ? 1 : Math.round(maxScroll / size) + 1
    setPageCount(count)
    setPage(maxScroll - track.scrollLeft <= 4 ? count - 1 : Math.round(track.scrollLeft / size))
  }, [step])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }
    measure()
    track.addEventListener('scroll', onScroll, { passive: true })
    const resize = new ResizeObserver(measure)
    resize.observe(track)
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    visibility.observe(track)
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
      resize.disconnect()
      visibility.disconnect()
    }
  }, [measure, items.length])

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current
      if (!track) return
      const clamped = (target + pageCount) % pageCount
      track.scrollTo({ left: clamped * step(), behavior: reduce ? 'auto' : 'smooth' })
    },
    [pageCount, step, reduce],
  )

  const playing = autoplay && !reduce && !userPaused && !hovered && inView && pageCount > 1
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => goTo(page + 1), interval)
    return () => window.clearInterval(timer)
  }, [playing, page, goTo, interval])

  // Pause de la lecture automatique au survol et quand le focus clavier est dans le carrousel (WCAG 2.2.2).
  useEffect(() => {
    const region = regionRef.current
    if (!region || !autoplay) return
    const pause = () => setHovered(true)
    const resume = () => setHovered(false)
    const onFocusOut = (event: FocusEvent) => {
      if (!region.contains(event.relatedTarget as Node | null)) resume()
    }
    region.addEventListener('pointerenter', pause)
    region.addEventListener('pointerleave', resume)
    region.addEventListener('focusin', pause)
    region.addEventListener('focusout', onFocusOut)
    return () => {
      region.removeEventListener('pointerenter', pause)
      region.removeEventListener('pointerleave', resume)
      region.removeEventListener('focusin', pause)
      region.removeEventListener('focusout', onFocusOut)
    }
  }, [autoplay])

  const dark = tone === 'dark'
  const arrow = cn(
    'grid size-11 place-items-center rounded-full border transition duration-300 disabled:opacity-35 disabled:pointer-events-none',
    dark ? 'border-white/25 text-white hover:border-white hover:bg-white/10' : 'border-night-200 bg-white text-night-900 hover:border-night-900 hover:bg-night-900 hover:text-white',
  )

  return (
    <div ref={regionRef} role="region" aria-roledescription="carrousel" aria-label={label} className={cn('relative', className)}>
      <div
        ref={trackRef}
        className="carousel-track -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 pt-1 scrollbar-none sm:gap-5"
      >
        {items.map((item, index) => (
          <div
            key={getKey(item)}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${index + 1} sur ${items.length}`}
            className={cn('shrink-0 snap-start', itemClassName)}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-7 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2" role="group" aria-label="Pagination">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Aller à la position ${index + 1} sur ${pageCount}`}
                aria-current={index === page ? 'true' : undefined}
                className="group grid h-6 place-items-center"
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-500 ease-premium',
                    index === page ? 'w-8' : 'w-1.5 group-hover:w-3',
                    dark ? (index === page ? 'bg-sand-300' : 'bg-white/35') : index === page ? 'bg-night-900' : 'bg-night-200',
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {autoplay && !reduce && (
              <button
                type="button"
                onClick={() => setUserPaused((current) => !current)}
                aria-label={userPaused ? 'Reprendre le défilement automatique' : 'Mettre en pause le défilement automatique'}
                className={cn(arrow, 'size-9')}
              >
                {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
            )}
            <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Précédent" className={arrow}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(page + 1)} disabled={page >= pageCount - 1} aria-label="Suivant" className={arrow}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
