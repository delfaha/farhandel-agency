import type { Airport, Region } from '@/types/flight'
import { normalizeText } from '@/utils/format'

/** Aéroports disponibles dans le moteur de recherche (coordonnées approximatives). */
export const AIRPORTS: Airport[] = [
  { code: 'JIB', city: 'Djibouti', name: 'Aéroport international de Djibouti–Ambouli', country: 'Djibouti', region: 'afrique', lat: 11.5473, lng: 43.1595, utcOffset: 3, popular: true },
  { code: 'ADD', city: 'Addis-Abeba', name: 'Aéroport international de Bole', country: 'Éthiopie', region: 'afrique', lat: 8.9779, lng: 38.7993, utcOffset: 3, popular: true },
  { code: 'NBO', city: 'Nairobi', name: 'Aéroport international Jomo Kenyatta', country: 'Kenya', region: 'afrique', lat: -1.3192, lng: 36.9278, utcOffset: 3, popular: true },
  { code: 'MGQ', city: 'Mogadiscio', name: 'Aéroport international Aden Adde', country: 'Somalie', region: 'afrique', lat: 2.0144, lng: 45.3047, utcOffset: 3 },
  { code: 'HGA', city: 'Hargeisa', name: 'Aéroport international Egal', country: 'Somalie', region: 'afrique', lat: 9.5182, lng: 44.0888, utcOffset: 3 },
  { code: 'CAI', city: 'Le Caire', name: 'Aéroport international du Caire', country: 'Égypte', region: 'afrique', lat: 30.1219, lng: 31.4056, utcOffset: 2 },
  { code: 'DAR', city: 'Dar es Salaam', name: 'Aéroport international Julius Nyerere', country: 'Tanzanie', region: 'afrique', lat: -6.8781, lng: 39.2026, utcOffset: 3 },
  { code: 'JNB', city: 'Johannesburg', name: 'Aéroport international O. R. Tambo', country: 'Afrique du Sud', region: 'afrique', lat: -26.1392, lng: 28.246, utcOffset: 2 },
  { code: 'DXB', city: 'Dubai', name: 'Aéroport international de Dubaï', country: 'Émirats arabes unis', region: 'moyen-orient', lat: 25.2532, lng: 55.3657, utcOffset: 4, popular: true },
  { code: 'AUH', city: 'Abou Dabi', name: 'Aéroport international Zayed', country: 'Émirats arabes unis', region: 'moyen-orient', lat: 24.433, lng: 54.6511, utcOffset: 4 },
  { code: 'DOH', city: 'Doha', name: 'Aéroport international Hamad', country: 'Qatar', region: 'moyen-orient', lat: 25.2731, lng: 51.6081, utcOffset: 3, popular: true },
  { code: 'JED', city: 'Jeddah', name: 'Aéroport international Roi-Abdelaziz', country: 'Arabie saoudite', region: 'moyen-orient', lat: 21.6796, lng: 39.1565, utcOffset: 3, popular: true },
  { code: 'MED', city: 'Médine', name: 'Aéroport international Prince-Mohammed-ben-Abdelaziz', country: 'Arabie saoudite', region: 'moyen-orient', lat: 24.5534, lng: 39.7051, utcOffset: 3 },
  { code: 'RUH', city: 'Riyad', name: 'Aéroport international Roi-Khaled', country: 'Arabie saoudite', region: 'moyen-orient', lat: 24.9576, lng: 46.6988, utcOffset: 3 },
  { code: 'IST', city: 'Istanbul', name: "Aéroport d'Istanbul", country: 'Turquie', region: 'europe', lat: 41.2753, lng: 28.7519, utcOffset: 3, popular: true },
  { code: 'CDG', city: 'Paris', name: 'Aéroport Paris-Charles de Gaulle', country: 'France', region: 'europe', lat: 49.0097, lng: 2.5479, utcOffset: 1, popular: true },
  { code: 'LHR', city: 'Londres', name: 'Aéroport de Londres-Heathrow', country: 'Royaume-Uni', region: 'europe', lat: 51.47, lng: -0.4543, utcOffset: 0 },
  { code: 'FRA', city: 'Francfort', name: 'Aéroport de Francfort', country: 'Allemagne', region: 'europe', lat: 50.0379, lng: 8.5622, utcOffset: 1 },
  { code: 'BRU', city: 'Bruxelles', name: 'Aéroport de Bruxelles', country: 'Belgique', region: 'europe', lat: 50.901, lng: 4.4844, utcOffset: 1 },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Aéroport international de Kuala Lumpur', country: 'Malaisie', region: 'asie', lat: 2.7456, lng: 101.7099, utcOffset: 8 },
  { code: 'BOM', city: 'Mumbai', name: 'Aéroport international Chhatrapati Shivaji Maharaj', country: 'Inde', region: 'asie', lat: 19.0896, lng: 72.8656, utcOffset: 5.5 },
  { code: 'CAN', city: 'Guangzhou', name: 'Aéroport international de Guangzhou-Baiyun', country: 'Chine', region: 'asie', lat: 23.3924, lng: 113.2988, utcOffset: 8 },
  { code: 'BKK', city: 'Bangkok', name: 'Aéroport de Bangkok-Suvarnabhumi', country: 'Thaïlande', region: 'asie', lat: 13.69, lng: 100.7501, utcOffset: 7 },
]

const BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]))

export function getAirport(code: string): Airport | undefined {
  return BY_CODE.get(code.toUpperCase())
}

/** Aéroport garanti (lève une erreur explicite si le code est inconnu). */
export function airport(code: string): Airport {
  const found = getAirport(code)
  if (!found) throw new Error(`Aéroport inconnu : ${code}`)
  return found
}

export function airportLabel(code: string): string {
  const found = getAirport(code)
  return found ? `${found.city} (${found.code})` : code
}

export const REGION_LABELS: Record<Region, string> = {
  afrique: 'Afrique',
  'moyen-orient': 'Moyen-Orient',
  europe: 'Europe',
  asie: 'Asie',
}

/** Recherche tolérante (accents, casse) sur la ville, le code, le nom et le pays. */
export function searchAirports(query: string, exclude?: string): Airport[] {
  const q = normalizeText(query)
  const list = AIRPORTS.filter((item) => item.code !== exclude)
  if (!q) return list.filter((item) => item.popular)
  return list
    .map((item) => {
      const code = item.code.toLowerCase()
      const city = normalizeText(item.city)
      let score = 0
      if (code === q) score = 100
      else if (city.startsWith(q)) score = 80
      else if (code.startsWith(q)) score = 70
      else if (city.includes(q)) score = 50
      else if (normalizeText(item.name).includes(q)) score = 30
      else if (normalizeText(item.country).includes(q)) score = 20
      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.city.localeCompare(b.item.city, 'fr'))
    .map((entry) => entry.item)
}

/** Distance orthodromique en kilomètres. */
export function distanceKm(a: string, b: string): number {
  const from = airport(a)
  const to = airport(b)
  const rad = Math.PI / 180
  const dLat = (to.lat - from.lat) * rad
  const dLng = (to.lng - from.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
