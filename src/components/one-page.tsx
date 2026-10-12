import Link from 'next/link';
import { connection } from 'next/server';
import { getCatalog } from '@/lib/api';
import { formatCop, hoursLabel, t } from '@/lib/format';
import type { Accommodation, CatalogItem } from '@/lib/types';

/**
 * La página de UNA sola pantalla (la que abre el QR en la habitación): todo lo
 * que ofrece el hotel, para ver precios y pedir llamando desde el teléfono de
 * la habitación. Solo informativa: sin carrito ni reservas.
 *
 * Llama a `connection()`: se arma al atender la visita (con la caché de
 * `api.ts`), no en el build, que así no necesita el backend.
 */

/** Ancla de una categoría de la carta: `#carta-bar`, `#carta-mec`… */
export const categoryAnchor = (code: string) => `carta-${code.toLowerCase()}`;

/** Productos agrupados por categoría, en orden alfabético de la categoría. */
export function groupByCategory(items: CatalogItem[]) {
  const groups = new Map<string, { code: string; name: string; items: CatalogItem[] }>();
  for (const item of items) {
    const code = item.categoryType?.code ?? 'OTROS';
    const name = t(item.categoryType?.name, 'Otros');
    const group = groups.get(code) ?? { code, name, items: [] };
    group.items.push(item);
    groups.set(code, group);
  }
  return [...groups.values()]
    .map((g) => ({ ...g, items: g.items.sort((a, b) => t(a.name).localeCompare(t(b.name), 'es')) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/** Los nombres de categoría llegan en mayúsculas ("MECATO"): se muestran como título. */
const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

// ── Íconos (trazo, heredan el color del texto) ────────────────────────────────
type IconProps = { className?: string };
const Svg = ({ className, children }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className ?? 'h-4 w-4'}
  >
    {children}
  </svg>
);
export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Svg>
);
const PeopleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6" />
  </Svg>
);
const BathIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0M6 19l-1 2M18 19l1 2" />
  </Svg>
);
const CarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 16V11l2-5h10l2 5v5M4 16h16v2H4zM7 11h10" />
    <circle cx="8" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
  </Svg>
);
const MotoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.5" cy="17" r="3" />
    <circle cx="18.5" cy="17" r="3" />
    <path d="M5.5 17 10 10h5l3.5 7M13 6h3l1 4" />
  </Svg>
);
const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

function SectionHeading({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-32 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="font-display text-3xl font-semibold text-[var(--title)] sm:text-4xl">{children}</h2>
    </div>
  );
}

