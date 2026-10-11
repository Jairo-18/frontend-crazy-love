'use client';

/** Si el backend falla en un listado o ficha: aviso y reintento, sin tumbar el sitio. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="py-20 text-center">
      <h1 className="text-2xl font-bold text-[var(--title)]">No pudimos cargar el catálogo</h1>
      <p className="mt-2 text-[var(--muted)]">Inténtalo de nuevo en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-[var(--brand)] px-5 py-2 font-semibold text-white"
      >
        Reintentar
      </button>
    </section>
  );
}
