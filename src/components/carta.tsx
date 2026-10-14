'use client';

import { useMemo, useState } from 'react';
import { categoryAnchor, foldText, t, titleCase } from '@/lib/format';
import type { CatalogItem } from '@/lib/types';
import { MenuRow } from './item-sheet';
import { CloseIcon, SearchIcon } from './icons';

export type MenuGroup = { code: string; name: string; items: CatalogItem[] };

/**
 * La carta por categorías, con un buscador que filtra mientras se escribe
 * ("¿tienen Águila?" sin recorrer todo). Ignora tildes y mayúsculas y busca
 * también en la descripción. Sin texto, la carta completa.
 */
export function Carta({ groups }: { groups: MenuGroup[] }) {
  const [query, setQuery] = useState('');
  const q = foldText(query.trim());

  const visible = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => foldText(`${t(item.name)} ${t(item.description)}`).includes(q)),
      }))
      .filter((g) => g.items.length);
  }, [groups, q]);
  const count = visible.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <label className="relative block">
          <span className="sr-only">Buscar en la carta</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          {/* 16px de letra: con menos, iPhone hace zoom al enfocar el campo. */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Buscar en la carta…"
            enterKeyHint="search"
            autoComplete="off"
            className="h-12 w-full rounded-full bg-[var(--surface)] pl-12 pr-12 text-base text-[var(--title)] shadow-sm outline-none ring-1 ring-[var(--title)]/10 placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--brand)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Borrar búsqueda"
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          ) : null}
        </label>
        <p className="px-4 text-sm text-[var(--muted)]" aria-live="polite">
          {q
            ? count
              ? `${count} resultado${count === 1 ? '' : 's'}`
              : `Nada coincide con “${query.trim()}”.`
            : 'Toca un producto para ver el detalle.'}
        </p>
      </div>

      {visible.map((g) => (
        <div key={g.code} className="space-y-1">
          <div id={categoryAnchor(g.code)} className="flex scroll-mt-20 items-baseline gap-3">
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
    </div>
  );
}
