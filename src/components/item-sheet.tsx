'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { formatCop, t, titleCase } from '@/lib/format';
import type { CatalogItem } from '@/lib/types';
import { useOverlay } from './use-overlay';
import { OrderHint } from './detail';
import { ChevronIcon, CloseIcon } from './icons';
import { ContainedImage } from './contained-image';

/**
 * El "ver por id" de la carta: tocar un producto o un servicio abre una hoja
 * desde abajo (en escritorio, una ventana al centro) con foto, precio,
 * descripción y lo demás de su categoría, sin salir de la página del QR.
 *
 * La dirección pasa a `#ver-producto-12`: se puede compartir y, al entrar con
 * ella, la hoja se abre sola. El "atrás" del celular la cierra.
 */

type Kind = 'producto' | 'servicio';
type Entry = { item: CatalogItem; kind: Kind; group: string; siblings: CatalogItem[] };

const keyOf = (kind: Kind, id: number) => `ver-${kind}-${id}`;

const OpenContext = createContext<(kind: Kind, id: number) => void>(() => {});

export function ItemSheetProvider({
  products,
  services,
  children,
}: {
  products: { name: string; items: CatalogItem[] }[];
  services: CatalogItem[];
  children: React.ReactNode;
}) {
  const entries = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const g of products) {
      for (const item of g.items) {
        map.set(keyOf('producto', item.id), { item, kind: 'producto', group: titleCase(g.name), siblings: g.items });
      }
    }
    for (const item of services) {
      map.set(keyOf('servicio', item.id), { item, kind: 'servicio', group: 'Servicios', siblings: services });
    }
    return map;
  }, [products, services]);

  const [current, setCurrent] = useState<Entry | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const sheet = useOverlay(() => setCurrent(null));
  const { open: openOverlay, adopt } = sheet;

  const open = useCallback(
    (kind: Kind, id: number) => {
      const entry = entries.get(keyOf(kind, id));
      if (!entry) return;
      setCurrent(entry);
      openOverlay(`#${keyOf(kind, id)}`);
      body.current?.scrollTo({ top: 0 });
    },
    [entries, openOverlay],
  );

  // Enlace compartido: `/#ver-producto-12` abre la hoja al cargar.
  useEffect(() => {
    const entry = entries.get(window.location.hash.slice(1));
    if (!entry) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee la URL solo al montar
    setCurrent(entry);
    adopt();
  }, [entries, adopt]);

  return (
    <OpenContext.Provider value={open}>
      {children}
      <dialog
        {...sheet.dialogProps}
        aria-label={current ? t(current.item.name) : 'Detalle'}
        className="sheet mx-0 mb-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-[var(--surface)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:rounded-3xl"
      >
        {current ? (
          <div ref={body} className="max-h-[88dvh] overflow-y-auto overscroll-contain">
            <SheetContent entry={current} onPick={(id) => open(current.kind, id)} onLeave={sheet.release} />
          </div>
        ) : null}
        <button
          type="button"
          onClick={sheet.close}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </dialog>
    </OpenContext.Provider>
  );
}

function SheetContent({
  entry,
  onPick,
  onLeave,
}: {
  entry: Entry;
  onPick: (id: number) => void;
  onLeave: () => void;
}) {
  const { item, kind, group, siblings } = entry;
  const image = item.images[0]?.imageUrl;
  const description = t(item.description);
  const others = siblings.filter((s) => s.id !== item.id).slice(0, 8);

  return (
    <>
      {image ? (
        <ContainedImage src={image} alt={t(item.name)} loading="eager" pad="p-5" className="aspect-[16/10] w-full" />
      ) : (
        // Sin foto (hoy ninguno tiene): una franja con la marca, no un hueco gris.
        <div
          className="relative flex h-28 items-end px-5 pb-3"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 60%, var(--accent) 130%)' }}
        >
          <span className="font-display text-5xl font-semibold text-white/25" aria-hidden="true">
            {t(item.name).slice(0, 1)}
          </span>
        </div>
      )}
      {/* Asa de la hoja (solo en celular). */}
      <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" aria-hidden="true" />

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{group}</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-[var(--title)]">{t(item.name)}</h2>
          <p className="text-2xl font-semibold tabular-nums text-[var(--price)]">{formatCop(item.priceSale)}</p>
        </div>
        {description ? <p className="whitespace-pre-line leading-relaxed">{description}</p> : null}
        <OrderHint />

        {others.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Más de {group.toLowerCase()}</p>
            <ul className="divide-y divide-[var(--title)]/10 rounded-2xl bg-[var(--surface-2)] px-3">
              {others.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => onPick(o.id)}
                    className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--title)]">{t(o.name)}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--price)]">
                      {formatCop(o.priceSale)}
                    </span>
                    <ChevronIcon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href={`/${kind === 'producto' ? 'productos' : 'servicios'}/${item.id}`}
          onClick={onLeave}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          Abrir como página <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </>
  );
}

/**
 * Fila de la carta: nombre · · · · · precio, y debajo la descripción. Toda la
 * fila es un botón que abre la hoja del producto.
 */
export function MenuRow({ item, kind = 'producto' }: { item: CatalogItem; kind?: Kind }) {
  const open = useContext(OpenContext);
  const image = item.images[0]?.imageUrl;
  const description = t(item.description);
  return (
    <li>
      <button
        type="button"
        onClick={() => open(kind, item.id)}
        className="-mx-3 flex w-[calc(100%+1.5rem)] gap-3 rounded-2xl px-3 py-3.5 text-left transition hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)]"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-end">
            <span className="font-display text-[1.05rem] font-semibold leading-snug text-[var(--title)]">{t(item.name)}</span>
            <span className="menu-leader" aria-hidden="true" />
            <span className="shrink-0 font-semibold tabular-nums text-[var(--price)]">{formatCop(item.priceSale)}</span>
          </span>
          {description ? (
            <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-[var(--muted)]">{description}</span>
          ) : null}
        </span>
        {image ? (
          <ContainedImage src={image} alt="" pad="p-1" className="h-16 w-16 shrink-0 rounded-2xl" />
        ) : null}
      </button>
    </li>
  );
}
