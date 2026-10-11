import { Suspense } from 'react';
import { getBranding } from '@/lib/api';
import { mediaUrl, t } from '@/lib/format';
import { GridSkeleton } from '@/components/item-card';
import {
  FeaturedAccommodations,
  FeaturedProducts,
  FeaturedServices,
} from '@/components/sections';

export default async function Home() {
  const branding = await getBranding();
  const hero = mediaUrl(branding, 'HOME_BG') ?? mediaUrl(branding, 'ACCOMMODATIONS_IMAGE');
  const title = t(branding?.homeTitle, branding?.name ?? 'Bienvenido');
  const description = t(branding?.homeDescription, t(branding?.description));

  return (
    <div className="space-y-14">
      <section
        className="relative overflow-hidden rounded-3xl bg-[var(--brand)] px-6 py-16 text-white sm:px-12 sm:py-24"
        style={
          hero
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url("${hero}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-lg opacity-90">{description}</p>
        ) : null}
      </section>

      <Suspense fallback={<GridSkeleton />}>
        <FeaturedAccommodations />
      </Suspense>
      <Suspense fallback={<GridSkeleton />}>
        <FeaturedServices />
      </Suspense>
      <Suspense fallback={<GridSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </div>
  );
}