function RoomCard({ a }: { a: Accommodation }) {
  const rates = a.rates ?? [];
  const image = a.images[0]?.imageUrl;
  const cheapest = rates.length ? Math.min(...rates.map((r) => Number(r.price))) : null;
  const facts = [
    a.amountBathroom ? { icon: PeopleIcon, label: `Hasta ${a.amountBathroom} personas` } : null,
    a.jacuzzi ? { icon: BathIcon, label: 'Jacuzzi' } : null,
    a.hasCarParking ? { icon: CarIcon, label: 'Parqueadero carro' } : null,
    a.hasMotorcycleParking ? { icon: MotoIcon, label: 'Parqueadero moto' } : null,
  ].filter(Boolean) as { icon: (p: IconProps) => React.ReactNode; label: string }[];

  return (
    <article className="group overflow-hidden rounded-3xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--title)]/10">
      {/* Con foto, la foto; sin foto, una franja baja con el degradado de la
          marca (un bloque gris grande parecía una imagen rota). El tipo
          ("Hospedaje") no se muestra: es el mismo en todas. */}
      <div
        className={`relative overflow-hidden ${image ? 'aspect-[4/3] bg-[var(--surface-2)]' : 'h-28'}`}
        style={
          image
            ? undefined
            : { backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 120%)' }
        }
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
          <img
            src={image}
            alt={t(a.name)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 ${
            image ? 'bg-gradient-to-t from-black/75 via-black/30 to-transparent pt-12' : 'bg-gradient-to-t from-black/35 to-transparent'
          }`}
        >
          <h3 className="font-display text-2xl font-semibold text-white">{t(a.name)}</h3>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {facts.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--muted)]">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-[var(--brand)]" />
                {label}
              </li>
            ))}
          </ul>
        ) : null}

        {rates.length ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <ClockIcon className="h-3.5 w-3.5" /> Tarifas
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {rates.map((r) => {
                const best = Number(r.price) === cheapest && rates.length > 1;
                return (
                  <li
                    key={r.hours}
                    className={`rounded-2xl px-3 py-2 text-center ring-1 ${
                      best
                        ? 'bg-[var(--brand)] text-white ring-[var(--brand)]'
                        : 'bg-[var(--surface-2)] ring-[var(--title)]/5'
                    }`}
                  >
                    <p className={`text-xs ${best ? 'text-white/80' : 'text-[var(--muted)]'}`}>{hoursLabel(r.hours)}</p>
                    <p className={`font-bold ${best ? 'text-white' : 'text-[var(--title)]'}`}>{formatCop(r.price)}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-xl font-bold text-[var(--title)]">{formatCop(a.priceSale)}</p>
        )}

        {a.images.length > 1 ? (
          <Link
            href={`/hospedajes/${a.accommodationId}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            Ver fotos <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

/** Habitaciones de la más económica a la más cara (por su tarifa más baja). */
function sortByCheapest(rooms: Accommodation[]): Accommodation[] {
  const from = (a: Accommodation) =>
    a.rates?.length ? Math.min(...a.rates.map((r) => Number(r.price))) : Number(a.priceSale);
  return [...rooms].sort((x, y) => from(x) - from(y));
}

/** Fila de la carta: nombre · · · · · precio, y debajo la descripción. */
function MenuRow({ item }: { item: CatalogItem }) {
  const image = item.images[0]?.imageUrl;
  const description = t(item.description);
  return (
    <li className="flex gap-3 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-end">
          <p className="font-display text-[1.05rem] font-semibold leading-snug text-[var(--title)]">{t(item.name)}</p>
          <span className="menu-leader" aria-hidden="true" />
          <p className="shrink-0 font-semibold tabular-nums text-[var(--price)]">{formatCop(item.priceSale)}</p>
        </div>
        {description ? <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">{description}</p> : null}
      </div>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
        <img src={image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
      ) : null}
    </li>
  );
}

/** Habitaciones, servicios y carta, en ese orden. Lo vacío no se pinta. */
export async function FullCatalogSections() {
  await connection();
  const catalog = await getCatalog().catch(() => null);
  if (!catalog) {
    return (
      <p className="rounded-3xl bg-[var(--surface-2)] px-4 py-10 text-center text-[var(--muted)]">
        No pudimos cargar la carta. Intenta de nuevo en un momento.
      </p>
    );
  }
  const groups = groupByCategory(catalog.products);
  const empty = !catalog.accommodations.length && !catalog.services.length && !groups.length;

  return (
    <div className="space-y-16">
      {/* Accesos fijos mientras se baja: lo primero que se busca es una categoría. */}
      {catalog.accommodations.length || groups.length ? (
        <nav
          aria-label="Secciones"
          className="sticky top-[60px] z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-[var(--title)]/10 bg-[var(--page)]/90 px-4 py-2.5 backdrop-blur [scrollbar-width:none]"
        >
          {catalog.accommodations.length ? (
            <a href="#habitaciones" className="nav-chip">
              Habitaciones
            </a>
          ) : null}
          {catalog.services.length ? (
            <a href="#servicios" className="nav-chip">
              Servicios
            </a>
          ) : null}
          {groups.map((g) => (
            <a key={g.code} href={`#${categoryAnchor(g.code)}`} className="nav-chip">
              {titleCase(g.name)}
            </a>
          ))}
        </nav>
      ) : null}

      {catalog.accommodations.length ? (
        <section className="space-y-6">
          <SectionHeading id="habitaciones" eyebrow="Para tu estadía">
            Habitaciones
          </SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortByCheapest(catalog.accommodations).map((a) => (
              <RoomCard key={a.accommodationId} a={a} />
            ))}
          </div>
        </section>
      ) : null}

      {catalog.services.length ? (
        <section className="space-y-6">
          <SectionHeading id="servicios" eyebrow="Algo más">
            Servicios
          </SectionHeading>
          <ul className="divide-y divide-[var(--title)]/10">
            {catalog.services.map((s) => (
              <MenuRow key={s.id} item={s} />
            ))}
          </ul>
        </section>
      ) : null}

      {groups.length ? (
        <section className="space-y-10">
          <SectionHeading id="carta" eyebrow="Te lo llevamos a la habitación">
            La carta
          </SectionHeading>
          {groups.map((g) => (
            <div key={g.code} className="space-y-1">
              <div id={categoryAnchor(g.code)} className="flex scroll-mt-32 items-baseline gap-3">
                <h3 className="font-display text-2xl font-semibold text-[var(--brand)]">{titleCase(g.name)}</h3>
                <span className="text-xs text-[var(--muted)]">{g.items.length}</span>
              </div>
              <div className="gold-rule" />
              <ul className="divide-y divide-[var(--title)]/10">
                {g.items.map((item) => (
                  <MenuRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {empty ? (
        <p className="rounded-3xl bg-[var(--surface-2)] px-4 py-10 text-center text-[var(--muted)]">
          Pronto publicaremos todo lo que tenemos para ti.
        </p>
      ) : null}
    </div>
  );
}

/** Esqueleto mientras carga la carta. */
export function FullCatalogSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-3xl bg-[var(--surface-2)]" />
      ))}
    </div>
  );
}
