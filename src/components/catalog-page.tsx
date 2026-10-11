import { notFound } from 'next/navigation';
import { ApiError, getProduct, getProducts, getService, getServices } from '@/lib/api';
import { formatCop, t } from '@/lib/format';
import type { CatalogItem, Paginated } from '@/lib/types';
import { EmptyState, ItemCard, ItemGrid } from './item-card';
import { PaginationNav, SearchForm, pageFrom, textFrom } from './catalog-controls';
import { Gallery } from './gallery';

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

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <Gallery images={item.images} title={name} />
      <div className="space-y-4">
        {item.categoryType ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
            {t(item.categoryType.name)}
          </p>
        ) : null}
        <h1 className="text-3xl font-extrabold text-[var(--title)]">{name}</h1>
        <p className="text-2xl font-bold text-[var(--title)]">{formatCop(item.priceSale)}</p>
        {description ? (
          <p className="whitespace-pre-line leading-relaxed">{description}</p>
        ) : null}
      </div>
    </article>
  );
}
