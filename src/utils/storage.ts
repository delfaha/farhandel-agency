/**
 * Accès défensif au stockage du navigateur (navigation privée, quota, JSON corrompu…).
 * Les clés sont préfixées pour éviter toute collision avec d'autres sites en local.
 */
const PREFIX = 'farhandel:'

type StorageKind = 'local' | 'session'

function area(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStorage<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  try {
    const raw = area(kind)?.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T, kind: StorageKind = 'local'): void {
  try {
    area(kind)?.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* stockage indisponible : l'état reste en mémoire */
  }
}

export function removeStorage(key: string, kind: StorageKind = 'local'): void {
  try {
    area(kind)?.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
