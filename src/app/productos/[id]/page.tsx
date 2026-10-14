import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogDetail, idFrom, loadCatalogItem } from '@/components/catalog-page';
import { t } from '@/lib/format';
import { DetailSkeleton } from '@/components/detail';

export async function generateMetadata({ params }: PageProps<'/productos/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const item = await loadCatalogItem('productos', idFrom(id));
  return { title: t(item.name), description: t(item.description) || undefined };
}

export default function Page({ params }: PageProps<'/productos/[id]'>) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CatalogDetail kind="productos" params={params} />
    </Suspense>
  );
}
