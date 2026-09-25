import { BadgeCheck, Clock, FileText, Luggage } from 'lucide-react'
import { CheckIn } from '@/components/booking/CheckIn'
import { PageHero } from '@/components/layout/PageHero'
import { Stagger, StaggerItem } from '@/components/ui/Motion'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'

const TIPS = [
  { icon: Clock, title: 'Quand ?', text: "L'enregistrement en ligne ouvre généralement 24 à 48 h avant le départ, selon la compagnie." },
  { icon: FileText, title: 'Documents', text: 'Passeport valide, visa si nécessaire et numéro de réservation à portée de main.' },
  { icon: Luggage, title: 'Bagages', text: 'Vérifiez votre franchise dans « Gérer ma réservation » et déposez vos bagages au comptoir.' },
  { icon: BadgeCheck, title: 'À l’aéroport', text: 'Présentez-vous au moins 3 h avant un vol international, 2 h pour un vol régional.' },
]

export default function CheckInPage() {
  useSeo({
    title: 'Check-in',
    description: "Préparez l'enregistrement de votre vol avec FarhanDel Agency : conseils, horaires et accompagnement. Check-in en ligne bientôt connecté.",
  })

  return (
    <>
      <PageHero
        eyebrow="Check-in"
        title={
          <>
            Prêt pour <em>l'embarquement</em>
          </>
        }
        description="Retrouvez votre réservation et préparez votre enregistrement : nous vous guidons jusqu'à la porte d'embarquement."
        image={IMAGES.tarmac}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Check-in' }]}
      />
      <div className="bg-ivory pb-24">
        <div className="container-page relative z-10 -mt-10 sm:-mt-12">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-float ring-1 ring-night-900/5 sm:p-7">
            <CheckIn />
          </div>
        </div>
        <div className="container-page mt-14">
          <h2 className="font-display text-3xl text-night-900">Bon à savoir</h2>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map((tip) => (
              <StaggerItem key={tip.title} className="rounded-3xl border border-line bg-white p-6">
                <tip.icon aria-hidden="true" className="size-6 text-sand-600" />
                <h3 className="mt-4 font-semibold text-night-900">{tip.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-night-600">{tip.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </>
  )
}
