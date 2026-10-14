'use client';

import { useRef, useState } from 'react';
import { PhotoCarousel, type CarouselHandle } from './photo-carousel';
import { useOverlay } from './use-overlay';
import { CloseIcon, ExpandIcon } from './icons';
import { ContainedImage } from './contained-image';

/**
 * Galería del detalle: fotos que se deslizan, miniaturas debajo y, al tocar
 * una, el visor a pantalla completa (también deslizable). El "atrás" del
 * celular cierra el visor.
 */
export function Gallery({
  images,
  title,
  fit = 'cover',
}: {
  images: { imageUrl: string }[];
  title: string;
  /** `product`: la foto entera, sin recortar (ver `ContainedImage`). */
  fit?: 'cover' | 'product';
}) {
  const main = useRef<CarouselHandle>(null);
  const viewer = useRef<CarouselHandle>(null);
  const [active, setActive] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  // Al cerrar el visor, la galería queda en la foto que se estaba viendo.
  const lightbox = useOverlay(() => main.current?.goTo(viewerIndex, false));

  if (!images.length) {
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-3xl text-6xl text-white/80"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 120%)' }}
        aria-hidden="true"
      >
        ✦
      </div>
    );
  }

  const openViewer = (i: number) => {
    setViewerIndex(i);
    lightbox.open();
    // El visor recién abierto ya tiene ancho: se salta a la foto sin animar.
    requestAnimationFrame(() => viewer.current?.goTo(i, false));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <PhotoCarousel
          ref={main}
          images={images}
          alt={title}
          eager
          fit={fit}
          onOpen={openViewer}
          onIndexChange={setActive}
          className="aspect-[4/3] rounded-3xl bg-[var(--surface-2)] shadow-sm"
        />
        <button
          type="button"
          onClick={() => openViewer(active)}
          className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 rounded-full bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur"
        >
          <ExpandIcon className="h-4 w-4" /> Ampliar
        </button>
      </div>

      {images.length > 1 ? (
        // `p-1`: el `overflow-x-auto` recortaba el anillo de la miniatura
        // activa y la fila quedaba pegada a la foto.
        <div className="-mx-1 flex gap-2.5 overflow-x-auto p-1 [scrollbar-width:none]">
          {images.map((img, i) => (
            <button
              key={img.imageUrl + i}
              type="button"
              onClick={() => main.current?.goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                i === active
                  ? 'ring-[var(--brand)] ring-offset-2 ring-offset-[var(--page)]'
                  : 'opacity-60 ring-transparent hover:opacity-100'
              }`}
            >
              {fit === 'product' ? (
                <ContainedImage src={img.imageUrl} alt="" pad="p-1" className="h-full w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
                <img src={img.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <dialog
        {...lightbox.dialogProps}
        aria-label={`Fotos de ${title}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
      >
        <PhotoCarousel
          ref={viewer}
          images={images}
          alt={title}
          fit="contain"
          onIndexChange={setViewerIndex}
          className="h-full"
        />
        <button
          type="button"
          onClick={lightbox.close}
          aria-label="Cerrar"
          className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </dialog>
    </div>
  );
}
