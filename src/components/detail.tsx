import Link from 'next/link';
import { ArrowLeftIcon, PhoneIcon } from './icons';

/**
 * Piezas de las páginas de detalle (hospedaje, producto, servicio), con el
 * mismo lenguaje que la portada. Se llega a ellas desde la página del QR, así
 * que lo primero es poder volver al mismo punto de la carta.
 */

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[var(--brand)] hover:underline"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {children}
    </Link>
  );
}

export function DetailHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{eyebrow}</p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold leading-tight text-[var(--title)] sm:text-4xl">{title}</h1>
      <div className="gold-rule !mt-4" />
    </div>
  );
}

/** El mismo aviso de la portada: se pide desde el teléfono de la habitación. */
export function OrderHint() {
  return (
    <p className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
        <PhoneIcon className="h-4 w-4" />
      </span>
      <span>
        Pide llamando desde el <strong className="text-[var(--title)]">teléfono de tu habitación</strong>.
      </span>
    </p>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-40 animate-pulse rounded-full bg-[var(--surface-2)]" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-[var(--surface-2)]" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-[var(--surface-2)]" />
          <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}
