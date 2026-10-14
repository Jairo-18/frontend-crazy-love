import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, getAccommodation, getCatalog } from '@/lib/api';
import { formatCop, hoursLabel, startingRate, t } from '@/lib/format';
import type { Accommodation } from '@/lib/types';
import { idFrom } from '@/components/catalog-page';
import { Gallery } from '@/components/gallery';
import { roomFacts } from '@/components/room-facts';
import { RateList } from '@/components/rates';
import { BackLink, DetailHeading, DetailSkeleton } from '@/components/detail';
import { ScrollTopOnEnter } from '@/components/scroll-top-on-enter';

async function load(rawId: string) {
  try {
    return await getAccommodation(idFrom(rawId));
  } catch (error) {
    // 404 del backend = de otro hotel o inexistente.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<'/hospedajes/[id]'>): Promise<Metadata> {
  const a = await load((await params).id);
  return { title: t(a.name), description: t(a.description) || undefined };
}

async function Detail({ params }: { params: PageProps<'/hospedajes/[id]'>['params'] }) {
  const a = await load((await params).id);
  const name = t(a.name);
  const facts = roomFacts(a, true);
  const rates = a.rates ?? [];
  const description = t(a.description);
  const from = startingRate(a);

  return (
    <div className="space-y-12">
      <ScrollTopOnEnter />
      <div className="space-y-4">
        <BackLink href="/#habitaciones">Volver a las habitaciones</BackLink>
        {/* `minmax(0, …)` en las columnas: con `auto` o `1.2fr` a secas, el mínimo
            de la columna lo ponía el carrusel (fotos de 1200px con ancho en %)
            y la página se desbordaba a lo ancho. */}
        <article className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
          <div className="md:sticky md:top-[76px]">
            <Gallery images={a.images} title={name} />
          </div>
          <div className="space-y-7">
            <div className="space-y-4">
              <DetailHeading eyebrow="Habitación" title={name} />
              <p className="text-[var(--muted)]">
                {from.several ? 'Desde ' : ''}
                <span className="text-2xl font-semibold tabular-nums text-[var(--title)]">{formatCop(from.price)}</span>{' '}
                por {hoursLabel(from.hours)}
              </p>
            </div>

            {/* Comodidades en recuadros: se leen de un vistazo. */}
            {facts.length ? (
              <ul className="grid grid-cols-2 gap-2">
                {facts.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 text-sm font-medium text-[var(--title)] ring-1 ring-[var(--title)]/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}

            {rates.length ? <RateList rates={rates} /> : null}

            {Number(a.extraPersonPrice) > 0 ? (
              <p className="rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm">
                <strong className="text-[var(--title)]">Persona adicional:</strong> {formatCop(a.extraPersonPrice)}
              </p>
            ) : null}

            {description ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">La habitación</p>
                <p className="whitespace-pre-line leading-relaxed">{description}</p>
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <Suspense fallback={null}>
        <OtherRooms currentId={a.accommodationId} />
      </Suspense>
    </div>
  );
}

/** "Otras habitaciones": para seguir comparando sin volver a la portada. */
async function OtherRooms({ currentId }: { currentId: number }) {
  const catalog = await getCatalog().catch(() => null);
  const others = (catalog?.accommodations ?? [])
    .filter((r) => r.accommodationId !== currentId)
    .sort((x, y) => startingRate(x).price - startingRate(y).price);
  if (!others.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-[var(--title)]">Otras habitaciones</h2>
      {/* `scroll-px-4`: sin él, `snap-start` alinea la tarjeta al borde del
          contenedor (no al relleno) y la primera quedaba pegada a la izquierda. */}
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {others.map((r) => (
          <li key={r.accommodationId} className="w-64 shrink-0 snap-start">
            <MiniRoom a={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MiniRoom({ a }: { a: Accommodation }) {
  const image = a.images[0]?.imageUrl;
  const from = startingRate(a);
  return (
    <Link
      href={`/hospedajes/${a.accommodationId}`}
      className="group block overflow-hidden rounded-3xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--title)]/10 transition hover:shadow-md"
    >
      <div
        className="aspect-[4/3] overflow-hidden bg-[var(--surface-2)]"
        style={
          image
            ? undefined
            : { backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 120%)' }
        }
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : null}
      </div>
      <div className="p-4">
        <p className="font-display text-lg font-semibold text-[var(--title)]">{t(a.name)}</p>
        <p className="text-sm text-[var(--muted)]">
          {from.several ? 'Desde ' : ''}
          <span className="font-semibold tabular-nums text-[var(--title)]">{formatCop(from.price)}</span> ·{' '}
          {hoursLabel(from.hours)}
        </p>
      </div>
    </Link>
  );
}

export default function Page({ params }: PageProps<'/hospedajes/[id]'>) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}
