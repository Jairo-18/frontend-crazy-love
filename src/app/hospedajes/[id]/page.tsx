import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, getAccommodation } from '@/lib/api';
import { formatCop, t } from '@/lib/format';
import { idFrom } from '@/components/catalog-page';
import { Gallery } from '@/components/gallery';

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
  const facts = [
    a.amountBathroom ? `Hasta ${a.amountBathroom} personas` : null,
    a.amountRoom ? `${a.amountRoom} habitación${a.amountRoom === 1 ? '' : 'es'}` : null,
    a.bedType ? `Cama ${t(a.bedType.name).toLowerCase()}` : null,
    a.jacuzzi ? 'Jacuzzi' : null,
  ].filter(Boolean) as string[];

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <Gallery images={a.images} title={name} />
      <div className="space-y-4">
        {a.categoryType ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
            {t(a.categoryType.name)}
          </p>
        ) : null}
        <h1 className="text-3xl font-extrabold text-[var(--title)]">{name}</h1>
        <p className="text-2xl font-bold text-[var(--title)]">
          {formatCop(a.priceSale)} <span className="text-sm font-normal text-[var(--muted)]">por noche</span>
        </p>
        {a.extraPersonPrice ? (
          <p className="text-sm text-[var(--muted)]">
            Persona adicional: {formatCop(a.extraPersonPrice)} por noche
          </p>
        ) : null}
        {facts.length ? (
          <ul className="flex flex-wrap gap-2">
            {facts.map((f) => (
              <li key={f} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm">
                {f}
              </li>
            ))}
          </ul>
        ) : null}
        {t(a.description) ? (
          <p className="whitespace-pre-line leading-relaxed">{t(a.description)}</p>
        ) : null}
      </div>
    </article>
  );
}

export default function Page({ params }: PageProps<'/hospedajes/[id]'>) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-[var(--surface-2)]" />}>
      <Detail params={params} />
    </Suspense>
  );
}
