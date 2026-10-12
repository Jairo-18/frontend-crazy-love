import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAccommodations } from '@/lib/api';
import { accommodationPrice, t } from '@/lib/format';
import { EmptyState, GridSkeleton, ItemCard, ItemGrid } from '@/components/item-card';
import { PaginationNav, pageFrom } from '@/components/catalog-controls';

export const metadata: Metadata = { title: 'Hospedajes' };

async function Results({ searchParams }: { searchParams: PageProps<'/hospedajes'>['searchParams'] }) {
  const page = pageFrom((await searchParams).page);
  const res = await getAccommodations({ page, perPage: 12 });
  if (!res.data.length) return <EmptyState>Pronto publicaremos nuestros hospedajes.</EmptyState>;
  return (
    <>
      <ItemGrid>
        {res.data.map((a) => (
          <ItemCard
            key={a.accommodationId}
            href={`/hospedajes/${a.accommodationId}`}
            title={t(a.name)}
            image={a.images[0]?.imageUrl}
            category={t(a.categoryType?.name)}
            {...accommodationPrice(a)}
          />
        ))}
      </ItemGrid>
      <PaginationNav pagination={res.pagination} basePath="/hospedajes" />
    </>
  );
}

export default function Page({ searchParams }: PageProps<'/hospedajes'>) {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold text-[var(--title)]">Hospedajes</h1>
      <Suspense fallback={<GridSkeleton count={8} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
