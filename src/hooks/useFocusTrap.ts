import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Piège le focus clavier dans un conteneur modal (Tab / Maj+Tab), ferme avec Échap
 * et rend le focus à l'élément déclencheur à la fermeture.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  const escapeRef = useRef(onEscape)

  useEffect(() => {
    escapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    const container = ref.current
    if (!active || !container) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => element.getClientRects().length > 0)

    const frame = requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? container
      target.focus({ preventScroll: true })
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [active, ref])
}
