import { connection } from 'next/server';
import { getCatalog } from '@/lib/api';
import { categoryAnchor, t, titleCase } from '@/lib/format';
import type { CatalogItem } from '@/lib/types';
import { ItemSheetProvider, MenuRow } from './item-sheet';
import { RoomsExplorer } from './rooms';
import { SectionNav } from './section-nav';
import { Carta, type MenuGroup } from './carta';
import { BackToTop } from './back-to-top';
import { ScrollToHash } from './scroll-to-hash';

/**
 * La página de UNA sola pantalla (la que abre el QR en la habitación): todo lo
 * que ofrece el hotel, para ver precios y pedir llamando desde el teléfono de
 * la habitación. Solo informativa: sin carrito ni reservas.
 *
 * Llama a `connection()`: se arma al atender la visita (con la caché de
 * `api.ts`), no en el build, que así no necesita el backend.
 */

/** Productos agrupados por categoría, en orden alfabético de la categoría. */
export function groupByCategory(items: CatalogItem[]): MenuGroup[] {
  const groups = new Map<string, MenuGroup>();
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

function SectionHeading({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="font-display text-3xl font-semibold text-[var(--title)] sm:text-4xl">{children}</h2>
    </div>
  );
}

/** Habitaciones, servicios y carta, en ese orden. Lo vacío no se pinta. */
export async function FullCatalogSections() {
  await connection();
  const catalog = await getCatalog().catch(() => null);
  if (!catalog) {
    return (
      <p className="mt-10 rounded-3xl bg-[var(--surface-2)] px-4 py-10 text-center text-[var(--muted)]">
        No pudimos cargar la carta. Intenta de nuevo en un momento.
      </p>
    );
  }
  const groups = groupByCategory(catalog.products);
  const empty = !catalog.accommodations.length && !catalog.services.length && !groups.length;

  // Lo primero que se busca es una categoría de la carta: van todas en la barra.
  const sections = [
    ...(catalog.accommodations.length ? [{ id: 'habitaciones', label: 'Habitaciones' }] : []),
    ...(catalog.services.length ? [{ id: 'servicios', label: 'Servicios' }] : []),
    ...groups.map((g) => ({ id: categoryAnchor(g.code), label: titleCase(g.name) })),
  ];

  return (
    <ItemSheetProvider products={groups} services={catalog.services}>
      {sections.length > 1 ? <SectionNav items={sections} /> : null}
      <div className="space-y-16 pt-10">
        {catalog.accommodations.length ? (
          <section className="space-y-6">
            <SectionHeading id="habitaciones" eyebrow="Para tu estadía">
              Habitaciones
            </SectionHeading>
            <RoomsExplorer rooms={catalog.accommodations} />
          </section>
        ) : null}

        {catalog.services.length ? (
          <section className="space-y-6">
            <SectionHeading id="servicios" eyebrow="Algo más">
              Servicios
            </SectionHeading>
            <ul className="divide-y divide-[var(--title)]/10">
              {catalog.services.map((s) => (
                <MenuRow key={s.id} item={s} kind="servicio" />
              ))}
            </ul>
          </section>
        ) : null}

        {groups.length ? (
          <section className="space-y-6">
            <SectionHeading id="carta" eyebrow="Te lo llevamos a la habitación">
              La carta
            </SectionHeading>
            <Carta groups={groups} />
          </section>
        ) : null}

        {empty ? (
          <p className="rounded-3xl bg-[var(--surface-2)] px-4 py-10 text-center text-[var(--muted)]">
            Pronto publicaremos todo lo que tenemos para ti.
          </p>
        ) : null}
      </div>
      <BackToTop />
      <ScrollToHash />
    </ItemSheetProvider>
  );
}

/** Esqueleto mientras carga la carta. */
export function FullCatalogSkeleton() {
  return (
    <div className="space-y-4 pt-6">
      <div className="h-11 animate-pulse rounded-full bg-[var(--surface-2)]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-3xl bg-[var(--surface-2)]" />
      ))}
    </div>
  );
}
