# FarhanDel Agency — Travel to the World

**Site en ligne : https://delfaha.github.io/farhandel-agency/**

Site web de l'agence de voyage aérien **FarhanDel Agency** (Djibouti) : réservation de vols, gestion de réservation,
check-in, statut des vols, destinations, offres, services, espace client.
*Your Journey Begins Here. — From Djibouti to the World.*

> **Prototype fonctionnel** : toutes les données de vols, prix, disponibilités et statuts sont **fictives**
> (générées localement). Aucune transaction bancaire n'est simulée et aucun check-in réel n'est effectué.

## Démarrage rapide

Prérequis : **Node.js ≥ 22.18** (testé avec Node 24 LTS) et npm.

```bash
npm install          # installe les dépendances
npm run dev          # serveur de développement → http://localhost:5173
npm run build        # vérification TypeScript + build de production dans dist/
npm run preview      # sert le build de production localement
npm run typecheck    # vérification TypeScript seule
npm run lint         # oxlint (React, hooks, accessibilité jsx-a11y)
npm run sitemap      # régénère public/sitemap.xml (SITE_URL=https://mondomaine.dj npm run sitemap)
npm run assets       # régénère og-image.png et les icônes (sharp)
```

### Données de démonstration

| Élément | Valeur |
| --- | --- |
| Compte client | `demo@farhandel-agency.example` / `Demo2026!` (bouton « Se connecter avec le compte démo ») |
| Réservation (Gérer / Check-in) | `FLS7K2` + nom `ABDI` |
| Statuts de vol (aujourd'hui) | `TK 686` en vol · `FZ 624` embarquement · `ET 453` retardé · `QR 1394` à l'heure · `AF 574` arrivé · `SV 490` annulé |

Les comptes créés, demandes de réservation, messages et préférences sont stockés **uniquement dans le navigateur**
(`localStorage`, préfixe `farhandel:`). Pour tout réinitialiser : vider le stockage du site dans le navigateur.

## Technologies

- **React 19** + **TypeScript** (strict) — **Vite 8**
- **Tailwind CSS 4** (design system en tokens CSS dans `src/index.css`)
- **Framer Motion** (animations, transitions de pages, `prefers-reduced-motion` respecté)
- **React Router 8** (routes découpées en chunks, chargement différé)
- **Lucide** (icônes), polices auto-hébergées (**Plus Jakarta Sans**, **Instrument Serif** via Fontsource)
- **oxlint** (qualité + accessibilité), **sharp** (génération des visuels Open Graph)

## Structure du projet

```
farhandel-agency/
├── index.html                 # SEO : title, meta, Open Graph, Twitter, JSON-LD TravelAgency
├── public/                    # favicon, og-image, icônes, robots.txt, sitemap.xml, manifest
├── scripts/                   # generate-sitemap.ts, generate-assets.mjs
└── src/
    ├── main.tsx / App.tsx / router.tsx
    ├── index.css              # Design system « Nuit & Sable » + animations CSS (drapeaux, avion, nuages)
    ├── config/site.ts         # Coordonnées de l'agence, mentions d'indépendance et de démonstration
    ├── types/                 # flight, booking, user, content
    ├── data/                  # aéroports, compagnies, destinations, offres, services, photos, libellés, navigation
    ├── services/              # couche API : interface + implémentation démo + implémentation HTTP
    │   ├── api/client.ts      # client fetch (VITE_API_URL, jeton, erreurs)
    │   ├── flightService.ts   # recherche, calendrier des prix, statut des vols
    │   ├── bookingService.ts  # consultation, demandes de réservation, services additionnels
    │   ├── authService.ts     # connexion, inscription, profil, mot de passe oublié
    │   ├── notificationService.ts
    │   ├── supportService.ts  # contact, check-in (non connecté), paiement (point d'extension)
    │   └── mock/              # générateur de vols fictifs, statuts simulés, données démo, stockage local
    ├── context/               # AuthProvider, ToastProvider
    ├── hooks/                 # useSeo, useAsync, useFocusTrap, useDom (scroll lock, media query, Échap…)
    ├── utils/                 # dates, formats, validation, recherche (URL ↔ formulaire), récapitulatif HTML
    ├── components/
    │   ├── brand/             # Logo, drapeaux en tissu (WavingFlag), Airliner (avion SVG)
    │   ├── layout/            # Header, MobileMenu, Footer, PageHero, QuickContact, RootLayout
    │   ├── ui/                # Button, Field (inputs), Badge, Modal, Toaster, LoadingState, Carousel, Motion…
    │   ├── home/              # Hero (+ FlagsGreeting, HeroSky/HeroPlane), ExperienceSection,
    │   │                      # DjiboutiTurkeySection, sections d'accueil, bandeau défilant
    │   ├── booking/           # FlightDashboard, FlightSearch, SearchFields, BookingSearch, ManageBooking,
    │   │                      # CheckIn, FlightStatus, FlightResults, BookingForm (+ PassengerForm), confirmation
    │   ├── destinations/      # DestinationCard, DestinationCarousel
    │   ├── offers/            # OfferCard, OfferModal, OfferCarousel
    │   ├── services/          # ServiceCard
    │   ├── auth/              # AuthLayout, LoginForm, RegisterForm
    │   ├── account/           # ReservationCard, NextTripCard, données de l'espace client
    │   └── contact/           # ContactForm
    └── pages/                 # une page par route (+ account/ pour l'espace client)
```

### Routes

| URL | Page |
| --- | --- |
| `/` | Accueil (Hero Djibouti × Turquie, dashboard de réservation 4 onglets, sections) |
| `/reserver` | Recherche → résultats → passagers → confirmation (étapes dans l'URL) |
| `/destinations`, `/offres`, `/services`, `/a-propos`, `/contact` | Pages de contenu |
| `/statut-vol`, `/ma-reservation`, `/check-in` | Services voyageurs |
| `/connexion`, `/inscription` | Authentification |
| `/espace-client` (+ `/reservations`, `/historique`, `/profil`, `/bagages`, `/services`, `/notifications`) | Espace client protégé |
| `/conditions-generales`, `/politique-de-confidentialite`, `/mentions-legales` | Pages légales (modèles) |
| `/design-system` | Design system vivant : couleurs, typographies, rayons, ombres, boutons, champs, badges, cartes, modales, toasts, animations (non indexé) |

## Connecter une vraie API

Chaque service expose une **interface TypeScript** et deux implémentations : démonstration (actuelle) et HTTP.
Il suffit de définir dans `.env.local` :

```bash
VITE_API_URL=https://api.mondomaine.dj
VITE_USE_MOCKS=false
```

Endpoints attendus par l'implémentation HTTP (à adapter au backend) :

| Service | Endpoints |
| --- | --- |
| Vols (GDS / NDC, ex. Amadeus, Sabre, Travelport, Duffel) | `POST /flights/search`, `POST /flights/fare-calendar`, `GET /flights/status?flightNumber&date` |
| Réservations | `POST /bookings/lookup`, `GET /bookings/:pnr`, `GET /me/bookings`, `POST /bookings/requests`, `POST /bookings/:pnr/services` |
| Authentification | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `PATCH /me`, `POST /auth/password-reset` |
| Notifications | `GET /me/notifications`, `POST /me/notifications/read`, `POST /me/notifications/read-all` |
| Contact / check-in | `POST /contact`, `POST /check-in/start` |
| Paiement | `PaymentService.createCheckoutSession()` — point d'extension volontairement non implémenté |

## Données fictives

Site de démonstration : tout est centralisé dans `src/config/site.ts` et `index.html` (données structurées).

- **Responsable** : Farhan MED Waiss ; rôle et parcours affichés (Senior Agent, 15+ ans) : données de démonstration.
- **Téléphone / WhatsApp** : `+253 01 23 45 67`, numéro non attribuable (les numéros de Djibouti commencent par 2 ou 7).
- **Email** : `contact@farhandel-agency.example` (domaine réservé `.example`) ; **adresse** : centre-ville de Djibouti ;
  **horaires** non renseignés.
- Pages légales : mentions « [À compléter par l'agence] » (registre du commerce, frais de service…) — textes modèles.
- Photos : servies par le CDN Unsplash (licence Unsplash), à remplacer par des photos propres (`src/data/images.ts`).

## Identité, marques et conformité

- Identité originale « Nuit & Sable » (bleu nuit, sable doré, ivoire) : aucun logo, texte, code ou visuel de compagnie repris.
- L'avion du Hero est un dessin original aux couleurs rouge et blanc évoquant Turkish Airlines, **sans logo ni inscription**.
- Un avis d'indépendance vis-à-vis des compagnies aériennes figure dans le pied de page, « À propos » et les mentions légales.
- Prix, horaires, disponibilités et statuts : **données de démonstration** signalées partout où elles apparaissent.

## Mise en ligne (GitHub Pages)

Chaque envoi sur la branche `main` déclenche `.github/workflows/deploy.yml` : build dans le sous-dossier
`/farhandel-agency/` (variable `BASE_PATH`, reprise par le routeur), sitemap régénéré, copie de `index.html` en
`404.html` pour les URL profondes, puis publication de `dist/`. Suivi : onglet **Actions** du dépôt.
Sans `BASE_PATH`, le site est construit pour la racine d'un domaine (Netlify, Vercel, Nginx…).

## Accessibilité, SEO, performance

- Navigation clavier complète (onglets du dashboard aux flèches, combobox ARIA des aéroports, modales avec piège de focus,
  menus fermés par Échap), lien d'évitement, focus visible, libellés et messages d'erreur reliés (`aria-describedby`),
  contrastes AA, textes alternatifs, `prefers-reduced-motion` (animations CSS coupées, Framer Motion en mode réduit).
- SEO : titre / description / canonical / Open Graph par page, H1 unique, URL propres en français, `sitemap.xml`,
  `robots.txt`, données structurées `TravelAgency`.
- Performance : code découpé par page, polices auto-hébergées, images responsive (`srcset`, AVIF/WebP, lazy loading),
  animations du Hero en CSS (compositeur) mises en pause hors écran, version allégée sur mobile.
