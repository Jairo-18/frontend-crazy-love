import Link from 'next/link';
import { formatCop } from '@/lib/format';

export interface ItemCardProps {
  href: string;
  title: string;
  image?: string | null;
  category?: string;
  price: number;
  /** Antes del precio, p. ej. "Desde" cuando hay varias tarifas. */
  pricePrefix?: string;
  /** Texto bajo el precio, p. ej. "por noche" o "hasta 4 personas". */
  detail?: string;
}

export function ItemCard({ href, title, image, category, price, pricePrefix, detail }: ItemCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes del backend
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-[var(--muted)]">✦</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {category ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
            {category}
          </span>
        ) : null}
        <h3 className="font-semibold leading-snug text-[var(--title)]">{title}</h3>
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-[var(--title)]">
            {pricePrefix ? (
              <span className="mr-1 text-sm font-normal text-[var(--muted)]">{pricePrefix}</span>
            ) : null}
            {formatCop(price)}
          </p>
          {detail ? <p className="text-xs text-[var(--muted)]">{detail}</p> : null}
        </div>
      </div>
    </Link>
  );
}

export function ItemGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-[var(--surface-2)] px-4 py-10 text-center text-[var(--muted)]">
      {children}
    </p>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ItemGrid>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
      ))}
    </ItemGrid>
  );
}
