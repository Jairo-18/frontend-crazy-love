import { formatCop, hoursLabel, perHour } from '@/lib/format';
import type { AccommodationRate } from '@/lib/types';
import { ClockIcon, SparkIcon } from './icons';

/**
 * Tarifas del detalle de una habitación: cada tiempo con su precio y lo que
 * sale la hora, para que se vea qué conviene. "Mejor valor" va en la de menor
 * precio por hora (solo si hay más de una y no empatan todas).
 */
export function RateList({ rates }: { rates: AccommodationRate[] }) {
  const hourly = rates.map((r) => perHour(r.price, r.hours));
  const best = Math.min(...hourly);
  const showBest = rates.length > 1 && hourly.some((h) => h !== best);

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        <ClockIcon className="h-3.5 w-3.5" /> Tarifas
      </p>
      <ul className="overflow-hidden rounded-2xl ring-1 ring-[var(--title)]/10">
        {rates.map((r, i) => {
          const isBest = showBest && hourly[i] === best;
          return (
            <li
              key={r.hours}
              className={`flex items-center gap-3 px-4 py-3 ${i % 2 ? 'bg-[var(--surface)]' : 'bg-[var(--surface-2)]'}`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--title)]">{hoursLabel(r.hours)}</p>
                <p className="text-xs text-[var(--muted)]">≈ {formatCop(hourly[i])} la hora</p>
              </div>
              {isBest ? (
                <span className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[0.7rem] font-bold text-black">
                  <SparkIcon className="h-3 w-3" /> Mejor valor
                </span>
              ) : null}
              <p className="text-lg font-semibold tabular-nums text-[var(--title)]">{formatCop(r.price)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
