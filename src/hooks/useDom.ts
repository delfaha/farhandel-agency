import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

/** Ferme un menu / popover avec la touche Échap (écouteur global actif seulement quand il est ouvert). */
export function useEscape(active: boolean, handler: () => void) {
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active])
}

/** Survol à la souris d'un élément (écouteurs natifs : amélioration progressive, le clic reste la voie principale). */
export function useMouseHover<T extends HTMLElement>(ref: RefObject<T | null>, onEnter: () => void, onLeave: () => void) {
  const handlers = useRef({ onEnter, onLeave })
  useLayoutEffect(() => {
    handlers.current = { onEnter, onLeave }
  })
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const enter = (event: PointerEvent) => event.pointerType === 'mouse' && handlers.current.onEnter()
    const leave = (event: PointerEvent) => event.pointerType === 'mouse' && handlers.current.onLeave()
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
    return () => {
      element.removeEventListener('pointerenter', enter)
      element.removeEventListener('pointerleave', leave)
    }
  }, [ref])
}

/** Bloque le défilement de la page (modale, menu mobile) en compensant la barre de défilement. */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { style } = document.body
    const previous = { overflow: style.overflow, paddingRight: style.paddingRight }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    style.overflow = 'hidden'
    if (scrollbar > 0) style.paddingRight = `${scrollbar}px`
    return () => {
      style.overflow = previous.overflow
      style.paddingRight = previous.paddingRight
    }
  }, [active])
}

/** Vrai dès que la page a défilé au-delà du seuil (en-tête compact). */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > threshold)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])
  return scrolled
}

/** Media query réactive (ex. « (min-width: 1024px) »). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Ferme un menu / popover au clic extérieur. */
export function useOnClickOutside(refs: RefObject<HTMLElement | null>[], handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (refs.some((ref) => ref.current?.contains(target))) return
      handler()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [refs, handler, active])
}

/**
 * Met en pause les animations CSS infinies d'un bloc lorsqu'il sort de l'écran
 * (ajoute la classe « is-paused ») : économie de batterie et de processeur.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle('is-paused', !entry.isIntersecting)
    })
    observer.observe(element)
    const onVisibility = () => element.classList.toggle('is-paused', document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref])
}

/** Défilement horizontal au cliquer-glisser (souris), sans déclencher de clic en fin de glissé. */
export function useDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element || !window.matchMedia('(pointer: fine)').matches) return
    let startX = 0
    let startLeft = 0
    let pointerId = -1
    let pressed = false
    let moved = false

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      pressed = true
      moved = false
      startX = event.clientX
      startLeft = element.scrollLeft
      pointerId = event.pointerId
    }
    const onMove = (event: PointerEvent) => {
      if (!pressed) return
      const delta = event.clientX - startX
      if (!moved && Math.abs(delta) > 6) {
        moved = true
        element.setPointerCapture(pointerId)
        element.dataset.dragging = 'true'
      }
      if (moved) element.scrollLeft = startLeft - delta
    }
    const onUp = () => {
      if (!pressed) return
      pressed = false
      if (moved) {
        if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
        delete element.dataset.dragging
      }
    }
    const onClick = (event: MouseEvent) => {
      if (moved) {
        event.preventDefault()
        event.stopPropagation()
        moved = false
      }
    }
    const onDragStart = (event: DragEvent) => event.preventDefault()

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onUp)
    element.addEventListener('click', onClick, true)
    element.addEventListener('dragstart', onDragStart)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onUp)
      element.removeEventListener('click', onClick, true)
      element.removeEventListener('dragstart', onDragStart)
    }
  }, [ref])
}
