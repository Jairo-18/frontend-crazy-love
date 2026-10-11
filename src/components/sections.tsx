import Link from 'next/link';
import { getAccommodations, getProducts, getServices } from '@/lib/api';
import { t } from '@/lib/format';
import { EmptyState, ItemCard, ItemGrid } from './item-card';

/**
 * Bloques de la portada: los primeros ítems de cada catálogo. Si el backend no
 * responde, el bloque dice que no hay nada en vez de tumbar la página.
 */
function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold text-[var(--title)]">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-[var(--brand)] hover:underline">
        Ver todo →
      </Link>
    </div>
  );
}

export async function FeaturedAccommodations() {
  const res = await getAccommodations({ perPage: 4 }).catch(() => null);
  const items = res?.data ?? [];
  return (
    <section>
      <SectionTitle title="Hospedajes" href="/hospedajes" />
      {items.length ? (
        <ItemGrid>
          {items.map((a) => (
            <ItemCard
              key={a.accommodationId}
              href={`/hospedajes/${a.accommodationId}`}
              title={t(a.name)}
              image={a.images[0]?.imageUrl}
              category={t(a.categoryType?.name)}
              price={a.priceSale}
              detail={a.amountBathroom ? `Hasta ${a.amountBathroom} personas` : undefined}
            />
          ))}
        </ItemGrid>
      ) : (
        <EmptyState>Pronto publicaremos nuestros hospedajes.</EmptyState>
      )}
    </section>
  );
}

export async function FeaturedServices() {
  const res = await getServices({ perPage: 4 }).catch(() => null);
  const items = res?.data ?? [];
  return (
    <section>
      <SectionTitle title="Servicios" href="/servicios" />
      {items.length ? (
        <ItemGrid>
          {items.map((s) => (
            <ItemCard
              key={s.id}
              href={`/servicios/${s.id}`}
              title={t(s.name)}
              image={s.images[0]?.imageUrl}
              category={t(s.categoryType?.name)}
              price={s.priceSale}
            />
          ))}
        </ItemGrid>
      ) : (
        <EmptyState>Pronto publicaremos nuestros servicios.</EmptyState>
      )}
    </section>
  );
}

export async function FeaturedProducts() {
  const res = await getProducts({ perPage: 4 }).catch(() => null);
  const items = res?.data ?? [];
  return (
    <section>
      <SectionTitle title="Productos" href="/productos" />
      {items.length ? (
        <ItemGrid>
          {items.map((p) => (
            <ItemCard
              key={p.id}
              href={`/productos/${p.id}`}
              title={t(p.name)}
              image={p.images[0]?.imageUrl}
              category={t(p.categoryType?.name)}
              price={p.priceSale}
            />
          ))}
        </ItemGrid>
      ) : (
        <EmptyState>Pronto publicaremos nuestros productos.</EmptyState>
      )}
    </section>
  );
}
