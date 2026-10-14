'use client';

import Link from 'next/link';
import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ChevronIcon } from './icons';
import { ContainedImage } from './contained-image';

export type CarouselHandle = { goTo: (index: number, smooth?: boolean) => void };

type Props = {
  images: { imageUrl: string }[];
  alt: string;
  /** Clases del contenedor (proporción, esquinas). */
  className?: string;
  /** Cada foto lleva aquí (tarjeta de habitación → detalle). */
  href?: string;
  /** Tocar la foto la abre (detalle → visor a pantalla completa). */
  onOpen?: (index: number) => void;
  onIndexChange?: (index: number) => void;
  /**
   * `cover` llena el recuadro (habitaciones); `contain` la foto entera sobre
   * negro (visor); `product` la foto entera con fondo desenfocado (productos).
   */
  fit?: 'cover' | 'contain' | 'product';
  /** La primera foto sin `lazy` (la que se ve al abrir la página). */
  eager?: boolean;
  ref?: React.Ref<CarouselHandle>;
};

/**
 * Fotos que se deslizan con el dedo: un `overflow-x` con `scroll-snap`, sin
 * librerías. Con puntos y contador, y flechas en escritorio (con mouse no hay
 * gesto de deslizar).
 */
export function PhotoCarousel({
  images,
  alt,
  className = '',
  href,
  onOpen,
  onIndexChange,
  fit = 'cover',
  eager,
  ref,
}: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  const goTo = useCallback((i: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
  }, []);
  useImperativeHandle(ref, () => ({ goTo }), [goTo]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    if (i !== index) {
      setIndex(i);
      onIndexChange?.(i);
    }
  };

  const img = (src: string, i: number) =>
    fit === 'product' ? (
      <ContainedImage
        src={src}
        alt={i === 0 ? alt : `${alt}, foto ${i + 1}`}
        loading={eager && i === 0 ? 'eager' : 'lazy'}
        className="h-full w-full"
        pad="p-6"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
      <img
        src={src}
        alt={i === 0 ? alt : `${alt}, foto ${i + 1}`}
        loading={eager && i === 0 ? 'eager' : 'lazy'}
        draggable={false}
        className={`h-full w-full select-none ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
      />
    );

  return (
    <div className={`group/carousel relative overflow-hidden ${className}`}>
      <div
        ref={track}
        onScroll={onScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((im, i) => (
          <div key={im.imageUrl + i} className="h-full w-full shrink-0 snap-center snap-always">
            {href ? (
              <Link href={href} tabIndex={i === 0 ? undefined : -1} className="block h-full">
                {img(im.imageUrl, i)}
              </Link>
            ) : onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(i)}
                className="block h-full w-full cursor-zoom-in"
                aria-label={`Ampliar foto ${i + 1}`}
                tabIndex={i === index ? undefined : -1}
              >
                {img(im.imageUrl, i)}
              </button>
            ) : (
              img(im.imageUrl, i)
            )}
          </div>
        ))}
      </div>

      {many ? (
        <>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur">
            {index + 1}/{images.length}
          </span>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
            aria-hidden="true"
          >
            {images.map((im, i) => (
              <span
                key={im.imageUrl + i}
                className={`h-1.5 rounded-full bg-white shadow transition-all ${i === index ? 'w-4' : 'w-1.5 opacity-60'}`}
              />
            ))}
          </div>
          {index > 0 ? (
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:flex"
            >
              <ChevronIcon className="h-5 w-5 rotate-180" />
            </button>
          ) : null}
          {index < images.length - 1 ? (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:flex"
            >
              <ChevronIcon className="h-5 w-5" />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
