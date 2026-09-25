/**
 * Client HTTP de la future API FarhanDel Agency.
 * Tant que VITE_USE_MOCKS n'est pas « false » (ou que VITE_API_URL est vide),
 * chaque service utilise son implémentation de démonstration locale.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false' || !API_BASE_URL

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type Query = Record<string, string | number | boolean | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  token?: string | null
  signal?: AbortSignal
}

let authTokenProvider: () => string | null = () => null

/** Branché par le service d'authentification pour joindre le jeton aux requêtes. */
export function setAuthTokenProvider(provider: () => string | null): void {
  authTokenProvider = provider
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const token = options.token ?? authTokenProvider()
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    let code: string | undefined
    try {
      const payload = (await response.json()) as { message?: string; code?: string }
      message = payload.message ?? message
      code = payload.code
    } catch {
      /* réponse non JSON */
    }
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
