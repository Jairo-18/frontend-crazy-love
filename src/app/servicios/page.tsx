import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogResults } from '@/components/catalog-page';
import { GridSkeleton } from '@/components/item-card';

export const metadata: Metadata = { title: 'Servicios' };

export default function Page({ searchParams }: PageProps<'/servicios'>) {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold text-[var(--title)]">Servicios</h1>
      <Suspense fallback={<GridSkeleton count={8} />}>
        <CatalogResults kind="servicios" searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
