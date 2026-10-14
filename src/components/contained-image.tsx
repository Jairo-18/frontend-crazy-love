/**
 * Foto de producto completa, sin recortar (`object-contain`): botellas y
 * paquetes tienen proporciones muy distintas y con `object-cover` se cortaban.
 * El espacio que sobra se rellena con la misma foto ampliada y desenfocada, en
 * vez de franjas vacías. Sin directiva: sirve en servidor y en cliente.
 */
export function ContainedImage({
  src,
  alt,
  className = '',
  pad = 'p-3',
  loading = 'lazy',
}: {
  src: string;
  alt: string;
  className?: string;
  /** Aire alrededor del producto: `p-3` en grande, `p-1` en miniatura. */
  pad?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    <span className={`relative block overflow-hidden bg-[var(--surface-2)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- imágenes del backend */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={loading}
        draggable={false}
        className="absolute inset-0 h-full w-full scale-125 select-none object-cover opacity-50 blur-2xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- imágenes del backend */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        className={`relative h-full w-full select-none object-contain drop-shadow-lg ${pad}`}
      />
    </span>
  );
}
