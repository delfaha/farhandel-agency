import { BedDouble, BriefcaseBusiness, CarFront, Compass, HeartHandshake, LifeBuoy, Luggage, ShieldCheck, Ticket } from 'lucide-react'
import type { ServiceItem } from '@/types/content'

export const SERVICES: ServiceItem[] = [
  {
    id: 'billets',
    icon: Ticket,
    title: 'Réservation de billets',
    description: 'Vols simples, aller-retour ou multidestinations : nous comparons les meilleures options pour votre budget et vos horaires.',
    points: ['Toutes classes de voyage', 'Itinéraires multi-escales', 'Modifications accompagnées'],
  },
  {
    id: 'assistance-voyage',
    icon: LifeBuoy,
    title: 'Assistance voyage',
    description: 'Un imprévu avant ou pendant le voyage ? Un conseiller vous répond et trouve la solution avec la compagnie.',
    points: ['Retards et annulations', 'Correspondances manquées', 'Réémission de billets'],
  },
  {
    id: 'hotels',
    icon: BedDouble,
    title: 'Hôtels',
    description: 'Une sélection d’hébergements testés et adaptés à chaque séjour : affaires, famille, pèlerinage ou détente.',
    points: ['Hôtels sélectionnés', 'Tarifs négociés sur devis', 'Proches des lieux clés'],
  },
  {
    id: 'transferts',
    icon: CarFront,
    title: 'Transferts',
    description: 'Accueil à l’arrivée et trajets aéroport–hôtel organisés à l’avance, pour arriver l’esprit tranquille.',
    points: ['Chauffeurs partenaires', 'Suivi des horaires de vol', 'Véhicules adaptés aux groupes'],
  },
  {
    id: 'assurance',
    icon: ShieldCheck,
    title: 'Assurance voyage',
    description: 'Annulation, frais médicaux, bagages : nous vous orientons vers la couverture adaptée à votre destination.',
    points: ['Conseils de couverture', 'Formalités visa facilitées', 'Assistance rapatriement'],
  },
  {
    id: 'bagages',
    icon: Luggage,
    title: 'Bagages',
    description: 'Franchises, excédents, équipements spéciaux : nous vérifions les règles de chaque compagnie pour vous.',
    points: ['Bagages supplémentaires', 'Équipements sportifs', 'Objets fragiles ou volumineux'],
  },
  {
    id: 'affaires',
    icon: BriefcaseBusiness,
    title: "Voyages d'affaires",
    description: 'Des déplacements professionnels optimisés : horaires flexibles, facturation claire et interlocuteur unique.',
    points: ['Comptes entreprises', 'Réservations de dernière minute', 'Rapports de déplacements'],
  },
  {
    id: 'assistance-personnalisee',
    icon: HeartHandshake,
    title: 'Assistance personnalisée',
    description: 'Voyageurs à mobilité réduite, enfants non accompagnés, personnes âgées : un accompagnement attentif.',
    points: ['Assistance aéroport', 'Mineurs non accompagnés', 'Besoins médicaux'],
  },
  {
    id: 'conseils',
    icon: Compass,
    title: 'Conseils de voyage',
    description: 'Visas, santé, météo, budget : profitez de notre expérience du secteur aérien pour préparer chaque détail.',
    points: ['Formalités et visas', 'Meilleures périodes', 'Itinéraires sur mesure'],
  },
]
