import { useId } from 'react'

/**
 * Avion de ligne en vue de profil, dessiné pour FarhanDel Agency : fuselage blanc et
 * dérive rouge, aux couleurs évoquant Turkish Airlines, sans logo ni inscription
 * (aucun élément de marque déposée n'est reproduit).
 */
export function Airliner({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const body = `body-${uid}`
  const tail = `tail-${uid}`
  const engine = `engine-${uid}`
  const wing = `wing-${uid}`

  return (
    <svg viewBox="0 0 640 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="78" x2="0" y2="126" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f3f5f8" />
          <stop offset="1" stopColor="#c3ccd8" />
        </linearGradient>
        <linearGradient id={tail} x1="70" y1="14" x2="170" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ef3b3f" />
          <stop offset="1" stopColor="#b3121c" />
        </linearGradient>
        <linearGradient id={engine} x1="0" y1="133" x2="0" y2="159" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f7f9fb" />
          <stop offset="1" stopColor="#aeb9c7" />
        </linearGradient>
        <linearGradient id={wing} x1="300" y1="118" x2="420" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#dfe5ec" />
          <stop offset="1" stopColor="#9fadbe" />
        </linearGradient>
      </defs>

      {/* Stabilisateur horizontal (côté opposé) */}
      <path d="M118 100 L86 86 L94 84 L150 96 Z" fill="#b9c3cf" />

      {/* Dérive rouge */}
      <path d="M176 84 L112 16 Q108 12 102 12 L88 12 Q81 12 81 19 L70 98 Z" fill={`url(#${tail})`} />
      <path d="M109 20 L162 80" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />

      {/* Fuselage */}
      <path
        d="M58 104 C72 93 100 85 138 83 L522 80 C560 80 590 88 608 101 C613 105 610 111 600 114 C584 120 558 124 524 124 L176 124 C136 124 94 117 58 104 Z"
        fill={`url(#${body})`}
      />
      <path d="M176 124 L524 124 C552 124 578 120 596 115" fill="none" stroke="#98a6b8" strokeOpacity="0.55" strokeWidth="1.5" />

      {/* Hublots */}
      <g fill="#1f3149" fillOpacity="0.82">
        {Array.from({ length: 27 }, (_, index) => (
          <rect key={index} x={196 + index * 11.4} y="90" width="5.4" height="7.2" rx="2.6" />
        ))}
      </g>

      {/* Portes */}
      <rect x="180" y="87.5" width="9" height="22" rx="2" fill="none" stroke="#aab5c3" strokeWidth="1.2" />
      <rect x="508" y="86.5" width="9" height="22" rx="2" fill="none" stroke="#aab5c3" strokeWidth="1.2" />

      {/* Cockpit */}
      <path d="M566 89.5 L589 93.5 C592 94.2 593 96.6 591 98 L571 98 C567 98 564.8 94.5 566 89.5 Z" fill="#17263b" />

      {/* Stabilisateur horizontal (côté visible) */}
      <path d="M126 108 L62 124 Q55 126 60 129 L70 131 L150 115 Z" fill="#dde3ea" stroke="#b3bfcd" strokeWidth="1" />

      {/* Aile */}
      <path d="M430 116 L306 178 Q297 183 306 184 L326 184 L462 121 Z" fill={`url(#${wing})`} stroke="#94a3b6" strokeWidth="1" />
      <path d="M306 180 L293 160 L300 157 L314 177 Z" fill="#c8141f" />

      {/* Réacteur */}
      <path d="M404 124 L414 134 L434 134 L428 122 Z" fill="#b8c2cf" />
      <path d="M376 133 L430 133 Q448 133 448 146 Q448 159 430 159 L376 159 Q362 159 362 146 Q362 133 376 133 Z" fill={`url(#${engine})`} stroke="#9aa8b9" strokeWidth="1" />
      <ellipse cx="446" cy="146" rx="4.5" ry="11.5" fill="#23354c" />
      <path d="M362 139 L350 142 L350 150 L362 153 Z" fill="#8795a8" />
      <path d="M380 136 L426 136" stroke="#c8141f" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.9" />

      {/* Feux de navigation */}
      <circle cx="298" cy="160" r="2.2" fill="#ff5a5f" />
      <circle cx="84" cy="15" r="1.8" fill="#ffffff" />
    </svg>
  )
}
