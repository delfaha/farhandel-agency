import type { ImageRef } from '@/types/content'

/**
 * Photographies Unsplash (licence Unsplash : usage commercial autorisé, sans attribution obligatoire).
 * Servies par le CDN d'Unsplash au format et à la taille demandés (AVIF/WebP automatiques).
 * Pour la production, elles peuvent être remplacées par des photos propres à l'agence.
 */
export const IMAGES = {
  heroSky: { id: '1516907450399-41d50409e739', alt: "Mer de nuages au coucher du soleil, vue depuis l'altitude de croisière", position: '50% 60%' },
  authSky: { id: '1560773526-435221de2527', alt: 'Lever de soleil rose au-dessus d’une mer de nuages', position: '50% 50%' },
  calmSky: { id: '1517094857443-80776ddd155c', alt: 'Ciel pastel au-dessus des nuages', position: '50% 70%' },
  dramaticSky: { id: '1515253749616-f279444344a4', alt: 'Coucher de soleil flamboyant sur les nuages', position: '50% 55%' },
  duskSky: { id: '1475727946784-2890c8fdb9c8', alt: 'Soleil orangé perçant les nuages', position: '50% 50%' },
  wingSunset: { id: '1729350038150-495c628bd695', alt: "Aile d'avion au coucher du soleil", position: '50% 50%' },
  wingClouds: { id: '1715262437769-d5a52db0d1dd', alt: "Aile d'avion au-dessus des nuages", position: '50% 60%' },
  wingBlue: { id: '1719472196370-1b7eda2cf61f', alt: "Aile d'avion dans un ciel bleu profond", position: '50% 50%' },
  wingWhite: { id: '1529947327457-8f5cb53bc1b6', alt: "Aile blanche d'un avion en vol", position: '50% 50%' },
  windowView: { id: '1487253031786-9989fcd7bb73', alt: "Vue sur l'aile depuis le hublot d'un avion", position: '50% 50%' },
  cabinWindow: { id: '1542776488-a3bbacfcdccd', alt: "Hublot d'avion baigné de lumière dorée", position: '50% 50%' },
  tarmac: { id: '1697455621941-799078c8eaba', alt: 'Avion de ligne sur le tarmac, vu de face', position: '50% 55%' },
} satisfies Record<string, ImageRef>

const WIDTHS = [480, 768, 1080, 1440, 1920]

/** URL Unsplash optimisée (format automatique, recadrage, qualité). */
export function imageUrl(id: string, width: number, height?: number, quality = 72): string {
  const size = height ? `&w=${width}&h=${height}` : `&w=${width}`
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop${size}&q=${quality}`
}

/** srcset responsive ; `ratio` = hauteur / largeur (ex. 0.75 pour 4:3). */
export function imageSrcSet(id: string, ratio?: number, maxWidth = 1920): string {
  return WIDTHS.filter((width) => width <= maxWidth)
    .map((width) => `${imageUrl(id, width, ratio ? Math.round(width * ratio) : undefined)} ${width}w`)
    .join(', ')
}
