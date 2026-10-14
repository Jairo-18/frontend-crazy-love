import Link from 'next/link';
import type { Branding } from '@/lib/types';
import { mediaUrl } from '@/lib/format';

export function SiteHeader({ branding }: { branding: Branding | null }) {
  const logo = mediaUrl(branding, 'LOGO');
  const name = branding?.name ?? 'Catálogo';
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--title)]/10 bg-[var(--surface)]/90 backdrop-blur">
      {/* Alto fijo (h-[60px]): la barra de secciones de la página va pegada debajo.
          Sin menú: "Habitaciones / La carta" estaban aquí, en la portada y en
          la barra de secciones; ahora solo en la barra. */}
      <div className="mx-auto flex h-[59px] max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- las imágenes vienen del backend (host variable por entorno)
            <img src={logo} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/10" />
          ) : null}
          <span className="font-display truncate text-lg font-semibold text-[var(--title)]">{name}</span>
        </Link>
      </div>
    </header>
  );
}
