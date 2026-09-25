import { useLocation } from 'react-router'
import { PageHero } from '@/components/layout/PageHero'
import { DemoNotice } from '@/components/ui/Misc'
import { INDEPENDENCE_NOTICE, SITE } from '@/config/site'
import { IMAGES } from '@/data/images'
import { useSeo } from '@/hooks/useSeo'

interface LegalContent {
  title: string
  description: string
  sections: { heading: string; body: string[] }[]
}

const TODO = '[À compléter par l’agence]'

const PAGES: Record<string, LegalContent> = {
  '/mentions-legales': {
    title: 'Mentions légales',
    description: 'Éditeur du site, hébergement, propriété intellectuelle et crédits.',
    sections: [
      {
        heading: 'Éditeur du site',
        body: [
          `${SITE.name} — agence de voyage aérien. Responsable de la publication : ${SITE.representative.name}.`,
          `Adresse : ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.country}. Téléphone : ${SITE.phone.display}. Email : ${SITE.email} (adresse fictive).`,
          `Forme juridique, numéro d'immatriculation au registre du commerce de Djibouti et identifiant fiscal : ${TODO}.`,
        ],
      },
      { heading: 'Hébergement', body: ['GitHub Pages — GitHub, Inc., San Francisco, États-Unis.'] },
      {
        heading: 'Propriété intellectuelle',
        body: [
          `Le nom ${SITE.name}, son logo, sa charte graphique et les textes du site sont la propriété de l'agence. Toute reproduction sans autorisation est interdite.`,
          'Photographies : Unsplash (licence Unsplash). Drapeaux : représentations des emblèmes nationaux de Djibouti et de la Turquie.',
          'Les noms de compagnies aériennes cités appartiennent à leurs propriétaires respectifs et sont mentionnés à titre informatif.',
        ],
      },
      { heading: 'Indépendance', body: [INDEPENDENCE_NOTICE] },
    ],
  },
  '/conditions-generales': {
    title: 'Conditions générales',
    description: 'Conditions applicables aux demandes de réservation effectuées via le site.',
    sections: [
      {
        heading: 'Objet',
        body: [
          `Les présentes conditions encadrent l'utilisation du site ${SITE.name} et les demandes de réservation qui y sont formulées. Modèle à faire valider par un professionnel du droit avant publication.`,
        ],
      },
      {
        heading: 'Demandes de réservation',
        body: [
          "Une demande envoyée depuis le site ne constitue ni une réservation ferme, ni l'émission d'un billet. La disponibilité et le tarif sont confirmés par un conseiller avant toute émission.",
          'Les horaires, tarifs et disponibilités affichés sur ce prototype sont des données de démonstration fictives.',
        ],
      },
      {
        heading: 'Prix et paiement',
        body: [
          "Aucun paiement n'est encaissé en ligne à ce stade. Les modalités de règlement sont communiquées par l'agence lors de la confirmation.",
          `Frais de service de l'agence : ${TODO}.`,
        ],
      },
      {
        heading: 'Modification et annulation',
        body: [
          "Les conditions de modification, d'annulation et de remboursement dépendent du tarif et de la compagnie aérienne opérant le vol. Elles sont précisées avant toute confirmation.",
        ],
      },
      {
        heading: 'Formalités',
        body: ['Le voyageur est responsable de la validité de ses documents de voyage (passeport, visas, certificats sanitaires). L’agence peut l’accompagner dans ses démarches.'],
      },
    ],
  },
  '/politique-de-confidentialite': {
    title: 'Politique de confidentialité',
    description: 'Données collectées, finalités, conservation et droits des utilisateurs.',
    sections: [
      {
        heading: 'Données collectées',
        body: [
          'Formulaires de contact, de réservation et de compte : identité, coordonnées, informations de voyage nécessaires au traitement de votre demande.',
          'Prototype : ces données sont enregistrées uniquement dans le stockage local de votre navigateur (aucun envoi vers un serveur).',
        ],
      },
      {
        heading: 'Finalités',
        body: ['Traiter vos demandes de réservation et de contact, gérer votre espace client et vous informer sur vos voyages.'],
      },
      {
        heading: 'Conservation et sécurité',
        body: [`Durées de conservation, sous-traitants et mesures de sécurité : ${TODO} (à définir avec la mise en place du backend).`],
      },
      {
        heading: 'Vos droits',
        body: [
          `Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à ${SITE.email} (adresse fictive) ou en appelant le ${SITE.phone.display}.`,
          'Vous pouvez à tout moment effacer les données du prototype en vidant le stockage local de votre navigateur pour ce site.',
        ],
      },
      {
        heading: 'Services tiers',
        body: ['Les photographies sont servies par le CDN d’Unsplash et la carte par OpenStreetMap : ces services reçoivent votre adresse IP lors du chargement.'],
      },
    ],
  },
}

export default function LegalPage() {
  const { pathname } = useLocation()
  const page = PAGES[pathname] ?? PAGES['/mentions-legales']
  useSeo({ title: page.title, description: page.description })

  return (
    <>
      <PageHero title={page.title} description={page.description} image={IMAGES.calmSky} breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: page.title }]} />
      <div className="bg-ivory py-16 sm:py-20">
        <article className="container-page max-w-3xl">
          <DemoNotice className="mb-10">Document modèle : les mentions « {TODO} » doivent être complétées et le texte validé avant la mise en ligne.</DemoNotice>
          <div className="space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-3xl text-night-900">{section.heading}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-night-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-12 text-sm text-night-500">Dernière mise à jour : {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())}.</p>
        </article>
      </div>
    </>
  )
}
