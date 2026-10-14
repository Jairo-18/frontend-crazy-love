import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, getCatalog, getProduct, getProducts, getService, getServices } from '@/lib/api';
import { categoryAnchor, formatCop, t, titleCase } from '@/lib/format';
import type { CatalogItem, Paginated } from '@/lib/types';
import { EmptyState, ItemCard, ItemGrid } from './item-card';
import { PaginationNav, SearchForm, pageFrom, textFrom } from './catalog-controls';
import { Gallery } from './gallery';
import { BackLink, DetailHeading, OrderHint } from './detail';
import { ContainedImage } from './contained-image';
import { ScrollTopOnEnter } from './scroll-top-on-enter';

/** Productos y servicios comparten forma (ver `PublicCatalogItem` del backend). */
export type CatalogKind = 'productos' | 'servicios';

const SOURCES: Record<
  CatalogKind,
  {
    list: (q: { page: number; perPage: number; search?: string }) => Promise<Paginated<CatalogItem>>;
    one: (id: number) => Promise<CatalogItem>;
    empty: string;
  }
> = {
  productos: { list: getProducts, one: getProduct, empty: 'No encontramos productos.' },
  servicios: { list: getServices, one: getService, empty: 'No encontramos servicios.' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Lee `?page` y `?search` (runtime): va dentro de un `<Suspense>`. */
export async function CatalogResults({
  kind,
  searchParams,
}: {
  kind: CatalogKind;
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = pageFrom(sp.page);
  const search = textFrom(sp.search);
  const basePath = `/${kind}`;
  const res = await SOURCES[kind].list({ page, perPage: 12, search: search || undefined });

  return (
    <div className="space-y-6">
      <SearchForm action={basePath} defaultValue={search} />
      {res.data.length ? (
        <ItemGrid>
          {res.data.map((item) => (
            <ItemCard
              key={item.id}
              href={`${basePath}/${item.id}`}
              title={t(item.name)}
              image={item.images[0]?.imageUrl}
              category={t(item.categoryType?.name)}
              price={item.priceSale}
            />
          ))}
        </ItemGrid>
      ) : (
        <EmptyState>{search ? `Nada coincide con “${search}”.` : SOURCES[kind].empty}</EmptyState>
      )}
      <PaginationNav pagination={res.pagination} basePath={basePath} search={search} />
    </div>
  );
}

/** El `id` de la ruta; cualquier cosa que no sea un entero positivo es 404. */
export function idFrom(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}

export async function loadCatalogItem(kind: CatalogKind, id: number): Promise<CatalogItem> {
  try {
    return await SOURCES[kind].one(id);
  } catch (error) {
    // 404 del backend = de otro hotel, inactivo o inexistente.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function CatalogDetail({
  kind,
  params,
}: {
  kind: CatalogKind;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await loadCatalogItem(kind, idFrom(id));
  const name = t(item.name);
  const description = t(item.description);
  const category = item.categoryType ? titleCase(t(item.categoryType.name)) : undefined;
  // Vuelve al mismo punto de la portada: la categoría del producto o los servicios.
  const back =
    kind === 'servicios'
      ? { href: '/#servicios', label: 'Volver a los servicios' }
      : { href: `/#${categoryAnchor(item.categoryType?.code ?? 'OTROS')}`, label: 'Volver a la carta' };

  return (
    <div className="space-y-14">
      <ScrollTopOnEnter />
      <div className="space-y-4">
        <BackLink href={back.href}>{back.label}</BackLink>
        <article className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-2">
          <Gallery images={item.images} title={name} fit="product" />
          <div className="space-y-6">
            <DetailHeading eyebrow={category} title={name} />
            <p className="text-3xl font-semibold tabular-nums text-[var(--price)]">{formatCop(item.priceSale)}</p>
            {description ? <p className="whitespace-pre-line leading-relaxed">{description}</p> : null}
            <OrderHint />
          </div>
        </article>
      </div>
      <Suspense fallback={null}>
        <RelatedItems kind={kind} item={item} title={category ?? 'Servicios'} backHref={back.href} />
      </Suspense>
    </div>
  );
}

/**
 * "Más de {categoría}": lo mismo que ofrece la hoja del celular, en tarjetas.
 * Sale de `getCatalog()` (ya en caché por la portada); si falla, no se pinta.
 */
async function RelatedItems({
  kind,
  item,
  title,
  backHref,
}: {
  kind: CatalogKind;
  item: CatalogItem;
  title: string;
  backHref: string;
}) {
  const catalog = await getCatalog().catch(() => null);
  if (!catalog) return null;
  const pool =
    kind === 'servicios'
      ? catalog.services
      : catalog.products.filter((p) => p.categoryType?.code === item.categoryType?.code);
  const others = pool
    .filter((p) => p.id !== item.id)
    .sort((a, b) => t(a.name).localeCompare(t(b.name), 'es'))
    .slice(0, 8);
  if (!others.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Te puede gustar</p>
          <h2 className="font-display text-2xl font-semibold text-[var(--title)] sm:text-3xl">Más de {title.toLowerCase()}</h2>
        </div>
        <Link href={backHref} className="shrink-0 text-sm font-semibold text-[var(--brand)] hover:underline">
          Ver todo →
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {others.map((o) => (
          <li key={o.id}>
            <RelatedCard item={o} href={`/${kind}/${o.id}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedCard({ item, href }: { item: CatalogItem; href: string }) {
  const image = item.images[0]?.imageUrl;
  const name = t(item.name);
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--title)]/10 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {image ? (
        <ContainedImage src={image} alt="" className="aspect-square w-full" pad="p-4" />
      ) : (
        // Sin foto: la inicial sobre el degradado de la marca, no un hueco gris.
        <span
          aria-hidden="true"
          className="flex aspect-square w-full items-center justify-center font-display text-5xl font-semibold text-white/40"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 60%, var(--accent) 130%)' }}
        >
          {name.slice(0, 1)}
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="line-clamp-2 font-display font-semibold leading-snug text-[var(--title)] group-hover:underline">
          {name}
        </span>
        <span className="mt-auto font-semibold tabular-nums text-[var(--price)]">{formatCop(item.priceSale)}</span>
      </span>
    </Link>
  );
}
