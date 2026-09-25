/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL publique du site, utilisée pour les URL canoniques et les données structurées. */
  readonly VITE_SITE_URL?: string
  /** URL de base de l'API backend (future). */
  readonly VITE_API_URL?: string
  /** « false » pour utiliser l'API HTTP au lieu des données de démonstration. */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
