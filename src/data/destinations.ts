import type { Destination } from '@/types/content'
import type { Region } from '@/types/flight'

/** Destinations de démonstration (textes originaux FarhanDel Agency, prix indicatifs fictifs). */
export const DESTINATIONS: Destination[] = [
  {
    slug: 'djibouti',
    city: 'Djibouti',
    country: 'Djibouti',
    airport: 'JIB',
    airportName: 'Aéroport international de Djibouti–Ambouli',
    region: 'afrique',
    image: { id: '1544704325-8c4f82787278', alt: 'Cheminée calcaire dressée dans un paysage désertique de Djibouti', position: '50% 60%' },
    description:
      'Notre base, entre mer Rouge et golfe de Tadjourah : lacs salés, paysages volcaniques et fonds marins parmi les plus riches de la région.',
    highlights: ['Lac Assal', 'Lac Abbé', 'Îles Moucha'],
    priceFrom: 'IST',
    featured: true,
  },
  {
    slug: 'addis-abeba',
    city: 'Addis-Abeba',
    country: 'Éthiopie',
    airport: 'ADD',
    airportName: 'Aéroport international de Bole',
    region: 'afrique',
    image: { id: '1624314138470-5a2f24623f10', alt: "Plan d'eau et immeubles modernes d'Addis-Abeba", position: '50% 55%' },
    description:
      "Capitale de l'Éthiopie et grand carrefour aérien africain, à un peu plus d'une heure de vol : cafés historiques, musées et marché du Merkato.",
    highlights: ['Musée national', 'Merkato', 'Mont Entoto'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    airport: 'NBO',
    airportName: 'Aéroport international Jomo Kenyatta',
    region: 'afrique',
    image: { id: '1634662101368-fa8021773862', alt: 'Girafe dans le parc national de Nairobi, gratte-ciel en arrière-plan', position: '50% 45%' },
    description:
      'Un safari aux portes de la ville, puis le Masai Mara ou la côte kényane : Nairobi est la porte d’entrée idéale vers l’Afrique de l’Est.',
    highlights: ['Parc national', 'Karen Blixen', 'Masai Mara'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'dubai',
    city: 'Dubai',
    country: 'Émirats arabes unis',
    airport: 'DXB',
    airportName: 'Aéroport international de Dubaï',
    region: 'moyen-orient',
    image: { id: '1607414851776-f2fcc379fb48', alt: 'Skyline de Dubai au coucher du soleil, vue depuis la mer', position: '55% 50%' },
    description:
      'Affaires, shopping et escales vers l’Asie : la ville-carrefour du Golfe, entre tours vertigineuses, souks et plages.',
    highlights: ['Burj Khalifa', 'Vieux Dubai', 'Désert'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'doha',
    city: 'Doha',
    country: 'Qatar',
    airport: 'DOH',
    airportName: 'Aéroport international Hamad',
    region: 'moyen-orient',
    image: { id: '1669300884869-e6e11c67c031', alt: "Boutres traditionnels près du musée d'Art islamique de Doha", position: '50% 55%' },
    description:
      "Corniche, souq Waqif et musée d'Art islamique : une escale raffinée au cœur du Golfe, idéale pour un stop-over.",
    highlights: ["Musée d'Art islamique", 'Souq Waqif', 'Corniche'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'jeddah',
    city: 'Jeddah',
    country: 'Arabie saoudite',
    airport: 'JED',
    airportName: 'Aéroport international Roi-Abdelaziz',
    region: 'moyen-orient',
    image: { id: '1586715065342-98d1f6016fd1', alt: 'Mosquée blanche au bord de la mer Rouge à Jeddah', position: '50% 50%' },
    description:
      'Porte des lieux saints et ville historique d’Al-Balad : Jeddah allie ferveur, patrimoine et front de mer sur la mer Rouge.',
    highlights: ['Al-Balad', 'Corniche', 'Omra'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'istanbul',
    city: 'Istanbul',
    country: 'Turquie',
    airport: 'IST',
    airportName: "Aéroport d'Istanbul",
    region: 'europe',
    image: { id: '1564407727371-3eece6c58961', alt: 'Mosquée au bord du Bosphore et pont suspendu à Istanbul', position: '50% 60%' },
    description:
      "Entre Europe et Asie, le Bosphore, Sainte-Sophie et le Grand Bazar — et l'un des plus grands hubs aériens du monde pour rayonner partout.",
    highlights: ['Bosphore', 'Sainte-Sophie', 'Grand Bazar'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'paris',
    city: 'Paris',
    country: 'France',
    airport: 'CDG',
    airportName: 'Aéroport Paris-Charles de Gaulle',
    region: 'europe',
    image: { id: '1502602898657-3e91760cbb34', alt: 'Tour Eiffel et la Seine au crépuscule, à Paris', position: '50% 45%' },
    description:
      'Musées, gastronomie et élégance : la capitale française, point de départ vers toute l’Europe pour les études, les affaires ou le plaisir.',
    highlights: ['Tour Eiffel', 'Louvre', 'Montmartre'],
    priceFrom: 'JIB',
    featured: true,
  },
  {
    slug: 'kuala-lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaisie',
    airport: 'KUL',
    airportName: 'Aéroport international de Kuala Lumpur',
    region: 'asie',
    image: { id: '1602427384420-71c70e2b2a2f', alt: 'Tours Petronas et gratte-ciel de Kuala Lumpur', position: '50% 50%' },
    description:
      'Tours Petronas, cuisine de rue et nature tropicale : une porte d’entrée accueillante vers l’Asie du Sud-Est.',
    highlights: ['Tours Petronas', 'Batu Caves', 'Cuisine de rue'],
    priceFrom: 'JIB',
  },
  {
    slug: 'mumbai',
    city: 'Mumbai',
    country: 'Inde',
    airport: 'BOM',
    airportName: 'Aéroport international Chhatrapati Shivaji Maharaj',
    region: 'asie',
    image: { id: '1595658658481-d53d3f999875', alt: 'Gateway of India au bord de la mer à Mumbai', position: '50% 50%' },
    description:
      'Gateway of India, Marine Drive et énergie bouillonnante : la capitale économique indienne, pour les affaires comme pour la découverte.',
    highlights: ['Gateway of India', 'Marine Drive', 'Colaba'],
    priceFrom: 'JIB',
  },
  {
    slug: 'guangzhou',
    city: 'Guangzhou',
    country: 'Chine',
    airport: 'CAN',
    airportName: 'Aéroport international de Guangzhou-Baiyun',
    region: 'asie',
    image: { id: '1630831241310-3984f1b3d711', alt: 'Skyline illuminée de Guangzhou au crépuscule', position: '50% 50%' },
    description:
      'Grand pôle commercial du sud de la Chine : salons professionnels, sourcing et gastronomie cantonaise.',
    highlights: ['Foire de Canton', 'Tour de Canton', 'Rivière des Perles'],
    priceFrom: 'JIB',
  },
]

export const DESTINATION_REGIONS: Region[] = ['afrique', 'moyen-orient', 'europe', 'asie']

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((destination) => destination.slug === slug)
}

export const FEATURED_DESTINATIONS = DESTINATIONS.filter((destination) => destination.featured)
