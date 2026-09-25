/**
 * Génère les visuels statiques du site à partir de SVG (sharp) :
 * - public/og-image.png (1200×630) pour les partages Open Graph / Twitter ;
 * - public/apple-touch-icon.png (180×180), icon-192.png et icon-512.png (manifeste).
 * Usage : npm run assets
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const flag = (name) =>
  readFileSync(new URL(`../src/assets/flags/${name}.svg`, import.meta.url), 'utf8')
    .replace(/<svg[^>]*>/, '')
    .replace('</svg>', '')

const mark = `
  <defs>
    <linearGradient id="g" x1="8" y1="3" x2="40" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f3e2b8"/><stop offset="0.55" stop-color="#d6ac66"/><stop offset="1" stop-color="#a8793a"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="23" fill="url(#g)"/>
  <circle cx="24" cy="24" r="19.6" fill="none" stroke="#0b1a2e" stroke-opacity="0.16"/>
  <path d="M16.4 35V16.9c0-1.95 1.35-3.4 3.3-3.4h14.4l-2.65 4.7h-10.1v4.5h9.3l-2.55 4.5h-6.75V35z" fill="#0b1a2e"/>
  <path d="M29.6 32.2c3.9-1 6.9-3.5 8.5-6.9" fill="none" stroke="#0b1a2e" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M39.3 22.9l.55 3.55-3.2-1.2z" fill="#0b1a2e"/>`

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060f1d"/><stop offset="1" stop-color="#173052"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#d6ac66" stop-opacity="0.35"/><stop offset="1" stop-color="#d6ac66" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <path d="M760 470 C 860 330, 980 330, 1080 180" fill="none" stroke="#e4c58d" stroke-width="3" stroke-dasharray="4 12" stroke-linecap="round" opacity="0.8"/>
  <svg x="720" y="380" width="180" height="120" viewBox="0 0 900 600">${flag('djibouti')}</svg>
  <svg x="940" y="170" width="180" height="120" viewBox="0 0 900 600">${flag('turkey')}</svg>
  <circle cx="930" cy="330" r="26" fill="#0b1a2e" stroke="#d6ac66" stroke-width="2"/>
  <path d="M941 330 L928 327.8 L924 321 L921.5 321 L924 327.8 L920 328.4 L918.5 325.5 L917 325.5 L918 330 L917 334.5 L918.5 334.5 L920 331.6 L924 332.2 L921.5 339 L924 339 L928 332.2 Z" fill="#efdcb7" transform="rotate(-50 930 330)"/>
  <svg x="80" y="90" width="84" height="84" viewBox="0 0 48 48">${mark}</svg>
  <text x="80" y="290" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="92">FarhanDel Agency</text>
  <text x="84" y="370" fill="#e4c58d" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-style="italic">Travel to the World</text>
  <text x="84" y="440" fill="#c4d0e1" font-family="'Segoe UI', Arial, sans-serif" font-size="28">From Djibouti to the World.</text>
  <text x="84" y="540" fill="#95a8c4" font-family="'Segoe UI', Arial, sans-serif" font-size="22" letter-spacing="4">AGENCE DE VOYAGE AÉRIEN · DJIBOUTI · 15+ ANS D'EXPÉRIENCE</text>
</svg>`

const icon = (size, padding) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#060f1d"/>
  <svg x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" viewBox="0 0 48 48">${mark}</svg>
</svg>`

const outputs = [
  { file: 'og-image.png', svg: og },
  { file: 'apple-touch-icon.png', svg: icon(180, 22) },
  { file: 'icon-192.png', svg: icon(192, 24) },
  { file: 'icon-512.png', svg: icon(512, 64) },
]

for (const { file, svg } of outputs) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL(`../public/${file}`, import.meta.url)))
  console.log(`✔ public/${file}`)
}
