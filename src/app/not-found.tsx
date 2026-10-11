import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-3xl font-extrabold text-[var(--title)]">No encontramos esta página</h1>
      <p className="mt-2 text-[var(--muted)]">Puede que ya no esté disponible.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-[var(--brand)] px-5 py-2 font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
