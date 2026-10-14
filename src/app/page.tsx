import { Suspense } from 'react';
import { getBranding } from '@/lib/api';
import { mediaUrl, t } from '@/lib/format';
import { FullCatalogSections, FullCatalogSkeleton } from '@/components/one-page';
import { PhoneIcon } from '@/components/icons';

/**
 * La página del QR: todo en un solo scroll. El huésped mira precios y pide
 * llamando desde el teléfono de su habitación; no hay carrito ni reservas.
 */
export default async function Home() {
  const branding = await getBranding();
  // Fondo de la portada: el de inicio si el hotel lo carga; si no, la imagen
  // de experiencias (la que Crazy Love subió para esto).
  const hero =
    mediaUrl(branding, 'HOME_BG') ??
    mediaUrl(branding, 'EXPERIENCE_IMAGE') ??
    mediaUrl(branding, 'ACCOMMODATIONS_IMAGE');
  const logo = mediaUrl(branding, 'LOGO');
  const name = branding?.name ?? 'Bienvenido';
  const title = t(branding?.homeTitle, name);
  const description = t(branding?.homeDescription, t(branding?.description));

  return (
    <div>
      {/* Portada a todo el ancho (sale del contenedor del layout). Baja a
          propósito: quien escanea el QR viene a ver precios, y con la portada
          de 70svh + la tarjeta "¿Cómo pedir?" el primer producto quedaba a dos
          pantallas. La barra de secciones va pegada debajo. */}
      <section
        className="relative left-1/2 -mt-8 flex min-h-[min(44svh,400px)] w-screen -translate-x-1/2 items-end overflow-hidden bg-[var(--brand)] sm:min-h-[min(56svh,520px)]"
        style={
          hero
            ? undefined
            : {
                backgroundImage:
                  'radial-gradient(120% 80% at 50% 0%, var(--brand-2) 0%, var(--brand) 45%, #0d0a0c 100%)',
              }
        }
      >
        {/* La foto va en su propia capa, desenfocada: con la foto nítida el
            título se perdía. `scale-110` esconde el borde claro que deja el
            `blur` en las orillas. */}
        {hero ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 bg-cover bg-center blur-[6px]"
            style={{ backgroundImage: `url("${hero}")` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-16 text-white sm:pb-12">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
            <img src={logo} alt="" className="mb-4 h-14 w-14 rounded-full object-cover ring-2 ring-white/30" />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Bienvenido</p>
          <h1 className="font-display mt-2 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
          {description ? (
            <p className="mt-3 line-clamp-2 max-w-xl text-base text-white/80 sm:line-clamp-none sm:text-lg">
              {description}
            </p>
          ) : null}
          {/* Cómo pedir: se llama desde el teléfono de la habitación, no desde el celular. */}
          <p className="mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 py-2 pl-2 pr-4 text-sm ring-1 ring-white/20 backdrop-blur">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]">
              <PhoneIcon className="h-4 w-4" />
            </span>
            <span>
              Pide llamando desde el <strong className="font-semibold">teléfono de tu habitación</strong>
            </span>
          </p>
        </div>
      </section>

      <Suspense fallback={<FullCatalogSkeleton />}>
        <FullCatalogSections />
      </Suspense>
    </div>
  );
}
