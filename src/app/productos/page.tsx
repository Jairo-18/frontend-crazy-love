import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogResults } from '@/components/catalog-page';
import { GridSkeleton } from '@/components/item-card';

export const metadata: Metadata = { title: 'Productos' };

export default function Page({ searchParams }: PageProps<'/productos'>) {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold text-[var(--title)]">Productos</h1>
      <Suspense fallback={<GridSkeleton count={8} />}>
        <CatalogResults kind="productos" searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
