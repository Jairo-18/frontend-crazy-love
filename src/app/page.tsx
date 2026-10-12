import { Suspense } from 'react';
import { getBranding } from '@/lib/api';
import { mediaUrl, t } from '@/lib/format';
import { FullCatalogSections, FullCatalogSkeleton, PhoneIcon } from '@/components/one-page';

/**
 * La página del QR: todo en un solo scroll. El huésped mira precios y pide
 * llamando desde el teléfono de su habitación; no hay carrito ni reservas.
 */
export default async function Home() {
  const branding = await getBranding();
  const hero = mediaUrl(branding, 'HOME_BG') ?? mediaUrl(branding, 'ACCOMMODATIONS_IMAGE');
  const logo = mediaUrl(branding, 'LOGO');
  const name = branding?.name ?? 'Bienvenido';
  const title = t(branding?.homeTitle, name);
  const description = t(branding?.homeDescription, t(branding?.description));

  return (
    <div className="space-y-12">
      {/* Portada a todo el ancho (sale del contenedor del layout). */}
      <section
        className="relative left-1/2 -mt-8 flex min-h-[min(70svh,640px)] w-screen -translate-x-1/2 items-end overflow-hidden bg-[var(--brand)]"
        style={
          hero
            ? {
                backgroundImage: `url("${hero}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                backgroundImage:
                  'radial-gradient(120% 80% at 50% 0%, var(--brand-2) 0%, var(--brand) 45%, #0d0a0c 100%)',
              }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-24 text-white">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
            <img src={logo} alt={name} className="mb-5 h-16 w-16 rounded-full object-cover ring-2 ring-white/30" />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Bienvenido</p>
          <h1 className="font-display mt-2 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
          {description ? <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{description}</p> : null}
          <div className="gold-rule mt-6" />
          <nav className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            <a href="#habitaciones" className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/25 backdrop-blur hover:bg-white/20">
              Habitaciones
            </a>
            <a href="#carta" className="rounded-full bg-[var(--brand)] px-4 py-2 hover:opacity-90">
              Ver la carta
            </a>
          </nav>
        </div>
      </section>

      {/* Cómo pedir: se llama desde el teléfono de la habitación, no desde el celular. */}
      <section className="relative overflow-hidden rounded-3xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-[var(--title)]/10 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand)]/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
            <PhoneIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--title)]">¿Cómo pedir?</h2>
            <p className="mt-1 text-[var(--text)]">
              Llama desde el <strong className="text-[var(--title)]">teléfono de tu habitación</strong> y pide lo
              que veas aquí. Te lo llevamos.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<FullCatalogSkeleton />}>
        <FullCatalogSections />
      </Suspense>
    </div>
  );
}
