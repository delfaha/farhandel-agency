import { SITE } from '@/config/site'
import { airport } from '@/data/airports'
import { BOOKING_STATUS_META, CABIN_LABELS, PASSENGER_TYPE_LABELS, SERVICE_LABELS, SERVICE_STATUS_LABELS } from '@/data/labels'
import type { Booking } from '@/types/booking'
import { formatDate, formatDuration, formatPrice, formatTime } from './format'

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)

/** Document HTML autonome (imprimable en PDF) récapitulant une réservation de démonstration. */
export function confirmationHtml(booking: Booking): string {
  const legs = booking.legs
    .map((leg, index) => {
      const segments = leg.segments
        .map((segment) => {
          const from = airport(segment.from)
          const to = airport(segment.to)
          return `<tr>
            <td><strong>${escape(segment.flightNumber)}</strong><br><span class="muted">${escape(segment.airline.name)}</span></td>
            <td><strong>${formatTime(segment.departure)}</strong> · ${escape(formatDate(segment.departure, 'medium'))}<br>${escape(from.city)} (${from.code})</td>
            <td><strong>${formatTime(segment.arrival)}</strong> · ${escape(formatDate(segment.arrival, 'medium'))}<br>${escape(to.city)} (${to.code})</td>
            <td>${formatDuration(segment.durationMin)}</td>
          </tr>`
        })
        .join('')
      return `<h3>Trajet ${index + 1}</h3><table><thead><tr><th>Vol</th><th>Départ</th><th>Arrivée</th><th>Durée</th></tr></thead><tbody>${segments}</tbody></table>`
    })
    .join('')

  const passengers = booking.passengers
    .map((passenger) => `<li>${escape(passenger.firstName)} ${escape(passenger.lastName.toUpperCase())} <span class="muted">(${PASSENGER_TYPE_LABELS[passenger.type]}${passenger.seat ? ` · siège ${escape(passenger.seat)}` : ''})</span></li>`)
    .join('')

  const services = booking.services.length
    ? booking.services.map((service) => `<li>${SERVICE_LABELS[service.type]} — ${SERVICE_STATUS_LABELS[service.status]}${service.detail ? ` <span class="muted">(${escape(service.detail)})</span>` : ''}</li>`).join('')
    : '<li class="muted">Aucun service ajouté</li>'

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Réservation ${booking.pnr} — ${SITE.name}</title>
<style>
  body{font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0b1a2e;margin:0;background:#f8f6f1}
  .page{max-width:780px;margin:32px auto;background:#fff;padding:40px;border-radius:16px}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #d6ac66;padding-bottom:18px}
  h1{font-family:Georgia,serif;font-weight:400;font-size:30px;margin:0}
  h2{font-size:15px;text-transform:uppercase;letter-spacing:.14em;color:#815c2b;margin:28px 0 10px}
  h3{font-size:14px;margin:18px 0 8px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:8px;border-bottom:1px solid #e2e7ee;vertical-align:top}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#46628b}
  .pnr{font-size:26px;font-weight:700;letter-spacing:.18em}
  .muted{color:#46628b}
  .notice{margin-top:28px;padding:14px 16px;border-radius:10px;background:#fff8e6;border:1px solid #efdcb7;font-size:12.5px;line-height:1.6}
  ul{padding-left:18px;font-size:14px;line-height:1.7}
  footer{margin-top:28px;font-size:12px;color:#46628b}
</style></head>
<body><div class="page">
<header>
  <div><h1>${SITE.name}</h1><div class="muted">${SITE.slogan} · ${SITE.address.street}, ${SITE.address.city} · ${SITE.phone.display}</div></div>
  <div style="text-align:right"><div class="muted">Réservation</div><div class="pnr">${booking.pnr}</div><div>${BOOKING_STATUS_META[booking.status].label}</div></div>
</header>
<h2>Itinéraire</h2>${legs}
<h2>Passagers</h2><ul>${passengers}</ul>
<h2>Bagages</h2><ul><li>Cabine : ${booking.baggage.cabinKg} kg par passager</li><li>Soute : ${booking.baggage.checkedPieces} × ${booking.baggage.checkedKg} kg par passager (hors bébé)</li></ul>
<h2>Services</h2><ul>${services}</ul>
<h2>Tarif</h2><p>${CABIN_LABELS[booking.cabin]} · ${escape(booking.fareName)} — <strong>${formatPrice(booking.totalPrice)}</strong> <span class="muted">(montant indicatif fictif)</span></p>
<div class="notice"><strong>Document de démonstration.</strong> Ce récapitulatif est généré par le prototype du site ${SITE.name} : il ne constitue ni un billet d'avion, ni une facture, ni une preuve de paiement. Horaires et tarifs sont fictifs. Les réservations réelles sont confirmées par un conseiller.</div>
<footer>Généré le ${escape(new Date().toLocaleString('fr-FR'))} · ${SITE.name} — ${SITE.representative.name} · ${SITE.phone.display}</footer>
</div></body></html>`
}

/** Télécharge le récapitulatif au format HTML (ouvrable et imprimable dans tout navigateur). */
export function downloadConfirmation(booking: Booking): void {
  const blob = new Blob([confirmationHtml(booking)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `farhandel-agency-reservation-${booking.pnr}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
