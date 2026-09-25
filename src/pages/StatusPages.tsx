import { motion } from 'framer-motion'
import { ArrowLeft, Compass, Home, Plane, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'

function StatusLayout({ code, title, text, children }: { code: string; title: string; text: string; children: ReactNode }) {
  return (
    <section className="on-dark relative isolate flex min-h-dvh items-center overflow-hidden bg-night-950 py-32 text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SmartImage image={IMAGES.duskSky} sizes="100vw" className="size-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/80 via-night-950/50 to-night-950" />
      </div>
      <div className="container-page text-center">
        <motion.div initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <Plane aria-hidden="true" className="mx-auto size-10 rotate-45 text-sand-300" />
        </motion.div>
        <p className="mt-6 font-display text-[7rem] leading-none text-white/90 sm:text-[10rem]">{code}</p>
        <h1 className="mt-2 font-display text-h2">{title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-lead text-white/70">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  )
}

export default function NotFoundPage() {
  useSeo({ title: 'Page introuvable', noindex: true })
  return (
    <StatusLayout code="404" title="Cette page a pris un autre vol" text="La page demandée n'existe pas ou a été déplacée. Reprenons la route ensemble.">
      <ButtonLink to="/" iconLeft={<Home className="size-4" aria-hidden="true" />}>
        Retour à l'accueil
      </ButtonLink>
      <ButtonLink to="/destinations" variant="outline-light" iconLeft={<Compass className="size-4" aria-hidden="true" />}>
        Nos destinations
      </ButtonLink>
    </StatusLayout>
  )
}

export function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (notFound) return <NotFoundPage />
  return (
    <StatusLayout code="Oups" title="Une turbulence inattendue" text="Une erreur est survenue lors de l'affichage de cette page. Réessayez dans un instant.">
      <Button onClick={() => window.location.reload()} iconLeft={<RotateCcw className="size-4" aria-hidden="true" />}>
        Recharger la page
      </Button>
      <Button variant="outline-light" onClick={() => window.history.back()} iconLeft={<ArrowLeft className="size-4" aria-hidden="true" />}>
        Page précédente
      </Button>
    </StatusLayout>
  )
}
