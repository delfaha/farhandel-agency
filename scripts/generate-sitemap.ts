/**
 * Génère public/sitemap.xml (pages publiques indexables).
 * Usage : npm run sitemap   (domaine : variable SITE_URL, ex. SITE_URL=https://www.mondomaine.dj)
 * Exécuté directement par Node (≥ 22.18) grâce au retrait natif des types TypeScript.
 */
import { writeFileSync } from 'node:fs'

const base = (process.env.SITE_URL ?? 'https://delfaha.github.io/farhandel-agency').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

const entries: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/reserver', priority: '0.9', changefreq: 'weekly' },
  { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
  { path: '/offres', priority: '0.9', changefreq: 'daily' },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/a-propos', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/statut-vol', priority: '0.6', changefreq: 'monthly' },
  { path: '/ma-reservation', priority: '0.6', changefreq: 'monthly' },
  { path: '/check-in', priority: '0.6', changefreq: 'monthly' },
  { path: '/conditions-generales', priority: '0.3', changefreq: 'yearly' },
  { path: '/politique-de-confidentialite', priority: '0.3', changefreq: 'yearly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url>\n    <loc>${base}${entry.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml généré : ${entries.length} URL (${base})`)
