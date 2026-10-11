'use client';

import { useState } from 'react';

/** Foto principal + miniaturas. Es el único componente de cliente del sitio. */
export function Gallery({ images, title }: { images: { imageUrl: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[var(--surface-2)] text-5xl text-[var(--muted)]">
        ✦
      </div>
    );
  }
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- imágenes del backend */}
        <img src={current.imageUrl} alt={title} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.imageUrl}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === active ? 'ring-[var(--brand)]' : 'ring-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imágenes del backend */}
              <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
