import type { Branding } from '@/lib/types';
import { whatsappUrl } from '@/lib/format';

export function SiteFooter({ branding }: { branding: Branding | null }) {
  if (!branding) return null;
  const whatsapp = whatsappUrl(branding);
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
          {branding.legalName ? <p className="text-sm opacity-80">{branding.legalName}</p> : null}
        </div>
        <div className="space-y-1 text-sm">
          {location ? <p>{location}</p> : null}
          {branding.phone ? <p>Tel. {branding.phoneCode?.code ?? ''} {branding.phone}</p> : null}
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
                className="inline-block rounded-full border border-white/40 px-3 py-1 hover:bg-white hover:text-[var(--brand)]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
