import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogDetail, idFrom, loadCatalogItem } from '@/components/catalog-page';
import { t } from '@/lib/format';
import { DetailSkeleton } from '@/components/detail';

export async function generateMetadata({ params }: PageProps<'/servicios/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const item = await loadCatalogItem('servicios', idFrom(id));
  return { title: t(item.name), description: t(item.description) || undefined };
}

export default function Page({ params }: PageProps<'/servicios/[id]'>) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CatalogDetail kind="servicios" params={params} />
    </Suspense>
  );
}
