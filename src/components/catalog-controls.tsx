import Link from 'next/link';
import type { Pagination } from '@/lib/types';

/** Búsqueda sin JavaScript: un formulario GET que deja `?search=` en la URL. */
export function SearchForm({ action, defaultValue }: { action: string; defaultValue?: string }) {
  return (
    <form action={action} method="get" className="flex gap-2" role="search">
      <input
        type="search"
        name="search"
        defaultValue={defaultValue}
        placeholder="Buscar por nombre…"
        className="w-full rounded-full border border-black/10 bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      <button
        type="submit"
        className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}

export function PaginationNav({
  pagination,
  basePath,
  search,
}: {
  pagination: Pagination;
  basePath: string;
  search?: string;
}) {
  const page = Number(pagination.page) || 1;
  const pageCount =
    Number(pagination.pageCount) ||
    Math.max(1, Math.ceil(Number(pagination.total) / (Number(pagination.perPage) || 1)));
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const link =
    'rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-[var(--brand)] hover:text-white';

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación">
      {page > 1 ? (
        <Link className={link} href={href(page - 1)}>
          ← Anterior
        </Link>
      ) : null}
      <span className="text-sm text-[var(--muted)]">
        Página {page} de {pageCount}
      </span>
      {page < pageCount ? (
        <Link className={link} href={href(page + 1)}>
          Siguiente →
        </Link>
      ) : null}
    </nav>
  );
}

/** `?page=` de la URL, saneado. */
export function pageFrom(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function textFrom(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 80) ?? '';
}
