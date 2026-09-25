import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { WhatsAppIcon } from '@/components/ui/Misc'
import { contactLinks, INDEPENDENCE_NOTICE, SITE } from '@/config/site'
import { FOOTER_COLUMNS, LEGAL_NAV } from '@/data/navigation'

export function Footer() {
  const year = Math.max(new Date().getFullYear(), SITE.since)

  const contacts = [
    { icon: Phone, label: SITE.phone.display, href: contactLinks.tel },
    { icon: WhatsAppIcon, label: 'WhatsApp', href: contactLinks.whatsapp(), external: true },
    { icon: MapPin, label: `${SITE.address.street}, ${SITE.address.city}` },
    { icon: Mail, label: SITE.email, href: contactLinks.email() },
  ]

  return (
    <footer className="on-dark relative overflow-hidden bg-night-950 text-white">
      <div aria-hidden="true" className="absolute -left-40 top-0 size-[520px] rounded-full bg-sand-400/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-azure-500/10 blur-3xl" />

      <div className="container-page relative pt-16 sm:pt-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <div>
            <Logo tone="light" withTagline />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">
              Agence de voyage aérien basée à Djibouti. {SITE.representative.years}+ ans d'expérience dans le secteur aérien, au service des voyageurs
              de Djibouti et du monde.
            </p>
            <p className="mt-6 font-display text-4xl italic text-sand-300">{SITE.slogan}</p>
            <p className="mt-1 text-sm text-white/50">{SITE.signature}</p>
          </div>

          <address className="glass rounded-3xl p-6 not-italic">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">Contact</h2>
            <p className="mt-3 font-display text-2xl">{SITE.representative.name}</p>
            <p className="text-sm text-white/55">{SITE.representative.role}</p>
            <ul className="mt-5 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              {contacts.map((item) => {
                const content = (
                  <>
                    <item.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sand-300" />
                    <span className="min-w-0 break-words">{item.label}</span>
                  </>
                )
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="flex items-start gap-2.5 transition-colors hover:text-white"
                      >
                        {content}
                      </a>
                    ) : (
                      <p className="flex items-start gap-2.5">{content}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-8 border-b border-white/10 py-12 sm:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">{column.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="link-underline text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-8 max-w-4xl text-xs leading-relaxed text-white/45">{INDEPENDENCE_NOTICE}</p>
        <p className="mt-2 max-w-4xl text-xs leading-relaxed text-white/45">
          Site de démonstration : le responsable, les coordonnées, les prix, horaires, disponibilités et statuts affichés sont fictifs. Photographies :
          Unsplash (licence Unsplash).
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 py-7 pb-24 text-sm text-white/55 sm:pb-7 md:flex-row md:items-center md:justify-between">
          <p>© {year} FarhanDel Agency. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_NAV.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="link-underline hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
