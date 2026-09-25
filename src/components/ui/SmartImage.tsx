import { Plane } from 'lucide-react'
import { useCallback, useState } from 'react'
import { imageSrcSet, imageUrl } from '@/data/images'
import type { ImageRef } from '@/types/content'
import { cn } from '@/utils/cn'

interface SmartImageProps {
  image: ImageRef
  /** Largeurs d'affichage (attribut sizes). */
  sizes: string
  /** Rapport hauteur / largeur pour le recadrage serveur (ex. 1.25 pour 4:5). */
  ratio?: number
  maxWidth?: number
  priority?: boolean
  className?: string
  imgClassName?: string
}

/**
 * Photographie responsive : srcset optimisé, chargement différé, apparition en fondu
 * et repli élégant si l'image ne peut pas être chargée (hors ligne…).
 */
export function SmartImage({ image, sizes, ratio, maxWidth = 1920, priority = false, className, imgClassName }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const attach = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true)
  }, [])

  // Positionnement : « relative » par défaut, sauf si l'appelant fournit déjà absolute / fixed.
  const positioned = /(^|\s)(absolute|fixed)(\s|$)/.test(className ?? '')
  return (
    <div className={cn(!positioned && 'relative', 'overflow-hidden bg-night-800', className)}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--color-night-600),var(--color-night-950))]">
          <Plane aria-hidden="true" className="size-10 text-white/25" />
          <span className="sr-only">{image.alt}</span>
        </div>
      ) : (
        <img
          ref={attach}
          src={imageUrl(image.id, 1080, ratio ? Math.round(1080 * ratio) : undefined)}
          srcSet={imageSrcSet(image.id, ratio, maxWidth)}
          sizes={sizes}
          alt={image.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ objectPosition: image.position }}
          className={cn(
            'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-premium',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
