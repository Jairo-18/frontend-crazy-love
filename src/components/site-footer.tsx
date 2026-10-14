import type { Branding } from '@/lib/types';
import { phoneHref, t, whatsappUrl } from '@/lib/format';

/**
 * Panel de administración (el de samawe, uno solo para todos los hoteles). El
 * `?hotel=` le dice al login en qué hotel buscar la cuenta y con qué marca
 * mostrarse.
 */
const PANEL_URL = (process.env.SAMAWE_PANEL_URL ?? 'https://ecohotelsamawe.com').replace(/\/+$/, '');

/** Logos de las redes (relleno, `currentColor`). */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  WhatsApp: (
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
  ),
  Instagram: (
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.4-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0ZM21.9 8c-.1-1.6-.4-3-1.6-4.3C19 2.5 17.6 2.1 16 2c-1.6-.1-6.4-.1-8 0-1.6.1-3 .4-4.3 1.6C2.5 5 2.1 6.4 2 8c-.1 1.6-.1 6.4 0 8 .1 1.6.4 3 1.6 4.3C5 21.5 6.4 21.9 8 22c1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.3-1.6 1.2-1.3 1.6-2.7 1.6-4.3.1-1.6.1-6.4 0-8Zm-2.1 9.8a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.7s-.1-4.4.4-5.7A3.2 3.2 0 0 1 6.4 4.6c1.3-.5 4.3-.4 5.6-.4s4.4-.1 5.7.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.8Z" />
  ),
  Facebook: (
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
  ),
  'Cómo llegar': (
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  ),
};

/**
 * Cada red con su color oficial (lo pidió el dueño); "Cómo llegar" queda
 * blanca. El texto de WhatsApp va en verde oscuro: blanco sobre su verde
 * (#25D366) no llega a 2:1 de contraste.
 */
const SOCIAL_STYLES: Record<string, string> = {
  WhatsApp: 'bg-[#25D366] text-[#073b1d] hover:bg-[#1ebe5a]',
  Instagram:
    'bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] text-white hover:brightness-110',
  Facebook: 'bg-[#1877F2] text-white hover:bg-[#0f66d9]',
  'Cómo llegar': 'bg-white text-[var(--brand)] hover:bg-white/90',
};

export function SiteFooter({ branding }: { branding: Branding | null }) {
  if (!branding) return null;
  const whatsapp = whatsappUrl(branding);
  // Bajo el nombre, el título de la portada; si no hay (o es el mismo nombre),
  // la descripción. La razón social no se muestra: es para facturas, no para
  // el huésped.
  const homeTitle = t(branding.homeTitle);
  const tagline =
    homeTitle && homeTitle !== branding.name ? homeTitle : t(branding.homeDescription, t(branding.description));
  const location = [branding.address, branding.city, branding.department]
    .filter(Boolean)
    .join(', ');
  const links = [
    whatsapp && { href: whatsapp, label: 'WhatsApp' },
    branding.instagramUrl && { href: branding.instagramUrl, label: 'Instagram' },
    branding.facebookUrl && { href: branding.facebookUrl, label: 'Facebook' },
    branding.mapsUrl && { href: branding.mapsUrl, label: 'Cómo llegar' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="mt-16 bg-[var(--brand)] text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{branding.name}</p>
          {tagline ? <p className="mt-1 max-w-xs text-sm opacity-80">{tagline}</p> : null}
        </div>
        <div className="space-y-1 text-sm">
          {location ? <p>{location}</p> : null}
          {/* Enlace `tel:` para quien lo ve desde afuera; en la habitación se
              sigue pidiendo por el teléfono de la habitación. */}
          {branding.phone ? (
            <p>
              <a className="underline-offset-2 hover:underline" href={phoneHref(branding) ?? undefined}>
                Tel. {branding.phoneCode?.code ?? ''} {branding.phone}
              </a>
            </p>
          ) : null}
          {branding.email ? (
            <p>
              <a className="underline-offset-2 hover:underline" href={`mailto:${branding.email}`}>
                {branding.email}
              </a>
            </p>
          ) : null}
        </div>
        <ul className="flex flex-wrap items-start gap-2 text-sm sm:justify-end">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold shadow-sm ring-1 ring-black/10 transition ${SOCIAL_STYLES[l.label]}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                  {SOCIAL_ICONS[l.label]}
                </svg>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-right text-xs opacity-70">
        <a
          href={`${PANEL_URL}/es/auth/login?hotel=${encodeURIComponent(branding.slug)}`}
          className="underline-offset-2 hover:underline hover:opacity-100"
          rel="nofollow"
        >
          Acceso administradores
        </a>
      </div>
    </footer>
  );
}
