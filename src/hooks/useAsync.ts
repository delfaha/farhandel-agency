import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  error: Error | null
  loading: boolean
}

const IDLE = { data: undefined, error: null, loading: false } as const

/**
 * Exécute une fonction asynchrone quand sa clé change (sérialisation des paramètres).
 * - l'état « chargement » d'une nouvelle clé est dérivé au rendu (aucun setState synchrone dans l'effet) ;
 * - les réponses obsolètes sont ignorées ;
 * - `reload()` relance la requête en conservant les données affichées.
 */
export function useAsync<T>(fn: () => Promise<T>, key: string, enabled = true) {
  const requestKey = `${enabled ? 1 : 0}:${key}`
  const [state, setState] = useState<AsyncState<T> & { key: string }>({ data: undefined, error: null, loading: enabled, key: requestKey })
  const callId = useRef(0)
  const fnRef = useRef(fn)

  useLayoutEffect(() => {
    fnRef.current = fn
  })

  const fetchData = useCallback((forKey: string) => {
    const id = ++callId.current
    fnRef
      .current()
      .then((data) => {
        if (id === callId.current) setState({ data, error: null, loading: false, key: forKey })
      })
      .catch((error: unknown) => {
        if (id === callId.current) {
          setState({ data: undefined, error: error instanceof Error ? error : new Error(String(error)), loading: false, key: forKey })
        }
      })
  }, [])

  useEffect(() => {
    if (enabled) fetchData(requestKey)
    else callId.current += 1
  }, [enabled, fetchData, requestKey])

  const reload = useCallback(() => {
    setState((previous) => ({ ...(previous.key === requestKey ? previous : IDLE), key: requestKey, loading: true, error: null }))
    fetchData(requestKey)
  }, [fetchData, requestKey])

  const current: AsyncState<T> = !enabled ? IDLE : state.key === requestKey ? state : { data: undefined, error: null, loading: true }
  return { ...current, reload }
}
