/** Hachage 32 bits (FNV-1a) : génère des données de démonstration stables pour une même recherche. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function seededRandom(seed: number | string): () => number {
  let state = typeof seed === 'string' ? hashString(seed) : seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

const PNR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Référence de réservation à 6 caractères, sans caractères ambigus (I, O, 0, 1). */
export function generatePnr(random: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => PNR_ALPHABET[Math.floor(random() * PNR_ALPHABET.length)]).join('')
}

export function randomId(prefix = 'id'): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return `${prefix}_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}
