import type { Airline } from '@/types/flight'

/**
 * Compagnies citées dans les données de démonstration, à titre informatif uniquement.
 * Aucun partenariat n'est sous-entendu ; horaires et tarifs affichés sont fictifs.
 */
export const AIRLINES: Record<string, Airline> = {
  TK: { code: 'TK', name: 'Turkish Airlines', hubs: ['IST'] },
  ET: { code: 'ET', name: 'Ethiopian Airlines', hubs: ['ADD'] },
  FZ: { code: 'FZ', name: 'flydubai', hubs: ['DXB'] },
  EK: { code: 'EK', name: 'Emirates', hubs: ['DXB'] },
  QR: { code: 'QR', name: 'Qatar Airways', hubs: ['DOH'] },
  KQ: { code: 'KQ', name: 'Kenya Airways', hubs: ['NBO'] },
  SV: { code: 'SV', name: 'Saudia', hubs: ['JED', 'RUH'] },
  AF: { code: 'AF', name: 'Air France', hubs: ['CDG'] },
  MS: { code: 'MS', name: 'EgyptAir', hubs: ['CAI'] },
  MH: { code: 'MH', name: 'Malaysia Airlines', hubs: ['KUL'] },
  AI: { code: 'AI', name: 'Air India', hubs: ['BOM'] },
  CZ: { code: 'CZ', name: 'China Southern Airlines', hubs: ['CAN'] },
}

/** Liaisons directes fictives au départ de Djibouti (démo). */
export const JIB_DIRECT_ROUTES: Record<string, string[]> = {
  ADD: ['ET'],
  IST: ['TK'],
  DXB: ['FZ'],
  JED: ['SV'],
  CDG: ['AF'],
  DOH: ['QR'],
  NBO: ['KQ'],
  CAI: ['MS'],
}

/** Plaques tournantes utilisées pour composer les vols avec escale. */
export const HUBS = ['ADD', 'IST', 'DXB', 'DOH', 'JED', 'CAI', 'NBO', 'CDG']

export function getAirline(code: string): Airline {
  return AIRLINES[code] ?? { code, name: code, hubs: [] }
}
