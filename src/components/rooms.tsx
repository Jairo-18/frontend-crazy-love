'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatCop, hoursLabel, perHour, rateFor, startingRate, t } from '@/lib/format';
import type { Accommodation } from '@/lib/types';
import { roomFacts } from './room-facts';
import { PhotoCarousel } from './photo-carousel';
import { BathIcon, ClockIcon, SparkIcon } from './icons';

/**
 * Las habitaciones de la portada. Arriba, "¿Cuánto tiempo te quedas?": al
 * elegir 4 h, 8 h… cada tarjeta muestra el precio de ESE tiempo, se ordenan
 * de la más barata a la más cara y se marca la más económica. Es la pregunta
 * con la que se compara en un motel; sin elegir, cada una dice "desde".
 */
export function RoomsExplorer({ rooms }: { rooms: Accommodation[] }) {
  const durations = useMemo(
    () => [...new Set(rooms.flatMap((r) => (r.rates ?? []).map((x) => x.hours)))].sort((a, b) => a - b),
    [rooms],
  );
  const [hours, setHours] = useState<number | null>(null);

  const sorted = useMemo(() => {
    const price = (r: Accommodation) => (hours ? rateFor(r, hours) : startingRate(r).price);
    return [...rooms].sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
  }, [rooms, hours]);
  const cheapestId = hours && sorted.length > 1 && rateFor(sorted[0], hours) !== null ? sorted[0].accommodationId : null;

  return (
    <div className="space-y-6">
      {durations.length > 1 ? (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--title)]">
            <ClockIcon className="h-4 w-4 text-[var(--brand)]" /> ¿Cuánto tiempo te quedas?
          </p>
          <div role="radiogroup" aria-label="Tiempo de estadía" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none]">
            {[null, ...durations].map((h) => {
              const on = h === hours;
              return (
                <button
                  key={h ?? 'all'}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setHours(h)}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ring-1 transition ${
                    on
                      ? 'bg-[var(--brand)] text-white ring-[var(--brand)]'
                      : 'bg-[var(--surface)] text-[var(--title)] ring-[var(--title)]/15 hover:ring-[var(--brand)]'
                  }`}
                >
                  {h === null ? 'Ver todas' : hoursLabel(h)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => (
          <RoomCard
            key={a.accommodationId}
            a={a}
            hours={hours}
            cheapest={a.accommodationId === cheapestId}
            onPickHours={setHours}
          />
        ))}
      </div>
    </div>
  );
}

function RoomCard({
  a,
  hours,
  cheapest,
  onPickHours,
}: {
  a: Accommodation;
  hours: number | null;
  cheapest: boolean;
  onPickHours: (h: number) => void;
}) {
  const href = `/hospedajes/${a.accommodationId}`;
  const name = t(a.name);
  const description = t(a.description);
  const rates = a.rates ?? [];
  const facts = roomFacts(a).filter((f) => f.label !== 'Jacuzzi'); // el jacuzzi va como insignia
  const from = startingRate(a);
  const selected = hours ? rateFor(a, hours) : null;
  const unavailable = hours !== null && selected === null;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl bg-[var(--surface)] shadow-sm ring-1 transition ${
        cheapest ? 'ring-2 ring-[var(--accent)]' : 'ring-[var(--title)]/10'
      } ${unavailable ? 'opacity-60' : ''}`}
    >
      <div className="relative">
        {a.images.length ? (
          <PhotoCarousel images={a.images} alt={name} href={href} className="aspect-[4/3] bg-[var(--surface-2)]" />
        ) : (
          // Sin foto: franja con el degradado de la marca (un bloque gris parecía una imagen rota).
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="block h-28"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 120%)' }}
          />
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {cheapest ? (
            <span className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-black shadow">
              <SparkIcon className="h-3.5 w-3.5" /> Más económica
            </span>
          ) : null}
          {a.jacuzzi ? (
            <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              <BathIcon className="h-3.5 w-3.5" /> Jacuzzi
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3 className="font-display text-2xl font-semibold leading-tight text-[var(--title)]">
            <Link href={href} className="hover:underline">
              {name}
            </Link>
          </h3>
          {description ? <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p> : null}
        </div>

        {facts.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--text)]">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-[var(--brand)]" />
                {label}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Precio principal: el del tiempo elegido o, sin elegir, el "desde". */}
        <div className="flex items-end justify-between gap-3 border-t border-[var(--title)]/10 pt-4">
          {unavailable ? (
            <p className="text-sm text-[var(--muted)]">No tiene tarifa de {hoursLabel(hours!)}.</p>
          ) : (
            <div>
              <p className="text-xs text-[var(--muted)]">
                {hours ? `Por ${hoursLabel(hours)}` : from.several ? `Desde · ${hoursLabel(from.hours)}` : hoursLabel(from.hours)}
              </p>
              <p className="text-3xl font-semibold tabular-nums text-[var(--title)]">
                {formatCop(selected ?? from.price)}
              </p>
              <p className="text-xs text-[var(--muted)]">
                ≈ {formatCop(perHour(selected ?? from.price, hours ?? from.hours))} la hora
              </p>
            </div>
          )}
        </div>

        {/* Las demás tarifas: tocar una elige ese tiempo para todas. */}
        {rates.length > 1 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tarifas">
            {rates.map((r) => {
              const on = r.hours === hours;
              return (
                <li key={r.hours}>
                  <button
                    type="button"
                    onClick={() => onPickHours(r.hours)}
                    aria-pressed={on}
                    className={`min-h-9 rounded-full px-3 text-xs ring-1 transition ${
                      on
                        ? 'bg-[var(--brand)] text-white ring-[var(--brand)]'
                        : 'bg-[var(--surface-2)] text-[var(--text)] ring-[var(--title)]/5 hover:ring-[var(--brand)]'
                    }`}
                  >
                    {r.hours} h · <span className="font-semibold tabular-nums">{formatCop(r.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-[var(--title)]/5 text-sm font-semibold text-[var(--title)] ring-1 ring-[var(--title)]/10 transition hover:bg-[var(--brand)] hover:text-white"
        >
          Ver habitación{a.images.length > 1 ? ` · ${a.images.length} fotos` : ''} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
