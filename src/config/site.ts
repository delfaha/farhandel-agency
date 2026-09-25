/**
 * Informations de l'agence.
 * Site de démonstration : téléphone, email, adresse et parcours du responsable sont FICTIFS
 * (voir README, section « Données fictives »).
 */
export const SITE = {
  name: 'FarhanDel Agency',
  slogan: 'Travel to the World',
  signature: 'Your Journey Begins Here.',
  signatureFr: 'Votre voyage commence ici.',
  motto: 'From Djibouti to the World.',
  connecting: 'Connecting Djibouti to the World.',
  description:
    "FarhanDel Agency, agence de voyage aérien à Djibouti : réservation de billets d'avion, destinations, offres, check-in et statut des vols. 15+ ans d'expérience dans le secteur aérien.",
  /** Nom réel ; rôle, parcours et années d'expérience affichés : données de démonstration. */
  representative: {
    name: 'Farhan MED Waiss',
    initials: 'FW',
    role: "Responsable de l'agence",
    experience: 'Senior Agent — Aviation',
    years: 15,
  },
  /** FICTIF : numéro non attribuable (les numéros de Djibouti commencent par 2 ou 7). */
  phone: {
    display: '+253 01 23 45 67',
    e164: '+25301234567',
  },
  /** FICTIF : numéro WhatsApp (format international sans « + »). */
  whatsapp: '25301234567',
  /** FICTIF : domaine réservé .example. */
  email: 'contact@farhandel-agency.example',
  address: {
    street: 'Centre-ville',
    city: 'Djibouti',
    country: 'République de Djibouti',
  },
  /** Position indicative du centre-ville de Djibouti. */
  coordinates: { lat: 11.5946, lng: 43.1478 },
  /** TEMPORAIRE : horaires d'ouverture non communiqués. */
  hours: 'Horaires à confirmer',
  locale: 'fr_FR',
  currency: 'DJF',
  since: 2026,
} as const

/** Mention d'indépendance vis-à-vis des compagnies aériennes (affichée dans le pied de page et « À propos »). */
export const INDEPENDENCE_NOTICE =
  "FarhanDel Agency est une agence de voyage indépendante. Elle n'est ni une filiale ni une agence officielle de Turkish Airlines ou de toute autre compagnie aérienne. Les noms de compagnies sont cités à titre informatif."

export const DEMO_NOTICE =
  "Site de démonstration : coordonnées, parcours, horaires, disponibilités et prix affichés sont fictifs et non contractuels. Aucune demande n'est réellement transmise."

/** URL publique du site (VITE_SITE_URL en production, origine courante + chemin de base sinon). */
export function siteUrl(path = ''): string {
  const base = import.meta.env.VITE_SITE_URL || window.location.origin + import.meta.env.BASE_URL
  return `${base.replace(/\/$/, '')}${path}`
}

export const contactLinks = {
  tel: `tel:${SITE.phone.e164}`,
  whatsapp: (text?: string) =>
    `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  email: (subject?: string) => `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`,
  maps: `https://www.openstreetmap.org/?mlat=${SITE.coordinates.lat}&mlon=${SITE.coordinates.lng}#map=16/${SITE.coordinates.lat}/${SITE.coordinates.lng}`,
  directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.address.street}, ${SITE.address.city}`)}`,
}
