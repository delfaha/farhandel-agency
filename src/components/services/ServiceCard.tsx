import { Check } from 'lucide-react'
import type { ServiceItem } from '@/types/content'
import { cn } from '@/utils/cn'

/** Carte service : icône, titre, description ; animation au survol (élévation, icône, filet doré). */
export function ServiceCard({ service, index, showPoints = true, className }: { service: ServiceItem; index?: number; showPoints?: boolean; className?: string }) {
  const Icon = service.icon
  return (
    <article
      id={service.id}
      className={cn(
        'group relative flex h-full scroll-mt-32 flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-7 transition duration-500 ease-premium hover:-translate-y-1.5 hover:border-transparent hover:shadow-float',
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-x-7 top-0 h-[3px] origin-left scale-x-0 rounded-b-full bg-gradient-to-r from-sand-300 to-sand-500 transition-transform duration-500 ease-premium group-hover:scale-x-100" />
      <div className="flex items-start justify-between">
        <span className="grid size-14 place-items-center rounded-2xl bg-night-900 text-sand-300 transition duration-500 ease-premium group-hover:rotate-[-6deg] group-hover:scale-105 group-hover:bg-sand-400 group-hover:text-night-950">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        {index !== undefined && <span className="font-display text-3xl text-night-100 transition-colors duration-500 group-hover:text-sand-300">{String(index + 1).padStart(2, '0')}</span>}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-night-900">{service.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-night-600">{service.description}</p>
      {showPoints && (
        <ul className="mt-5 space-y-2 border-t border-line pt-5">
          {service.points.map((point) => (
            <li key={point} className="flex items-center gap-2.5 text-sm text-night-700">
              <Check aria-hidden="true" className="size-4 shrink-0 text-sand-600" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
